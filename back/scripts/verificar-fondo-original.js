const fs = require('fs');
const path = require('path');

// Función para verificar que solo tenga fondo.webp sin overlay
function verificarFondoOriginal(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar elementos del fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructura = contenido.includes('bg-gray-50 relative');
    const tieneFondoFijo = contenido.includes('fixed inset-0 z-0');
    const tieneBackgroundImage = contenido.includes('backgroundImage: `url(${fondo})`');
    const tieneBackgroundAttachment = contenido.includes('backgroundAttachment: \'fixed\'');
    const tieneContenidoPrincipal = contenido.includes('relative z-10');
    
    // Verificar que NO tenga overlay
    const tieneOverlay = contenido.includes('bg-black bg-opacity-');
    const tieneOverlayComentario = contenido.includes('Overlay oscuro');
    
    return {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructura,
      tieneFondoFijo,
      tieneBackgroundImage,
      tieneBackgroundAttachment,
      tieneContenidoPrincipal,
      tieneOverlay,
      tieneOverlayComentario,
      fondoCorrecto: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundImage && tieneBackgroundAttachment && tieneContenidoPrincipal,
      sinOverlay: !tieneOverlay && !tieneOverlayComentario,
      completo: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundImage && tieneBackgroundAttachment && tieneContenidoPrincipal && !tieneOverlay && !tieneOverlayComentario
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneFondo: false,
      tieneEstructura: false,
      tieneFondoFijo: false,
      tieneBackgroundImage: false,
      tieneBackgroundAttachment: false,
      tieneContenidoPrincipal: false,
      tieneOverlay: false,
      tieneOverlayComentario: false,
      fondoCorrecto: false,
      sinOverlay: false,
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

console.log('🔍 Verificando fondo.webp original sin overlay en todas las páginas...\n');

let paginasCorrectas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarFondoOriginal(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura base: ${resultado.tieneEstructura ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondo fijo: ${resultado.tieneFondoFijo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background image: ${resultado.tieneBackgroundImage ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background attachment: ${resultado.tieneBackgroundAttachment ? 'Sí' : 'No'}`);
  console.log(`   ✅ Contenido principal: ${resultado.tieneContenidoPrincipal ? 'Sí' : 'No'}`);
  console.log(`   ${resultado.tieneOverlay ? '❌' : '✅'} Sin overlay: ${resultado.tieneOverlay ? 'No (TIENE OVERLAY)' : 'Sí'}`);
  console.log(`   ${resultado.tieneOverlayComentario ? '❌' : '✅'} Sin comentario overlay: ${resultado.tieneOverlayComentario ? 'No (TIENE COMENTARIO)' : 'Sí'}`);
  
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

console.log(`📊 Resumen: ${paginasCorrectas}/${archivos.length} páginas con fondo original correcto`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen solo el fondo.webp original!');
  console.log('🔗 Sin overlay oscuro, solo la imagen de fondo');
} else {
  console.log('❌ Algunas páginas necesitan ajuste');
  console.log('🔧 Revisa los archivos marcados como NECESITA AJUSTE');
}

console.log('\n📋 Configuración actual:');
console.log('   • Imagen: fondo.webp');
console.log('   • Estilo: bg-gray-50 relative');
console.log('   • Fondo fijo: fixed inset-0 z-0');
console.log('   • Background attachment: fixed');
console.log('   • Sin overlay oscuro');
console.log('   • Contenido: relative z-10');




