import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import UserMenu from './UserMenu';
import { Bell, ArrowLeft } from 'lucide-react';
import { User } from '../types';

// Importar imágenes
const logoUniversidad = new URL('../assets/logo_conciencia.webp', import.meta.url).href;

interface HeaderProps {
  user?: User;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  children?: React.ReactNode;
}

export default function Header({ 
  user, 
  title, 
  subtitle, 
  showBackButton = false, 
  onBack, 
  children 
}: HeaderProps) {
  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white border-b border-gray-200 px-4 lg:px-4 py-8 lg:py-1"
      >
        <div className="w-full">
          {/* Primera fila: logo a la izquierda, usuario a la derecha */}
          <div className="flex items-center justify-between w-full">
            {/* Logo y nombre de la universidad - Reducido para móviles */}
            <div className="flex items-center gap-3">
                    <img 
        src={logoUniversidad}
        alt="Logo Universidad de Medellín"
       className="h-[120px] w-auto object-contain"
              />
              <div className="hidden md:block">
                <h1 className="text-lg lg:text-xl font-semibold text-gray-900">ConCiencia Academica</h1>
                <p className="text-sm lg:text-base text-gray-600">Universidad de Medellín</p>
              </div>
            </div>
            
            {/* Título y subtítulo centrados - Solo visible en desktop */}
            {(title || subtitle) && (
              <div className="hidden lg:flex flex-col items-center flex-1 mx-4">
                {title && <h2 className="text-xl font-semibold text-gray-900 text-center" style={{ marginLeft: '-330px' }}>{title}</h2>}
                  <p className="text-sm text-gray-600 text-center mt-1" style={{ marginLeft: '-330px' }}>
    {subtitle}
  </p>
              </div>
            )}
            
            {/* Elementos del usuario (campana y menú de usuario) */}
            <div className="flex items-center gap-4">
              {user && (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                  </Button>
                  <UserMenu />
                </>
              )}
            </div>
          </div>

          {/* Segunda fila: título y subtítulo para móviles */}
          <div className="w-full mt-4 lg:mt-2">
            {/* Título y subtítulo para móviles */}
            {(title || subtitle) && (
              <div className="lg:hidden text-center mb-2">
                {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
                {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
              </div>
            )}

            {/* Contenido adicional */}
            {children && (
              <div>
                {children}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Botón de retroceso fuera del header */}
      {showBackButton && onBack && (
        <div className="bg-white border-b border-gray-200 py-3">
          <div className="max-w-7xl mx-auto px-4 lg:px-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </div>
        </div>
      )}
    </>
  );
}