import React, { useState, useEffect } from 'react';
import { getMantenimientosProgramados, getDiasNoLaborables } from '../lib/supabase';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, 
  isSameDay, isToday, isWeekend, getDay, addMonths, parseISO, setMonth, getYear, 
  setYear, getMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const Calendario = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [mantenimientos, setMantenimientos] = useState<any[]>([]);
  const [diasNoLaborables, setDiasNoLaborables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mantenimientosData, diasNoLaborablesData] = await Promise.all([
          getMantenimientosProgramados(),
          getDiasNoLaborables()
        ]);
        
        setMantenimientos(mantenimientosData);
        setDiasNoLaborables(diasNoLaborablesData);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar datos del calendario:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(addMonths(currentDate, -1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMonth = parseInt(e.target.value);
    setCurrentDate(setMonth(currentDate, newMonth));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newYear = parseInt(e.target.value);
    setCurrentDate(setYear(currentDate, newYear));
  };

  const isMantenimientoDay = (date: Date) => {
    return mantenimientos.some(m => 
      isSameDay(parseISO(m.fecha_programada), date)
    );
  };

  const getMantenimientosForDay = (date: Date) => {
    return mantenimientos.filter(m => 
      isSameDay(parseISO(m.fecha_programada), date)
    );
  };

  const isDiaNoLaborable = (date: Date) => {
    return diasNoLaborables.some(d => 
      isSameDay(parseISO(d.fecha), date)
    );
  };

  const getDiaNoLaborableInfo = (date: Date) => {
    return diasNoLaborables.find(d => 
      isSameDay(parseISO(d.fecha), date)
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-600 border-t-transparent" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-gray-600">Cargando datos del calendario...</p>
        </div>
      </div>
    );
  }

  // Generar los días del mes actual
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Nombres de los días de la semana
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  // Para obtener el inicio correcto de la semana (lunes = 0)
  const getAdjustedDay = (day: Date) => {
    const d = getDay(day);
    return d === 0 ? 6 : d - 1; // Convertir 0-6 (Dom-Sáb) a 0-6 (Lun-Dom)
  };

  // Años para selector
  const currentYear = getYear(new Date());
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Calendario de Mantenimientos</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Controles de navegación */}
        <div className="p-4 flex items-center justify-between bg-blue-50 border-b">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-800">
              {format(currentDate, 'MMMM yyyy', { locale: es })}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <select
                value={getMonth(currentDate)}
                onChange={handleMonthChange}
                className="border-gray-300 rounded-md text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {format(setMonth(new Date(), i), 'MMMM', { locale: es })}
                  </option>
                ))}
              </select>
              <select
                value={getYear(currentDate)}
                onChange={handleYearChange}
                className="border-gray-300 rounded-md text-sm"
              >
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Calendario */}
        <div className="overflow-x-auto">
          <div className="min-w-full">
            {/* Días de la semana */}
            <div className="grid grid-cols-7 border-b">
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className="py-2 text-center text-sm font-medium text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Días del mes */}
            <div className="grid grid-cols-7">
              {/* Espacios en blanco para los días antes del inicio del mes */}
              {Array.from({ length: getAdjustedDay(monthStart) }).map((_, i) => (
                <div key={`empty-start-${i}`} className="h-24 border-b border-r p-1" />
              ))}
              
              {/* Días del mes */}
              {monthDays.map((day, i) => {
                const dayMantenimientos = getMantenimientosForDay(day);
                const isNoLaborable = isDiaNoLaborable(day);
                const infoNoLaborable = isNoLaborable ? getDiaNoLaborableInfo(day) : null;
                
                return (
                  <div
                    key={i}
                    className={`h-32 border-b border-r p-1 ${
                      isToday(day) ? 'bg-blue-50' :
                      isWeekend(day) ? 'bg-gray-50' :
                      isNoLaborable ? 'bg-red-50' :
                      ''
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                          isToday(day) 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-700'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayMantenimientos.length > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {dayMantenimientos.length}
                        </span>
                      )}
                    </div>
                    
                    {isNoLaborable && infoNoLaborable && (
                      <div className="mt-1 text-xs font-medium text-red-600 bg-red-50 p-1 rounded">
                        {infoNoLaborable.descripcion}
                      </div>
                    )}
                    
                    <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
                      {dayMantenimientos.slice(0, 2).map((mant: any) => (
                        <div
                          key={mant.id}
                          className="text-xs p-1 rounded truncate bg-blue-100 text-blue-800"
                        >
                          {mant.equipos_medicos?.tipo_equipo}
                        </div>
                      ))}
                      {dayMantenimientos.length > 2 && (
                        <div className="text-xs text-gray-500 font-medium">
                          + {dayMantenimientos.length - 2} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Espacios en blanco para los días después del fin del mes */}
              {Array.from({ length: 6 - getAdjustedDay(monthEnd) }).map((_, i) => (
                <div key={`empty-end-${i}`} className="h-24 border-b border-r p-1" />
              ))}
            </div>
          </div>
        </div>
        
        {/* Leyenda */}
        <div className="p-4 border-t bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Leyenda:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-50 border border-blue-200 mr-2"></div>
              <span className="text-xs text-gray-600">Hoy</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gray-50 border border-gray-200 mr-2"></div>
              <span className="text-xs text-gray-600">Fin de semana</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-50 border border-red-200 mr-2"></div>
              <span className="text-xs text-gray-600">Día no laborable</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 mr-2"></div>
              <span className="text-xs text-gray-600">Mantenimiento programado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendario;