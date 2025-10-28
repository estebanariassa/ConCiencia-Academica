const fs = require('fs');
const path = require('path');

// Función para verificar que tenga gradiente suave
function verificarGradienteSuave(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar elementos del fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructura = contenido.includes('bg-gray-50 relative');
    const tieneFondoFijo = contenido.includes('fixed inset-0 z-0');
    const tieneBackgroundAttachment = contenido.includes('backgroundAttachment: \'fixed\'');
    const tieneContenidoPrincipal = contenido.includes('relative z-10');
    
    // Verificar gradiente suave
    const tieneGradiente = contenido.includes('linear-gradient(rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1))');
    const tieneBackgroundImageCompleto = contenido.includes('backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1)), url(${fondo})`');
    
    return {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructura,
      tieneFondoFijo,
      tieneBackgroundAttachment,
      tieneContenidoPrincipal,
      tieneGradiente,
      tieneBackgroundImageCompleto,
      fondoCorrecto: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundAttachment && tieneContenidoPrincipal,
      gradienteCorrecto: tieneGradiente && tieneBackgroundImageCompleto,
      completo: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundAttachment && tieneContenidoPrincipal && tieneGradiente && tieneBackgroundImageCompleto
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneFondo: false,
      tieneEstructura: false,
      tieneFondoFijo: false,
      tieneBackgroundAttachment: false,
      tieneContenidoPrincipal: false,
      tieneGradiente: false,
      tieneBackgroundImageCompleto: false,
      fondoCorrecto: false,
      gradienteCorrecto: false,
      completo: false,
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

console.log('🔍 Verificando gradiente suave en todos los fondos webp...\n');

let paginasCorrectas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarGradienteSuave(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura base: ${resultado.tieneEstructura ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondo fijo: ${resultado.tieneFondoFijo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background attachment: ${resultado.tieneBackgroundAttachment ? 'Sí' : 'No'}`);
  console.log(`   ✅ Contenido principal: ${resultado.tieneContenidoPrincipal ? 'Sí' : 'No'}`);
  console.log(`   ${resultado.tieneGradiente ? '✅' : '❌'} Gradiente suave: ${resultado.tieneGradiente ? 'Sí' : 'No'}`);
  console.log(`   ${resultado.tieneBackgroundImageCompleto ? '✅' : '❌'} Background image completo: ${resultado.tieneBackgroundImageCompleto ? 'Sí' : 'No'}`);
  
  if (resultado.error) {
    console.log(`   ❌ Error: ${resultado.error}`);
    todasCorrectas = false;
  } else if (resultado.completo) {
    console.log(`   🎉 Estado: CORRECTO`);
    paginasCorrectas++;
  } else {
    console.log(`   ⚠️ Estado: NECESITA AJUSTE`);
    todasCorrectas = false;
  }
  console.log('');
});

console.log(`📊 Resumen: ${paginasCorrectas}/${archivos.length} páginas con gradiente suave correcto`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen gradiente suave en el fondo webp!');
  console.log('🔗 El fondo ahora se ve más elegante y profesional');
} else {
  console.log('❌ Algunas páginas necesitan ajuste');
  console.log('🔧 Revisa los archivos marcados como NECESITA AJUSTE');
}

console.log('\n📋 Configuración del gradiente suave:');
console.log('   • Imagen: fondo.webp');
console.log('   • Gradiente: linear-gradient(rgba(255, 255, 255, 0.1), rgba(0, 0, 0, 0.1))');
console.log('   • Efecto: Gradiente suave de blanco transparente a negro transparente');
console.log('   • Beneficio: Fondo más elegante y profesional');
console.log('   • Estilo: bg-gray-50 relative');
console.log('   • Fondo fijo: fixed inset-0 z-0');
console.log('   • Background attachment: fixed');
console.log('   • Contenido: relative z-10');



