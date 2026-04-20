# Auditoría y Plan de Ejecución Scrum: PrediVersa v3.2 Titanium

## 1. Ingeniería Inversa del Sistema
El sistema ha sido migrado de una arquitectura basada en contenedores (App Runner) a un ecosistema **Event-Driven Serverless**.

### Flujo End-to-End Actual:
1.  **Frontend (React):** Envía petición POST al Backend.
2.  **API Gateway (HTTP API):** Gestiona CORS y autenticación, deriva a la Lambda.
3.  **Orchestrator Lambda:**
    - Recupera contexto de **DynamoDB** (Memoria Corta).
    - Ejecuta Sensor de Riesgo (Regex + Semantic).
    - Invoca a **Amazon Bedrock** (Claude 3.5 Haiku).
    - Emite evento asíncrono a **EventBridge** si detecta riesgo.

---

## 2. Radiografía Técnica (Semáforo)

| Módulo | Estado | Diagnóstico |
| :--- | :--- | :--- |
| **Alertas** | 🟢 **Verde** | 100% resiliente y asíncrono. |
| **Motor de Riesgo** | 🟢 **Verde** | Protección en 3 capas activa. |
| **Memoria** | 🟡 **Amarillo** | DynamoDB operativo, falta sync histórico. |
| **Observabilidad**| 🔴 **Rojo** | Falta X-Ray y Logs de Auditoría. |

---

## 3. Backlog Scrum (Sprint 1)

| ID | Tarea | Prioridad |
| :--- | :--- | :--- |
| **H-01** | Redirigir Frontend al nuevo API Gateway | 🔥 Crítica |
| **H-02** | Anonimización de datos en Logs | Alta |
| **H-03** | Configuración de AWS X-Ray | Alta |

---

**¿Procedemos con la Tarea H-01?** 🚀
