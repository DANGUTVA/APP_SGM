import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMantenimientosProximos, getEquiposMedicos } from '../lib/supabase';
import { AlertTriangle, CheckCircle, Clock, Calendar, BarChart3, Stethoscope } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = () => {
  const [mantenimientosProximos, setMantenimientosProximos] = useState<any[]>([]);
  const [equiposActivos, setEquiposActivos] = useState(0);
  const [equiposEnMantenimiento, setEquiposEnMantenimiento] = useState(0);
  const [equiposInactivos, setEquiposInactivos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mantenimientos, equipos] = await Promise.all([
          getMantenimientosProximos(7),
          getEquiposMedicos()
        ]);
        
        setMantenimientosProximos(mantenimientos);
        
        // Contadores de equipos por estado
        const activos = equipos.filter(e => e.estado === 'activo').length;
        const enMantenimiento = equipos.filter(e => e.estado === 'mantenimiento').length;
        const inactivos = equipos.filter(e => e.estado === 'inactivo').length;
        
        setEquiposActivos(activos);
        setEquiposEnMantenimiento(enMantenimiento);
        setEquiposInactivos(inactivos);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
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
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Resumen de equipos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Equipos Activos</p>
              <p className="text-2xl font-bold text-gray-800">{equiposActivos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">En Mantenimiento</p>
              <p className="text-2xl font-bold text-gray-800">{equiposEnMantenimiento}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Equipos Inactivos</p>
              <p className="text-2xl font-bold text-gray-800">{equiposInactivos}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mantenimientos próximos */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div className="px-4 py-5 sm:px-6 bg-blue-50 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-700 mr-2" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">Mantenimientos Próximos (7 días)</h3>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {mantenimientosProximos.length > 0 ? (
            mantenimientosProximos.map((mant) => (
              <div key={mant.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-700 truncate">
                      {mant.equipos_medicos.tipo_equipo} - {mant.equipos_medicos.marca} {mant.equipos_medicos.modelo}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      ID: {mant.equipos_medicos.id_equipo}
                    </p>
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {format(parseISO(mant.fecha_programada), "EEEE d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {mant.tecnico_asignado || 'Sin técnico asignado'}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      mant.prioridad === 'alta' ? 'bg-red-100 text-red-800' : 
                      mant.prioridad === 'normal' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mant.prioridad.charAt(0).toUpperCase() + mant.prioridad.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-5 text-center text-gray-500">
              No hay mantenimientos programados para los próximos 7 días.
            </div>
          )}
        </div>
        {mantenimientosProximos.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 text-right">
            <Link 
              to="/mantenimientos" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Ver todos los mantenimientos →
            </Link>
          </div>
        )}
      </div>
      
      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/equipos/nuevo" className="bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 p-6 text-center">
          <Stethoscope className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Registrar Equipo</h3>
          <p className="mt-1 text-sm text-gray-500">Añadir un nuevo equipo médico al sistema</p>
        </Link>
        
        <Link to="/mantenimientos/programar" className="bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 p-6 text-center">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Programar Mantenimiento</h3>
          <p className="mt-1 text-sm text-gray-500">Agendar un nuevo mantenimiento preventivo</p>
        </Link>
        
        <Link to="/reportes" className="bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 p-6 text-center">
          <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Generar Reporte</h3>
          <p className="mt-1 text-sm text-gray-500">Crear informes de mantenimiento y cumplimiento</p>
        </Link>
        
        <Link to="/calendario" className="bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 p-6 text-center">
          <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">Ver Calendario</h3>
          <p className="mt-1 text-sm text-gray-500">Visualizar cronograma de mantenimientos</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;