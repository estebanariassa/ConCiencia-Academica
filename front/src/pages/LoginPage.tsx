import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import { User, UserType } from '../types';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaCog, 
  FaChevronDown,
  FaEnvelope,
  FaLock
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="card-shadow p-6">
          {/* Header con birrete */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="flex justify-center mb-3"
            >
              <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center">
                <FaGraduationCap className="h-8 w-8 text-primary-foreground" />
              </div>
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Sistema de Evaluación</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Accede con tus credenciales institucionales
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de Usuario - Dropdown */}
            <div>
              <h2 className="text-base font-medium text-foreground mb-3">Tipo de Usuario</h2>
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-between w-full p-3 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors text-base"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{getUserTypeIcon(userType, "h-4 w-4")}</span>
                    <span className="text-foreground">{getUserTypeLabel(userType)}</span>
                  </div>
                  <FaChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10"
                    >
                      {(['student', 'teacher', 'coordinator'] as UserType[]).map((type) => (
                        <div
                          key={type}
                          className={`flex items-center p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors text-base ${
                            userType === type ? 'bg-accent text-accent-foreground' : ''
                          }`}
                          onClick={() => {
                            setUserType(type);
                            setIsDropdownOpen(false);
                          }}
                        >
                          <span className="mr-2">{getUserTypeIcon(type, "h-4 w-4")}</span>
                          <span>{getUserTypeLabel(type)}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email con icono */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {userType === 'student' ? 'Código Estudiantil / Email' : 'Email Institucional'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={userType === 'student' ? 'estudiante@universidad.edu' : 'profesor@universidad.edu'}
                  required
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-input-background outline-none transition-colors input-focus text-sm"
                />
              </div>
            </div>

            {/* Contraseña con icono */}
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-input-background outline-none transition-colors input-focus text-sm"
                />
              </div>
            </div>

            {/* Botón de Ingresar con icono dinámico */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="submit"
                className="w-full py-2 btn-primary text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="loading-spinner" />
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
            <a href="#" className="text-sm text-primary hover:text-primary/80 transition-colors">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* Línea divisoria */}
          <div className="my-4 border-t border-border"></div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Universidad XYZ - Sistema de Evaluación Docente</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}