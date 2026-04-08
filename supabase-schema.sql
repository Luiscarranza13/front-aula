-- =============================================
-- SCHEMA para Aula Virtual en Supabase
-- Ejecutar en el SQL Editor de Supabase
-- =============================================

-- Tabla de perfiles (extiende auth.users)
create table profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text,
  email text,
  rol text default 'estudiante' check (rol in ('admin', 'profesor', 'docente', 'estudiante')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Trigger para crear perfil automáticamente al registrar usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, nombre, rol)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', new.email),
    coalesce(new.raw_user_meta_data->>'rol', 'estudiante')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Cursos
create table courses (
  id bigserial primary key,
  titulo text not null,
  descripcion text,
  grado text,
  seccion text,
  docente_id uuid references profiles(id),
  activo boolean default true,
  created_at timestamptz default now()
);

-- Inscripciones
create table enrollments (
  id bigserial primary key,
  course_id bigint references courses(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  unique(course_id, student_id)
);

-- Tareas
create table tasks (
  id bigserial primary key,
  titulo text not null,
  descripcion text,
  course_id bigint references courses(id) on delete cascade,
  fecha_vencimiento timestamptz,
  estado text default 'pendiente',
  created_at timestamptz default now()
);

-- Recursos
create table resources (
  id bigserial primary key,
  titulo text not null,
  descripcion text,
  url text,
  tipo text,
  course_id bigint references courses(id) on delete cascade,
  created_at timestamptz default now()
);

-- Foros
create table forums (
  id bigserial primary key,
  titulo text not null,
  descripcion text,
  course_id bigint references courses(id) on delete cascade,
  created_at timestamptz default now()
);

-- Mensajes de foro
create table forum_messages (
  id bigserial primary key,
  forum_id bigint references forums(id) on delete cascade,
  user_id uuid references profiles(id),
  contenido text not null,
  created_at timestamptz default now()
);

-- Exámenes
create table exams (
  id bigserial primary key,
  titulo text not null,
  descripcion text,
  course_id bigint references courses(id) on delete cascade,
  duracion integer default 60,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  activo boolean default true,
  created_at timestamptz default now()
);

-- Preguntas de examen
create table exam_questions (
  id bigserial primary key,
  exam_id bigint references exams(id) on delete cascade,
  pregunta text not null,
  opciones jsonb,
  respuesta_correcta text,
  puntos integer default 1,
  orden integer default 0
);

-- Intentos de examen
create table exam_attempts (
  id bigserial primary key,
  exam_id bigint references exams(id) on delete cascade,
  student_id uuid references profiles(id),
  answers jsonb,
  puntaje numeric,
  started_at timestamptz default now(),
  submitted_at timestamptz
);

-- Submissions (entregas de tareas)
create table submissions (
  id bigserial primary key,
  task_id bigint references tasks(id) on delete cascade,
  student_id uuid references profiles(id),
  contenido text,
  archivo_url text,
  calificacion numeric,
  comentario text,
  created_at timestamptz default now()
);

-- Chat
create table chat_messages (
  id bigserial primary key,
  sender_id uuid references profiles(id),
  receiver_id uuid references profiles(id),
  conversation_id text,
  contenido text not null,
  tipo text default 'global' check (tipo in ('global', 'privado')),
  leido boolean default false,
  created_at timestamptz default now()
);

-- Notificaciones
create table notifications (
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  titulo text,
  mensaje text,
  tipo text,
  leido boolean default false,
  created_at timestamptz default now()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table tasks enable row level security;
alter table resources enable row level security;
alter table forums enable row level security;
alter table forum_messages enable row level security;
alter table exams enable row level security;
alter table exam_questions enable row level security;
alter table exam_attempts enable row level security;
alter table submissions enable row level security;
alter table chat_messages enable row level security;
alter table notifications enable row level security;

-- Políticas básicas (ajustar según necesidades)
create policy "Usuarios ven su propio perfil" on profiles for select using (auth.uid() = id);
create policy "Usuarios actualizan su perfil" on profiles for update using (auth.uid() = id);
create policy "Admins ven todos los perfiles" on profiles for select using (
  exists (select 1 from profiles where id = auth.uid() and rol = 'admin')
);

create policy "Todos ven cursos activos" on courses for select using (activo = true);
create policy "Docentes crean cursos" on courses for insert with check (
  exists (select 1 from profiles where id = auth.uid() and rol in ('admin', 'profesor', 'docente'))
);

create policy "Usuarios ven sus notificaciones" on notifications for select using (user_id = auth.uid());
create policy "Usuarios actualizan sus notificaciones" on notifications for update using (user_id = auth.uid());

create policy "Todos ven mensajes globales" on chat_messages for select using (tipo = 'global');
create policy "Usuarios envían mensajes" on chat_messages for insert with check (sender_id = auth.uid());

create policy "Todos ven exámenes activos" on exams for select using (activo = true);
create policy "Todos ven preguntas de examen" on exam_questions for select using (true);

create policy "Estudiantes ven sus intentos" on exam_attempts for select using (student_id = auth.uid());
create policy "Estudiantes crean intentos" on exam_attempts for insert with check (student_id = auth.uid());
create policy "Estudiantes actualizan sus intentos" on exam_attempts for update using (student_id = auth.uid());

create policy "Todos ven tareas" on tasks for select using (true);
create policy "Todos ven recursos" on resources for select using (true);
create policy "Todos ven foros" on forums for select using (true);
create policy "Todos ven mensajes de foro" on forum_messages for select using (true);
create policy "Usuarios crean mensajes de foro" on forum_messages for insert with check (user_id = auth.uid());

create policy "Estudiantes ven sus submissions" on submissions for select using (student_id = auth.uid());
create policy "Estudiantes crean submissions" on submissions for insert with check (student_id = auth.uid());

-- Storage bucket para uploads
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true);
create policy "Uploads públicos" on storage.objects for select using (bucket_id = 'uploads');
create policy "Usuarios autenticados suben archivos" on storage.objects for insert with check (
  bucket_id = 'uploads' and auth.role() = 'authenticated'
);
