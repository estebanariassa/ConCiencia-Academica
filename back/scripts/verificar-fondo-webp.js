const fs = require('fs');
const path = require('path');

// Función para verificar si un archivo tiene el fondo correcto
function verificarFondoSimple(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar elementos esenciales del fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructura = contenido.includes('bg-gray-50 relative');
    const tieneFondoFijo = contenido.includes('fixed inset-0 z-0');
    const tieneBackgroundImage = contenido.includes('backgroundImage: `url(${fondo})`');
    const tieneBackgroundAttachment = contenido.includes('backgroundAttachment: \'fixed\'');
    const tieneOverlay = contenido.includes('bg-black bg-opacity-40');
    const tieneContenidoPrincipal = contenido.includes('relative z-10');
    
    const elementosCorrectos = [
      tieneFondo,
      tieneEstructura,
      tieneFondoFijo,
      tieneBackgroundImage,
      tieneBackgroundAttachment,
      tieneOverlay,
      tieneContenidoPrincipal
    ].filter(Boolean).length;
    
    return {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructura,
      tieneFondoFijo,
      tieneBackgroundImage,
      tieneBackgroundAttachment,
      tieneOverlay,
      tieneContenidoPrincipal,
      elementosCorrectos,
      totalElementos: 7,
      porcentaje: Math.round((elementosCorrectos / 7) * 100),
      completo: elementosCorrectos === 7
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneFondo: false,
      tieneEstructura: false,
      tieneFondoFijo: false,
      tieneBackgroundImage: false,
      tieneBackgroundAttachment: false,
      tieneOverlay: false,
      tieneContenidoPrincipal: false,
      elementosCorrectos: 0,
      totalElementos: 7,
      porcentaje: 0,
      completo: false,
      error: error.message
    };
  }
}

// Archivos principales a verificar
const archivos = [
  '../front/src/pages/DashboardDecano.tsx',
  '../front/src/pages/CareerSubjectsPage.tsx',
  '../front/src/pages/ProfessorsPage.tsx',
  '../front/src/pages/DashboardCoordinador.tsx',
  '../front/src/pages/DashboardProfesor.tsx',
  '../front/src/pages/DashboardAdmin.tsx',
  '../front/src/pages/DashboardEstudiante.tsx'
];

console.log('🔍 Verificando fondo webp en todas las páginas...\n');

let paginasCompletas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarFondoSimple(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura base: ${resultado.tieneEstructura ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondo fijo: ${resultado.tieneFondoFijo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background image: ${resultado.tieneBackgroundImage ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background attachment: ${resultado.tieneBackgroundAttachment ? 'Sí' : 'No'}`);
  console.log(`   ✅ Overlay oscuro: ${resultado.tieneOverlay ? 'Sí' : 'No'}`);
  console.log(`   ✅ Contenido principal: ${resultado.tieneContenidoPrincipal ? 'Sí' : 'No'}`);
  
  if (resultado.error) {
    console.log(`   ❌ Error: ${resultado.error}`);
    todasCorrectas = false;
  } else if (resultado.completo) {
    console.log(`   🎉 Estado: COMPLETO (${resultado.porcentaje}%)`);
    paginasCompletas++;
  } else {
    console.log(`   ⚠️ Estado: INCOMPLETO (${resultado.porcentaje}%)`);
    todasCorrectas = false;
  }
  console.log('');
});

console.log(`📊 Resumen: ${paginasCompletas}/${archivos.length} páginas completamente correctas`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen el fondo webp correctamente implementado!');
  console.log('🔗 Las páginas deberían verse idénticas al dashboard del decano');
} else {
  console.log('❌ Algunas páginas necesitan ajustes');
  console.log('🔧 Revisa los archivos marcados como INCOMPLETO');
}

console.log('\n📋 Configuración del fondo webp:');
console.log('   • Imagen: fondo.webp');
console.log('   • Estilo: bg-gray-50 relative');
console.log('   • Fondo fijo: fixed inset-0 z-0');
console.log('   • Background attachment: fixed');
console.log('   • Overlay: bg-black bg-opacity-40');
console.log('   • Contenido: relative z-10');



