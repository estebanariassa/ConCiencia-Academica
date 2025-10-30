const fs = require('fs');
const path = require('path');

// Función para verificar la opacidad del overlay
function verificarOpacidad(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar la opacidad del overlay
    const tieneOverlay40 = contenido.includes('bg-opacity-40');
    const tieneOverlay60 = contenido.includes('bg-opacity-60');
    const tieneOverlay = contenido.includes('bg-black bg-opacity-');
    
    return {
      archivo: path.basename(archivo),
      tieneOverlay40,
      tieneOverlay60,
      tieneOverlay,
      opacidadCorrecta: tieneOverlay60 && !tieneOverlay40
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneOverlay40: false,
      tieneOverlay60: false,
      tieneOverlay: false,
      opacidadCorrecta: false,
      error: error.message
    };
  }
}

// Archivos a verificar
const archivos = [
  '../front/src/pages/DashboardDecano.tsx',
  '../front/src/pages/CareerSubjectsPage.tsx',
  '../front/src/pages/ProfessorsPage.tsx',
  '../front/src/pages/DashboardCoordinador.tsx',
  '../front/src/pages/DashboardProfesor.tsx',
  '../front/src/pages/DashboardAdmin.tsx',
  '../front/src/pages/DashboardEstudiante.tsx'
];

console.log('🔍 Verificando opacidad del overlay en todas las páginas...\n');

let paginasCorrectas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarOpacidad(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ${resultado.tieneOverlay40 ? '❌' : '✅'} Opacidad 40%: ${resultado.tieneOverlay40 ? 'Sí (ANTIGUO)' : 'No'}`);
  console.log(`   ${resultado.tieneOverlay60 ? '✅' : '❌'} Opacidad 60%: ${resultado.tieneOverlay60 ? 'Sí (CORRECTO)' : 'No'}`);
  console.log(`   ${resultado.tieneOverlay ? '✅' : '❌'} Tiene overlay: ${resultado.tieneOverlay ? 'Sí' : 'No'}`);
  
  if (resultado.error) {
    console.log(`   ❌ Error: ${resultado.error}`);
    todasCorrectas = false;
  } else if (resultado.opacidadCorrecta) {
    console.log(`   🎉 Estado: CORRECTO`);
    paginasCorrectas++;
  } else {
    console.log(`   ⚠️ Estado: NECESITA ACTUALIZACIÓN`);
    todasCorrectas = false;
  }
  console.log('');
});

console.log(`📊 Resumen: ${paginasCorrectas}/${archivos.length} páginas con opacidad correcta`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen la opacidad correcta (60%)!');
  console.log('🔗 El fondo ya no se ve transparente y es más sólido');
} else {
  console.log('❌ Algunas páginas necesitan actualización');
  console.log('🔧 Revisa los archivos marcados como NECESITA ACTUALIZACIÓN');
}

console.log('\n📋 Cambio realizado:');
console.log('   • Antes: bg-opacity-40 (40% de opacidad - muy transparente)');
console.log('   • Ahora: bg-opacity-60 (60% de opacidad - más sólido)');
console.log('   • Beneficio: Mejor legibilidad y menos interferencia visual');




