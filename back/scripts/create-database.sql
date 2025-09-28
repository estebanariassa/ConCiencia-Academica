-- =====================================================
-- Script de creación de base de datos - ConCiencia Académica
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABLA DE USUARIOS (Tabla principal)
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('estudiante', 'profesor', 'coordinador', 'admin')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABLA DE CARRERAS
-- =====================================================
CREATE TABLE IF NOT EXISTS carreras (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. TABLA DE DEPARTAMENTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS departamentos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. TABLA DE PROFESORES
-- =====================================================
CREATE TABLE IF NOT EXISTS profesores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    departamento_id INTEGER REFERENCES departamentos(id),
    codigo_profesor VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    fecha_ingreso DATE,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. TABLA DE ESTUDIANTES
-- =====================================================
CREATE TABLE IF NOT EXISTS estudiantes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    carrera_id INTEGER NOT NULL REFERENCES carreras(id),
    codigo_estudiante VARCHAR(20) UNIQUE NOT NULL,
    semestre_actual INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. TABLA DE CURSOS
-- =====================================================
CREATE TABLE IF NOT EXISTS cursos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    creditos INTEGER NOT NULL,
    descripcion TEXT,
    departamento_id INTEGER REFERENCES departamentos(id),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. TABLA DE PERÍODOS ACADÉMICOS
-- =====================================================
CREATE TABLE IF NOT EXISTS periodos_academicos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 8. TABLA DE GRUPOS
-- =====================================================
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    curso_id INTEGER NOT NULL REFERENCES cursos(id),
    periodo_id INTEGER NOT NULL REFERENCES periodos_academicos(id),
    numero_grupo VARCHAR(10) NOT NULL,
    horario VARCHAR(100),
    aula VARCHAR(50),
    cupo_maximo INTEGER DEFAULT 30,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(curso_id, periodo_id, numero_grupo)
);

-- =====================================================
-- 9. TABLA DE INSCRIPCIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS inscripciones (
    id SERIAL PRIMARY KEY,
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    fecha_inscripcion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activa BOOLEAN DEFAULT true,
    UNIQUE(estudiante_id, grupo_id)
);

-- =====================================================
-- 10. TABLA DE ASIGNACIONES PROFESOR
-- =====================================================
CREATE TABLE IF NOT EXISTS asignaciones_profesor (
    id SERIAL PRIMARY KEY,
    profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    fecha_asignacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activa BOOLEAN DEFAULT true,
    UNIQUE(profesor_id, grupo_id)
);

-- =====================================================
-- 11. TABLA DE CATEGORÍAS DE PREGUNTA
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias_pregunta (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 12. TABLA DE PREGUNTAS DE EVALUACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS preguntas_evaluacion (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL REFERENCES categorias_pregunta(id),
    texto_pregunta TEXT NOT NULL,
    descripcion TEXT,
    tipo_pregunta VARCHAR(20) NOT NULL CHECK (tipo_pregunta IN ('rating', 'texto', 'opcion_multiple')),
    opciones JSONB, -- Para preguntas de opción múltiple
    obligatoria BOOLEAN DEFAULT true,
    orden INTEGER NOT NULL,
    activa BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 13. TABLA DE EVALUACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS evaluaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    estudiante_id UUID NOT NULL REFERENCES estudiantes(id) ON DELETE CASCADE,
    profesor_id UUID NOT NULL REFERENCES profesores(id) ON DELETE CASCADE,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    periodo_id INTEGER NOT NULL REFERENCES periodos_academicos(id),
    completada BOOLEAN DEFAULT false,
    comentarios TEXT,
    calificacion_promedio DECIMAL(3,2),
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completada TIMESTAMP WITH TIME ZONE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(estudiante_id, profesor_id, grupo_id, periodo_id)
);

-- =====================================================
-- 14. TABLA DE RESPUESTAS DE EVALUACIÓN
-- =====================================================
CREATE TABLE IF NOT EXISTS respuestas_evaluacion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evaluacion_id UUID NOT NULL REFERENCES evaluaciones(id) ON DELETE CASCADE,
    pregunta_id INTEGER NOT NULL REFERENCES preguntas_evaluacion(id),
    respuesta_rating INTEGER CHECK (respuesta_rating >= 1 AND respuesta_rating <= 5),
    respuesta_texto TEXT,
    respuesta_opcion VARCHAR(255),
    fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(evaluacion_id, pregunta_id)
);

-- =====================================================
-- 15. TABLA DE NOTIFICACIONES
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('info', 'warning', 'success', 'error')),
    leida BOOLEAN DEFAULT false,
    enlace VARCHAR(500),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para evaluaciones
CREATE INDEX IF NOT EXISTS idx_evaluaciones_estudiante ON evaluaciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_profesor ON evaluaciones(profesor_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_grupo ON evaluaciones(grupo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_periodo ON evaluaciones(periodo_id);
CREATE INDEX IF NOT EXISTS idx_evaluaciones_completada ON evaluaciones(completada);

-- Índices para inscripciones
CREATE INDEX IF NOT EXISTS idx_inscripciones_estudiante ON inscripciones(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_grupo ON inscripciones(grupo_id);

-- Índices para asignaciones
CREATE INDEX IF NOT EXISTS idx_asignaciones_profesor ON asignaciones_profesor(profesor_id);
CREATE INDEX IF NOT EXISTS idx_asignaciones_grupo ON asignaciones_profesor(grupo_id);

-- Índices para respuestas
CREATE INDEX IF NOT EXISTS idx_respuestas_evaluacion ON respuestas_evaluacion(evaluacion_id);
CREATE INDEX IF NOT EXISTS idx_respuestas_pregunta ON respuestas_evaluacion(pregunta_id);

-- Índices para notificaciones
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificaciones_leida ON notificaciones(leida);

-- =====================================================
-- TRIGGERS PARA FECHAS DE ACTUALIZACIÓN
-- =====================================================

-- Función para actualizar fecha_actualizacion
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para calcular calificación promedio de una evaluación
CREATE OR REPLACE FUNCTION calcular_calificacion_promedio(evaluacion_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    promedio DECIMAL(3,2);
BEGIN
    SELECT AVG(respuesta_rating)::DECIMAL(3,2)
    INTO promedio
    FROM respuestas_evaluacion
    WHERE evaluacion_id = evaluacion_uuid
    AND respuesta_rating IS NOT NULL;
    
    RETURN COALESCE(promedio, 0);
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar calificación promedio automáticamente
CREATE OR REPLACE FUNCTION actualizar_calificacion_promedio()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE evaluaciones
    SET calificacion_promedio = calcular_calificacion_promedio(NEW.evaluacion_id)
    WHERE id = NEW.evaluacion_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_calificacion
    AFTER INSERT OR UPDATE ON respuestas_evaluacion
    FOR EACH ROW EXECUTE FUNCTION actualizar_calificacion_promedio();
