const { pool } = require('../src/db/connection');
const bcrypt = require('bcryptjs');

async function resetDatabaseForProduction() {
  console.log('🚀 INICIANDO LIMPIEZA DE BASE DE DATOS PARA LANZAMIENTO V1.1.0...');
  
  let connection;
  try {
    connection = await pool.getConnection();

    // 1. Desactivar checks de llaves foráneas temporalmente para limpieza segura
    await connection.execute('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('✅ Modo seguro para limpieza activado.');

    // 2. Tablas a limpiar (Truncate es más rápido y limpia los contadores de ID)
    const tablesToReset = [
      'case_actions',
      'chatbot_alertas_criticas',
      'chatbot_reportes',
      'chatbot_reuniones',
      'chatbot_ajustes_ia',
      'chatbot_interacciones',
      'alerts',
      'users'
    ];

    for (const table of tablesToReset) {
      try {
        await connection.execute(`TRUNCATE TABLE ${table};`);
        console.log(`✨ Tabla ${table} vaciada correctamente.`);
      } catch (err) {
        console.warn(`⚠️ No se pudo vaciar ${table} (Tal vez no existe aún):`, err.message);
      }
    }

    // 3. Reactivar checks de llaves foráneas
    await connection.execute('SET FOREIGN_KEY_CHECKS = 1;');

    // 4. Crear Administrador Maestro (Semilla para la 1.1.0)
    const adminEmail = 'admin@prediversa.com';
    const adminPass = 'admin123';
    const hashedPass = await bcrypt.hash(adminPass, 10);

    await connection.execute(
      `INSERT INTO users (documentId, email, password, name, role, status) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      ['ADMIN-MASTER-01', adminEmail, hashedPass, 'Administrador Central', 'Administrador', 'Activo']
    );

    console.log('\n' + '='.repeat(40));
    console.log('🏁 LIMPIEZA COMPLETADA CON ÉXITO');
    console.log(`🔑 ACCESO ADMIN: ${adminEmail}`);
    console.log(`🔐 CONTRASEÑA: ${adminPass}`);
    console.log(''.repeat(40) + '\n');
    console.log('⚠️ RECOMENDACIÓN: Cambia la contraseña desde el panel administrativo tras tu primer acceso.');

  } catch (error) {
    console.error('❌ ERROR CRÍTICO DURANTE EL RESET:', error.message);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

resetDatabaseForProduction();
