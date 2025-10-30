#!/usr/bin/env node

/**
 * Script de demostración para mostrar cómo se verían las gráficas del dashboard
 * Este script muestra ejemplos visuales de las gráficas con datos de ejemplo
 */

console.log('🎨 DEMOSTRACIÓN DE GRÁFICAS DEL DASHBOARD');
console.log('=' * 60);

// Función para crear barras visuales
function crearBarra(valor, maximo, ancho = 30) {
  const longitud = Math.round((valor / maximo) * ancho);
  return '█'.repeat(longitud) + '░'.repeat(ancho - longitud);
}

// Función para crear gráfico de pastel visual
function crearPastel(datos) {
  const total = datos.reduce((sum, item) => sum + item.value, 0);
  const simbolos = ['█', '▓', '▒', '░'];
  
  console.log('\n🥧 GRÁFICO DE DISTRIBUCIÓN (Pastel)');
  console.log('─'.repeat(50));
  
  datos.forEach((item, index) => {
    const porcentaje = Math.round((item.value / total) * 100);
    const simbolo = simbolos[index % simbolos.length];
    const barra = simbolo.repeat(Math.round(porcentaje / 2));
    console.log(`${item.name.padEnd(20)} | ${porcentaje}% ${barra}`);
  });
}

// Función para crear gráfico de líneas visual
function crearLinea(datos) {
  console.log('\n📈 GRÁFICO DE TENDENCIAS (Línea)');
  console.log('─'.repeat(50));
  
  const maxValor = Math.max(...datos.map(d => d.rating));
  const minValor = Math.min(...datos.map(d => d.rating));
  const rango = maxValor - minValor;
  
  // Crear escala visual
  const escala = [];
  for (let i = 0; i < 10; i++) {
    const valor = minValor + (rango * i / 9);
    escala.push(valor.toFixed(1));
  }
  
  console.log('Escala: ' + escala.join(' '));
  console.log('─'.repeat(50));
  
  datos.forEach(dato => {
    const posicion = Math.round(((dato.rating - minValor) / rango) * 9);
    const linea = ' '.repeat(posicion) + '●' + '─'.repeat(9 - posicion);
    console.log(`${dato.period.padEnd(8)} | ${dato.rating.toFixed(1)} ${linea}`);
  });
}

// Función para crear gráfico de barras visual
function crearBarras(datos) {
  console.log('\n📊 GRÁFICO POR CATEGORÍA (Barras)');
  console.log('─'.repeat(50));
  
  const maxValor = Math.max(...datos.map(d => d.rating));
  
  datos.forEach(dato => {
    const barra = crearBarra(dato.rating, maxValor, 25);
    console.log(`${dato.category.padEnd(15)} | ${dato.rating.toFixed(1)} ${barra}`);
  });
}

// Función para crear gráfico radar visual
function crearRadar(datos) {
  console.log('\n🎯 PERFIL DE COMPETENCIAS (Radar)');
  console.log('─'.repeat(50));
  
  const maxValor = 5.0;
  
  datos.forEach(dato => {
    const barra = crearBarra(dato.A, maxValor, 20);
    console.log(`${dato.subject.padEnd(15)} | ${dato.A.toFixed(1)} ${barra}`);
  });
}

// Datos de ejemplo
const datosTendencia = [
  { period: '2023-1', rating: 4.2, evaluations: 15 },
  { period: '2023-2', rating: 4.4, evaluations: 18 },
  { period: '2024-1', rating: 4.3, evaluations: 22 },
  { period: '2024-2', rating: 4.6, evaluations: 25 },
  { period: '2025-1', rating: 4.5, evaluations: 28 },
  { period: '2025-2', rating: 4.8, evaluations: 32 }
];

const datosDistribucion = [
  { name: 'Excelente (5.0)', value: 35, color: '#10B981' },
  { name: 'Muy Bueno (4.0-4.9)', value: 45, color: '#3B82F6' },
  { name: 'Bueno (3.0-3.9)', value: 20, color: '#F59E0B' }
];

const datosCategoria = [
  { category: 'Comunicación', rating: 4.7 },
  { category: 'Conocimiento', rating: 4.5 },
  { category: 'Metodología', rating: 4.6 },
  { category: 'Evaluación', rating: 4.4 },
  { category: 'Disponibilidad', rating: 4.8 }
];

const datosCompetencia = [
  { subject: 'Comunicación', A: 4.7, fullMark: 5 },
  { subject: 'Conocimiento', A: 4.5, fullMark: 5 },
  { subject: 'Metodología', A: 4.6, fullMark: 5 },
  { subject: 'Evaluación', A: 4.4, fullMark: 5 },
  { subject: 'Disponibilidad', A: 4.8, fullMark: 5 }
];

// Mostrar las gráficas
console.log('\n🎨 PREVISUALIZACIÓN DE GRÁFICAS DEL DASHBOARD');
console.log('Estas son las gráficas que se mostrarán en el frontend:');

crearLinea(datosTendencia);
crearPastel(datosDistribucion);
crearBarras(datosCategoria);
crearRadar(datosCompetencia);

// Estadísticas rápidas
console.log('\n📋 ESTADÍSTICAS RÁPIDAS (Tarjetas)');
console.log('─'.repeat(50));
console.log(`Mejor Calificación    | 5.0`);
console.log(`Total Evaluaciones    | 100`);
console.log(`Cursos Evaluados      | 8`);
console.log(`Período               | 2025-2`);
console.log(`Calificación Promedio | 4.6`);

// Resumen visual
console.log('\n🎨 RESUMEN VISUAL DE LAS GRÁFICAS');
console.log('─'.repeat(50));
console.log('┌─────────────────────────────────────────────────┐');
console.log('│  📈 TENDENCIAS: Línea ascendente con puntos    │');
console.log('│     (Mejora gradual de 4.2 a 4.8)              │');
console.log('├─────────────────────────────────────────────────┤');
console.log('│  🥧 DISTRIBUCIÓN: Pastel con 3 secciones       │');
console.log('│     (Verde: 35%, Azul: 45%, Amarillo: 20%)     │');
console.log('├─────────────────────────────────────────────────┤');
console.log('│  📊 CATEGORÍAS: 5 barras horizontales          │');
console.log('│     (Todas entre 4.4 y 4.8)                    │');
console.log('├─────────────────────────────────────────────────┤');
console.log('│  🎯 PERFIL: 5 barras de competencias           │');
console.log('│     (Forma balanceada y equilibrada)           │');
console.log('├─────────────────────────────────────────────────┤');
console.log('│  📋 ESTADÍSTICAS: 5 tarjetas con números       │');
console.log('│     (Colores distintivos y métricas clave)     │');
console.log('└─────────────────────────────────────────────────┘');

// Comparación antes vs después
console.log('\n🔄 COMPARACIÓN: ANTES vs DESPUÉS');
console.log('─'.repeat(50));
console.log('ANTES (Sin datos):');
console.log('  ❌ Gráfico de tendencias: Línea plana en 0');
console.log('  ❌ Distribución: Vacío');
console.log('  ❌ Categorías: Sin barras');
console.log('  ❌ Perfil: Sin forma');
console.log('  ❌ Estadísticas: 0 evaluaciones');

console.log('\nDESPUÉS (Con previsualización):');
console.log('  ✅ Gráfico de tendencias: Línea ascendente');
console.log('  ✅ Distribución: Pastel con colores');
console.log('  ✅ Categorías: Barras de diferentes alturas');
console.log('  ✅ Perfil: Forma balanceada');
console.log('  ✅ Estadísticas: Números realistas');

console.log('\n🎉 ¡Así es como se verían las gráficas en el dashboard!');
console.log('📋 Para ver esto en el frontend:');
console.log('   1. Ve a: http://localhost:3001/reports');
console.log('   2. Las gráficas mostrarán datos de ejemplo');
console.log('   3. Aparecerá un indicador de "Datos de ejemplo"');
console.log('   4. ¡Disfruta de la previsualización!');

console.log('\n💡 BENEFICIOS DE LA PREVISUALIZACIÓN:');
console.log('   - Los usuarios ven cómo se vería el dashboard');
console.log('   - No hay pantallas vacías o confusas');
console.log('   - Se mantiene la experiencia visual consistente');
console.log('   - Los desarrolladores pueden probar el diseño');
console.log('   - Los stakeholders pueden ver el resultado final');








