const fs = require('fs');
const path = require('path');

// Función para verificar colores representativos
function verificarColoresRepresentativos(archivo) {
  try {
    const contenido = fs.readFileSync(archivo, 'utf8');
    
    // Verificar elementos con colores representativos
    const tieneIconoRojo = contenido.includes('text-red-600');
    const tieneFondoRojo = contenido.includes('bg-red-100');
    const tieneBotonRojo = contenido.includes('bg-red-600');
    const tieneHoverRojo = contenido.includes('hover:bg-red-700');
    const tieneFocusRojo = contenido.includes('focus:border-red-500');
    const tieneRingRojo = contenido.includes('focus:ring-red-500');
    
    // Verificar que NO tenga colores no representativos
    const tieneAzul = contenido.includes('text-blue-600') || contenido.includes('bg-blue-600');
    const tieneVerde = contenido.includes('text-green-600') || contenido.includes('bg-green-600');
    const tieneAmarillo = contenido.includes('text-yellow-600') || contenido.includes('bg-yellow-600');
    const tienePurple = contenido.includes('text-purple-600') || contenido.includes('bg-purple-600');
    
    return {
      archivo: path.basename(archivo),
      tieneIconoRojo,
      tieneFondoRojo,
      tieneBotonRojo,
      tieneHoverRojo,
      tieneFocusRojo,
      tieneRingRojo,
      tieneAzul,
      tieneVerde,
      tieneAmarillo,
      tienePurple,
      coloresCorrectos: tieneIconoRojo && tieneFondoRojo && tieneBotonRojo && tieneHoverRojo,
      sinColoresIncorrectos: !tieneAzul && !tieneVerde && !tieneAmarillo && !tienePurple,
      completo: tieneIconoRojo && tieneFondoRojo && tieneBotonRojo && tieneHoverRojo && !tieneAzul && !tieneVerde && !tieneAmarillo && !tienePurple
    };
  } catch (error) {
    return {
      archivo: path.basename(archivo),
      tieneIconoRojo: false,
      tieneFondoRojo: false,
      tieneBotonRojo: false,
      tieneHoverRojo: false,
      tieneFocusRojo: false,
      tieneRingRojo: false,
      tieneAzul: false,
      tieneVerde: false,
      tieneAmarillo: false,
      tienePurple: false,
      coloresCorrectos: false,
      sinColoresIncorrectos: false,
      completo: false,
      error: error.message
    };
  }
}

// Archivos a verificar
const archivos = [
  '../front/src/pages/CareerResultsPage.tsx',
  '../front/src/pages/DashboardDecano.tsx'
];

console.log('🔍 Verificando colores representativos (rojo y blanco) en las páginas...\n');

let paginasCorrectas = 0;
let todasCorrectas = true;

archivos.forEach(archivo => {
  const resultado = verificarColoresRepresentativos(archivo);
  
  console.log(`📄 ${resultado.archivo}:`);
  console.log(`   ✅ Iconos rojos: ${resultado.tieneIconoRojo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Fondos rojos: ${resultado.tieneFondoRojo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Botones rojos: ${resultado.tieneBotonRojo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Hover rojo: ${resultado.tieneHoverRojo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Focus rojo: ${resultado.tieneFocusRojo ? 'Sí' : 'No'}`);
  console.log(`   ✅ Ring rojo: ${resultado.tieneRingRojo ? 'Sí' : 'No'}`);
  
  if (resultado.tieneAzul) {
    console.log(`   ❌ Tiene azul: Sí (debe ser rojo)`);
    todasCorrectas = false;
  } else {
    console.log(`   ✅ Sin azul: Sí`);
  }
  
  if (resultado.tieneVerde) {
    console.log(`   ❌ Tiene verde: Sí (debe ser rojo)`);
    todasCorrectas = false;
  } else {
    console.log(`   ✅ Sin verde: Sí`);
  }
  
  if (resultado.tieneAmarillo) {
    console.log(`   ❌ Tiene amarillo: Sí (debe ser rojo)`);
    todasCorrectas = false;
  } else {
    console.log(`   ✅ Sin amarillo: Sí`);
  }
  
  if (resultado.tienePurple) {
    console.log(`   ❌ Tiene púrpura: Sí (debe ser rojo)`);
    todasCorrectas = false;
  } else {
    console.log(`   ✅ Sin púrpura: Sí`);
  }
  
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

console.log(`📊 Resumen: ${paginasCorrectas}/${archivos.length} páginas con colores representativos correctos`);

if (todasCorrectas) {
  console.log('🎉 ¡Todas las páginas tienen colores representativos correctos!');
  console.log('🔴 Los colores rojos representan la identidad de la universidad');
} else {
  console.log('❌ Algunas páginas necesitan ajuste de colores');
  console.log('🔧 Revisa los archivos marcados como NECESITA AJUSTE');
}

console.log('\n📋 Colores representativos aplicados:');
console.log('   • Iconos: text-red-600');
console.log('   • Fondos de iconos: bg-red-100');
console.log('   • Botones principales: bg-red-600');
console.log('   • Hover de botones: hover:bg-red-700');
console.log('   • Focus de inputs: focus:border-red-500');
console.log('   • Ring de focus: focus:ring-red-500');
console.log('   • Beneficio: Identidad visual consistente con la universidad');




