import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay token en localStorage
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (!token || !savedUser) {
          console.log('🔒 No hay token o usuario guardado, redirigiendo al login');
          navigate('/login', { replace: true });
          return;
        }

        // Verificar que el usuario existe en el contexto
        if (!user && !loading) {
          console.log('🔒 Usuario no encontrado en contexto, redirigiendo al login');
          navigate('/login', { replace: true });
          return;
        }

        console.log('✅ Usuario autenticado correctamente');
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Error verificando autenticación:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [user, loading, navigate]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading || isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, mostrar fallback o redirigir
  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return null; // El useEffect ya maneja la redirección
  }

  // Usuario autenticado, mostrar contenido
  return <>{children}</>;
}




