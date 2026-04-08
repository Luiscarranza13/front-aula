// API con Supabase - tablas y columnas en español
import { supabase } from './supabase';

// =====================
// AUTH
// =====================

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);

  const { data: perfil } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', data.user.id)
    .single();

  const usuario = { ...data.user, ...perfil };
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(usuario));
  }
  return { access_token: data.session.access_token, user: usuario };
};

export const logout = async () => {
  await supabase.auth.signOut();
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }
};

export const getCurrentUser = () => {
  try {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const getToken = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token || null;
};

// =====================
// CURSOS
// =====================

export const getCourses = async () => {
  const { data, error } = await supabase
    .from('cursos')
    .select('*, usuarios(id, nombre, email)')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getCourse = async (id) => {
  const { data, error } = await supabase
    .from('cursos')
    .select('*, usuarios(id, nombre, email)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getCourseById = getCourse;

export const createCourse = async (courseData) => {
  const { data, error } = await supabase.from('cursos').insert(courseData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateCourse = async (id, courseData) => {
  const { data, error } = await supabase.from('cursos').update(courseData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteCourse = async (id) => {
  const { error } = await supabase.from('cursos').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getCourseStudents = async (courseId) => {
  const { data, error } = await supabase
    .from('inscripciones')
    .select('*, usuarios(id, nombre, email, rol)')
    .eq('id_curso', courseId);
  if (error) throw new Error(error.message);
  return data?.map(e => e.usuarios) || [];
};

// =====================
// TAREAS
// =====================

export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tareas')
    .select('*, cursos(titulo)')
    .order('fecha_vencimiento', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from('tareas')
    .select('*, cursos(titulo)')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getTasksByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('tareas')
    .select('*')
    .eq('id_curso', courseId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const createTask = async (taskData) => {
  const { data, error } = await supabase.from('tareas').insert(taskData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteTask = async (id) => {
  const { error } = await supabase.from('tareas').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// =====================
// EXÁMENES
// =====================

export const getExams = async () => {
  const { data, error } = await supabase
    .from('examenes')
    .select('*, cursos(titulo)')
    .order('fecha_inicio', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getExam = async (id) => {
  const { data, error } = await supabase
    .from('examenes')
    .select('*, cursos(titulo)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getExamById = getExam;

export const createExam = async (examData) => {
  const { data, error } = await supabase.from('examenes').insert(examData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateExam = async (id, examData) => {
  const { data, error } = await supabase.from('examenes').update(examData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteExam = async (id) => {
  const { error } = await supabase.from('examenes').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getExamQuestions = async (examId) => {
  const { data, error } = await supabase
    .from('preguntas_examen')
    .select('id, pregunta, opciones_respuesta, respuesta_correcta, puntos, orden')
    .eq('id_examen', examId)
    .order('orden', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const addExamQuestion = async (questionData) => {
  const { data, error } = await supabase.from('preguntas_examen').insert(questionData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const updateExamQuestion = async (id, questionData) => {
  const { data, error } = await supabase.from('preguntas_examen').update(questionData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteExamQuestion = async (id) => {
  const { error } = await supabase.from('preguntas_examen').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const startExamAttempt = async (examId) => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  const { data, error } = await supabase
    .from('intentos_examen')
    .insert({ id_examen: examId, id_estudiante: userId, iniciado_en: new Date().toISOString() })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const submitExamAttempt = async (attemptId, answers) => {
  const { data, error } = await supabase
    .from('intentos_examen')
    .update({ respuestas: answers, enviado_en: new Date().toISOString() })
    .eq('id', attemptId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getAttemptById = async (id) => {
  const { data, error } = await supabase.from('intentos_examen').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
};

export const getStudentExamAttempts = async (studentId, examId) => {
  const { data, error } = await supabase
    .from('intentos_examen')
    .select('*')
    .eq('id_estudiante', studentId)
    .eq('id_examen', examId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const checkExamTimeRemaining = async (attemptId) => {
  const { data, error } = await supabase
    .from('intentos_examen')
    .select('iniciado_en, examenes(duracion)')
    .eq('id', attemptId)
    .single();
  if (error) return { timeRemaining: 0 };
  const elapsed = (Date.now() - new Date(data.iniciado_en).getTime()) / 1000;
  const total = (data.examenes?.duracion || 0) * 60;
  return { timeRemaining: Math.max(0, total - elapsed) };
};

// =====================
// USUARIOS
// =====================

export const getUsers = async () => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createUser = async (userData) => {
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.contraseña || userData.password,
    options: {
      data: { nombre: userData.nombre, rol: userData.rol || 'estudiante' }
    }
  });
  if (error) throw new Error(error.message);
  return data.user;
};

export const updateUser = async (id, userData) => {
  const { data, error } = await supabase.from('usuarios').update(userData).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// =====================
// RECURSOS
// =====================

export const getResourcesByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id_curso', courseId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const createResource = async (resourceData) => {
  const { data, error } = await supabase.from('recursos').insert(resourceData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteResource = async (id) => {
  const { error } = await supabase.from('recursos').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// =====================
// FOROS
// =====================

export const getAllForums = async () => {
  const { data, error } = await supabase
    .from('foros')
    .select('*, cursos(titulo)')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getForumsByCourse = async (courseId) => {
  const { data, error } = await supabase
    .from('foros')
    .select('*')
    .eq('id_curso', courseId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const getForumById = async (id) => {
  const { data, error } = await supabase
    .from('foros')
    .select('*, cursos(titulo)')
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const createForum = async (forumData) => {
  const { data, error } = await supabase.from('foros').insert(forumData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteForum = async (id) => {
  const { error } = await supabase.from('foros').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getForumMessages = async (forumId) => {
  const { data, error } = await supabase
    .from('mensajes_foro')
    .select('*, usuarios(nombre)')
    .eq('id_foro', forumId)
    .order('creado_en', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const createForumMessage = async (messageData) => {
  const { data, error } = await supabase.from('mensajes_foro').insert(messageData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

// =====================
// CHAT
// =====================

export const getGlobalChatMessages = async (limit = 50) => {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*, usuarios(nombre)')
    .eq('tipo', 'global')
    .order('creado_en', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data || []).reverse();
};

export const sendChatMessage = async (messageData) => {
  const { data, error } = await supabase.from('mensajes_chat').insert(messageData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const getNewChatMessages = async (lastMessageId) => {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*, usuarios(nombre)')
    .gt('id', lastMessageId)
    .eq('tipo', 'global')
    .order('creado_en', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getUserConversations = async (userId) => {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*, usuarios(nombre)')
    .or(`id_emisor.eq.${userId},id_receptor.eq.${userId}`)
    .eq('tipo', 'privado')
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const getPrivateChatMessages = async (conversationId) => {
  const { data, error } = await supabase
    .from('mensajes_chat')
    .select('*, usuarios(nombre)')
    .eq('id_conversacion', conversationId)
    .order('creado_en', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
};

export const markChatAsRead = async (messageId) => {
  const { error } = await supabase.from('mensajes_chat').update({ leido: true }).eq('id', messageId);
  return !error;
};

export const getChatUnreadCount = async () => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return 0;
  const { count } = await supabase
    .from('mensajes_chat')
    .select('*', { count: 'exact', head: true })
    .eq('id_receptor', userId)
    .eq('leido', false);
  return count || 0;
};

// =====================
// ENTREGAS (Submissions)
// =====================

export const getStudentSubmissions = async (studentId) => {
  const { data, error } = await supabase
    .from('entregas')
    .select('*, tareas(titulo, cursos(titulo))')
    .eq('id_estudiante', studentId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const getTaskSubmissions = async (taskId) => {
  const { data, error } = await supabase
    .from('entregas')
    .select('*, usuarios(nombre)')
    .eq('id_tarea', taskId);
  if (error) throw new Error(error.message);
  return data || [];
};

export const createSubmission = async (submissionData) => {
  const { data, error } = await supabase.from('entregas').insert(submissionData).select().single();
  if (error) throw new Error(error.message);
  return data;
};

export const gradeSubmission = async (submissionId, gradeData) => {
  const { data, error } = await supabase
    .from('entregas')
    .update(gradeData)
    .eq('id', submissionId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
};

// =====================
// NOTIFICACIONES
// =====================

export const getNotifications = async () => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('id_usuario', userId)
    .order('creado_en', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
};

export const markNotificationAsRead = async (id) => {
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id', id);
  return !error;
};

export const markAllNotificationsAsRead = async () => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  const { error } = await supabase.from('notificaciones').update({ leido: true }).eq('id_usuario', userId);
  return !error;
};

export const deleteNotification = async (id) => {
  const { error } = await supabase.from('notificaciones').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

export const getUnreadNotificationsCount = async () => {
  const { data: session } = await supabase.auth.getSession();
  const userId = session?.session?.user?.id;
  if (!userId) return 0;
  const { count } = await supabase
    .from('notificaciones')
    .select('*', { count: 'exact', head: true })
    .eq('id_usuario', userId)
    .eq('leido', false);
  return count || 0;
};

// =====================
// DASHBOARD STATS
// =====================

export const getDashboardStats = async () => {
  const [
    { count: totalCursos },
    { count: totalEstudiantes },
    { count: totalDocentes },
    { count: examenesActivos },
  ] = await Promise.all([
    supabase.from('cursos').select('*', { count: 'exact', head: true }),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).eq('rol', 'estudiante'),
    supabase.from('usuarios').select('*', { count: 'exact', head: true }).in('rol', ['profesor', 'docente']),
    supabase.from('examenes').select('*', { count: 'exact', head: true }).eq('activo', true),
  ]);

  return {
    courses: totalCursos || 0,
    totalStudents: totalEstudiantes || 0,
    totalTeachers: totalDocentes || 0,
    activeExams: examenesActivos || 0,
    tasksCompleted: 0,
    tasksPending: 0,
    completionRate: 0,
    newMessages: 0,
  };
};

// =====================
// UPLOADS (Supabase Storage)
// =====================

export const uploadFile = async (file, folder = 'general') => {
  const filename = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage.from('uploads').upload(filename, file);
  if (error) throw new Error(error.message);
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filename);
  return { url: urlData.publicUrl, path: data.path };
};

export const uploadMultipleFiles = async (files, folder = 'general') => {
  return Promise.all(files.map(file => uploadFile(file, folder)));
};

// =====================
// HEALTH CHECK
// =====================

export const checkHealth = async () => {
  try {
    const start = Date.now();
    const { error } = await supabase.from('usuarios').select('id').limit(1);
    const latency = Date.now() - start;
    if (error) throw error;
    return { connected: true, latency, message: `Conectado (${latency}ms)` };
  } catch (error) {
    return { connected: false, latency: null, message: `Fallo de conexión: ${error.message}` };
  }
};

export const runDiagnostic = async () => {
  const health = await checkHealth();
  return {
    backendUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    timestamp: new Date().toISOString(),
    tests: [{ name: 'Conexión Supabase', status: health.connected ? 'OK' : 'ERROR', message: health.message }],
  };
};

export const getApiConfig = () => ({
  baseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasToken: !!getCurrentUser(),
  user: getCurrentUser(),
});

export const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

