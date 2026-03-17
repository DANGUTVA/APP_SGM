import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

// Estas variables deberían venir de las variables de entorno después de conectar con Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Funciones de utilidad para interactuar con la base de datos

// Equipos médicos
export async function getEquiposMedicos() {
  const { data, error } = await supabase
    .from('equipos_medicos')
    .select('*, ubicaciones(nombre)');
  
  if (error) throw error;
  return data;
}

export async function getEquipoMedico(id: string) {
  const { data, error } = await supabase
    .from('equipos_medicos')
    .select('*, ubicaciones(id, nombre)')
    .eq('id_equipo', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function insertEquipoMedico(equipoData: any) {
  const { data, error } = await supabase
    .from('equipos_medicos')
    .insert(equipoData)
    .select();
  
  if (error) throw error;
  return data[0];
}

export async function updateEquipoMedico(id: string, equipoData: any) {
  const { data, error } = await supabase
    .from('equipos_medicos')
    .update(equipoData)
    .eq('id_equipo', id)
    .select();
  
  if (error) throw error;
  return data[0];
}

// Ubicaciones
export async function getUbicaciones() {
  const { data, error } = await supabase
    .from('ubicaciones')
    .select('*');
  
  if (error) throw error;
  return data;
}

// Mantenimientos programados
export async function getMantenimientosProgramados() {
  const { data, error } = await supabase
    .from('mantenimientos_programados')
    .select('*, equipos_medicos(id_equipo, tipo_equipo, marca, modelo)')
    .order('fecha_programada', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getMantenimientosProximos(dias: number = 7) {
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() + dias);
  
  const { data, error } = await supabase
    .from('mantenimientos_programados')
    .select('*, equipos_medicos(id_equipo, tipo_equipo, marca, modelo)')
    .gte('fecha_programada', new Date().toISOString().split('T')[0])
    .lte('fecha_programada', fechaLimite.toISOString().split('T')[0])
    .order('fecha_programada', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Historial de mantenimientos
export async function getHistoricoMantenimientos(equipoId?: string) {
  let query = supabase
    .from('historico_mantenimientos')
    .select('*, equipos_medicos(id_equipo, tipo_equipo, marca, modelo)')
    .order('fecha_realizado', { ascending: false });
  
  if (equipoId) {
    query = query.eq('equipo_id', equipoId);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data;
}

// Calendario
export async function getDiasNoLaborables() {
  const { data, error } = await supabase
    .from('dias_no_laborables')
    .select('*')
    .order('fecha', { ascending: true });
  
  if (error) throw error;
  return data;
}

// Generar cronograma anual
export async function generarCronogramaAnual(anio: number) {
  const { error } = await supabase.rpc('generar_cronograma_anual', { p_anio: anio });
  
  if (error) throw error;
  return true;
}

// Marcar mantenimiento como completado
export async function completarMantenimiento(
  mantenimientoId: string, 
  historialData: {
    tecnico_responsable: string;
    duracion_real: number;
    hallazgos?: string;
    acciones_realizadas: string;
    recomendaciones?: string;
    piezas_reemplazadas?: string;
  }
) {
  const { error: errorMantenimiento } = await supabase
    .from('mantenimientos_programados')
    .update({ estado: 'completado', updated_at: new Date().toISOString() })
    .eq('id', mantenimientoId);
  
  if (errorMantenimiento) throw errorMantenimiento;
  
  // Obtener info del mantenimiento para el historial
  const { data: mantenimiento, error: errorGetMantenimiento } = await supabase
    .from('mantenimientos_programados')
    .select('equipo_id')
    .eq('id', mantenimientoId)
    .single();
  
  if (errorGetMantenimiento) throw errorGetMantenimiento;
  
  // Registrar en historial
  const { error: errorHistorial } = await supabase
    .from('historico_mantenimientos')
    .insert({
      mantenimiento_id: mantenimientoId,
      equipo_id: mantenimiento.equipo_id,
      fecha_realizado: new Date().toISOString(),
      tipo_mantenimiento: 'preventivo',
      ...historialData
    });
  
  if (errorHistorial) throw errorHistorial;
  
  return true;
}