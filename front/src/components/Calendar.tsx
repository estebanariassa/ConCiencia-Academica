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
    const options = { year: 'numeric', month: 'long' } as const;
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
      days.push(<div key={`empty-${i}`} className="h-32"></div>);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);

      let dayClass =
        "calendar-day text-center p-6 rounded-xl text-gray-700 text-2xl font-semibold flex items-center justify-center h-32";
      let tooltip = "";

      if (isSameDay(dayDate, surveyStart)) {
        dayClass =
          "calendar-day tooltip text-center p-6 rounded-xl bg-blue-100 text-blue-700 font-bold border-2 border-blue-400 text-2xl flex items-center justify-center h-32";
        tooltip = "Apertura de la encuesta";
      } else if (isSameDay(dayDate, surveyEnd)) {
        dayClass =
          "calendar-day tooltip text-center p-6 rounded-xl bg-red-100 text-red-700 font-bold border-2 border-red-400 text-2xl flex items-center justify-center h-32";
        tooltip = "Cierre de la encuesta";
      }

      days.push(
        <div key={`day-${i}`} className={dayClass} data-tooltip={tooltip}>
          {i}
        </div>
      );
    }

    return days;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 overflow-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl p-10 w-[100vw] h-[100vh] max-w-[1800px] max-h-[1000px] relative mx-auto my-auto overflow-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ minWidth: "1000px" }}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full hover:bg-gray-100 bg-white shadow-md z-10"
        >
          <X className="h-8 w-8 text-gray-600" />
        </button>

        {/* Header del calendario */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-5xl font-bold text-gray-900">
            {formatMonthYear(currentDate)}
          </h2>
          <div className="flex space-x-6">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors bg-white shadow-md"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="p-5 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors bg-white shadow-md"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 gap-6 mb-6">
          {["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"].map((day) => (
            <div
              key={day}
              className="text-center text-2xl font-bold text-gray-700 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-6">{renderDays()}</div>

        {/* Leyenda */}
        <div className="flex justify-center mt-10 space-x-12 pt-6 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-500 mr-3"></div>
            <span className="text-xl font-semibold text-gray-800">
              Apertura de encuesta
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-red-500 mr-3"></div>
            <span className="text-xl font-semibold text-gray-800">
              Cierre de encuesta
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Calendar;
