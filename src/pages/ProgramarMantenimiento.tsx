import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getEquiposMedicos, getDiasNoLaborables, supabase } from '../lib/supabase';
import { ChevronLeft, Save, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format, parseISO, isWeekend, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

const ProgramarMantenimiento = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const equipoIdFromQuery = query.get('equipo');
  
  const [loading, setLoading] = useState(false);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [diasNoLaborables, setDiasNoLaborables] = useState<any[]>([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [fechaNoLaborable, setFechaNoLaborable] = useState(false);
  const [fechaFinSemana, setFechaFinSemana] = useState(false);
  
  // Estados para manejar errores y éxito en el envío
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  
  const [formData, setFormData] = useState({
    equipo_id: equipoIdFromQuery || '',
    fecha_programada: new Date().toISOString().split('T')[0],
    duracion_estimada: 120,
    tecnico_asignado: '',
    estado: 'pendiente',
    prioridad: 'normal',
    notas: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<any>(null);

  useEffect(() => {
    // Bandera para evitar actualización de estado si el componente se desmonta
    let isMounted = true;

    const fetchDatos = async () => {
      try {
        const [equiposData, diasNLData] = await Promise.all([
          getEquiposMedicos(),
          getDiasNoLaborables()
        ]);
        
        if (isMounted) {
          setEquipos(equiposData);
          setDiasNoLaborables(diasNLData);
          
          if (equipoIdFromQuery) {
            const equipo = equiposData.find(e => e.id_equipo === equipoIdFromQuery);
            if (equipo) {
              setEquipoSeleccionado(equipo);
            }
          }
          
          setLoadingDatos(false);
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
        if (isMounted) {
          setLoadingDatos(false);
        }
      }
    };
    
    fetchDatos();

    return () => {
      isMounted = false;
    };
  }, [equipoIdFromQuery]);

  useEffect(() => {
    // Verificar si la fecha seleccionada es fin de semana o día no laborable
    if (formData.fecha_programada) {
      const fecha = parseISO(formData.fecha_programada);
      
      // Verificar si es fin de semana
      const esFechaFinSemana = isWeekend(fecha);
      setFechaFinSemana(esFechaFinSemana);
      
      // Verificar si es día no laborable
      const esFechaNoLaborable = diasNoLaborables.some(dia => 
        isSameDay(parseISO(dia.fecha), fecha)
      );
      setFechaNoLaborable(esFechaNoLaborable);
    }
  }, [formData.fecha_programada, diasNoLaborables]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar error cuando se modifica un campo
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
    
    // Limpiar error de envío general
    if (submitError) setSubmitError('');
    
    // Actualizar equipo seleccionado si cambia el ID del equipo
    if (name === 'equipo_id') {
      const equipo = equipos.find(e => e.id_equipo === value);
      setEquipoSeleccionado(equipo || null);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.equipo_id) {
      errors.equipo_id = 'Debe seleccionar un equipo';
    }
    
    if (!formData.fecha_programada) {
      errors.fecha_programada = 'La fecha programada es obligatoria';
    }
    
    if (!formData.duracion_estimada || formData.duracion_estimada < 15) {
      errors.duracion_estimada = 'La duración debe ser al menos 15 minutos';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Insertar en la base de datos
      const { error } = await supabase
        .from('mantenimientos_programados')
        .insert(formData)
        .select();
      
      if (error) throw error;
      
      // Estado de éxito antes de redirigir
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/mantenimientos');
      }, 800);

    } catch (error: any) {
      console.error('Error al programar mantenimiento:', error);
      setSubmitError(error.message || 'Ocurrió un error inesperado al programar el mantenimiento.');
      setLoading(false);
    }
  };

  const getDiaNoLaborableInfo = (fecha: string) => {
    const diaNL = diasNoLaborables.find(dia => 
      isSameDay(parseISO(dia.fecha), parseISO(fecha))
    );
    return diaNL ? diaNL.descripcion : '';
  };

  if (loadingDatos) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/mantenimientos" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a mantenimientos
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Programar Nuevo Mantenimiento</h2>
          <p className="mt-1 text-sm text-gray-600">Complete todos los campos requeridos (*) para programar un nuevo mantenimiento.</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          
          {/* BANNER DE ERROR */}
          {submitError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">Error al programar</p>
                  <p className="text-sm text-red-600 mt-1">{submitError}</p>
                </div>
              </div>
            </div>
          )}

          {/* BANNER DE ÉXITO */}
          {submitSuccess && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700 font-medium">¡Mantenimiento programado con éxito!</p>
                  <p className="text-sm text-green-600 mt-1">Redirigiendo al listado...</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              {/* Selección de equipo */}
              <div className="sm:col-span-4">
                <label htmlFor="equipo_id" className="block text-sm font-medium text-gray-700">
                  Equipo médico *
                </label>
                <div className="mt-1">
                  <select
                    name="equipo_id"
                    id="equipo_id"
                    value={formData.equipo_id}
                    onChange={handleChange}
                    disabled={loading || submitSuccess}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.equipo_id ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  >
                    <option value="">Seleccione un equipo</option>
                    {equipos
                      .filter(e => e.estado !== 'inactivo')
                      .map(equipo => (
                        <option key={equipo.id_equipo} value={equipo.id_equipo}>
                          {equipo.tipo_equipo} - {equipo.marca} {equipo.modelo} (ID: {equipo.id_equipo})
                        </option>
                      ))}
                  </select>
                  {formErrors.equipo_id && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.equipo_id}</p>
                  )}
                </div>
              </div>

              {/* Información del equipo seleccionado */}
              {equipoSeleccionado && (
                <div className="sm:col-span-6">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-2">Información del equipo seleccionado</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Tipo</p>
                        <p className="text-sm font-medium">{equipoSeleccionado.tipo_equipo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Marca / Modelo</p>
                        <p className="text-sm font-medium">{equipoSeleccionado.marca} / {equipoSeleccionado.modelo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Estado</p>
                        <p className="text-sm font-medium capitalize">{equipoSeleccionado.estado}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Fecha programada */}
              <div className="sm:col-span-3">
                <label htmlFor="fecha_programada" className="block text-sm font-medium text-gray-700">
                  Fecha programada *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="fecha_programada"
                    id="fecha_programada"
                    value={formData.fecha_programada}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={loading || submitSuccess}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.fecha_programada ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.fecha_programada && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fecha_programada}</p>
                  )}
                  
                  {/* Advertencias sobre la fecha */}
                  {(fechaFinSemana || fechaNoLaborable) && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-start">
                        <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-yellow-700 font-medium">Advertencia sobre la fecha seleccionada:</p>
                          {fechaFinSemana && (
                            <p className="text-sm text-yellow-600">
                              La fecha seleccionada cae en fin de semana ({format(parseISO(formData.fecha_programada), 'EEEE', { locale: es })}).
                            </p>
                          )}
                          {fechaNoLaborable && (
                            <p className="text-sm text-yellow-600">
                              La fecha seleccionada es un día no laborable: {getDiaNoLaborableInfo(formData.fecha_programada)}.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Duración estimada */}
              <div className="sm:col-span-3">
                <label htmlFor="duracion_estimada" className="block text-sm font-medium text-gray-700">
                  Duración estimada (minutos) *
                </label>
                <div className="mt-1">
                  <input
                    type="number"
                    name="duracion_estimada"
                    id="duracion_estimada"
                    value={formData.duracion_estimada}
                    onChange={handleChange}
                    min="15"
                    max="480"
                    disabled={loading || submitSuccess}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.duracion_estimada ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                  />
                  {formErrors.duracion_estimada && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.duracion_estimada}</p>
                  )}
                </div>
              </div>

              {/* Técnico asignado */}
              <div className="sm:col-span-3">
                <label htmlFor="tecnico_asignado" className="block text-sm font-medium text-gray-700">
                  Técnico asignado
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="tecnico_asignado"
                    id="tecnico_asignado"
                    value={formData.tecnico_asignado}
                    onChange={handleChange}
                    disabled={loading || submitSuccess}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Nombre del técnico"
                  />
                </div>
              </div>

              {/* Prioridad */}
              <div className="sm:col-span-3">
                <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700">
                  Prioridad *
                </label>
                <div className="mt-1">
                  <select
                    name="prioridad"
                    id="prioridad"
                    value={formData.prioridad}
                    onChange={handleChange}
                    disabled={loading || submitSuccess}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="baja">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
              </div>

              {/* Notas */}
              <div className="sm:col-span-6">
                <label htmlFor="notas" className="block text-sm font-medium text-gray-700">
                  Notas
                </label>
                <div className="mt-1">
                  <textarea
                    name="notas"
                    id="notas"
                    rows={4}
                    value={formData.notas}
                    onChange={handleChange}
                    disabled={loading || submitSuccess}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Instrucciones especiales o notas para el mantenimiento..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 border-t border-gray-200">
              <div className="flex justify-end mt-4">
                <Link
                  to="/mantenimientos"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading || submitSuccess}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : submitSuccess ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ¡Programado!
                    </>
                  ) : (
                    <>
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar mantenimiento
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProgramarMantenimiento;
