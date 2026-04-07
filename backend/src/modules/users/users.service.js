const userRepository = require('./users.repository');
const bcrypt = require('bcryptjs');

/**
 * CAPA DE SERVICIO (BUSINESS LOGIC) - DOMINIO USUARIOS
 * Coordina la lógica y reglas de negocio del dominio.
 */

const getProfile = async (id) => {
  const user = await userRepository.findById(id);
  if (!user) throw new Error('Usuario no encontrado');
  
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const getAll = async () => {
  return await userRepository.findAll();
};

const registerUser = async (userData) => {
  // Regla de Negocio: Verificar duplicados
  const existingEmail = await userRepository.findByEmail(userData.email);
  if (existingEmail) throw new Error('El email ya está registrado');

  const existingDoc = await userRepository.findByDocumentId(userData.documentId);
  if (existingDoc) throw new Error('El número de documento ya está registrado');

  // Encriptación (Seguridad DevSecOps)
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const newUserId = await userRepository.create({
    ...userData,
    password: hashedPassword
  });

  return await getProfile(newUserId);
};

const updateProfile = async (id, userData) => {
  const user = await userRepository.findById(id);
  if (!user) throw new Error('Usuario no existe');

  // Construcción dinámica de la actualización
  const updates = [];
  const values = [];
  
  Object.keys(userData).forEach(key => {
    if (userData[key] !== undefined && key !== 'password') {
      updates.push(`${key} = ?`);
      values.push(userData[key]);
    }
  });

  // Manejo especial para password
  if (userData.password) {
    updates.push('password = ?');
    const hashed = await bcrypt.hash(userData.password, 10);
    values.push(hashed);
  }

  if (updates.length > 0) {
    return await userRepository.update(id, updates, values);
  }
  
  return await getProfile(id);
};

const deactivateUser = async (id) => {
  await userRepository.update(id, ['status = ?'], ['Inactivo']);
  return { success: true, message: 'Usuario desactivado' };
};

module.exports = {
  getProfile,
  getAll,
  registerUser,
  updateProfile,
  deactivateUser
};
