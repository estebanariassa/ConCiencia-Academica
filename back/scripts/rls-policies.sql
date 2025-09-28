-- =====================================================
-- Políticas de Seguridad (RLS) para ConCiencia Académica
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE carreras ENABLE ROW LEVEL SECURITY;
ALTER TABLE departamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE profesores ENABLE ROW LEVEL SECURITY;
ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE periodos_academicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones_profesor ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_pregunta ENABLE ROW LEVEL SECURITY;
ALTER TABLE preguntas_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE respuestas_evaluacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA USUARIOS
-- =====================================================

-- Los usuarios pueden ver su propia información
CREATE POLICY "Usuarios pueden ver su propia información" ON usuarios
    FOR SELECT USING (auth.uid()::text = id);

-- Los usuarios pueden actualizar su propia información
CREATE POLICY "Usuarios pueden actualizar su propia información" ON usuarios
    FOR UPDATE USING (auth.uid()::text = id);

-- Los administradores pueden ver todos los usuarios
CREATE POLICY "Administradores pueden ver todos los usuarios" ON usuarios
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA CARRERAS
-- =====================================================

-- Todos los usuarios autenticados pueden ver carreras activas
CREATE POLICY "Usuarios autenticados pueden ver carreras activas" ON carreras
    FOR SELECT USING (auth.role() = 'authenticated' AND activa = true);

-- Solo administradores pueden modificar carreras
CREATE POLICY "Solo administradores pueden modificar carreras" ON carreras
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA DEPARTAMENTOS
-- =====================================================

-- Todos los usuarios autenticados pueden ver departamentos activos
CREATE POLICY "Usuarios autenticados pueden ver departamentos activos" ON departamentos
    FOR SELECT USING (auth.role() = 'authenticated' AND activo = true);

-- Solo administradores pueden modificar departamentos
CREATE POLICY "Solo administradores pueden modificar departamentos" ON departamentos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA PROFESORES
-- =====================================================

-- Los profesores pueden ver su propia información
CREATE POLICY "Profesores pueden ver su propia información" ON profesores
    FOR SELECT USING (
        usuario_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- Los profesores pueden actualizar su propia información
CREATE POLICY "Profesores pueden actualizar su propia información" ON profesores
    FOR UPDATE USING (usuario_id = auth.uid()::text);

-- =====================================================
-- POLÍTICAS PARA ESTUDIANTES
-- =====================================================

-- Los estudiantes pueden ver su propia información
CREATE POLICY "Estudiantes pueden ver su propia información" ON estudiantes
    FOR SELECT USING (
        usuario_id = auth.uid()::text OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador', 'profesor')
        )
    );

-- Los estudiantes pueden actualizar su propia información
CREATE POLICY "Estudiantes pueden actualizar su propia información" ON estudiantes
    FOR UPDATE USING (usuario_id = auth.uid()::text);

-- =====================================================
-- POLÍTICAS PARA CURSOS
-- =====================================================

-- Todos los usuarios autenticados pueden ver cursos activos
CREATE POLICY "Usuarios autenticados pueden ver cursos activos" ON cursos
    FOR SELECT USING (auth.role() = 'authenticated' AND activo = true);

-- Solo administradores y coordinadores pueden modificar cursos
CREATE POLICY "Solo administradores y coordinadores pueden modificar cursos" ON cursos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA GRUPOS
-- =====================================================

-- Todos los usuarios autenticados pueden ver grupos activos
CREATE POLICY "Usuarios autenticados pueden ver grupos activos" ON grupos
    FOR SELECT USING (auth.role() = 'authenticated' AND activo = true);

-- Solo administradores y coordinadores pueden modificar grupos
CREATE POLICY "Solo administradores y coordinadores pueden modificar grupos" ON grupos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA INSCRIPCIONES
-- =====================================================

-- Los estudiantes pueden ver sus propias inscripciones
CREATE POLICY "Estudiantes pueden ver sus propias inscripciones" ON inscripciones
    FOR SELECT USING (
        estudiante_id IN (
            SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador', 'profesor')
        )
    );

-- Solo administradores y coordinadores pueden modificar inscripciones
CREATE POLICY "Solo administradores y coordinadores pueden modificar inscripciones" ON inscripciones
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA ASIGNACIONES PROFESOR
-- =====================================================

-- Los profesores pueden ver sus propias asignaciones
CREATE POLICY "Profesores pueden ver sus propias asignaciones" ON asignaciones_profesor
    FOR SELECT USING (
        profesor_id IN (
            SELECT id FROM profesores WHERE usuario_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- Solo administradores y coordinadores pueden modificar asignaciones
CREATE POLICY "Solo administradores y coordinadores pueden modificar asignaciones" ON asignaciones_profesor
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA PREGUNTAS DE EVALUACIÓN
-- =====================================================

-- Todos los usuarios autenticados pueden ver preguntas activas
CREATE POLICY "Usuarios autenticados pueden ver preguntas activas" ON preguntas_evaluacion
    FOR SELECT USING (auth.role() = 'authenticated' AND activa = true);

-- Solo administradores pueden modificar preguntas
CREATE POLICY "Solo administradores pueden modificar preguntas" ON preguntas_evaluacion
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario = 'admin'
        )
    );

-- =====================================================
-- POLÍTICAS PARA EVALUACIONES
-- =====================================================

-- Los estudiantes pueden ver sus propias evaluaciones
CREATE POLICY "Estudiantes pueden ver sus propias evaluaciones" ON evaluaciones
    FOR SELECT USING (
        estudiante_id IN (
            SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
        ) OR
        profesor_id IN (
            SELECT id FROM profesores WHERE usuario_id = auth.uid()::text
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador')
        )
    );

-- Los estudiantes pueden crear evaluaciones para sus cursos
CREATE POLICY "Estudiantes pueden crear evaluaciones" ON evaluaciones
    FOR INSERT WITH CHECK (
        estudiante_id IN (
            SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
        )
    );

-- Los estudiantes pueden actualizar sus propias evaluaciones no completadas
CREATE POLICY "Estudiantes pueden actualizar sus evaluaciones no completadas" ON evaluaciones
    FOR UPDATE USING (
        estudiante_id IN (
            SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
        ) AND completada = false
    );

-- =====================================================
-- POLÍTICAS PARA RESPUESTAS DE EVALUACIÓN
-- =====================================================

-- Los estudiantes pueden ver respuestas de sus propias evaluaciones
CREATE POLICY "Estudiantes pueden ver respuestas de sus evaluaciones" ON respuestas_evaluacion
    FOR SELECT USING (
        evaluacion_id IN (
            SELECT id FROM evaluaciones 
            WHERE estudiante_id IN (
                SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
            )
        ) OR
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario IN ('admin', 'coordinador', 'profesor')
        )
    );

-- Los estudiantes pueden crear respuestas para sus evaluaciones
CREATE POLICY "Estudiantes pueden crear respuestas" ON respuestas_evaluacion
    FOR INSERT WITH CHECK (
        evaluacion_id IN (
            SELECT id FROM evaluaciones 
            WHERE estudiante_id IN (
                SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
            ) AND completada = false
        )
    );

-- Los estudiantes pueden actualizar respuestas de evaluaciones no completadas
CREATE POLICY "Estudiantes pueden actualizar respuestas" ON respuestas_evaluacion
    FOR UPDATE USING (
        evaluacion_id IN (
            SELECT id FROM evaluaciones 
            WHERE estudiante_id IN (
                SELECT id FROM estudiantes WHERE usuario_id = auth.uid()::text
            ) AND completada = false
        )
    );

-- =====================================================
-- POLÍTICAS PARA NOTIFICACIONES
-- =====================================================

-- Los usuarios pueden ver sus propias notificaciones
CREATE POLICY "Usuarios pueden ver sus propias notificaciones" ON notificaciones
    FOR SELECT USING (usuario_id = auth.uid()::text);

-- Los usuarios pueden actualizar sus propias notificaciones
CREATE POLICY "Usuarios pueden actualizar sus propias notificaciones" ON notificaciones
    FOR UPDATE USING (usuario_id = auth.uid()::text);

-- Solo administradores pueden crear notificaciones
CREATE POLICY "Solo administradores pueden crear notificaciones" ON notificaciones
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios 
            WHERE id = auth.uid()::text 
            AND tipo_usuario = 'admin'
        )
    );

-- =====================================================
-- FUNCIONES AUXILIARES PARA RLS
-- =====================================================

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid()::text 
        AND tipo_usuario = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es coordinador
CREATE OR REPLACE FUNCTION is_coordinator()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid()::text 
        AND tipo_usuario = 'coordinador'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es profesor
CREATE OR REPLACE FUNCTION is_teacher()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid()::text 
        AND tipo_usuario = 'profesor'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario es estudiante
CREATE OR REPLACE FUNCTION is_student()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM usuarios 
        WHERE id = auth.uid()::text 
        AND tipo_usuario = 'estudiante'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
