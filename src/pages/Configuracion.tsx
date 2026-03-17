import React, { useState, useEffect } from 'react';
import { getDiasNoLaborables } from '../lib/supabase';
import { Calendar, Bell, Settings, Database, Plus, Trash, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const Configuracion = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [diasNoLaborables, setDiasNoLaborables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nuevoDiaNL, setNuevoDiaNL] = useState({
    fecha: '',
    descripcion: ''
  });
  
  // Añadir estados para los campos del formulario
  const [configForm, setConfigForm] = useState({
    nombre_institucion: 'Hospital General',
    zona_horaria: 'America/Mexico_City',
    dias_anticipacion: '7',
    anio_cronograma: '2024',
    email_remitente: '',
    destinatarios_default: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const diasNL = await getDiasNoLaborables();
        setDiasNoLaborables(diasNL);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar configuración:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleNuevoDiaNL = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí se implementaría la lógica para guardar un nuevo día no laborable
    console.log('Nuevo día no laborable:', nuevoDiaNL);
    setNuevoDiaNL({ fecha: '', descripcion: '' });
  };
  
  // Manejar cambios en los campos del formulario
  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfigForm(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  // Manejar el envío del formulario
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Configuración guardada:', configForm);
    // Aquí iría la lógica para guardar la configuración
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Pestañas */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('general')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                <span>General</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('dias_no_laborables')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'dias_no_laborables'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>Días No Laborables</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'notificaciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                <span>Notificaciones</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('integraciones')}
              className={`py-4 px-6 font-medium text-sm border-b-2 ${
                activeTab === 'integraciones'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>Integraciones</span>
              </div>
            </button>
          </nav>
        </div>
        
        {/* Contenido de las pestañas */}
        <div className="p-6">
          {activeTab === 'general' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración general</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Configuración de la aplicación</h3>
                <form className="space-y-4" onSubmit={handleConfigSubmit}>
                  <div>
                    <label htmlFor="nombre_institucion" className="block text-sm font-medium text-gray-700">
                      Nombre de la institución
                    </label>
                    <input
                      type="text"
                      id="nombre_institucion"
                      name="nombre_institucion"
                      value={configForm.nombre_institucion}
                      onChange={handleConfigChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="zona_horaria" className="block text-sm font-medium text-gray-700">
                      Zona horaria
                    </label>
                    <select
                      id="zona_horaria"
                      name="zona_horaria"
                      value={configForm.zona_horaria}
                      onChange={handleConfigChange}
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="America/Mexico_City">America/Mexico_City (UTC-6)</option>
                      <option value="America/Bogota">America/Bogota (UTC-5)</option>
                      <option value="America/Santiago">America/Santiago (UTC-4)</option>
                      <option value="America/Buenos_Aires">America/Buenos_Aires (UTC-3)</option>
                      <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dias_anticipacion" className="block text-sm font-medium text-gray-700">
                      Días de anticipación para notificaciones
                    </label>
                    <input
                      type="number"
                      id="dias_anticipacion"
                      name="dias_anticipacion"
                      value={configForm.dias_anticipacion}
                      onChange={handleConfigChange}
                      min="1"
                      max="30"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Cronograma anual</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Generar el cronograma anual de mantenimientos preventivos para todos los equipos activos.
                </p>
                <div className="flex items-center">
                  <select
                    name="anio_cronograma"
                    value={configForm.anio_cronograma}
                    onChange={handleConfigChange}
                    className="block w-full md:w-auto bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                  <button
                    type="button"
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Generar cronograma
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'dias_no_laborables' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Días no laborables</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Agregar nuevo día no laborable</h3>
                <form onSubmit={handleNuevoDiaNL} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">
                        Fecha
                      </label>
                      <input
                        type="date"
                        id="fecha"
                        value={nuevoDiaNL.fecha}
                        onChange={(e) => setNuevoDiaNL({...nuevoDiaNL, fecha: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                        Descripción
                      </label>
                      <input
                        type="text"
                        id="descripcion"
                        value={nuevoDiaNL.descripcion}
                        onChange={(e) => setNuevoDiaNL({...nuevoDiaNL, descripcion: e.target.value})}
                        placeholder="Ej: Feriado nacional, Día festivo"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar
                    </button>
                  </div>
                </form>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Días no laborables configurados</h3>
                {diasNoLaborables.length > 0 ? (
                  <div className="bg-white border rounded-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {diasNoLaborables.map((dia) => (
                        <li key={dia.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {format(parseISO(dia.fecha), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                              </p>
                              <p className="text-sm text-gray-500">{dia.descripcion}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay días no laborables</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Aún no se han configurado días no laborables.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'notificaciones' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configuración de notificaciones</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Configuración de correo electrónico</h3>
                <form className="space-y-4" onSubmit={handleConfigSubmit}>
                  <div>
                    <label htmlFor="email_remitente" className="block text-sm font-medium text-gray-700">
                      Correo electrónico del remitente
                    </label>
                    <input
                      type="email"
                      id="email_remitente"
                      name="email_remitente"
                      value={configForm.email_remitente}
                      onChange={handleConfigChange}
                      placeholder="notificaciones@hospital.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="destinatarios_default" className="block text-sm font-medium text-gray-700">
                      Destinatarios predeterminados (separados por coma)
                    </label>
                    <input
                      type="text"
                      id="destinatarios_default"
                      name="destinatarios_default"
                      value={configForm.destinatarios_default}
                      onChange={handleConfigChange}
                      placeholder="mantenimiento@hospital.com, jefe.mantenimiento@hospital.com"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="pt-5">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Guardar cambios
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Plantillas de notificaciones</h3>
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-md p-4 bg-white">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mantenimiento próximo</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Esta plantilla se utiliza para notificar sobre mantenimientos programados próximos.
                    </p>
                    <div className="border rounded-md p-3 bg-gray-50 text-sm text-gray-700">
                      <p>Asunto: Recordatorio de mantenimiento programado - [TIPO_EQUIPO]</p>
                      <p className="mt-2">Cuerpo:</p>
                      <p className="mt-1">Estimado(a),</p>
                      <p className="mt-1">Le recordamos que hay un mantenimiento programado para el siguiente equipo:</p>
                      <p className="mt-1">- Equipo: [TIPO_EQUIPO] [MARCA] [MODELO]</p>
                      <p>- ID: [ID_EQUIPO]</p>
                      <p>- Fecha: [FECHA_PROGRAMADA]</p>
                      <p>- Técnico asignado: [TECNICO_ASIGNADO]</p>
                      <p className="mt-1">Por favor, asegúrese de tener el equipo disponible para el mantenimiento.</p>
                      <p className="mt-1">Saludos cordiales,</p>
                      <p>Departamento de Mantenimiento</p>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar plantilla
                      </button>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-md p-4 bg-white">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Mantenimiento completado</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Esta plantilla se utiliza para notificar cuando un mantenimiento ha sido completado.
                    </p>
                    <div className="border rounded-md p-3 bg-gray-50 text-sm text-gray-700">
                      <p>Asunto: Mantenimiento completado - [TIPO_EQUIPO]</p>
                      <p className="mt-2">Cuerpo:</p>
                      <p className="mt-1">Estimado(a),</p>
                      <p className="mt-1">Le informamos que se ha completado el mantenimiento del siguiente equipo:</p>
                      <p className="mt-1">- Equipo: [TIPO_EQUIPO] [MARCA] [MODELO]</p>
                      <p>- ID: [ID_EQUIPO]</p>
                      <p>- Fecha de realización: [FECHA_REALIZADO]</p>
                      <p>- Técnico responsable: [TECNICO_RESPONSABLE]</p>
                      <p className="mt-1">Hallazgos y acciones realizadas:</p>
                      <p>[ACCIONES_REALIZADAS]</p>
                      <p className="mt-1">El equipo se encuentra ahora disponible para su uso normal.</p>
                      <p className="mt-1">Saludos cordiales,</p>
                      <p>Departamento de Mantenimiento</p>
                    </div>
                    <div className="mt-2 flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Editar plantilla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'integraciones' && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Integraciones con calendarios externos</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Google Calendar</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Conecte su cuenta de Google Calendar para sincronizar automáticamente los mantenimientos programados.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Conectar con Google Calendar
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Microsoft Outlook</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Conecte su cuenta de Microsoft Outlook para sincronizar automáticamente los mantenimientos programados.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Conectar con Microsoft Outlook
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Exportar en formato iCal</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Genere un archivo iCal con todos los mantenimientos programados para importar en cualquier aplicación de calendario.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="periodo_exportacion" className="block text-sm font-medium text-gray-700">
                      Período de exportación
                    </label>
                    <select
                      id="periodo_exportacion"
                      className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      defaultValue="1m"
                    >
                      <option value="1m">1 mes</option>
                      <option value="3m">3 meses</option>
                      <option value="6m">6 meses</option>
                      <option value="1y">1 año</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Exportar calendario
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuracion;