# Base de Datos - ConCiencia Académica

## Descripción General
Sistema de evaluación docente basado en Supabase (PostgreSQL) para la facultad de ingenierías.

## Estructura de Tablas

### 1. **usuarios**
Tabla principal para todos los usuarios del sistema (estudiantes, profesores, coordinadores).

### 2. **carreras**
Catálogo de carreras de la facultad.

### 3. **departamentos**
Departamentos académicos de la universidad.

### 4. **profesores**
Información específica de los profesores.

### 5. **estudiantes**
Información específica de los estudiantes.

### 6. **cursos**
Catálogo de cursos/materias.

### 7. **grupos**
Grupos específicos de cada curso.

### 8. **inscripciones**
Relación entre estudiantes y grupos.

### 9. **asignaciones_profesor**
Relación entre profesores y grupos.

### 10. **categorias_pregunta**
Categorías para organizar las preguntas de evaluación.

### 11. **preguntas_evaluacion**
Preguntas del formulario de evaluación.

### 12. **evaluaciones**
Evaluaciones realizadas por los estudiantes.

### 13. **respuestas_evaluacion**
Respuestas individuales a cada pregunta.

### 14. **periodos_academicos**
Períodos académicos (semestres).

### 15. **notificaciones**
Sistema de notificaciones.

## Relaciones Principales

- **usuarios** → **profesores** (1:1)
- **usuarios** → **estudiantes** (1:1)
- **carreras** → **estudiantes** (1:N)
- **departamentos** → **profesores** (1:N)
- **cursos** → **grupos** (1:N)
- **grupos** → **inscripciones** (1:N)
- **grupos** → **asignaciones_profesor** (1:N)
- **evaluaciones** → **respuestas_evaluacion** (1:N)

## Políticas de Seguridad (RLS)

- Los estudiantes solo pueden ver sus propias evaluaciones
- Los profesores solo pueden ver evaluaciones de sus cursos
- Los coordinadores pueden ver evaluaciones de su departamento
- Solo usuarios autenticados pueden acceder a los datos

## Índices Recomendados

- `idx_evaluaciones_estudiante` en `evaluaciones(estudiante_id)`
- `idx_evaluaciones_profesor` en `evaluaciones(profesor_id)`
- `idx_evaluaciones_periodo` en `evaluaciones(periodo_id)`
- `idx_inscripciones_estudiante` en `inscripciones(estudiante_id)`
