import { supabase } from './supabase';

const STORAGE_BUCKET = 'uploads';

export const API_URL = '';

const isPresent = (value) => value !== null && value !== undefined && value !== '';
const unique = (values) => [...new Set(values.filter(isPresent))];

const stripUndefined = (record) =>
  Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));

const parseMaybeJson = (value) => {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const toNumber = (value) => {
  if (!isPresent(value)) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const toIso = (value) => {
  if (!isPresent(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const mapError = (error, fallback = 'Ha ocurrido un error') => {
  if (!error) return fallback;
  return error.message || fallback;
};

const requireSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapError(error));
  if (!data.session) throw new Error('Debes iniciar sesiÃ³n para continuar');
  return data.session;
};

const getSessionUserId = async (providedId) => {
  if (isPresent(providedId)) return providedId;
  const session = await requireSession();
  return session.user.id;
};

const getPublicUrlFromPath = (pathOrUrl) => {
  if (!isPresent(pathOrUrl)) return '';
  if (String(pathOrUrl).startsWith('http')) return pathOrUrl;
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(pathOrUrl);
  return data.publicUrl;
};

export const getUploadUrl = getPublicUrlFromPath;

const inferQuestionType = (row) => {
  if (row?.tipo) return row.tipo;
  const options = parseMaybeJson(row?.opciones_respuesta ?? row?.opciones);
  if (Array.isArray(options) && options.length > 0) return 'multiple';
  const answer = row?.respuesta_correcta ?? row?.respuestaCorrecta;
  if (answer === 'Verdadero' || answer === 'Falso') return 'true_false';
  return 'short_answer';
};

const normalizeUser = (row) => {
  if (!row) return null;

  const avatar = row.avatar ?? row.foto_url ?? row.avatar_url ?? null;
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: row.id,
    nombre: row.nombre ?? row.full_name ?? row.email ?? 'Usuario',
    apellido: row.apellido ?? '',
    email: row.email ?? '',
    rol: row.rol ?? 'estudiante',
    telefono: row.telefono ?? null,
    avatar,
    foto_url: avatar,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeCourse = (row, userMap) => {
  if (!row) return null;

  const docenteId = row.id_docente ?? row.docente_id ?? row.docenteId ?? null;
  const docente =
    normalizeUser(row.docente) ||
    normalizeUser(row.usuarios) ||
    (userMap?.get(docenteId) ?? null);
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? row.nombre ?? 'Curso sin tÃ­tulo',
    nombre: row.nombre ?? row.titulo ?? 'Curso sin titulo',
    descripcion: row.descripcion ?? '',
    grado: row.grado ?? '',
    seccion: row.seccion ?? '',
    activo: row.activo ?? true,
    id_docente: docenteId,
    docenteId,
    docente,
    usuarios: docente,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeTask = (row, courseMap) => {
  if (!row) return null;

  const courseId = toNumber(row.id_curso ?? row.course_id ?? row.cursoId);
  const course =
    normalizeCourse(row.curso) ||
    normalizeCourse(row.cursos) ||
    (courseMap?.get(courseId) ?? null);
  const dueDate = row.fecha_entrega ?? row.fecha_vencimiento ?? null;
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? 'Tarea sin tÃ­tulo',
    descripcion: row.descripcion ?? '',
    estado: row.estado ?? 'pendiente',
    fecha_entrega: dueDate,
    fecha_vencimiento: dueDate,
    id_curso: courseId,
    courseId: courseId,
    cursoId: courseId,
    curso: course,
    cursos: course,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeResource = (row, courseMap) => {
  if (!row) return null;

  const courseId = toNumber(row.id_curso ?? row.course_id ?? row.cursoId);
  const course =
    normalizeCourse(row.curso) ||
    normalizeCourse(row.cursos) ||
    (courseMap?.get(courseId) ?? null);
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? row.nombre_archivo ?? 'Recurso',
    nombre_archivo: row.nombre_archivo ?? row.titulo ?? 'Recurso',
    descripcion: row.descripcion ?? '',
    tipo: row.tipo ?? row.tipo_recurso ?? 'documento',
    tipo_recurso: row.tipo_recurso ?? row.tipo ?? 'documento',
    url: row.url ?? '',
    id_curso: courseId,
    courseId: courseId,
    cursoId: courseId,
    curso: course,
    cursos: course,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeForum = (row, courseMap) => {
  if (!row) return null;

  const courseId = toNumber(row.id_curso ?? row.course_id ?? row.cursoId);
  const course =
    normalizeCourse(row.curso) ||
    normalizeCourse(row.cursos) ||
    (courseMap?.get(courseId) ?? null);
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? 'Foro',
    descripcion: row.descripcion ?? '',
    id_curso: courseId,
    courseId: courseId,
    cursoId: courseId,
    curso: course,
    cursos: course,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeForumMessage = (row, userMap) => {
  if (!row) return null;

  const userId = row.id_usuario ?? row.user_id ?? row.usuarioId ?? null;
  const user =
    normalizeUser(row.usuario) ||
    normalizeUser(row.usuarios) ||
    (userMap?.get(userId) ?? null);
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    id_usuario: userId,
    usuarioId: userId,
    usuario: user,
    usuarios: user,
    contenido: row.contenido ?? '',
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeExamQuestion = (row) => {
  if (!row) return null;

  const options = parseMaybeJson(row.opciones_respuesta ?? row.opciones);

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    pregunta: row.pregunta ?? '',
    tipo: inferQuestionType(row),
    opciones: Array.isArray(options) ? options : [],
    opciones_respuesta: Array.isArray(options) ? options : [],
    respuestaCorrecta: row.respuestaCorrecta ?? row.respuesta_correcta ?? '',
    respuesta_correcta: row.respuesta_correcta ?? row.respuestaCorrecta ?? '',
    puntos: toNumber(row.puntos) ?? 1,
    orden: toNumber(row.orden) ?? 0,
  };
};

const normalizeExam = (row, courseMap) => {
  if (!row) return null;

  const courseId = toNumber(row.id_curso ?? row.course_id ?? row.cursoId);
  const course =
    normalizeCourse(row.curso) ||
    normalizeCourse(row.cursos) ||
    (courseMap?.get(courseId) ?? null);
  const questions = Array.isArray(row.preguntas)
    ? row.preguntas.map(normalizeExamQuestion)
    : Array.isArray(row.preguntas_examen)
    ? row.preguntas_examen.map(normalizeExamQuestion)
    : [];
  const duration = toNumber(row.tiempoLimite ?? row.tiempo_limite ?? row.duracion) ?? 60;
  const start = row.fechaInicio ?? row.fecha_inicio ?? null;
  const end = row.fechaFin ?? row.fecha_fin ?? null;
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? 'Examen',
    descripcion: row.descripcion ?? '',
    activo: row.activo ?? true,
    id_curso: courseId,
    cursoId: courseId,
    courseId: courseId,
    curso: course,
    cursos: course,
    tiempoLimite: duration,
    tiempo_limite: duration,
    duracion: duration,
    fechaInicio: start,
    fecha_inicio: start,
    fechaFin: end,
    fecha_fin: end,
    preguntas: questions,
    preguntas_examen: questions,
    mostrarResultados: row.mostrarResultados ?? row.mostrar_resultados ?? true,
    intentosPermitidos: toNumber(row.intentosPermitidos ?? row.intentos_permitidos) ?? 1,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeAttempt = (row, examMap) => {
  if (!row) return null;

  const examId = toNumber(row.id_examen ?? row.exam_id ?? row.examId);
  const exam = normalizeExam(row.exam) || normalizeExam(row.examenes) || (examMap?.get(examId) ?? null);
  const submittedAt = row.enviado_en ?? row.submitted_at ?? row.finalizadoEn ?? null;
  const rawScore = toNumber(row.puntaje ?? row.calificacion ?? row.score);
  const percentage = rawScore === null ? null : rawScore > 20 ? rawScore : Math.round(rawScore * 5 * 10) / 10;
  const grade = rawScore === null ? null : rawScore > 20 ? Math.round((rawScore / 5) * 10) / 10 : rawScore;
  const answers = parseMaybeJson(row.respuestas ?? row.answers) ?? [];
  const startedAt = row.iniciado_en ?? row.started_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    id_examen: examId,
    examId,
    exam: exam,
    examen: exam,
    respuestas: Array.isArray(answers) ? answers : [],
    answers: Array.isArray(answers) ? answers : [],
    estado: row.estado ?? (submittedAt ? 'completado' : 'en_progreso'),
    porcentaje: percentage,
    puntaje: percentage,
    calificacion: grade,
    finalizadoEn: submittedAt,
    enviado_en: submittedAt,
    createdAt: startedAt,
    iniciado_en: startedAt,
  };
};

const normalizeSubmission = (row, taskMap, userMap) => {
  if (!row) return null;

  const taskId = toNumber(row.id_tarea ?? row.task_id ?? row.tareaId);
  const studentId = row.id_estudiante ?? row.student_id ?? row.estudianteId ?? null;
  const task = normalizeTask(row.tarea) || normalizeTask(row.tareas) || (taskMap?.get(taskId) ?? null);
  const student =
    normalizeUser(row.estudiante) ||
    normalizeUser(row.usuarios) ||
    (userMap?.get(studentId) ?? null);
  const grade = row.calificacion === null || row.calificacion === undefined ? null : Number(row.calificacion);
  const createdAt = row.creado_en ?? row.created_at ?? null;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    id_tarea: taskId,
    tareaId: taskId,
    tarea: task,
    tareas: task,
    id_estudiante: studentId,
    estudianteId: studentId,
    estudiante: student,
    usuarios: student,
    contenido: row.contenido ?? '',
    url_archivo: row.url_archivo ?? row.archivo_url ?? null,
    calificacion: grade,
    comentario: row.comentario ?? '',
    estado: row.estado ?? (grade === null ? 'entregado' : 'calificado'),
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeNotification = (row) => {
  if (!row) return null;

  const createdAt = row.creado_en ?? row.created_at ?? null;
  const read = row.leida ?? row.leido ?? false;

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    titulo: row.titulo ?? 'NotificaciÃ³n',
    mensaje: row.mensaje ?? '',
    tipo: row.tipo ?? 'info',
    categoria: row.categoria ?? row.tipo ?? 'general',
    enlace: row.enlace ?? null,
    leida: read,
    leido: read,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const normalizeChatMessage = (row, userMap) => {
  if (!row) return null;

  const senderId = row.id_emisor ?? row.sender_id ?? row.remitenteId ?? null;
  const receiverId = row.id_receptor ?? row.receiver_id ?? row.destinatarioId ?? null;
  const sender =
    normalizeUser(row.remitente) ||
    normalizeUser(row.emisor) ||
    normalizeUser(row.usuarios) ||
    (userMap?.get(senderId) ?? null);
  const receiver =
    normalizeUser(row.destinatario) ||
    normalizeUser(row.receptor) ||
    (userMap?.get(receiverId) ?? null);
  const createdAt = row.creado_en ?? row.created_at ?? null;
  const conversationId = row.id_conversacion ?? row.conversation_id ?? [senderId, receiverId].filter(Boolean).sort().join(':');

  return {
    ...row,
    id: toNumber(row.id) ?? row.id,
    remitenteId: senderId,
    id_emisor: senderId,
    destinatarioId: receiverId,
    id_receptor: receiverId,
    remitente: sender,
    emisor: sender,
    destinatario: receiver,
    receptor: receiver,
    tipo: row.tipo ?? 'global',
    leido: row.leido ?? false,
    contenido: row.contenido ?? '',
    id_conversacion: conversationId,
    conversationId,
    createdAt,
    created_at: createdAt,
    creado_en: createdAt,
  };
};

const fetchUsersMap = async (ids) => {
  const validIds = unique(ids);
  if (!validIds.length) return new Map();

  const { data, error } = await supabase.from('usuarios').select('*').in('id', validIds);
  if (error) throw new Error(mapError(error));

  return new Map((data ?? []).map((row) => [row.id, normalizeUser(row)]));
};

const fetchCoursesMap = async (ids) => {
  const validIds = unique(ids.map((id) => toNumber(id)));
  if (!validIds.length) return new Map();

  const { data, error } = await supabase.from('cursos').select('*').in('id', validIds);
  if (error) throw new Error(mapError(error));

  const teacherMap = await fetchUsersMap((data ?? []).map((row) => row.id_docente));
  return new Map((data ?? []).map((row) => [toNumber(row.id), normalizeCourse(row, teacherMap)]));
};

const fetchTasksMap = async (ids) => {
  const validIds = unique(ids.map((id) => toNumber(id)));
  if (!validIds.length) return new Map();

  const { data, error } = await supabase.from('tareas').select('*').in('id', validIds);
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  return new Map((data ?? []).map((row) => [toNumber(row.id), normalizeTask(row, courseMap)]));
};

const fetchExamsMap = async (ids) => {
  const validIds = unique(ids.map((id) => toNumber(id)));
  if (!validIds.length) return new Map();

  const { data, error } = await supabase.from('examenes').select('*').in('id', validIds);
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  const { data: questionsData, error: questionsError } = await supabase
    .from('preguntas_examen')
    .select('*')
    .in('id_examen', validIds)
    .order('orden', { ascending: true });
  if (questionsError) throw new Error(mapError(questionsError));

  const groupedQuestions = new Map();
  (questionsData ?? []).forEach((row) => {
    const examId = toNumber(row.id_examen);
    const group = groupedQuestions.get(examId) ?? [];
    group.push(normalizeExamQuestion(row));
    groupedQuestions.set(examId, group);
  });

  return new Map(
    (data ?? []).map((row) => {
      const examId = toNumber(row.id);
      return [examId, normalizeExam({ ...row, preguntas: groupedQuestions.get(examId) ?? [] }, courseMap)];
    }),
  );
};

// Auth
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(mapError(error, 'No se pudo iniciar sesiÃ³n'));

  const userId = data.user.id;
  const { data: profileData, error: profileError } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) throw new Error(mapError(profileError));

  const user = normalizeUser({
    ...data.user,
    ...(profileData ?? {}),
  });

  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', data.session.access_token);
  }

  return {
    access_token: data.session.access_token,
    user,
  };
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
  if (error) throw new Error(mapError(error));
};

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getToken = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(mapError(error));
  return data.session?.access_token ?? null;
};

// Cursos
export const getCourses = async () => {
  const { data, error } = await supabase.from('cursos').select('*').order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const teacherMap = await fetchUsersMap((data ?? []).map((row) => row.id_docente));
  return (data ?? []).map((row) => normalizeCourse(row, teacherMap));
};

export const getCourse = async (id) => {
  const { data, error } = await supabase.from('cursos').select('*').eq('id', toNumber(id)).maybeSingle();
  if (error) throw new Error(mapError(error));
  if (!data) return null;

  const teacherMap = await fetchUsersMap([data.id_docente]);
  return normalizeCourse(data, teacherMap);
};

export const getCourseById = getCourse;

export const createCourse = async (courseData) => {
  const payload = stripUndefined({
    titulo: courseData.titulo,
    descripcion: courseData.descripcion || null,
    grado: courseData.grado || null,
    seccion: courseData.seccion || null,
    id_docente: courseData.id_docente ?? courseData.docenteId ?? null,
    activo: courseData.activo ?? true,
  });

  const { data, error } = await supabase.from('cursos').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear el curso'));

  const teacherMap = await fetchUsersMap([data.id_docente]);
  return normalizeCourse(data, teacherMap);
};

export const updateCourse = async (id, courseData) => {
  const payload = stripUndefined({
    titulo: courseData.titulo,
    descripcion: courseData.descripcion,
    grado: courseData.grado,
    seccion: courseData.seccion,
    id_docente: courseData.id_docente ?? courseData.docenteId,
    activo: courseData.activo,
  });

  const { data, error } = await supabase.from('cursos').update(payload).eq('id', toNumber(id)).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar el curso'));

  const teacherMap = await fetchUsersMap([data.id_docente]);
  return normalizeCourse(data, teacherMap);
};

export const deleteCourse = async (id) => {
  const { error } = await supabase.from('cursos').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar el curso'));
  return true;
};

export const getCourseStudents = async (courseId) => {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('*')
    .eq('id_curso', toNumber(courseId));
  if (error) throw new Error(mapError(error));

  const usersMap = await fetchUsersMap((data ?? []).map((row) => row.id_estudiante));
  return (data ?? [])
    .map((row) => usersMap.get(row.id_estudiante))
    .filter(Boolean);
};

// Tareas
export const getAllTasks = async () => {
  const { data, error } = await supabase.from('tareas').select('*').order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  return (data ?? []).map((row) => normalizeTask(row, courseMap));
};

export const getTasks = async () => {
  const { data, error } = await supabase.from('tareas').select('*').order('fecha_vencimiento', { ascending: true });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  return (data ?? []).map((row) => normalizeTask(row, courseMap));
};

export const getTasksByCourse = async (courseId) => {
  const numericCourseId = toNumber(courseId);
  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('id_curso', numericCourseId)
    .order('fecha_vencimiento', { ascending: true });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap([numericCourseId]);
  return (data ?? []).map((row) => normalizeTask(row, courseMap));
};

export const createTask = async (taskData) => {
  const payload = stripUndefined({
    titulo: taskData.titulo,
    descripcion: taskData.descripcion || null,
    id_curso: toNumber(taskData.id_curso ?? taskData.courseId ?? taskData.cursoId),
    fecha_vencimiento: toIso(taskData.fecha_entrega ?? taskData.fecha_vencimiento),
    estado: taskData.estado ?? 'pendiente',
  });

  const { data, error } = await supabase.from('tareas').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear la tarea'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeTask(data, courseMap);
};

export const updateTask = async (id, taskData) => {
  const payload = stripUndefined({
    titulo: taskData.titulo,
    descripcion: taskData.descripcion,
    fecha_vencimiento: taskData.fecha_entrega ? toIso(taskData.fecha_entrega) : undefined,
    estado: taskData.estado,
    id_curso: taskData.id_curso ?? taskData.courseId ?? taskData.cursoId,
  });

  const { data, error } = await supabase.from('tareas').update(payload).eq('id', toNumber(id)).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar la tarea'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeTask(data, courseMap);
};

export const deleteTask = async (id) => {
  const { error } = await supabase.from('tareas').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar la tarea'));
  return true;
};

// ExÃ¡menes
export const getExams = async (courseId) => {
  let query = supabase.from('examenes').select('*').order('fecha_inicio', { ascending: true });
  if (isPresent(courseId)) {
    query = query.eq('id_curso', toNumber(courseId));
  }

  const { data, error } = await query;
  if (error) throw new Error(mapError(error));

  const examIds = (data ?? []).map((row) => toNumber(row.id));
  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  const { data: questionsData, error: questionsError } = await supabase
    .from('preguntas_examen')
    .select('*')
    .in('id_examen', examIds.length ? examIds : [-1])
    .order('orden', { ascending: true });
  if (questionsError) throw new Error(mapError(questionsError));

  const questionsByExam = new Map();
  (questionsData ?? []).forEach((row) => {
    const examId = toNumber(row.id_examen);
    const list = questionsByExam.get(examId) ?? [];
    list.push(normalizeExamQuestion(row));
    questionsByExam.set(examId, list);
  });

  return (data ?? []).map((row) => normalizeExam({ ...row, preguntas: questionsByExam.get(toNumber(row.id)) ?? [] }, courseMap));
};

export const getExam = async (id) => {
  const numericId = toNumber(id);
  const { data, error } = await supabase.from('examenes').select('*').eq('id', numericId).maybeSingle();
  if (error) throw new Error(mapError(error));
  if (!data) return null;

  const [courseMap, questions] = await Promise.all([
    fetchCoursesMap([data.id_curso]),
    getExamQuestions(numericId),
  ]);

  return normalizeExam({ ...data, preguntas: questions }, courseMap);
};

export const getExamById = getExam;

export const createExam = async (examData) => {
  const payload = stripUndefined({
    titulo: examData.titulo,
    descripcion: examData.descripcion || null,
    id_curso: toNumber(examData.id_curso ?? examData.courseId ?? examData.cursoId),
    duracion: toNumber(examData.tiempoLimite ?? examData.tiempo_limite ?? examData.duracion) ?? 60,
    fecha_inicio: toIso(examData.fechaInicio ?? examData.fecha_inicio),
    fecha_fin: toIso(examData.fechaFin ?? examData.fecha_fin),
    activo: examData.activo ?? true,
  });

  const { data, error } = await supabase.from('examenes').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear el examen'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeExam(data, courseMap);
};

export const updateExam = async (id, examData) => {
  const payload = stripUndefined({
    titulo: examData.titulo,
    descripcion: examData.descripcion,
    id_curso: examData.id_curso ?? examData.courseId ?? examData.cursoId,
    duracion: examData.tiempoLimite ?? examData.tiempo_limite ?? examData.duracion,
    fecha_inicio: examData.fechaInicio ? toIso(examData.fechaInicio) : examData.fecha_inicio ? toIso(examData.fecha_inicio) : undefined,
    fecha_fin: examData.fechaFin ? toIso(examData.fechaFin) : examData.fecha_fin ? toIso(examData.fecha_fin) : undefined,
    activo: examData.activo,
  });

  const { data, error } = await supabase.from('examenes').update(payload).eq('id', toNumber(id)).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar el examen'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeExam(data, courseMap);
};

export const deleteExam = async (id) => {
  const { error } = await supabase.from('examenes').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar el examen'));
  return true;
};

export const getExamQuestions = async (examId) => {
  const { data, error } = await supabase
    .from('preguntas_examen')
    .select('*')
    .eq('id_examen', toNumber(examId))
    .order('orden', { ascending: true });
  if (error) throw new Error(mapError(error));

  return (data ?? []).map(normalizeExamQuestion);
};

export const addExamQuestion = async (examIdOrData, maybeData) => {
  const source = typeof examIdOrData === 'object' ? examIdOrData : maybeData;
  const examId = toNumber(typeof examIdOrData === 'object' ? source.id_examen ?? source.examId ?? source.examenId : examIdOrData);
  const payload = stripUndefined({
    id_examen: examId,
    pregunta: source.pregunta,
    opciones_respuesta: source.tipo === 'multiple' ? source.opciones ?? source.opciones_respuesta ?? [] : null,
    respuesta_correcta: source.respuestaCorrecta ?? source.respuesta_correcta,
    puntos: toNumber(source.puntos) ?? 1,
    orden: toNumber(source.orden) ?? 0,
  });

  const { data, error } = await supabase.from('preguntas_examen').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo agregar la pregunta'));

  return normalizeExamQuestion(data);
};

export const updateExamQuestion = async (id, questionData) => {
  const payload = stripUndefined({
    pregunta: questionData.pregunta,
    opciones_respuesta: questionData.tipo === 'multiple' ? questionData.opciones ?? questionData.opciones_respuesta ?? [] : questionData.tipo ? null : undefined,
    respuesta_correcta: questionData.respuestaCorrecta ?? questionData.respuesta_correcta,
    puntos: questionData.puntos,
    orden: questionData.orden,
  });

  const { data, error } = await supabase
    .from('preguntas_examen')
    .update(payload)
    .eq('id', toNumber(id))
    .select('*')
    .single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar la pregunta'));

  return normalizeExamQuestion(data);
};

export const deleteExamQuestion = async (id) => {
  const { error } = await supabase.from('preguntas_examen').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar la pregunta'));
  return true;
};

export const startExamAttempt = async (examId, studentId) => {
  const userId = await getSessionUserId(studentId);
  const numericExamId = toNumber(examId);

  const { data: existing, error: existingError } = await supabase
    .from('intentos_examen')
    .select('*')
    .eq('id_examen', numericExamId)
    .eq('id_estudiante', userId)
    .is('enviado_en', null)
    .order('iniciado_en', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existingError) throw new Error(mapError(existingError));
  if (existing) {
    const examMap = await fetchExamsMap([numericExamId]);
    return normalizeAttempt(existing, examMap);
  }

  const { data, error } = await supabase
    .from('intentos_examen')
    .insert({
      id_examen: numericExamId,
      id_estudiante: userId,
      iniciado_en: new Date().toISOString(),
      respuestas: [],
    })
    .select('*')
    .single();
  if (error) throw new Error(mapError(error, 'No se pudo iniciar el examen'));

  const examMap = await fetchExamsMap([numericExamId]);
  return normalizeAttempt(data, examMap);
};

const compareAnswers = (expected, received) => {
  if (!isPresent(expected) || !isPresent(received)) return false;
  return String(expected).trim().toLowerCase() === String(received).trim().toLowerCase();
};

export const submitExamAttempt = async (attemptId, answers) => {
  const currentAttempt = await getAttemptById(attemptId);
  if (!currentAttempt) throw new Error('No se encontrÃ³ el intento de examen');

  const questions = await getExamQuestions(currentAttempt.examId);
  const totalPoints = questions.reduce((sum, question) => sum + (toNumber(question.puntos) ?? 1), 0);

  const normalizedAnswers = (Array.isArray(answers) ? answers : []).map((answer) => ({
    questionId: toNumber(answer.questionId ?? answer.id_pregunta),
    respuesta: answer.respuesta ?? answer.answer ?? '',
  }));

  const pointsEarned = normalizedAnswers.reduce((sum, answer) => {
    const question = questions.find((item) => item.id === answer.questionId);
    if (!question) return sum;
    return compareAnswers(question.respuestaCorrecta, answer.respuesta)
      ? sum + (toNumber(question.puntos) ?? 1)
      : sum;
  }, 0);

  const percentage = totalPoints > 0 ? Math.round((pointsEarned / totalPoints) * 1000) / 10 : 0;

  const { data, error } = await supabase
    .from('intentos_examen')
    .update({
      respuestas: normalizedAnswers,
      enviado_en: new Date().toISOString(),
      puntaje: percentage,
    })
    .eq('id', toNumber(attemptId))
    .select('*')
    .single();
  if (error) throw new Error(mapError(error, 'No se pudo enviar el examen'));

  const examMap = await fetchExamsMap([currentAttempt.examId]);
  return normalizeAttempt(data, examMap);
};

export const getAttemptById = async (id) => {
  const { data, error } = await supabase.from('intentos_examen').select('*').eq('id', toNumber(id)).maybeSingle();
  if (error) throw new Error(mapError(error));
  if (!data) return null;

  const examMap = await fetchExamsMap([data.id_examen]);
  return normalizeAttempt(data, examMap);
};

export const getStudentExamAttempts = async (studentId, examId) => {
  const userId = await getSessionUserId(studentId);
  let query = supabase
    .from('intentos_examen')
    .select('*')
    .eq('id_estudiante', userId)
    .order('iniciado_en', { ascending: false });

  if (isPresent(examId)) {
    query = query.eq('id_examen', toNumber(examId));
  }

  const { data, error } = await query;
  if (error) throw new Error(mapError(error));

  const examMap = await fetchExamsMap((data ?? []).map((row) => row.id_examen));
  return (data ?? []).map((row) => normalizeAttempt(row, examMap));
};

export const checkExamTimeRemaining = async (attemptId) => {
  const attempt = await getAttemptById(attemptId);
  if (!attempt) return { timeRemaining: 0, remaining: 0, expired: true };

  const durationMinutes = toNumber(attempt.exam?.tiempoLimite ?? attempt.exam?.duracion) ?? 0;
  const startedAt = attempt.iniciado_en ?? attempt.createdAt;
  const elapsedSeconds = startedAt ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000) : 0;
  const totalSeconds = durationMinutes * 60;
  const remaining = Math.max(0, totalSeconds - elapsedSeconds);

  return {
    timeRemaining: remaining,
    remaining,
    expired: remaining <= 0,
  };
};

// Usuarios
export const getUsers = async () => {
  const { data, error } = await supabase.from('usuarios').select('*').order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));
  return (data ?? []).map(normalizeUser);
};

export const createUser = async (userData) => {
  const password = userData.password ?? userData.contrasena ?? userData['contraseña'];
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password,
    options: {
      data: {
        nombre: userData.nombre,
        rol: userData.rol ?? 'estudiante',
      },
    },
  });
  if (error) throw new Error(mapError(error, 'No se pudo crear el usuario'));

  const { data: profileData } = await supabase.from('usuarios').select('*').eq('id', data.user.id).maybeSingle();

  if (profileData && (userData.telefono || userData.avatar)) {
    await updateUser(data.user.id, {
      telefono: userData.telefono,
      avatar: userData.avatar,
      rol: userData.rol,
      nombre: userData.nombre,
    }).catch(() => null);
  }

  return normalizeUser({
    ...data.user,
    ...(profileData ?? {}),
    nombre: userData.nombre,
    rol: userData.rol ?? profileData?.rol ?? 'estudiante',
  });
};

export const updateUser = async (id, userData) => {
  const attempts = [
    { nombre: userData.nombre },
    { rol: userData.rol },
    { telefono: userData.telefono },
    { foto_url: userData.avatar ?? userData.foto_url },
  ].filter((entry) => Object.values(entry).some((value) => value !== undefined));

  let lastError = null;
  for (const payload of attempts) {
    const { error } = await supabase.from('usuarios').update(payload).eq('id', id);
    if (error) {
      lastError = error;
    }
  }

  if (lastError && attempts.length === 1) {
    throw new Error(mapError(lastError, 'No se pudo actualizar el usuario'));
  }

  const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(mapError(error));

  return normalizeUser({
    ...(data ?? {}),
    nombre: data?.nombre ?? userData.nombre,
    rol: data?.rol ?? userData.rol,
    telefono: data?.telefono ?? userData.telefono,
    foto_url: data?.foto_url ?? userData.avatar ?? userData.foto_url,
  });
};

export const deleteUser = async (id) => {
  const { error } = await supabase.from('usuarios').delete().eq('id', id);
  if (error) throw new Error(mapError(error, 'No se pudo eliminar el usuario'));
  return true;
};

// Recursos
export const getResourcesByCourse = async (courseId) => {
  const numericCourseId = toNumber(courseId);
  const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id_curso', numericCourseId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap([numericCourseId]);
  return (data ?? []).map((row) => normalizeResource(row, courseMap));
};

export const createResource = async (resourceData) => {
  const payload = stripUndefined({
    titulo: resourceData.titulo ?? resourceData.nombre_archivo,
    descripcion: resourceData.descripcion ?? null,
    url: resourceData.url ?? null,
    tipo: resourceData.tipo ?? resourceData.tipo_recurso ?? 'documento',
    id_curso: toNumber(resourceData.id_curso ?? resourceData.courseId ?? resourceData.cursoId),
  });

  const { data, error } = await supabase.from('recursos').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear el recurso'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeResource(data, courseMap);
};

export const updateResource = async (id, resourceData) => {
  const payload = stripUndefined({
    titulo: resourceData.titulo ?? resourceData.nombre_archivo,
    descripcion: resourceData.descripcion,
    url: resourceData.url,
    tipo: resourceData.tipo ?? resourceData.tipo_recurso,
    id_curso: resourceData.id_curso ?? resourceData.courseId ?? resourceData.cursoId,
  });

  const { data, error } = await supabase.from('recursos').update(payload).eq('id', toNumber(id)).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar el recurso'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeResource(data, courseMap);
};

export const deleteResource = async (id) => {
  const { error } = await supabase.from('recursos').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar el recurso'));
  return true;
};

// Foros
export const getAllForums = async () => {
  const { data, error } = await supabase.from('foros').select('*').order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap((data ?? []).map((row) => row.id_curso));
  return (data ?? []).map((row) => normalizeForum(row, courseMap));
};

export const getForumsByCourse = async (courseId) => {
  const numericCourseId = toNumber(courseId);
  const { data, error } = await supabase
    .from('foros')
    .select('*')
    .eq('id_curso', numericCourseId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const courseMap = await fetchCoursesMap([numericCourseId]);
  return (data ?? []).map((row) => normalizeForum(row, courseMap));
};

export const getForumById = async (id) => {
  const numericId = toNumber(id);
  const { data, error } = await supabase.from('foros').select('*').eq('id', numericId).maybeSingle();
  if (error) throw new Error(mapError(error));
  if (!data) return null;

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeForum(data, courseMap);
};

export const getForum = getForumById;

export const createForum = async (forumData) => {
  const payload = stripUndefined({
    titulo: forumData.titulo,
    descripcion: forumData.descripcion ?? null,
    id_curso: toNumber(forumData.id_curso ?? forumData.courseId ?? forumData.cursoId),
  });

  const { data, error } = await supabase.from('foros').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear el foro'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeForum(data, courseMap);
};

export const updateForum = async (id, forumData) => {
  const payload = stripUndefined({
    titulo: forumData.titulo,
    descripcion: forumData.descripcion,
    id_curso: forumData.id_curso ?? forumData.courseId ?? forumData.cursoId,
  });

  const { data, error } = await supabase.from('foros').update(payload).eq('id', toNumber(id)).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo actualizar el foro'));

  const courseMap = await fetchCoursesMap([data.id_curso]);
  return normalizeForum(data, courseMap);
};

export const deleteForum = async (id) => {
  const { error } = await supabase.from('foros').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error, 'No se pudo eliminar el foro'));
  return true;
};

export const getForumMessages = async (forumId) => {
  const numericForumId = toNumber(forumId);
  const { data, error } = await supabase
    .from('mensajes_foro')
    .select('*')
    .eq('id_foro', numericForumId)
    .order('creado_en', { ascending: true });
  if (error) throw new Error(mapError(error));

  const usersMap = await fetchUsersMap((data ?? []).map((row) => row.id_usuario));
  return (data ?? []).map((row) => normalizeForumMessage(row, usersMap));
};

export const createForumMessage = async (forumIdOrData, maybeData) => {
  const source = typeof forumIdOrData === 'object' ? forumIdOrData : maybeData;
  const forumId = toNumber(typeof forumIdOrData === 'object' ? source.id_foro ?? source.forumId ?? source.foroId : forumIdOrData);
  const userId = await getSessionUserId(source.id_usuario ?? source.userId ?? source.usuarioId);

  const payload = {
    id_foro: forumId,
    id_usuario: userId,
    contenido: source.contenido,
  };

  const { data, error } = await supabase.from('mensajes_foro').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo enviar el mensaje'));

  const usersMap = await fetchUsersMap([userId]);
  return normalizeForumMessage(data, usersMap);
};

// Chat
export const getGlobalChatMessages = async (limit = 50) => {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .eq('tipo', 'global')
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (error) throw new Error(mapError(error));

  const usersMap = await fetchUsersMap((data ?? []).map((row) => row.id_emisor));
  return (data ?? []).map((row) => normalizeChatMessage(row, usersMap));
};

export const sendChatMessage = async (messageData) => {
  const senderId = await getSessionUserId(messageData.id_emisor ?? messageData.senderId ?? messageData.remitenteId);
  const receiverId = messageData.id_receptor ?? messageData.receiverId ?? messageData.destinatarioId ?? null;
  const payload = {
    id_emisor: senderId,
    id_receptor: receiverId,
    id_conversacion:
      messageData.id_conversacion ??
      messageData.conversationId ??
      (receiverId ? [senderId, receiverId].sort().join(':') : null),
    contenido: messageData.contenido,
    tipo: messageData.tipo ?? (receiverId ? 'privado' : 'global'),
    leido: false,
  };

  const { data, error } = await supabase.from('mensajes_chat').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo enviar el mensaje'));

  const usersMap = await fetchUsersMap([senderId, receiverId]);
  return normalizeChatMessage(data, usersMap);
};

export const getNewChatMessages = async (lastMessageId, type = 'global') => {
  let query = supabase
    .from('mensajes_chat')
    .select('*')
    .gt('id', toNumber(lastMessageId) ?? 0)
    .order('creado_en', { ascending: true });

  if (type) {
    query = query.eq('tipo', type);
  }

  const { data, error } = await query;
  if (error) throw new Error(mapError(error));

  const userIds = (data ?? []).flatMap((row) => [row.id_emisor, row.id_receptor]);
  const usersMap = await fetchUsersMap(userIds);
  return (data ?? []).map((row) => normalizeChatMessage(row, usersMap));
};

export const getUserConversations = async (userId) => {
  const currentUserId = await getSessionUserId(userId);
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .eq('tipo', 'privado')
    .or(`id_emisor.eq.${currentUserId},id_receptor.eq.${currentUserId}`)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const usersMap = await fetchUsersMap((data ?? []).flatMap((row) => [row.id_emisor, row.id_receptor]));
  const normalized = (data ?? []).map((row) => normalizeChatMessage(row, usersMap));
  const byConversation = new Map();

  normalized.forEach((message) => {
    if (!byConversation.has(message.conversationId)) {
      const otherUser = message.remitenteId === currentUserId ? message.destinatario : message.remitente;
      byConversation.set(message.conversationId, {
        ...message,
        otherUser,
      });
    }
  });

  return [...byConversation.values()];
};

export const getPrivateChatMessages = async (userId, otherUserId, limit = 50) => {
  const currentUserId = await getSessionUserId(userId);
  const conversationId = [currentUserId, otherUserId].sort().join(':');

  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*')
    .eq('tipo', 'privado')
    .eq('id_conversacion', conversationId)
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (error) throw new Error(mapError(error));

  const usersMap = await fetchUsersMap((data ?? []).flatMap((row) => [row.id_emisor, row.id_receptor]));
  return (data ?? []).map((row) => normalizeChatMessage(row, usersMap));
};

export const markChatAsRead = async (messageIdOrUserId, otherUserId) => {
  if (isPresent(otherUserId)) {
    const currentUserId = await getSessionUserId(messageIdOrUserId);
    const { error } = await supabase
      .from('mensajes_chat')
      .update({ leido: true })
      .eq('id_receptor', currentUserId)
      .eq('id_emisor', otherUserId)
      .eq('tipo', 'privado')
      .eq('leido', false);
    if (error) throw new Error(mapError(error));
    return true;
  }

  const { error } = await supabase.from('mensajes_chat').update({ leido: true }).eq('id', toNumber(messageIdOrUserId));
  if (error) throw new Error(mapError(error));
  return true;
};

export const getChatUnreadCount = async (userId) => {
  const currentUserId = await getSessionUserId(userId);
  const { count, error } = await supabase
    .from('mensajes_chat')
    .select('*', { count: 'exact', head: true })
    .eq('id_receptor', currentUserId)
    .eq('leido', false);
  if (error) throw new Error(mapError(error));
  return count ?? 0;
};

// Entregas
export const getStudentSubmissions = async (studentId) => {
  const currentUserId = await getSessionUserId(studentId);
  const { data, error } = await supabase
    .from('entregas')
    .select('*')
    .eq('id_estudiante', currentUserId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const taskMap = await fetchTasksMap((data ?? []).map((row) => row.id_tarea));
  const usersMap = await fetchUsersMap((data ?? []).map((row) => row.id_estudiante));
  return (data ?? []).map((row) => normalizeSubmission(row, taskMap, usersMap));
};

export const getTaskSubmissions = async (taskId) => {
  const numericTaskId = toNumber(taskId);
  const { data, error } = await supabase
    .from('entregas')
    .select('*')
    .eq('id_tarea', numericTaskId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  const taskMap = await fetchTasksMap([numericTaskId]);
  const usersMap = await fetchUsersMap((data ?? []).map((row) => row.id_estudiante));
  return (data ?? []).map((row) => normalizeSubmission(row, taskMap, usersMap));
};

export const createSubmission = async (submissionData) => {
  const payload = stripUndefined({
    id_tarea: toNumber(submissionData.id_tarea ?? submissionData.taskId ?? submissionData.tareaId),
    id_estudiante: await getSessionUserId(submissionData.id_estudiante ?? submissionData.studentId ?? submissionData.estudianteId),
    contenido: submissionData.contenido ?? '',
    url_archivo: submissionData.url_archivo ?? submissionData.archivo_url ?? null,
    comentario: submissionData.comentario ?? null,
  });

  const { data, error } = await supabase.from('entregas').insert(payload).select('*').single();
  if (error) throw new Error(mapError(error, 'No se pudo crear la entrega'));

  const [taskMap, usersMap] = await Promise.all([
    fetchTasksMap([data.id_tarea]),
    fetchUsersMap([data.id_estudiante]),
  ]);
  return normalizeSubmission(data, taskMap, usersMap);
};

export const gradeSubmission = async (submissionId, gradeOrData, maybeComment = '') => {
  const payload =
    typeof gradeOrData === 'object'
      ? stripUndefined({
          calificacion: gradeOrData.calificacion,
          comentario: gradeOrData.comentario,
        })
      : {
          calificacion: gradeOrData,
          comentario: maybeComment || null,
        };

  const { data, error } = await supabase
    .from('entregas')
    .update(payload)
    .eq('id', toNumber(submissionId))
    .select('*')
    .single();
  if (error) throw new Error(mapError(error, 'No se pudo guardar la calificaciÃ³n'));

  const [taskMap, usersMap] = await Promise.all([
    fetchTasksMap([data.id_tarea]),
    fetchUsersMap([data.id_estudiante]),
  ]);
  return normalizeSubmission(data, taskMap, usersMap);
};

// Notificaciones
export const getNotifications = async (userId) => {
  const currentUserId = await getSessionUserId(userId);
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('id_usuario', currentUserId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(mapError(error));

  return (data ?? []).map(normalizeNotification);
};

export const markNotificationAsRead = async (id) => {
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id', toNumber(id));
  if (error) throw new Error(mapError(error));
  return true;
};

export const markAllNotificationsAsRead = async (userId) => {
  const currentUserId = await getSessionUserId(userId);
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id_usuario', currentUserId);
  if (error) throw new Error(mapError(error));
  return true;
};

export const deleteNotification = async (id) => {
  const { error } = await supabase.from('notificaciones').delete().eq('id', toNumber(id));
  if (error) throw new Error(mapError(error));
  return true;
};

export const getUnreadNotificationsCount = async (userId) => {
  const currentUserId = await getSessionUserId(userId);
  const { count, error } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('id_usuario', currentUserId)
    .eq('leido', false);
  if (error) throw new Error(mapError(error));
  return count ?? 0;
};

// Dashboard
export const getDashboardStats = async () => {
  const [courses, tasks, users, exams, unreadNotifications, unreadChat] = await Promise.all([
    getCourses().catch(() => []),
    getAllTasks().catch(() => []),
    getUsers().catch(() => []),
    getExams().catch(() => []),
    getUnreadNotificationsCount().catch(() => 0),
    getChatUnreadCount().catch(() => 0),
  ]);

  const tasksCompleted = tasks.filter((task) => task.estado === 'completada').length;
  const tasksPending = tasks.filter((task) => task.estado !== 'completada').length;
  const completionRate =
    tasks.length > 0 ? Math.round((tasksCompleted / tasks.length) * 100) : 0;

  return {
    courses: courses.length,
    totalStudents: users.filter((user) => user.rol === 'estudiante').length,
    totalTeachers: users.filter((user) => user.rol === 'profesor' || user.rol === 'docente').length,
    activeExams: exams.filter((exam) => exam.activo).length,
    tasksCompleted,
    tasksPending,
    completionRate,
    newMessages: unreadChat,
    unreadNotifications,
  };
};

// Uploads
export const uploadFile = async (file, folder = 'general') => {
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${folder}/${Date.now()}_${safeName || `archivo.${extension}`}`;

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error(mapError(error, 'No se pudo subir el archivo'));

  const url = getPublicUrlFromPath(data.path);
  return {
    path: data.path,
    url,
    file: {
      filename: data.path,
      originalName: file.name,
      size: file.size,
      mimetype: file.type,
      url,
    },
  };
};

export const uploadMultipleFiles = async (files, folder = 'general') => {
  const uploaded = [];
  for (const file of files) {
    const result = await uploadFile(file, folder);
    uploaded.push(result.file);
  }
  return { files: uploaded };
};

// DiagnÃ³stico
export const checkHealth = async () => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('usuarios').select('id').limit(1);
    if (error) throw error;

    return {
      connected: true,
      latency: Date.now() - start,
      message: 'Conectado a Supabase',
    };
  } catch (error) {
    return {
      connected: false,
      latency: null,
      message: mapError(error, 'No se pudo conectar con Supabase'),
    };
  }
};

export const runDiagnostic = async () => {
  const [health, courses] = await Promise.all([checkHealth(), getCourses().catch(() => [])]);
  return {
    backendUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'supabase',
    timestamp: new Date().toISOString(),
    tests: [
      {
        name: 'ConexiÃ³n Supabase',
        status: health.connected ? 'OK' : 'ERROR',
        message: health.message,
      },
      {
        name: 'Lectura de cursos',
        status: Array.isArray(courses) ? 'OK' : 'ERROR',
        message: `${courses.length} cursos disponibles`,
      },
    ],
  };
};

export const getApiConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  hasToken: !!getCurrentUser(),
  user: getCurrentUser(),
});
