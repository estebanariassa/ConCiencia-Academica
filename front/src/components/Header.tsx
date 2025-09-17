import React from 'react';
import { motion } from 'framer-motion';
import Button from './Button';
import { Avatar, AvatarFallback, AvatarImage } from './Avatar';
import { Bell, ArrowLeft, GraduationCap, UserCheck, Settings } from 'lucide-react';
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
  const getUserIcon = () => {
    if (!user) return null;
    switch (user.type) {
      case 'student':
        return <GraduationCap className="h-5 w-5" />;
      case 'teacher':
        return <UserCheck className="h-5 w-5" />;
      case 'coordinator':
        return <Settings className="h-5 w-5" />;
      default:
        return <GraduationCap className="h-5 w-5" />;
    }
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:py-6"
    >
      <div className="w-full">
        {/* Primera fila: logo a la izquierda, usuario a la derecha */}
        <div className="flex items-center justify-between w-full">
          {/* Logo y nombre de la universidad */}
          <div className="flex items-center gap-3">
            <img 
              src={logoUniversidad} 
              alt="Logo Universidad de Medellín" 
              className="h-[60px] w-[70px] lg:h-[100px] lg:w-[120px] object-contain"
            />
            <div className="hidden md:block">
              <h1 className="text-lg lg:text-xl font-semibold text-gray-900">ConCiencia Academica</h1>
              <p className="text-sm lg:text-base text-gray-600">Universidad de Medellín</p>
            </div>
          </div>
          
          {/* Elementos del usuario (campana y avatar) */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-600 rounded-full"></span>
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-red-600 text-white">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <div className="flex items-center gap-1">
                      {getUserIcon()}
                      <p className="text-xs text-gray-600 capitalize">{user.type}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Segunda fila: contenido adicional */}
        <div className="w-full mt-4">
          {/* Título y subtítulo personalizados */}
          {(title || subtitle) && (
            <div className="mb-2">
              {title && <h2 className="text-xl font-semibold text-gray-900">{title}</h2>}
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          )}

          {/* Botón de retroceso */}
          {showBackButton && onBack && (
            <div className="mb-2">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
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
  );
}