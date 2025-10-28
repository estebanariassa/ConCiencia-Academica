import React from 'react';
import { motion } from 'framer-motion';

interface MockChartProps {
  title: string;
  description: string;
  type: 'line' | 'bar' | 'pie' | 'radar';
  data?: any[];
  isVisible: boolean;
}

const MockChart: React.FC<MockChartProps> = ({ title, description, type, data, isVisible }) => {
  if (!isVisible) return null;

  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-32 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-gray-500 text-sm">
                  📈 Gráfico de Línea
                  <br />
                  <span className="text-xs">Datos de ejemplo</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'bar':
        return (
          <div className="h-64 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-64 h-32 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-gray-500 text-sm">
                  📊 Gráfico de Barras
                  <br />
                  <span className="text-xs">Datos de ejemplo</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'pie':
        return (
          <div className="h-64 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-full shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-gray-500 text-xs text-center">
                  🥧 Gráfico de Pastel
                  <br />
                  <span className="text-xs">Datos de ejemplo</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'radar':
        return (
          <div className="h-64 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 flex items-center justify-center">
                <div className="text-gray-500 text-xs text-center">
                  🎯 Gráfico Radar
                  <br />
                  <span className="text-xs">Datos de ejemplo</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      
      {renderChart()}
      
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="text-xs text-blue-700">
              <strong>Previsualización:</strong> Este es un ejemplo de cómo se vería la gráfica con datos reales
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MockChart;
