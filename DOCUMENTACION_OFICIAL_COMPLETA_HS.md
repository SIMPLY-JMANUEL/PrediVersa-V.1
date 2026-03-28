# 💎 DOCUMENTACIÓN OFICIAL COMPLETA PREDIVERSA V.1.1 (HS)

## 📋 SECCIÓN 1: RESUMEN DEL PROYECTO
**Autor**: Andrey PrediVersa Team
**Propósito**: Documentación exhaustiva de la arquitectura, funcionalidades e integraciones de la plataforma PrediVersa.

PrediVersa es una plataforma educativa web de vanguardia diseñada para ser inclusiva y proactiva. Con dashboards diferenciados por rol, ofrece una experiencia dinámica para Estudiantes, Administradores y Colaboradores.

## 🏗️ SECCIÓN 2: ARQUITECTURA TÉCNICA DETALLADA

### 2.1 Backend (Node.js + Express)
- **Rutas de Autenticación**: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset-password`.
- **Centralización IA**: El servicio `centralAIService.js` actúa como el "cerebro" que conecta el dashboard estudiantil con **Amazon Lex Runtime V2**.
- **Gestión de Base de Datos**: Uso de `mysql2/promise` para interactuar con la instancia **AWS RDS MySQL**.

### 2.2 Frontend (React + Vite)
- **Diseño Moderno**: Implementación de una estética "Rich Aesthetic" con Vanilla CSS, fuentes personalizadas (Outfit) y micro-animaciones en botones y tarjetas.
- **Páginas Corporativas**:
  - `Landing Modernizada`: Con gradientes suaves y layout de alto impacto.
  - `Quienes Somos`: Diseño basado en la misión institucional.
  - `Servicios`: Catálogo interactivo de ofertas.
- **Dashboards**:
  - `StudentDashboard`: Integración con Chatbot Lex.
  - `AdminDashboard`: Panel de control total con estadísticas dinámicas y CRUD de usuarios.

## 🤖 SECCIÓN 3: INTEGRACIÓN AMAZON LEX (CHATBOT)
Se ha completado la migración de Botpress a **Amazon Lex** para una mayor escalabilidad y control de datos.
- **Flujo de Mensajes**: El frontend envía el mensaje al backend (`/api/chatbot/message`).
- **Procesamiento AI**: El backend invoca el SDK de AWS Lex Runtime V2, adjuntando el `sessionId` y el `userId`.
- **Respuestas Contextuales**: El bot responde basándose en los intents configurados para el ámbito educativo.

## 🔐 SECCIÓN 4: SEGURIDAD Y PERSISTENCIA
- **Hash de Contraseñas**: Implementado con **bcryptjs** (10 salt rounds) para todas las cuentas.
- **Gestión de Sesión**: JWT firmado con `JWT_SECRET` almacenado de forma segura en las variables de entorno del servidor.
- **Persistencia en la Nube**: Configuración de **AWS RDS** con pool de conexiones para alta disponibilidad.

## 📊 SECCIÓN 5: FUNCIONALIDADES CLAVE IMPLEMENTADAS

### 5.1 Gestión de Usuarios (Admin)
- **CRUD Completo**: Crear, ver, editar y desactivar usuarios en tiempo real.
- **Filtros Avanzados**: Búsqueda por Nombre, Email, DocumentoID, Rol y Estado.
- **Exportación**: Botón "Exportar a CSV" para reportes administrativos externos.

### 5.2 Registro y Autenticación
- **Nuevo Formulario de Registro**: Captura datos esenciales de forma segura.
- **Recuperación de Contraseña**: Flujo intuitivo para restablecer el acceso a la cuenta.
- **Dashboard de Reportes**: Visualización de estadísticas del sistema mediante gráficos de Chart.js.

### 5.3 Diseño Responsivo Profesional
- **Universalidad**: La plataforma se adapta automáticamente a Móviles, Tablets y Desktop mediante un sistema avanzado de Media Queries.
- **Grillas Dinámicas**: Uso de CSS Grid con `auto-fit` para dashboards inteligentes.
- **Navegación Móvil**: Menús y cabeceras que se reestructuran para una experiencia táctil fluida.
- **Multimedia Fluida**: Resets globales para que imágenes y videos nunca desborden su contenedor.

## 🔄 SECCIÓN 6: HISTORIAL DE CAMBIOS (DE LOGS DE DESARROLLO)

- **Marzo 28, 2026**: Modernización total de la landing page corporativa.
- **Marzo 27, 2026**: Integración exitosa de **Amazon Lex Runtime V2** en el dashboard de estudiantes.
- **Marzo 25, 2026**: Implementación del sistema de recuperación de contraseña y login mejorado.
- **Marzo 20, 2026**: Migración completa a base de datos **AWS RDS MySQL**.
- **Marzo 15, 2026**: Creación de los módulos de Gestión de Usuarios y Reportes Estadísticos.

## 📡 SECCIÓN 7: ENDPOINTS API ACTUALIZADOS

| Método | Endpoint | Descripción | Requiere Token |
|--------|----------|-------------|----------------|
| POST | `/api/auth/login` | Iniciar sesión y obtener token JWT | No |
| POST | `/api/auth/register` | Registrar un nuevo usuario | No |
| POST | `/api/auth/reset-password`| Restablecer la contraseña | No |
| GET | `/api/auth/users` | Listar usuarios con filtros | Sí (Admin) |
| POST | `/api/chatbot/message` | Enviar mensaje a Amazon Lex | Sí (Student) |
| GET | `/api/auth/stats` | Obtener estadísticas generales | Sí (Admin) |

## 🚀 SECCIÓN 8: PRÓXIMOS PASOS (V1.2+)
1. Implementación de **Socket.io** para notificaciones en tiempo real.
2. Integración de **Stripe** para planes de suscripción premium.
3. Creación de la aplicación móvil nativa con **React Native**.

---

**Versión:** `v1.1.0` | **Licencia:** `Propietaria` | **© 2026 PrediVersa**

**Autores:**
*Jmanuel Calvo/PrediVersa, Andrey Luna/PrediVersa, Harold Salcedo/PrediVersa*
**Departamento de Crecimiento Estratégico**
