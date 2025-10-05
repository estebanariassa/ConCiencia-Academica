# Pruebas de Conexión Backend-Frontend

Este documento describe cómo ejecutar las pruebas para verificar que el backend y frontend están correctamente conectados.

## 📋 Pruebas Disponibles

### 1. Prueba del Backend (`test-backend-frontend-connection.ts`)

Esta prueba verifica:
- ✅ Conectividad del servidor backend
- ✅ Conexión a la base de datos Supabase
- ✅ Configuración CORS
- ✅ Endpoints de autenticación
- ✅ Compatibilidad con la API del frontend
- ✅ Flujo completo de integración

**Ejecutar:**
```bash
cd back
npm run test-connection
```

### 2. Prueba del Frontend (`test-connection.ts`)

Esta prueba verifica:
- ✅ Conexión con la API del backend
- ✅ Flujo de autenticación
- ✅ Peticiones protegidas
- ✅ Gestión de tokens
- ✅ Logout

**Ejecutar en el navegador:**
1. Inicia el frontend: `cd front && npm run dev`
2. Abre http://localhost:5173
3. Abre la consola del navegador (F12)
4. Ejecuta: `runFrontendTests()`

### 3. Prueba del Sistema Completo (`test-full-system.js`)

Esta prueba ejecuta todas las pruebas anteriores y verifica:
- ✅ Prerrequisitos del sistema
- ✅ Pruebas del backend
- ✅ Build del frontend

**Ejecutar:**
```bash
node test-full-system.js
```

## 🚀 Guía de Uso Rápido

### Opción 1: Prueba Rápida del Backend
```bash
cd back
npm run test-connection
```

### Opción 2: Prueba Completa del Sistema
```bash
# Ejecutar prueba completa
node test-full-system.js
```

### Opción 3: Prueba Manual Paso a Paso

1. **Iniciar el Backend:**
   ```bash
   cd back
   npm run dev
   ```

2. **Iniciar el Frontend (en otra terminal):**
   ```bash
   cd front
   npm run dev
   ```

3. **Verificar conectividad:**
   - Backend: http://localhost:3000/health
   - Frontend: http://localhost:5173

4. **Probar login:**
   - Usa las credenciales de prueba que se crean automáticamente
   - Email: `test.frontend@example.com`
   - Password: `FrontendTest123!`

## 🔧 Configuración Requerida

### Variables de Entorno del Backend
```env
PORT=3000
BACKEND_URL=http://localhost:3000
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
JWT_SECRET=tu_jwt_secret
```

### Variables de Entorno del Frontend
```env
VITE_API_URL=http://localhost:3000
```

## 📊 Interpretación de Resultados

### ✅ Pruebas Exitosas
```
🎉 ¡Todas las pruebas pasaron!
💡 El backend está correctamente conectado y listo para el frontend
```

### ❌ Pruebas Fallidas
```
⚠️  Algunas pruebas fallaron. Revisa la configuración.

🔧 Posibles soluciones:
   - Verifica que el servidor backend esté ejecutándose
   - Revisa las variables de entorno
   - Verifica la configuración de CORS
   - Asegúrate de que Supabase esté configurado correctamente
```

## 🐛 Solución de Problemas Comunes

### Error: "No se pudo conectar al servidor backend"
- Verifica que el backend esté ejecutándose en el puerto 3000
- Revisa la variable `BACKEND_URL` o `VITE_API_URL`

### Error: "Error conectando a Supabase"
- Verifica las variables `SUPABASE_URL` y `SUPABASE_ANON_KEY`
- Asegúrate de que Supabase esté configurado correctamente

### Error: "CORS error"
- Verifica que CORS esté habilitado en el backend
- Revisa que las URLs de origen estén permitidas

### Error: "Token inválido"
- Verifica la variable `JWT_SECRET`
- Asegúrate de que el token no haya expirado

## 📝 Usuarios de Prueba

Las pruebas crean automáticamente usuarios de prueba:

1. **Usuario Backend:**
   - Email: `test.connection@example.com`
   - Password: `TestPassword123!`

2. **Usuario Frontend:**
   - Email: `test.frontend@example.com`
   - Password: `FrontendTest123!`

3. **Usuario Integración:**
   - Email: `integration.test@example.com`
   - Password: `IntegrationTest123!`

## 🔄 Limpieza

Los usuarios de prueba se crean automáticamente y pueden ser eliminados manualmente desde Supabase si es necesario.

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs detallados de las pruebas
2. Verifica la configuración de variables de entorno
3. Asegúrate de que todos los servicios estén ejecutándose
4. Revisa la documentación de Supabase y las rutas de la API
