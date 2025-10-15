-- =====================================================
-- ELIMINAR TRIGGER AUTO-ESTUDIANTE
-- =====================================================
-- Desactiva el trigger que automáticamente añade estudiantes

-- 1. Eliminar el trigger específico
DROP TRIGGER IF EXISTS trigger_insert_user_type ON usuarios;

-- 2. Eliminar la función del trigger
DROP FUNCTION IF EXISTS insert_user_type_record();

-- 3. Verificar que se eliminó correctamente
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'usuarios'
ORDER BY trigger_name;

-- 4. Verificar que la función se eliminó
SELECT 
  proname as function_name,
  prosrc as function_source
FROM pg_proc 
WHERE proname = 'insert_user_type_record';

-- =====================================================
-- INFORMACIÓN
-- =====================================================
-- 
-- ✅ Trigger eliminado: Ya no se crean automáticamente estudiantes
-- ✅ Función eliminada: insert_user_type_record() ya no existe
-- 📝 Ahora puedes crear estudiantes manualmente sin restricciones
-- 
-- =====================================================
