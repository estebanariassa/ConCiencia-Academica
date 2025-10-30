import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchProfessorsByCareer, fetchCourseGroups, debugAssignments, debugGroups } from '../api/teachers'
import Header from '../components/Header'
import Card, { CardHeader, CardContent, CardDescription, CardTitle } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, ChevronRight, GraduationCap, BookOpen, User as UserIcon, Clock } from 'lucide-react'

export default function ManageProfessors() {
  const navigate = useNavigate()
  const fondo = new URL('../assets/fondo.webp', import.meta.url).href
  const [searchParams] = useSearchParams()
  const careerIdFromQuery = searchParams.get('careerId')

  const storedUser = (() => {
    try { const u = localStorage.getItem('user'); return u ? JSON.parse(u) : null } catch { return null }
  })()

  // Estado de datos
  const [searchTerm, setSearchTerm] = useState('')
  const [professors, setProfessors] = useState<any[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<any | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [courseGroups, setCourseGroups] = useState<any[]>([])
  const [loadingGroups, setLoadingGroups] = useState<boolean>(false)
  const [selectedGroup, setSelectedGroup] = useState<any>(null)

  // Cargar profesores reales por carrera: primero `careerId` por query, sino del coordinador guardado
  useEffect(() => {
    const load = async () => {
      console.log('🚀 useEffect ejecutándose...', new Date().toLocaleTimeString())
      setLoading(true)
      try {
        let cid = careerIdFromQuery
        console.log('🔍 careerIdFromQuery:', careerIdFromQuery)
        
        if (!cid) {
          const raw = localStorage.getItem('user')
          console.log('🔍 localStorage user raw:', raw)
          if (raw) {
            const u = JSON.parse(raw)
            console.log('🔍 Usuario parseado:', u)
            cid = String(u?.coordinador?.carrera_id ?? u?.carrera_id ?? u?.profesor?.carrera_id ?? '') || null
            console.log('🔍 carrera_id extraído:', cid)
            
            // TEMPORAL: Si es coordinador conocido y no tiene carrera_id, asignar según email
            console.log('🔍 Verificando condición temporal - cid:', cid, 'email:', u?.email)
            if (!cid && u?.email === 'ejhernandez@udemedellin.edu.co') {
              cid = '1' // Emilcy - Sistemas
              console.log('🔧 TEMPORAL: Asignando carrera_id = 1 para Emilcy (Sistemas)')
            } else if (!cid && u?.email === 'magonzalez@udemedellin.edu.co') {
              cid = '5' // Mauricio - Telecomunicaciones
              console.log('🔧 TEMPORAL: Asignando carrera_id = 5 para Mauricio (Telecomunicaciones)')
            } else if (!cid && (u?.email === 'david.coordinador@udemedellin.edu.co' || u?.nombre?.toLowerCase().includes('david'))) {
              cid = '6' // David - Ingeniería Financiera
              console.log('🔧 TEMPORAL: Asignando carrera_id = 6 para David (Ingeniería Financiera)')
            } else {
              console.log('🔍 Condición temporal no se cumplió - cid:', cid, 'email:', u?.email)
            }
            
            // FORZAR: Si aún no hay cid, asignar carrera_id según el coordinador
            if (!cid && u?.email?.includes('ejhernandez@udemedellin.edu.co')) {
              cid = '1' // Emilcy - Sistemas
              console.log('🔧 FORZADO: Asignando carrera_id = 1 para Emilcy (Sistemas)')
            } else if (!cid && u?.email?.includes('magonzalez@udemedellin.edu.co')) {
              cid = '5' // Mauricio - Telecomunicaciones
              console.log('🔧 FORZADO: Asignando carrera_id = 5 para Mauricio (Telecomunicaciones)')
            }
          }
        }
        
        console.log('🔍 carrera_id final:', cid)
        
        if (!cid) {
          console.log('❌ No se encontró carrera_id, terminando carga')
          setProfessors([])
          setLoading(false)
          return
        }
        
        console.log('🔍 Cargando profesores para carrera:', cid)
        console.log('🔍 Usuario coordinador:', storedUser?.coordinador)
        console.log('🔍 Usuario completo:', storedUser)
        
        // Debug: Verificar asignaciones
        try {
          console.log('🔍 [DEBUG] Llamando a debugAssignments...')
          const debugData = await debugAssignments(String(cid))
          console.log('🔍 [DEBUG] Datos de debug:', debugData)
        } catch (debugError) {
          console.error('❌ [DEBUG] Error en debugAssignments:', debugError)
        }
        
        let data
        try {
          console.log('🚀 Llamando a fetchProfessorsByCareer...')
          data = await fetchProfessorsByCareer(String(cid))
          console.log('✅ fetchProfessorsByCareer completado')
          console.log('📊 Datos recibidos del backend:', data)
          console.log('📊 Tipo de datos:', typeof data, 'Es array:', Array.isArray(data), 'Longitud:', data?.length)
        } catch (fetchError) {
          console.error('❌ Error en fetchProfessorsByCareer:', fetchError)
          throw fetchError
        }
        
        // Normalizar a la estructura usada aquí
        const normalized = (Array.isArray(data) ? data : []).map((p: any) => ({
          id: p.id || p.usuario_id,
          name: `${p.nombre ?? p.usuario?.nombre ?? ''} ${p.apellido ?? p.usuario?.apellido ?? ''}`.trim() || 'Sin nombre',
          department: p.carrera_nombre || p.cursos?.[0]?.carrera_nombre || 'Sin departamento',
          email: p.email ?? p.usuario?.email ?? '',
          courses: (p.cursos || [])
            .filter((c: any) => {
              // Incluir cursos de la carrera del coordinador Y cursos de tronco común (id_carrera = 8)
              const isCoordinatorCareer = c.carrera_id === parseInt(cid || '0')
              const isCommonTrunk = c.carrera_id === 8
              return isCoordinatorCareer || isCommonTrunk
            })
            .map((c: any) => ({
              id: c.id,
              code: c.codigo,
              name: c.nombre,
              schedule: 'Por definir',
              carrera_id: c.carrera_id,
              carrera_nombre: c.carrera_nombre || (c.carrera_id === 8 ? 'Tronco Común' : 'Carrera Específica')
            }))
            // Eliminar duplicados por ID
            .filter((course: any, index: number, self: any[]) => 
              index === self.findIndex((c: any) => c.id === course.id)
            )
        }))
        console.log('✅ Profesores normalizados:', normalized)
        console.log('✅ Cantidad de profesores normalizados:', normalized.length)
        
        // Debug: Verificar si hay profesores sin cursos
        const profesoresSinCursos = normalized.filter(p => p.courses.length === 0)
        if (profesoresSinCursos.length > 0) {
          console.warn('⚠️ Profesores sin cursos encontrados:', profesoresSinCursos.map(p => p.name))
        }
        
        // Log detallado de cursos por profesor
        normalized.forEach((prof, index) => {
          console.log(`📚 Profesor ${index + 1}: ${prof.name}`)
          console.log(`📚 Cursos originales del backend:`, prof.courses)
          console.log(`📚 Cantidad de cursos:`, prof.courses.length)
          
          // Log de cursos por tipo
          const carreraSpecific = prof.courses.filter((c: any) => c.carrera_id === parseInt(cid || '0'))
          const commonTrunk = prof.courses.filter((c: any) => c.carrera_id === 8)
          console.log(`📚 Cursos de carrera específica (${cid}):`, carreraSpecific.length)
          console.log(`📚 Cursos de tronco común (8):`, commonTrunk.length)
          
          // Log detallado de cada curso
          prof.courses.forEach((course: any, courseIndex: number) => {
            console.log(`📚   Curso ${courseIndex + 1}:`, {
              id: course.id,
              name: course.name,
              code: course.code,
              carrera_id: course.carrera_id,
              carrera_nombre: course.carrera_nombre
            })
          })
        })
        setProfessors(normalized)
      } catch (e) {
        console.error('❌ Error loading professors by career:', e)
        setProfessors([])
      } finally {
        console.log('🏁 Finalizando carga, setLoading(false)')
        setLoading(false)
      }
    }
    load()
  }, [careerIdFromQuery])

  const filtered = useMemo(() => {
    // El backend ya filtra por carrera, solo aplicar búsqueda si hay término
    if (!searchTerm) return professors
    
    return professors.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.courses.some((c:any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm, professors])

  const backToDashboard = () => navigate('/dashboard-coordinador')

  const handleProfessorSelection = (professor: any) => {
    console.log('🔍 Profesor seleccionado:', professor)
    console.log('🔍 Cursos del profesor:', professor.courses)
    console.log('🔍 Cantidad de cursos:', professor.courses?.length || 0)
    setSelectedProfessor(professor)
    setSelectedCourse(null) // Limpiar selección de curso
    setCourseGroups([]) // Limpiar grupos
    setSelectedGroup(null) // Limpiar grupo seleccionado
  }

  const handleCourseSelection = async (course: any) => {
    setSelectedCourse(course)
    setCourseGroups([]) // Limpiar grupos
    setSelectedGroup(null) // Limpiar grupo seleccionado
    
    if (selectedProfessor && course) {
      setLoadingGroups(true)
      
      try {
        // Cargar grupos del curso
        console.log('📡 Cargando grupos para curso:', course.id)
        
        // Debug: Verificar grupos
        try {
          console.log('🔍 [DEBUG] Llamando a debugGroups...')
          const debugGroupsData = await debugGroups(selectedProfessor.id, course.id)
          console.log('🔍 [DEBUG] Datos de debug de grupos:', debugGroupsData)
        } catch (debugGroupsError) {
          console.error('❌ [DEBUG] Error en debugGroups:', debugGroupsError)
        }
        
        const groups = await fetchCourseGroups(selectedProfessor.id, course.id)
        console.log('🔍 Grupos recibidos del API:', groups)
        console.log('🔍 Tipo de grupos:', typeof groups, 'Es array:', Array.isArray(groups), 'Longitud:', groups?.length)
        setCourseGroups(groups || [])
        console.log('✅ Grupos cargados y establecidos:', groups)
      } catch (error) {
        console.error('❌ Error cargando grupos:', error)
        setCourseGroups([])
      } finally {
        setLoadingGroups(false)
      }
    }
  }

  const handleGroupSelection = (group: any) => {
    console.log('🔍 Group selected:', group)
    setSelectedGroup(group)
  }

  const viewSurveyResults = () => {
    if (selectedCourse && selectedProfessor && selectedGroup) {
      // Navegar a página de resultados con estado para evitar mocks
      navigate(
        `/reports/survey-results?courseId=${selectedCourse.id}&professorId=${selectedProfessor.id}&groupId=${selectedGroup.id}`,
        {
          state: {
            professor: selectedProfessor,
            course: selectedCourse,
            group: selectedGroup,
          }
        }
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      </div>

      <div className="relative z-10">
        <Header user={{ id: storedUser?.id || '', name: `${storedUser?.nombre || ''} ${storedUser?.apellido || ''}`.trim() || 'Coordinador', type: 'coordinator', email: storedUser?.email || '' }} />

        <main className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
          <div className="flex justify-start">
            <Button variant="ghost" size="lg" onClick={backToDashboard} className="ml-2 text-lg py-2 px-4 bg-white bg-opacity-90 rounded-lg shadow-md hover:bg-gray-100 transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Volver al Dashboard
            </Button>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-white shadow-md border border-gray-200 p-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Search className="h-5 w-5" /> Gestionar Profesores
                </CardTitle>
                <CardDescription>Busca y gestiona profesores y sus cursos.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="Buscar profesor o curso..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <Card className="bg-white shadow-md border border-gray-200 p-6">
                <CardHeader>
                  <CardTitle className="text-gray-900">Profesores</CardTitle>
                  <CardDescription>{filtered.length} profesor(es) encontrado(s)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                      <span className="ml-3 text-gray-600">Cargando profesores...</span>
                    </div>
                  ) : filtered.length > 0 ? (
                    filtered.map((p, index) => (
                      <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedProfessor?.id === p.id ? 'border-red-500 bg-red-50 shadow-md' : 'border-gray-200 hover:border-red-300 hover:bg-gray-50'}`}
                        onClick={() => handleProfessorSelection(p)}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-600">{p.department}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.courses.map((c:any)=> (
                                <Badge 
                                  key={c.id} 
                                  variant="outline" 
                                  className={`text-xs ${
                                    c.carrera_id === 8 
                                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                      : 'bg-white text-gray-700'
                                  }`}
                                >
                                  {c.code}
                                  {c.carrera_id === 8 && ' (TC)'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          {selectedProfessor?.id === p.id && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-red-600">
                              <ChevronRight className="h-5 w-5" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron profesores en esta carrera</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className={`bg-white shadow-md border border-gray-200 p-6 ${selectedProfessor ? '' : 'opacity-50'}`}>
                <CardHeader>
                  <CardTitle className="text-gray-900">Cursos del Profesor</CardTitle>
                  <CardDescription>
                    {selectedProfessor ? `Cursos de ${selectedProfessor.name}` : 'Selecciona un profesor'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProfessor ? (
                    <>
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                        <h4 className="font-medium text-gray-900">Información del Profesor</h4>
                        <p className="text-sm text-gray-600 flex items-center gap-1"><UserIcon className="h-3 w-3" /> {selectedProfessor.email}</p>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Curso ({selectedProfessor.courses?.length || 0} disponibles)
                        </label>
                        <div className="relative">
                          <select 
                            value={selectedCourse?.id || ''} 
                            onChange={(e) => {
                              console.log('🔍 Select onChange triggered with value:', e.target.value);
                              const course = selectedProfessor.courses.find((c: any) => String(c.id) === String(e.target.value));
                              if (course) {
                                handleCourseSelection(course);
                              }
                            }}
                            className="w-full p-2 border border-gray-300 rounded-lg bg-white outline-none transition-colors focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          >
                            <option value="">Selecciona un curso</option>
                            {selectedProfessor.courses?.length > 0 ? (
                              selectedProfessor.courses.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                  {c.name} ({c.code}){c.carrera_id === 8 ? ' - Tronco Común' : ''}
                                </option>
                              ))
                            ) : (
                              <option value="" disabled>No hay cursos disponibles</option>
                            )}
                          </select>
                        </div>
                        {selectedProfessor.courses?.length === 0 && (
                          <p className="text-sm text-red-600 mt-1">
                            Este profesor no tiene cursos asignados para este semestre
                          </p>
                        )}
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
                     {selectedCourse.carrera_id === 8 && (
                       <div className="flex items-center gap-2 text-sm">
                         <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                           Tronco Común
                         </Badge>
                       </div>
                     )}
                   </div>
                 </div>

                 <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                   <h4 className="font-medium text-blue-900 mb-2">Curso Seleccionado</h4>
                   <p className="text-sm text-blue-800 mb-3">
                     {selectedCourse.name} ({selectedCourse.code})
                   </p>
                 </div>
                 

                 {/* Sección de Grupos */}
                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                   <h4 className="font-medium text-gray-900">Grupos Disponibles</h4>
                   {loadingGroups ? (
                     <div className="text-center text-gray-500">Cargando grupos...</div>
                   ) : courseGroups.length > 0 ? (
                     <div className="space-y-2">
                       {courseGroups.map((group: any) => (
                         <div 
                           key={group.id} 
                           className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                             selectedGroup?.id === group.id
                               ? 'border-red-500 bg-red-50 shadow-md'
                               : 'border-gray-200 bg-white hover:border-red-300 hover:bg-gray-50'
                           }`}
                           onClick={() => handleGroupSelection(group)}
                         >
                           <div className="flex items-center justify-between">
                             <div>
                               <span className="font-medium text-gray-900">Grupo {group.numero_grupo}</span>
                               {group.horario && (
                                 <p className="text-sm text-gray-600">{group.horario}</p>
                               )}
                               {group.aula && (
                                 <p className="text-sm text-gray-600">Aula: {group.aula}</p>
                               )}
                             </div>
                             <div className="flex items-center gap-2">
                               {group.cup && (
                                 <Badge variant="outline" className="text-xs">
                                   {group.cup} cupos
                                 </Badge>
                               )}
                               {selectedGroup?.id === group.id && (
                                 <div className="text-red-600">
                                   <ChevronRight className="h-4 w-4" />
                                 </div>
                               )}
                             </div>
                           </div>
                         </div>
                       ))}
                     </div>
                   ) : (
                     <div className="text-center text-gray-500">No hay grupos disponibles</div>
                   )}
                 </div>

                 <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                   <h4 className="font-medium text-gray-900">Información del Profesor</h4>
                   <div className="flex items-start gap-3">
                     <div>
                       <p className="font-medium text-gray-900">{selectedProfessor.name}</p>
                       <p className="text-sm text-gray-600">{selectedProfessor.department}</p>
                       <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                         <UserIcon className="h-3 w-3" />
                         {selectedProfessor.email}
                       </p>
                     </div>
                   </div>
                 </div>
                 
                 <motion.div
                   whileHover={{ scale: selectedGroup ? 1.02 : 1 }}
                   whileTap={{ scale: selectedGroup ? 0.98 : 1 }}
                 >
                   <Button 
                     onClick={viewSurveyResults}
                     disabled={!selectedGroup}
                     className={`w-full py-3 ${
                       selectedGroup 
                         ? 'bg-red-600 hover:bg-red-700 text-white' 
                         : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                     }`}
                   >
                     {selectedGroup ? 'Ver Resultados de Encuestas' : 'Selecciona un grupo'}
                     <ChevronRight className="h-4 w-4 ml-2" />
                   </Button>
                 </motion.div>
               </motion.div>
             )}
                    </>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selecciona un profesor para ver sus cursos</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}


