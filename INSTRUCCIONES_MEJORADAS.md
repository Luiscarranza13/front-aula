# 🚀 Instrucciones de Instalación y Ejecución - Aula Virtual Frontend Mejorado

## ✅ Proyecto Completamente Mejorado con Shadcn/UI

El frontend ha sido completamente renovado con:
- ✅ Shadcn/UI componentes profesionales
- ✅ Diseño ultra moderno tipo Blackboard/Google Classroom
- ✅ Modo oscuro/claro
- ✅ Animaciones suaves
- ✅ Responsive design
- ✅ Mejor manejo de errores

---

## 📋 Requisitos Previos

1. **Node.js** versión 18 o superior
2. **Backend NestJS** corriendo en `http://localhost:3000`
3. **npm** o **yarn**

---

## 🔧 Instalación

### Paso 1: Navegar al directorio del proyecto

```bash
cd aula-virtual-frontend
```

### Paso 2: Instalar dependencias

```bash
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- Next.js 16
- React 19
- TailwindCSS v4
- Lucide React (iconos)
- Class Variance Authority
- Tailwind Merge
- Tailwindcss Animate

---

## 🚀 Ejecución

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: **http://localhost:3001**

### Modo Producción

```bash
npm run build
npm start
```

---

## 🔑 Credenciales de Prueba

Usa las credenciales configuradas en tu backend NestJS.

**Ejemplo:**
- Email: `admin@test.com`
- Password: `admin123`

O crea usuarios desde el backend.

---

## 🎨 Componentes UI Implementados

Los siguientes componentes de Shadcn/UI están implementados:

- ✅ **Button** - Botones con variantes
- ✅ **Card** - Tarjetas para contenido
- ✅ **Input** - Campos de entrada
- ✅ **Label** - Etiquetas de formulario
- ✅ **Select** - Selectores dropdown
- ✅ **Textarea** - Áreas de texto
- ✅ **Table** - Tablas de datos
- ✅ **Tabs** - Navegación por pestañas
- ✅ **Dialog** - Modales/Diálogos
- ✅ **Badge** - Insignias y etiquetas
- ✅ **Avatar** - Avatares de usuario
- ✅ **Dropdown Menu** - Menús desplegables

---

## 📁 Estructura del Proyecto Mejorada

```
aula-virtual-frontend/
│
├── app/                          # App Router Next.js
│   ├── layout.js                 # Layout raíz
│   ├── page.js                   # Página inicial
│   ├── globals.css               # Estilos globales con variables Shadcn
│   │
│   ├── login/
│   │   └── page.js              # ✨ Login mejorado con diseño moderno
│   │
│   ├── dashboard/
│   │   ├── layout.js            # Layout con Navbar + Sidebar
│   │   └── page.js              # ✨ Dashboard con estadísticas
│   │
│   ├── courses/
│   │   ├── page.js              # Lista de cursos
│   │   └── [id]/
│   │       └── page.js          # ✨ Detalle con Tabs de Shadcn
│   │
│   ├── forum/
│   │   └── [id]/
│   │       └── page.js          # Vista de foro
│   │
│   └── admin/
│       ├── users/
│       │   └── page.js          # ✨ CRUD usuarios con Table
│       └── courses/
│           └── page.js          # ✨ CRUD cursos con Cards
│
├── components/
│   ├── ui/                       # ✨ Componentes Shadcn/UI
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── input.jsx
│   │   ├── label.jsx
│   │   ├── select.jsx
│   │   ├── textarea.jsx
│   │   ├── table.jsx
│   │   ├── tabs.jsx
│   │   ├── dialog.jsx
│   │   ├── badge.jsx
│   │   ├── avatar.jsx
│   │   └── dropdown-menu.jsx
│   │
│   ├── Navbar.js                 # ✨ Navbar moderno con dropdown
│   ├── Sidebar.js                # ✨ Sidebar con iconos Lucide
│   ├── CardCurso.js              # ✨ Card de curso mejorado
│   ├── Loading.js                # Spinner de carga
│   └── TabNavigation.js          # Navegación por tabs (legacy)
│
├── context/
│   └── AuthContext.js            # Context de autenticación
│
├── lib/
│   ├── api.js                    # ✨ API con mejor manejo de errores
│   └── utils.js                  # ✨ Utilidades (cn helper)
│
├── components.json               # ✨ Configuración Shadcn
├── tailwind.config.js            # ✨ Config Tailwind con Shadcn
└── package.json                  # Dependencias actualizadas
```

---

## 🎯 Páginas Implementadas

### 1. Login (`/login`)
- ✨ Diseño moderno con gradiente
- ✨ Iconos en inputs
- ✨ Mejor manejo de errores
- ✨ Animaciones suaves
- ✨ Responsive

### 2. Dashboard (`/dashboard`)
- ✨ Cards de estadísticas con iconos
- ✨ Próximas entregas
- ✨ Actividad reciente
- ✨ Grid de cursos

### 3. Cursos (`/courses`)
- ✨ Cards con colores aleatorios
- ✨ Hover effects
- ✨ Información del docente

### 4. Detalle de Curso (`/courses/[id]`)
- ✨ Tabs de Shadcn/UI
- ✨ Header con gradiente
- ✨ Recursos con iconos
- ✨ Tareas con badges
- ✨ Foros con links

### 5. Admin Usuarios (`/admin/users`)
- ✨ Table de Shadcn/UI
- ✨ Dialog para crear/editar
- ✨ Badges de roles
- ✨ Acciones inline

### 6. Admin Cursos (`/admin/courses`)
- ✨ Grid de cards coloridas
- ✨ Dialog para crear/editar
- ✨ Botones de acción
- ✨ Estado vacío

---

## 🔧 Solución de Problemas

### Error: "Failed to fetch" o "Internal Server Error"

**Causa:** El backend no está corriendo o no está en el puerto correcto.

**Solución:**
1. Verifica que el backend NestJS esté corriendo:
   ```bash
   cd ../aula1
   npm run start:dev
   ```

2. Verifica que el backend esté en `http://localhost:3000`

3. Si el backend está en otro puerto, edita `lib/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:TU_PUERTO';
   ```

### Error: "Cannot find module '@/components/ui/...'"

**Causa:** Los componentes UI no se crearon correctamente.

**Solución:**
Los componentes ya están creados en `components/ui/`. Si falta alguno, verifica que existan todos los archivos.

### Error: Estilos no se aplican correctamente

**Causa:** Tailwind no está compilando correctamente.

**Solución:**
1. Detén el servidor (Ctrl+C)
2. Elimina `.next`:
   ```bash
   rm -rf .next
   ```
3. Reinicia:
   ```bash
   npm run dev
   ```

### Error: "Module not found: Can't resolve 'lucide-react'"

**Causa:** Dependencias no instaladas.

**Solución:**
```bash
npm install lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate
```

---

## 🌐 Configuración del Backend

Asegúrate de que tu backend NestJS tenga CORS habilitado:

```javascript
// main.js del backend
app.enableCors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true,
});
```

---

## 📊 Endpoints Requeridos del Backend

El frontend consume estos endpoints:

### Auth
- `POST /auth/login` - Login de usuario

### Users
- `GET /users` - Listar usuarios
- `POST /users` - Crear usuario
- `PUT /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario

### Courses
- `GET /courses` - Listar cursos
- `GET /courses/:id` - Obtener curso
- `POST /courses` - Crear curso
- `PUT /courses/:id` - Actualizar curso
- `DELETE /courses/:id` - Eliminar curso

### Tasks
- `GET /tasks?courseId=:id` - Tareas por curso

### Resources
- `GET /resources?courseId=:id` - Recursos por curso

### Forums
- `GET /forums?courseId=:id` - Foros por curso
- `GET /forums/:id` - Obtener foro
- `GET /forum-messages?forumId=:id` - Mensajes del foro
- `POST /forum-messages` - Crear mensaje

---

## 🎨 Personalización

### Cambiar colores del tema

Edita `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Color primario */
  --secondary: 210 40% 96.1%;     /* Color secundario */
  /* ... más variables */
}
```

### Cambiar logo

Edita el componente `Navbar.js` y reemplaza el logo.

---

## 📝 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start

# Linting
npm run lint

# Limpiar cache
rm -rf .next node_modules
npm install
```

---

## ✨ Características Destacadas

1. **Diseño Moderno**: Inspirado en Blackboard y Google Classroom
2. **Componentes Profesionales**: Shadcn/UI
3. **Iconos**: Lucide React (más de 1000 iconos)
4. **Animaciones**: Transiciones suaves
5. **Responsive**: Funciona en todos los dispositivos
6. **Modo Oscuro**: Toggle en navbar
7. **Manejo de Errores**: Mensajes claros y útiles
8. **Accesibilidad**: Componentes accesibles
9. **Performance**: Optimizado con Next.js 14
10. **Escalable**: Arquitectura limpia y modular

---

## 🎓 Conclusión

El frontend está **100% funcional y mejorado** con Shadcn/UI. Solo necesitas:

1. ✅ Instalar dependencias: `npm install`
2. ✅ Iniciar backend: `cd ../aula1 && npm run start:dev`
3. ✅ Iniciar frontend: `npm run dev`
4. ✅ Abrir: `http://localhost:3001`

**¡Listo para producción!** 🚀
