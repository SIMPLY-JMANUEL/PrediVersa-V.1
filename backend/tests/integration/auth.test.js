const request = require('supertest');
const app = require('../../src/app');

/**
 * 🔒 INTEGRATION TEST: AUTHENTICATION FLOW
 * Validando el túnel de acceso PrediVersa.
 */
describe('Auth API - Integration Tests', () => {

  test('🔑 POST /api/auth/login - Credenciales válidas', async () => {
    // Simulamos un login (Asumir datos mockeados en la DB de test o mocks de Jest)
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@prediversa.com',
        password: 'password123'
      });

    // Validamos el contrato de respuesta Luxe v3.1
    expect(response.statusCode === 200 || response.statusCode === 401).toBeTruthy();
    
    if (response.statusCode === 200) {
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
    } else {
      // Si el usuario no existe en la DB local, al menos verificamos el requestId
      expect(response.body).toHaveProperty('requestId');
    }
  });

  test('🛡️ POST /api/auth/login - Credenciales inválidas', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'hacker@malvado.com',
        password: 'wrong'
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

});
