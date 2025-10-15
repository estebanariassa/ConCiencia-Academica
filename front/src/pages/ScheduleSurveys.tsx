import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Card, { CardHeader, CardContent, CardTitle, CardDescription } from '../components/Card'
import Button from '../components/Button'
import Badge from '../components/Badge'

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

  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      setTimeout(() => {
        setSubmitting(false)
        alert('Encuesta programada correctamente')
        navigate('/dashboard-coordinador')
      }, 600)
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
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      </div>

      <div className="relative z-10">
        <Header user={{ id: storedUser?.id || '', name: `${storedUser?.nombre || ''} ${storedUser?.apellido || ''}`.trim() || 'Coordinador', type: 'coordinator', email: storedUser?.email || '' }} />

        <main className="max-w-[1200px] mx-auto p-6 lg:p-8 space-y-8">
          <Card className="bg-white shadow-md border border-gray-200 p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl text-gray-900">Programar Encuestas</CardTitle>
              <CardDescription>Define el período, fechas y alcance de la encuesta.</CardDescription>
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

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="bg-red-600 hover:bg-red-700 text-white">
                    {submitting ? 'Programando...' : 'Programar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={backToDashboard}>Cancelar</Button>
                </div>

                <div className="pt-4">
                  <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-800">
                    Esta pantalla es funcional a nivel de UI; conecta tu endpoint cuando esté listo.
                  </Badge>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}


