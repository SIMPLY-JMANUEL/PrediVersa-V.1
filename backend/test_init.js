const { testConnection, initializeDatabase } = require('./src/db/connection');

async function test() {
  const isC = await testConnection();
  if (isC) {
    console.log("Connected, running init...");
    try {
      await initializeDatabase();
      console.log("SUCCESS!");
    } catch (e) {
      console.error("INIT FAILED:", e);
    }
  } else {
    console.log("testConnection returned false");
  }
  process.exit(0);
}

test();
