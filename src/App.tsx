import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import EquiposMedicos from './pages/EquiposMedicos';
import DetalleEquipo from './pages/DetalleEquipo';
import MantenimientosProgramados from './pages/MantenimientosProgramados';
import HistorialMantenimientos from './pages/HistorialMantenimientos';
import Calendario from './pages/Calendario';
import Reportes from './pages/Reportes';
import Configuracion from './pages/Configuracion';
import NuevoEquipo from './pages/NuevoEquipo';
import ProgramarMantenimiento from './pages/ProgramarMantenimiento';

function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}

export default App;