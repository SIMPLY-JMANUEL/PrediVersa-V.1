# 🏛️ PREDIVERSA v3.1 (TITANIUM SAAS EDITION) 🎓🤖🛡️
**"Plataforma de Inteligencia Preventiva Escolar de Grado Empresarial"**

PrediVersa es una plataforma tecnológica de vanguardia diseñada para detectar tempranamente riesgos psicosociales (acoso, problemas emocionales, convivencia) en entornos escolares, utilizando un Motor de IA Híbrido, interfaces "Glassmorphism" Premium y arquitectura de Alta Disponibilidad alojada enteramente en AWS.

---

## 🚀 HIGHLIGHTS TÉCNICOS (v3.1.2)
1. **🤖 IA VERSA Engine**: Triple Sensor 360° (Riesgo + Identidad + Emoción) impulsado por *Amazon Lex* y *Amazon Bedrock*.
2. **🛡️ Seguridad Bancaria (DevSecOps)**:
   - Rotación Automática de JWT (Refresh Tokens).
   - Bloqueo de Fuerza Bruta y Rate Limiting Global (`express-rate-limit`).
   - Cifrado total HTTPS, Validaciones super estrictas de payloads usando Zod y políticas Helmet.
3. **💎 Interfaz Luxe UI**: Rediseño total de la experiencia de usuario (SaaS 2026), paneles de diagnóstico en tiempo real usando Server-Sent Events (SSE) y persistencia segura de estado local con Zustand.
4. **☁️ 100% Nube Nivel AWS**: Frontend gestionado por AWS Amplify, Backend escalado automáticamente en AWS App Runner (Docker/Linux), Persistencia distribuida en Amazon RDS MySQL.

---

## 🏛️ ARQUITECTURA MODULAR (Domain-Driven Design)
Para asegurar el escalamiento, el monolito fue desmantelado hacia una estructura limpia (DDD):

```
📦 PrediVersa-V.1
 ┣ 📂 backend/
 ┃ ┣ 📂 src/
 ┃ ┃ ┣ 📂 db/          # pool MySQL, Migraciones Automáticas OnBoot
 ┃ ┃ ┣ 📂 modules/     # Dominios de negocio desacoplados
 ┃ ┃ ┃ ┣ 📂 alerts     # Ciclo de vida y tracking de tickets.
 ┃ ┃ ┃ ┣ 📂 auth       # Seguridad y emisión/rotación de tokens.
 ┃ ┃ ┃ ┣ 📂 chatbot    # Stream SSE y comunicación directa con Amazon Lex.
 ┃ ┃ ┃ ┣ 📂 config     # Manejo de roles, settings globales AWS.
 ┃ ┃ ┃ ┣ 📂 dashboard  # Analíticas, IA Stats y consolidación general.
 ┃ ┃ ┃ ┗ 📂 users      # Identidades, RBAC, Desactivaciones, Roles.
 ┃ ┃ ┣ 📂 utils/       # LexService, Logger, AWS SDK Clients
 ┃ ┃ ┗ 📜 app.js       # Express Pipeline (CORS, Helmet, Error Handling)
 ┃ ┗ 📜 package.json   # Modificado con dependencias exactas para App Runner
 ┗ 📂 frontend/
   ┣ 📂 src/
   ┃ ┣ 📂 components/  # Paneles visuales, Dashboards, Quienes Somos
   ┃ ┣ 📂 hooks/       # useAlerts, useUsers, useAuth
   ┃ ┣ 📂 store/       # Zustand auth_store (Gestión de Identidad Reactiva)
   ┃ ┣ 📂 styles/      # Estilos premium modulares Glassmorphism
   ┃ ┗ 📜 App.jsx      # Rutas Protegidas (RBAC interceptors)
```

---

## 🔐 CONTROL DE ACCESO
El acceso a la plataforma está restringido por roles. Las credenciales deben ser gestionadas por el Administrador General a través del panel de control. **Nunca comparta contraseñas en texto plano.**

---

## 🛠️ DESPLIEGUE EN AWS O ENTORNO LOCAL
El sistema está optimizado para reconfiguración automática.

### VARIABLES ENTORNOS (Env AWS / Local)
Debe proveer en AWS AppRunner o su respectivo `.env` local las claves:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE` => apuntando al servidor relacional.
- `JWT_SECRET` => Llave hiper-criptográfica (Para firma de tokens).
- `AWS_REGION` => us-east-1

*(AppRunner levanta el backend automáticamente utilizando el comando estándar de npm)*

### AUTO-INICIALIZACIÓN (MIGRATOR)
En cuanto el servidor de backend logra conectarse a la Base de datos, **auto-audita la existencia de las siguientes tablas, creándolas si están ausentes:**
- `users`: (Integridad principal)
- `alerts`: (Tickets de riesgo)
- `refresh_tokens`: (Receptor de Tokens, con enlace FK ON CASCADE)
- `chatbot_interacciones` y reportes: (Memoria IA).

Esta actualización resolvió permanentemente un Error Crítico (500) en lanzamientos anteriores. 

---

## 🧪 TECNOLOGÍAS USADAS
- **Frontend:** React 18, Vite, Zustand, Recharts (Gráficas Dashboards), Lucide-React, Vanila CSS Premium SaaS.
- **Backend:** Node.js 18+, Express, Zod, JsonWebToken, express-rate-limit, AWS SDK v3.
- **AWS Cloud Base:** Amazon Bedrock (Modelos Avanzados), Amazon Lex V2, AWS SES, AWS SNS (Desplantes Críticos a SMS).

---

🔥 **Auditado, Refactorizado y Cifrado por Departamento de Estabilidad e IA (2026)**
🛡️ ¡Totalmente Preparado para Producción Escalable!
