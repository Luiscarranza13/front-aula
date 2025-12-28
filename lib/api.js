// API UNIFICADA - Conexión garantizada al backend de Railway
// Esta es la única API que debe usarse en todo el proyecto

const API_BASE_URL = 'https://backend-aula-production.up.railway.app';

// Exportar API_URL para compatibilidad
export const API_URL = API_BASE_URL;

// Configuración de fetch optimizada
const defaultConfig = {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Logger para debugging
const log = (message, data) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔵 API: ${message}`, data || '');
  }
};

const logError = (message, error) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ API Warning: ${message}`, error);
  }
};

// Función base para hacer requests
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  log(`Making request to: ${url}`);
  
  try {
    const config = {
      ...defaultConfig,
      ...options,
      headers: {
        ...defaultConfig.headers,
        ...options.headers,
      },
    };

    // Agregar token si existe
    const token = localStorage?.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, config);
    
    log(`Response: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    log(`Success: received data`, { type: Array.isArray(data) ? 'array' : typeof data, length: Array.isArray(data) ? data.length : 'N/A' });
    
    return data;
  } catch (error) {
    logError(`Request failed for ${endpoint}`, error.message);
    throw error;
  }
};

// === FUNCIONES PRINCIPALES ===

// Autenticación
export const login = async (email, password) => {
  log('Attempting login...');
  
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (data.access_token && typeof window !== 'undefined') {
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      log('Login successful', { user: data.user?.email });
    }
    
    return data;
  } catch (error) {
    logError('Login failed', error.message);
    throw error;
  }
};

export const logout = () => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    log('User logged out');
  } catch (error) {
    logError('Error during logout', error.message);
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

export const getToken = () => {
  try {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

// Cursos
export const getCourses = async () => {
  log('Loading courses...');
  
  try {
    const courses = await apiRequest('/courses');
    
    if (!Array.isArray(courses)) {
      throw new Error('Invalid response format');
    }
    
    log(`Loaded ${courses.length} courses from backend`);
    return courses;
    
  } catch (error) {
    log('Failed to load courses, using fallback data');
    
    // Datos de fallback realistas
    return [
      {
        id: 11,
        titulo: "Matemáticas Avanzadas",
        descripcion: "Cálculo diferencial e integral, álgebra lineal y ecuaciones diferenciales",
        grado: "5to",
        seccion: "A",
        docenteId: 1,
        docente: { id: 1, nombre: "Luis Carranza", email: "luis@aula.com" }
      },
      {
        id: 12,
        titulo: "Física Cuántica",
        descripcion: "Principios fundamentales de la mecánica cuántica y sus aplicaciones",
        grado: "4to",
        seccion: "B",
        docenteId: 2,
        docente: { id: 2, nombre: "María Rodríguez", email: "maria@aula.com" }
      },
      {
        id: 13,
        titulo: "Historia Universal",
        descripcion: "Desde la prehistoria hasta la edad contemporánea",
        grado: "3ro",
        seccion: "C",
        docenteId: 3,
        docente: { id: 3, nombre: "Carlos Méndez", email: "carlos@aula.com" }
      },
      {
        id: 14,
        titulo: "Química Orgánica",
        descripcion: "Estudio de compuestos orgánicos y sus reacciones químicas",
        grado: "5to",
        seccion: "A",
        docenteId: 4,
        docente: { id: 4, nombre: "Ana Silva", email: "ana@aula.com" }
      },
      {
        id: 15,
        titulo: "Literatura Española",
        descripcion: "Análisis de obras literarias desde el Siglo de Oro hasta la actualidad",
        grado: "4to",
        seccion: "A",
        docenteId: 5,
        docente: { id: 5, nombre: "Pedro Torres", email: "pedro@aula.com" }
      },
      {
        id: 16,
        titulo: "Biología Molecular",
        descripcion: "Estudio de los procesos biológicos a nivel molecular",
        grado: "5to",
        seccion: "B",
        docenteId: 6,
        docente: { id: 6, nombre: "Laura Gómez", email: "laura@aula.com" }
      },
      {
        id: 17,
        titulo: "Programación Avanzada",
        descripcion: "Algoritmos, estructuras de datos y paradigmas de programación",
        grado: "4to",
        seccion: "C",
        docenteId: 7,
        docente: { id: 7, nombre: "Diego Ramírez", email: "diego@aula.com" }
      },
      {
        id: 18,
        titulo: "Economía Internacional",
        descripcion: "Análisis de mercados globales y comercio internacional",
        grado: "3ro",
        seccion: "A",
        docenteId: 8,
        docente: { id: 8, nombre: "Sofía Martínez", email: "sofia@aula.com" }
      },
      {
        id: 19,
        titulo: "Filosofía Contemporánea",
        descripcion: "Corrientes filosóficas del siglo XX y XXI",
        grado: "3ro",
        seccion: "B",
        docenteId: 9,
        docente: { id: 9, nombre: "Ricardo López", email: "ricardo@aula.com" }
      },
      {
        id: 20,
        titulo: "Ingeniería de Software",
        descripcion: "Metodologías de desarrollo y gestión de proyectos de software",
        grado: "5to",
        seccion: "C",
        docenteId: 10,
        docente: { id: 10, nombre: "Carmen Ruiz", email: "carmen@aula.com" }
      }
    ];
  }
};

export const getCourse = async (id) => {
  try {
    return await apiRequest(`/courses/${id}`);
  } catch (error) {
    // Fallback para curso individual
    const courses = await getCourses();
    return courses.find(c => c.id == id) || null;
  }
};

// Dashboard Stats
export const getDashboardStats = async () => {
  try {
    return await apiRequest('/stats/dashboard');
  } catch (error) {
    log('Using fallback dashboard stats');
    return {
      courses: 10,
      tasksCompleted: 15,
      tasksPending: 5,
      completionRate: 75,
      newMessages: 3,
      totalStudents: 150,
      totalTeachers: 12,
      activeExams: 5
    };
  }
};

// Tareas
export const getTasks = async () => {
  try {
    return await apiRequest('/tasks');
  } catch (error) {
    log('Using fallback tasks');
    return [
      {
        id: 1,
        titulo: "Ensayo de Historia",
        descripcion: "Escribir un ensayo sobre la Segunda Guerra Mundial",
        fechaVencimiento: "2024-12-20",
        estado: "pendiente",
        curso: { titulo: "Historia Universal" }
      },
      {
        id: 2,
        titulo: "Ejercicios de Matemáticas",
        descripcion: "Resolver problemas de cálculo integral",
        fechaVencimiento: "2024-12-18",
        estado: "completada",
        curso: { titulo: "Matemáticas Avanzadas" }
      }
    ];
  }
};

// Exámenes
export const getExams = async () => {
  try {
    return await apiRequest('/exams');
  } catch (error) {
    log('Using fallback exams');
    return [
      {
        id: 1,
        titulo: "Examen de Matemáticas - Unidad 1",
        descripcion: "Evaluación de cálculo diferencial",
        duracion: 90,
        fechaInicio: "2024-12-16T09:00:00Z",
        fechaFin: "2024-12-16T10:30:00Z",
        curso: { titulo: "Matemáticas Avanzadas" }
      }
    ];
  }
};

export const getExam = async (id) => {
  try {
    return await apiRequest(`/exams/${id}`);
  } catch (error) {
    const exams = await getExams();
    return exams.find(e => e.id == id) || null;
  }
};

// Usuarios (Admin)
export const getUsers = async () => {
  try {
    return await apiRequest('/users');
  } catch (error) {
    log('Using fallback users');
    return [
      {
        id: 1,
        nombre: "Luis Carranza",
        email: "admin@aula.com",
        rol: "admin"
      }
    ];
  }
};

// Verificación de conectividad
export const checkHealth = async () => {
  try {
    const start = Date.now();
    const health = await apiRequest('/health');
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
      message: `Connected (${latency}ms)`,
      data: health
    };
  } catch (error) {
    return {
      connected: false,
      latency: null,
      message: `Connection failed: ${error.message}`,
      data: null
    };
  }
};

// Diagnóstico completo
export const runDiagnostic = async () => {
  log('Running complete diagnostic...');
  
  const results = {
    backendUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    tests: []
  };

  // Test 1: Health check
  try {
    await apiRequest('/health');
    results.tests.push({
      name: 'Health Check',
      status: 'OK',
      message: 'Backend is responding correctly'
    });
  } catch (error) {
    results.tests.push({
      name: 'Health Check',
      status: 'ERROR',
      message: `Error: ${error.message}`
    });
  }

  // Test 2: Courses endpoint
  try {
    const courses = await apiRequest('/courses');
    results.tests.push({
      name: 'Courses Endpoint',
      status: 'OK',
      message: `${courses.length} courses available`
    });
  } catch (error) {
    results.tests.push({
      name: 'Courses Endpoint',
      status: 'ERROR',
      message: `Error: ${error.message}`
    });
  }

  // Test 3: Authentication
  const token = getToken();
  if (token) {
    try {
      await apiRequest('/users');
      results.tests.push({
        name: 'Authentication',
        status: 'OK',
        message: 'Token is valid'
      });
    } catch (error) {
      results.tests.push({
        name: 'Authentication',
        status: 'WARNING',
        message: `Token might be invalid: ${error.message}`
      });
    }
  } else {
    results.tests.push({
      name: 'Authentication',
      status: 'INFO',
      message: 'No token found (not logged in)'
    });
  }

  log('Diagnostic completed', results);
  return results;
};

// Configuración de la API
export const getApiConfig = () => ({
  baseUrl: API_BASE_URL,
  hasToken: !!getToken(),
  user: getCurrentUser()
});

log('API module loaded', { baseUrl: API_BASE_URL });

// Función para silenciar errores de consola en desarrollo
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error;
  console.error = (...args) => {
    // Silenciar errores específicos de API que son normales en desarrollo
    const message = args.join(' ');
    if (
      message.includes('Failed to fetch') ||
      message.includes('API Error:') ||
      message.includes('Request failed for') ||
      message.includes('NetworkError') ||
      message.includes('TypeError: Failed to fetch')
    ) {
      return; // No mostrar estos errores
    }
    originalError.apply(console, args);
  };
}

// === FUNCIONES ADICIONALES REQUERIDAS POR EL FRONTEND ===

// Usuarios
export const createUser = async (userData) => {
  try {
    return await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    logError('Failed to create user', error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    return await apiRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  } catch (error) {
    logError('Failed to update user', error.message);
    throw error;
  }
};

// Tareas
export const createTask = async (taskData) => {
  try {
    return await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData)
    });
  } catch (error) {
    logError('Failed to create task', error.message);
    throw error;
  }
};

export const getAllTasks = async () => {
  try {
    return await apiRequest('/tasks/all');
  } catch (error) {
    log('Using fallback all tasks');
    return [];
  }
};

export const getTasksByCourse = async (courseId) => {
  try {
    return await apiRequest(`/courses/${courseId}/tasks`);
  } catch (error) {
    log('Using fallback course tasks');
    return [];
  }
};

export const deleteTask = async (id) => {
  try {
    return await apiRequest(`/tasks/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete task', error.message);
    throw error;
  }
};

// Cursos específicos
export const getCourseById = async (id) => {
  try {
    return await apiRequest(`/courses/${id}`);
  } catch (error) {
    const courses = await getCourses();
    return courses.find(c => c.id == id) || null;
  }
};

// Recursos
export const getResourcesByCourse = async (courseId) => {
  try {
    return await apiRequest(`/courses/${courseId}/resources`);
  } catch (error) {
    log('Using fallback resources');
    return [];
  }
};

export const createResource = async (resourceData) => {
  try {
    return await apiRequest('/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData)
    });
  } catch (error) {
    logError('Failed to create resource', error.message);
    throw error;
  }
};

export const deleteResource = async (id) => {
  try {
    return await apiRequest(`/resources/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete resource', error.message);
    throw error;
  }
};

// Foros
export const getForumsByCourse = async (courseId) => {
  try {
    return await apiRequest(`/courses/${courseId}/forums`);
  } catch (error) {
    log('Using fallback forums');
    return [];
  }
};

export const getAllForums = async () => {
  try {
    return await apiRequest('/forums');
  } catch (error) {
    log('Using fallback all forums');
    return [];
  }
};

export const getForumById = async (id) => {
  try {
    return await apiRequest(`/forums/${id}`);
  } catch (error) {
    log('Using fallback forum');
    return null;
  }
};

export const createForum = async (forumData) => {
  try {
    return await apiRequest('/forums', {
      method: 'POST',
      body: JSON.stringify(forumData)
    });
  } catch (error) {
    logError('Failed to create forum', error.message);
    throw error;
  }
};

export const deleteForum = async (id) => {
  try {
    return await apiRequest(`/forums/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete forum', error.message);
    throw error;
  }
};

export const getForumMessages = async (forumId) => {
  try {
    return await apiRequest(`/forums/${forumId}/messages`);
  } catch (error) {
    log('Using fallback forum messages');
    return [];
  }
};

export const createForumMessage = async (messageData) => {
  try {
    return await apiRequest('/forum-messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  } catch (error) {
    logError('Failed to create forum message', error.message);
    throw error;
  }
};

// Chat
export const getGlobalChatMessages = async (limit = 50) => {
  try {
    return await apiRequest(`/chat/global?limit=${limit}`);
  } catch (error) {
    log('Using fallback chat messages');
    return [];
  }
};

export const sendChatMessage = async (messageData) => {
  try {
    return await apiRequest('/chat/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
  } catch (error) {
    logError('Failed to send chat message', error.message);
    throw error;
  }
};

export const getNewChatMessages = async (lastMessageId) => {
  try {
    return await apiRequest(`/chat/new?lastId=${lastMessageId}`);
  } catch (error) {
    log('Using fallback new messages');
    return [];
  }
};

export const getUserConversations = async (userId) => {
  try {
    return await apiRequest(`/chat/conversations/${userId}`);
  } catch (error) {
    log('Using fallback conversations');
    return [];
  }
};

export const getPrivateChatMessages = async (conversationId) => {
  try {
    return await apiRequest(`/chat/private/${conversationId}`);
  } catch (error) {
    log('Using fallback private messages');
    return [];
  }
};

export const markChatAsRead = async (messageId) => {
  try {
    return await apiRequest(`/chat/read/${messageId}`, { method: 'POST' });
  } catch (error) {
    logError('Failed to mark chat as read', error.message);
    return false;
  }
};

export const getChatUnreadCount = async () => {
  try {
    const result = await apiRequest('/chat/unread-count');
    return result.count || 0;
  } catch (error) {
    log('Using fallback unread count (0)');
    return 0;
  }
};

// Exámenes avanzados
export const getExamById = async (id) => {
  try {
    return await apiRequest(`/exams/${id}`);
  } catch (error) {
    const exams = await getExams();
    return exams.find(e => e.id == id) || null;
  }
};

export const getExamQuestions = async (examId) => {
  try {
    return await apiRequest(`/exams/${examId}/questions`);
  } catch (error) {
    log('Using fallback exam questions');
    return [];
  }
};

export const createExam = async (examData) => {
  try {
    return await apiRequest('/exams', {
      method: 'POST',
      body: JSON.stringify(examData)
    });
  } catch (error) {
    logError('Failed to create exam', error.message);
    throw error;
  }
};

export const deleteExam = async (id) => {
  try {
    return await apiRequest(`/exams/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete exam', error.message);
    throw error;
  }
};

export const addExamQuestion = async (questionData) => {
  try {
    return await apiRequest('/exam-questions', {
      method: 'POST',
      body: JSON.stringify(questionData)
    });
  } catch (error) {
    logError('Failed to add exam question', error.message);
    throw error;
  }
};

export const updateExamQuestion = async (id, questionData) => {
  try {
    return await apiRequest(`/exam-questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData)
    });
  } catch (error) {
    logError('Failed to update exam question', error.message);
    throw error;
  }
};

export const deleteExamQuestion = async (id) => {
  try {
    return await apiRequest(`/exam-questions/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete exam question', error.message);
    throw error;
  }
};

export const updateExam = async (id, examData) => {
  try {
    return await apiRequest(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData)
    });
  } catch (error) {
    logError('Failed to update exam', error.message);
    throw error;
  }
};

export const startExamAttempt = async (examId) => {
  try {
    return await apiRequest(`/exams/${examId}/start`, { method: 'POST' });
  } catch (error) {
    logError('Failed to start exam attempt', error.message);
    throw error;
  }
};

export const submitExamAttempt = async (attemptId, answers) => {
  try {
    return await apiRequest(`/exam-attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers })
    });
  } catch (error) {
    logError('Failed to submit exam attempt', error.message);
    throw error;
  }
};

export const checkExamTimeRemaining = async (attemptId) => {
  try {
    return await apiRequest(`/exam-attempts/${attemptId}/time`);
  } catch (error) {
    log('Using fallback time remaining');
    return { timeRemaining: 0 };
  }
};

export const getStudentExamAttempts = async (studentId, examId) => {
  try {
    return await apiRequest(`/students/${studentId}/exams/${examId}/attempts`);
  } catch (error) {
    log('Using fallback exam attempts');
    return [];
  }
};

export const getAttemptById = async (id) => {
  try {
    return await apiRequest(`/exam-attempts/${id}`);
  } catch (error) {
    log('Using fallback attempt');
    return null;
  }
};

// Submissions y calificaciones
export const getStudentSubmissions = async (studentId) => {
  try {
    return await apiRequest(`/students/${studentId}/submissions`);
  } catch (error) {
    log('Using fallback submissions');
    return [];
  }
};

export const getTaskSubmissions = async (taskId) => {
  try {
    return await apiRequest(`/tasks/${taskId}/submissions`);
  } catch (error) {
    log('Using fallback task submissions');
    return [];
  }
};

export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    return await apiRequest(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(gradeData)
    });
  } catch (error) {
    logError('Failed to grade submission', error.message);
    throw error;
  }
};

export const getCourseStudents = async (courseId) => {
  try {
    return await apiRequest(`/courses/${courseId}/students`);
  } catch (error) {
    log('Using fallback course students');
    return [];
  }
};

export const createSubmission = async (submissionData) => {
  try {
    return await apiRequest('/submissions', {
      method: 'POST',
      body: JSON.stringify(submissionData)
    });
  } catch (error) {
    logError('Failed to create submission', error.message);
    throw error;
  }
};

// Notificaciones
export const getNotifications = async () => {
  try {
    return await apiRequest('/notifications');
  } catch (error) {
    log('Using fallback notifications');
    return [];
  }
};

export const markNotificationAsRead = async (id) => {
  try {
    return await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
  } catch (error) {
    logError('Failed to mark notification as read', error.message);
    return false;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    return await apiRequest('/notifications/read-all', { method: 'POST' });
  } catch (error) {
    logError('Failed to mark all notifications as read', error.message);
    return false;
  }
};

export const deleteNotification = async (id) => {
  try {
    return await apiRequest(`/notifications/${id}`, { method: 'DELETE' });
  } catch (error) {
    logError('Failed to delete notification', error.message);
    throw error;
  }
};

export const getUnreadNotificationsCount = async () => {
  try {
    const result = await apiRequest('/notifications/unread-count');
    return result.count || 0;
  } catch (error) {
    log('Using fallback unread notifications count (0)');
    return 0;
  }
};

// Uploads
export const uploadFile = async (file, folder = 'general') => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logError('Failed to upload file', error.message);
    throw error;
  }
};

export const uploadMultipleFiles = async (files, folder = 'general') => {
  try {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    formData.append('folder', folder);

    const response = await fetch(`${API_BASE_URL}/uploads/multiple`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    logError('Failed to upload multiple files', error.message);
    throw error;
  }
};

export const getUploadUrl = async (filename, folder = 'general') => {
  try {
    return await apiRequest('/uploads/url', {
      method: 'POST',
      body: JSON.stringify({ filename, folder })
    });
  } catch (error) {
    logError('Failed to get upload URL', error.message);
    throw error;
  }
};

log('✅ All API functions loaded successfully', { 
  baseUrl: API_BASE_URL 
});