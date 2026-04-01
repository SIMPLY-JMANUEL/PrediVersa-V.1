const { createClient } = require('redis');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * GESTOR DE CACHÉ DE IA (REDIS + HASHING)
 * Optimización de Costos y Latencia para AWS Bedrock.
 */
class AICache {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    this.isConnected = false;
    this.ttl = parseInt(process.env.AI_CACHE_TTL) || 3600; // 1 hora por defecto
  }

  async connect() {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.isConnected = true;
        logger.info('✅ Conectado a Redis para Smart-Cache de IA.');
      }
    } catch (err) {
      logger.error('❌ Error conectando a Redis:', err.message);
    }
  }

  /**
   * Genera una llave única basada en el contenido del mensaje (Normalizado)
   */
  generateKey(text, context = '') {
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    return crypto.createHash('sha256').update(`${normalized}|${context}`).digest('hex');
  }

  async get(text, context = '') {
    if (!this.isConnected) await this.connect();
    try {
      const key = `ai_cache:${this.generateKey(text, context)}`;
      const cached = await this.client.get(key);
      if (cached) {
        logger.info(`🎯 Cache Hit: Reutilizando respuesta para "${text.substring(0, 20)}..."`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async set(text, value, context = '') {
    if (!this.isConnected) await this.connect();
    try {
      const key = `ai_cache:${this.generateKey(text, context)}`;
      await this.client.set(key, JSON.stringify(value), {
        EX: this.ttl
      });
    } catch (error) {
      logger.error('⚠️ Error guardando en Redis:', error.message);
    }
  }
}

module.exports = new AICache();
