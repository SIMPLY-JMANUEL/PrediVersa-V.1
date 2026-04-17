require('dotenv').config();
const { pool } = require('./backend/src/db/connection');

async function testQuery() {
  try {
    const limit = 20;
    const offset = 0;
    
    console.log("Testing COUNT...");
    const [t] = await pool.execute('SELECT COUNT(*) FROM alerts', []);
    console.log("COUNT OK");
    
    console.log("Testing LIMIT...");
    const [rows] = await pool.execute('SELECT * FROM alerts LIMIT ? OFFSET ?', [limit, offset]);
    console.log(`LIMIT OK, got ${rows.length} rows`);
    
  } catch (e) {
    console.error('Error executing query:', e.message);
  } finally {
    await pool.end();
  }
}

testQuery();
