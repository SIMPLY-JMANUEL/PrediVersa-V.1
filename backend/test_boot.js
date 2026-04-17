process.env.DB_HOST = 'prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com';
process.env.DB_USER = 'admin';
process.env.DB_PASSWORD = 'Prediversa2026';
process.env.DB_DATABASE = 'prediversa';
process.env.JWT_SECRET = 'TESTSECRET123';
require('./src/server.js');
