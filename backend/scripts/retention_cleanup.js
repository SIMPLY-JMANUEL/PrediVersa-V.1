/**
 * 🗃️ POLÍTICA DE RETENCIÓN DE DATOS (GDPR / Compliance)
 * 
 * Elimina registros antiguos de tablas de alto volumen para evitar
 * degradación de rendimiento en RDS.
 * 
 * CONFIGURACIÓN: Ejecutar como tarea programada (cron job en AWS EventBridge)
 * o manualmente desde el panel de administración.
 * 
 * RETENCIÓN POR TABLA:
 *   - chatbot_interacciones: 90 días
 *   - audit_logs:            180 días
 *   - chatbot_reportes:      365 días (1 año)
 * 
 * USO:
 *   node backend/scripts/retention_cleanup.js
 */

const { pool } = require('../src/db/connection');

const RETENTION_POLICIES = [
  {
    table: 'chatbot_interacciones',
    column: 'createdAt',
    days: parseInt(process.env.RETENTION_CHATBOT_DAYS) || 90,
    description: 'Interacciones del chatbot (scoring y log)'
  },
  {
    table: 'audit_logs',
    column: 'createdAt',
    days: parseInt(process.env.RETENTION_AUDIT_DAYS) || 180,
    description: 'Logs de auditoría de compliance'
  },
  {
    table: 'chatbot_reportes',
    column: 'createdAt',
    days: parseInt(process.env.RETENTION_REPORTS_DAYS) || 365,
    description: 'Reportes generados por el chatbot'
  },
  {
    table: 'refresh_tokens',
    column: 'expires_at',
    days: 0, // Eliminar todos los tokens expirados (cualquier edad)
    description: 'Tokens JWT expirados (seguridad)',
    useExpired: true // Eliminar donde expires_at < NOW()
  }
];

async function runRetentionCleanup() {
  console.log('\n🗃️ Iniciando limpieza de política de retención de datos...');
  console.log(`📅 Fecha: ${new Date().toISOString()}\n`);

  let totalDeleted = 0;

  for (const policy of RETENTION_POLICIES) {
    try {
      let sql, params;

      if (policy.useExpired) {
        sql = `DELETE FROM ${policy.table} WHERE expires_at < NOW()`;
        params = [];
      } else {
        sql = `DELETE FROM ${policy.table} WHERE ${policy.column} < DATE_SUB(NOW(), INTERVAL ? DAY)`;
        params = [policy.days];
      }

      const [result] = await pool.execute(sql, params);
      const deleted = result.affectedRows;
      totalDeleted += deleted;

      const label = policy.useExpired
        ? 'expirados'
        : `mayor a ${policy.days} días`;

      console.log(`  ✅ ${policy.table}: ${deleted} registros eliminados (${label})`);
      console.log(`     └─ ${policy.description}`);
    } catch (err) {
      console.error(`  ❌ Error en ${policy.table}:`, err.message);
    }
  }

  console.log(`\n📊 Total registros eliminados: ${totalDeleted}`);
  console.log('✅ Política de retención completada.\n');

  await pool.end();
}

runRetentionCleanup().catch(err => {
  console.error('❌ Fallo crítico en retención:', err.message);
  process.exit(1);
});
