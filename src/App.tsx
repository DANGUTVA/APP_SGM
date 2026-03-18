import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';

// Carga perezosa (Lazy Loading) de las páginas
// Layout se mantiene como import normal porque envuelve a toda la app
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EquiposMedicos = lazy(() => import('./pages/EquiposMedicos'));
const DetalleEquipo = lazy(() => import('./pages/DetalleEquipo'));
const NuevoEquipo = lazy(() => import('./pages/NuevoEquipo'));
const MantenimientosProgramados = lazy(() => import('./pages/MantenimientosProgramados'));
const ProgramarMantenimiento = lazy(() => import('./pages/ProgramarMantenimiento'));
const HistorialMantenimientos = lazy(() => import('./pages/HistorialMantenimientos'));
const Calendario = lazy(() => import('./pages/Calendario'));
const Reportes = lazy(() => import('./pages/Reportes'));
const Configuracion = lazy(() => import('./pages/Configuracion'));

// Componente de carga global para mostrar mientras se descarga el código de la pantalla
const PageLoader = () => (
  <div className="flex h-full min-h-[60vh] items-center justify-center p-10">
    <div className="text-center">
      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
        <span className="visually-hidden">Cargando...</span>
      </div>
      <p className="mt-2 text-gray-600">Cargando pantalla...</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      {/* Suspense atrapa el estado de carga de los componentes lazy */}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="equipos" element={<EquiposMedicos />} />
            <Route path="equipos/nuevo" element={<NuevoEquipo />} />
            <Route path="equipos/:id" element={<DetalleEquipo />} />
            <Route path="mantenimientos" element={<MantenimientosProgramados />} />
            <Route path="mantenimientos/programar" element={<ProgramarMantenimiento />} />
            <Route path="historial" element={<HistorialMantenimientos />} />
            <Route path="calendario" element={<Calendario />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="configuracion" element={<Configuracion />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
