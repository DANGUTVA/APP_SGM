/*
  # Diseño de Base de Datos para Sistema de Mantenimiento de Equipos Médicos

  1. Nuevas Tablas
     - `ubicaciones`: Almacena información sobre las ubicaciones de los equipos médicos.
     - `equipos_medicos`: Almacena información detallada sobre cada equipo médico.
     - `mantenimientos_programados`: Registra los mantenimientos planificados para cada equipo.
     - `historico_mantenimientos`: Almacena el historial completo de mantenimientos realizados.
     - `dias_no_laborables`: Registra los días festivos y no laborables.
     - `ajustes_cronograma`: Almacena los ajustes manuales realizados al cronograma.
     - `notificaciones`: Gestiona las notificaciones de mantenimiento próximo.

  2. Seguridad
     - Implementación de RLS (Row Level Security) para todas las tablas.
     - Políticas de acceso basadas en roles de usuario.

  3. Funciones
     - Funciones para cálculo automático de fechas de mantenimiento.
     - Funciones para generación de cronogramas anuales.
     - Triggers para actualización automática de estados.
*/

-- Tabla de ubicaciones
CREATE TABLE IF NOT EXISTS ubicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  planta INTEGER,
  edificio VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de equipos médicos
CREATE TABLE IF NOT EXISTS equipos_medicos (
  id_equipo VARCHAR(20) PRIMARY KEY,
  tipo_equipo VARCHAR(100) NOT NULL,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100) NOT NULL,
  numero_serie VARCHAR(100) UNIQUE NOT NULL,
  fecha_adquisicion DATE NOT NULL,
  frecuencia_mantenimiento VARCHAR(20) NOT NULL CHECK (frecuencia_mantenimiento IN ('mensual', 'bimestral', 'trimestral', 'semestral', 'anual', 'personalizado')),
  intervalo_personalizado INTEGER,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'mantenimiento', 'inactivo')),
  fecha_baja DATE,
  ubicacion_id UUID REFERENCES ubicaciones(id),
  notas_adicionales TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT check_intervalo_personalizado CHECK (
    (frecuencia_mantenimiento = 'personalizado' AND intervalo_personalizado IS NOT NULL) OR
    (frecuencia_mantenimiento != 'personalizado')
  )
);

-- Tabla de mantenimientos programados
CREATE TABLE IF NOT EXISTS mantenimientos_programados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipo_id VARCHAR(20) REFERENCES equipos_medicos(id_equipo) ON DELETE CASCADE,
  fecha_programada DATE NOT NULL,
  duracion_estimada INTEGER NOT NULL, -- en minutos
  tecnico_asignado VARCHAR(100),
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'reprogramado', 'cancelado')),
  prioridad VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (prioridad IN ('baja', 'normal', 'alta', 'urgente')),
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de historial de mantenimientos
CREATE TABLE IF NOT EXISTS historico_mantenimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mantenimiento_id UUID REFERENCES mantenimientos_programados(id),
  equipo_id VARCHAR(20) REFERENCES equipos_medicos(id_equipo) ON DELETE CASCADE,
  fecha_realizado TIMESTAMPTZ NOT NULL,
  duracion_real INTEGER NOT NULL, -- en minutos
  tecnico_responsable VARCHAR(100) NOT NULL,
  tipo_mantenimiento VARCHAR(20) NOT NULL CHECK (tipo_mantenimiento IN ('preventivo', 'correctivo')),
  hallazgos TEXT,
  acciones_realizadas TEXT NOT NULL,
  recomendaciones TEXT,
  piezas_reemplazadas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de días no laborables
CREATE TABLE IF NOT EXISTS dias_no_laborables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha DATE NOT NULL UNIQUE,
  descripcion VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de ajustes al cronograma
CREATE TABLE IF NOT EXISTS ajustes_cronograma (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mantenimiento_id UUID REFERENCES mantenimientos_programados(id) ON DELETE CASCADE,
  fecha_original DATE NOT NULL,
  fecha_ajustada DATE NOT NULL,
  motivo_ajuste TEXT NOT NULL,
  usuario_responsable VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mantenimiento_id UUID REFERENCES mantenimientos_programados(id) ON DELETE CASCADE,
  fecha_notificacion TIMESTAMPTZ NOT NULL,
  tipo_notificacion VARCHAR(50) NOT NULL,
  destinatarios TEXT[] NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'enviada', 'error')),
  mensaje TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabla de integraciones con calendarios externos
CREATE TABLE IF NOT EXISTS integraciones_calendario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_calendario VARCHAR(50) NOT NULL CHECK (tipo_calendario IN ('google', 'ical', 'outlook', 'otro')),
  usuario_id VARCHAR(100) NOT NULL,
  config_integracion JSONB NOT NULL,
  ultima_sincronizacion TIMESTAMPTZ,
  estado VARCHAR(20) NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Función para calcular la próxima fecha de mantenimiento
CREATE OR REPLACE FUNCTION calcular_proxima_fecha_mantenimiento(
  fecha_base DATE,
  frecuencia VARCHAR,
  intervalo_dias INTEGER DEFAULT NULL
)
RETURNS DATE AS $$
DECLARE
  proxima_fecha DATE;
BEGIN
  CASE frecuencia
    WHEN 'mensual' THEN
      proxima_fecha := fecha_base + INTERVAL '1 month';
    WHEN 'bimestral' THEN
      proxima_fecha := fecha_base + INTERVAL '2 months';
    WHEN 'trimestral' THEN
      proxima_fecha := fecha_base + INTERVAL '3 months';
    WHEN 'semestral' THEN
      proxima_fecha := fecha_base + INTERVAL '6 months';
    WHEN 'anual' THEN
      proxima_fecha := fecha_base + INTERVAL '1 year';
    WHEN 'personalizado' THEN
      IF intervalo_dias IS NULL THEN
        RAISE EXCEPTION 'El intervalo de días es requerido para frecuencia personalizada';
      END IF;
      proxima_fecha := fecha_base + (intervalo_dias * INTERVAL '1 day');
    ELSE
      RAISE EXCEPTION 'Frecuencia de mantenimiento no válida: %', frecuencia;
  END CASE;
  
  -- Verificar si es día no laborable y ajustar
  WHILE EXISTS (SELECT 1 FROM dias_no_laborables WHERE fecha = proxima_fecha) LOOP
    proxima_fecha := proxima_fecha + INTERVAL '1 day';
  END LOOP;
  
  RETURN proxima_fecha;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar el primer mantenimiento programado al registrar un equipo
CREATE OR REPLACE FUNCTION generar_primer_mantenimiento()
RETURNS TRIGGER AS $$
DECLARE
  primera_fecha DATE;
BEGIN
  -- Calcular la primera fecha de mantenimiento
  primera_fecha := calcular_proxima_fecha_mantenimiento(
    NEW.fecha_adquisicion, 
    NEW.frecuencia_mantenimiento,
    NEW.intervalo_personalizado
  );
  
  -- Insertar en la tabla de mantenimientos programados
  INSERT INTO mantenimientos_programados (
    equipo_id, fecha_programada, duracion_estimada, estado, prioridad
  ) VALUES (
    NEW.id_equipo, primera_fecha, 120, 'pendiente', 'normal'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger a la tabla de equipos médicos
CREATE TRIGGER trg_generar_primer_mantenimiento
AFTER INSERT ON equipos_medicos
FOR EACH ROW
EXECUTE FUNCTION generar_primer_mantenimiento();

-- Función para generar cronograma anual de mantenimientos
CREATE OR REPLACE FUNCTION generar_cronograma_anual(p_anio INTEGER)
RETURNS VOID AS $$
DECLARE
  equipo RECORD;
  proxima_fecha DATE;
  fecha_final DATE;
  fecha_actual DATE;
BEGIN
  fecha_final := make_date(p_anio, 12, 31);
  
  -- Iterar sobre cada equipo activo
  FOR equipo IN SELECT * FROM equipos_medicos WHERE estado = 'activo' AND (fecha_baja IS NULL OR fecha_baja > make_date(p_anio, 1, 1)) LOOP
    -- Obtener la última fecha de mantenimiento programado
    SELECT MAX(fecha_programada) INTO fecha_actual
    FROM mantenimientos_programados
    WHERE equipo_id = equipo.id_equipo AND fecha_programada < make_date(p_anio, 1, 1);
    
    -- Si no hay mantenimientos previos, usar la fecha de adquisición
    IF fecha_actual IS NULL THEN
      fecha_actual := equipo.fecha_adquisicion;
    END IF;
    
    -- Generar mantenimientos para todo el año
    LOOP
      proxima_fecha := calcular_proxima_fecha_mantenimiento(
        fecha_actual, 
        equipo.frecuencia_mantenimiento,
        equipo.intervalo_personalizado
      );
      
      -- Salir si la próxima fecha está fuera del año solicitado
      EXIT WHEN proxima_fecha > fecha_final;
      
      -- Insertar el mantenimiento programado
      INSERT INTO mantenimientos_programados (
        equipo_id, fecha_programada, duracion_estimada, estado, prioridad
      ) VALUES (
        equipo.id_equipo, proxima_fecha, 120, 'pendiente', 'normal'
      );
      
      -- Actualizar la fecha actual para la próxima iteración
      fecha_actual := proxima_fecha;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para generar notificaciones de mantenimientos próximos
CREATE OR REPLACE FUNCTION generar_notificaciones_mantenimiento()
RETURNS VOID AS $$
DECLARE
  mantenimiento RECORD;
  destinatarios TEXT[];
  mensaje TEXT;
BEGIN
  -- Buscar mantenimientos próximos (1 semana de anticipación)
  FOR mantenimiento IN 
    SELECT mp.*, em.tipo_equipo, em.marca, em.modelo
    FROM mantenimientos_programados mp
    JOIN equipos_medicos em ON mp.equipo_id = em.id_equipo
    WHERE 
      mp.fecha_programada BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')
      AND mp.estado = 'pendiente'
      AND NOT EXISTS (
        SELECT 1 FROM notificaciones 
        WHERE mantenimiento_id = mp.id
      )
  LOOP
    -- En un sistema real, aquí se obtendría los destinatarios basados en roles o asignaciones
    destinatarios := ARRAY['admin@hospital.com', 'mantenimiento@hospital.com'];
    
    -- Crear mensaje de notificación
    mensaje := 'Mantenimiento programado para el equipo ' || mantenimiento.tipo_equipo || 
               ' ' || mantenimiento.marca || ' ' || mantenimiento.modelo || 
               ' (ID: ' || mantenimiento.equipo_id || ') para la fecha ' || 
               mantenimiento.fecha_programada;
    
    -- Insertar notificación
    INSERT INTO notificaciones (
      mantenimiento_id, fecha_notificacion, tipo_notificacion, 
      destinatarios, estado, mensaje
    ) VALUES (
      mantenimiento.id, NOW(), 'email', 
      destinatarios, 'pendiente', mensaje
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar el estado de equipos basado en mantenimientos
CREATE OR REPLACE FUNCTION actualizar_estado_equipos()
RETURNS VOID AS $$
BEGIN
  -- Actualizar equipos que están en mantenimiento hoy
  UPDATE equipos_medicos
  SET 
    estado = 'mantenimiento',
    updated_at = NOW()
  WHERE id_equipo IN (
    SELECT equipo_id 
    FROM mantenimientos_programados
    WHERE fecha_programada = CURRENT_DATE
    AND estado IN ('pendiente', 'en_proceso')
  )
  AND estado = 'activo';
  
  -- Restaurar estado a activo para equipos cuyo mantenimiento ha sido completado
  UPDATE equipos_medicos
  SET 
    estado = 'activo',
    updated_at = NOW()
  WHERE id_equipo IN (
    SELECT equipo_id 
    FROM mantenimientos_programados
    WHERE fecha_programada < CURRENT_DATE
    AND estado = 'completado'
  )
  AND estado = 'mantenimiento';
END;
$$ LANGUAGE plpgsql;

-- Habilitación de Row Level Security para todas las tablas
ALTER TABLE ubicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mantenimientos_programados ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_mantenimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE dias_no_laborables ENABLE ROW LEVEL SECURITY;
ALTER TABLE ajustes_cronograma ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE integraciones_calendario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (a expandir según roles de usuario)
CREATE POLICY "Acceso público para lectura de ubicaciones" 
ON ubicaciones FOR SELECT USING (true);

CREATE POLICY "Acceso público para lectura de equipos"
ON equipos_medicos FOR SELECT USING (true);

CREATE POLICY "Acceso público para lectura de mantenimientos"
ON mantenimientos_programados FOR SELECT USING (true);

CREATE POLICY "Acceso público para lectura de historial"
ON historico_mantenimientos FOR SELECT USING (true);

CREATE POLICY "Acceso público para lectura de días no laborables"
ON dias_no_laborables FOR SELECT USING (true);