# 🛡️ DOCUMENTACIÓN TÉCNICA: PrediVersa v2.6 (Enterprise Ready)
**Versión**: 2.6 MASTER MERGE  
**Fecha**: 2026-03-28  
**Arquitectura**: Node.js/Express, React/Vite, AWS Lex/Bedrock, RDS MySQL.

---

### 🚀 1. INFRAESTRUCTURA CENTRALIZADA (AWS Core)
Se ha implementado el archivo [awsConfig.js](file:///backend/src/utils/awsConfig.js) para centralizar todas las conexiones con Amazon Web Services.
*   **Resultados**: Reducción del consumo de memoria en el servidor App Runner y mayor estabilidad en las sesiones concurrentes.
*   **Servicios Unificados**: Lex V2, Bedrock (Claude 3.5), SNS (SMS) y SES (Email).

### 🧠 2. MOTOR VERSA 2.6: Análisis Predictivo por Ejes
El motor de inteligencia Versa ha sido potenciado para pasar de un sistema de "puntos" a un sistema de **Diagnóstico por Ejes**.
*   **Capas de análisis**:
    1.  **Emergencia Vital**: Detección inmediata de riesgo de vida.
    2.  **Ejes de Intervención**: Clasificación automática en: *Vital, Escolar, Familiar y Social*.
    3.  **Inhibidores Académicos**: Filtra conversaciones sobre tareas o lecturas de clase para evitar falsas alarmas.
    4.  **Énfasis Emocional**: Reconocimiento de Gritos (Mayúsculas) y puntuación excesiva.
    5.  **Jerga Colombiana**: Base de datos de más de 200 expresiones restaurada al 100%.

### 🔔 3. ALERTA EN CALIENTE Y REMISIÓN AUTOMÁTICA
La conexión entre el Chatbot y el Administrador ahora es síncrona y propositiva.
*   **Notificación SSE (Real-Time)**: La alerta llega al administrador milisegundos después de que el estudiante escribe, mientras la conversación sigue activa.
*   **Remisión Sugerida**: Cada alerta incluye ahora una `📋 ACCIÓN SUGERIDA` basada en el eje detectado, indicando al administrador si debe remitir a Psicología, Coordinación o Bienestar Familiar.
*   **Evidencia de Hallazgos**: Las palabras clave por las que se generó la alerta se presentan de forma explícita en el ticket.

### 🧹 4. LIMPIEZA Y OPTIMIZACIÓN DE CÓDIGO
Se ha realizado una limpieza profunda (Deep Cleaning) en los módulos críticos:
*   **db/users.js**: Refactorizado para usar helpers de consulta (`query`, `querySingle`). Código un 40% más ágil y legible. No se borraron columnas ni se alteró la integridad de la base de datos.
*   **chatbot.js**: Se simplificó la lógica de rutas al eliminar las instanciaciones manuales de AWS.
*   **Frontend (AmazonLexChat.jsx)**: Interfaz modernizada con banner de "Conexión Protegida" y actualización de identidad visual.

---

### 🌐 5. ESTADO DE DESPLIEGUE (Branches)
El sistema ha sido sincronizado en todas las ramas de producción:
*   `main` ✅
*   `ANDREY-PrediVersa` ✅
*   `SIMPLY-JMANUEL` ✅
*   `HAROLD-PrediVersa` ✅

**PrediVersa está lista para su despliegue final a internet bajo estándares Enterprise.**
🛡️ *Seguridad, Inteligencia y Humanismo.* 🛡️
