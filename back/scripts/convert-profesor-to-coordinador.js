// =====================================================
// CONVERTIR PROFESOR EXISTENTE A COORDINADOR-PROFESOR
// =====================================================
// Este script convierte a Mauricio González de profesor a coordinador-profesor

import { createClient } from '@supabase/supabase-js';
import { RoleService } from '../src/services/roleService.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// =====================================================
// CONFIGURACIÓN
// =====================================================

const config = {
  // Buscar por nombre (ajusta según sea necesario)
  nombre: 'Mauricio',
  apellido: 'González',
  
  // O buscar por email exacto (descomenta y usa si conoces el email)
  // email: 'mauricio.gonzalez@udem.edu.co',
  
  // Configuración del coordinador
  carrera_id: 1, // ID de Ingeniería de Sistemas (ajusta según corresponda)
  departamento: 'Ingeniería de Sistemas', // Ajusta según corresponda
  fecha_nombramiento: new Date().toISOString().split('T')[0] // Fecha actual
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

async function buscarUsuario() {
  console.log('🔍 Buscando usuario...');
  
  let query = supabase
    .from('usuarios')
    .select(`
      id,
      email,
      nombre,
      apellido,
      tipo_usuario,
      activo,
      profesores!inner(
        codigo,
        departamento,
        activo
      )
    `)
    .eq('activo', true);

  // Buscar por email si está configurado
  if (config.email) {
    query = query.eq('email', config.email);
    console.log(`📧 Buscando por email: ${config.email}`);
  } else {
    // Buscar por nombre
    query = query
      .ilike('nombre', `%${config.nombre}%`)
      .ilike('apellido', `%${config.apellido}%`);
    console.log(`👤 Buscando por nombre: ${config.nombre} ${config.apellido}`);
  }

  const { data: usuarios, error } = await query;

  if (error) {
    console.error('❌ Error buscando usuario:', error);
    return null;
  }

  if (!usuarios || usuarios.length === 0) {
    console.log('❌ Usuario no encontrado');
    return null;
  }

  if (usuarios.length > 1) {
    console.log('⚠️  Múltiples usuarios encontrados:');
    usuarios.forEach((usuario, index) => {
      console.log(`  ${index + 1}. ${usuario.nombre} ${usuario.apellido} (${usuario.email})`);
    });
    console.log('Usando el primer resultado...');
  }

  const usuario = usuarios[0];
  console.log(`✅ Usuario encontrado: ${usuario.nombre} ${usuario.apellido} (${usuario.email})`);
  return usuario;
}

async function verificarRolesActuales(usuarioId) {
  console.log('🔍 Verificando roles actuales...');
  
  const roles = await RoleService.obtenerRolesUsuario(usuarioId);
  console.log(`📋 Roles actuales: [${roles.join(', ')}]`);
  
  return roles;
}

async function convertirACoordinador(usuarioId) {
  console.log('🔄 Convirtiendo a coordinador-profesor...');
  
  try {
    // 1. Asignar rol de coordinador
    console.log('  📝 Asignando rol de coordinador...');
    const rolAsignado = await RoleService.asignarRol(usuarioId, 'coordinador');
    
    if (!rolAsignado) {
      throw new Error('Error asignando rol de coordinador');
    }
    console.log('  ✅ Rol de coordinador asignado');

    // 2. Crear registro en coordinadores
    console.log('  📝 Creando registro en coordinadores...');
    const { data: coordinador, error: coordinadorError } = await supabase
      .from('coordinadores')
      .upsert({
        usuario_id: usuarioId,
        carrera_id: config.carrera_id,
        departamento: config.departamento,
        fecha_nombramiento: config.fecha_nombramiento,
        activo: true
      }, {
        onConflict: 'usuario_id'
      })
      .select()
      .single();

    if (coordinadorError) {
      throw new Error(`Error creando coordinador: ${coordinadorError.message}`);
    }
    console.log('  ✅ Registro de coordinador creado');

    return coordinador;
  } catch (error) {
    console.error('❌ Error en conversión:', error);
    throw error;
  }
}

async function verificarConversion(usuarioId) {
  console.log('🔍 Verificando conversión...');
  
  try {
    // Verificar roles
    const roles = await RoleService.obtenerRolesUsuario(usuarioId);
    console.log(`📋 Roles finales: [${roles.join(', ')}]`);
    
    // Verificar coordinador
    const coordinador = await RoleService.obtenerCoordinadorPorUsuario(usuarioId);
    if (coordinador) {
      console.log(`✅ Coordinador verificado: ${coordinador.departamento}`);
    } else {
      console.log('⚠️  No se pudo verificar el registro de coordinador');
    }
    
    // Verificar permisos
    const permisos = await RoleService.obtenerPermisosUsuario(usuarioId);
    console.log(`🔐 Permisos: [${permisos.join(', ')}]`);
    
    // Verificar dashboard
    const dashboard = await RoleService.obtenerDashboardUsuario(usuarioId);
    console.log(`🏠 Dashboard principal: ${dashboard}`);
    
    return {
      roles,
      coordinador,
      permisos,
      dashboard
    };
  } catch (error) {
    console.error('❌ Error verificando conversión:', error);
    return null;
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function convertirProfesorACoordinador() {
  try {
    console.log('🚀 Iniciando conversión de profesor a coordinador-profesor...\n');
    
    // 1. Buscar usuario
    const usuario = await buscarUsuario();
    if (!usuario) {
      console.log('❌ No se puede continuar sin usuario');
      return;
    }
    
    console.log(`\n👤 Usuario: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`📧 Email: ${usuario.email}`);
    console.log(`🎭 Tipo actual: ${usuario.tipo_usuario}`);
    console.log(`👨‍🏫 Código profesor: ${usuario.profesores[0]?.codigo || 'N/A'}`);
    console.log(`🏢 Departamento: ${usuario.profesores[0]?.departamento || 'N/A'}\n`);
    
    // 2. Verificar roles actuales
    const rolesActuales = await verificarRolesActuales(usuario.id);
    
    // 3. Verificar si ya es coordinador
    if (rolesActuales.includes('coordinador')) {
      console.log('ℹ️  El usuario ya es coordinador');
      await verificarConversion(usuario.id);
      return;
    }
    
    // 4. Convertir a coordinador
    await convertirACoordinador(usuario.id);
    
    // 5. Verificar conversión
    console.log('\n🔍 Verificación final:');
    await verificarConversion(usuario.id);
    
    console.log('\n🎉 ¡Conversión completada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`  • Usuario: ${usuario.nombre} ${usuario.apellido}`);
    console.log(`  • Email: ${usuario.email}`);
    console.log(`  • Roles: Profesor + Coordinador`);
    console.log(`  • Departamento: ${config.departamento}`);
    console.log(`  • Dashboard principal: Coordinador`);
    console.log(`  • Puede acceder a ambos dashboards`);
    
  } catch (error) {
    console.error('❌ Error en la conversión:', error);
    process.exit(1);
  }
}

// =====================================================
// EJECUCIÓN
// =====================================================

if (import.meta.url === `file://${process.argv[1]}`) {
  convertirProfesorACoordinador();
}

export { convertirProfesorACoordinador };




