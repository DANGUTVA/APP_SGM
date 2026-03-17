import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHistoricoMantenimientos } from '../lib/supabase';
import { Search, Filter, Clock, Stethoscope } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const HistorialMantenimientos = () => {
  const [historial, setHistorial] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [historialFiltrado, setHistorialFiltrado] = useState<any[]>([]);

  useEffect(() => {
    const fetchHistorial = async () => {
      try {
        const data = await getHistoricoMantenimientos();
        setHistorial(data);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar historial de mantenimientos:', error);
        setLoading(false);
      }
    };
    
    fetchHistorial();
  }, []);

  useEffect(() => {
    // Aplicar filtros
    let resultado = historial;
    
    // Filtrar por tipo de mantenimiento
    if (filtro !== 'todos') {
      resultado = resultado.filter(registro => registro.tipo_mantenimiento === filtro);
    }
    
    // Filtrar por término de búsqueda
    if (busqueda) {
      const terminoBusqueda = busqueda.toLowerCase();
      resultado = resultado.filter(registro => 
        registro.equipos_medicos?.tipo_equipo?.toLowerCase().includes(terminoBusqueda) ||
        registro.equipos_medicos?.marca?.toLowerCase().includes(terminoBusqueda) ||
        registro.equipos_medicos?.modelo?.toLowerCase().includes(terminoBusqueda) ||
        registro.equipos_medicos?.id_equipo?.toLowerCase().includes(terminoBusqueda) ||
        registro.tecnico_responsable.toLowerCase().includes(terminoBusqueda)
      );
    }
    
    setHistorialFiltrado(resultado);
  }, [historial, filtro, busqueda]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando historial de mantenimientos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Historial de Mantenimientos</h1>
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
                <option value="todos">Todos los tipos</option>
                <option value="preventivo">Preventivo</option>
                <option value="correctivo">Correctivo</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Lista de historial */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        {historialFiltrado.length > 0 ? (
          <div className="flow-root">
            <ul className="divide-y divide-gray-200">
              {historialFiltrado.map((registro) => (
                <li key={registro.id} className="py-5 px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          {registro.equipos_medicos?.tipo_equipo} - {registro.equipos_medicos?.marca} {registro.equipos_medicos?.modelo}
                        </h3>
                        <p className="text-sm text-gray-500">
                          ID: {registro.equipos_medicos?.id_equipo}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 text-xs leading-none font-semibold rounded-full ${
                        registro.tipo_mantenimiento === 'preventivo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {registro.tipo_mantenimiento.charAt(0).toUpperCase() + registro.tipo_mantenimiento.slice(1)}
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        {format(parseISO(registro.fecha_realizado), "d 'de' MMMM, yyyy", { locale: es })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Técnico responsable</h4>
                      <p className="mt-1 text-sm text-gray-900">{registro.tecnico_responsable}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Duración</h4>
                      <p className="mt-1 text-sm text-gray-900">{registro.duracion_real} minutos</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-500">Acciones realizadas</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{registro.acciones_realizadas}</p>
                  </div>
                  {registro.hallazgos && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-500">Hallazgos</h4>
                      <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{registro.hallazgos}</p>
                    </div>
                  )}
                  <div className="mt-4 flex justify-end">
                    <Link
                      to={`/equipos/${registro.equipo_id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                      Ver detalles del equipo →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Clock className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron registros</h3>
            <p className="mt-1 text-sm text-gray-500">
              No hay registros de mantenimientos que coincidan con los criterios de búsqueda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialMantenimientos;