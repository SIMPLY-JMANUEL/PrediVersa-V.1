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
  documentIdExists,
  // Funciones de alertas
  getAllAlerts,
  getAlertById,
  createAlert,
  updateAlert,
  deleteAlert,
  getAlertStats
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
    const { documentId, email, password, name, role, phone, address, birthDate, edad, lugarNacimiento, nombrePadre, nombreMadre, grado } = req.body;

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
      birthDate,
      edad,
      lugarNacimiento,
      nombrePadre,
      nombreMadre,
      grado
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

// POST /api/auth/users - Crear nuevo usuario (alternativo a /register)
router.post('/users', async (req, res) => {
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
      message: 'Usuario creado exitosamente',
      user: newUser
    });
  } catch (error) {
    console.error('❌ Error al crear usuario:', error);
    
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
// Soporta filtrado por documentId usando query: /api/auth/users?documentId=123456
router.get('/users', async (req, res) => {
  try {
    const { documentId } = req.query;
    // Hacer trim del documentId para evitar problemas con espacios
    const trimmedDocumentId = documentId ? documentId.trim() : undefined;
    
    let users = await getAllUsers();
    
    // Filtrar por documento si se especifica
    if (trimmedDocumentId) {
      users = users.filter(u => u.documentId && u.documentId.trim().includes(trimmedDocumentId));
    }
    
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
    const { documentId, email, name, role, phone, address, birthDate, status, password, edad, lugarNacimiento, nombrePadre, nombreMadre, grado } = req.body;
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
    if (edad !== undefined) updateData.edad = edad;
    if (lugarNacimiento !== undefined) updateData.lugarNacimiento = lugarNacimiento;
    if (nombrePadre !== undefined) updateData.nombrePadre = nombrePadre;
    if (nombreMadre !== undefined) updateData.nombreMadre = nombreMadre;
    if (grado !== undefined) updateData.grado = grado;
    
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

// ==================== RUTAS DE ALERTAS ====================

// GET /api/alerts - Obtener todas las alertas
router.get('/alerts', async (req, res) => {
  try {
    const alerts = await getAllAlerts();
    
    res.json({
      success: true,
      alerts: alerts
    });
  } catch (error) {
    console.error('❌ Error al obtener alertas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/alerts/stats - Obtener estadísticas de alertas
router.get('/alerts/stats', async (req, res) => {
  try {
    const stats = await getAlertStats();
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('❌ Error al obtener estadísticas de alertas:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// POST /api/alerts - Crear nueva alerta
router.post('/alerts', async (req, res) => {
  try {
    const { 
      userId, studentName, studentDocumentId, studentAge, studentGrade, 
      studentUsername, alertType, description, ticketNumber, alertDate, 
      alertTime, deadline, assignedTo, status 
    } = req.body;

    // Validar campos requeridos
    if (!studentName || !alertType) {
      return res.status(400).json({ 
        success: false, 
        message: 'El nombre del estudiante y el tipo de alerta son requeridos' 
      });
    }

    // Obtener token del header para saber quién crea la alerta
    const authHeader = req.headers.authorization;
    let createdBy = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        createdBy = decoded.id;
      } catch (err) {
        // Token inválido pero continuamos
      }
    }

    // Generar número de ticket automático si no se proporciona
    const finalTicketNumber = ticketNumber || `TKT-${Date.now()}`;

    const newAlert = await createAlert({
      userId,
      studentName,
      studentDocumentId,
      studentAge,
      studentGrade,
      studentUsername,
      alertType,
      description,
      ticketNumber: finalTicketNumber,
      alertDate,
      alertTime,
      deadline,
      assignedTo,
      status: status || 'Pendiente',
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'Alerta creada exitosamente',
      alert: newAlert
    });
  } catch (error) {
    console.error('❌ Error al crear alerta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// PUT /api/alerts/:id - Actualizar alerta
router.put('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    // Verificar si la alerta existe
    const existingAlert = await getAlertById(alertId);
    
    if (!existingAlert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alerta no encontrada' 
      });
    }

    const { 
      userId, studentName, studentDocumentId, studentAge, studentGrade, 
      studentUsername, alertType, description, ticketNumber, alertDate, 
      alertTime, deadline, assignedTo, status 
    } = req.body;

    const updatedAlert = await updateAlert(alertId, {
      userId,
      studentName,
      studentDocumentId,
      studentAge,
      studentGrade,
      studentUsername,
      alertType,
      description,
      ticketNumber,
      alertDate,
      alertTime,
      deadline,
      assignedTo,
      status
    });

    res.json({
      success: true,
      message: 'Alerta actualizada exitosamente',
      alert: updatedAlert
    });
  } catch (error) {
    console.error('❌ Error al actualizar alerta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/alerts/:id - Eliminar alerta
router.delete('/alerts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const alertId = parseInt(id);

    const deletedAlert = await deleteAlert(alertId);
    
    if (!deletedAlert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alerta no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Alerta eliminada exitosamente',
      alert: deletedAlert
    });
  } catch (error) {
    console.error('❌ Error al eliminar alerta:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
