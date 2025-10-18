# Actualización de Preguntas por Carrera - Guía Completa

Este documento proporciona las instrucciones paso a paso para actualizar las preguntas de evaluación con las nuevas preguntas específicas por carrera basadas en el JSON proporcionado.

## 🎯 Objetivo

Reemplazar todas las preguntas existentes con nuevas preguntas específicas para cada carrera de ingeniería, manteniendo la funcionalidad de preguntas generales para el tronco común.

## 📋 Carreras Incluidas

- **Ingeniería de Sistemas** (ID: 1)
- **Ingeniería Civil** (ID: 2)  
- **Ingeniería Ambiental** (ID: 3)
- **Ingeniería de Energías** (ID: 4)
- **Ingeniería de Telecomunicaciones** (ID: 5)
- **Ingeniería Financiera** (ID: 6)
- **Ingeniería Industrial** (ID: 7)
- **Tronco Común de Ingenierías** (ID: NULL)

## 🚀 Instrucciones de Ejecución

### Paso 1: Preparación

Asegúrate de que ya se haya ejecutado el script base para agregar la columna `id_carrera`:

```sql
-- Si no se ha ejecutado antes, ejecutar primero:
\i back/scripts/add-carrera-id-to-preguntas.sql
```

### Paso 2: Ejecutar Script Principal

```sql
-- Ejecutar el script principal que desactiva preguntas existentes e inserta las nuevas
\i back/scripts/actualizar-preguntas-por-carrera.sql
```

Este script:
- ✅ Desactiva todas las preguntas existentes (`activa = false`)
- ✅ Crea las categorías necesarias si no existen
- ✅ Inserta preguntas para: Ambiental, Civil, Sistemas y Tronco Común
- ✅ Incluye funciones temporales para mapear tipos de pregunta
- ✅ Verifica la inserción correcta

### Paso 3: Completar Carreras Restantes

```sql
-- Ejecutar el script para completar las carreras restantes
\i back/scripts/completar-preguntas-carreras-restantes.sql
```

Este script agrega preguntas para:
- ✅ Ingeniería de Energías
- ✅ Ingeniería de Telecomunicaciones  
- ✅ Ingeniería Financiera
- ✅ Ingeniería Industrial

### Paso 4: Verificación

```sql
-- Ejecutar el script de verificación completo
\i back/scripts/verificar-preguntas-por-carrera.sql
```

Este script verifica:
- ✅ Estructura de la tabla
- ✅ Categorías de preguntas
- ✅ Estado general de preguntas
- ✅ Preguntas por carrera
- ✅ Tipos de pregunta
- ✅ Muestras de preguntas
- ✅ Opciones de preguntas
- ✅ Funciones y vistas
- ✅ Índices
- ✅ Integridad de datos

## 📊 Resultados Esperados

### Después del Paso 2:
- **Preguntas desactivadas**: Todas las preguntas existentes
- **Preguntas activas**: ~44 preguntas nuevas (11 por carrera × 4 carreras)
- **Categorías**: 5 categorías (Comunicación, Conocimiento del Tema, Metodología de Enseñanza, Evaluación, Disponibilidad)

### Después del Paso 3:
- **Preguntas activas**: ~88 preguntas nuevas (11 por carrera × 8 carreras)
- **Carreras cubiertas**: 7 carreras específicas + 1 tronco común

### Después del Paso 4:
- **Verificación completa**: Todas las verificaciones deben mostrar ✅
- **Sin errores**: No debe haber preguntas huérfanas o sin orden

## 🔧 Mapeo de Tipos de Pregunta

| Tipo JSON | Tipo Base de Datos | Descripción |
|-----------|-------------------|-------------|
| `escala_grafica` | `rating` | Escala gráfica con etiquetas personalizadas |
| `escala_1_5` | `rating` | Escala del 1 al 5 con etiquetas estándar |
| `escala_frecuencia` | `rating` | Escala de frecuencia (Nunca a Siempre) |
| `abierta` | `text` | Pregunta de texto libre |

## 📝 Estructura de Opciones

### Preguntas de Rating (escala_grafica, escala_1_5, escala_frecuencia):
```json
{
  "type": "scale",
  "min": 1,
  "max": 5,
  "labels": ["Muy deficiente", "Deficiente", "Aceptable", "Buena", "Excelente"]
}
```

### Preguntas de Texto (abierta):
```json
{
  "type": "text",
  "placeholder": "Escribe tu respuesta aquí..."
}
```

## 🎛️ Categorías de Preguntas

1. **Comunicación** - Preguntas sobre respeto, manejo de aula y comunicación
2. **Conocimiento del Tema** - Preguntas sobre dominio y aplicación de contenidos
3. **Metodología de Enseñanza** - Preguntas sobre estrategias y métodos
4. **Evaluación** - Preguntas sobre evaluación y retroalimentación
5. **Disponibilidad** - Preguntas sobre disponibilidad y aporte del docente

## 🔍 Consultas de Verificación

### Ver preguntas por carrera:
```sql
-- Preguntas para Ingeniería de Sistemas
SELECT * FROM obtener_preguntas_por_carrera(1);

-- Preguntas para Tronco Común
SELECT * FROM obtener_preguntas_por_carrera();
```

### Ver todas las preguntas activas:
```sql
SELECT * FROM vista_preguntas_evaluacion_completa;
```

### Estadísticas por carrera:
```sql
SELECT 
    CASE 
        WHEN id_carrera IS NULL THEN 'Tronco Común'
        ELSE 'Carrera ID: ' || id_carrera::text
    END as carrera,
    COUNT(*) as total_preguntas
FROM preguntas_evaluacion
WHERE activa = true
GROUP BY id_carrera
ORDER BY id_carrera NULLS FIRST;
```

## 🚨 Solución de Problemas

### Error: "Columna id_carrera no existe"
```sql
-- Ejecutar primero el script base
\i back/scripts/add-carrera-id-to-preguntas.sql
```

### Error: "Función obtener_preguntas_por_carrera no existe"
```sql
-- Re-ejecutar el script base
\i back/scripts/add-carrera-id-to-preguntas.sql
```

### Error: "Categoría no existe"
```sql
-- Verificar que las categorías se crearon
SELECT * FROM categorias_pregunta;
```

### Preguntas no aparecen
```sql
-- Verificar que las preguntas están activas
SELECT COUNT(*) FROM preguntas_evaluacion WHERE activa = true;
```

## 📈 Próximos Pasos

1. **Probar la funcionalidad** en el frontend
2. **Verificar** que las preguntas se muestran correctamente por carrera
3. **Ajustar** los IDs de carrera si es necesario según tu estructura
4. **Documentar** cualquier cambio específico de tu implementación

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs** de la base de datos
2. **Ejecutar** el script de verificación
3. **Verificar** que todos los scripts se ejecutaron en orden
4. **Consultar** este documento para solución de problemas

---

**Fecha de creación**: $(date)
**Versión**: 1.0.0
**Autor**: Sistema ConCiencia Académica

## ✅ Checklist de Ejecución

- [ ] Script base ejecutado (`add-carrera-id-to-preguntas.sql`)
- [ ] Script principal ejecutado (`actualizar-preguntas-por-carrera.sql`)
- [ ] Script de carreras restantes ejecutado (`completar-preguntas-carreras-restantes.sql`)
- [ ] Script de verificación ejecutado (`verificar-preguntas-por-carrera.sql`)
- [ ] Todas las verificaciones muestran ✅
- [ ] Frontend probado y funcionando
- [ ] Preguntas se muestran correctamente por carrera
