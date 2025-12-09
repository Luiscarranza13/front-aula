# 🚀 Desplegar en Vercel

## Opción 1: Desde la Web (Recomendado)

### Paso 1: Ir a Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign Up" o "Login"
3. Conecta con tu cuenta de GitHub

### Paso 2: Importar Proyecto
1. Haz clic en "Add New..." → "Project"
2. Busca el repositorio: `front-aula`
3. Haz clic en "Import"

### Paso 3: Configurar
**Framework Preset:** Next.js (detectado automáticamente)

**Root Directory:** `./` (dejar por defecto)

**Build Command:** `npm run build` (automático)

**Output Directory:** `.next` (automático)

**Install Command:** `npm install` (automático)

### Paso 4: Variables de Entorno
Agregar esta variable:

```
NEXT_PUBLIC_API_URL=https://web-production-1288a.up.railway.app
```

### Paso 5: Deploy
1. Haz clic en "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tu app estará en: `https://tu-proyecto.vercel.app`

---

## Opción 2: Desde la Terminal

### Paso 1: Instalar Vercel CLI
```bash
npm i -g vercel
```

### Paso 2: Login
```bash
vercel login
```

### Paso 3: Deploy
```bash
cd aula-virtual-frontend
vercel
```

### Paso 4: Configurar Variables
Cuando te pregunte, agrega:
- `NEXT_PUBLIC_API_URL`: `https://web-production-1288a.up.railway.app`

### Paso 5: Deploy a Producción
```bash
vercel --prod
```

---

## 🔧 Configuración Automática

El archivo `vercel.json` ya está configurado con:
- ✅ Framework: Next.js
- ✅ Build command
- ✅ Output directory
- ✅ Variable de entorno del backend

---

## 📝 Después del Deploy

### 1. Obtener la URL
Vercel te dará una URL como:
```
https://aula-virtual-frontend.vercel.app
```

### 2. Actualizar CORS en Backend
Agregar la URL de Vercel en `aula1/src/main.ts`:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://aulavirtual-luis.netlify.app',
    'https://aula-virtual-frontend.vercel.app', // ← Agregar esta
    /\.vercel\.app$/,
  ],
  credentials: true,
});
```

### 3. Push al Backend
```bash
cd aula1
git add .
git commit -m "feat: agregar dominio de Vercel a CORS"
git push origin main
```

---

## ✅ Ventajas de Vercel

- ✅ Deploy automático en cada push a GitHub
- ✅ Preview deployments para cada PR
- ✅ SSL gratis automático
- ✅ CDN global ultra rápido
- ✅ Analytics gratis
- ✅ 100% optimizado para Next.js

---

## 🔄 Deploys Automáticos

Cada vez que hagas `git push` a GitHub, Vercel:
1. Detecta el cambio
2. Hace build automáticamente
3. Despliega la nueva versión
4. Te notifica por email

---

## 🌐 Dominio Personalizado (Opcional)

Si tienes un dominio propio:
1. Ve a tu proyecto en Vercel
2. Settings → Domains
3. Agrega tu dominio
4. Configura los DNS según las instrucciones

---

## 📊 Monitoreo

Vercel te da:
- Analytics de tráfico
- Logs en tiempo real
- Métricas de performance
- Errores y warnings

Todo gratis en el plan Hobby.

---

## 🆘 Solución de Problemas

### Error: "Module not found"
```bash
# Limpiar caché y reinstalar
rm -rf .next node_modules
npm install
vercel --prod
```

### Error: "Build failed"
```bash
# Verificar que compile localmente
npm run build
```

### Error: "API not connecting"
- Verificar que `NEXT_PUBLIC_API_URL` esté configurada
- Verificar que Railway esté corriendo
- Verificar CORS en el backend

---

## 📞 Soporte

- Documentación: https://vercel.com/docs
- Discord: https://vercel.com/discord
- GitHub: https://github.com/vercel/vercel

