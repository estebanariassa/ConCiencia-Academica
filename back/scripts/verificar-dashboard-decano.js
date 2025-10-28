// Script para verificar el estado del dashboard del Decano
const fs = require('fs');

function verificarDashboardDecano() {
  console.log('🔍 Verificando estado del Dashboard del Decano...\n');

  try {
    const filePath = '../front/src/pages/DashboardDecano.tsx';
    const content = fs.readFileSync(filePath, 'utf8');
    
    console.log('📊 1. Verificando datos mock en el código:');
    
    // Buscar los datos mock de carreras
    const carrerasMatch = content.match(/const mockCareers = \[([\s\S]*?)\];/);
    if (carrerasMatch) {
      console.log('✅ Datos mock de carreras encontrados');
      const carrerasCount = (carrerasMatch[1].match(/id:/g) || []).length;
      console.log(`   - ${carrerasCount} carreras mock definidas`);
    } else {
      console.log('❌ Datos mock de carreras NO encontrados');
    }
    
    // Buscar los datos mock de profesores
    const profesoresMatch = content.match(/const mockProfessorsByCareer = \{([\s\S]*?)\};/);
    if (profesoresMatch) {
      console.log('✅ Datos mock de profesores encontrados');
      const profesoresCount = (profesoresMatch[1].match(/nombre:/g) || []).length;
      console.log(`   - ${profesoresCount} profesores mock definidos`);
    } else {
      console.log('❌ Datos mock de profesores NO encontrados');
    }
    
    console.log('\n📊 2. Verificando lógica de carga:');
    
    // Verificar si hay console.log para debug
    const debugLogs = (content.match(/console\.log/g) || []).length;
    console.log(`   - ${debugLogs} console.log encontrados para debug`);
    
    // Verificar el useEffect
    const useEffectMatch = content.match(/useEffect\(\(\) => \{[\s\S]*?loadFacultyData\(\);[\s\S]*?\}, \[\]\);/);
    if (useEffectMatch) {
      console.log('✅ useEffect configurado correctamente');
    } else {
      console.log('❌ useEffect NO configurado correctamente');
    }
    
    console.log('\n📊 3. Verificando cálculo de estadísticas:');
    
    // Verificar el cálculo de totalProfesores
    const totalProfesoresMatch = content.match(/totalProfesores: Object\.values\(professorsByCareer\)\.flat\(\)\.length/);
    if (totalProfesoresMatch) {
      console.log('✅ Cálculo de totalProfesores correcto');
    } else {
      console.log('❌ Cálculo de totalProfesores incorrecto');
    }
    
    console.log('\n📊 4. Datos esperados:');
    console.log('   - Carreras: 6 (Sistemas, Civil, Financiera, Industrial, Energía, Ambiental)');
    console.log('   - Profesores: 10 (6 en Sistemas, 1 en Civil, 3 en Financiera)');
    console.log('   - Profesores Activos: 10 (todos los mock están activos)');
    
    console.log('\n🔧 Posibles problemas:');
    console.log('   1. El useEffect no se está ejecutando');
    console.log('   2. Los datos mock no se están aplicando al estado');
    console.log('   3. El cálculo de estadísticas está fallando');
    console.log('   4. El componente se está renderizando antes de cargar los datos');
    
    console.log('\n💡 Solución recomendada:');
    console.log('   1. Verificar la consola del navegador para ver los console.log');
    console.log('   2. Verificar que el useEffect se ejecute');
    console.log('   3. Verificar que los datos mock se apliquen al estado');
    console.log('   4. Agregar más logs de debug si es necesario');
    
  } catch (error) {
    console.error('❌ Error verificando el archivo:', error.message);
  }
}

verificarDashboardDecano();



