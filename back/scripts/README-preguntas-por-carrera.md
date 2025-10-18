# Implementación de Preguntas por Carrera

Este documento describe la implementación de la funcionalidad para asociar preguntas de evaluación a carreras específicas.

## 🎯 Objetivo

Permitir que las preguntas de evaluación estén asociadas a carreras específicas, de manera que cada carrera pueda tener su propio conjunto de preguntas personalizadas, con fallback a preguntas generales cuando no existan preguntas específicas.

## 📋 Cambios Implementados

### 1. Base de Datos

#### Script SQL: `add-carrera-id-to-preguntas.sql`
- ✅ Agrega columna `id_carrera` a la tabla `preguntas_evaluacion`
- ✅ Crea índices para optimizar consultas por carrera
- ✅ Implementa función `obtener_preguntas_por_carrera()`
- ✅ Crea vista `vista_preguntas_evaluacion_completa`

### 2. Backend

#### Servicios
- ✅ **EvaluationService**: Nuevo servicio para manejar preguntas por carrera
- ✅ **SupabaseDB**: Método `getQuestionsByCareer()` actualizado

#### Controladores
- ✅ **EvaluationController**: Controlador completo para CRUD de preguntas
- ✅ **TeachersController**: Actualizado para usar `id_carrera` en lugar de `carrera_id`

#### Rutas
- ✅ **evaluationRoutes**: Nuevas rutas para gestión de preguntas
- ✅ **app.ts**: Integración de nuevas rutas

### 3. Frontend

#### Tipos TypeScript
- ✅ **PreguntaEvaluacion**: Agregado campo `id_carrera?`
- ✅ **EvaluationQuestion**: Agregado campo `carreraId?`
- ✅ **Database types**: Actualizado tipo `preguntas_evaluacion`

## 🚀 Instalación

### Paso 1: Ejecutar Script de Base de Datos

```sql
-- En SQL Editor de Supabase
\i back/scripts/add-carrera-id-to-preguntas.sql
```

### Paso 2: Verificar Instalación

```sql
-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'preguntas_evaluacion' 
AND column_name = 'id_carrera';

-- Probar la función
SELECT * FROM obtener_preguntas_por_carrera(1);

-- Ver la vista
SELECT * FROM vista_preguntas_evaluacion_completa LIMIT 5;
```

### Paso 3: Compilar Backend

```bash
cd back
npm run build
```

## 📊 Estructura de Datos

### Tabla `preguntas_evaluacion`
```sql
CREATE TABLE preguntas_evaluacion (
  id SERIAL PRIMARY KEY,
  categoria_id INTEGER NOT NULL,
  texto_pregunta TEXT NOT NULL,
  descripcion TEXT,
  tipo_pregunta VARCHAR(50) NOT NULL,
  opciones JSONB,
  obligatoria BOOLEAN DEFAULT false,
  orden INTEGER NOT NULL,
  activa BOOLEAN DEFAULT true,
  id_carrera INTEGER, -- NUEVA COLUMNA
  -- ... otros campos
);
```

### Lógica de Filtrado

1. **Preguntas Específicas**: `id_carrera = X` (preguntas para carrera específica)
2. **Preguntas Generales**: `id_carrera IS NULL` (preguntas para todas las carreras)
3. **Fallback**: Si no hay preguntas específicas, usar preguntas generales

## 🔧 API Endpoints

### Obtener Preguntas por Carrera
```http
GET /api/evaluations/questions/career/{carreraId}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "categoria_id": 1,
      "texto_pregunta": "¿El profesor explica claramente?",
      "tipo_pregunta": "rating",
      "obligatoria": true,
      "orden": 1,
      "activa": true,
      "id_carrera": 1,
      "categoria": {
        "id": 1,
        "nombre": "Claridad Expositiva"
      }
    }
  ],
  "message": "Preguntas obtenidas exitosamente"
}
```

### Crear Pregunta
```http
POST /api/evaluations/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "categoria_id": 1,
  "texto_pregunta": "¿El profesor domina el tema?",
  "tipo_pregunta": "rating",
  "obligatoria": true,
  "orden": 2,
  "id_carrera": 1
}
```

### Obtener Todas las Preguntas
```http
GET /api/evaluations/questions
Authorization: Bearer <token>
```

## 🎛️ Casos de Uso

### Caso 1: Preguntas Específicas por Carrera
```typescript
// Obtener preguntas específicas para Ingeniería de Sistemas (ID: 1)
const preguntas = await EvaluationService.getQuestionsByCareer(1);
// Retorna preguntas con id_carrera = 1
```

### Caso 2: Fallback a Preguntas Generales
```typescript
// Si no hay preguntas específicas para la carrera
const preguntas = await EvaluationService.getQuestionsByCareer(5);
// Si no hay preguntas con id_carrera = 5, retorna preguntas con id_carrera IS NULL
```

### Caso 3: Preguntas por Categoría y Carrera
```typescript
// Obtener preguntas de "Claridad Expositiva" para una carrera específica
const preguntas = await EvaluationService.getQuestionsByCategoryAndCareer(1, 1);
```

## 🔍 Consultas SQL Útiles

### Ver Preguntas por Carrera
```sql
-- Preguntas específicas de una carrera
SELECT * FROM preguntas_evaluacion 
WHERE id_carrera = 1 AND activa = true 
ORDER BY orden;

-- Preguntas generales (para todas las carreras)
SELECT * FROM preguntas_evaluacion 
WHERE id_carrera IS NULL AND activa = true 
ORDER BY orden;
```

### Usar la Función
```sql
-- Preguntas para carrera específica (con fallback)
SELECT * FROM obtener_preguntas_por_carrera(1);

-- Todas las preguntas activas
SELECT * FROM obtener_preguntas_por_carrera();
```

### Usar la Vista
```sql
-- Ver todas las preguntas con información completa
SELECT * FROM vista_preguntas_evaluacion_completa;

-- Filtrar por tipo de pregunta
SELECT * FROM vista_preguntas_evaluacion_completa 
WHERE tipo_pregunta_carrera = 'Específica';
```

## 🚨 Consideraciones Importantes

### 1. Compatibilidad
- ✅ Las preguntas existentes siguen funcionando (id_carrera = NULL)
- ✅ El sistema mantiene compatibilidad hacia atrás
- ✅ No se requieren cambios en el frontend existente

### 2. Performance
- ✅ Índices creados para optimizar consultas por carrera
- ✅ Consultas eficientes con fallback automático
- ✅ Vista materializada para consultas complejas

### 3. Seguridad
- ✅ Autenticación requerida para todas las operaciones
- ✅ Validación de datos en el backend
- ✅ Manejo de errores robusto

## 🐛 Solución de Problemas

### Error: "Columna id_carrera no existe"
```sql
-- Verificar que el script se ejecutó correctamente
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'preguntas_evaluacion' 
AND column_name = 'id_carrera';
```

### Error: "Función obtener_preguntas_por_carrera no existe"
```sql
-- Re-ejecutar el script SQL
\i back/scripts/add-carrera-id-to-preguntas.sql
```

### Error: "No se encuentran preguntas"
```typescript
// Verificar que hay preguntas activas
const todasLasPreguntas = await EvaluationService.getAllActiveQuestions();
console.log('Total preguntas:', todasLasPreguntas.length);
```

## 📈 Próximas Mejoras

1. **Interfaz de administración** para gestionar preguntas por carrera
2. **Importación masiva** de preguntas desde Excel/CSV
3. **Plantillas de preguntas** por tipo de carrera
4. **Auditoría** de cambios en preguntas
5. **Reportes** de uso de preguntas por carrera

## 📞 Soporte

Para problemas o dudas:
1. Verificar logs del backend
2. Comprobar estructura de base de datos
3. Revisar que el script SQL se ejecutó correctamente
4. Consultar este documento

---

**Fecha de implementación**: $(date)
**Versión**: 1.0.0
**Autor**: Sistema ConCiencia Académica
