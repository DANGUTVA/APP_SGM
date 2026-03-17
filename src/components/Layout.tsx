import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Stethoscope, 
  Calendar, 
  ClipboardCheck, 
  Clock, 
  BarChart3, 
  Settings, 
  Menu, 
  X
} from 'lucide-react';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { path: '/equipos', label: 'Equipos Médicos', icon: <Stethoscope className="h-5 w-5" /> },
    { path: '/mantenimientos', label: 'Mantenimientos', icon: <ClipboardCheck className="h-5 w-5" /> },
    { path: '/historial', label: 'Historial', icon: <Clock className="h-5 w-5" /> },
    { path: '/calendario', label: 'Calendario', icon: <Calendar className="h-5 w-5" /> },
    { path: '/reportes', label: 'Reportes', icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/configuracion', label: 'Configuración', icon: <Settings className="h-5 w-5" /> }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar para móvil */}
      <div className={`md:hidden fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={toggleSidebar}></div>
        <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-sm py-4 bg-white shadow-xl">
          <div className="px-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-blue-800">MediMantenimiento</h2>
            <button onClick={toggleSidebar} className="rounded-md text-gray-500 hover:text-gray-700">
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="mt-5 flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'bg-blue-50 text-blue-800'
                    : 'text-gray-700 hover:bg-gray-100'
                } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                onClick={toggleSidebar}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-blue-700">
              <h2 className="text-xl font-bold text-white">MediMantenimiento</h2>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'bg-blue-50 text-blue-800'
                        : 'text-gray-700 hover:bg-gray-100'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow md:hidden">
          <button
            onClick={toggleSidebar}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
          >
            <span className="sr-only">Abrir menu</span>
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-center md:justify-start">
            <div className="flex-shrink-0 flex items-center">
              <h2 className="text-xl font-bold text-blue-800">MediMantenimiento</h2>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;