import { User } from '../types'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-foreground mb-4">Dashboard</h1>
          <div className="bg-accent p-4 rounded-lg mb-6">
            <h2 className="text-xl font-semibold text-accent-foreground">
              Bienvenido, {user.name}
            </h2>
            <p className="text-accent-foreground/80">
              Has iniciado sesión como {user.type === 'student' ? 'Estudiante' : 
                                      user.type === 'teacher' ? 'Docente' : 'Coordinador'}
            </p>
            <p className="text-accent-foreground/80 mt-2">
              Email: {user.email}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">Evaluaciones Pendientes</h3>
              <p className="text-muted-foreground">No tienes evaluaciones pendientes en este momento.</p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">Historial</h3>
              <p className="text-muted-foreground">Revisa tus evaluaciones anteriores.</p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">Perfil</h3>
              <p className="text-muted-foreground">Actualiza tu información personal.</p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-foreground mb-2">Configuración</h3>
              <p className="text-muted-foreground">Ajusta las preferencias de tu cuenta.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}