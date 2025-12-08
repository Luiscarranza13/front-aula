# Aula Virtual - Frontend

Sistema de gestión educativa tipo Blackboard construido con Next.js 14.

## Instalación

```bash
cd aula-virtual-frontend
npm install
```

## Configuración

El frontend está configurado para conectarse al backend NestJS en `http://localhost:3000`.

Si necesitas cambiar la URL del backend, edita el archivo `lib/api.js`:

```javascript
const API_BASE_URL = 'http://localhost:3000';
```

## Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3001` (o el puerto que Next.js asigne).

## Estructura del Proyecto

```
aula-virtual-frontend/
├── app/
│   ├── layout.js                 # Layout principal
│   ├── page.js                   # Página de inicio (redirige)
│   ├── globals.css               # Estilos globales
│   ├── login/
│   │   └── page.js              # Página de login
│   ├── dashboard/
│   │   ├── layout.js            # Layout con navbar y sidebar
│   │   └── page.js              # Dashboard principal
│   ├── courses/
│   │   ├── page.js              # Lista de cursos
│   │   └── [id]/
│   │       └── page.js          # Detalle de curso (tabs)
│   ├── forum/
│   │   └── [id]/
│   │       └── page.js          # Detalle de foro
│   └── admin/
│       ├── users/
│       │   └── page.js          # Gestión de usuarios
│       └── courses/
│           └── page.js          # Gestión de cursos
├── components/
│   ├── Navbar.js                # Barra de navegación
│   ├── Sidebar.js               # Menú lateral
│   ├── Loading.js               # Componente de carga
│   ├── CardCurso.js             # Tarjeta de curso
│   └── TabNavigation.js         # Navegación por pestañas
├── context/
│   └── AuthContext.js           # Context de autenticación
└── lib/
    └── api.js                   # Funciones para API REST
```

## Funcionalidades

### Autenticación
- Login con email y contraseña
- Gestión de sesión con localStorage
- Protección de rutas según rol

### Roles
- **Admin**: Acceso completo (usuarios, cursos)
- **Docente**: Gestión de cursos
- **Estudiante**: Vista de cursos y participación

### Páginas Principales

1. **Login** (`/login`)
   - Formulario de inicio de sesión
   - Redirige según rol del usuario

2. **Dashboard** (`/dashboard`)
   - Resumen de cursos activos
   - Estadísticas de tareas
   - Acceso rápido a cursos

3. **Cursos** (`/courses`)
   - Lista completa de cursos
   - Tarjetas con información básica

4. **Detalle de Curso** (`/courses/[id]`)
   - Información del curso
   - Pestañas: Recursos, Tareas, Foro
   - Recursos descargables
   - Lista de tareas con estado
   - Acceso a foros del curso

5. **Foro** (`/forum/[id]`)
   - Mensajes del foro
   - Formulario para nuevos mensajes
   - Información del usuario y fecha

6. **Gestión de Usuarios** (`/admin/users`)
   - Solo para admin
   - CRUD completo de usuarios
   - Tabla con listado
   - Modal para crear/editar

7. **Gestión de Cursos** (`/admin/courses`)
   - Para admin y docente
   - CRUD completo de cursos
   - Asignación de docentes
   - Vista en tarjetas

## Características de Diseño

- **Responsive**: Adaptado a móviles, tablets y desktop
- **Modo Oscuro**: Toggle en navbar
- **TailwindCSS**: Estilos modernos y consistentes
- **Loading States**: Indicadores de carga
- **Error Handling**: Mensajes de error claros

## Conexión con Backend

Asegúrate de que el backend NestJS esté corriendo en `http://localhost:3000` antes de usar el frontend.

El backend debe exponer los siguientes endpoints:

- `POST /auth/login`
- `GET /users`
- `POST /users`
- `PUT /users/:id`
- `DELETE /users/:id`
- `GET /courses`
- `GET /courses/:id`
- `POST /courses`
- `PUT /courses/:id`
- `DELETE /courses/:id`
- `GET /tasks?courseId=:id`
- `GET /resources?courseId=:id`
- `GET /forums?courseId=:id`
- `GET /forums/:id`
- `GET /forum-messages?forumId=:id`
- `POST /forum-messages`

## Notas

- El proyecto usa JavaScript (NO TypeScript)
- App Router de Next.js 14
- Context API para gestión de estado
- Fetch API para peticiones HTTP
