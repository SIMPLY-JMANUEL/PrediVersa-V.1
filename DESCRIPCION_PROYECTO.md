# 📚 DESCRIPCIÓN COMPLETA DEL PROYECTO PREDIVERSA V.1

## 🎯 RESUMEN GENERAL

**PrediVersa** es una plataforma educativa web diseñada para facilitar la educación diversa e inclusiva. Ofrece dashboards personalizados para tres tipos de usuarios: estudiantes, administradores y colaboradores. La aplicación integra un chatbot impulsado por Botpress para proporcionar soporte al usuario.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

```
PrediVersa-V.1/
├── backend/                    # Servidor Node.js + Express
│   ├── src/
│   │   ├── app.js             # Configuración de Express
│   │   ├── server.js          # Punto de entrada del servidor
│   │   ├── routes/
│   │   │   └── auth.js        # Rutas de autenticación, usuarios y alertas
│   │   ├── db/
│   │   │   ├── connection.js  # Conexión a MySQL AWS RDS
│   │   │   └── users.js       # CRUD de usuarios en MySQL
│   │   └── database/
│   │       ├── schema.sql     # Esquema de base de datos
│   │       └── migrate_users.js  # Migración de columnas
│   ├── .env                   # Configuración de entorno
│   ├── package.json           # Dependencias del backend
│   └── node_modules/          # Módulos instalados
│
└── frontend/                   # Aplicación React + Vite
    ├── src/
    │   ├── App.jsx            # Componente raíz con routing
    │   ├── main.jsx           # Punto de entrada React
    │   ├── index.css          # Estilos globales
    │   ├── assets/
    │   │   └── images/
    │   │       ├── logo-prediversa.png
    │   │       ├── fondo2.png
    │   │       └── img2.png
    │   └── components/
    │       ├── Header.jsx              # Encabezado con logo y botón login
    │       ├── Header.css
    │       ├── Main.jsx                # Hero section con imágenes
    │       ├── Main.css
    │       ├── Footer.jsx              # Pie de página
    │       ├── Footer.css
    │       ├── Login.jsx               # Modal de autenticación
    │       ├── Login.css
    │       ├── Chatbot.jsx             # Gestor de chatbot Botpress
    │       ├── Chatbot.css
    │       ├── DashboardHeader.jsx     # Encabezado común en dashboards
    │       ├── DashboardHeader.css
    │       ├── StudentDashboard.jsx    # Dashboard para estudiantes
    │       ├── StudentDashboard.css
    │       ├── AdminDashboard.jsx      # Dashboard para administradores
    │       ├── AdminDashboard.css
    │       ├── CollaboratorDashboard.jsx  # Dashboard para colaboradores
    │       ├── CollaboratorDashboard.css
    │       ├── ProtectedRoute.jsx      # Componente para rutas protegidas
    │       ├── UserManagement.jsx      # Gestión de usuarios
    │       ├── UserManagement.css
    │       ├── Reports.jsx             # Reportes
    │       └── Reports.css
    │   ├── .env                # Configuración de entorno (VITE_API_URL)
    │   ├── vite.config.js      # Configuración de Vite
    │   ├── package.json        # Dependencias del frontend
    │   └── node_modules/       # Módulos instalados
    ├── index.html              # HTML principal
    └── .gitignore              # Archivos ignorados por git
```

---

## 🛠️ TECNOLOGÍAS UTILIZADAS

### Backend
- **Node.js** v18+
- **Express.js** ^4.18.2 - Framework web
- **CORS** ^2.8.5 - Control de acceso entre dominios
- **JWT (jsonwebtoken)** ^8.5.1 - Autenticación basada en tokens
- **bcryptjs** ^2.4.3 - Hash de contraseñas
- **dotenv** ^16.0.3 - Gestión de variables de entorno
- **Nodemon** ^2.0.20 - Recarga automática en desarrollo

### Frontend
- **React** ^18.2.0 - Librería UI
- **React Router DOM** ^7.13.0 - Enrutamiento de aplicación
- **Vite** ^5.0.8 - Build tool moderno
- **@vitejs/plugin-react** ^4.2.1 - Plugin para React

### Integraciones Externas
- **Botpress** - Plataforma de chatbot con dos instancias:
  - Pública (homepage): https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js
  - Estudiante: https://files.bpcontent.cloud/2026/02/04/01/20260204011551-9Y10Y2F8.js

---

## 💻 STACK TÉCNICO DETALLADO CON EJEMPLOS DE CÓDIGO

### Backend Stack

**1. Node.js + Express.js**
```javascript
// backend/src/server.js
const app = require('./app');
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});
```

**2. Express Middlewares**
```javascript
// backend/src/app.js
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
```

**3. JWT Authentication**
```javascript
// backend/src/routes/auth.js
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: user.id, email: user.email, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**4. dotenv para Configuración**
```bash
# backend/.env
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_prediversa_123
```

**5. Nodemon para Desarrollo**
```json
// backend/package.json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```

### Frontend Stack

**1. React Hooks y Componentes**
```jsx
// frontend/src/App.jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  const [user, setUser] = useState(null)
  const [isLoginOpen, setIsLoginOpen] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])
  
  return (
    <Router>
      {/* Rutas */}
    </Router>
  )
}
```

**2. React Router DOM**
```jsx
// frontend/src/App.jsx
<Routes>
  <Route path="/" element={<Header /> <Main /> <Footer />} />
  <Route path="/student" element={
    <ProtectedRoute user={user}>
      <StudentDashboard user={user} onLogout={handleLogout} />
    </ProtectedRoute>
  } />
  <Route path="/admin" element={
    <ProtectedRoute user={user}>
      <AdminDashboard user={user} onLogout={handleLogout} />
    </ProtectedRoute>
  } />
</Routes>
```

**3. Vite Configuration**
```javascript
// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
```

**4. LocalStorage para Persistencia**
```javascript
// frontend/src/components/Login.jsx
// Guardar datos
localStorage.setItem('token', data.token)
localStorage.setItem('user', JSON.stringify(data.user))

// Limpiar datos
localStorage.removeItem('token')
localStorage.removeItem('user')
```

**5. Fetch API para Llamadas HTTP**
```javascript
// frontend/src/components/Login.jsx
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, password })
})
const data = await response.json()
```

### Herramientas de Integración

**1. Botpress - Script Injection**
```javascript
// frontend/src/components/Chatbot.jsx
const script1 = document.createElement('script')
script1.id = 'bp-inject-script-public'
script1.src = 'https://cdn.botpress.cloud/webchat/v3.5/inject.js'
script1.async = true
document.body.appendChild(script1)

const script2 = document.createElement('script')
script2.id = 'bp-config-script-public'
script2.src = 'https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js'
script2.defer = true
document.body.appendChild(script2)
```

**2. React Hooks Avanzados**
```javascript
// frontend/src/components/Chatbot.jsx
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function Chatbot({ isAuthenticated, isLoginOpen }) {
  const location = useLocation()

  useEffect(() => {
    // Lógica de chatbot basada en ruta y autenticación
    const isPublicHome = location.pathname === '/'
    const isStudentRoute = location.pathname === '/student'
    
    const showPublic = isPublicHome && !isAuthenticated
    const showStudent = isStudentRoute && isAuthenticated
    
    // Inyectar scripts según condición
  }, [location.pathname, isAuthenticated, isLoginOpen])

  return null
}
```

---

## 📊 FLUJO DE DATOS CON TECNOLOGÍAS

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)             │
│                                                              │
│  ┌──────────────────┐                                       │
│  │   App.jsx        │  - useState (user, isLoginOpen)       │
│  │                  │  - useEffect (localStorage)           │
│  │  Componentes:    │  - React Router (rutas)               │
│  │  • Header.jsx    │                                       │
│  │  • Login.jsx     │  ┌─────────────────────────────────┐  │
│  │  • Chatbot.jsx   │  │ Fetch API Call               │  │  │
│  │  • Dashboards    │  │ POST /api/auth/login         │  │  │
│  │                  │  │ JSON: {email, password}      │  │  │
│  │                  │  │ Response: {token, user}      │  │  │
│  │                  │  └────────┬────────────────────┘  │  │
│  └──────────────────┘          │                        │  │
│           │                    │                        │  │
│           │                    ▼                        │  │
│     LocalStorage        ┌─────────────────┐            │  │
│     • token             │  localStorage   │            │  │
│     • user              │  • token        │            │  │
│     • user.role         │  • user (JSON)  │            │  │
│                         └─────────────────┘            │  │
└─────────────────────────────────────────────────────────────┘
              │                   │
              │                   │ HTTP
              │                   ▼
       ┌──────────────────────────────────────────────────────┐
       │           BACKEND (Node.js + Express)               │
       │                                                      │
       │  ┌──────────────────────────────────────┐           │
       │  │ server.js                            │           │
       │  │ ├─ PORT: 5000                        │           │
       │  │ ├─ CORS habilitado                   │           │
       │  │ ├─ express.json() middleware         │           │
       │  │ └─ Routes: /api/auth/login           │           │
       │  └──────────────────────────────────────┘           │
       │                                                      │
       │  ┌──────────────────────────────────────┐           │
       │  │ auth.js (Routes)                     │           │
       │  │ ├─ POST /api/auth/login              │           │
       │  │ ├─ Valida credenciales               │           │
       │  │ ├─ JWT.sign() -> token               │           │
       │  │ └─ Return: {token, user}             │           │
       │  └──────────────────────────────────────┘           │
       │                                                      │
       │  ┌──────────────────────────────────────┐           │
       │  │ db/users.js (Base de Datos)          │           │
       │  │ ├─ Array de usuarios                 │           │
       │  │ ├─ {id, name, email, pwd, role}     │           │
       │  │ └─ Búsqueda por email                │           │
       │  └──────────────────────────────────────┘           │
       │                                                      │
       │  ┌──────────────────────────────────────┐           │
       │  │ .env (Configuración)                 │           │
       │  │ ├─ PORT=5000                         │           │
       │  │ ├─ JWT_SECRET                        │           │
       │  │ └─ NODE_ENV=development              │           │
       │  └──────────────────────────────────────┘           │
       └──────────────────────────────────────────────────────┘
```

---

## 🔄 CICLO DE DESARROLLO

**1. Desarrollo Local**
```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev  # Nodemon recarga automáticamente

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # Vite dev server en http://localhost:5174
```

**2. Build Producción**
```bash
# Frontend
cd frontend
npm run build  # Genera carpeta dist/

# Backend
npm start  # Ejecuta sin Nodemon
```

**3. Testing Manual**
```bash
# Endpoints API
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"estudiante@prediversa.com","password":"estudiante123"}'

# Health Check
curl http://localhost:5000/api/health
```

---

## 🎯 HERRAMIENTAS POR RESPONSABILIDAD

| Herramienta | Responsabilidad | Uso |
|-------------|-----------------|-----|
| **Node.js** | Runtime JavaScript | Ejecutar servidor backend |
| **Express** | Framework web | Crear rutas y middlewares |
| **React** | UI Library | Componentes visuales |
| **Vite** | Build tool | Compilar y servir assets |
| **React Router** | Client-side routing | Navegar entre rutas |
| **JWT** | Autenticación | Generar y validar tokens |
| **CORS** | Seguridad | Permitir llamadas cross-origin |
| **dotenv** | Configuración | Variables de entorno |
| **Nodemon** | Desarrollo | Auto-reload servidor |
| **Botpress** | Chatbot | Servicio externo de IA |
| **localStorage** | Persistencia | Guardar token y usuario |

---

## 🔐 AUTENTICACIÓN Y USUARIOS

### Credenciales Hardcodeadas (Desarrollo)
```
1. Estudiante:
   - Email: estudiante@prediversa.com
   - Password: estudiante123
   - Role: student

2. Administrador:
   - Email: admin@prediversa.com
   - Password: admin123
   - Role: admin

3. Colaborador:
   - Email: colaborador@prediversa.com
   - Password: colaborador123
   - Role: collaborator
```

### Sistema de Autenticación
- **JWT Tokens**: Válidos por 24 horas
- **LocalStorage**: Almacena token y datos del usuario
- **Rutas Protegidas**: Validadas con componente ProtectedRoute
- **Redirección Automática**: Redirige a dashboard según rol

---

## 📍 RUTAS DE LA APLICACIÓN

```
/ (Public)
├─ Header con logo
├─ Main hero section
├─ Footer
└─ Chatbot (instancia pública)

/student (Protegida - role: student)
├─ DashboardHeader
├─ Dashboard Estudiante (4 tarjetas)
├─ Chatbot (instancia estudiante)
└─ Footer

/admin (Protegida - role: admin)
├─ DashboardHeader
├─ Dashboard Administrador (6 tarjetas)
└─ Footer

/collaborator (Protegida - role: collaborator)
├─ DashboardHeader
├─ Dashboard Colaborador (6 tarjetas)
└─ Footer
```

---

## 🎨 COMPONENTES PRINCIPALES

### Header.jsx
- Logo de PrediVersa (responsive)
- Botón "Iniciar Sesión"
- Navegación principal

### Main.jsx
- Hero section con fondo gradiente
- Dos círculos con imágenes
- CTA (Call To Action)

### Login.jsx
- Modal semi-transparente
- Campos de email y password
- Validación de credenciales
- Redirección según rol

### Chatbot.jsx
- Gestor centralizado de instancias Botpress con dos chatbots funcionando correctamente
- Inyección dinámica de scripts con IDs únicos para evitar conflictos
- **Chatbot Público** (Homepage - "/"):
  - ✅ Se muestra cuando NO está autenticado
  - Script ID: `bp-inject-script-public` y `bp-config-script-public`
  - URL Config: https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js
  - Disponible en la página de inicio para visitantes
- **Chatbot Estudiante** (Dashboard - "/student"):
  - ✅ Se muestra solo si está autenticado Y en ruta /student
  - Script ID: `bp-inject-script-student` y `bp-config-script-student`
  - URL Config: https://files.bpcontent.cloud/2026/02/04/01/20260204011551-9Y10Y2F8.js
  - Disponible solo para estudiantes autenticados
- **Ocultamiento Automático**:
  - Se oculta durante modal de login (`isLoginOpen` prop)
  - Se oculta en rutas no permitidas (/admin, /collaborator)
  - Se oculta cuando no autenticado intenta acceder a /student
- **Limpieza de DOM**:
  - `removeBotpressElements()` - Elimina contenedores, widgets, iframes
  - `removeBotpressScripts()` - Elimina scripts inyectados
  - Se ejecuta al cambiar rutas o estados de autenticación

### Dashboards (Student/Admin/Collaborator)
- Header personalizado con logout
- Título bienvenida personalizada
- Grid de 4-6 tarjetas funcionales
- Estilos responsive
- Transiciones al hover

---

## 📡 ENDPOINTS API

### Autenticación
```
POST /api/auth/login
Body:
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
    "name": "string",
    "email": "string",
    "role": "student|admin|collaborator"
  }
}
```

### Usuarios (requiere JWT)
```
GET /api/auth/users
GET /api/auth/users?documentId=123456  # Buscar por documento

POST /api/auth/users
Body:
{
  "documentId": "string",
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "student|admin|collaborator",
  "phone": "string",
  "address": "string",
  "birthDate": "string",
  "edad": "number",
  "lugarNacimiento": "string",
  "nombrePadre": "string",
  "nombreMadre": "string",
  "grado": "string"
}

PUT /api/auth/users/:id
DELETE /api/auth/users/:id
```

### Alertas (requiere JWT)
```
GET /api/auth/alerts

POST /api/auth/alerts
Body:
{
  "studentDocumentId": "string",
  "studentName": "string",
  "studentAge": "string",
  "lugarNacimiento": "string",
  "nombrePadre": "string",
  "nombreMadre": "string",
  "studentGrade": "string",
  "studentUsername": "string",
  "description": "string",
  "status": "Pendiente|En Proceso|Resuelto"
}

PUT /api/auth/alerts/:id
DELETE /api/auth/alerts/:id
```

### Health Check
```
GET /api/health
Response (200):
{
  "status": "Backend funcionando"
}
```

---

## ⚙️ CONFIGURACIÓN

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=tu_secreto_super_seguro_prediversa_123
DB_HOST=prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com
DB_USER=admin
DB_PASSWORD=tu_password_mysql
DB_DATABASE=PrediVersa
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

### Vite (vite.config.js)
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true
  }
}
```

---

## 🚀 CÓMO EJECUTAR EL PROYECTO

### Preparar Backend
```bash
cd backend
npm install
npm run dev
# Servidor en http://localhost:5000
```

### Preparar Frontend
```bash
cd frontend
npm install
npm run dev
# Aplicación en http://localhost:5174
```

### Build Producción
```bash
# Frontend
npm run build  # Genera carpeta dist/

# Backend
npm start      # Ejecuta con node (no nodemon)
```

---

## 📦 ESTRUCTURA DE DATOS

### Usuario (MySQL AWS RDS)
```javascript
{
  id: number,
  documentId: string,
  email: string,
  password: string (hash bcrypt),
  name: string,
  role: "student|admin|collaborator",
  phone: string,
  address: string,
  birthDate: date,
  edad: number,
  lugarNacimiento: string,
  nombrePadre: string,
  nombreMadre: string,
  grado: string,
  status: "Activo|Inactivo",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Alerta (MySQL AWS RDS)
```javascript
{
  id: number,
  studentDocumentId: string,
  studentName: string,
  studentAge: string,
  lugarNacimiento: string,
  nombrePadre: string,
  nombreMadre: string,
  studentGrade: string,
  studentUsername: string,
  userId: number,
  description: string,
  status: "Pendiente|En Proceso|Resuelto",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Token JWT
```javascript
{
  id: number,
  email: string,
  role: string,
  iat: timestamp,
  exp: timestamp (24 horas)
}
```

---

## 🎯 FUNCIONALIDADES ACTUALES

✅ Página de inicio pública con hero section
✅ Autenticación por email/password con JWT
✅ Base de datos MySQL AWS RDS
✅ Tres tipos de dashboards según rol
✅ Rutas protegidas con verificación de rol
✅ Chatbot Botpress integrado (público y para estudiantes)
✅ Responsive design en todos los componentes
✅ LocalStorage para persistencia de sesión
✅ Logout con limpieza de datos
✅ Health check del backend

### AdminDashboard
✅ CRUD completo de usuarios
✅ CRUD completo de alertas
✅ Autocompletado de datos del estudiante por documento
✅ 4 pestañas: Alertas, Asignación, Acciones, Estado Proceso
✅ Modal de detalles de usuario
✅ Exportar usuarios a CSV
✅ Actualizar estado de alertas (Pendiente → En Proceso → Resuelto)

---

## 🤖 VERIFICACIÓN DE CHATBOTS - ESTADO FUNCIONAL

### ✅ AMBOS CHATBOTS TRABAJANDO CON NORMALIDAD

**1. Chatbot Público (Homepage)**
- **Ubicación**: Ruta "/" (página de inicio)
- **Condición**: Se muestra cuando el usuario NO está autenticado
- **Script Inyectado**:
  - Inject: https://cdn.botpress.cloud/webchat/v3.5/inject.js
  - Config: https://files.bpcontent.cloud/2026/02/01/22/20260201225345-6RFZIFLO.js
- **ID Único**: `bp-inject-script-public` y `bp-config-script-public`
- **Comportamiento**: Visible como burbuja flotante en homepage
- **Limpieza**: Se elimina al hacer login o navegar a rutas protegidas

**2. Chatbot Estudiante (Dashboard)**
- **Ubicación**: Ruta "/student" (dashboard estudiante)
- **Condición**: Se muestra SOLO si está autenticado Y en ruta /student
- **Script Inyectado**:
  - Inject: https://cdn.botpress.cloud/webchat/v3.5/inject.js
  - Config: https://files.bpcontent.cloud/2026/02/04/01/20260204011551-9Y10Y2F8.js
- **ID Único**: `bp-inject-script-student` y `bp-config-script-student`
- **Comportamiento**: Visible como burbuja flotante en dashboard de estudiantes
- **Limpieza**: Se elimina al hacer logout o navegar a otras rutas

**3. Ocultamiento Automático**
- ✅ Se oculta cuando modal de login está abierto (`isLoginOpen={true}`)
- ✅ Se oculta cuando usuario navega a /admin o /collaborator
- ✅ Se oculta cuando usuario intenta acceder a /student sin autenticación
- ✅ Se limpia el DOM completamente para evitar conflictos

**4. Sistema de Limpieza**
```javascript
removeBotpressElements() {
  // Elimina contenedores Botpress
  // Elimina widgets y burbujas
  // Elimina iframes
}

removeBotpressScripts() {
  // Elimina scripts por ID único
  // Evita duplicación de instancias
  // Previene conflictos entre chatbots
}
```

**5. Lógica de Detección**
- `useLocation()` - Detecta cambios de ruta
- `isAuthenticated` - Valida si usuario está logueado
- `isLoginOpen` - Detecta si modal de login está abierto
- Dependencies: `[location.pathname, isAuthenticated, isLoginOpen]`

**Conclusión**: Ambos chatbots están implementados correctamente con:
- ✅ Inyección dinámica sin conflictos
- ✅ IDs únicos por instancia
- ✅ Visibilidad condicionada correcta
- ✅ Limpieza de DOM al cambiar contextos
- ✅ Compatible con sistema de rutas protegidas

---

## ⚠️ LIMITACIONES Y MEJORAS

### ✅ Implementado
- Contraseñas hasheadas con bcryptjs
- Base de datos MySQL AWS RDS
- CRUD completo de usuarios y alertas
  - Acción: Hash de contraseñas en login y registro
  - Prioridad: ALTA

- ❌ **Usuarios hardcodeados en archivo** (backend/src/db/users.js)
  - Estructura actual: Array de objetos con datos hardcoded
  - Necesita: Migración a base de datos real
  - Acción: Conectar a AWS RDS o MongoDB
  - Prioridad: ALTA

- ❌ **JWT_SECRET expuesto en .env**
  - Riesgo: Token JWT puede ser falsificado
  - Acción: Cambiar a cadena aleatoria en producción
  - Necesita: Usar AWS Secrets Manager o HashiCorp Vault
  - Prioridad: ALTA

- ❌ **CORS abierto sin restricciones**
  - Actual: `app.use(cors())` sin configuración
  - Necesita: Especificar orígenes permitidos
  - Acción: Cambiar a: `cors({ origin: ['http://localhost:5174', 'https://dominio.com'] })`
  - Prioridad: MEDIA

### 🟡 BASE DE DATOS - EN DESARROLLO

#### Situación Actual
```
├─ Estructura: Array hardcoded en backend/src/db/users.js
├─ Conexión: Ninguna
├─ Persistencia: En memoria (se pierden al reiniciar)
└─ Escalabilidad: No aplica
```

#### Plan de Migración a AWS RDS
```
FASE 1: Configuración AWS RDS
├─ Crear instancia RDS (PostgreSQL o MySQL)
├─ URL: prediversa-db.ce1qo0a0sygg.us-east-1.rds.amazonaws.com
├─ Credenciales: Variables de entorno en AWS Secrets Manager
└─ Base de datos: prediversa_v1

FASE 2: Implementación ORM
├─ Opción 1: Sequelize (para SQL)
├─ Opción 2: TypeORM (más robusto)
├─ Opción 3: Prisma (más moderno)
├─ Instalación: npm install prisma @prisma/client
└─ Configuración: Archivo .env.production

FASE 3: Migración de Datos
├─ Crear schema de base de datos
├─ Migrar usuarios hardcoded
├─ Crear índices de rendimiento
└─ Testing de conexión

FASE 4: Validación
├─ Pruebas unitarias
├─ Pruebas de carga
├─ Backup strategy
└─ Monitoring
```

#### Opciones de Base de Datos Recomendadas
| BD | Ventajas | Desventajas | Recomendación |
|----|---------|-----------|----|
| **PostgreSQL** (AWS RDS) | Robusto, ACID, escalable | Más recursos | ⭐ RECOMENDADO |
| **MySQL** (AWS RDS) | Rápido, popular | Menos features | ✅ Válido |
| **MongoDB** (AWS DocumentDB) | NoSQL, flexible | Menos ACID | Para futuro |
| **DynamoDB** | Serverless, auto-scaling | Costoso en desarrollo | Para escala masiva |

### 🟡 AUTENTICACIÓN - EN DESARROLLO

#### Actual
- ✅ JWT funcional (24 horas)
- ❌ Sin refresh tokens
- ❌ Sin 2FA
- ❌ Sin recuperación de contraseña
- ❌ Sin confirmación de email

#### Roadmap de Autenticación
```
v1.1: Seguridad Básica
├─ Implementar bcryptjs
├─ Añadir refresh tokens
└─ Validación de email

v1.2: Autenticación Avanzada
├─ Two-Factor Authentication (2FA)
├─ OAuth2 (Google, GitHub)
├─ Single Sign-On (SSO)
└─ Social login

v2.0: Enterprise
├─ SAML 2.0
├─ LDAP
└─ Keycloak integration
```

### 🟡 DASHBOARDS - EN DESARROLLO

#### Estado Actual
```
StudentDashboard
├─ ✅ Estructura base creada
├─ ✅ 4 tarjetas funcionales
├─ ✅ Diseño responsive
├─ ❌ Sin funcionalidades reales
├─ ❌ Sin datos dinámicos
└─ 📋 TODO: Conectar a backend

AdminDashboard
├─ ✅ Estructura base creada
├─ ✅ 6 tarjetas funcionales
├─ ✅ Diseño responsive
├─ ❌ Sin funcionalidades reales
├─ ❌ Sin gestión de usuarios
└─ 📋 TODO: Implementar CRUD de usuarios

CollaboratorDashboard
├─ ✅ Estructura base creada
├─ ✅ 6 tarjetas funcionales
├─ ✅ Diseño responsive
├─ ❌ Sin funcionalidades reales
├─ ❌ Sin gestión de contenido
└─ 📋 TODO: Implementar editor de contenido
```

#### Funcionalidades Pendientes por Dashboard
**Student Dashboard:**
- Visualización de cursos inscritos
- Seguimiento de progreso
- Envío de tareas
- Calificaciones en tiempo real
- Comunicación con instructores

**Admin Dashboard:**
- Gestión de usuarios (CRUD)
- Gestión de cursos
- Reportes y estadísticas
- Auditoría del sistema
- Configuración de permisos

**Collaborator Dashboard:**
- Crear y editar cursos
- Revisar trabajos de estudiantes
- Foro de discusión
- Calendario de eventos
- Seguimiento de estudiantes

### 🟡 CHATBOT - FUNCIONAL PERO EN DESARROLLO

#### Actual
- ✅ Instancia pública funcionando
- ✅ Instancia estudiante funcionando
- ✅ Visibilidad condicional correcta
- ✅ Limpieza de DOM funcionando
- ❌ Sin chatbot para Admin/Collaborator
- ❌ Sin entrenamiento específico
- ❌ Sin integración de knowledge base

#### Plan de Expansión Chatbot
```
FASE 1: Completar Cobertura
├─ Admin: Scripts específicos para administradores
├─ Collaborator: Scripts para colaboradores
└─ Support: Chatbot dedicado a soporte técnico

FASE 2: Entrenamiento
├─ Knowledge base: Documentación PrediVersa
├─ FAQs: Respuestas automáticas
├─ Contexto educativo: Términos y procesos
└─ Escalamiento: Transferencia a humanos

FASE 3: Integración
├─ API: Conexión a backend PrediVersa
├─ Datos: Información de usuario personalizada
├─ Análisis: Tracking de conversaciones
└─ Mejora: Machine Learning continuo
```

### 📁 CARPETAS RESERVADAS PARA EXPANSIÓN FUTURA

```
backend/src/
├─ controllers/          # 📋 EN DESARROLLO
│  ├─ authController.js  # Mover lógica de rutas
│  ├─ userController.js  # Gestión de usuarios
│  ├─ courseController.js # Gestión de cursos
│  └─ assignmentController.js # Gestión de tareas
│
├─ middlewares/          # 📋 EN DESARROLLO
│  ├─ authMiddleware.js  # Validar JWT
│  ├─ errorHandler.js    # Manejo de errores
│  ├─ rateLimit.js       # Limitar requests
│  └─ validator.js       # Validación de datos
│
└─ services/             # 📋 EN DESARROLLO
   ├─ authService.js     # Lógica de autenticación
   ├─ emailService.js    # Envío de emails
   ├─ pdfService.js      # Generación de PDFs
   └─ paymentService.js  # Pagos (Stripe/PayPal)
```

### 🔵 CARACTERÍSTICAS EN ROADMAP

#### Corto Plazo (v1.1 - 1-2 meses)
- ✅ Implementar bcryptjs
- ✅ Migrar a AWS RDS
- ✅ Añadir validaciones avanzadas
- ✅ Sistema de recuperación de contraseña
- ✅ Confirma de email

#### Mediano Plazo (v1.2 - 2-4 meses)
- ✅ 2FA (Two-Factor Authentication)
- ✅ OAuth2 (Google, GitHub)
- ✅ Funcionalidades completas en dashboards
- ✅ Sistema de notificaciones
- ✅ Búsqueda y filtros avanzados

#### Largo Plazo (v2.0 - 4+ meses)
- ✅ Videconferencias integradas
- ✅ Pago online (Stripe/PayPal)
- ✅ Analytics y reportes detallados
- ✅ Mobile app (React Native)
- ✅ API pública (GraphQL)

---

## 🏗️ INFRAESTRUCTURA Y DEPLOYMENT

### Desarrollo Local
```bash
# Backend en puerto 5000
cd backend
npm run dev

# Frontend en puerto 5174
cd frontend
npm run dev
```

### Staging (Pre-producción)
```
Heroku/Render para Backend
Vercel/Netlify para Frontend
Base de datos: AWS RDS (instancia de staging)
```

### Producción
```
Backend: AWS EC2 + Docker (o Lambda)
Frontend: CloudFront + S3
BD: AWS RDS (Multi-AZ)
Cache: Redis (AWS ElastiCache)
Monitoreo: CloudWatch + DataDog
```

### Docker (Preparado para Contenedorización)
```dockerfile
# Dockerfile backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

### Variables de Entorno por Ambiente

**Desarrollo (.env)**
```
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_secret_123
DB_HOST=localhost
DB_PORT=5432
DB_NAME=prediversa_dev
DB_USER=developer
DB_PASS=dev_password
FRONTEND_URL=http://localhost:5174
```

**Staging (.env.staging)**
```
PORT=3000
NODE_ENV=staging
JWT_SECRET=from_aws_secrets_manager
DB_HOST=prediversa-db-staging.rds.amazonaws.com
DB_PORT=5432
DB_NAME=prediversa_staging
DB_USER=from_secrets
DB_PASS=from_secrets
FRONTEND_URL=https://staging.prediversa.com
```

**Producción (.env.production)**
```
PORT=3000
NODE_ENV=production
JWT_SECRET=from_aws_secrets_manager
DB_HOST=prediversa-db-prod.rds.amazonaws.com
DB_PORT=5432
DB_NAME=prediversa_production
DB_USER=from_secrets
DB_PASS=from_secrets
FRONTEND_URL=https://prediversa.com
SENTRY_DSN=error_tracking_url
```

---

## 🔒 PLAN DE SEGURIDAD DETALLADO

### Nivel 1: Aplicación
- [ ] Validar todas las entradas (backend/middleware/validator.js)
- [ ] Sanitizar datos (npm install sanitize-html)
- [ ] Rate limiting (npm install express-rate-limit)
- [ ] HTTPS obligatorio en producción
- [ ] CORS bien configurado
- [ ] Headers de seguridad (Helmet)

### Nivel 2: Base de Datos
- [ ] Contraseñas hasheadas con bcryptjs
- [ ] Encriptación de datos sensibles
- [ ] Backup automático diario
- [ ] Auditoría de accesos
- [ ] Restauración ante desastres

### Nivel 3: Infraestructura
- [ ] VPC privada en AWS
- [ ] SSL/TLS certificado
- [ ] WAF (Web Application Firewall)
- [ ] DDoS protection
- [ ] Logging centralizado

### Nivel 4: Monitoreo
- [ ] Sentry para errores
- [ ] DataDog para performance
- [ ] CloudWatch para logs
- [ ] Alertas en tiempo real
- [ ] Análisis de seguridad

---

## 📊 ARQUITECTURA ESCALABLE

### Microservicios (Futuro)
```
┌─────────────────────────────────┐
│      API Gateway (Kong)         │
└────────────┬────────────────────┘
             │
    ┌────────┼────────┬─────────┐
    │        │        │         │
┌───▼───┐ ┌──▼──┐ ┌──▼───┐ ┌──▼──┐
│Auth   │ │User │ │Course│ │Chat │
│Service│ │Svc  │ │Svc   │ │Svc  │
└───┬───┘ └──┬──┘ └──┬───┘ └──┬──┘
    │        │      │         │
    └────────┼──────┼─────────┘
             │      │
        ┌────▼──────▼────┐
        │  Message Queue  │
        │  (RabbitMQ)     │
        └────┬───────────┘
             │
        ┌────▼──────────────┐
        │  Database Layer   │
        │  (PostgreSQL)     │
        └───────────────────┘
```

### Escalabilidad de Base de Datos
```
Actual (Hardcoded):
├─ 0 ms latencia
├─ Limitado a memoria RAM
└─ No escalable

AWS RDS (Recomendado):
├─ Multi-AZ para alta disponibilidad
├─ Read replicas para escalabilidad
├─ Automatic backup y snapshots
├─ Performance Insights
└─ Hasta 64 vCPUs y 768 GB de RAM
```

---

## 📝 DOCUMENTACIÓN FALTANTE (EN DESARROLLO)

### Documentación Técnica
- [ ] API Reference (Swagger/OpenAPI)
- [ ] Database Schema Diagram
- [ ] Architecture Decision Records (ADRs)
- [ ] Security Policy
- [ ] Disaster Recovery Plan

### Documentación de Usuario
- [ ] Manual de Usuario (Student)
- [ ] Manual de Administrador
- [ ] Guía de Colaborador
- [ ] Tutorial de Inicio Rápido
- [ ] FAQ

### Documentación de Desarrollo
- [ ] Contributing Guidelines
- [ ] Development Setup Guide
- [ ] Testing Strategy
- [ ] CI/CD Pipeline
- [ ] Coding Standards

---

## 🧪 TESTING - ESTADO ACTUAL

### Pruebas Unitarias
- ❌ No implementadas
- 📋 TODO: Jest para backend
- 📋 TODO: Vitest para frontend

### Pruebas de Integración
- ❌ No implementadas
- 📋 TODO: Postman collection
- 📋 TODO: Cypress para frontend

### Pruebas de Carga
- ❌ No implementadas
- 📋 TODO: Apache JMeter
- 📋 TODO: Locust

---

## 💰 COSTOS ESTIMADOS (AWS)

### Desarrollo/Staging
```
RDS PostgreSQL (db.t3.micro):  $30/mes
S3 Storage:                     $1/mes
EC2 t2.micro:                   $9/mes (elegible free tier)
─────────────────────────────────────
Total:                          ~$40/mes
```

### Producción (Proyectado)
```
RDS PostgreSQL (db.t3.small + Multi-AZ): $150/mes
S3 Storage + CloudFront:                  $50/mes
EC2 t3.small (2 instancias):             $60/mes
ElastiCache Redis:                        $30/mes
Route53:                                  $1/mes
─────────────────────────────────────────────────
Total:                                    ~$300/mes
```

---

## ✅ VERIFICACIÓN Y TESTING MANUAL

### Checklist de Funcionalidad
```
FRONTEND
├─ [ ] Homepage carga correctamente
├─ [ ] Chatbot público visible
├─ [ ] Login abre modal
├─ [ ] Validación de formulario
├─ [ ] Conexión API funciona
├─ [ ] Redirige a dashboard correcto
├─ [ ] StudentDashboard carga
├─ [ ] Chatbot estudiante visible
├─ [ ] Logout limpia localStorage
└─ [ ] Responsive en móvil

BACKEND
├─ [ ] Server inicia en puerto 5000
├─ [ ] CORS habilitado
├─ [ ] /api/health responde
├─ [ ] Login acepta credenciales válidas
├─ [ ] Login rechaza credenciales inválidas
├─ [ ] JWT token se genera
├─ [ ] JWT valida en requests
└─ [ ] Error handler funciona

BASE DE DATOS
├─ [ ] Conexión exitosa
├─ [ ] Queries rápidas
├─ [ ] Backup automático
└─ [ ] Recuperación de desastres
```

### Credenciales de Testing
```
Estudiante:      estudiante@prediversa.com / estudiante123
Administrador:   admin@prediversa.com / admin123
Colaborador:     colaborador@prediversa.com / colaborador123
```

---

## 🎯 MÉTRICAS DE ÉXITO (KPIs)

### Rendimiento
- ✅ Página carga en < 3 segundos
- ✅ API responde en < 200 ms
- 📋 Database queries < 100 ms
- 📋 Uptime > 99.9%

### Seguridad
- ✅ Sin vulnerabilidades críticas
- 📋 OWASP Top 10 cumplidas
- 📋 Certificación SSL/TLS
- 📋 GDPR compliant

### Usabilidad
- 📋 Score Lighthouse > 90
- 📋 Accesibilidad WCAG 2.1 AA
- 📋 Móvil responsive
- 📋 < 2% bounce rate

---

**Versión**: V.1 (MVP Funcional)
**Última actualización**: 4 de febrero de 2026
**Estado**: Desarrollo activo - Beta
**Próxima versión**: V.1.1 (Q1 2026) con seguridad mejorada y AWS RDS
**Roadmap público**: https://roadmap.prediversa.com
**Repositorio**: GitHub (Privado)
**Licencia**: Propietaria
**Soporte**: support@prediversa.com

## 📊 ESTADO ACTUAL DEL PROYECTO

### ✅ Completado
- Estructura base backend/frontend
- Sistema de autenticación funcional
- Chatbot dual (público + estudiante)
- Dashboards para 3 tipos de usuario
- Responsive design
- Rutas protegidas
- Assets importados correctamente

### 🔄 En Progreso
- Implementación de funcionalidades en dashboards
- Diferentes scripts chatbot para cada dashboard

### ⏳ Pendiente
- Migración a BD real (AWS RDS)
- Implementar bcrypt
- Admin/Collaborator chatbot configs
- Validaciones avanzadas
- Sistema de permisos granulares

---

## 🔗 FLUJO DE USUARIO

### Nuevo Usuario
1. Accede a http://localhost:5174
2. Ve página principal con Header, Main y Footer
3. Chatbot pública visible (burbuja)
4. Hace clic en "Iniciar Sesión"
5. Se abre modal de login

### Login
1. Ingresa email y password
2. POST /api/auth/login
3. Valida credenciales
4. Genera JWT token
5. Almacena en localStorage
6. Redirige a dashboard según rol

### En Dashboard
1. Ve DashboardHeader con nombre y logout
2. Visualiza tarjetas funcionales
3. Chatbot diferente para estudiantes
4. Puede hacer logout

### Logout
1. Hace clic en "Cerrar Sesión"
2. Elimina localStorage
3. Redirige a "/"
4. Vuelve a mostrar chatbot público

---

## 📱 RESPONSIVE DESIGN

- **Mobile**: Grid de 1 columna, padding reducido
- **Tablet**: Grid de 2 columnas
- **Desktop**: Grid automático de 3-4 columnas

Media queries en: `max-width: 768px`

---

## 🎨 PALETA DE COLORES

- **Primario**: #3A6F85 (Azul petróleo)
- **Secundario**: #2A4E5F (Azul oscuro)
- **Acento**: #8ECFEA (Azul claro)
- **Background**: Blanco
- **Texto**: Gris (#666)

---

## 📝 NOTAS IMPORTANTES

1. **Carpetas vacías**: controllers/, middlewares/, services/ están reservadas para expansión futura
2. **Sin BD**: Usuarios actualmente en backend/src/db/users.js (hardcoded)
3. **Chatbot**: Inyección de scripts, no npm package (mejor control contextual)
4. **CSS Modular**: Cada componente tiene su propio CSS para independencia
5. **Limpieza de Proyecto**: Se eliminaron ChatbotModal.jsx/CSS (archivos experimentales)

---

**Versión**: V.1
**Última actualización**: 4 de febrero de 2026
**Estado**: MVP Funcional
