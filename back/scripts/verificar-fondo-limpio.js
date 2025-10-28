const fs = require('fs');
const path = require('path');

// Función para verificar que tenga fondo.webp limpio sin gradiente
function verificarFondoLimpio(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar elementos del fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructura = contenido.includes('bg-gray-50 relative');
    const tieneFondoFijo = contenido.includes('fixed inset-0 z-0');
    const tieneBackgroundAttachment = contenido.includes('backgroundAttachment: \'fixed\'');
    const tieneContenidoPrincipal = contenido.includes('relative z-10');
    
    // Verificar que NO tenga gradiente
    const tieneGradiente = contenido.includes('linear-gradient');
    const tieneBackgroundImageLimpio = contenido.includes('backgroundImage: `url(${fondo})`');
    
    return {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructura,
      tieneFondoFijo,
      tieneBackgroundAttachment,
      tieneContenidoPrincipal,
      tieneGradiente,
      tieneBackgroundImageLimpio,
      fondoCorrecto: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundAttachment && tieneContenidoPrincipal,
      sinGradiente: !tieneGradiente && tieneBackgroundImageLimpio,
      completo: tieneFondo && tieneEstructura && tieneFondoFijo && tieneBackgroundAttachment && tieneContenidoPrincipal && !tieneGradiente && tieneBackgroundImageLimpio
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
      tieneBackgroundImageLimpio: false,
      fondoCorrecto: false,
      sinGradiente: false,
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

console.log('🔍 Verificando fondo.webp limpio sin gradiente en todas las páginas...\n');

let paginasCorrectas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarFondoLimpio(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura base: ${resultado.tieneEstructura ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondo fijo: ${resultado.tieneFondoFijo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background attachment: ${resultado.tieneBackgroundAttachment ? 'Sí' : 'No'}`);
  console.log(`   ✅ Contenido principal: ${resultado.tieneContenidoPrincipal ? 'Sí' : 'No'}`);
  console.log(`   ${resultado.tieneGradiente ? '❌' : '✅'} Sin gradiente: ${resultado.tieneGradiente ? 'No (TIENE GRADIENTE)' : 'Sí'}`);
  console.log(`   ${resultado.tieneBackgroundImageLimpio ? '✅' : '❌'} Background image limpio: ${resultado.tieneBackgroundImageLimpio ? 'Sí' : 'No'}`);
  
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

console.log(`📊 Resumen: ${paginasCorrectas}/${archivos.length} páginas con fondo limpio correcto`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen fondo.webp limpio sin gradiente!');
  console.log('🔗 El fondo ahora se ve como la página de referencia');
} else {
  console.log('❌ Algunas páginas necesitan ajuste');
  console.log('🔧 Revisa los archivos marcados como NECESITA AJUSTE');
}

console.log('\n📋 Configuración del fondo limpio:');
console.log('   • Imagen: fondo.webp');
console.log('   • Sin gradiente: Solo la imagen original');
console.log('   • Efecto: Iconos académicos sutiles en gris claro');
console.log('   • Beneficio: Fondo limpio y profesional como la referencia');
console.log('   • Estilo: bg-gray-50 relative');
console.log('   • Fondo fijo: fixed inset-0 z-0');
console.log('   • Background attachment: fixed');
console.log('   • Contenido: relative z-10');



