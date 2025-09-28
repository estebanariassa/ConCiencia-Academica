# 🗄️ Reorganización Completa de Base de Datos con Supabase

## 📋 Resumen

Este PR implementa una reorganización completa de la base de datos del sistema ConCiencia Académica, migrando de una estructura básica a un esquema robusto y escalable con Supabase (PostgreSQL).

## 🎯 Objetivos

- ✅ Implementar estructura de base de datos normalizada y escalable
- ✅ Configurar seguridad robusta con Row Level Security (RLS)
- ✅ Establecer relaciones apropiadas entre entidades
- ✅ Crear documentación completa y guías de configuración
- ✅ Implementar tipos TypeScript actualizados
- ✅ Configurar backend con Supabase

## 🔄 Cambios Principales

### 🗄️ **Base de Datos**

#### **Nuevas Tablas Creadas:**
- `usuarios` - Tabla principal de usuarios del sistema
- `carreras` - Catálogo de carreras de la facultad
- `departamentos` - Departamentos académicos
- `profesores` - Información específica de profesores
- `estudiantes` - Información específica de estudiantes
- `cursos` - Catálogo de cursos/materias
- `periodos_academicos` - Períodos académicos (semestres)
- `grupos` - Grupos específicos de cada curso
- `inscripciones` - Relación entre estudiantes y grupos
- `asignaciones_profesor` - Relación entre profesores y grupos
- `categorias_pregunta` - Categorías para organizar preguntas
- `preguntas_evaluacion` - Preguntas del formulario de evaluación
- `evaluaciones` - Evaluaciones realizadas por estudiantes
- `respuestas_evaluacion` - Respuestas individuales a cada pregunta
- `notificaciones` - Sistema de notificaciones

#### **Características Implementadas:**
- **UUIDs** para identificadores únicos
- **Índices optimizados** para mejor rendimiento
- **Triggers automáticos** para actualización de fechas
- **Funciones auxiliares** para cálculos automáticos
- **Constraints** para integridad de datos

### 🔐 **Seguridad**

#### **Row Level Security (RLS):**
- Políticas específicas por tipo de usuario (estudiante, profesor, coordinador, admin)
- Acceso granular a datos según roles
- Funciones auxiliares para verificación de permisos
- Protección contra acceso no autorizado

#### **Políticas Implementadas:**
- Estudiantes solo ven sus propias evaluaciones
- Profesores ven evaluaciones de sus cursos
- Coordinadores ven evaluaciones de su departamento
- Administradores tienen acceso completo

### 🛠️ **Backend**

#### **Configuración de Supabase:**
- Cliente de Supabase configurado con service role
- Cliente de autenticación separado
- Funciones de verificación de conexión
- Estadísticas de base de datos

#### **Archivos Creados/Modificados:**
- `back/src/config/supabaseClient.ts` - Cliente de Supabase
- `back/src/config/database.ts` - Configuración y funciones de DB
- `back/env.example` - Variables de entorno de ejemplo

### 🎨 **Frontend**

#### **Tipos TypeScript Actualizados:**
- Interfaces completas para todas las tablas
- Tipos para operaciones Insert, Update, Select
- Tipado fuerte para mejor desarrollo

#### **Archivos Modificados:**
- `front/src/lib/supabase/types.ts` - Tipos actualizados

### 📚 **Documentación**

#### **Documentación Completa:**
- `back/docs/database.md` - Esquema y estructura de la DB
- `back/docs/setup.md` - Guía completa de instalación
- `back/scripts/create-database.sql` - Script de creación
- `back/scripts/insert-sample-data.sql` - Datos de ejemplo
- `back/scripts/rls-policies.sql` - Políticas de seguridad

## 🚀 **Instrucciones de Instalación**

### 1. **Configurar Supabase:**
```bash
# Crear proyecto en supabase.com
# Copiar credenciales al archivo .env
cp back/env.example back/.env
```

### 2. **Ejecutar Scripts SQL:**
```sql
-- En Supabase SQL Editor, ejecutar en orden:
-- 1. create-database.sql
-- 2. rls-policies.sql
-- 3. insert-sample-data.sql (opcional)
```

### 3. **Configurar Variables de Entorno:**
```env
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima
SUPABASE_SERVICE_ROLE_KEY=tu_clave_de_servicio
```

### 4. **Instalar Dependencias:**
```bash
cd back && npm install
cd ../front && npm install
```

## 🧪 **Testing**

### **Datos de Ejemplo Incluidos:**
- 5 carreras de ingeniería
- 5 departamentos académicos
- 3 períodos académicos
- 4 profesores de ejemplo
- 5 estudiantes de ejemplo
- 6 cursos de ejemplo
- 5 grupos de ejemplo
- 10 preguntas de evaluación
- 3 notificaciones de ejemplo

### **Verificación:**
- ✅ Conexión a base de datos exitosa
- ✅ Políticas RLS funcionando
- ✅ Autenticación configurada
- ✅ Tipos TypeScript sin errores

## 📊 **Impacto**

### **Antes:**
- ❌ Estructura básica con una sola tabla
- ❌ Sin relaciones entre entidades
- ❌ Sin seguridad implementada
- ❌ Backend sin configurar
- ❌ Documentación faltante

### **Después:**
- ✅ Estructura normalizada con 15 tablas
- ✅ Relaciones bien definidas
- ✅ Seguridad robusta con RLS
- ✅ Backend completamente configurado
- ✅ Documentación completa
- ✅ Tipos TypeScript actualizados
- ✅ Datos de ejemplo para testing

## 🔍 **Archivos Modificados**

```
back/
├── docs/
│   ├── database.md (nuevo)
│   └── setup.md (nuevo)
├── scripts/
│   ├── create-database.sql (nuevo)
│   ├── insert-sample-data.sql (nuevo)
│   └── rls-policies.sql (nuevo)
├── src/config/
│   ├── database.ts (modificado)
│   └── supabaseClient.ts (modificado)
└── env.example (nuevo)

front/
└── src/lib/supabase/
    └── types.ts (modificado)
```

## ⚠️ **Breaking Changes**

- **Migración de datos requerida** - La estructura anterior no es compatible
- **Variables de entorno nuevas** - Requiere configuración de Supabase
- **Tipos TypeScript actualizados** - Puede requerir ajustes en componentes

## 🔄 **Migración**

### **Para Desarrolladores:**
1. Hacer backup de datos existentes
2. Ejecutar scripts de creación de base de datos
3. Actualizar variables de entorno
4. Reinstalar dependencias
5. Verificar funcionamiento

### **Para Producción:**
1. Crear nuevo proyecto de Supabase
2. Ejecutar scripts en orden
3. Configurar políticas de seguridad
4. Migrar datos existentes (si los hay)
5. Actualizar configuración de despliegue

## 🎯 **Próximos Pasos**

- [ ] Implementar migración de datos existentes
- [ ] Crear tests unitarios para la base de datos
- [ ] Implementar backup automático
- [ ] Configurar monitoreo de base de datos
- [ ] Optimizar consultas complejas

## 📝 **Notas Adicionales**

- La estructura está diseñada para escalar con el crecimiento del sistema
- Las políticas RLS proporcionan seguridad a nivel de fila
- Los índices están optimizados para consultas frecuentes
- La documentación incluye guías paso a paso
- Los datos de ejemplo facilitan el desarrollo y testing

## 👥 **Revisores Sugeridos**

- @desarrollador-backend
- @desarrollador-frontend
- @administrador-bd
- @arquitecto-sistema

---

**Tipo de Cambio:** 🏗️ Arquitectura  
**Alcance:** Base de Datos, Backend, Frontend, Documentación  
**Breaking Change:** ✅ Sí  
**Requiere Migración:** ✅ Sí
