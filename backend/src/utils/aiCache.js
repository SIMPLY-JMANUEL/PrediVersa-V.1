const { createClient } = require('redis');
const crypto = require('crypto');
const logger = require('./logger');

/**
 * 🧊 GESTOR DE CACHÉ DE IA (REDIS + HASHING)
 * Optimización de Costos y Latencia para AWS Bedrock.
 * 
 * ⚡ RESILIENTE: Si Redis no está disponible, el sistema continúa
 * funcionando sin caché (degradación elegante). Se registra una alarma
 * para alertar al equipo de operaciones.
 */
class AICache {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.isHealthy = false;
    this.ttl = parseInt(process.env.AI_CACHE_TTL) || 3600; // 1 hora por defecto
    this.reconnectAttempts = 0;
    this.MAX_RECONNECT_ATTEMPTS = 3;
  }

  /**
   * Inicializa el cliente Redis con health check y manejo de errores.
   */
  async connect() {
    try {
      this.client = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          connectTimeout: 5000,        // 5s timeout de conexión
          reconnectStrategy: (retries) => {
            if (retries >= this.MAX_RECONNECT_ATTEMPTS) {
              logger.warn('⚠️ Redis: Máximo de reconexiones alcanzado. Cache desactivada hasta próximo health check.');
              this.isHealthy = false;
              return false; // Detener reconexión automática
            }
            return Math.min(retries * 500, 2000); // backoff exponencial hasta 2s
          }
        }
      });

      this.client.on('error', (err) => {
        if (this.isHealthy) {
          logger.error('🚨 Redis Cache ERROR — Bedrock será llamado sin caché, costos pueden aumentar:', err.message);
        }
        this.isHealthy = false;
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        this.isHealthy = true;
        this.reconnectAttempts = 0;
        logger.info('✅ Redis conectado. Smart-Cache de IA activada (FinOps Mode ON).');
      });

      this.client.on('reconnecting', () => {
        this.reconnectAttempts++;
        logger.warn(`🔄 Redis: Reconectando... (intento ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
      });

      await this.client.connect();
    } catch (err) {
      logger.error('❌ Redis no disponible al iniciar. Cache IA desactivada (modo degradado):', err.message);
      logger.warn('💰 FINOPS ALERT: Sin caché Redis todas las consultas van a Bedrock. Costos se incrementarán.');
      this.isHealthy = false;
      this.isConnected = false;
    }
  }

  /**
   * Health check público para el endpoint /api/health.
   */
  async healthCheck() {
    if (!this.client || !this.isConnected) return { status: 'disconnected', healthy: false };
    try {
      await this.client.ping();
      this.isHealthy = true;
      return { status: 'connected', healthy: true };
    } catch {
      this.isHealthy = false;
      return { status: 'error', healthy: false };
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
    if (!this.isHealthy || !this.client) return null; // Degradación elegante
    try {
      const key = `ai_cache:${this.generateKey(text, context)}`;
      const cached = await this.client.get(key);
      if (cached) {
        logger.info(`🎯 Cache Hit: Reutilizando respuesta para "${text.substring(0, 20)}..." (FinOps: $0)`);
        return JSON.parse(cached);
      }
      return null;
    } catch (error) {
      logger.warn('⚠️ Redis get fallback (degradado):', error.message);
      return null;
    }
  }

  async set(text, value, context = '') {
    if (!this.isHealthy || !this.client) return; // Degradación elegante
    try {
      const key = `ai_cache:${this.generateKey(text, context)}`;
      await this.client.set(key, JSON.stringify(value), { EX: this.ttl });
    } catch (error) {
      logger.warn('⚠️ Redis set fallback (degradado):', error.message);
    }
  }
}

const cacheInstance = new AICache();

// Inicializar al cargar el módulo (no bloqueante)
cacheInstance.connect().catch(() => {
  // Error ya logueado en connect()
});

module.exports = cacheInstance;
