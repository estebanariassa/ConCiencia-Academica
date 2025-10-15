# Configuración de Emilcy como Coordinadora-Profesora

Este documento explica cómo configurar a Emilcy como coordinadora de Ingeniería de Sistemas que también es profesora, permitiendo que pueda iniciar sesión como docente y aparecer en la lista de profesores.

## 🎯 Problema Resuelto

Emilcy tiene roles múltiples (coordinadora y profesora) y necesita:
- ✅ Poder iniciar sesión como docente
- ✅ Aparecer en la lista de profesores junto con Bell y William
- ✅ Acceder tanto al dashboard de coordinadora como al de profesora
- ✅ Ser evaluada como profesora y evaluar otros profesores como coordinadora

## 🚀 Solución Implementada

### 1. Sistema de Roles Múltiples
- ✅ Tabla `usuario_roles` para manejar múltiples roles por usuario
- ✅ Tabla `coordinadores` para información específica de coordinadores
- ✅ Funciones SQL para gestión automática de roles
- ✅ Vistas para consultas consolidadas

### 2. Frontend Actualizado
- ✅ Modal de selección de rol en el login
- ✅ Detección automática de usuarios con múltiples roles
- ✅ Interfaz intuitiva para elegir el rol de sesión
- ✅ Navegación automática al dashboard correcto

### 3. Backend Mejorado
- ✅ Endpoint `/auth/login-with-role` para login con rol específico
- ✅ Detección automática de usuarios con múltiples roles
- ✅ Validación de roles y permisos
- ✅ Generación de tokens JWT con rol seleccionado

## 📋 Instalación

### Paso 1: Configurar Variables de Entorno

Asegúrate de tener configuradas las variables de entorno de Supabase:

```bash
# En tu archivo .env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### Paso 2: Ejecutar Scripts de Base de Datos

```bash
# Navegar al directorio de scripts
cd back/scripts

# Ejecutar el script de configuración de Emilcy
node setup-emilcy.js
```

### Paso 3: Verificar Instalación

El script verificará automáticamente si Emilcy fue creada correctamente y mostrará:
- ✅ Información de acceso (email y contraseña)
- ✅ Roles asignados
- ✅ Funcionalidades disponibles

## 🎭 Cómo Funciona el Sistema

### 1. Login con Roles Múltiples

Cuando Emilcy inicia sesión:

1. **Detección Automática**: El sistema detecta que tiene múltiples roles
2. **Modal de Selección**: Se muestra un modal para elegir el rol
3. **Opciones Disponibles**:
   - 🎓 **Docente**: Acceso al dashboard de profesores
   - ⚙️ **Coordinador**: Acceso al dashboard de coordinadores
4. **Navegación**: Redirección automática al dashboard seleccionado

### 2. Lista de Profesores

Emilcy aparecerá en la lista de profesores junto con:
- 👨‍🏫 Bell (Profesor de Ingeniería de Sistemas)
- 👨‍🏫 William (Profesor de Ingeniería de Sistemas)
- 👩‍🏫 Emilcy (Coordinadora-Profesora de Ingeniería de Sistemas)

### 3. Permisos y Funcionalidades

**Como Profesora:**
- ✅ Aparece en la lista de profesores
- ✅ Puede ser evaluada por estudiantes
- ✅ Acceso al dashboard de profesores
- ✅ Ver sus propias evaluaciones

**Como Coordinadora:**
- ✅ Evaluar otros profesores
- ✅ Ver reportes de la carrera
- ✅ Gestionar profesores de Ingeniería de Sistemas
- ✅ Acceso al dashboard de coordinadores

## 🔐 Credenciales de Acceso

```
📧 Email: emilcy.coordinadora@udem.edu.co
🔑 Contraseña: Password123!
🎭 Roles: Coordinadora y Profesora
🏢 Departamento: Ingeniería de Sistemas
📚 Código Profesor: PROF006
```

## 🎯 Flujo de Uso

### Para Emilcy (Iniciar Sesión como Docente):

1. **Ir al Login**: Navegar a la página de login
2. **Seleccionar Tipo**: Elegir "Docente" como tipo de usuario
3. **Ingresar Credenciales**: Usar el email y contraseña de Emilcy
4. **Seleccionar Rol**: En el modal, elegir "Docente"
5. **Acceder**: Ser redirigida al dashboard de profesores

### Para Emilcy (Iniciar Sesión como Coordinadora):

1. **Ir al Login**: Navegar a la página de login
2. **Seleccionar Tipo**: Elegir "Coordinador" como tipo de usuario
3. **Ingresar Credenciales**: Usar el email y contraseña de Emilcy
4. **Seleccionar Rol**: En el modal, elegir "Coordinador"
5. **Acceder**: Ser redirigida al dashboard de coordinadores

## 🔧 Archivos Modificados

### Backend:
- `back/src/routes/auth-supabase.ts` - Nuevo endpoint de login con rol
- `back/src/services/roleService.ts` - Gestión de roles múltiples
- `back/scripts/add-multiple-roles-system.sql` - Sistema de roles múltiples
- `back/scripts/add-emilcy-coordinadora.sql` - Creación de Emilcy

### Frontend:
- `front/src/pages/Login.tsx` - Modal de selección de rol
- `front/src/context/AuthContext.tsx` - Manejo de roles múltiples
- `front/src/api/auth.ts` - API de autenticación actualizada

## 🐛 Solución de Problemas

### Error: "Usuario no encontrado"
- ✅ Verifica que Emilcy fue creada correctamente
- ✅ Ejecuta el script de verificación: `node setup-emilcy.js`

### Error: "Rol no válido"
- ✅ Asegúrate de que el sistema de roles múltiples esté instalado
- ✅ Verifica que Emilcy tenga ambos roles asignados

### Modal de selección no aparece
- ✅ Verifica que el usuario tenga múltiples roles
- ✅ Revisa la consola del navegador para errores
- ✅ Asegúrate de que el frontend esté actualizado

## 📞 Soporte

Si encuentras problemas:

1. **Verifica los logs**: Revisa la consola del navegador y los logs del servidor
2. **Ejecuta verificación**: `node setup-emilcy.js` para verificar el estado
3. **Revisa la base de datos**: Consulta las tablas `usuario_roles` y `coordinadores`

## 🎉 Resultado Final

Después de la configuración:

- ✅ Emilcy puede iniciar sesión como docente
- ✅ Aparece en la lista de profesores de Ingeniería de Sistemas
- ✅ Tiene acceso a ambos dashboards según el rol seleccionado
- ✅ Puede ser evaluada como profesora y evaluar como coordinadora
- ✅ El sistema maneja automáticamente sus roles múltiples

¡El sistema está listo para que Emilcy use sus roles múltiples de manera eficiente! 🚀

