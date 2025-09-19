import { motion } from 'framer-motion';
import { X, CheckCircle } from 'lucide-react';
import Button from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar"
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="text-center mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">{message}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6 py-3"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 px-6 py-3"
          >
            {confirmText}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}