import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMantenimientosProgramados } from '../lib/supabase';
import { Calendar, Clock, Plus, Search, Filter, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const MantenimientosProgramados = () => {
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mantenimientosFiltrados, setMantenimientosFiltrados] = useState<any[]>([]);

  // Estado para forzar recarga manual si hay error
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchMantenimientos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getMantenimientosProgramados();
        if (isMounted) {
          setMantenimientos(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error al cargar mantenimientos programados:', err);
        if (isMounted) {
          setError(err.message || 'No se pudieron cargar los mantenimientos programados. Verifique su conexión.');
          setLoading(false);
        }
      }
    };
    
    fetchMantenimientos();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  useEffect(() => {
    // Aplicar filtros
    let resultado = mantenimientos;
    
    // Filtrar por estado
    if (filtro !== 'todos') {
      resultado = resultado.filter(mantenimiento => mantenimiento.estado === filtro);
    }
    
    // Filtrar por término de búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      resultado = resultado.filter(mantenimiento => 
        (mantenimiento.equipos_medicos?.tipo_equipo?.toLowerCase().includes(terminoBusqueda)) ||
        (mantenimiento.equipos_medicos?.marca?.toLowerCase().includes(terminoBusqueda)) ||
        (mantenimiento.equipos_medicos?.modelo?.toLowerCase().includes(terminoBusqueda)) ||
        (mantenimiento.equipos_medicos?.id_equipo?.toLowerCase().includes(terminoBusqueda)) ||
        (mantenimiento.tecnico_asignado && mantenimiento.tecnico_asignado.toLowerCase().includes(terminoBusqueda))
      );
    }
    
    setMantenimientosFiltrados(resultado);
  }, [mantenimientos, filtro, busqueda]);

  const getEstadoClase = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-blue-100 text-blue-800';
      case 'en_proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'completado':
        return 'bg-green-100 text-green-800';
      case 'reprogramado':
        return 'bg-purple-100 text-purple-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPrioridadClase = (prioridad: string) => {
    switch (prioridad) {
      case 'alta':
        return 'bg-red-100 text-red-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'baja':
        return 'bg-gray-100 text-gray-800';
      case 'urgente':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando mantenimientos programados...</p>
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
        <button 
          onClick={() => setRetryTrigger(prev => prev + 1)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Mantenimientos Programados</h1>
        <Link 
          to="/mantenimientos/programar" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Programar Mantenimiento
        </Link>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-2/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={busqueda} 
                onChange={(e) => setBusqueda(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Buscar por equipo, técnico..." 
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="todos">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="en_proceso">En proceso</option>
                <option value="completado">Completados</option>
                <option value="reprogramado">Reprogramados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de mantenimientos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {mantenimientosFiltrados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Técnico
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prioridad
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mantenimientosFiltrados.map((mantenimiento) => (
                  <tr key={mantenimiento.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {mantenimiento.equipos_medicos?.tipo_equipo} - {mantenimiento.equipos_medicos?.marca} {mantenimiento.equipos_medicos?.modelo}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {mantenimiento.equipos_medicos?.id_equipo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {format(parseISO(mantenimiento.fecha_programada), "dd/MM/yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 capitalize">
                        {format(parseISO(mantenimiento.fecha_programada), "EEEE", { locale: es })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {mantenimiento.tecnico_asignado ? (
                          <span className="px-2 py-1 bg-gray-100 rounded-md">{mantenimiento.tecnico_asignado}</span>
                        ) : (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoClase(mantenimiento.estado)}`}>
                        {mantenimiento.estado.replace('_', ' ').charAt(0).toUpperCase() + mantenimiento.estado.replace('_', ' ').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPrioridadClase(mantenimiento.prioridad)}`}>
                        {mantenimiento.prioridad.charAt(0).toUpperCase() + mantenimiento.prioridad.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/mantenimientos/${mantenimiento.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3 font-semibold"
                      >
                        Ver
                      </Link>
                      {mantenimiento.estado === 'pendiente' && (
                        <Link
                          to={`/mantenimientos/${mantenimiento.id}/completar`}
                          className="text-green-600 hover:text-green-900 font-semibold"
                        >
                          Completar
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No se encontraron mantenimientos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay mantenimientos programados que coincidan con los criterios de búsqueda.
            </p>
            <div className="mt-6">
              <Link
                to="/mantenimientos/programar"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Programar Mantenimiento
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MantenimientosProgramados;
