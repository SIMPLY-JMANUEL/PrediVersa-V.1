const mysql = require('mysql2/promise');

async function inspect() {
  const config = {
    host: 'prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com',
    user: 'admin',
    password: 'Prediversa2026',
    database: 'prediversa',
    port: 3306,
    ssl: { rejectUnauthorized: false }
  };

  try {
    console.log('--- INSPECCIÓN DE BASE DE DATOS PREDIVERSA ---');
    const connection = await mysql.createConnection(config);
    console.log('✅ Conectado a RDS exitosamente.\n');

    // 1. Listar Tablas
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Tablas detectadas:');
    tables.forEach(t => console.log(` - ${Object.values(t)[0]}`));
    console.log('');

    // 2. Resumen de Usuarios
    const [userStats] = await connection.execute('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    console.log('👥 Resumen de Usuarios por Rol:');
    userStats.forEach(s => console.log(` - ${s.role}: ${s.count}`));
    console.log('');

    // 3. Resumen de Alertas (Dashboard)
    const [alertStats] = await connection.execute('SELECT alertType, COUNT(*) as count FROM alerts GROUP BY alertType');
    console.log('🚨 Resumen de Alertas en Dashboard:');
    alertStats.forEach(s => console.log(` - ${s.alertType}: ${s.count}`));
    console.log('');

    // 4. Resumen de Chatbot (Motor Versa)
    const [chatbotStats] = await connection.execute('SELECT nivel_riesgo, COUNT(*) as count FROM chatbot_reportes GROUP BY nivel_riesgo');
    console.log('🤖 Resumen de Interacciones Chatbot (Riesgo Bajo/Medio):');
    chatbotStats.forEach(s => console.log(` - ${s.nivel_riesgo}: ${s.count}`));
    
    const [critStats] = await connection.execute('SELECT COUNT(*) as count FROM chatbot_alertas_criticas');
    console.log(` - CRÍTICAS (Riesgo Alto): ${critStats[0].count}`);
    console.log('');

    // 5. Últimas 5 Alertas Críticas (Muestra de datos)
    console.log('🚩 Últimas 5 Alertas Críticas del Chatbot:');
    const [lastCrit] = await connection.execute('SELECT ticket_number, nombre, tipo_violencia, createdAt FROM chatbot_alertas_criticas ORDER BY createdAt DESC LIMIT 5');
    if (lastCrit.length === 0) console.log(' (Sin alertas críticas aún)');
    lastCrit.forEach(c => console.log(` - [${c.ticket_number}] ${c.nombre} | ${c.tipo_violencia} (${c.createdAt.toISOString()})`));
    console.log('');

    // 6. Configuración de Roles y Dependencias (Estructura)
    const [depStats] = await connection.execute('SELECT COUNT(*) as count FROM dependencias');
    console.log(`🏢 Dependencias configuradas: ${depStats[0].count}`);
    
    await connection.end();
    console.log('\n--- FIN DE LA INSPECCIÓN ---');
  } catch (error) {
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('❌ La base de datos "prediversa" no existe todavía.');
    } else {
      console.error('❌ Error durante la inspección:', error.message);
    }
  }
}

inspect();
