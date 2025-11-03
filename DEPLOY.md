# Guía de Despliegue - ConCiencia Académica

Esta guía te ayudará a desplegar tu aplicación en diferentes plataformas.

## 🚀 Opción 1: Render (Recomendado - Gratis)

Render es una excelente opción gratuita para aplicaciones full-stack.

### Pasos:

1. **Crear cuenta en Render:**
   - Ve a https://render.com
   - Regístrate con GitHub

2. **Desplegar Backend:**
   - Ve a Dashboard → New → Web Service
   - Conecta tu repositorio de GitHub
   - Configuración:
     - **Name:** `conciencia-backend`
     - **Environment:** `Node`
     - **Build Command:** `cd back && npm install && npm run build`
     - **Start Command:** `cd back && npm start`
     - **Plan:** Free
   
   **Variables de Entorno (Environment Variables):**
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   JWT_SECRET=genera_un_secreto_aleatorio_seguro
   GOOGLE_GEMINI_API_KEY=tu_api_key (opcional)
   CORS_ORIGIN=https://conciencia-frontend.onrender.com
   ```
   > ⚠️ **Nota:** Cambia `CORS_ORIGIN` con la URL real de tu frontend después de desplegarlo

3. **Desplegar Frontend:**
   - Ve a Dashboard → New → Static Site
   - Conecta tu repositorio de GitHub
   - Configuración:
     - **Name:** `conciencia-frontend`
     - **Build Command:** `cd front && npm install && npm run build`
     - **Publish Directory:** `front/dist`
   
   **Variable de Entorno:**
   ```
   VITE_API_URL=https://conciencia-backend.onrender.com
   ```
   > ⚠️ **Nota:** Cambia esta URL por la URL real de tu backend

4. **Actualizar CORS en Backend:**
   - Una vez que tengas la URL del frontend, actualiza `CORS_ORIGIN` en las variables de entorno del backend
   - Reinicia el servicio backend

### URLs de ejemplo:
- Backend: `https://conciencia-backend.onrender.com`
- Frontend: `https://conciencia-frontend.onrender.com`

---

## 🚂 Opción 2: Railway (Alternativa - $5/mes pero más rápido)

Railway es más rápido pero requiere un plan de pago ($5/mes) para uso en producción.

### Pasos:

1. **Crear cuenta en Railway:**
   - Ve a https://railway.app
   - Regístrate con GitHub

2. **Desplegar Backend:**
   - New Project → Deploy from GitHub repo
   - Selecciona tu repositorio
   - En la configuración:
     - Root Directory: `back`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   
   **Variables de Entorno:**
   ```
   SUPABASE_URL=tu_url_de_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   JWT_SECRET=genera_un_secreto_aleatorio_seguro
   GOOGLE_GEMINI_API_KEY=tu_api_key (opcional)
   ```

3. **Desplegar Frontend:**
   - New Project → Deploy from GitHub repo
   - Selecciona tu repositorio
   - En la configuración:
     - Root Directory: `front`
     - Build Command: `npm install && npm run build`
     - Start Command: `npx serve -s dist -l 3000`
   
   **Variable de Entorno:**
   ```
   VITE_API_URL=tu_url_de_backend_en_railway
   ```

---

## 🔧 Opción 3: Vercel (Frontend) + Render/Railway (Backend)

Puedes desplegar el frontend en Vercel (gratis) y el backend en Render o Railway.

### Frontend en Vercel:

1. Ve a https://vercel.com
2. Importa tu repositorio
3. Configuración:
   - Framework Preset: Vite
   - Root Directory: `front`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   
   **Variable de Entorno:**
   ```
   VITE_API_URL=tu_url_de_backend
   ```

---

## 📝 Notas Importantes:

### Variables de Entorno Necesarias:

**Backend:**
- `SUPABASE_URL` - URL de tu proyecto Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key de Supabase
- `JWT_SECRET` - Secreto para firmar tokens JWT (usa un string aleatorio largo)
- `GOOGLE_GEMINI_API_KEY` - (Opcional) API key de Google Gemini
- `PORT` - Puerto del servidor (Render usa 10000 por defecto)
- `CORS_ORIGIN` - URL del frontend desplegado

**Frontend:**
- `VITE_API_URL` - URL completa del backend (con https://)

### Generar JWT_SECRET:

Puedes generar un JWT_SECRET seguro ejecutando:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Configurar CORS:

Asegúrate de que `CORS_ORIGIN` en el backend coincida exactamente con la URL de tu frontend.

### Build del Backend:

El backend necesita compilar TypeScript antes de ejecutarse. Asegúrate de que el comando de build incluya `npm run build`.

---

## 🐛 Solución de Problemas:

### Error: "Cannot find module"
- Asegúrate de que el `Root Directory` esté configurado correctamente
- Verifica que `package.json` esté en la raíz del directorio configurado

### Error de CORS:
- Verifica que `CORS_ORIGIN` tenga la URL exacta del frontend (con https://)
- Asegúrate de que no tenga una barra diagonal al final

### Frontend no carga:
- Verifica que `VITE_API_URL` esté configurada correctamente
- Asegúrate de que el build se haya completado exitosamente

### Backend no inicia:
- Verifica que todas las variables de entorno estén configuradas
- Revisa los logs en el dashboard de tu plataforma

---

## ✅ Checklist Pre-Despliegue:

- [ ] Todas las variables de entorno están configuradas
- [ ] El build del backend funciona localmente (`cd back && npm run build`)
- [ ] El build del frontend funciona localmente (`cd front && npm run build`)
- [ ] Las URLs están actualizadas y son accesibles
- [ ] CORS está configurado correctamente
- [ ] JWT_SECRET es un valor seguro y aleatorio

---

## 📞 Soporte:

Si tienes problemas con el despliegue, revisa:
1. Los logs en el dashboard de tu plataforma
2. Que todas las variables de entorno estén configuradas
3. Que las URLs sean correctas y accesibles

