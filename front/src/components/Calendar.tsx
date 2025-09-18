// components/Calendar.tsx
import { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface CalendarProps {
  onClose: () => void;
}

const Calendar = ({ onClose }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // Septiembre 2025

  // Fechas importantes
  const surveyStart = new Date(2025, 8, 16); // 16 de septiembre
  const surveyEnd = new Date(2025, 8, 26);   // 26 de septiembre

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatMonthYear = (date: Date) => {
    const options = { year: 'numeric', month: 'long' };
    return date.toLocaleDateString('es-ES', options);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const renderDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    let firstDayIndex = firstDay - 1;
    if (firstDayIndex < 0) firstDayIndex = 6;

    // Días vacíos al inicio
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(<div key={`empty-${i}`} className="h-16"></div>);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      
      let dayClass = "calendar-day text-center p-4 rounded-lg text-gray-700 text-lg font-medium flex items-center justify-center h-16"; // Tamaño aumentado
      let tooltip = "";

      if (isSameDay(dayDate, surveyStart)) {
        dayClass = "calendar-day tooltip text-center p-4 rounded-lg bg-blue-50 text-blue-600 font-bold border-2 border-blue-300 text-lg flex items-center justify-center h-16";
        tooltip = "Apertura de la encuesta";
      } else if (isSameDay(dayDate, surveyEnd)) {
        dayClass = "calendar-day tooltip text-center p-4 rounded-lg bg-red-50 text-red-600 font-bold border-2 border-red-300 text-lg flex items-center justify-center h-16";
        tooltip = "Cierre de la encuesta";
      }

      days.push(
        <div 
          key={`day-${i}`} 
          className={dayClass}
          data-tooltip={tooltip}
        >
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div 
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-6xl relative" // TAMAÑO AUMENTADO AQUÍ
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100"
        >
          <X className="h-6 w-6 text-gray-500" />
        </button>
        
        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {formatMonthYear(currentDate)}
          </h2>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigateMonth(-1)}
              className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button 
              onClick={() => navigateMonth(1)}
              className="p-3 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </div>
        </div>
        
        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-4 mb-6">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="text-center text-lg font-semibold text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-4">
          {renderDays()}
        </div>
        
        {/* Leyenda */}
        <div className="flex justify-center mt-8 space-x-6">
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-blue-500 mr-3"></div>
            <span className="text-base font-medium text-gray-700">Apertura de encuesta</span>
          </div>
          <div className="flex items-center">
            <div className="w-5 h-5 rounded-full bg-red-500 mr-3"></div>
            <span className="text-base font-medium text-gray-700">Cierre de encuesta</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Calendar;