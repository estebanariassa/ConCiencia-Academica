# 🤝 Guía de Contribución - ConCiencia Académica

## 📋 Proceso de Pull Request

### 1. **Antes de Crear un PR**

#### ✅ Checklist Pre-PR:
- [ ] Código funciona correctamente
- [ ] Tests pasan (unitarios e integración)
- [ ] Código sigue las convenciones del proyecto
- [ ] Documentación actualizada si es necesario
- [ ] No hay warnings o errores de linting
- [ ] Cambios probados manualmente

#### 🔄 Preparación:
```bash
# 1. Crear rama desde main
git checkout main
git pull origin main
git checkout -b feature/nombre-de-la-funcionalidad

# 2. Hacer cambios y commits
git add .
git commit -m "feat: descripción del cambio"

# 3. Push de la rama
git push origin feature/nombre-de-la-funcionalidad
```

### 2. **Estructura del Pull Request**

#### 📝 **Título del PR:**
```
tipo(alcance): descripción breve del cambio
```

**Tipos permitidos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Cambios en documentación
- `style`: Cambios de formato
- `refactor`: Refactoring de código
- `test`: Añadir o corregir tests
- `chore`: Cambios en build, dependencias, etc.

**Ejemplos:**
- `feat(auth): implementar autenticación con Supabase`
- `fix(evaluations): corregir cálculo de promedios`
- `docs(api): actualizar documentación de endpoints`

#### 📋 **Descripción del PR:**

**Estructura obligatoria:**
```markdown
## 📝 Descripción
[Descripción breve del cambio]

## 🎯 Tipo de Cambio
- [ ] 🐛 Bug fix
- [ ] ✨ Nueva funcionalidad
- [ ] 💥 Breaking change
- [ ] 📚 Documentación
- [ ] ♻️ Refactoring

## 🔄 Cambios Realizados
[Lista detallada de cambios]

## 🧪 Testing
[Descripción de pruebas realizadas]

## 📸 Screenshots (si aplica)
[Capturas de pantalla]

## 🔗 Issues Relacionados
- Closes #123
- Relates to #456
```

### 3. **Convenciones de Código**

#### 🎨 **Frontend (React/TypeScript):**
```typescript
// ✅ Bueno
interface UserProps {
  id: string;
  name: string;
  email: string;
}

const UserComponent: React.FC<UserProps> = ({ id, name, email }) => {
  return (
    <div className="user-card">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
};

// ❌ Malo
const user = (props) => {
  return <div><h3>{props.name}</h3></div>
}
```

#### 🛠️ **Backend (Node.js/TypeScript):**
```typescript
// ✅ Bueno
export interface CreateUserRequest {
  name: string;
  email: string;
  type: UserType;
}

export const createUser = async (userData: CreateUserRequest): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

// ❌ Malo
export const createUser = async (data) => {
  return await supabase.from('usuarios').insert(data);
}
```

#### 🗄️ **Base de Datos (SQL):**
```sql
-- ✅ Bueno
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    apellido VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('estudiante', 'profesor', 'coordinador', 'admin')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ❌ Malo
CREATE TABLE users (
    id int,
    email text,
    name text
);
```

### 4. **Convenciones de Commits**

#### 📝 **Formato de Commits:**
```
tipo(alcance): descripción breve

Descripción más detallada si es necesario.

- Cambio específico 1
- Cambio específico 2
- Cambio específico 3

Closes #123
```

**Tipos de commit:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato, espacios, etc.
- `refactor`: Refactoring
- `test`: Tests
- `chore`: Build, dependencias, etc.

**Ejemplos:**
```bash
git commit -m "feat(auth): implementar login con Supabase"
git commit -m "fix(evaluations): corregir cálculo de promedio"
git commit -m "docs(api): actualizar documentación de endpoints"
```

### 5. **Proceso de Revisión**

#### 👀 **Para Revisores:**

**Checklist de Revisión:**
- [ ] Código funciona según especificaciones
- [ ] Código sigue convenciones del proyecto
- [ ] Tests pasan y cubren nuevos cambios
- [ ] Documentación actualizada
- [ ] No hay código duplicado
- [ ] Manejo de errores apropiado
- [ ] Performance aceptable
- [ ] Seguridad considerada

**Tipos de Comentarios:**
- 💡 **Sugerencia**: Mejora opcional
- ⚠️ **Advertencia**: Problema potencial
- 🐛 **Bug**: Error que debe corregirse
- ❓ **Pregunta**: Necesita aclaración

#### 🔄 **Para Autores:**

**Respondiendo a Comentarios:**
- Responde a todos los comentarios
- Haz los cambios solicitados
- Marca comentarios como resueltos
- Actualiza el PR si es necesario

### 6. **Estados del PR**

#### 📊 **Etiquetas de Estado:**
- `🚧 WIP` - Work in Progress
- `🔍 Needs Review` - Listo para revisión
- `✅ Approved` - Aprobado
- `❌ Changes Requested` - Cambios solicitados
- `🔒 On Hold` - En espera
- `🚀 Ready to Merge` - Listo para mergear

#### 🏷️ **Etiquetas de Tipo:**
- `🐛 bug` - Corrección de bug
- `✨ feature` - Nueva funcionalidad
- `📚 documentation` - Documentación
- `♻️ refactor` - Refactoring
- `🧪 test` - Tests
- `🏗️ architecture` - Cambios arquitectónicos

### 7. **Merge y Deploy**

#### 🔀 **Estrategia de Merge:**
- **Squash and Merge**: Para PRs pequeños y limpios
- **Rebase and Merge**: Para mantener historial lineal
- **Merge Commit**: Para PRs complejos con múltiples commits

#### 🚀 **Después del Merge:**
- [ ] Eliminar rama feature
- [ ] Actualizar documentación si es necesario
- [ ] Notificar a stakeholders
- [ ] Monitorear deploy en producción

### 8. **Herramientas Recomendadas**

#### 🛠️ **Desarrollo:**
- **IDE**: VS Code con extensiones de TypeScript
- **Linting**: ESLint + Prettier
- **Testing**: Jest + React Testing Library
- **Git**: GitKraken o SourceTree para visualización

#### 📊 **Monitoreo:**
- **CI/CD**: GitHub Actions
- **Code Quality**: SonarQube o CodeClimate
- **Performance**: Lighthouse CI

### 9. **Ejemplos de PRs**

#### ✅ **PR Bien Estructurado:**
```markdown
# feat(auth): implementar autenticación con Supabase

## 📝 Descripción
Implementa sistema de autenticación completo usando Supabase Auth con soporte para estudiantes, profesores y coordinadores.

## 🎯 Tipo de Cambio
- [x] ✨ Nueva funcionalidad
- [ ] 🐛 Bug fix
- [ ] 💥 Breaking change

## 🔄 Cambios Realizados
- Configuración de Supabase Auth
- Componentes de login y registro
- Middleware de autenticación
- Protección de rutas
- Manejo de sesiones

## 🧪 Testing
- Tests unitarios para componentes de auth
- Tests de integración para flujo completo
- Verificado en Chrome, Firefox y Safari
- Pruebas con diferentes tipos de usuario

## 📸 Screenshots
[Capturas de pantalla del nuevo login]

## 🔗 Issues Relacionados
- Closes #45
- Relates to #23
```

#### ❌ **PR Mal Estructurado:**
```markdown
# cambios de auth

hice cambios en la autenticación
```

### 10. **Recursos Adicionales**

#### 📚 **Documentación:**
- [Guía de Git](https://git-scm.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)

#### 🛠️ **Herramientas:**
- [Commitizen](https://commitizen.github.io/cz-cli/) - Para commits consistentes
- [Husky](https://typicode.github.io/husky/) - Git hooks
- [Lint-staged](https://github.com/okonet/lint-staged) - Lint en archivos staged

---

**¿Tienes dudas sobre el proceso?** Abre un issue o contacta al equipo de desarrollo.
