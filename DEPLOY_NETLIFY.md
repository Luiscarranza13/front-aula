# Guía de Despliegue en Netlify

## Requisitos Previos

1. Cuenta en [Netlify](https://netlify.com)
2. Backend desplegado en un servicio como Railway, Render, Heroku, etc.
3. Repositorio en GitHub, GitLab o Bitbucket

## Pasos para Desplegar

### 1. Preparar el Backend

Antes de desplegar el frontend, necesitas tener tu backend corriendo en producción.
Opciones recomendadas:
- **Railway** (recomendado): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com

### 2. Configurar Variables de Entorno

En Netlify, ve a **Site settings > Environment variables** y agrega:

```
NEXT_PUBLIC_API_URL=https://tu-backend-url.com
```

### 3. Desplegar en Netlify

#### Opción A: Desde la interfaz web

1. Ve a [Netlify](https://app.netlify.com)
2. Click en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Configura:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Node version**: 18
5. Click en "Deploy site"

#### Opción B: Usando Netlify CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login en Netlify
netlify login

# Inicializar el proyecto
netlify init

# Desplegar
netlify deploy --prod
```

### 4. Instalar Plugin de Next.js

Netlify necesita el plugin de Next.js para funcionar correctamente:

```bash
npm install @netlify/plugin-nextjs
```

O agrégalo en la interfaz de Netlify en **Site settings > Build & deploy > Plugins**.

## Configuración CORS en el Backend

Asegúrate de que tu backend permita peticiones desde tu dominio de Netlify.

En tu backend NestJS (`main.ts`):

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://tu-sitio.netlify.app',
    'https://tu-dominio-personalizado.com'
  ],
  credentials: true,
});
```

## Variables de Entorno Necesarias

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | URL del backend | https://api.tudominio.com |

## Solución de Problemas

### Error: "Failed to fetch"
- Verifica que la URL del backend sea correcta
- Verifica que CORS esté configurado en el backend

### Error: "Build failed"
- Verifica que Node.js sea versión 18+
- Ejecuta `npm run build` localmente para ver errores

### Páginas 404
- Asegúrate de que el plugin @netlify/plugin-nextjs esté instalado

## Dominio Personalizado

1. Ve a **Site settings > Domain management**
2. Click en "Add custom domain"
3. Sigue las instrucciones para configurar DNS

## Contacto

Si tienes problemas, revisa:
- [Documentación de Netlify](https://docs.netlify.com)
- [Documentación de Next.js en Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
