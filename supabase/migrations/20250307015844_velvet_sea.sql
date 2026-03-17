/*
  # Add RLS policies for all tables
  
  1. Security
    - Add RLS policies to allow INSERT, UPDATE, and DELETE operations on all tables
    - These policies are necessary to overcome the 42501 errors (violation of row-level security policy)
    - Each table that doesn't already have these policies will get them

  2. Tables covered:
    - dias_no_laborables
    - historico_mantenimientos
    - mantenimientos_programados
    - notificaciones
    - ajustes_cronograma
    - integraciones_calendario
*/

-- Create policies for dias_no_laborables
CREATE POLICY "Permitir inserción de días no laborables"
ON public.dias_no_laborables
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de días no laborables"
ON public.dias_no_laborables
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de días no laborables"
ON public.dias_no_laborables
FOR DELETE
TO public
USING (true);

-- Create policies for historico_mantenimientos
CREATE POLICY "Permitir inserción de historico mantenimientos"
ON public.historico_mantenimientos
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de historico mantenimientos"
ON public.historico_mantenimientos
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de historico mantenimientos"
ON public.historico_mantenimientos
FOR DELETE
TO public
USING (true);

-- Create policies for mantenimientos_programados
CREATE POLICY "Permitir inserción de mantenimientos programados"
ON public.mantenimientos_programados
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de mantenimientos programados"
ON public.mantenimientos_programados
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de mantenimientos programados"
ON public.mantenimientos_programados
FOR DELETE
TO public
USING (true);

-- Create policies for notificaciones
CREATE POLICY "Permitir inserción de notificaciones"
ON public.notificaciones
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de notificaciones"
ON public.notificaciones
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de notificaciones"
ON public.notificaciones
FOR DELETE
TO public
USING (true);

-- Create policies for ajustes_cronograma
CREATE POLICY "Permitir inserción de ajustes cronograma"
ON public.ajustes_cronograma
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de ajustes cronograma"
ON public.ajustes_cronograma
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de ajustes cronograma"
ON public.ajustes_cronograma
FOR DELETE
TO public
USING (true);

-- Create policies for integraciones_calendario
CREATE POLICY "Permitir inserción de integraciones calendario"
ON public.integraciones_calendario
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Permitir actualización de integraciones calendario"
ON public.integraciones_calendario
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de integraciones calendario"
ON public.integraciones_calendario
FOR DELETE
TO public
USING (true);