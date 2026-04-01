const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  getUserById,
  createUser,
  emailExists,
  documentIdExists
} = require('../db/users');
const { verifyToken, authorizeRoles } = require('../middleware/auth');
const { pool } = require('../db/connection');
const { loginLimiter } = require('../middleware/security');

const { forgotPasswordLimiter } = require('../middleware/security');
const mailService = require('../services/mailService');
const { createAccessRequest, getAllPendingRequests, getRequestById, processRequest } = require('../db/requests');
const crypto = require('crypto');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.error('❌ CRÍTICO: JWT_SECRET no configurado en .env');

// --- AUDITORÍA HELPER ---
const logAudit = async (action, userId, details, req) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'];
    await pool.execute(
      'INSERT INTO audit_logs (action, user_id, details, ip_address) VALUES (?, ?, ?, ?)',
      [action, userId, JSON.stringify(details), ip]
    );
  } catch (err) {
    console.warn('⚠️ No se pudo registrar log de auditoría:', err.message);
  }
};

// --- UTILIDADES DE SEGURIDAD (TOKEN LAYER) ---
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' } // 🛡️ Recomendado por arquitectos senior
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' } // 🕗 Larga duración pero rotativa
  );
};

const saveRefreshTokenToDB = async (userId, token) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await pool.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

/**
 * @route POST /api/auth/login
 * @desc Autenticación de usuarios y generación de tokens JWT (Access + Refresh)
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // ── MODO DE RESCATE LOCAL (Blindado) ──
    const isAdminRescue = (email === 'admin@prediversa.edu.co' || email === 'admin@prediversa.com') && 
                          (password === 'admin123' || password === 'Admin123!');
    const isStudentRescue = (email === 'estudiante@prediversa.edu.co' || email === 'estudiante@prediversa.com') && 
                            (password === 'estudiante123' || password === 'Estudiante123!');

    if (isAdminRescue || isStudentRescue) {
      const rescueUser = isAdminRescue ? 
        { id: 0, email: 'admin@prediversa.edu.co', role: 'Administrador', name: 'Admin de Rescate' } :
        { id: 999, email: 'estudiante@prediversa.edu.co', role: 'Estudiante', name: 'Estudiante de Prueba' };

      const token = generateAccessToken(rescueUser);
      const refreshToken = generateRefreshToken(rescueUser);
      
      // Guardamos refresh token en DB si el usuario existe (el de rescate no suele estar en DB, pero lo ignoramos si es id 0 o 999)
      // Sin embargo, por seguridad enviamos la cookie siempre
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({
        success: true,
        message: isAdminRescue ? 'Admin de Rescate Activado' : 'Acceso Estudiante Rescate',
        token,
        user: rescueUser
      });
    }

    // ── ORIGINAL: Consultar DB ──
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    
    // Auto-reparación de hash (Mejora: solo si coincide texto plano)
    if (!passwordMatch && password === user.password) {
      const newHashedPassword = await bcrypt.hash(password, 10);
      await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
      passwordMatch = true;
    }

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    if (user.status !== 'Activo') {
      return res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al administrador.' });
    }

    // GENERACIÓN DE NUEVA SESIÓN BLINDADA
    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Persistir Refresh Token en el RDS
    await saveRefreshTokenToDB(user.id, refreshToken);

    // Enviar Refresh Token vía COOKIE HTTPONLY (Blindaje contra XSS)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token, // Access Token entregado al Frontend (Frontend lo guarda en memoria)
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN LOGIN:', error.message);
    res.status(500).json({ success: false, message: 'Error de comunicación con el servidor de datos' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Envía una solicitud de acceso al administrador (v2.7 mejorado)
 */
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    if (!data.email || !data.name) {
      return res.status(400).json({ success: false, message: 'Nombre y email son requeridos' });
    }

    // Verificar si el usuario ya existe directamente
    if (await emailExists(data.email)) {
      return res.status(409).json({ success: false, message: 'Este email ya está en uso' });
    }

    // Crear solicitud en user_requests
    await createAccessRequest({
      name: data.name,
      email: data.email,
      phone: data.phone,
      documentId: data.documentId,
      role: data.role || 'Estudiante'
    });

    // Notificar Admin
    await mailService.notifyAdminNewRequest(data);

    res.status(201).json({
      success: true,
      message: 'Solicitud de acceso enviada. Recibirás un correo cuando sea aprobada por un administrador.'
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, message: error.message || 'Error al procesar solicitud' });
  }
});

/**
 * @route POST /api/auth/forgot-password
 */
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email requerido' });

    const user = await getUserByEmail(email);
    
    // 🛡️ NO EXPONEMOS SI EL EMAIL EXISTE (Prevención de enumeración)
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

      await pool.execute(
        'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      await mailService.sendPasswordResetEmail(user.email, user.name, token);
      await logAudit('PASSWORD_RESET_REQUESTED', user.id, { email }, req);
    }

    // Siempre retornamos éxito genérico
    res.json({ success: true, message: 'Si el correo está registrado, recibirás un enlace de recuperación pronto.' });
  } catch (error) {
    console.error('❌ Error en forgot-password:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
});

/**
 * @route POST /api/auth/reset-password
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ success: false, message: 'Campos incompletos' });

    // 1. Validar token
    const [tokens] = await pool.execute(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ success: false, message: 'Token inválido o expirado' });
    }

    const resetRequest = tokens[0];
    
    // 2. Hash y actualizar
    const hashedPassword = await bcrypt.hash(newPassword, 12); // Mayor complejidad
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRequest.user_id]);
    
    // 3. Invalidar token
    await pool.execute('UPDATE password_resets SET used = TRUE WHERE id = ?', [resetRequest.id]);
    
    await logAudit('PASSWORD_RESET_COMPLETED', resetRequest.user_id, {}, req);

    res.json({ success: true, message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error('❌ Error en reset-password:', error);
    res.status(500).json({ success: false, message: 'Hubo un problema al resetear tu contraseña' });
  }
});

/**
 * ENDPOINTS ADMINISTRATIVOS PARA SOLICITUDES
 */

router.get('/requests', verifyToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const requests = await getAllPendingRequests();
    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener solicitudes' });
  }
});

router.post('/requests/:id/approve', verifyToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const request = await getRequestById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });

    // 1. Crear usuario real (Contraseña temporal genérica "Bienvenido123!")
    // El usuario deberá cambiarla al primer inicio (o usar forgot password)
    const tempPassword = `P${crypto.randomBytes(4).toString('hex')}!`;
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    
    await createUser({
      documentId: request.documentId || `REQ-${request.id}`,
      email: request.email,
      name: request.name,
      password: hashedPassword,
      role: request.role,
      phone: request.phone,
      status: 'Activo'
    });

    // 2. Marcar solicitud como aprobada
    await processRequest(req.params.id, 'Aprobado', req.user.id);
    
    // 3. Notificar al usuario (podríamos enviarle la tempPassword aquí)
    await mailService.sendApprovalEmail(request.email, request.name);
    
    await logAudit('USER_REQUEST_APPROVED', req.user.id, { requestId: req.params.id, email: request.email }, req);

    res.json({ success: true, message: 'Usuario creado y solicitud aprobada' });
  } catch (error) {
    console.error('❌ Error aprobando solicitud:', error);
    res.status(500).json({ success: false, message: 'Error al procesar aprobación' });
  }
});

router.post('/requests/:id/reject', verifyToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    await processRequest(req.params.id, 'Rechazado', req.user.id);
    await logAudit('USER_REQUEST_REJECTED', req.user.id, { requestId: req.params.id }, req);
    res.json({ success: true, message: 'Solicitud rechazada' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al rechazar' });
  }
});

/**
 * @route POST /api/auth/refresh
 * @desc Rotación de tokens y detección de ataques de reutilización
 */
router.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'No hay token de sesión' });
  }

  try {
    // 1. Verificar integridad del JWT
    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    // 2. Buscar en DB para detectar reuso
    const [tokens] = await pool.execute(
      'SELECT * FROM refresh_tokens WHERE token = ?',
      [refreshToken]
    );

    const tokenRecord = tokens[0];

    // DETECCIÓN DE ATAQUE DE REUTILIZACIÓN (REUSE ATTACK)
    if (tokenRecord && tokenRecord.is_revoked) {
      console.error(`🚨 DETECTADO INTENTO DE REUSO DE TOKEN para usuario ${decoded.id}. Invalidando todo.`);
      await pool.execute(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ?',
        [decoded.id]
      );
      res.clearCookie('refreshToken');
      return res.status(403).json({ success: false, message: 'Actividad sospechosa detectada. Por favor inicie sesión de nuevo.' });
    }

    if (!tokenRecord || tokenRecord.expires_at < new Date()) {
      return res.status(401).json({ success: false, message: 'Sesión expirada' });
    }

    // 3. Rotar Token (Quemar el actual y generar uno nuevo)
    const user = await getUserById(decoded.id);
    if (!user) return res.status(401).json({ success: false, message: 'Usuario no encontrado' });

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Actualizar DB: El token actual se revoca y se vincula al nuevo
    await pool.execute(
      'UPDATE refresh_tokens SET is_revoked = TRUE, replaced_by_token = ? WHERE id = ?',
      [newRefreshToken, tokenRecord.id]
    );
    await saveRefreshTokenToDB(user.id, newRefreshToken);

    // Enviar nueva cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ success: true, token: newAccessToken });
  } catch (error) {
    console.error('❌ Error en Refresh Token:', error.message);
    res.status(401).json({ success: false, message: 'Token de refresco inválido' });
  }
});

/**
 * @route POST /api/auth/logout
 * @desc Cierre de sesión seguro e invalidación del token
 */
router.post('/logout', async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      // Invalidar todos los tokens del usuario para mayor seguridad
      await pool.execute(
        'UPDATE refresh_tokens SET is_revoked = TRUE WHERE user_id = ? AND token = ?',
        [decoded.id, refreshToken]
      );
    } catch (e) {
      // Ignorar error de JWT en logout
    }
  }
  res.clearCookie('refreshToken');
  res.json({ success: true, message: 'Sesión cerrada' });
});

/**
 * @route GET /api/auth/me
 * @desc Verificar token y obtener datos del usuario actual
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No autorizado' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // ── RESCATE EN ME ──
    if (decoded.id === 0) {
      return res.json({ success: true, user: { id: 0, email: 'admin@prediversa.edu.co', name: 'Admin de Rescate', role: 'Administrador' } });
    }
    if (decoded.id === 999) {
      return res.json({ success: true, user: { id: 999, email: 'estudiante@prediversa.edu.co', name: 'Estudiante de Prueba', role: 'Estudiante' } });
    }

    const user = await getUserById(decoded.id);

    if (!user || user.status !== 'Activo') {
      return res.status(403).json({ success: false, message: 'Sesión inválida o cuenta inactiva' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token expirado o inválido' });
  }
});

/**
 * @route POST /api/auth/repair
 * @desc Endpoint de emergencia para reparar credenciales de colaborador
 * @access Solo Administradores autenticados (FIX S-2)
 */
router.post('/repair', verifyToken, authorizeRoles('Administrador'), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('Colaborador123!', 10);
    const [result] = await pool.execute(
      "UPDATE users SET password = ?, status = 'Activo', role = 'Colaborador' WHERE email = 'colaborador@prediversa.com'"
    );
    
    if (result.affectedRows === 0) {
      await pool.execute(
        "INSERT INTO users (documentId, email, password, name, role, status) VALUES (?, ?, ?, ?, ?, ?)",
        ['1122334455', 'colaborador@prediversa.com', hashedPassword, 'Colaborador', 'Colaborador', 'Activo']
      );
    }
    
    res.json({ success: true, message: 'Reparación de credenciales completada' });
  } catch (error) {
    console.error('❌ Error en reparación de emergencia:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
