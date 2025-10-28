const fs = require('fs');
const path = require('path');

// Función para verificar si un archivo contiene el fondo correcto
function verificarFondo(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar que tenga la imagen de fondo
    const tieneFondo = contenido.includes('fondo.webp');
    const tieneEstructuraCorrecta = contenido.includes('bg-gray-50 relative') && 
                                   contenido.includes('fixed inset-0 z-0') &&
                                   contenido.includes('backgroundImage: `url(${fondo})`');
    
    return {
      archivo: path.basename(archivo),
      tieneFondo,
      tieneEstructuraCorrecta,
      completo: tieneFondo && tieneEstructuraCorrecta
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneFondo: false,
      tieneEstructuraCorrecta: false,
      completo: false,
      error: error.message
    };
  }
}

// Archivos a verificar
const archivos = [
  '../front/src/pages/DashboardDecano.tsx',
  '../front/src/pages/CareerSubjectsPage.tsx',
  '../front/src/pages/ProfessorsPage.tsx'
];

console.log('🔍 Verificando que todas las páginas tengan el mismo fondo...\n');

let todosCorrectos = true;

archivos.forEach(archivo => {
  const resultado = verificarFondo(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ Importa fondo.webp: ${resultado.tieneFondo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Estructura correcta: ${resultado.tieneEstructuraCorrecta ? 'Sí' : 'No'}`);
  
  if (resultado.error) {
    console.log(`   ❌ Error: ${resultado.error}`);
    todosCorrectos = false;
  } else if (resultado.completo) {
    console.log(`   🎉 Estado: CORRECTO`);
  } else {
    console.log(`   ⚠️ Estado: INCOMPLETO`);
    todosCorrectos = false;
  }
  console.log('');
});

if (todosCorrectos) {
  console.log('🎉 ¡Todas las páginas tienen el mismo fondo correctamente implementado!');
  console.log('🔗 Las páginas deberían verse consistentes visualmente');
} else {
  console.log('❌ Algunas páginas no tienen el fondo correcto');
  console.log('🔧 Revisa los archivos marcados como INCOMPLETO');
}

console.log('\n📋 Resumen del fondo implementado:');
console.log('   • Imagen: fondo.webp');
console.log('   • Estilo: bg-gray-50 relative');
console.log('   • Opacidad: 0.1 (sutil)');
console.log('   • Cobertura: cover');
console.log('   • Posición: center');
console.log('   • Repetición: no-repeat');



