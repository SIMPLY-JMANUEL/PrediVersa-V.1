# PrediVersa V.1 🎓

Una plataforma educativa web moderna diseñada para facilitar la educación diversa e inclusiva. Ofrece dashboards personalizados para estudiantes, administradores y colaboradores, con integración de chatbot impulsado por Botpress.

## 🚀 Características Principales

- ✅ **Autenticación JWT** - Sistema de login seguro con tokens de 24 horas
- ✅ **Dashboards Personalizados** - Interfaces específicas por rol (Estudiante, Admin, Colaborador)
- ✅ **Chatbot Inteligente** - Dual-instance Botpress (pública + autenticada)
- ✅ **Rutas Protegidas** - Control de acceso basado en roles
- ✅ **Diseño Responsive** - Compatible con móvil, tablet y desktop
- ✅ **Persistencia de Sesión** - localStorage para mantener login
- ✅ **API RESTful** - Backend con Node.js + Express

## 📋 Estructura del Proyecto

```
PrediVersa-V.1/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── app.js             # Configuración Express
│   │   ├── server.js          # Punto de entrada
│   │   ├── routes/auth.js     # Rutas de autenticación
│   │   └── db/users.js        # Base de datos (hardcoded)
│   ├── .env
│   └── package.json
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── App.jsx            # Componente raíz
    │   ├── components/        # Componentes React
    │   └── assets/            # Imágenes
    ├── vite.config.js
    └── package.json
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** v18+
- **Express.js** ^4.18.2
- **JWT** (jsonwebtoken) ^8.5.1
- **bcryptjs** ^2.4.3
- **CORS** ^2.8.5
- **dotenv** ^16.0.3

### Frontend
- **React** ^18.2.0
- **React Router DOM** ^7.13.0
- **Vite** ^5.0.8
- **CSS Modular**

### Integraciones
- **Botpress Cloud** - Chatbot con IA

## 🚀 Instalación y Ejecución

### Requisitos
- Node.js v18+
- npm o yarn

### Backend
```bash
cd backend
npm install
npm run dev          # Ejecutar con Nodemon (desarrollo)
# o
npm start           # Ejecutar con Node (producción)
```
**Puerto**: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev         # Vite dev server
```
**Puerto**: http://localhost:5173

## 🔐 Autenticación

### Credenciales de Prueba

```
Estudiante:
  Email: estudiante@prediversa.com
  Password: estudiante123
  Role: Estudiante

Administrador:
  Email: admin@prediversa.com
  Password: admin123
  Role: Administrador

Colaborador:
  Email: colaborador@prediversa.com
  Password: colaborador123
  Role: Colaboradores
```

## 📡 API Endpoints

### Login
```
POST /api/auth/login

Request:
{
  "email": "string",
  "password": "string"
}

Response (200):
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "number",
    "email": "string",
    "name": "string",
    "role": "string"
  }
}
```

### Health Check
```
GET /api/health

Response (200):
{
  "status": "Backend funcionando"
}
```

## 🎯 Rutas de la Aplicación

| Ruta | Descripción | Protegida |
|------|-------------|-----------|
| `/` | Página de inicio | No |
| `/student` | Dashboard estudiante | Sí |
| `/admin` | Dashboard administrador | Sí |
| `/collaborator` | Dashboard colaborador | Sí |

## ⚙️ Configuración de Entorno

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_prediversa_123
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 📚 Documentación Completa

Ver [DESCRIPCION_PROYECTO.md](./DESCRIPCION_PROYECTO.md) para documentación exhaustiva:
- Arquitectura detallada
- Ejemplos de código
- Roadmap de desarrollo
- Plan de seguridad
- Estrategia de migración a AWS RDS
- Análisis de costos

## 🤖 Chatbot

### Instancia Pública (Homepage)
- **URL**: https://cdn.botpress.cloud/webchat/v3.5/inject.js
- **Visible**: En ruta `/` sin autenticación
- **Propósito**: Soporte general para visitantes

### Instancia Estudiante (Dashboard)
- **URL**: https://cdn.botpress.cloud/webchat/v3.5/inject.js
- **Visible**: En ruta `/student` con autenticación
- **Propósito**: Soporte especializado para estudiantes

## ✅ Testing Manual

1. **Acceder a homepage**: http://localhost:5173
2. **Verificar chatbot público**: Debe aparecer burbuja flotante
3. **Hacer login**: Usar credenciales de estudiante
4. **Verificar redirección**: Debe ir a StudentDashboard
5. **Verificar chatbot estudiante**: Instancia diferente
6. **Logout**: Debe volver a homepage

## 🔄 Flujo de Desarrollo

```
1. Backend: npm run dev      → http://localhost:5000
2. Frontend: npm run dev     → http://localhost:5173
3. Navegador: http://localhost:5173
4. Desarrollar y guardar archivos
5. Hot reload automático (Nodemon + Vite)
```

## 📦 Build para Producción

### Frontend
```bash
cd frontend
npm run build      # Genera carpeta dist/
npm run preview    # Previsualizar build
```

### Backend
```bash
cd backend
npm start          # Ejecutar sin Nodemon
```

## 🚀 Deployment (Próximamente)

- [ ] AWS RDS (Base de datos)
- [ ] AWS EC2 o Lambda (Backend)
- [ ] AWS S3 + CloudFront (Frontend)
- [ ] Docker containerization
- [ ] CI/CD pipeline

## 🔒 Seguridad

**Implementado**:
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Input validation
- ✅ CORS headers

**Pendiente (v1.1)**:
- ⏳ bcryptjs password hashing
- ⏳ 2FA implementation
- ⏳ OAuth2 integration
- ⏳ Rate limiting

## 📝 Roadmap

### v1.1 (Seguridad)
- Implementar bcryptjs
- Migrar a AWS RDS
- Refresh tokens
- Email confirmation

### v1.2 (Funcionalidades)
- 2FA
- OAuth2 (Google, GitHub)
- Dashboard completo
- Sistema de notificaciones

### v2.0 (Expansión)
- Videoconferencias
- Pago online (Stripe)
- Mobile app (React Native)
- GraphQL API

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nombre-feature`)
3. Commit tus cambios (`git commit -m 'Add feature'`)
4. Push a la rama (`git push origin feature/nombre-feature`)
5. Abre un Pull Request

## 📞 Soporte

Para soporte técnico: support@prediversa.com

## 📄 Licencia

Propietaria - Todos los derechos reservados © PrediVersa 2026

## 👨‍💻 Autores

- **PrediVersa Development Team**

---

**Versión**: 1.0.0  
**Última actualización**: 4 de febrero de 2026  
**Estado**: MVP Funcional ✅
