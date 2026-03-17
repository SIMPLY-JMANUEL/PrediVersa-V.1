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

    const user = await getUserByEmail(email);

    if (!user) {
      console.warn(`⚠️ Intento de login fallido: Email no encontrado (${email})`);
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.warn(`⚠️ Intento de login fallido: Contraseña incorrecta para ${email}`);
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
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
    console.error('❌ Error en login:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
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
