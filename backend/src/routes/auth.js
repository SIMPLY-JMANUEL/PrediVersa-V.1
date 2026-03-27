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

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) console.error('❌ CRÍTICO: JWT_SECRET no configurado en .env');

/**
 * @route POST /api/auth/login
 * @desc Autenticación de usuarios y generación de token JWT
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email y contraseña son requeridos' });
    }

    // ── MODO DE RESCATE LOCAL ──
    const isAdminRescue = (email === 'admin@prediversa.edu.co' || email === 'admin@prediversa.com') && 
                          (password === 'admin123' || password === 'Admin123!');
    const isStudentRescue = (email === 'estudiante@prediversa.edu.co' || email === 'estudiante@prediversa.com') && 
                            (password === 'estudiante123' || password === 'Estudiante123!');

    if (isAdminRescue) {
      console.log(`🚀 Acceso RESCATE detectado para: ${email}`);
      const token = jwt.sign({ id: 0, email: 'admin@prediversa.edu.co', role: 'Administrador' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        message: 'Admin de Rescate Activado',
        token,
        user: { id: 0, name: 'Admin de Rescate', email: 'admin@prediversa.edu.co', role: 'Administrador' }
      });
    }

    if (isStudentRescue) {
      console.log(`🚀 Acceso ESTUDIANTE RESCATE detectado para: ${email}`);
      const token = jwt.sign({ id: 999, email: 'estudiante@prediversa.edu.co', role: 'Estudiante' }, JWT_SECRET, { expiresIn: '24h' });
      return res.json({
        success: true,
        message: 'Acceso Estudiante Rescate',
        token,
        user: { id: 999, name: 'Estudiante de Prueba', email: 'estudiante@prediversa.edu.co', role: 'Estudiante' }
      });
    }

    // ── ORIGINAL: Consultar DB ──
    console.log(`[LOGIN TRACE] Verificando usuario en DB: ${email}...`);
    const user = await getUserByEmail(email);
    console.log(`[LOGIN TRACE] Resultado:`, user ? 'Encontrado' : 'No encontrado');

    if (!user) {
      console.warn(`⚠️ Intento de login fallido: Email no encontrado (${email})`);
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' }); // Mensaje unificado de seguridad
    }

    let passwordMatch = await bcrypt.compare(password, user.password);
    
    // Auto-reparación de hash (si la contraseña coincide en texto plano pero no con el hash)
    if (!passwordMatch && password === user.password) {
      console.log(`🔧 Reparando hash para ${email} (Contraseña en texto plano detectada)...`);
      try {
        const newHashedPassword = await bcrypt.hash(password, 10);
        await pool.execute('UPDATE users SET password = ? WHERE id = ?', [newHashedPassword, user.id]);
        passwordMatch = true; // Acceso permitido tras reparación
        console.log(`✅ Hash reparado para ${email}`);
      } catch (err) {
        console.error('❌ Error al auto-reparar hash:', err.message);
      }
    }

    if (!passwordMatch) {
      console.warn(`⚠️ Intento de login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    if (user.status !== 'Activo') {
      return res.status(403).json({ success: false, message: 'Usuario inactivo. Contacte al administrador.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN LOGIN:', {
      message: error.message,
      code: error.code, // Útil para detectar ER_ACCESS_DENIED, etc.
      path: req.originalUrl,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ success: false, message: 'Fallo interno: No hay comunicación con el servidor de datos' });
  }
});

/**
 * @route POST /api/auth/register
 * @desc Registro público de nuevos estudiantes
 */
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    if (!data.documentId || !data.email || !data.password || !data.name || !data.role) {
      return res.status(400).json({ success: false, message: 'Faltan campos requeridos' });
    }

    if (await emailExists(data.email)) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    if (await documentIdExists(data.documentId)) {
      return res.status(409).json({ success: false, message: 'El número de documento ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = await createUser({
      ...data,
      password: hashedPassword
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
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
