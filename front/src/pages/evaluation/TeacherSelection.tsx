import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  CardHeader, 
  CardContent, 
  CardDescription, 
  CardTitle 
} from '../../components/Card';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import Header from '../../components/Header';
import { Teacher, Course, User } from '../../types';
import { 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  GraduationCap, 
  Clock,
  MapPin,
  BookOpen,
  User as UserIcon
} from 'lucide-react';  

// Importar la imagen de fondo
const fondo = new URL('../../assets/fondo.webp', import.meta.url).href;

interface TeacherSelectionProps {
  onTeacherCourseSelected: (teacher: Teacher, course: Course) => void;
  onBack: () => void;
  user: User;
}

export default function TeacherSelection({ onTeacherCourseSelected, onBack, user }: TeacherSelectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const navigate = useNavigate();

  // Mock data
  const mockTeachers: Teacher[] = [
    {
      id: '1',
      name: 'Dr. Carlos Rodríguez',
      department: 'Ingeniería',
      email: 'carlos.rodriguez@universidad.edu',
      courses: [
        { id: '1a', name: 'Matemáticas I', code: 'MAT-101', schedule: 'Lun-Mié-Vie 8:00-9:30' },
        { id: '1b', name: 'Álgebra Lineal', code: 'MAT-201', schedule: 'Mar-Jue 10:00-11:30' }
      ]
    },
    {
      id: '2',
      name: 'Dra. Ana Martínez',
      department: 'Física',
      email: 'ana.martinez@universidad.edu',
      courses: [
        { id: '2a', name: 'Física I', code: 'FIS-101', schedule: 'Lun-Mié-Vie 9:30-11:00' },
        { id: '2b', name: 'Física II', code: 'FIS-201', schedule: 'Mar-Jue 13:00-14:30' }
      ]
    },
    {
      id: '3',
      name: 'Prof. Luis García',
      department: 'Química',
      email: 'luis.garcia@universidad.edu',
      courses: [
        { id: '3a', name: 'Química Orgánica', code: 'QUI-301', schedule: 'Lun-Mié-Vie 14:00-15:30' },
        { id: '3b', name: 'Química Analítica', code: 'QUI-201', schedule: 'Mar-Jue 8:00-9:30' }
      ]
    },
    {
      id: '4',
      name: 'Dra. María López',
      department: 'Biología',
      email: 'maria.lopez@universidad.edu',
      courses: [
        { id: '4a', name: 'Biología Celular', code: 'BIO-201', schedule: 'Lun-Mié-Vie 11:00-12:30' },
        { id: '4b', name: 'Genética', code: 'BIO-301', schedule: 'Mar-Jue 15:00-16:30' }
      ]
    }
  ];

  const filteredTeachers = useMemo(() => {
    if (!searchTerm) return mockTeachers;
    return mockTeachers.filter(teacher =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.courses.some(course => 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm]);

  const handleTeacherSelect = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setSelectedCourse(null);
  };

  const handleCourseSelect = (courseId: string) => {
    if (!selectedTeacher) return;
    const course = selectedTeacher.courses.find(c => c.id === courseId);
    if (course) {
      setSelectedCourse(course);
    }
  };

  const handleContinue = () => {
    if (selectedTeacher && selectedCourse) {
      onTeacherCourseSelected(selectedTeacher, selectedCourse);
      navigate('/evaluate/form', { 
        state: { 
          teacher: selectedTeacher, 
          course: selectedCourse 
        } 
      });
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Fondo fijo que cubre toda la página */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${fondo})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Overlay oscuro que cubre toda la página */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header sin botón de volver */}
        <Header 
          user={user}
          title="Evaluación Docente - Paso 1 de 2"
          subtitle="Selecciona el profesor y curso a evaluar"
        />

        <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          {/* Botón de volver independiente - Posicionado en la esquina superior izquierda */}
          <div className="flex justify-start">
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={handleBackToDashboard}
              className="ml-2 text-lg py-2 px-4 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Search className="h-5 w-5" />
                  Buscar Profesor
                </CardTitle>
                <CardDescription>
                  Busca por nombre del profesor, departamento o nombre del curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar profesor o curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Teachers List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader>
                  <CardTitle className="text-gray-900">Profesores Disponibles</CardTitle>
                  <CardDescription>
                    {filteredTeachers.length} profesor(es) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedTeacher?.id === teacher.id
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTeacherSelect(teacher)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                          <p className="text-sm text-gray-600">{teacher.department}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {teacher.courses.map(course => (
                              <Badge key={course.id} variant="outline" className="text-xs bg-white">
                                {course.code}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {selectedTeacher?.id === teacher.id && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-red-600"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Course Selection */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className={`bg-white shadow-md border border-gray-200 p-6 ${selectedTeacher ? '' : 'opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="text-gray-900">Seleccionar Curso</CardTitle>
                  <CardDescription>
                    {selectedTeacher 
                      ? `Cursos impartidos por ${selectedTeacher.name}`
                      : 'Primero selecciona un profesor'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTeacher ? (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Curso</label>
                        <div className="relative">
                          <select 
                            value={selectedCourse?.id || ''} 
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          >
                            <option value="">Selecciona un curso</option>
                            {selectedTeacher.courses.map(course => (
                              <option key={course.id} value={course.id}>
                                {course.name} ({course.code})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedCourse && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                            <h4 className="font-medium text-gray-900">Información del Curso</h4>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm">
                                <BookOpen className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-900">{selectedCourse.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">Código:</span>
                                <span>{selectedCourse.code}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{selectedCourse.schedule}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                            <h4 className="font-medium text-gray-900">Información del Profesor</h4>
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-red-600 text-white">
                                  {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{selectedTeacher.name}</p>
                                <p className="text-sm text-gray-600">{selectedTeacher.department}</p>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                  <UserIcon className="h-3 w-3" />
                                  {selectedTeacher.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button 
                              onClick={handleContinue}
                              className="w-full bg-red-600 hover:bg-red-700 text-white py-3"
                            >
                              Continuar a Evaluación
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecciona un profesor para ver sus cursos disponibles</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}