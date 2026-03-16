import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../components/Card'
import Button from '../components/Button'
import { CourseQrPoster } from '../components/CourseQrPoster'
import apiClient from '../api/client'

interface CursoGrupo {
  id: number;
  cursoNombre: string;
  cursoCodigo: string;
  grupo: string;
  profesorNombre: string;
}


export default function ScheduleSurveys() {
  const navigate = useNavigate()
  const storedUser = (() => {
    try {
      const u = localStorage.getItem('user')
      return u ? JSON.parse(u) : null
    } catch {
      return null
    }
  })()

  const [form, setForm] = useState({
    careerId: '',
    period: '',
    startDate: '',
    endDate: '',
    target: 'all',
  })

  const [cursos, setCursos] = useState<CursoGrupo[]>([])
  const [loadingCursos, setLoadingCursos] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const loadCursos = async () => {
    try {
      setLoadingCursos(true)
      // TODO: ajustar al endpoint real que devuelva los cursos/grupos del coordinador
      const res = await apiClient.get('/api/coordinador/cursos-con-profesor')
      setCursos(res.data as CursoGrupo[])
    } catch (err) {
      console.error('Error cargando cursos para QRs:', err)
    } finally {
      setLoadingCursos(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelectedIds(cursos.map(c => c.id))
  }

  const clearSelection = () => {
    setSelectedIds([])
  }

  const selectedCursos = useMemo(
    () => cursos.filter(c => selectedIds.includes(c.id)),
    [cursos, selectedIds]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // 1) Aquí iría la llamada real a tu endpoint de programación de encuestas

      // 2) Generar QRs para los cursos seleccionados (si hay selección)
      if (selectedIds.length > 0) {
        try {
          await apiClient.post('/api/qr-evaluaciones/batch', {
            grupoIds: selectedIds,
            period: form.period,
            startDate: form.startDate,
            endDate: form.endDate,
          })
        } catch (err) {
          console.error('Error generando QRs en batch:', err)
        }
      }

      setSubmitting(false)
      alert('Encuesta programada correctamente')
      navigate('/dashboard-coordinador')
    } catch (err) {
      setSubmitting(false)
      alert('Error al programar la encuesta')
    }
  }

  const backToDashboard = () => navigate('/dashboard-coordinador')

  const fondo = new URL('../assets/fondo.webp', import.meta.url).href

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

        <main className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-8">
          <Card className="bg-white shadow-md border border-gray-200 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-gray-900">Programar Encuestas</CardTitle>
              <CardDescription>
                Define el período y selecciona los cursos que tendrán código QR para esta encuesta.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de inicio</label>
                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de cierre</label>
                    <input type="date" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                    <input name="period" value={form.period} onChange={handleChange} placeholder="2025-1" required className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500" />
                  </div>

                  <div>
                  </div>
                </div>

                {/* Selección masiva de cursos para QRs */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Cursos para generar QR</h3>
                      <p className="text-sm text-gray-600">
                        Marca los cursos/grupos que tendrán un QR para esta encuesta. Luego podrás descargar o imprimir los posters.
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={loadCursos}>
                        {loadingCursos ? 'Cargando...' : 'Cargar cursos'}
                      </Button>
                      <Button type="button" variant="outline" onClick={selectAll} disabled={cursos.length === 0}>
                        Seleccionar todos
                      </Button>
                      <Button type="button" variant="outline" onClick={clearSelection} disabled={selectedIds.length === 0}>
                        Limpiar
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left">
                          <th className="px-4 py-3 w-10" />
                          <th className="px-4 py-3">Curso</th>
                          <th className="px-4 py-3">Código</th>
                          <th className="px-4 py-3">Grupo</th>
                          <th className="px-4 py-3">Docente</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingCursos ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                              Cargando cursos...
                            </td>
                          </tr>
                        ) : cursos.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                              No hay cursos cargados. Haz clic en &quot;Cargar cursos&quot;.
                            </td>
                          </tr>
                        ) : (
                          cursos.map(curso => (
                            <tr key={curso.id} className="border-t hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-2">
                                <input
                                  type="checkbox"
                                  checked={selectedIds.includes(curso.id)}
                                  onChange={() => toggleSelect(curso.id)}
                                  className="h-4 w-4 text-university-red rounded border-gray-300"
                                />
                              </td>
                              <td className="px-4 py-2">{curso.cursoNombre}</td>
                              <td className="px-4 py-2">{curso.cursoCodigo}</td>
                              <td className="px-4 py-2">{curso.grupo}</td>
                              <td className="px-4 py-2">{curso.profesorNombre}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedCursos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-md font-semibold text-gray-900">
                        Previsualización de posters QR ({selectedCursos.length})
                      </h4>
                      <p className="text-xs text-gray-500">
                        La URL final usará un token generado en el backend; esta vista muestra el diseño que verán los estudiantes.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        {selectedCursos.map(curso => {
                          const previewUrl = `${window.location.origin}/qr-evaluacion?curso=${curso.cursoCodigo}&grupo=${curso.grupo}`
                          return (
                            <CourseQrPoster
                              key={curso.id}
                              url={previewUrl}
                              nombreMateria={curso.cursoNombre}
                              grupo={curso.grupo}
                              nombreProfesor={curso.profesorNombre}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                    {submitting ? 'Programando...' : 'Programar encuesta y QRs'}
                  </Button>
                  <Button type="button" variant="outline" onClick={backToDashboard}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}


