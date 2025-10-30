const fs = require('fs');
const path = require('path');

// Función para verificar si un archivo tiene el fondo exactamente igual al dashboard del decano
function verificarFondoCompleto(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar todos los elementos del fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructuraBase = contenido.includes('bg-gray-50 relative');
    const tieneFondoFijo = contenido.includes('fixed inset-0 z-0');
    const tieneBackgroundImage = contenido.includes('backgroundImage: `url(${fondo})`');
    const tieneBackgroundSize = contenido.includes('backgroundSize: \'cover\'');
    const tieneBackgroundPosition = contenido.includes('backgroundPosition: \'center\'');
    const tieneBackgroundAttachment = contenido.includes('backgroundAttachment: \'fixed\'');
    const tieneOverlay = contenido.includes('bg-black bg-opacity-40');
    const tieneContenidoPrincipal = contenido.includes('relative z-10');
    
    const elementos = {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructuraBase,
      tieneFondoFijo,
      tieneBackgroundImage,
      tieneBackgroundSize,
      tieneBackgroundPosition,
      tieneBackgroundAttachment,
      tieneOverlay,
      tieneContenidoPrincipal
    };
    
    const elementosCorrectos = Object.values(elementos).filter(val => val === true).length - 1; // -1 por el nombre del archivo
    const totalElementos = Object.keys(elementos).length - 1; // -1 por el nombre del archivo
    
    elementos.completo = elementosCorrectos === totalElementos;
    elementos.porcentaje = Math.round((elementosCorrectos / totalElementos) * 100);
    
    return elementos;
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneFondo: false,
      tieneEstructuraBase: false,
      tieneFondoFijo: false,
      tieneBackgroundImage: false,
      tieneBackgroundSize: false,
      tieneBackgroundPosition: false,
      tieneBackgroundAttachment: false,
      tieneOverlay: false,
      tieneContenidoPrincipal: false,
      completo: false,
      porcentaje: 0,
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

console.log('🔍 Verificando que todas las páginas tengan el fondo exactamente igual al dashboard del decano...\n');

let todosCorrectos = true;
let paginasCompletas = 0;

archivos.forEach(archivo => {
  const resultado = verificarFondoCompleto(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ Importa fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura base: ${resultado.tieneEstructuraBase ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondo fijo: ${resultado.tieneFondoFijo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background image: ${resultado.tieneBackgroundImage ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background size: ${resultado.tieneBackgroundSize ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background position: ${resultado.tieneBackgroundPosition ? 'Sí' : 'No'}`);
  console.log(`   ✅ Background attachment: ${resultado.tieneBackgroundAttachment ? 'Sí' : 'No'}`);
  console.log(`   ✅ Overlay oscuro: ${resultado.tieneOverlay ? 'Sí' : 'No'}`);
  console.log(`   ✅ Contenido principal: ${resultado.tieneContenidoPrincipal ? 'Sí' : 'No'}`);
  
  if (resultado.error) {
    console.log(`   ❌ Error: ${resultado.error}`);
    todosCorrectos = false;
  } else if (resultado.completo) {
    console.log(`   🎉 Estado: COMPLETO (${resultado.porcentaje}%)`);
    paginasCompletas++;
  } else {
    console.log(`   ⚠️ Estado: INCOMPLETO (${resultado.porcentaje}%)`);
    todosCorrectos = false;
  }
  console.log('');
});

console.log(`📊 Resumen: ${paginasCompletas}/${archivos.length} páginas completamente correctas`);

if (todosCorrectos) {
  console.log('🎉 ¡Todas las páginas tienen el fondo exactamente igual al dashboard del decano!');
  console.log('🔗 Las páginas deberían verse idénticas visualmente');
} else {
  console.log('❌ Algunas páginas no tienen el fondo correcto');
  console.log('🔧 Revisa los archivos marcados como INCOMPLETO');
}

console.log('\n📋 Configuración exacta del fondo del dashboard del decano:');
console.log('   • Imagen: fondo.webp');
console.log('   • Estilo base: bg-gray-50 relative');
console.log('   • Fondo fijo: fixed inset-0 z-0');
console.log('   • Background image: url(${fondo})');
console.log('   • Background size: cover');
console.log('   • Background position: center');
console.log('   • Background attachment: fixed');
console.log('   • Overlay: bg-black bg-opacity-40');
console.log('   • Contenido: relative z-10');




