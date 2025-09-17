import React from 'react';
import { motion } from 'framer-motion';

interface LikertScaleProps {
  value: number;
  onChange: (value: number) => void;
  options?: number;
  leftLabel?: string;
  rightLabel?: string;
}

export default function LikertScale({
  value,
  onChange,
  options = 5,
  leftLabel = "En desacuerdo",
  rightLabel = "De acuerdo"
}: LikertScaleProps) {
  return (
    <div className="space-y-4">
      {/* Labels */}
      <div className="flex justify-between items-center px-2">
        <span className="text-sm font-medium text-gray-600">{leftLabel}</span>
        <span className="text-sm font-medium text-gray-600">{rightLabel}</span>
      </div>
      
      {/* Scale */}
      <div className="flex justify-between items-center">
        {Array.from({ length: options }, (_, i) => i + 1).map((option) => (
          <motion.button
            key={option}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChange(option)}
            className="relative flex flex-col items-center"
          >
            {/* Circle */}
            <div
              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                value === option
                  ? 'border-red-500 bg-red-500 text-white'
                  : 'border-gray-300 hover:border-red-300'
              }`}
            >
              {value === option && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full"
                />
              )}
            </div>
            
            {/* Number */}
            <span className={`text-sm font-medium mt-2 ${
              value === option ? 'text-red-600 font-bold' : 'text-gray-600'
            }`}>
              {option}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}