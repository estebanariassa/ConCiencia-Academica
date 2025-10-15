# 🔧 Solución para el Problema de Emilcy

## 🎯 Problema Identificado

En la imagen se ve que el usuario `ejhernandez@udemedellin.edu.co` está intentando hacer login como "Docente" pero el sistema muestra el error:

> *"El tipo de usuario seleccionado (teacher) no coincide con los roles del usuario en el sistema (coordinador, roles: coordinador)"*

Esto significa que:
- ✅ El usuario existe y es coordinador
- ❌ El usuario NO tiene el rol de profesor/docente
- ❌ No puede hacer login como docente

## 🚀 Soluciones Disponibles

### Opción 1: Agregar Rol de Profesor al Usuario Actual

Si `ejhernandez@udemedellin.edu.co` es efectivamente Emilcy, podemos agregarle el rol de profesor:

```sql
-- Ejecutar en Supabase SQL Editor
\i back/scripts/fix-user-roles.sql
```

Esto agregará el rol de "profesor" al usuario actual, permitiendo que tenga ambos roles.

### Opción 2: Crear a Emilcy con Email Específico

Si prefieres crear a Emilcy con un email específico:

```sql
-- Ejecutar en Supabase SQL Editor
\i back/scripts/quick-setup-emilcy.sql
```

Esto creará a Emilcy con el email `emilcy.coordinadora@udem.edu.co`.

## 📋 Pasos para Resolver

### Paso 1: Ejecutar Script de Corrección

1. **Abrir Supabase SQL Editor**
2. **Ejecutar el script**:
   ```sql
   \i back/scripts/fix-user-roles.sql
   ```

### Paso 2: Verificar Resultado

El script mostrará:
- ✅ Usuarios existentes con roles
- ✅ Roles agregados correctamente
- ✅ Lista de profesores de Ingeniería de Sistemas

### Paso 3: Probar Login

1. **Ir al login** con el email `ejhernandez@udemedellin.edu.co`
2. **Seleccionar "Docente"** como tipo de usuario
3. **El sistema debería**:
   - Detectar que tiene múltiples roles
   - Mostrar modal de selección de rol
   - Permitir elegir entre "Coordinador" y "Docente"

## 🎭 Resultado Esperado

Después de ejecutar el script:

### Para el Usuario Actual (`ejhernandez@udemedellin.edu.co`):
- ✅ **Rol de Coordinador**: Acceso al dashboard de coordinadores
- ✅ **Rol de Profesor**: Acceso al dashboard de profesores
- ✅ **Aparece en lista de profesores**: Junto con Bell y William
- ✅ **Modal de selección**: Al hacer login, puede elegir el rol

### Para Emilcy (`emilcy.coordinadora@udem.edu.co`):
- ✅ **Credenciales**: `emilcy.coordinadora@udem.edu.co` / `Password123!`
- ✅ **Roles múltiples**: Coordinadora y Profesora
- ✅ **Departamento**: Ingeniería de Sistemas

## 🔍 Verificación

### Verificar que el Usuario Tiene Múltiples Roles:

```sql
SELECT 
  u.email,
  u.nombre,
  u.apellido,
  ARRAY_AGG(ur.rol ORDER BY ur.rol) as roles_activos
FROM usuarios u
JOIN usuario_roles ur ON u.id = ur.usuario_id AND ur.activo = true
WHERE u.email = 'ejhernandez@udemedellin.edu.co'
GROUP BY u.id, u.email, u.nombre, u.apellido;
```

### Verificar Lista de Profesores:

```sql
SELECT 
  u.nombre,
  u.apellido,
  u.email,
  p.codigo,
  CASE 
    WHEN c.usuario_id IS NOT NULL THEN 'Coordinadora-Profesora'
    ELSE 'Profesor'
  END as tipo_profesor
FROM usuarios u
JOIN profesores p ON u.id = p.usuario_id
LEFT JOIN coordinadores c ON u.id = c.usuario_id AND c.activo = true
WHERE u.activo = true AND p.activo = true
ORDER BY u.nombre;
```

## 🎉 Flujo de Login Esperado

1. **Usuario ingresa credenciales** de `ejhernandez@udemedellin.edu.co`
2. **Sistema detecta múltiples roles**: `['coordinador', 'profesor']`
3. **Se muestra modal** con opciones:
   - 🎓 **Docente**: Dashboard de profesores
   - ⚙️ **Coordinador**: Dashboard de coordinadores
4. **Usuario selecciona "Docente"**
5. **Redirección automática** al dashboard de profesores
6. **Aparece en lista de profesores** junto con Bell y William

## 🐛 Si Aún Hay Problemas

### Error: "Usuario no tiene el rol seleccionado"
- ✅ Verificar que el script se ejecutó correctamente
- ✅ Verificar que el usuario tiene ambos roles en `usuario_roles`

### Error: "Modal no aparece"
- ✅ Verificar que el frontend está actualizado
- ✅ Revisar consola del navegador para errores
- ✅ Verificar que el backend está devolviendo `requires_role_selection: true`

### Error: "No aparece en lista de profesores"
- ✅ Verificar que existe registro en tabla `profesores`
- ✅ Verificar que `profesores.activo = true`

## 📞 Soporte

Si necesitas ayuda adicional:

1. **Ejecutar verificación**:
   ```sql
   \i back/scripts/fix-user-roles.sql
   ```

2. **Revisar logs** del servidor backend

3. **Verificar consola** del navegador

¡Con estos pasos, Emilcy debería poder iniciar sesión como docente y aparecer en la lista de profesores! 🚀

