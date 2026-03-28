# PrediVersa V.1.1 🎓

Una plataforma educativa web premium diseñada para facilitar la educación diversa e inclusiva. Ofrece dashboards personalizados para estudiantes, administradores y colaboradores, con integración de chatbot inteligente impulsado por **Amazon Lex**.

## 🚀 Características Principales

- ✅ **Motor Híbrido IA (Categorías de Impacto)** - Detección inmediata mediante diccionario crítico + Amazon Bedrock (Claude 3.5).
- ✅ **Inteligencia Analítica v1.1** - Nuevo dashboard con gráficos dinámicos de tendencia (AreaChart), clima emocional (PieChart) y detección de focos críticos en tiempo real.
- ✅ **Seguridad "Zero Tolerance"** - Blindaje automático para alertas urgentes (SMS/Email) al detectar riesgo alto.
- ✅ **Dashboards Responsivos** - Interfaces específicas por rol optimizadas para Celulares, Tablets y Escritorio.
- ✅ **Chatbot Lex & Versa** - Integración de soporte pedagógico y bienestar con auto-enfoque permanente.
- ✅ **AWS RDS (MySQL)** - Persistencia robusta en la nube bajo infraestructura segura.
- ✅ **Limpieza de Producción** - Base de datos purificada y lista para lanzamiento profesional (v1.1.0).
- ✅ **Despliegue en la Nube** - Configurado para AWS App Runner y Render.

## 📋 Estructura del Proyecto

```
PrediVersa-V.1/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── app.js             # Configuración Express
│   │   ├── server.js          # Punto de entrada
│   │   ├── routes/            # Rutas (Auth, Chatbot, Stats)
│   │   ├── utils/             # Servicios (CentralAIService para Lex)
│   │   └── db/                # Conexión RDS y CRUD de usuarios
│   └── package.json
│
└── frontend/                   # React + Vite
    ├── src/
    │   ├── App.jsx            # Componente raíz & Routing
    │   ├── components/        # Componentes UI (Landing, Dashboards)
    │   ├── pages/             # Páginas corporativas (Modernizadas)
    │   └── assets/            # Multimedia y estilos
    └── package.json
```

## 🛠️ Stack Tecnológico

### Backend
- **Node.js** v18+
- **Express.js** 4.x
- **JWT** (jsonwebtoken) - Seguridad
- **bcryptjs** - Cifrado de contraseñas
- **AWS SDK** (Lex Runtime V2) - Integración IA
- **MySQL2** - Conector de Base de Datos

### Frontend
- **React** 18.x
- **React Router DOM** 7.x
- **Vite** - Herramienta de construcción
- **Vanilla CSS** - Estilos personalizados premium

### Infraestructura
- **AWS RDS** - Base de datos MySQL
- **AWS App Runner** - Hosting del Backend
- **Render** - Hosting del Frontend
- **Amazon Lex** - Inteligencia Artificial / Chatbot

## 🚀 Instalación y Ejecución

### Backend
```bash
cd backend
npm install
npm run dev
```
**Puerto**: http://localhost:5000

### Frontend
```bash
cd frontend
npm install
npm run dev
```
**Puerto**: http://localhost:5173

## 📚 Documentación Detallada

- [DESCRIPCION_PROYECTO.md](./DESCRIPCION_PROYECTO.md) - Arquitectura y especificaciones técnicas.
- [EVOLUCION_PREDIVERSA.md](./EVOLUCION_PREDIVERSA.md) - Roadmap y hitos alcanzados.
- [REPORTE_OFICIAL_PREDIVERSA.md](./REPORTE_OFICIAL_PREDIVERSA.md) - Resumen ejecutivo del proyecto.

## 🔒 Seguridad

- ✅ Hash de contraseñas con salt rounds de 10.
- ✅ Rutas protegidas por rol.
- ✅ Validación de tokens JWT.
- ✅ Variables de entorno protegidas.

---

**Versión:** `v1.1.0` | **Licencia:** `Propietaria` | **© 2026 PrediVersa**

**Autores:**
*Jmanuel Calvo/PrediVersa, Andrey Luna/PrediVersa, Harold Salcedo/PrediVersa*
**Departamento de Crecimiento Estratégico**
