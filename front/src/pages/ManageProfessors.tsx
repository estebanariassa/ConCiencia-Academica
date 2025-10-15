import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchProfessorsByCareer } from '../api/teachers'
import Header from '../components/Header'
import Card, { CardHeader, CardContent, CardDescription, CardTitle } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { motion } from 'framer-motion'
import { Search, ArrowLeft, ChevronRight, GraduationCap, BookOpen, User as UserIcon } from 'lucide-react'

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
  const [loading, setLoading] = useState(true)

  // Cargar profesores reales por carrera: primero `careerId` por query, sino del coordinador guardado
  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        let cid = careerIdFromQuery
        if (!cid) {
          const raw = localStorage.getItem('user')
          if (raw) {
            const u = JSON.parse(raw)
            cid = String(u?.coordinador?.carrera_id ?? u?.carrera_id ?? u?.profesor?.carrera_id ?? '') || null
          }
        }
        if (!cid) {
          setProfessors([])
          setLoading(false)
          return
        }
        console.log('🔍 Cargando profesores para carrera:', cid)
        const data = await fetchProfessorsByCareer(String(cid))
        console.log('📊 Datos recibidos del backend:', data)
        
        // Normalizar a la estructura usada aquí
        const normalized = (Array.isArray(data) ? data : []).map((p: any) => ({
          id: p.id || p.usuario_id,
          name: `${p.nombre ?? p.usuario?.nombre ?? ''} ${p.apellido ?? p.usuario?.apellido ?? ''}`.trim() || 'Sin nombre',
          department: p.carrera_nombre || p.cursos?.[0]?.carrera_nombre || 'Sin departamento',
          email: p.email ?? p.usuario?.email ?? '',
          courses: (p.cursos || []).map((c: any) => ({
            id: c.id,
            code: c.codigo,
            name: c.nombre,
            schedule: 'Por definir',
            carrera_id: c.carrera_id
          }))
        }))
        console.log('✅ Profesores normalizados:', normalized)
        setProfessors(normalized)
      } catch (e) {
        console.error('❌ Error loading professors by career:', e)
        setProfessors([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [careerIdFromQuery])

  const filtered = useMemo(() => {
    // Filtrar por carrera si viene en query, pero NO ocultar profesores sin cursos
    const byCareer = careerIdFromQuery
      ? professors.map(p => ({
          ...p,
          courses: p.courses.filter((c:any) => String(c.carrera_id) === String(careerIdFromQuery))
        }))
      : professors

    if (!searchTerm) return byCareer
    return byCareer.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.courses.some((c:any) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [searchTerm, professors, careerIdFromQuery])

  const backToDashboard = () => navigate('/dashboard-coordinador')

  return (
    <div className="min-h-screen bg-gray-50 relative">
      <div className="fixed inset-0 z-0" style={{
        backgroundImage: `url(${fondo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
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
                        onClick={() => setSelectedProfessor(p)}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-600">{p.department}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {p.courses.map((c:any)=> (
                                <Badge key={c.id} variant="outline" className="text-xs bg-white">{c.code}</Badge>
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
                        {selectedProfessor.courses.map((c:any)=> (
                          <div key={c.id} className="p-3 rounded-lg border bg-white hover:bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-gray-600" />
                                <span className="font-medium text-gray-900">{c.name} ({c.code})</span>
                              </div>
                              <span className="text-sm text-gray-600">{c.schedule}</span>
                            </div>
                          </div>
                        ))}
                      </div>
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


