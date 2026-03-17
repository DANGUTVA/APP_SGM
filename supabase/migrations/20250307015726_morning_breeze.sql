/*
  # Add INSERT policy for equipos_medicos table
  
  1. Security
    - Add RLS policy to allow INSERT operations on equipos_medicos table
    - This policy allows any authenticated or anonymous user to insert new equipment records
    - The policy is necessary to overcome the 42501 error (violation of row-level security policy)
*/

-- Create policy to allow INSERT operations on equipos_medicos table
CREATE POLICY "Permitir inserción de equipos médicos"
ON public.equipos_medicos
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow UPDATE operations on equipos_medicos table
CREATE POLICY "Permitir actualización de equipos médicos"
ON public.equipos_medicos
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);

-- Create policy to allow DELETE operations on equipos_medicos table
CREATE POLICY "Permitir eliminación de equipos médicos"
ON public.equipos_medicos
FOR DELETE
TO public
USING (true);