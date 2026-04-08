-- =============================================
-- MIGRACIÓN SEGURA - ignora columnas ya renombradas
-- =============================================

DO $$
BEGIN

  -- TABLAS (solo si aún tienen nombre en inglés)
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    ALTER TABLE profiles RENAME TO perfiles;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
    ALTER TABLE courses RENAME TO cursos;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'enrollments') THEN
    ALTER TABLE enrollments RENAME TO inscripciones;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tasks') THEN
    ALTER TABLE tasks RENAME TO tareas;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'resources') THEN
    ALTER TABLE resources RENAME TO recursos;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forums') THEN
    ALTER TABLE forums RENAME TO foros;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'forum_messages') THEN
    ALTER TABLE forum_messages RENAME TO mensajes_foro;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exams') THEN
    ALTER TABLE exams RENAME TO examenes;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exam_questions') THEN
    ALTER TABLE exam_questions RENAME TO preguntas_examen;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'exam_attempts') THEN
    ALTER TABLE exam_attempts RENAME TO intentos_examen;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'submissions') THEN
    ALTER TABLE submissions RENAME TO entregas;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
    ALTER TABLE chat_messages RENAME TO mensajes_chat;
  END IF;
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
    ALTER TABLE notifications RENAME TO notificaciones;
  END IF;

  -- COLUMNAS perfiles
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='perfiles' AND column_name='avatar_url') THEN
    ALTER TABLE perfiles RENAME COLUMN avatar_url TO foto_url;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='perfiles' AND column_name='created_at') THEN
    ALTER TABLE perfiles RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS cursos
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='cursos' AND column_name='docente_id') THEN
    ALTER TABLE cursos RENAME COLUMN docente_id TO id_docente;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='cursos' AND column_name='created_at') THEN
    ALTER TABLE cursos RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS inscripciones
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='inscripciones' AND column_name='course_id') THEN
    ALTER TABLE inscripciones RENAME COLUMN course_id TO id_curso;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='inscripciones' AND column_name='student_id') THEN
    ALTER TABLE inscripciones RENAME COLUMN student_id TO id_estudiante;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='inscripciones' AND column_name='created_at') THEN
    ALTER TABLE inscripciones RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS tareas
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='tareas' AND column_name='course_id') THEN
    ALTER TABLE tareas RENAME COLUMN course_id TO id_curso;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='tareas' AND column_name='created_at') THEN
    ALTER TABLE tareas RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS recursos
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='recursos' AND column_name='course_id') THEN
    ALTER TABLE recursos RENAME COLUMN course_id TO id_curso;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='recursos' AND column_name='created_at') THEN
    ALTER TABLE recursos RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS foros
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='foros' AND column_name='course_id') THEN
    ALTER TABLE foros RENAME COLUMN course_id TO id_curso;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='foros' AND column_name='created_at') THEN
    ALTER TABLE foros RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS mensajes_foro
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_foro' AND column_name='forum_id') THEN
    ALTER TABLE mensajes_foro RENAME COLUMN forum_id TO id_foro;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_foro' AND column_name='user_id') THEN
    ALTER TABLE mensajes_foro RENAME COLUMN user_id TO id_usuario;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_foro' AND column_name='created_at') THEN
    ALTER TABLE mensajes_foro RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS examenes
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='examenes' AND column_name='course_id') THEN
    ALTER TABLE examenes RENAME COLUMN course_id TO id_curso;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='examenes' AND column_name='created_at') THEN
    ALTER TABLE examenes RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS preguntas_examen
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='preguntas_examen' AND column_name='exam_id') THEN
    ALTER TABLE preguntas_examen RENAME COLUMN exam_id TO id_examen;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='preguntas_examen' AND column_name='opciones') THEN
    ALTER TABLE preguntas_examen RENAME COLUMN opciones TO opciones_respuesta;
  END IF;

  -- COLUMNAS intentos_examen
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='intentos_examen' AND column_name='exam_id') THEN
    ALTER TABLE intentos_examen RENAME COLUMN exam_id TO id_examen;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='intentos_examen' AND column_name='student_id') THEN
    ALTER TABLE intentos_examen RENAME COLUMN student_id TO id_estudiante;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='intentos_examen' AND column_name='answers') THEN
    ALTER TABLE intentos_examen RENAME COLUMN answers TO respuestas;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='intentos_examen' AND column_name='started_at') THEN
    ALTER TABLE intentos_examen RENAME COLUMN started_at TO iniciado_en;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='intentos_examen' AND column_name='submitted_at') THEN
    ALTER TABLE intentos_examen RENAME COLUMN submitted_at TO enviado_en;
  END IF;

  -- COLUMNAS entregas
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='entregas' AND column_name='task_id') THEN
    ALTER TABLE entregas RENAME COLUMN task_id TO id_tarea;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='entregas' AND column_name='student_id') THEN
    ALTER TABLE entregas RENAME COLUMN student_id TO id_estudiante;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='entregas' AND column_name='archivo_url') THEN
    ALTER TABLE entregas RENAME COLUMN archivo_url TO url_archivo;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='entregas' AND column_name='created_at') THEN
    ALTER TABLE entregas RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS mensajes_chat
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_chat' AND column_name='sender_id') THEN
    ALTER TABLE mensajes_chat RENAME COLUMN sender_id TO id_emisor;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_chat' AND column_name='receiver_id') THEN
    ALTER TABLE mensajes_chat RENAME COLUMN receiver_id TO id_receptor;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_chat' AND column_name='conversation_id') THEN
    ALTER TABLE mensajes_chat RENAME COLUMN conversation_id TO id_conversacion;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='mensajes_chat' AND column_name='created_at') THEN
    ALTER TABLE mensajes_chat RENAME COLUMN created_at TO creado_en;
  END IF;

  -- COLUMNAS notificaciones
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='notificaciones' AND column_name='user_id') THEN
    ALTER TABLE notificaciones RENAME COLUMN user_id TO id_usuario;
  END IF;
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name='notificaciones' AND column_name='created_at') THEN
    ALTER TABLE notificaciones RENAME COLUMN created_at TO creado_en;
  END IF;

END $$;

-- Actualizar trigger para usar tabla perfiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO perfiles (id, email, nombre, rol)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'nombre', new.email),
    COALESCE(new.raw_user_meta_data->>'rol', 'estudiante')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
