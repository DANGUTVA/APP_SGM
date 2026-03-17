export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      ajustes_cronograma: {
        Row: {
          id: string
          mantenimiento_id: string
          fecha_original: string
          fecha_ajustada: string
          motivo_ajuste: string
          usuario_responsable: string
          created_at: string
        }
        Insert: {
          id?: string
          mantenimiento_id: string
          fecha_original: string
          fecha_ajustada: string
          motivo_ajuste: string
          usuario_responsable: string
          created_at?: string
        }
        Update: {
          id?: string
          mantenimiento_id?: string
          fecha_original?: string
          fecha_ajustada?: string
          motivo_ajuste?: string
          usuario_responsable?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ajustes_cronograma_mantenimiento_id_fkey"
            columns: ["mantenimiento_id"]
            referencedRelation: "mantenimientos_programados"
            referencedColumns: ["id"]
          }
        ]
      }
      dias_no_laborables: {
        Row: {
          id: string
          fecha: string
          descripcion: string
          created_at: string
        }
        Insert: {
          id?: string
          fecha: string
          descripcion: string
          created_at?: string
        }
        Update: {
          id?: string
          fecha?: string
          descripcion?: string
          created_at?: string
        }
        Relationships: []
      }
      equipos_medicos: {
        Row: {
          id_equipo: string
          tipo_equipo: string
          marca: string
          modelo: string
          numero_serie: string
          fecha_adquisicion: string
          frecuencia_mantenimiento: string
          intervalo_personalizado: number | null
          estado: string
          fecha_baja: string | null
          ubicacion_id: string | null
          notas_adicionales: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id_equipo: string
          tipo_equipo: string
          marca: string
          modelo: string
          numero_serie: string
          fecha_adquisicion: string
          frecuencia_mantenimiento: string
          intervalo_personalizado?: number | null
          estado?: string
          fecha_baja?: string | null
          ubicacion_id?: string | null
          notas_adicionales?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id_equipo?: string
          tipo_equipo?: string
          marca?: string
          modelo?: string
          numero_serie?: string
          fecha_adquisicion?: string
          frecuencia_mantenimiento?: string
          intervalo_personalizado?: number | null
          estado?: string
          fecha_baja?: string | null
          ubicacion_id?: string | null
          notas_adicionales?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipos_medicos_ubicacion_id_fkey"
            columns: ["ubicacion_id"]
            referencedRelation: "ubicaciones"
            referencedColumns: ["id"]
          }
        ]
      }
      historico_mantenimientos: {
        Row: {
          id: string
          mantenimiento_id: string | null
          equipo_id: string
          fecha_realizado: string
          duracion_real: number
          tecnico_responsable: string
          tipo_mantenimiento: string
          hallazgos: string | null
          acciones_realizadas: string
          recomendaciones: string | null
          piezas_reemplazadas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          mantenimiento_id?: string | null
          equipo_id: string
          fecha_realizado: string
          duracion_real: number
          tecnico_responsable: string
          tipo_mantenimiento: string
          hallazgos?: string | null
          acciones_realizadas: string
          recomendaciones?: string | null
          piezas_reemplazadas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          mantenimiento_id?: string | null
          equipo_id?: string
          fecha_realizado?: string
          duracion_real?: number
          tecnico_responsable?: string
          tipo_mantenimiento?: string
          hallazgos?: string | null
          acciones_realizadas?: string
          recomendaciones?: string | null
          piezas_reemplazadas?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_mantenimientos_equipo_id_fkey"
            columns: ["equipo_id"]
            referencedRelation: "equipos_medicos"
            referencedColumns: ["id_equipo"]
          },
          {
            foreignKeyName: "historico_mantenimientos_mantenimiento_id_fkey"
            columns: ["mantenimiento_id"]
            referencedRelation: "mantenimientos_programados"
            referencedColumns: ["id"]
          }
        ]
      }
      integraciones_calendario: {
        Row: {
          id: string
          tipo_calendario: string
          usuario_id: string
          config_integracion: Json
          ultima_sincronizacion: string | null
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tipo_calendario: string
          usuario_id: string
          config_integracion: Json
          ultima_sincronizacion?: string | null
          estado?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tipo_calendario?: string
          usuario_id?: string
          config_integracion?: Json
          ultima_sincronizacion?: string | null
          estado?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      mantenimientos_programados: {
        Row: {
          id: string
          equipo_id: string
          fecha_programada: string
          duracion_estimada: number
          tecnico_asignado: string | null
          estado: string
          prioridad: string
          notas: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipo_id: string
          fecha_programada: string
          duracion_estimada: number
          tecnico_asignado?: string | null
          estado?: string
          prioridad?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipo_id?: string
          fecha_programada?: string
          duracion_estimada?: number
          tecnico_asignado?: string | null
          estado?: string
          prioridad?: string
          notas?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mantenimientos_programados_equipo_id_fkey"
            columns: ["equipo_id"]
            referencedRelation: "equipos_medicos"
            referencedColumns: ["id_equipo"]
          }
        ]
      }
      notificaciones: {
        Row: {
          id: string
          mantenimiento_id: string
          fecha_notificacion: string
          tipo_notificacion: string
          destinatarios: string[]
          estado: string
          mensaje: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mantenimiento_id: string
          fecha_notificacion: string
          tipo_notificacion: string
          destinatarios: string[]
          estado?: string
          mensaje: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mantenimiento_id?: string
          fecha_notificacion?: string
          tipo_notificacion?: string
          destinatarios?: string[]
          estado?: string
          mensaje?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificaciones_mantenimiento_id_fkey"
            columns: ["mantenimiento_id"]
            referencedRelation: "mantenimientos_programados"
            referencedColumns: ["id"]
          }
        ]
      }
      ubicaciones: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          planta: number | null
          edificio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          planta?: number | null
          edificio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          planta?: number | null
          edificio?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      actualizar_estado_equipos: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
      calcular_proxima_fecha_mantenimiento: {
        Args: {
          fecha_base: string
          frecuencia: string
          intervalo_dias?: number
        }
        Returns: string
      }
      generar_cronograma_anual: {
        Args: {
          p_anio: number
        }
        Returns: void
      }
      generar_notificaciones_mantenimiento: {
        Args: Record<PropertyKey, never>
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}