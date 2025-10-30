#!/usr/bin/env node

/**
 * Script para generar datos de ejemplo que muestren cómo se verían las gráficas
 * Este script crea datos realistas para visualizar las gráficas del dashboard
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Las variables de entorno no están configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para generar datos de tendencias
function generarDatosTendencias() {
  const periodos = ['2023-1', '2023-2', '2024-1', '2024-2', '2025-1', '2025-2'];
  const tendencias = [];
  
  let calificacionBase = 4.0;
  
  periodos.forEach(periodo => {
    // Simular mejora gradual con variación
    const variacion = (Math.random() - 0.5) * 0.3; // ±0.15
    const calificacion = Math.round((calificacionBase + variacion) * 100) / 100;
    calificacionBase += 0.1; // Mejora gradual
    
    tendencias.push({
      periodo,
      calificacion: Math.max(3.0, Math.min(5.0, calificacion))
    });
  });
  
  return tendencias;
}

// Función para generar datos de distribución
function generarDatosDistribucion() {
  return [
    { categoria: 'Excelente (5.0)', porcentaje: 35, cantidad: 35, color: '#10B981' },
    { categoria: 'Muy Bueno (4.0-4.9)', porcentaje: 45, cantidad: 45, color: '#3B82F6' },
    { categoria: 'Bueno (3.0-3.9)', porcentaje: 20, cantidad: 20, color: '#F59E0B' }
  ];
}

// Función para generar datos por categoría
function generarDatosCategoria() {
  const categorias = [
    { nombre: 'Comunicación', calificacion: 4.7 },
    { nombre: 'Conocimiento', calificacion: 4.5 },
    { nombre: 'Metodología', calificacion: 4.6 },
    { nombre: 'Evaluación', calificacion: 4.4 },
    { nombre: 'Disponibilidad', calificacion: 4.8 }
  ];
  
  return categorias;
}

// Función para generar datos de perfil de competencias
function generarDatosPerfil() {
  return {
    comunicacion: 4.7,
    conocimiento: 4.5,
    metodologia: 4.6,
    evaluacion: 4.4,
    disponibilidad: 4.8
  };
}

// Función para generar estadísticas rápidas
function generarEstadisticasRapidas() {
  return {
    mejorCalificacion: 5.0,
    totalEvaluaciones: 100,
    cursosEvaluados: 8,
    periodo: '2025-2',
    calificacionPromedio: 4.6
  };
}

async function mostrarEjemplosGraficas() {
  console.log('📊 EJEMPLOS DE CÓMO SE VERÍAN LAS GRÁFICAS DEL DASHBOARD\n');
  console.log('=' * 60);

  // 1. Gráfico de Tendencias
  console.log('\n📈 1. GRÁFICO DE TENDENCIAS (Línea)');
  console.log('Título: "Evolución de Calificaciones por Período"');
  console.log('─'.repeat(50));
  const tendencias = generarDatosTendencias();
  tendencias.forEach(tendencia => {
    const barra = '█'.repeat(Math.round(tendencia.calificacion * 10));
    console.log(`${tendencia.periodo.padEnd(8)} | ${tendencia.calificacion.toFixed(1)} ${barra}`);
  });

  // 2. Gráfico de Distribución
  console.log('\n🥧 2. GRÁFICO DE DISTRIBUCIÓN (Pastel)');
  console.log('Título: "Distribución de Calificaciones"');
  console.log('─'.repeat(50));
  const distribucion = generarDatosDistribucion();
  distribucion.forEach(item => {
    const barra = '█'.repeat(Math.round(item.porcentaje / 2));
    console.log(`${item.categoria.padEnd(20)} | ${item.porcentaje}% ${barra} (${item.cantidad} eval.)`);
  });

  // 3. Gráfico por Categoría
  console.log('\n📊 3. GRÁFICO POR CATEGORÍA (Barras)');
  console.log('Título: "Calificaciones por Dimensión"');
  console.log('─'.repeat(50));
  const categorias = generarDatosCategoria();
  categorias.forEach(categoria => {
    const barra = '█'.repeat(Math.round(categoria.calificacion * 10));
    console.log(`${categoria.nombre.padEnd(15)} | ${categoria.calificacion.toFixed(1)} ${barra}`);
  });

  // 4. Perfil de Competencias
  console.log('\n🎯 4. PERFIL DE COMPETENCIAS (Radar)');
  console.log('Título: "Perfil de Competencias"');
  console.log('─'.repeat(50));
  const perfil = generarDatosPerfil();
  Object.entries(perfil).forEach(([competencia, valor]) => {
    const barra = '█'.repeat(Math.round(valor * 10));
    console.log(`${competencia.padEnd(15)} | ${valor.toFixed(1)} ${barra}`);
  });

  // 5. Estadísticas Rápidas
  console.log('\n📋 5. ESTADÍSTICAS RÁPIDAS (Tarjetas)');
  console.log('Título: "Métricas Clave del Período"');
  console.log('─'.repeat(50));
  const stats = generarEstadisticasRapidas();
  console.log(`Mejor Calificación    | ${stats.mejorCalificacion}`);
  console.log(`Total Evaluaciones    | ${stats.totalEvaluaciones}`);
  console.log(`Cursos Evaluados      | ${stats.cursosEvaluados}`);
  console.log(`Período               | ${stats.periodo}`);
  console.log(`Calificación Promedio | ${stats.calificacionPromedio}`);

  // 6. Resumen Visual
  console.log('\n🎨 6. RESUMEN VISUAL DE LAS GRÁFICAS');
  console.log('─'.repeat(50));
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│  📈 TENDENCIAS: Línea roja ascendente          │');
  console.log('│     (Mejora gradual de 4.0 a 4.8)              │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  🥧 DISTRIBUCIÓN: Pastel con 3 secciones       │');
  console.log('│     (Verde: 35%, Azul: 45%, Amarillo: 20%)     │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  📊 CATEGORÍAS: 5 barras horizontales          │');
  console.log('│     (Todas entre 4.4 y 4.8)                    │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  🎯 PERFIL: Pentágono con 5 puntos             │');
  console.log('│     (Forma irregular pero balanceada)          │');
  console.log('├─────────────────────────────────────────────────┤');
  console.log('│  📋 ESTADÍSTICAS: 5 tarjetas con números       │');
  console.log('│     (Colores distintivos y métricas clave)     │');
  console.log('└─────────────────────────────────────────────────┘');

  // 7. Comparación: Antes vs Después
  console.log('\n🔄 7. COMPARACIÓN: ANTES vs DESPUÉS');
  console.log('─'.repeat(50));
  console.log('ANTES (Sin datos):');
  console.log('  ❌ Gráfico de tendencias: Línea plana en 0');
  console.log('  ❌ Distribución: Vacío');
  console.log('  ❌ Categorías: Sin barras');
  console.log('  ❌ Perfil: Sin forma');
  console.log('  ❌ Estadísticas: 0 evaluaciones');
  
  console.log('\nDESPUÉS (Con datos):');
  console.log('  ✅ Gráfico de tendencias: Línea ascendente');
  console.log('  ✅ Distribución: Pastel con colores');
  console.log('  ✅ Categorías: Barras de diferentes alturas');
  console.log('  ✅ Perfil: Pentágono balanceado');
  console.log('  ✅ Estadísticas: Números reales');

  console.log('\n🎉 ¡Así es como se verían las gráficas con datos reales!');
  console.log('📋 Para ver esto en el frontend:');
  console.log('   1. Ejecuta: node scripts/insertar-datos-usando-config.js');
  console.log('   2. Ve a: http://localhost:3001/reports');
  console.log('   3. Refresca la página (Ctrl+F5)');
  console.log('   4. ¡Disfruta de las gráficas con datos!');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  mostrarEjemplosGraficas();
}

module.exports = { mostrarEjemplosGraficas };








