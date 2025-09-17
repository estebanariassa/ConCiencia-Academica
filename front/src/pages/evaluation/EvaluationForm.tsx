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
import { Avatar, AvatarFallback, AvatarImage } from '../../components/Avatar';
import { Teacher, Course } from '../../types';
import { 
  Search, 
  ArrowLeft, 
  ChevronRight, 
  GraduationCap, 
  Clock,
  BookOpen,
  User
} from 'lucide-react';  

// Importar la imagen de fondo
const fondo = new URL('../../assets/fondo.webp', import.meta.url).href;

interface TeacherSelectionProps {
  onTeacherCourseSelected: (teacher: Teacher, course: Course) => void;
  onBack: () => void;
}

export default function TeacherSelection({ onTeacherCourseSelected, onBack }: TeacherSelectionProps) {
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
      // Navegar a la página de evaluación
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
        {/* Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 p-4 lg:p-6"
        >
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToDashboard}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Evaluación Docente - Paso 1 de 2</h1>
              <p className="text-sm text-gray-600">Selecciona el profesor y curso a evaluar</p>
            </div>
          </div>
        </motion.header>

        <main className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-xl border border-gray-200 p-8 rounded-2xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <Search className="h-6 w-6" />
                  Buscar Profesor
                </CardTitle>
                <CardDescription className="text-lg text-gray-600">
                  Busca por nombre del profesor, departamento o nombre del curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Buscar profesor o curso..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl bg-white outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 text-lg"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Teachers List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white shadow-xl border border-gray-200 p-6 rounded-2xl h-full">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Profesores Disponibles</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {filteredTeachers.length} profesor(es) encontrado(s)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[500px] overflow-y-auto">
                  {filteredTeachers.map((teacher, index) => (
                    <motion.div
                      key={teacher.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={`p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedTeacher?.id === teacher.id
                          ? 'border-red-500 bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleTeacherSelect(teacher)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-start gap-4">
                        <Avatar className="h-14 w-14">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-red-600 text-white text-lg">
                            {teacher.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{teacher.name}</h3>
                          <p className="text-md text-gray-600">{teacher.department}</p>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {teacher.courses.map(course => (
                              <Badge key={course.id} variant="outline" className="text-sm bg-white px-3 py-1">
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
                            <ChevronRight className="h-6 w-6" />
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
              <Card className={`bg-white shadow-xl border border-gray-200 p-6 rounded-2xl h-full ${selectedTeacher ? '' : 'opacity-70'}`}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-gray-900">Seleccionar Curso</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    {selectedTeacher 
                      ? `Cursos impartidos por ${selectedTeacher.name}`
                      : 'Primero selecciona un profesor'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {selectedTeacher ? (
                    <>
                      <div className="space-y-3">
                        <label className="block text-lg font-medium text-gray-700">Curso</label>
                        <div className="relative">
                          <select 
                            value={selectedCourse?.id || ''} 
                            onChange={(e) => handleCourseSelect(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white outline-none transition-colors focus:border-red-500 focus:ring-2 focus:ring-red-200 text-lg"
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
                          className="space-y-6"
                        >
                          <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900">Información del Curso</h4>
                            <div className="space-y-3">
                              <div className="flex items-center gap-3 text-lg">
                                <BookOpen className="h-5 w-5 text-gray-600" />
                                <span className="font-medium text-gray-900">{selectedCourse.name}</span>
                              </div>
                              <div className="flex items-center gap-2 text-lg text-gray-600">
                                <span className="font-medium">Código:</span>
                                <span>{selectedCourse.code}</span>
                              </div>
                              <div className="flex items-center gap-3 text-lg text-gray-600">
                                <Clock className="h-5 w-5" />
                                <span>{selectedCourse.schedule}</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 space-y-4">
                            <h4 className="font-semibold text-lg text-gray-900">Información del Profesor</h4>
                            <div className="flex items-start gap-4">
                              <Avatar className="h-14 w-14">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-red-600 text-white text-lg">
                                  {selectedTeacher.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-semibold text-lg text-gray-900">{selectedTeacher.name}</p>
                                <p className="text-md text-gray-600">{selectedTeacher.department}</p>
                                <p className="text-md text-gray-600 flex items-center gap-2 mt-2">
                                  <User className="h-4 w-4" />
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
                              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 text-lg rounded-xl"
                            >
                              Continuar a Evaluación
                              <ChevronRight className="h-5 w-5 ml-2" />
                            </Button>
                          </motion.div>
                        </motion.div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      <GraduationCap className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg">Selecciona un profesor para ver sus cursos disponibles</p>
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