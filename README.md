# 🎓 Student Registration Microservice

Microservicio para registro y gestión de alumnos con arquitectura hexagonal.

## 🏗️ Arquitectura

Este proyecto sigue los principios de **Arquitectura Hexagonal** (Ports & Adapters):

```
src/
├── application/        # Casos de uso (lógica de negocio)
├── domain/            # Entidades y reglas de negocio
├── infrastructure/    # Adaptadores e implementaciones
│   ├── config/       # Configuración (DB, Server)
│   ├── controllers/  # Controladores HTTP
│   ├── driven/       # Adaptadores driven (DB, CSV, Email)
│   ├── driving/      # Adaptadores driving (API REST)
│   └── routes/       # Definición de rutas
└── shared/           # Utilidades compartidas
```

## 🚀 Inicio Rápido

### Prerequisitos

- Node.js 18+
- MySQL 8.0+
- npm o yarn

### Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd RegistroMicroServicio
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Ejecutar migraciones (si existen):
```bash
npm run migrate
```

5. Iniciar el servidor:
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📡 API Endpoints

### Estudiantes

- `GET /alumnos/listar` - Obtener todos los alumnos
- `POST /alumnos/crear` - Crear nuevo alumno
- `PUT /alumnos/:id` - Actualizar alumno
- `DELETE /alumnos/:id` - Eliminar alumno
- `POST /alumnos/cargar-csv` - Importar alumnos desde CSV
- `GET /alumnos/basica` - Obtener información básica de estudiantes
- `GET /alumnos/historial/:matricula` - Obtener historial académico

### Autenticación

- `POST /alumnos/login` - Login con email y contraseña
- `POST /alumnos/login/google` - Login con Google OAuth
- `POST /alumnos/set-password` - Establecer contraseña por email

### Asignaturas y Grupos

- `GET /api/asignaturas` - Listar asignaturas
- `GET /api/grupos` - Listar grupos
- `GET /api/materias` - Listar materias
- `POST /api/inscripciones` - Crear inscripción

## 🔧 Configuración

### Variables de Entorno

Consulta `.env.example` para ver todas las variables disponibles.

**Importantes:**
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Configuración de base de datos
- `PORT` - Puerto del servidor (default: 3002)
- `RESEND_KEY` - API Key para envío de emails
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Credenciales OAuth de Google

### Base de Datos

El microservicio utiliza MySQL con Sequelize ORM. Asegúrate de:

1. Crear la base de datos:
```sql
CREATE DATABASE alumnos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Las tablas se crearán automáticamente al iniciar el servidor (sync de Sequelize)

## 📦 Estructura de Carpetas

```
RegistroMicroServicio/
├── config/              # Archivos de configuración adicionales
├── migrations/          # Migraciones de base de datos
├── uploads/            # Archivos CSV subidos (no versionado)
├── src/
│   ├── app.js          # Punto de entrada de la aplicación
│   ├── application/    # Casos de uso
│   ├── domain/         # Modelos de dominio
│   ├── infrastructure/ # Implementaciones
│   └── shared/         # Código compartido
├── .env                # Variables de entorno (no versionado)
├── .env.example        # Ejemplo de variables de entorno
├── package.json        # Dependencias del proyecto
└── railway.toml        # Configuración para Railway
```

## 🧪 Testing

```bash
npm test
```

## 🚢 Deployment

### Railway

1. Conectar repositorio en Railway
2. Configurar variables de entorno en Railway Dashboard
3. Railway detectará automáticamente `railway.toml` y desplegará

**Variables de entorno requeridas en Railway:**
- Todas las del `.env.example`
- `DATABASE_URL` (si Railway provee MySQL)

## 🔒 Seguridad

- ✅ Variables sensibles en `.env` (no versionado)
- ✅ Contraseñas hasheadas con bcrypt
- ✅ CORS configurado
- ✅ Validación de archivos CSV
- ⚠️ **Pendiente:** Rate limiting
- ⚠️ **Pendiente:** JWT para autenticación de API

## 📝 Logs

Los logs se muestran en consola con emojis para mejor legibilidad:
- 🚀 Inicio de aplicación
- 🔌 Conexión a base de datos
- 📂 Operaciones de archivos
- ✅ Operaciones exitosas
- ❌ Errores

## 🐛 Troubleshooting

### Error de conexión a la base de datos
- Verifica que MySQL esté corriendo
- Confirma las credenciales en `.env`
- Verifica que la base de datos existe

### Error al subir CSV
- Verifica que el directorio `uploads/` exista
- Confirma permisos de escritura
- Verifica formato del CSV

## 👥 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

[Especificar licencia]

## 📞 Contacto

[Tu información de contacto]
