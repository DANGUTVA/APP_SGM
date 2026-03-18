import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getEquiposMedicos } from '../lib/supabase';
import { Stethoscope, AlertTriangle, CheckCircle, Clock, Search, Plus, Filter, RefreshCw } from 'lucide-react';

const EquiposMedicos = () => {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [equiposFiltrados, setEquiposFiltrados] = useState<any[]>([]);
  
  // Estado para forzar una recarga manual
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchEquipos = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getEquiposMedicos();
        if (isMounted) {
          setEquipos(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error al cargar equipos médicos:', err);
        if (isMounted) {
          setError(err.message || 'No se pudieron cargar los equipos médicos. Verifique su conexión.');
          setLoading(false);
        }
      }
    };
    
    fetchEquipos();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]); // Se vuelve a ejecutar si cambia retryTrigger

  useEffect(() => {
    // Aplicar filtros de búsqueda de manera local
    let resultado = equipos;
    
    // Filtrar por estado
    if (filtro !== 'todos') {
      resultado = resultado.filter(equipo => equipo.estado === filtro);
    }
    
    // Filtrar por término de búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase().trim();
      resultado = resultado.filter(equipo => 
        (equipo.id_equipo && equipo.id_equipo.toLowerCase().includes(terminoBusqueda)) ||
        (equipo.tipo_equipo && equipo.tipo_equipo.toLowerCase().includes(terminoBusqueda)) ||
        (equipo.marca && equipo.marca.toLowerCase().includes(terminoBusqueda)) ||
        (equipo.modelo && equipo.modelo.toLowerCase().includes(terminoBusqueda)) ||
        (equipo.numero_serie && equipo.numero_serie.toLowerCase().includes(terminoBusqueda))
      );
    }
    
    setEquiposFiltrados(resultado);
  }, [equipos, filtro, busqueda]);

  const getEstadoIcono = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'mantenimiento':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'inactivo':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando equipos médicos...</p>
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
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Equipos Médicos</h1>
        <Link 
          to="/equipos/nuevo" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
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
                placeholder="Buscar por ID, tipo, marca o modelo..." 
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
                <option value="activo">Activos</option>
                <option value="mantenimiento">En mantenimiento</option>
                <option value="inactivo">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de equipos */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        {equiposFiltrados.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {equiposFiltrados.map((equipo) => (
              <li key={equipo.id_equipo}>
                <Link to={`/equipos/${equipo.id_equipo}`} className="block hover:bg-gray-50 transition duration-150 ease-in-out">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 p-2 rounded-full bg-blue-50">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-700 truncate">
                            {equipo.tipo_equipo} - {equipo.marca} {equipo.modelo}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: {equipo.id_equipo} | Serie: {equipo.numero_serie}
                          </p>
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getEstadoClase(equipo.estado)}`}>
                          {getEstadoIcono(equipo.estado)}
                          <span className="ml-1">{equipo.estado.charAt(0).toUpperCase() + equipo.estado.slice(1)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {equipo.ubicaciones?.nombre || 'Sin ubicación asignada'}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        Frecuencia: <span className="capitalize ml-1">{equipo.frecuencia_mantenimiento}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-medium text-gray-900">No se encontraron equipos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {equipos.length === 0 
                ? "Aún no hay equipos registrados en el sistema."
                : "No hay equipos médicos que coincidan con los criterios de búsqueda."}
            </p>
            <div className="mt-6">
              <Link
                to="/equipos/nuevo"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Equipo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquiposMedicos;
