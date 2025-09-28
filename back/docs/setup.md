# Guía de Configuración - ConCiencia Académica

## 📋 Requisitos Previos

- Node.js (versión 16 o superior)
- npm o yarn
- Cuenta de Supabase
- Git

## 🚀 Configuración Inicial

### 1. Configurar Supabase

1. **Crear proyecto en Supabase:**
   - Ve a [supabase.com](https://supabase.com)
   - Crea una nueva cuenta o inicia sesión
   - Crea un nuevo proyecto
   - Anota la URL del proyecto y las claves API

2. **Configurar variables de entorno:**
   ```bash
   cp env.example .env
   ```
   
   Edita el archivo `.env` con tus credenciales de Supabase:
   ```env
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_ANON_KEY=tu_clave_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
   ```

### 2. Configurar la Base de Datos

1. **Ejecutar scripts de creación:**
   ```bash
   # En el dashboard de Supabase, ve a SQL Editor
   # Ejecuta el archivo: scripts/create-database.sql
   ```

2. **Configurar políticas de seguridad:**
   ```bash
   # En el dashboard de Supabase, ve a SQL Editor
   # Ejecuta el archivo: scripts/rls-policies.sql
   ```

3. **Insertar datos de ejemplo (opcional):**
   ```bash
   # En el dashboard de Supabase, ve a SQL Editor
   # Ejecuta el archivo: scripts/insert-sample-data.sql
   ```

### 3. Configurar Autenticación en Supabase

1. **Configurar proveedores de autenticación:**
   - Ve a Authentication > Settings en el dashboard de Supabase
   - Habilita "Email" como proveedor
   - Configura las URLs de redirección:
     - Site URL: `http://localhost:3000`
     - Redirect URLs: `http://localhost:3000/**`

2. **Configurar políticas de autenticación:**
   - Las políticas RLS ya están configuradas en el script
   - Verifica que estén activas en Authentication > Policies

### 4. Instalar Dependencias

```bash
# Instalar dependencias del backend
cd back
npm install

# Instalar dependencias del frontend
cd ../front
npm install
```

### 5. Configurar el Frontend

1. **Crear archivo de variables de entorno:**
   ```bash
   cd front
   cp .env.example .env.local
   ```

2. **Configurar variables de entorno del frontend:**
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

## 🏃‍♂️ Ejecutar el Proyecto

### Backend
```bash
cd back
npm run dev
```

### Frontend
```bash
cd front
npm run dev
```

## 📊 Verificar la Configuración

### 1. Verificar Conexión a la Base de Datos
```bash
# El backend debería mostrar:
# ✅ Conexión a la base de datos exitosa
```

### 2. Verificar Autenticación
- Ve a `http://localhost:3000`
- Intenta registrarte con un email
- Verifica que recibas el email de confirmación

### 3. Verificar Datos de Ejemplo
- Inicia sesión con las credenciales de ejemplo
- Verifica que puedas ver las evaluaciones pendientes

## 🔧 Solución de Problemas

### Error de Conexión a Supabase
- Verifica que las variables de entorno estén correctas
- Asegúrate de que el proyecto de Supabase esté activo
- Verifica que las claves API sean válidas

### Error de Políticas RLS
- Verifica que las políticas estén habilitadas
- Revisa que el usuario tenga los permisos correctos
- Verifica que las funciones auxiliares estén creadas

### Error de Autenticación
- Verifica la configuración de proveedores en Supabase
- Asegúrate de que las URLs de redirección sean correctas
- Verifica que el email esté confirmado

## 📚 Estructura de la Base de Datos

### Tablas Principales
- `usuarios`: Información de todos los usuarios
- `profesores`: Información específica de profesores
- `estudiantes`: Información específica de estudiantes
- `cursos`: Catálogo de cursos
- `grupos`: Grupos de cada curso
- `evaluaciones`: Evaluaciones realizadas
- `respuestas_evaluacion`: Respuestas individuales

### Relaciones
- Un usuario puede ser profesor o estudiante
- Un curso puede tener múltiples grupos
- Un grupo puede tener múltiples estudiantes
- Una evaluación tiene múltiples respuestas

## 🔐 Seguridad

### Políticas RLS Implementadas
- Los estudiantes solo ven sus propias evaluaciones
- Los profesores ven evaluaciones de sus cursos
- Los coordinadores ven evaluaciones de su departamento
- Los administradores tienen acceso completo

### Funciones de Seguridad
- `is_admin()`: Verifica si es administrador
- `is_coordinator()`: Verifica si es coordinador
- `is_teacher()`: Verifica si es profesor
- `is_student()`: Verifica si es estudiante

## 📈 Monitoreo

### Estadísticas de la Base de Datos
```javascript
// Obtener estadísticas
const stats = await getDatabaseStats();
console.log(stats);
```

### Logs del Sistema
- Los logs se muestran en la consola del backend
- Nivel de log configurable en variables de entorno
- Incluye información de conexión y errores

## 🚀 Despliegue

### Variables de Entorno para Producción
```env
NODE_ENV=production
SUPABASE_URL=tu_url_de_produccion
SUPABASE_ANON_KEY=tu_clave_anonima_produccion
SUPABASE_SERVICE_ROLE_KEY=tu_clave_servicio_produccion
JWT_SECRET=tu_jwt_secret_seguro
```

### Configuración de CORS
```env
CORS_ORIGIN=https://tu-dominio.com
```

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs del backend
2. Verifica la configuración de Supabase
3. Consulta la documentación de Supabase
4. Revisa las políticas RLS en el dashboard
