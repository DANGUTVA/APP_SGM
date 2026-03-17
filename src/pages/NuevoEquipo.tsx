import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUbicaciones, insertEquipoMedico } from '../lib/supabase';
import { ChevronLeft, Save, Plus } from 'lucide-react';

const NuevoEquipo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [loadingUbicaciones, setLoadingUbicaciones] = useState(true);
  
  const [formData, setFormData] = useState({
    id_equipo: '',
    tipo_equipo: '',
    marca: '',
    modelo: '',
    numero_serie: '',
    fecha_adquisicion: new Date().toISOString().split('T')[0],
    frecuencia_mantenimiento: 'mensual',
    intervalo_personalizado: '',
    estado: 'activo',
    ubicacion_id: '',
    notas_adicionales: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchUbicaciones = async () => {
      try {
        const data = await getUbicaciones();
        setUbicaciones(data);
        setLoadingUbicaciones(false);
      } catch (error) {
        console.error('Error al cargar ubicaciones:', error);
        setLoadingUbicaciones(false);
      }
    };
    
    fetchUbicaciones();
  }, []);

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
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.id_equipo.trim()) {
      errors.id_equipo = 'El ID del equipo es obligatorio';
    }
    
    if (!formData.tipo_equipo.trim()) {
      errors.tipo_equipo = 'El tipo de equipo es obligatorio';
    }
    
    if (!formData.marca.trim()) {
      errors.marca = 'La marca es obligatoria';
    }
    
    if (!formData.modelo.trim()) {
      errors.modelo = 'El modelo es obligatorio';
    }
    
    if (!formData.numero_serie.trim()) {
      errors.numero_serie = 'El número de serie es obligatorio';
    }
    
    if (!formData.fecha_adquisicion) {
      errors.fecha_adquisicion = 'La fecha de adquisición es obligatoria';
    }
    
    if (formData.frecuencia_mantenimiento === 'personalizado' && !formData.intervalo_personalizado) {
      errors.intervalo_personalizado = 'El intervalo personalizado es obligatorio';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Preparar datos para inserción
      const equipoData = {
        ...formData,
        intervalo_personalizado: formData.frecuencia_mantenimiento === 'personalizado' 
          ? parseInt(formData.intervalo_personalizado) 
          : null,
        ubicacion_id: formData.ubicacion_id || null
      };
      
      // Insertar en la base de datos usando la nueva función de utilidad
      const nuevoEquipo = await insertEquipoMedico(equipoData);
      
      // Redirigir a la página de detalles del equipo
      navigate(`/equipos/${nuevoEquipo.id_equipo}`);
    } catch (error: any) {
      console.error('Error al registrar equipo:', error);
      alert(`Error al registrar equipo: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/equipos" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Volver a la lista de equipos
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Registrar Nuevo Equipo Médico</h2>
          <p className="mt-1 text-sm text-gray-600">Complete todos los campos requeridos (*) para registrar un nuevo equipo.</p>
        </div>
        
        <div className="px-4 py-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-6">
              {/* ID del equipo */}
              <div className="sm:col-span-3">
                <label htmlFor="id_equipo" className="block text-sm font-medium text-gray-700">
                  ID del equipo *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="id_equipo"
                    id="id_equipo"
                    value={formData.id_equipo}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.id_equipo ? 'border-red-300' : ''
                    }`}
                    placeholder="EM-001"
                  />
                  {formErrors.id_equipo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.id_equipo}</p>
                  )}
                </div>
              </div>

              {/* Tipo de equipo */}
              <div className="sm:col-span-3">
                <label htmlFor="tipo_equipo" className="block text-sm font-medium text-gray-700">
                  Tipo de equipo *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="tipo_equipo"
                    id="tipo_equipo"
                    value={formData.tipo_equipo}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.tipo_equipo ? 'border-red-300' : ''
                    }`}
                    placeholder="Ecógrafo, Electrocardiograma, etc."
                  />
                  {formErrors.tipo_equipo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.tipo_equipo}</p>
                  )}
                </div>
              </div>

              {/* Marca */}
              <div className="sm:col-span-3">
                <label htmlFor="marca" className="block text-sm font-medium text-gray-700">
                  Marca *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="marca"
                    id="marca"
                    value={formData.marca}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.marca ? 'border-red-300' : ''
                    }`}
                    placeholder="Siemens, GE, Philips, etc."
                  />
                  {formErrors.marca && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.marca}</p>
                  )}
                </div>
              </div>

              {/* Modelo */}
              <div className="sm:col-span-3">
                <label htmlFor="modelo" className="block text-sm font-medium text-gray-700">
                  Modelo *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="modelo"
                    id="modelo"
                    value={formData.modelo}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.modelo ? 'border-red-300' : ''
                    }`}
                    placeholder="X-300, Acuson, etc."
                  />
                  {formErrors.modelo && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.modelo}</p>
                  )}
                </div>
              </div>

              {/* Número de serie */}
              <div className="sm:col-span-3">
                <label htmlFor="numero_serie" className="block text-sm font-medium text-gray-700">
                  Número de serie *
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="numero_serie"
                    id="numero_serie"
                    value={formData.numero_serie}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.numero_serie ? 'border-red-300' : ''
                    }`}
                    placeholder="SN12345678"
                  />
                  {formErrors.numero_serie && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.numero_serie}</p>
                  )}
                </div>
              </div>

              {/* Fecha de adquisición */}
              <div className="sm:col-span-3">
                <label htmlFor="fecha_adquisicion" className="block text-sm font-medium text-gray-700">
                  Fecha de adquisición *
                </label>
                <div className="mt-1">
                  <input
                    type="date"
                    name="fecha_adquisicion"
                    id="fecha_adquisicion"
                    value={formData.fecha_adquisicion}
                    onChange={handleChange}
                    className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                      formErrors.fecha_adquisicion ? 'border-red-300' : ''
                    }`}
                  />
                  {formErrors.fecha_adquisicion && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.fecha_adquisicion}</p>
                  )}
                </div>
              </div>

              {/* Frecuencia de mantenimiento */}
              <div className="sm:col-span-3">
                <label htmlFor="frecuencia_mantenimiento" className="block text-sm font-medium text-gray-700">
                  Frecuencia de mantenimiento *
                </label>
                <div className="mt-1">
                  <select
                    name="frecuencia_mantenimiento"
                    id="frecuencia_mantenimiento"
                    value={formData.frecuencia_mantenimiento}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="mensual">Mensual</option>
                    <option value="bimestral">Bimestral</option>
                    <option value="trimestral">Trimestral</option>
                    <option value="semestral">Semestral</option>
                    <option value="anual">Anual</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Intervalo personalizado (condicional) */}
              {formData.frecuencia_mantenimiento === 'personalizado' && (
                <div className="sm:col-span-3">
                  <label htmlFor="intervalo_personalizado" className="block text-sm font-medium text-gray-700">
                    Intervalo personalizado (días) *
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="intervalo_personalizado"
                      id="intervalo_personalizado"
                      value={formData.intervalo_personalizado}
                      onChange={handleChange}
                      min="1"
                      max="365"
                      className={`shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                        formErrors.intervalo_personalizado ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.intervalo_personalizado && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.intervalo_personalizado}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="sm:col-span-3">
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                  Estado *
                </label>
                <div className="mt-1">
                  <select
                    name="estado"
                    id="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="activo">Activo</option>
                    <option value="mantenimiento">En mantenimiento</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              {/* Ubicación */}
              <div className="sm:col-span-3">
                <label htmlFor="ubicacion_id" className="block text-sm font-medium text-gray-700">
                  Ubicación
                </label>
                <div className="mt-1">
                  <select
                    name="ubicacion_id"
                    id="ubicacion_id"
                    value={formData.ubicacion_id}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    <option value="">Sin ubicación asignada</option>
                    {loadingUbicaciones ? (
                      <option disabled>Cargando ubicaciones...</option>
                    ) : (
                      ubicaciones.map(ubicacion => (
                        <option key={ubicacion.id} value={ubicacion.id}>
                          {ubicacion.nombre} {ubicacion.edificio ? `(${ubicacion.edificio})` : ''}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="mt-2">
                  <button
                    type="button"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar nueva ubicación
                  </button>
                </div>
              </div>

              {/* Notas adicionales */}
              <div className="sm:col-span-6">
                <label htmlFor="notas_adicionales" className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <div className="mt-1">
                  <textarea
                    name="notas_adicionales"
                    id="notas_adicionales"
                    rows={4}
                    value={formData.notas_adicionales}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Información adicional sobre el equipo..."
                  />
                </div>
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-end">
                <Link
                  to="/equipos"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Guardar equipo
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

export default NuevoEquipo;