const fs = require('fs');
const path = require('path');

// Verificar el cambio en DashboardDecano.tsx
const filePath = '../front/src/pages/DashboardDecano.tsx';

try {
  const content = fs.readFileSync(filePath, 'utf8');
  
  console.log('🔍 Verificando cambios en DashboardDecano.tsx...\n');
  
  // Buscar el botón "Ver Todos los Profesores"
  const verTodosProfesoresMatch = content.match(/label: 'Ver Todos los Profesores'[\s\S]*?className: '([^']+)'/);
  
  if (verTodosProfesoresMatch) {
    const className = verTodosProfesoresMatch[1];
    console.log('📄 Botón "Ver Todos los Profesores":');
    console.log(`   className: ${className}`);
    
    if (className.includes('border-red-300') && className.includes('text-red-600')) {
      console.log('   ✅ ESTILO CORRECTO: Outline rojo (legible)');
    } else if (className.includes('bg-red-600')) {
      console.log('   ❌ ESTILO INCORRECTO: Fondo rojo (difícil de leer)');
    } else {
      console.log('   ⚠️ ESTILO DESCONOCIDO');
    }
  } else {
    console.log('❌ No se encontró el botón "Ver Todos los Profesores"');
  }
  
  // Buscar el botón "Resultados por Carrera"
  const resultadosMatch = content.match(/label: 'Resultados por Carrera'[\s\S]*?className: '([^']+)'/);
  
  if (resultadosMatch) {
    const className = resultadosMatch[1];
    console.log('\n📄 Botón "Resultados por Carrera":');
    console.log(`   className: ${className}`);
    
    if (className.includes('bg-red-600')) {
      console.log('   ✅ ESTILO CORRECTO: Fondo rojo (destacado)');
    } else {
      console.log('   ⚠️ ESTILO DIFERENTE');
    }
  }
  
  console.log('\n📋 Resumen de estilos:');
  console.log('   • "Ver Todos los Profesores" debería tener: border-red-300 text-red-600 hover:bg-red-50');
  console.log('   • "Resultados por Carrera" debería tener: bg-red-600 hover:bg-red-700 text-white');
  
  console.log('\n🔄 Si el cambio no se ve en el navegador:');
  console.log('   1. Presiona Ctrl+F5 para recargar sin caché');
  console.log('   2. O abre las herramientas de desarrollador (F12) y recarga');
  console.log('   3. O cierra y abre el navegador');
  
} catch (error) {
  console.error('❌ Error leyendo el archivo:', error.message);
}




