import React, { useState, useEffect } from 'react';
import { getEquiposMedicos, getHistoricoMantenimientos, getMantenimientosProgramados } from '../lib/supabase';
import { BarChart3, PieChart, Calendar, Download, Filter, AlertTriangle, RefreshCw } from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';

const Reportes = () => {
  const [equipos, setEquipos] = useState<any[]>([]);
  const [historial, setHistorial] = useState<any[]>([]);
  const [mantenimientosProgramados, setMantenimientosProgramados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState('mes_actual');
  const [tipoReporte, setTipoReporte] = useState('cumplimiento');

  // Estado para forzar recarga manual si hay error
  const [retryTrigger, setRetryTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [equiposData, historialData, mantenimientosData] = await Promise.all([
          getEquiposMedicos(),
          getHistoricoMantenimientos(),
          getMantenimientosProgramados()
        ]);
        
        if (isMounted) {
          setEquipos(equiposData);
          setHistorial(historialData);
          setMantenimientosProgramados(mantenimientosData);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error al cargar datos para reportes:', err);
        if (isMounted) {
          setError(err.message || 'No se pudieron cargar los datos para los reportes. Verifique su conexión.');
          setLoading(false);
        }
      }
    };
    
    fetchData();

    return () => {
      isMounted = false;
    };
  }, [retryTrigger]);

  // Filtrar datos según el período seleccionado
  const getDataByPeriodo = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    
    switch (periodo) {
      case 'mes_actual':
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
        break;
      case 'mes_anterior':
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case 'trimestre':
        const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3);
        startDate = threeMonthsAgo;
        endDate = today;
        break;
      case 'anual':
        const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth());
        startDate = oneYearAgo;
        endDate = today;
        break;
      default:
        startDate = startOfMonth(today);
        endDate = endOfMonth(today);
    }
    
    const historialFiltrado = historial.filter(item => {
      const fecha = parseISO(item.fecha_realizado);
      return isWithinInterval(fecha, { start: startDate, end: endDate });
    });
    
    const mantenimientosFiltrados = mantenimientosProgramados.filter(item => {
      const fecha = parseISO(item.fecha_programada);
      return isWithinInterval(fecha, { start: startDate, end: endDate });
    });
    
    return { historialFiltrado, mantenimientosFiltrados };
  };

  const { historialFiltrado, mantenimientosFiltrados } = getDataByPeriodo();

  // Calcular métricas para reportes
  const calcularMetricas = () => {
    // Equipos por estado
    const equiposPorEstado = {
      activo: equipos.filter(e => e.estado === 'activo').length,
      mantenimiento: equipos.filter(e => e.estado === 'mantenimiento').length,
      inactivo: equipos.filter(e => e.estado === 'inactivo').length
    };
    
    // Mantenimientos por estado
    const mantenimientosPorEstado = {
      pendiente: mantenimientosFiltrados.filter(m => m.estado === 'pendiente').length,
      en_proceso: mantenimientosFiltrados.filter(m => m.estado === 'en_proceso').length,
      completado: mantenimientosFiltrados.filter(m => m.estado === 'completado').length,
      reprogramado: mantenimientosFiltrados.filter(m => m.estado === 'reprogramado').length,
      cancelado: mantenimientosFiltrados.filter(m => m.estado === 'cancelado').length
    };
    
    // Cumplimiento de mantenimientos
    const totalProgramados = mantenimientosFiltrados.length;
    const completados = mantenimientosFiltrados.filter(m => m.estado === 'completado').length;
    const tasaCumplimiento = totalProgramados > 0 ? (completados / totalProgramados) * 100 : 0;
    
    // Mantenimientos por tipo
    const mantenimientosPorTipo = {
      preventivo: historialFiltrado.filter(h => h.tipo_mantenimiento === 'preventivo').length,
      correctivo: historialFiltrado.filter(h => h.tipo_mantenimiento === 'correctivo').length
    };
    
    return {
      equiposPorEstado,
      mantenimientosPorEstado,
      tasaCumplimiento,
      mantenimientosPorTipo
    };
  };

  const metricas = calcularMetricas();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando datos para reportes...</p>
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
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar reporte
        </button>
      </div>
      
      {/* Filtros del reporte */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="mes_actual">Mes actual</option>
                <option value="mes_anterior">Mes anterior</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="anual">Último año</option>
              </select>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="cumplimiento">Cumplimiento de mantenimientos</option>
                <option value="estados">Estados de equipos</option>
                <option value="tipos">Tipos de mantenimiento</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contenido del reporte */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center">
            {tipoReporte === 'cumplimiento' ? (
              <BarChart3 className="h-5 w-5 text-blue-700 mr-2" />
            ) : (
              <PieChart className="h-5 w-5 text-blue-700 mr-2" />
            )}
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              {tipoReporte === 'cumplimiento' && 'Reporte de Cumplimiento de Mantenimientos'}
              {tipoReporte === 'estados' && 'Reporte de Estados de Equipos'}
              {tipoReporte === 'tipos' && 'Reporte de Tipos de Mantenimiento'}
            </h3>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Período: {
              periodo === 'mes_actual' ? 'Mes actual' :
              periodo === 'mes_anterior' ? 'Mes anterior' :
              periodo === 'trimestre' ? 'Últimos 3 meses' : 'Último año'
            }
          </p>
        </div>
        
        <div className="p-6">
          {tipoReporte === 'cumplimiento' && (
            <div>
              <div className="mb-8">
                <h4 className="text-base font-semibold text-gray-800 mb-4">Indicadores de cumplimiento</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Mantenimientos programados</p>
                    <p className="text-2xl font-bold text-gray-800">{mantenimientosFiltrados.length}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Mantenimientos completados</p>
                    <p className="text-2xl font-bold text-green-600">{metricas.mantenimientosPorEstado.completado}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Tasa de cumplimiento</p>
                    <p className="text-2xl font-bold text-blue-600">{metricas.tasaCumplimiento.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-base font-semibold text-gray-800 mb-4">Distribución por estado</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Completados</span>
                        <span className="text-sm font-medium text-gray-700">
                          {metricas.mantenimientosPorEstado.completado} ({mantenimientosFiltrados.length > 0 
                            ? ((metricas.mantenimientosPorEstado.completado / mantenimientosFiltrados.length) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mantenimientosFiltrados.length > 0 
                          ? (metricas.mantenimientosPorEstado.completado / mantenimientosFiltrados.length) * 100 
                          : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Pendientes</span>
                        <span className="text-sm font-medium text-gray-700">
                          {metricas.mantenimientosPorEstado.pendiente} ({mantenimientosFiltrados.length > 0 
                            ? ((metricas.mantenimientosPorEstado.pendiente / mantenimientosFiltrados.length) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mantenimientosFiltrados.length > 0 
                          ? (metricas.mantenimientosPorEstado.pendiente / mantenimientosFiltrados.length) * 100 
                          : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">En proceso</span>
                        <span className="text-sm font-medium text-gray-700">
                          {metricas.mantenimientosPorEstado.en_proceso} ({mantenimientosFiltrados.length > 0 
                            ? ((metricas.mantenimientosPorEstado.en_proceso / mantenimientosFiltrados.length) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-yellow-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mantenimientosFiltrados.length > 0 
                          ? (metricas.mantenimientosPorEstado.en_proceso / mantenimientosFiltrados.length) * 100 
                          : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Reprogramados</span>
                        <span className="text-sm font-medium text-gray-700">
                          {metricas.mantenimientosPorEstado.reprogramado} ({mantenimientosFiltrados.length > 0 
                            ? ((metricas.mantenimientosPorEstado.reprogramado / mantenimientosFiltrados.length) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-purple-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mantenimientosFiltrados.length > 0 
                          ? (metricas.mantenimientosPorEstado.reprogramado / mantenimientosFiltrados.length) * 100 
                          : 0}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Cancelados</span>
                        <span className="text-sm font-medium text-gray-700">
                          {metricas.mantenimientosPorEstado.cancelado} ({mantenimientosFiltrados.length > 0 
                            ? ((metricas.mantenimientosPorEstado.cancelado / mantenimientosFiltrados.length) * 100).toFixed(1) 
                            : 0}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-red-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${mantenimientosFiltrados.length > 0 
                          ? (metricas.mantenimientosPorEstado.cancelado / mantenimientosFiltrados.length) * 100 
                          : 0}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {tipoReporte === 'estados' && (
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4">Estado actual de los equipos</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-500">Equipos activos</p>
                  <p className="text-2xl font-bold text-gray-800">{metricas.equiposPorEstado.activo}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {equipos.length > 0 ? ((metricas.equiposPorEstado.activo / equipos.length) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-gray-500">En mantenimiento</p>
                  <p className="text-2xl font-bold text-gray-800">{metricas.equiposPorEstado.mantenimiento}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {equipos.length > 0 ? ((metricas.equiposPorEstado.mantenimiento / equipos.length) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-red-500">
                  <p className="text-sm text-gray-500">Equipos inactivos</p>
                  <p className="text-2xl font-bold text-gray-800">{metricas.equiposPorEstado.inactivo}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {equipos.length > 0 ? ((metricas.equiposPorEstado.inactivo / equipos.length) * 100).toFixed(1) : 0}% del total
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {tipoReporte === 'tipos' && (
            <div>
              <h4 className="text-base font-semibold text-gray-800 mb-4">Distribución por tipo de mantenimiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-500">Mantenimientos preventivos</p>
                  <p className="text-2xl font-bold text-gray-800">{metricas.mantenimientosPorTipo.preventivo}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {historialFiltrado.length > 0 
                      ? ((metricas.mantenimientosPorTipo.preventivo / historialFiltrado.length) * 100).toFixed(1) 
                      : 0}% del total
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500">
                  <p className="text-sm text-gray-500">Mantenimientos correctivos</p>
                  <p className="text-2xl font-bold text-gray-800">{metricas.mantenimientosPorTipo.correctivo}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    {historialFiltrado.length > 0 
                      ? ((metricas.mantenimientosPorTipo.correctivo / historialFiltrado.length) * 100).toFixed(1) 
                      : 0}% del total
                  </p>
                </div>
              </div>
              
              {historialFiltrado.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-base font-semibold text-gray-800 mb-4">Relación preventivo vs. correctivo</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div className="bg-green-500 h-4 transition-all duration-500" style={{ 
                        width: `${(metricas.mantenimientosPorTipo.preventivo / historialFiltrado.length) * 100}%`,
                        float: 'left'
                      }}>
                      </div>
                      <div className="bg-orange-500 h-4 transition-all duration-500" style={{ 
                        width: `${(metricas.mantenimientosPorTipo.correctivo / historialFiltrado.length) * 100}%`,
                        float: 'left'
                      }}>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs font-medium text-green-700">Preventivo: {
                        ((metricas.mantenimientosPorTipo.preventivo / historialFiltrado.length) * 100).toFixed(1)
                      }%</span>
                      <span className="text-xs font-medium text-orange-700">Correctivo: {
                        ((metricas.mantenimientosPorTipo.correctivo / historialFiltrado.length) * 100).toFixed(1)
                      }%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
