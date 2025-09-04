import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, UserType } from '../types';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCog, 
  FaChevronDown,
  FaEnvelope,
  FaLock,
  FaExclamationCircle
} from 'react-icons/fa';

// Importación corregida usando new URL()
const fondo = new URL('../assets/fondo.webp', import.meta.url).href;

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [userType, setUserType] = useState<UserType>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  // Función para validar correo electrónico
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para manejar cambios en el email con validación
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Limpiar error si el campo está vacío
    if (!value) {
      setEmailError('');
      return;
    }
    
    // Validar formato de email
    if (!validateEmail(value)) {
      setEmailError('Por favor, ingresa un correo electrónico válido');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación del email antes de enviar
    if (!email || !validateEmail(email)) {
      setEmailError('Por favor, ingresa un correo electrónico válido');
      return;
    }
    
    // Validación básica
    if (!email || !password) {
      alert('Por favor, completa todos los campos');
      return;
    }
    
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockUser: User = {
      id: '1',
      name: userType === 'student' ? 'Ana García' : userType === 'teacher' ? 'Dr. Carlos Rodríguez' : 'Prof. María López',
      type: userType,
      email: email
    };

    onLogin(mockUser);
    setIsLoading(false);
    
    // Redireccionar al dashboard después del login
    navigate('/dashboard');
  };

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case 'student':
        return 'Estudiante';
      case 'teacher':
        return 'Docente';
      case 'coordinator':
        return 'Coordinador';
      default:
        return 'Estudiante';
    }
  };

  const getUserTypeIcon = (type: UserType, size = "h-5 w-5") => {
    switch (type) {
      case 'student':
        return <FaGraduationCap className={size} />;
      case 'teacher':
        return <FaChalkboardTeacher className={size} />;
      case 'coordinator':
        return <FaCog className={size} />;
      default:
        return <FaGraduationCap className={size} />;
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gray-100"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Overlay más oscuro para mejor contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="bg-white shadow-xl p-6">
          {/* Header con birrete */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center mb-3"
            >
              <div className="h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
                <FaGraduationCap className="h-8 w-8 text-white" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">Sistema de Evaluación</h1>
            <p className="text-gray-600 mt-2 text-sm">
              Accede con tus credenciales institucionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Usuario - Dropdown */}
            <div>
              <h2 className="text-base font-medium text-gray-700 mb-3">Tipo de Usuario</h2>
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 border border-gray-300 rounded-lg bg-white hover:border-red-500 transition-colors text-base"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center">
                    <span className="mr-2 text-red-600">{getUserTypeIcon(userType, "h-4 w-4")}</span>
                    <span className="text-gray-800">{getUserTypeLabel(userType)}</span>
                  </div>
                  <FaChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10"
                    >
                      {(['student', 'teacher', 'coordinator'] as UserType[]).map((type) => (
                        <div
                          key={type}
                          className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors text-base ${
                            userType === type ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => {
                            setUserType(type);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className="mr-2 text-red-600">{getUserTypeIcon(type, "h-4 w-4")}</span>
                          <span className="text-gray-800">{getUserTypeLabel(type)}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email con icono */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                {userType === 'student' ? 'Correo Institucional' : 'Email Institucional'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={userType === 'student' ? 'estudiante@universidad.edu' : 'profesor@universidad.edu'}
                  required
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm ${
                    emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                  }`}
                />
                {emailError && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaExclamationCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 flex items-center gap-1 mt-1"
                >
                  <FaExclamationCircle className="h-3 w-3" />
                  {emailError}
                </motion.p>
              )}
            </div>

            {/* Contraseña con icono */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm"
                />
              </div>
            </div>

            {/* Botón de Ingresar con icono dinámico */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full py-2 bg-red-600 hover:bg-red-700 text-white text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading-spinner border-white" />
                    Iniciando sesión...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    {getUserTypeIcon(userType, "h-4 w-4")}
                    Iniciar sesión como {getUserTypeLabel(userType)}
                  </div>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Enlace de olvidé contraseña */}
          <div className="text-center mt-4">
            <a href="#" className="text-sm text-red-600 hover:text-red-800 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Línea divisoria */}
          <div className="my-4 border-t border-gray-300"></div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-600">Universidad XYZ - Sistema de Evaluación Docente</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}