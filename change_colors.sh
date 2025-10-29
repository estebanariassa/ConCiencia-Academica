#!/bin/bash

# Script para cambiar colores rojos por el rojo oficial de la universidad #E30613
# Este script reemplaza las clases de Tailwind CSS red-* por clases personalizadas

echo "🎨 Cambiando colores rojos por el rojo oficial de la universidad #E30613..."

# Función para reemplazar clases de Tailwind
replace_tailwind_classes() {
    local file="$1"
    echo "📝 Procesando: $file"
    
    # Reemplazar clases red-600 por text-university-red
    sed -i 's/text-red-600/text-university-red/g' "$file"
    
    # Reemplazar clases red-500 por border-university-red
    sed -i 's/border-red-500/border-university-red/g' "$file"
    sed -i 's/focus:ring-red-500/focus:ring-university-red/g' "$file"
    sed -i 's/focus:border-red-500/focus:border-university-red/g' "$file"
    
    # Reemplazar clases red-100 por bg-university-red-light
    sed -i 's/bg-red-100/bg-university-red-light/g' "$file"
    
    # Reemplazar clases red-200 por border-university-red-light
    sed -i 's/border-red-200/border-university-red-light/g' "$file"
    
    # Reemplazar clases red-50 por bg-university-red-light
    sed -i 's/bg-red-50/bg-university-red-light/g' "$file"
    
    # Reemplazar clases red-800 por text-university-red-dark
    sed -i 's/text-red-800/text-university-red-dark/g' "$file"
    
    # Reemplazar clases red-700 por hover:bg-university-red
    sed -i 's/hover:bg-red-700/hover:bg-university-red/g' "$file"
    
    # Reemplazar clases red-300 por hover:border-university-red
    sed -i 's/hover:border-red-300/hover:border-university-red/g' "$file"
    
    echo "✅ Completado: $file"
}

# Lista de archivos a procesar
files=(
    "front/src/pages/evaluation/TeacherSelection.tsx"
    "front/src/pages/SurveyView.tsx"
    "front/src/pages/SurveyResults.tsx"
    "front/src/pages/ScheduleSurveys.tsx"
    "front/src/pages/ProfessorsPage.tsx"
    "front/src/pages/ManageProfessors.tsx"
    "front/src/pages/ForgotPassword.tsx"
    "front/src/pages/CareerSubjectsPage.tsx"
    "front/src/pages/Dashboard.tsx"
    "front/src/pages/DashboardEstudiante.tsx"
    "front/src/pages/DashboardProfesor.tsx"
    "front/src/pages/DashboardCoordinador.tsx"
    "front/src/pages/DashboardDecano.tsx"
)

# Procesar cada archivo
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        replace_tailwind_classes "$file"
    else
        echo "⚠️  Archivo no encontrado: $file"
    fi
done

echo "🎉 ¡Cambio de colores completado!"
echo "📋 Resumen de cambios:"
echo "   - red-600 → text-university-red"
echo "   - red-500 → border-university-red / focus:ring-university-red"
echo "   - red-100 → bg-university-red-light"
echo "   - red-200 → border-university-red-light"
echo "   - red-50 → bg-university-red-light"
echo "   - red-800 → text-university-red-dark"
echo "   - red-700 → hover:bg-university-red"
echo "   - red-300 → hover:border-university-red"
