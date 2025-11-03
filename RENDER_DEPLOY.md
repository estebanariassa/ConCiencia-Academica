# 🚀 Guía de Despliegue en Render - Paso a Paso

Esta guía te ayudará a desplegar tu aplicación ConCiencia Académica en Render.

## 📋 Prerrequisitos

1. ✅ Tener una cuenta en GitHub con tu repositorio
2. ✅ Tener una cuenta en Render (https://render.com)
3. ✅ Tener las credenciales de Supabase listas

---

## 🎯 Paso 1: Preparar el Repositorio

Asegúrate de tener todo commiteado y pusheado a GitHub:

```bash
git add .
git commit -m "Preparar para despliegue en Render"
git push origin despliegue
```

---

## 🔧 Paso 2: Desplegar el Backend

### 2.1 Crear el Servicio Web del Backend

1. Ve a https://dashboard.render.com
2. Haz clic en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub si aún no lo has hecho
4. Selecciona el repositorio `ConCiencia-Academica`
5. Selecciona la rama `despliegue`

### 2.2 Configurar el Backend

Configura estos valores:

**Información Básica:**
- **Name:** `conciencia-backend`
- **Region:** Elige la región más cercana (ej: `Oregon (US West)`)
- **Branch:** `despliegue`
- **Root Directory:** `back` (⚠️ **IMPORTANTE**)

**Build & Deploy:**
- **Environment:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`

**Plan:**
- Selecciona **"Free"**

### 2.3 Configurar Variables de Entorno del Backend

En la sección **"Environment Variables"**, agrega:

```
NODE_ENV=production
PORT=10000
SUPABASE_URL=tu_url_de_supabase_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
JWT_SECRET=genera_un_secreto_aleatorio_largo_y_seguro
GOOGLE_GEMINI_API_KEY=tu_api_key_si_la_tienes
```

**⚠️ IMPORTANTE:**
- **JWT_SECRET:** Genera uno seguro ejecutando:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- **CORS_ORIGIN:** Lo actualizaremos después de desplegar el frontend

### 2.4 Desplegar el Backend

1. Haz clic en **"Create Web Service"**
2. Espera a que termine el build (puede tardar 5-10 minutos)
3. Copia la URL que Render te da, algo como: `https://conciencia-backend.onrender.com`
4. **Guarda esta URL** - la necesitarás para el frontend

---

## 🎨 Paso 3: Desplegar el Frontend

### 3.1 Crear el Static Site del Frontend

1. En el Dashboard de Render, haz clic en **"New +"** → **"Static Site"**
2. Selecciona el mismo repositorio
3. Selecciona la rama `despliegue`

### 3.2 Configurar el Frontend

**Información Básica:**
- **Name:** `conciencia-frontend`
- **Branch:** `despliegue`
- **Root Directory:** `front` (⚠️ **IMPORTANTE**)

**Build Settings:**
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`

⚠️ **NOTA:** El comando de build ahora es solo `vite build` (ya no incluye `tsc`) porque Vite maneja TypeScript internamente.

**Environment Variables:**
Agrega esta variable:
```
VITE_API_URL=https://conciencia-backend.onrender.com
```
⚠️ **Cambia la URL** por la URL real que obtuviste del backend en el paso 2.4

### 3.3 Desplegar el Frontend

1. Haz clic en **"Create Static Site"**
2. Espera a que termine el build (puede tardar 5-10 minutos)
3. Copia la URL que Render te da, algo como: `https://conciencia-frontend.onrender.com`
4. **Guarda esta URL**

---

## 🔄 Paso 4: Actualizar CORS en el Backend

1. Ve al dashboard de Render
2. Selecciona tu servicio `conciencia-backend`
3. Ve a la sección **"Environment"**
4. Agrega o actualiza la variable:
   ```
   CORS_ORIGIN=https://conciencia-frontend.onrender.com
   ```
   ⚠️ **Usa la URL exacta** que obtuviste del frontend (sin barra final)
5. Haz clic en **"Save Changes"**
6. El servicio se reiniciará automáticamente

---

## ✅ Paso 5: Verificar el Despliegue

### Verificar Backend:
1. Ve a `https://tu-backend-url.onrender.com/health`
2. Deberías ver: `{"ok":true}`

### Verificar Frontend:
1. Ve a tu URL del frontend
2. Deberías ver la aplicación funcionando

---

## 🔍 Solución de Problemas Comunes

### Error: "Build failed"
- **Causa:** Puede ser un error en el código o dependencias
- **Solución:** 
  - Revisa los logs en Render
  - Verifica que `npm install` y `npm run build` funcionen localmente
  - Asegúrate de que el `Root Directory` esté correcto

### Error: "Cannot find module"
- **Causa:** Root Directory incorrecto o dependencias no instaladas
- **Solución:**
  - Verifica que `Root Directory` sea `back` para backend y `front` para frontend
  - Asegúrate de que `package.json` esté en esos directorios

### Error de CORS en el navegador
- **Causa:** CORS_ORIGIN no coincide con la URL del frontend
- **Solución:**
  - Verifica que `CORS_ORIGIN` tenga exactamente la URL del frontend (con https://)
  - No debe tener barra final (/)
  - Reinicia el backend después de cambiar la variable

### El frontend no puede conectar al backend
- **Causa:** VITE_API_URL incorrecta o backend no está funcionando
- **Solución:**
  - Verifica que `VITE_API_URL` tenga la URL correcta del backend
  - Verifica que el backend esté en "Live" en Render
  - Prueba la URL del backend directamente en el navegador: `/health`

### "Application error" o página en blanco
- **Causa:** Puede ser un error en el build o variables de entorno faltantes
- **Solución:**
  - Revisa los logs de build en Render
  - Verifica que todas las variables de entorno estén configuradas
  - Prueba el build localmente primero

---

## 📝 Checklist Final

Antes de considerar el despliegue completo, verifica:

- [ ] Backend desplegado y accesible (endpoint `/health` funciona)
- [ ] Frontend desplegado y accesible
- [ ] `VITE_API_URL` configurada en el frontend con la URL del backend
- [ ] `CORS_ORIGIN` configurado en el backend con la URL del frontend
- [ ] `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` configuradas correctamente
- [ ] `JWT_SECRET` configurado (y es un valor seguro)
- [ ] Puedes hacer login en la aplicación
- [ ] Las peticiones API funcionan correctamente

---

## 🔐 Notas de Seguridad

1. **NUNCA** commitees archivos `.env` con credenciales reales
2. **SIEMPRE** usa variables de entorno en Render
3. **JWT_SECRET** debe ser un string largo y aleatorio
4. **SUPABASE_SERVICE_ROLE_KEY** es sensible - mantenla segura

---

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs:** En Render, ve a "Logs" en cada servicio
2. **Prueba localmente:** Asegúrate de que todo funcione en desarrollo
3. **Verifica variables:** Confirma que todas las variables de entorno estén correctas
4. **Revisa la documentación:** https://render.com/docs

---

## 🎉 ¡Listo!

Una vez que todo esté desplegado y funcionando, tendrás tu aplicación en:
- **Frontend:** `https://conciencia-frontend.onrender.com`
- **Backend:** `https://conciencia-backend.onrender.com`

¡Felicitaciones por desplegar tu aplicación! 🚀

