-- =====================================================
-- Datos de ejemplo para ConCiencia Académica
-- =====================================================

-- =====================================================
-- 1. INSERTAR CARRERAS
-- =====================================================
INSERT INTO carreras (codigo, nombre, descripcion) VALUES
('ING-SIS', 'Ingeniería de Sistemas', 'Carrera enfocada en el desarrollo de software y sistemas informáticos'),
('ING-IND', 'Ingeniería Industrial', 'Carrera enfocada en la optimización de procesos industriales'),
('ING-CIV', 'Ingeniería Civil', 'Carrera enfocada en la construcción y obras civiles'),
('ING-ELEC', 'Ingeniería Eléctrica', 'Carrera enfocada en sistemas eléctricos y electrónicos'),
('ING-MEC', 'Ingeniería Mecánica', 'Carrera enfocada en sistemas mecánicos y manufactura');

-- =====================================================
-- 2. INSERTAR DEPARTAMENTOS
-- =====================================================
INSERT INTO departamentos (codigo, nombre, descripcion) VALUES
('DEP-SIS', 'Departamento de Sistemas', 'Departamento de Ingeniería de Sistemas'),
('DEP-IND', 'Departamento Industrial', 'Departamento de Ingeniería Industrial'),
('DEP-CIV', 'Departamento Civil', 'Departamento de Ingeniería Civil'),
('DEP-ELEC', 'Departamento Eléctrico', 'Departamento de Ingeniería Eléctrica'),
('DEP-MEC', 'Departamento Mecánico', 'Departamento de Ingeniería Mecánica');

-- =====================================================
-- 3. INSERTAR PERÍODOS ACADÉMICOS
-- =====================================================
INSERT INTO periodos_academicos (codigo, nombre, fecha_inicio, fecha_fin) VALUES
('2024-1', 'Primer Semestre 2024', '2024-01-15', '2024-06-15'),
('2024-2', 'Segundo Semestre 2024', '2024-07-15', '2024-12-15'),
('2025-1', 'Primer Semestre 2025', '2025-01-15', '2025-06-15');

-- =====================================================
-- 4. INSERTAR USUARIOS (PROFESORES)
-- =====================================================
INSERT INTO usuarios (email, nombre, apellido, tipo_usuario) VALUES
('profesor1@universidad.edu.co', 'Carlos', 'Mendoza', 'profesor'),
('profesor2@universidad.edu.co', 'Ana', 'Rodríguez', 'profesor'),
('profesor3@universidad.edu.co', 'Luis', 'García', 'profesor'),
('profesor4@universidad.edu.co', 'María', 'López', 'profesor'),
('coordinador1@universidad.edu.co', 'Roberto', 'Silva', 'coordinador');

-- =====================================================
-- 5. INSERTAR PROFESORES
-- =====================================================
INSERT INTO profesores (usuario_id, departamento_id, codigo_profesor, telefono, fecha_ingreso) VALUES
((SELECT id FROM usuarios WHERE email = 'profesor1@universidad.edu.co'), 1, 'PROF001', '3001234567', '2020-01-15'),
((SELECT id FROM usuarios WHERE email = 'profesor2@universidad.edu.co'), 1, 'PROF002', '3001234568', '2019-08-20'),
((SELECT id FROM usuarios WHERE email = 'profesor3@universidad.edu.co'), 2, 'PROF003', '3001234569', '2021-02-10'),
((SELECT id FROM usuarios WHERE email = 'profesor4@universidad.edu.co'), 3, 'PROF004', '3001234570', '2018-06-01');

-- =====================================================
-- 6. INSERTAR USUARIOS (ESTUDIANTES)
-- =====================================================
INSERT INTO usuarios (email, nombre, apellido, tipo_usuario) VALUES
('estudiante1@universidad.edu.co', 'Juan', 'Pérez', 'estudiante'),
('estudiante2@universidad.edu.co', 'Sofía', 'Martínez', 'estudiante'),
('estudiante3@universidad.edu.co', 'Diego', 'Hernández', 'estudiante'),
('estudiante4@universidad.edu.co', 'Valentina', 'González', 'estudiante'),
('estudiante5@universidad.edu.co', 'Sebastián', 'Torres', 'estudiante');

-- =====================================================
-- 7. INSERTAR ESTUDIANTES
-- =====================================================
INSERT INTO estudiantes (usuario_id, carrera_id, codigo_estudiante, semestre_actual) VALUES
((SELECT id FROM usuarios WHERE email = 'estudiante1@universidad.edu.co'), 1, 'EST001', 6),
((SELECT id FROM usuarios WHERE email = 'estudiante2@universidad.edu.co'), 1, 'EST002', 8),
((SELECT id FROM usuarios WHERE email = 'estudiante3@universidad.edu.co'), 2, 'EST003', 4),
((SELECT id FROM usuarios WHERE email = 'estudiante4@universidad.edu.co'), 1, 'EST004', 10),
((SELECT id FROM usuarios WHERE email = 'estudiante5@universidad.edu.co'), 3, 'EST005', 6);

-- =====================================================
-- 8. INSERTAR CURSOS
-- =====================================================
INSERT INTO cursos (codigo, nombre, creditos, descripcion, departamento_id) VALUES
('SIS-101', 'Programación I', 3, 'Fundamentos de programación', 1),
('SIS-201', 'Estructuras de Datos', 3, 'Algoritmos y estructuras de datos', 1),
('SIS-301', 'Bases de Datos', 3, 'Diseño y manejo de bases de datos', 1),
('SIS-401', 'Ingeniería de Software', 3, 'Metodologías de desarrollo de software', 1),
('IND-101', 'Investigación de Operaciones', 3, 'Optimización y modelado matemático', 2),
('CIV-101', 'Resistencia de Materiales', 4, 'Análisis de esfuerzos y deformaciones', 3);

-- =====================================================
-- 9. INSERTAR GRUPOS
-- =====================================================
INSERT INTO grupos (curso_id, periodo_id, numero_grupo, horario, aula, cupo_maximo) VALUES
(1, 1, '01', 'Lunes 8:00-10:00, Miércoles 8:00-10:00', 'A-101', 30),
(1, 1, '02', 'Martes 10:00-12:00, Jueves 10:00-12:00', 'A-102', 30),
(2, 1, '01', 'Lunes 14:00-16:00, Miércoles 14:00-16:00', 'A-201', 25),
(3, 1, '01', 'Martes 8:00-10:00, Jueves 8:00-10:00', 'A-301', 25),
(4, 1, '01', 'Viernes 8:00-11:00', 'A-401', 20);

-- =====================================================
-- 10. INSERTAR ASIGNACIONES DE PROFESORES
-- =====================================================
INSERT INTO asignaciones_profesor (profesor_id, grupo_id) VALUES
((SELECT id FROM profesores WHERE codigo_profesor = 'PROF001'), 1),
((SELECT id FROM profesores WHERE codigo_profesor = 'PROF002'), 2),
((SELECT id FROM profesores WHERE codigo_profesor = 'PROF001'), 3),
((SELECT id FROM profesores WHERE codigo_profesor = 'PROF002'), 4),
((SELECT id FROM profesores WHERE codigo_profesor = 'PROF003'), 5);

-- =====================================================
-- 11. INSERTAR INSCRIPCIONES DE ESTUDIANTES
-- =====================================================
INSERT INTO inscripciones (estudiante_id, grupo_id) VALUES
((SELECT id FROM estudiantes WHERE codigo_estudiante = 'EST001'), 1),
((SELECT id FROM estudiantes WHERE codigo_estudiante = 'EST002'), 1),
((SELECT id FROM estudiantes WHERE codigo_estudiante = 'EST003'), 2),
((SELECT id FROM estudiantes WHERE codigo_estudiante = 'EST004'), 3),
((SELECT id FROM estudiantes WHERE codigo_estudiante = 'EST005'), 4);

-- =====================================================
-- 12. INSERTAR CATEGORÍAS DE PREGUNTAS
-- =====================================================
INSERT INTO categorias_pregunta (nombre, descripcion, orden) VALUES
('Metodología de Enseñanza', 'Preguntas sobre la forma de enseñar del profesor', 1),
('Conocimiento del Tema', 'Preguntas sobre el dominio del profesor en la materia', 2),
('Comunicación', 'Preguntas sobre la claridad en la comunicación', 3),
('Evaluación', 'Preguntas sobre los métodos de evaluación', 4),
('Disponibilidad', 'Preguntas sobre la disponibilidad del profesor', 5);

-- =====================================================
-- 13. INSERTAR PREGUNTAS DE EVALUACIÓN
-- =====================================================
INSERT INTO preguntas_evaluacion (categoria_id, texto_pregunta, descripcion, tipo_pregunta, obligatoria, orden) VALUES
(1, '¿El profesor utiliza métodos de enseñanza variados y apropiados?', 'Evalúa la diversidad metodológica', 'rating', true, 1),
(1, '¿Las clases son dinámicas y participativas?', 'Evalúa la interacción en clase', 'rating', true, 2),
(2, '¿El profesor demuestra dominio del tema?', 'Evalúa el conocimiento técnico', 'rating', true, 3),
(2, '¿Responde adecuadamente las preguntas de los estudiantes?', 'Evalúa la capacidad de respuesta', 'rating', true, 4),
(3, '¿Explica los conceptos de manera clara y comprensible?', 'Evalúa la claridad en la explicación', 'rating', true, 5),
(3, '¿Utiliza ejemplos prácticos para ilustrar los conceptos?', 'Evalúa el uso de ejemplos', 'rating', true, 6),
(4, '¿Los criterios de evaluación son claros y justos?', 'Evalúa la transparencia en evaluación', 'rating', true, 7),
(4, '¿Proporciona retroalimentación útil sobre el desempeño?', 'Evalúa la calidad de la retroalimentación', 'rating', true, 8),
(5, '¿Está disponible para consultas fuera del horario de clase?', 'Evalúa la disponibilidad extra-clase', 'rating', true, 9),
(5, '¿Responde oportunamente a las consultas por correo?', 'Evalúa la responsividad', 'rating', true, 10);

-- =====================================================
-- 14. INSERTAR NOTIFICACIONES DE EJEMPLO
-- =====================================================
INSERT INTO notificaciones (usuario_id, titulo, mensaje, tipo, enlace) VALUES
((SELECT id FROM usuarios WHERE email = 'estudiante1@universidad.edu.co'), 'Evaluación Pendiente', 'Tienes una evaluación pendiente para el curso Programación I', 'warning', '/evaluaciones'),
((SELECT id FROM usuarios WHERE email = 'profesor1@universidad.edu.co'), 'Nueva Evaluación', 'Se ha completado una nueva evaluación de tu curso', 'info', '/reportes'),
((SELECT id FROM usuarios WHERE email = 'coordinador1@universidad.edu.co'), 'Reporte Mensual', 'El reporte mensual de evaluaciones está disponible', 'info', '/reportes');
