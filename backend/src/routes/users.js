const express = require('express');
const bcrypt = require('bcryptjs');
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,
  emailExists,
  documentIdExists,
  createUser
} = require('../db/users');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Aplicar verificación de token a todas las rutas de usuarios
router.use(verifyToken);

/**
 * @route GET /api/users
 * @desc Obtener lista completa de usuarios con filtro opcional por documento
 */
router.get('/', async (req, res) => {
  try {
    const { documentId } = req.query;
    const trimmedDocumentId = documentId ? documentId.trim() : undefined;
    
    let users = await getAllUsers();
    
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

/**
 * @route GET /api/users/stats
 * @desc Estadísticas generales de la comunidad escolar
 */
router.get('/stats', async (req, res) => {
  try {
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

/**
 * @route POST /api/users/bulk
 * @desc Carga masiva de usuarios (ej. desde Excel)
 */
router.post('/bulk', async (req, res) => {
  try {
    const { users: usersToCreate } = req.body;

    if (!Array.isArray(usersToCreate) || usersToCreate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se debe enviar un array de usuarios no vacío'
      });
    }

    const results = {
      success: 0,
      errors: 0,
      details: []
    };

    for (const u of usersToCreate) {
      try {
        // Verificar duplicados antes de insertar
        const emailDuplicated = await emailExists(u.email);
        const docDuplicated = await documentIdExists(u.documentId);

        if (emailDuplicated || docDuplicated) {
          results.errors++;
          results.details.push({ email: u.email, error: 'Documento o Email ya existe' });
          continue;
        }

        const hashedPassword = await bcrypt.hash(u.password || 'Predi123!', 10);
        await createUser({ ...u, password: hashedPassword });
        results.success++;
      } catch (err) {
        results.errors++;
        results.details.push({ email: u.email, error: err.message });
      }
    }

    res.json({
      success: true,
      message: `Proceso masivo terminado: ${results.success} éxitos, ${results.errors} errores`,
      summary: results
    });
  } catch (error) {
    console.error('❌ Error en carga masiva:', error);
    res.status(500).json({ success: false, message: 'Error fatal en servidor' });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Actualizar datos de un usuario por su ID
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const body = req.body;
    const userId = parseInt(id);

    const existingUser = await getUserById(userId);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Validaciones de unicidad si cambian campos clave
    if (body.email && body.email !== existingUser.email) {
      if (await emailExists(body.email, userId)) {
        return res.status(409).json({ success: false, message: 'El email ya está en uso' });
      }
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await updateUser(userId, body);
    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      user: updatedUser
    });
  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
  }
});

/**
 * @route DELETE /api/users/:id
 * @desc Eliminar un usuario (Solo Administradores)
 */
router.delete('/:id', authorizeRoles('Administrador'), async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await deleteUser(parseInt(id));
    
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado correctamente',
      user: deletedUser
    });
  } catch (error) {
    console.error('❌ Error al eliminar usuario:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
  }
});

module.exports = router;
