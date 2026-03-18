import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEquipoMedico, getHistoricoMantenimientos } from '../lib/supabase';
import { Calendar, Clock, Clipboard, PenTool as Tool, AlertTriangle, ArrowLeft, Edit, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const DetalleEquipo = () => {
  const { id } = useParams<{ id: string }>();
  const [equipo, setEquipo] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState('info');
  
  // Estado para forzar recarga manual si hay error
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchDatos = async () => {
      setLoading(true);
      setError(null);

      try {
        if (id) {
          const [equipoData, historialData] = await Promise.all([
            getEquipoMedico(id),
            getHistoricoMantenimientos(id)
          ]);
          
          if (isMounted) {
            setEquipo(equipoData);
            setHistorial(historialData);
            setLoading(false);
          }
        }
      } catch (err: any) {
        console.error('Error al cargar detalle del equipo:', err);
        if (isMounted) {
          setError(err.message || 'No se pudo cargar la información del equipo.');
          setLoading(false);
        }
      }
    };
    
    fetchDatos();

    return () => {
      isMounted = false;
    };
  }, [id, retryTrigger]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando información del equipo...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-white shadow rounded-lg p-6">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ocurrió un error</h2>
        <p className="text-gray-600 mb-6 text-center max-w-md">{error}</p>
        <div className="flex gap-4">
          <Link 
            to="/equipos" 
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Link>
          <button 
            onClick={() => setRetryTrigger(prev => prev + 1)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!equipo && !loading && !error) {
    return (
      <div className="text-center py-12 bg-white shadow rounded-lg">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Equipo no encontrado</h2>
        <p className="text-gray-600 mb-6">No se pudo encontrar el equipo con ID: <span className="font-semibold">{id}</span></p>
        <Link to="/equipos" className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" /> Volver a la lista de equipos
        </Link>
      </div>
    );
  }

  const getEstadoClase = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <Link to="/equipos" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a la lista de equipos
        </Link>
      </div>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">{equipo.tipo_equipo} {equipo.marca} {equipo.modelo}</h2>
            <p className="text-sm text-gray-500">ID: {equipo.id_equipo} | Serie: {equipo.numero_serie}</p>
          </div>
          <div>
            <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getEstadoClase(equipo.estado)}`}>
              {equipo.estado.charAt(0).toUpperCase() + equipo.estado.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setTab('info')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                tab === 'info'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setTab('historial')}
              className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors duration-200 ${
                tab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Historial de Mantenimientos
            </button>
          </nav>
        </div>
        
        {/* Contenido de pestañas */}
        <div className="px-4 py-5 sm:p-6">
          {tab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Datos Técnicos</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Tipo de Equipo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{equipo.tipo_equipo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Marca</dt>
                      <dd className="mt-1 text-sm text-gray-900">{equipo.marca}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Modelo</dt>
                      <dd className="mt-1 text-sm text-gray-900">{equipo.modelo}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Número de Serie</dt>
                      <dd className="mt-1 text-sm text-gray-900">{equipo.numero_serie}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Fecha de Adquisición</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {equipo.fecha_adquisicion ? format(parseISO(equipo.fecha_adquisicion), 'dd/MM/yyyy') : 'N/A'}
                      </dd>
                    </div>
                    {equipo.fecha_baja && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de Baja</dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          {format(parseISO(equipo.fecha_baja), 'dd/MM/yyyy')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Ubicación</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {equipo.ubicaciones ? (
                    <dl className="grid grid-cols-1 gap-y-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Nombre</dt>
                        <dd className="mt-1 text-sm text-gray-900">{equipo.ubicaciones.nombre}</dd>
                      </div>
                      {equipo.ubicaciones.edificio && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Edificio</dt>
                          <dd className="mt-1 text-sm text-gray-900">{equipo.ubicaciones.edificio}</dd>
                        </div>
                      )}
                      {equipo.ubicaciones.planta !== null && (
                        <div>
                          <dt className="text-sm font-medium text-gray-500">Planta</dt>
                          <dd className="mt-1 text-sm text-gray-900">{equipo.ubicaciones.planta}</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    <p className="text-sm text-gray-500">No hay información de ubicación disponible.</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Información de Mantenimiento</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 gap-y-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Frecuencia de Mantenimiento</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{equipo.frecuencia_mantenimiento}</dd>
                    </div>
                    {equipo.frecuencia_mantenimiento === 'personalizado' && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Intervalo Personalizado</dt>
                        <dd className="mt-1 text-sm text-gray-900">{equipo.intervalo_personalizado} días</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Estado Actual</dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{equipo.estado}</dd>
                    </div>
                  </dl>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mt-6 mb-3">Notas Adicionales</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {equipo.notas_adicionales ? (
                    <p className="text-sm text-gray-900 whitespace-pre-line">{equipo.notas_adicionales}</p>
                  ) : (
                    <p className="text-sm text-gray-500 italic">No hay notas adicionales.</p>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <Link
                    to={`/equipos/${equipo.id_equipo}/editar`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Equipo
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {tab === 'historial' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Historial de Mantenimientos</h3>
                <Link
                  to={`/mantenimientos/programar?equipo=${equipo.id_equipo}`}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Calendar className="h-4 w-4 mr-1" />
                  Programar Mantenimiento
                </Link>
              </div>
              
              {historial.length > 0 ? (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {historial.map((item, index) => (
                      <li key={item.id}>
                        <div className="relative pb-8">
                          {index !== historial.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div className="relative">
                              <span className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Tool className="h-5 w-5 text-blue-600" />
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 py-1.5 bg-white border border-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                              <div className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900 capitalize">
                                  Mantenimiento {item.tipo_mantenimiento}
                                </span>{' '}
                                <span className="whitespace-nowrap ml-2 text-xs">
                                  {format(parseISO(item.fecha_realizado), "d 'de' MMMM, yyyy", { locale: es })}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-700">
                                <p className="font-medium text-blue-800">Técnico: <span className="text-gray-700 font-normal">{item.tecnico_responsable}</span></p>
                                <p className="text-gray-500 mt-1"><Clock className="inline h-3 w-3 mr-1"/>Duración: {item.duracion_real} minutos</p>
                                
                                <div className="mt-3 bg-gray-50 p-3 rounded-md">
                                  <p className="font-medium text-gray-900 text-xs uppercase tracking-wider mb-1">Acciones realizadas:</p>
                                  <p className="whitespace-pre-line text-gray-600">{item.acciones_realizadas}</p>
                                </div>
                                
                                {item.hallazgos && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-900 text-xs uppercase tracking-wider">Hallazgos:</p>
                                    <p className="whitespace-pre-line text-gray-600">{item.hallazgos}</p>
                                  </div>
                                )}
                                
                                {item.recomendaciones && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-900 text-xs uppercase tracking-wider">Recomendaciones:</p>
                                    <p className="whitespace-pre-line text-gray-600">{item.recomendaciones}</p>
                                  </div>
                                )}
                                
                                {item.piezas_reemplazadas && (
                                  <div className="mt-2">
                                    <p className="font-medium text-gray-900 text-xs uppercase tracking-wider">Piezas reemplazadas:</p>
                                    <p className="whitespace-pre-line text-gray-600">{item.piezas_reemplazadas}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <Clipboard className="h-12 w-12 text-gray-400 mx-auto" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin historial de mantenimientos</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No hay registros de mantenimientos realizados para este equipo.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetalleEquipo;
