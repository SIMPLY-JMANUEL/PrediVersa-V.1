const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {
  getAllUsers,
  getUserByEmail,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  emailExists,
  documentIdExists
} = require('../db/users');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_super_seguro_123';

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario por email en la base de datos
    const user = await getUserByEmail(email);

    // Verificar si existe el usuario y la contraseña es válida
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ 
        success: false, 
        message: 'Email o contraseña incorrectos' 
      });
    }

    // Verificar si el usuario está activo
    if (user.status !== 'Activo') {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario inactivo. Contacte al administrador.' 
      });
    }

    // Generar JWT token
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
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// POST /api/auth/register - Endpoint para crear nuevos usuarios
router.post('/register', async (req, res) => {
  try {
    const { documentId, email, password, name, role, phone, address, birthDate } = req.body;

    // Validar campos requeridos
    if (!documentId || !email || !password || !name || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Los campos requeridos son: documento, email, contraseña, nombre y rol' 
      });
    }

    // Verificar si el email ya existe
    const emailAlreadyExists = await emailExists(email);
    if (emailAlreadyExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'El email ya está registrado' 
      });
    }

    // Verificar si el documento ya existe
    const documentAlreadyExists = await documentIdExists(documentId);
    if (documentAlreadyExists) {
      return res.status(409).json({ 
        success: false, 
        message: 'El número de documento ya está registrado' 
      });
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario en la base de datos
    const newUser = await createUser({
      documentId,
      email,
      password: hashedPassword,
      name,
      role,
      phone,
      address,
      birthDate
    });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Error en registro:', error);
    
    // Manejar errores específicos de MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: 'El email o documento ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/auth/users - Obtener todos los usuarios (sin contraseñas)
router.get('/users', async (req, res) => {
  try {
    // Obtener usuarios de la base de datos
    const users = await getAllUsers();
    
    res.json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// PUT /api/auth/users/:id - Actualizar usuario
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { documentId, email, name, role, phone, address, birthDate, status, password } = req.body;
    const userId = parseInt(id);

    // Verificar si el usuario existe
    const existingUser = await getUserById(userId);
    
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar si el nuevo documento ya existe en otro usuario
    if (documentId && documentId !== existingUser.documentId) {
      const documentAlreadyExists = await documentIdExists(documentId, userId);
      if (documentAlreadyExists) {
        return res.status(409).json({ 
          success: false, 
          message: 'El número de documento ya está registrado' 
        });
      }
    }

    // Verificar si el nuevo email ya existe en otro usuario
    if (email && email !== existingUser.email) {
      const emailAlreadyExists = await emailExists(email, userId);
      if (emailAlreadyExists) {
        return res.status(409).json({ 
          success: false, 
          message: 'El email ya está registrado' 
        });
      }
    }

    // Preparar datos para actualizar
    const updateData = {};
    if (documentId !== undefined) updateData.documentId = documentId;
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (status !== undefined) updateData.status = status;
    
    // Si se proporciona nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario en la base de datos
    const updatedUser = await updateUser(userId, updateData);

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    
    // Manejar errores específicos de MySQL
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ 
        success: false, 
        message: 'El email o documento ya está registrado' 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/auth/users/:id - Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    // Eliminar usuario de la base de datos
    const deletedUser = await deleteUser(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente',
      user: deletedUser
    });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/auth/stats - Obtener estadísticas de usuarios
router.get('/stats', async (req, res) => {
  try {
    // Obtener estadísticas de la base de datos
    const stats = await getUserStats();

    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/auth/me - Obtener datos del usuario autenticado
router.get('/me', async (req, res) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token no proporcionado' 
      });
    }

    const token = authHeader.substring(7);

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido o expirado' 
      });
    }

    // Obtener datos actualizados del usuario
    const user = await getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Usuario no encontrado' 
      });
    }

    // Verificar que el usuario esté activo
    if (user.status !== 'Activo') {
      return res.status(403).json({ 
        success: false, 
        message: 'Usuario inactivo' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en /me:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
