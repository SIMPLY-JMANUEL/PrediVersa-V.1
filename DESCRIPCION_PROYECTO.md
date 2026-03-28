# 📚 DESCRIPCIÓN COMPLETA DEL PROYECTO PREDIVERSA V.1.1

## 🎯 RESUMEN GENERAL

**PrediVersa** es una plataforma educativa web premium diseñada para facilitar la educación diversa e inclusiva. Ofrece dashboards personalizados para estudiantes, administradores y colaboradores, integrando un asistente virtual basado en **Amazon Lex** para soporte proactivo. La interfaz ha sido modernizada con altos estándares estéticos para ofrecer una experiencia de usuario de primer nivel.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Backend (Node.js + Express)
- **Estructura Modular**: Organizado en rutas, controladores, modelos de base de datos y servicios de IA.
- **Rutas de Autenticación**: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`.
- **Central AI Service**: `backend/src/utils/centralAIService.js` - Gestiona la comunicación con Amazon Lex Runtime V2.
- **Base de Datos**: Conexión a **AWS RDS MySQL** mediante un pool de conexiones optimizado.

### Frontend (React + Vite)
- **Rutas Protegidas**: Uso de `ProtectedRoute` para verificar roles y autenticación JWT.
- **Web Corporativa**: Páginas profesionales diseñadas con Vanilla CSS:
  - `Landing`: Hero section de alto impacto.
  - `Quienes Somos`: Misión y visión.
  - `Servicios`: Catálogo de ofertas educativas.
  - `Planes`: Modelos de suscripción.
  - `Contacto`: Formulario interactivo.
- **Dashboards**:
  - `Estudiante`: Incluye el **Chatbot Lex** integrado.
  - `Admin`: Gestión total de usuarios y estadísticas (Reports).
  - `Colaborador`: Herramientas de gestión académica.

---

## 🛠️ TECNOLOGÍAS CLAVE

### Inteligencia Artificial (Amazon Lex)
Se ha migrado de Botpress a **Amazon Lex** para ofrecer un chatbot más robusto y escalable.
- **Lex Runtime V2 SDK**: Integración directa en el backend para procesar mensajes de usuario.
- **Contextualización**: El chatbot reconoce al estudiante autenticado para ofrecer respuestas personalizadas.

### Seguridad y Autenticación
- **JWT (JSON Web Tokens)**: Persistencia de 24 horas y manejo de roles.
- **Bcryptjs**: Cifrado unidireccional de contraseñas de alta seguridad.
- **Recovery Flow**: Sistema de restablecimiento de contraseña integrado.

---

## 🔄 HISTORIAL DE EVOLUCIÓN (CRONOLOGÍA)

### Fase 1: MVP (Feb 2026)
- ✅ Estructura base React + Express.
- ✅ Autenticación JWT básica.
- ✅ Chatbot Botpress básico.

### Fase 2: Robustización y AWS (Mar 2026 early)
- ✅ Migración a **AWS RDS MySQL**.
- ✅ CRUD completo de usuarios en el AdminDashboard.
- ✅ Panel de Estadísticas (Reports) con Chart.js.

### Fase 3: Modernización y Lex (Mar 2026 late)
- ✅ **Migración a Amazon Lex**: Integración de IA avanzada.
- ✅ **Landing Modernizada**: Diseño premium corporativo.
- ✅ **Registro y Recuperación**: Flujos de usuario completos.
- ✅ **Despliegue AWS App Runner / Render**: Hosting en la nube profesional.

---

## 📦 ESTRUCTURA DE LOS DATOS (MYSQL)

### Usuario
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    documentId VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role ENUM('Estudiante', 'Administrador', 'Colaboradores') NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    birthDate DATE,
    status ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Alertas (Sistema Admin)
```sql
CREATE TABLE alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    studentDocumentId VARCHAR(255),
    description TEXT,
    status ENUM('Pendiente', 'En Proceso', 'Resuelto'),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🚀 ROADMAP FUTURO (V1.2+)

1. **Notificaciones Push**: Alertas en tiempo real sobre picos de estrés o conflictos.
2. **Videoconferencia**: Módulo de tutoría integrado con WebRTC.
3. **Móvil (React Native)**: Versión nativa para iOS y Android.
4. **Stripe Integration**: Pasarela de pagos para planes premium.

---

**Versión:** `v1.1.0` | **Licencia:** `Propietaria` | **© 2026 PrediVersa**

**Autores:**
*Jmanuel Calvo/PrediVersa, Andrey Luna/PrediVersa, Harold Salcedo/PrediVersa*
**Departamento de Crecimiento Estratégico**
