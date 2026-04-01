# 💎 DOCUMENTACIÓN OFICIAL MAESTRA: PREDIVERSA v3.1 TITANIUM 🏛️🤖🛡️

## 📋 1. VISIÓN ESTRATÉGICA
**Versión Actual:** `v3.1.0-TITANIUM`  
**Autoría:** Departamento de Crecimiento Estratégico & MLOps (Calvo, Luna, Salcedo)  
**Propósito:** Plataforma Enterprise de detección proactiva de riesgos psicosociales y bienestar educativo.

---

## 🏗️ 2. ARQUITECTURA TÉCNICA (ENTERPRISE GRADE)

### 2.1 Backend Modular (DDD-Lite)
Hemos migrado de un backend monolítico a una estructura modular robusta:
- **`src/modules/auth`**: Gestión de identidad, JWT y Refresh Tokens blindados.
- **`src/modules/chatbot`**: Orquestación de IA VERSA v3.1.
- **`src/modules/alerts`**: Motor de despacho multicanal (SOS).
- **`src/modules/users` & `dashboard`**: Gestión de datos y analítica predictiva.

### 2.2 Motor VERSA v3.1 (Combined Context 360°)
El cerebro de la plataforma utiliza una estrategia de 3 capas para máxima eficiencia:
1. **Capa 0 (Diccionario Estático)**: Detección inmediata de palabras críticas (Costo $0).
2. **Capa 1 (Smart Cache Redis)**: Indexación por **SHA-256**. Respuestas instantáneas (<10ms) para consultas repetitivas.
3. **Capa 2 (AWS Bedrock)**: Claude 3.5 Haiku analiza **Riesgo, Género y Emoción** en una sola transacción.

### 2.3 Frontend "Luxe UI v4.0"
- **Estado Global**: **Zustand** con persistencia local.
- **Caché de Servidor**: **TanStack Query** (React Query) para sincronización automática.
- **Diseño**: Estética esmerilada (Glassmorphism), sistema de colores basado en HSL y tipografías premium (Inter/Outfit).
- **Rendimiento**: **Code Splitting** con `React.lazy` y **Resource Preload**.

---

## 🆘 3. SISTEMA DE ALERTA TITANIUM (SOS)
PrediVersa v3.1 incluye un motor de **Hardening Determinístico**:
- **Activación SOS**: Si el score de riesgo > 85, se ignora la duda de la IA y se fuerza la alerta.
- **Multicanalidad**:
  - **SMS (AWS SNS)**: Despacho a 3 líneas de emergencia (+573206708788, +573225892184, +573234071416).
  - **Email (AWS SES)**: Reporte formal con fragmentos de evidencia textual.
  - **Push SSE**: Notificación inmediata a todos los administradores.

---

## 🐳 4. DEVOPS & QA
- **Docker**: Imagen multi-stage optimizada (Alpine Linux).
- **CI/CD**: GitHub Actions automatizado (Lint -> Test -> Build -> Docker Push).
- **Testing**:
  - **Jest/Supertest**: Pruebas unitarias de IA y de integración API.
  - **Vitest/RTL**: Pruebas de UI y flujos de usuario en el frontend.

---

## 📡 5. MATRIZ DE ENDPOINTS API (v3.1)

| Método | Endpoint | Función | Protección |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/chatbot/message` | Procesar mensaje (Versa v3.1) | JWT (User) |
| **GET** | `/api/alerts/critical` | Listado de alertas activas | JWT (Admin) |
| **POST** | `/api/auth/refresh` | Renovación de tokens segura | Refresh Token |
| **GET** | `/api/stats/predictive`| Tendencia de riesgo IA | JWT (Admin) |

---

## 📅 6. HISTORIAL DE EVOLUCIÓN
- **v1.0 (Marzo 15)**: Lanzamiento de Dashboards básicos y Lex.
- **v2.0 (Marzo 25)**: Migración a AWS RDS y Bedrock simple.
- **v3.1 Titanium (Actual)**: Refactor modular total, Sensor 360°, MLOps y Luxe UI.

---
**© 2026 PrediVersa Platforms** | *Documentación Certificada para Uso Institucional.* 🏛️🤖🛡️
