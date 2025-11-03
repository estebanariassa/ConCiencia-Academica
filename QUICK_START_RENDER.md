# 🚀 Inicio Rápido - Despliegue en Render

## ⚡ Pasos Rápidos

### 1. Prepara tu repositorio
```bash
git add .
git commit -m "Configurar despliegue en Render"
git push origin despliegue
```

### 2. Despliega el Backend

1. Ve a https://dashboard.render.com
2. **New +** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name:** `conciencia-backend`
   - **Root Directory:** `back` ⚠️
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   SUPABASE_URL=tu_url_supabase
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   JWT_SECRET=d97da0835c4b8fda520f3754435102a3370cee74e833e234f23cf081eae2236aea3da1dc573394b3d801e13cf4c59aa027065bcc495e269199e2824b40f6a070
   ```
   ⚠️ Usa el JWT_SECRET generado arriba, o genera uno nuevo con:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. Haz clic en **Create Web Service**
7. **Copia la URL** del backend (ej: `https://conciencia-backend.onrender.com`)

### 3. Despliega el Frontend

1. **New +** → **Static Site**
2. Selecciona el mismo repositorio
3. Configura:
   - **Name:** `conciencia-frontend`
   - **Root Directory:** `front` ⚠️
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. **Environment Variable:**
   ```
   VITE_API_URL=https://conciencia-backend.onrender.com
   ```
   ⚠️ Reemplaza con tu URL real del backend

5. Haz clic en **Create Static Site**
6. **Copia la URL** del frontend

### 4. Actualiza CORS

1. Ve a `conciencia-backend` → **Environment**
2. Agrega:
   ```
   CORS_ORIGIN=https://conciencia-frontend.onrender.com
   ```
   ⚠️ Usa la URL real de tu frontend
3. **Save Changes**

## ✅ Listo!

Tu aplicación estará en:
- Frontend: `https://conciencia-frontend.onrender.com`
- Backend: `https://conciencia-backend.onrender.com`

---

📖 **Guía completa:** Lee `RENDER_DEPLOY.md` para más detalles y solución de problemas.

