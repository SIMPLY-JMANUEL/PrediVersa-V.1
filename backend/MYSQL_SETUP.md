# Configuración de MySQL para PrediVersa

Esta guía te ayudará a configurar la base de datos MySQL para el backend de PrediVersa, incluyendo la opción de usar AWS RDS.

## 📋 Requisitos Previos

- Node.js instalado
- MySQL 8.0+ instalado localmente (para desarrollo local) o una instancia AWS RDS
- Acceso a la consola de AWS (si usas RDS)

## 🚀 Opción 1: Configuración Local (Desarrollo)

### 1. Instalar MySQL

**Windows:**
```bash
# Descargar desde https://dev.mysql.com/downloads/installer/
# Ejecutar el instalador y seguir las instrucciones
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### 2. Crear la Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Dentro de MySQL
CREATE DATABASE prediversa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'prediversa_user'@'localhost' IDENTIFIED BY 'tu_password_seguro';
GRANT ALL PRIVILEGES ON prediversa.* TO 'prediversa_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Ejecutar el Script SQL

```bash
# Desde la carpeta backend
cd backend
mysql -u prediversa_user -p prediversa < database/schema.sql
```

### 4. Configurar Variables de Entorno

Crear archivo `.env` en la carpeta `backend`:

```env
PORT=5000
JWT_SECRET=tu_secreto_super_seguro_123

# Configuración MySQL Local
DB_HOST=localhost
DB_PORT=3306
DB_NAME=prediversa
DB_USER=prediversa_user
DB_PASSWORD=tu_password_seguro
DB_SSL=false
```

---

## ☁️ Opción 2: AWS RDS (Producción)

### 1. Crear Instancia RDS

1. **Acceder a AWS Console** → RDS → Create database
2. **Choose a database creation method:** Standard create
3. **Engine options:** MySQL 8.0
4. **Templates:** Free tier (para pruebas) o Production
5. **Settings:**
   - DB instance identifier: `prediversa-db`
   - Master username: `admin`
   - Master password: (genera una contraseña segura)
6. **Instance configuration:** db.t3.micro (free tier)
7. **Storage:** 20 GB
8. **Connectivity:**
   - VPC: Default
   - Public access: Yes (para desarrollo)
   - VPC security group: Create new
   - Database port: 3306
9. **Database authentication:** Password authentication
10. **Additional configuration:**
    - Initial database name: `prediversa`
    - Enable automated backups: Yes (para producción)

### 2. Configurar Security Group

1. Ir a **EC2** → **Security Groups**
2. Seleccionar el security group creado para RDS
3. **Edit inbound rules:**
   - Type: MySQL/Aurora
   - Protocol: TCP
   - Port range: 3306
   - Source: 
     - Para desarrollo: `My IP` (tu dirección IP pública)
     - Para producción: Las IPs de tus servidores de aplicación

### 3. Obtener el Endpoint

1. Ir a **RDS** → **Databases** → Tu instancia
2. Copiar el **Endpoint** (sin incluir el puerto)
   - Ejemplo: `prediversa-db.abc123xyz.us-east-1.rds.amazonaws.com`

### 4. Conectarse y Ejecutar Script SQL

```bash
# Conectarse a RDS
mysql -h prediversa-db.abc123xyz.us-east-1.rds.amazonaws.com -u admin -p

# Ingresar la contraseña cuando se solicite

# El script SQL ya creó la base de datos, solo verifica:
USE prediversa;
SHOW TABLES;
SELECT * FROM users;
```

O ejecutar el script directamente:
```bash
mysql -h prediversa-db.abc123xyz.us-east-1.rds.amazonaws.com -u admin -p prediversa < database/schema.sql
```

### 5. Configurar Variables de Entorno para RDS

Crear archivo `.env` en la carpeta `backend`:

```env
PORT=5000
JWT_SECRET=tu_secreto_super_seguro_cambia_esto

# Configuración AWS RDS
DB_HOST=prediversa-db.abc123xyz.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_NAME=prediversa
DB_USER=admin
DB_PASSWORD=tu_password_seguro_rds
DB_SSL=true
```

---

## 🔧 Verificación de la Instalación

### 1. Instalar Dependencias

```bash
cd backend
npm install
```

### 2. Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Conexión a MySQL establecida correctamente
✅ Tabla de usuarios verificada/creada correctamente
🚀 Servidor ejecutándose en puerto 5000
📡 API disponible en: http://localhost:5000/api
```

### 3. Probar los Endpoints

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Login (con usuario de prueba):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@prediversa.com","password":"admin123"}'
```

**Obtener usuarios:**
```bash
curl http://localhost:5000/api/auth/users
```

**Obtener estadísticas:**
```bash
curl http://localhost:5000/api/auth/stats
```

---

## 📊 Estructura de la Tabla

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | INT (PK, AI) | Identificador único |
| documentId | VARCHAR(20) | Número de documento de identidad |
| email | VARCHAR(100) | Correo electrónico |
| password | VARCHAR(255) | Contraseña hasheada (bcrypt) |
| name | VARCHAR(100) | Nombre completo |
| role | ENUM | Rol: Estudiante, Administrador, Colaboradores |
| phone | VARCHAR(20) | Teléfono de contacto |
| address | VARCHAR(255) | Dirección física |
| birthDate | DATE | Fecha de nacimiento |
| status | ENUM | Estado: Activo, Inactivo |
| createdAt | TIMESTAMP | Fecha de creación |
| updatedAt | TIMESTAMP | Fecha de última actualización |

---

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca subas el archivo `.env` a Git**
   ```bash
   # Ya está en .gitignore, pero verifica:
   echo ".env" >> .gitignore
   ```

2. **Usa contraseñas seguras**
   - Mínimo 12 caracteres
   - Incluye mayúsculas, minúsculas, números y símbolos

3. **Restringe acceso a RDS**
   - No uses `0.0.0.0/0` en producción
   - Usa security groups de EC2 si tu backend está en AWS

4. **Habilita SSL en producción**
   - La configuración ya incluye soporte SSL
   - AWS RDS requiere SSL por defecto

5. **Rotación de credenciales**
   - Cambia las contraseñas periódicamente
   - Usa AWS Secrets Manager para gestionar credenciales

---

## 🐛 Solución de Problemas

### Error: "Can't connect to MySQL server"

**Causa:** MySQL no está corriendo o el puerto está bloqueado.

**Solución:**
```bash
# Verificar si MySQL está corriendo
# Windows:
net start MySQL80

# macOS:
brew services restart mysql

# Linux:
sudo systemctl status mysql
sudo systemctl start mysql
```

### Error: "Access denied for user"

**Causa:** Credenciales incorrectas o usuario no existe.

**Solución:**
```bash
# Conectarse como root y verificar usuario
mysql -u root -p

# Dentro de MySQL
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'tu_usuario'@'localhost';
```

### Error: "ER_BAD_DB_ERROR: Unknown database"

**Causa:** La base de datos no existe.

**Solución:**
```bash
# Crear la base de datos manualmente
mysql -u root -p -e "CREATE DATABASE prediversa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# O ejecutar el script completo
mysql -u root -p < database/schema.sql
```

### Error de SSL con AWS RDS

**Causa:** La conexión requiere SSL pero no está configurada.

**Solución:**
Asegúrate de tener `DB_SSL=true` en tu archivo `.env`.

---

## 📝 Notas Adicionales

- El backend usa **mysql2** con promesas para operaciones asíncronas
- El pool de conexiones está configurado con un máximo de 10 conexiones
- Las contraseñas se hashean con **bcrypt** (salt rounds: 10)
- Los campos `createdAt` y `updatedAt` se manejan automáticamente

---

## 📚 Recursos Útiles

- [Documentación MySQL 8.0](https://dev.mysql.com/doc/refman/8.0/en/)
- [AWS RDS Documentation](https://docs.aws.amazon.com/rds/)
- [mysql2 npm package](https://www.npmjs.com/package/mysql2)
