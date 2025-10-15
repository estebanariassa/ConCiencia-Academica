import Badge from './Badge';

interface RoleBadgeProps {
  roles: string[];
  className?: string;
}

const roleConfig = {
  admin: {
    label: 'Administrador',
    className: 'bg-red-100 text-red-800 border-red-200'
  },
  coordinador: {
    label: 'Coordinador',
    className: 'bg-purple-100 text-purple-800 border-purple-200'
  },
  profesor: {
    label: 'Profesor',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  docente: {
    label: 'Docente',
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  estudiante: {
    label: 'Estudiante',
    className: 'bg-green-100 text-green-800 border-green-200'
  }
};

export default function RoleBadge({ roles, className = '' }: RoleBadgeProps) {
  if (!roles || roles.length === 0) {
    return null;
  }

  // Ordenar roles por prioridad
  const rolePriority = ['admin', 'coordinador', 'profesor', 'docente', 'estudiante'];
  const sortedRoles = roles.sort((a, b) => {
    const aIndex = rolePriority.indexOf(a);
    const bIndex = rolePriority.indexOf(b);
    return aIndex - bIndex;
  });

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sortedRoles.map((role, index) => {
        const config = roleConfig[role as keyof typeof roleConfig];
        if (!config) return null;

        return (
          <Badge
            key={index}
            variant="outline"
            className={`text-sm font-medium ${config.className}`}
          >
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
}

