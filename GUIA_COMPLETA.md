# 🎓 Aula Virtual - Frontend Completo

Sistema de gestión educativa tipo Blackboard/Google Classroom construido con Next.js 14.

## 📋 Características Implementadas

✅ Next.js 14 con App Router
✅ JavaScript (NO TypeScript)
✅ TailwindCSS con modo oscuro
✅ Autenticación con roles (admin, docente, estudiante)
✅ Gestión completa de cursos
✅ Sistema de tareas
✅ Recursos descargables
✅ Foros con mensajes
✅ Panel de administración
✅ Diseño responsive y moderno

## 🚀 Inicio Rápido

```bash
cd aula-virtual-frontend
npm install
npm run dev
```

Abre http://localhost:3001 en tu navegador.

## 🔑 Credenciales de Prueba

Usa las credenciales que tengas configuradas en tu backend NestJS.

Ejemplo:
- Email: admin@test.com
- Password: admin123

## 📁 Estructura Completa

```
aula-virtual-frontend/
│
├── app/                          # App Router de Next.js
│   ├── layout.js                 # Layout raíz con AuthProvider
│   ├── page.js                   # Página inicial (redirige)
│   ├── globals.css               # Estilos globales Tailwind
│   │
│   ├── login/
│   │   └── page.js              # 🔐 Login con email/password
│   │
│   ├── dashboard/
│   │   ├── layout.js            # Layout con Navbar + Sidebar
│   │   └── page.js              # 📊 Dashboard con estadísticas
│   │
│   ├── courses/
│   │   ├── page.js              # 📚 Lista de todos los cursos
│   │   └── [id]/
│   │       └── page.js          # 📖 Detalle de curso con tabs
│   │
│   ├── forum/
│   │   └── [id]/
│   │       └── page.js          # 💬 Foro con mensajes
│   │
│   └── admin/
│       ├── users/
│       │   └── page.js          # 👥 CRUD de usuarios (solo admin)
│       └── courses/
│           └── page.js          # ⚙️ CRUD de cursos (admin/docente)
│
├── components/                   # Componentes reutilizables
│   ├── Navbar.js                # Barra superior con usuario y modo oscuro
│   ├── Sidebar.js               # Menú lateral con navegación
│   ├── Loading.js               # Spinner de carga
│   ├── CardCurso.js             # Tarjeta de curso
│   └── TabNavigation.js         # Navegación por pestañas
│
├── context/
│   └── AuthContext.js           # Context de autenticación global
│
├── lib/
│   └── api.js                   # Funciones para consumir API REST
│
└── public/                       # Archivos estáticos
```

## 🎨 Páginas Implementadas

### 1. Login (`/login`)
- Formulario de inicio de sesión
- Validación de credenciales
- Redirige según rol del usuario
- Diseño moderno con gradientes

### 2. Dashboard (`/dashboard`)
- Resumen con tarjetas de estadísticas
- Cursos activos del usuario
- Tareas pendientes y completadas
- Mensajes del foro

### 3. Lista de Cursos (`/courses`)
- Grid responsive de cursos
- Información: título, grado, sección, docente
- Click para ver detalle

### 4. Detalle de Curso (`/courses/[id]`)
- Información completa del curso
- Sistema de pestañas:
  - **Recursos**: Archivos descargables
  - **Tareas**: Lista con estado y fecha de entrega
  - **Foro**: Temas de discusión del curso

### 5. Foro (`/forum/[id]`)
- Lista de mensajes con usuario y fecha
- Formulario para nuevo mensaje
- Actualización automática

### 6. Gestión de Usuarios (`/admin/users`)
- Solo accesible para admin
- Tabla con todos los usuarios
- Modal para crear/editar usuarios
- Eliminar usuarios
- Asignación de roles

### 7. Gestión de Cursos (`/admin/courses`)
- Accesible para admin y docente
- Grid de cursos con acciones
- Modal para crear/editar cursos
- Asignar docente a curso
- Eliminar cursos

## 🔐 Sistema de Autenticación

### AuthContext
- Maneja el estado del usuario autenticado
- Funciones: `login()`, `logout()`
- Helpers: `isAdmin()`, `isDocente()`, `isEstudiante()`
- Persistencia en localStorage

### Protección de Rutas
- Redirige a `/login` si no está autenticado
- Valida permisos según rol
- Layout compartido para rutas protegidas

## 🌐 API Integration

Todas las llamadas al backend están en `lib/api.js`:

### Auth
- `login(email, password)`

### Users
- `getUsers()`
- `createUser(data)`
- `updateUser(id, data)`
- `deleteUser(id)`

### Courses
- `getCourses()`
- `getCourseById(id)`
- `createCourse(data)`
- `updateCourse(id, data)`
- `deleteCourse(id)`

### Tasks
- `getTasksByCourse(courseId)`
- `createTask(data)`

### Resources
- `getResourcesByCourse(courseId)`
- `createResource(data)`

### Forums
- `getForumsByCourse(courseId)`
- `getForumById(id)`
- `createForum(data)`

### Forum Messages
- `getForumMessages(forumId)`
- `createForumMessage(forumId, data)`

## 🎨 Diseño y UX

### TailwindCSS
- Configuración con Tailwind v4
- Modo oscuro con toggle
- Colores consistentes
- Espaciado uniforme

### Componentes
- Cards con hover effects
- Botones con estados disabled
- Inputs con focus states
- Modales centrados
- Tablas responsive

### Estados de Carga
- Spinner global
- Estados disabled en botones
- Mensajes de error claros

### Responsive
- Mobile first
- Breakpoints: sm, md, lg
- Grid adaptativo
- Sidebar colapsable en móvil

## 🔧 Configuración

### Variables de Entorno
Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Cambiar URL del Backend
Edita `lib/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## 📦 Dependencias

```json
{
  "dependencies": {
    "next": "16.0.5",
    "react": "19.2.0",
    "react-dom": "19.2.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "eslint": "^9",
    "eslint-config-next": "16.0.5",
    "tailwindcss": "^4"
  }
}
```

## 🚦 Comandos

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar producción
npm start

# Linting
npm run lint
```

## ✨ Características Destacadas

1. **Modo Oscuro**: Toggle en navbar, persiste en sesión
2. **Roles Dinámicos**: Sidebar y permisos según rol
3. **Tabs Interactivos**: En detalle de curso
4. **Modales**: Para crear/editar usuarios y cursos
5. **Loading States**: En todas las peticiones
6. **Error Handling**: Mensajes claros al usuario
7. **Responsive**: Funciona en todos los dispositivos

## 🔗 Conexión con Backend

Asegúrate de que el backend NestJS esté corriendo en `http://localhost:3000`.

El backend debe tener CORS habilitado:

```javascript
app.enableCors({
  origin: 'http://localhost:3001',
  credentials: true,
});
```

## 📝 Notas Importantes

- **NO usa TypeScript**: Todo en JavaScript puro
- **App Router**: Next.js 14 con carpeta `app/`
- **Context API**: Para estado global (no Redux)
- **Fetch API**: Para peticiones HTTP (no axios)
- **TailwindCSS**: Para todos los estilos
- **Sin librerías extras**: Implementación minimalista

## 🐛 Troubleshooting

### Error de conexión al backend
- Verifica que el backend esté corriendo
- Revisa la URL en `lib/api.js`
- Verifica CORS en el backend

### No aparecen los datos
- Abre DevTools > Network
- Verifica las respuestas de la API
- Revisa la consola por errores

### Problemas con el modo oscuro
- Limpia localStorage
- Recarga la página
- Verifica que Tailwind esté configurado

## 🎯 Próximos Pasos

Para extender el proyecto:

1. Agregar subida de archivos para recursos
2. Implementar notificaciones en tiempo real
3. Agregar calendario de eventos
4. Sistema de calificaciones
5. Chat en tiempo real
6. Videollamadas integradas

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.
