const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Helper para obtener headers con token
const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper para manejar respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    try {
      const error = await response.json();
      errorMessage = error.message || error.error || errorMessage;
    } catch (e) {
      // Si no se puede parsear el JSON, usar mensaje por defecto
      if (response.status === 500) {
        errorMessage = 'El servidor tiene un error. El backend necesita ser reparado. Contacta al administrador.';
      } else if (response.status === 401) {
        errorMessage = 'No autorizado. Inicia sesión nuevamente.';
      } else if (response.status === 403) {
        errorMessage = 'No tienes permisos para realizar esta acción.';
      } else if (response.status === 404) {
        errorMessage = 'Recurso no encontrado. Verifica la URL del backend.';
      }
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

// Auth
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  } catch (error) {
    // Si hay error de red (backend no disponible)
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Users
export const getUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createUser = async (data) => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateUser = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteUser = async (id) => {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// Courses
export const getCourses = async () => {
  const response = await fetch(`${API_BASE_URL}/courses`);
  return handleResponse(response);
};

export const getCourseById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`);
  return handleResponse(response);
};

export const createCourse = async (data) => {
  const response = await fetch(`${API_BASE_URL}/courses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateCourse = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteCourse = async (id) => {
  const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Tasks
export const getTasksByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/tasks?courseId=${courseId}`);
  return handleResponse(response);
};

export const createTask = async (data) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Resources
export const getResourcesByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/resources?courseId=${courseId}`);
  return handleResponse(response);
};

export const createResource = async (data) => {
  const response = await fetch(`${API_BASE_URL}/resources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Forums
export const getForumsByCourse = async (courseId) => {
  const response = await fetch(`${API_BASE_URL}/forums?courseId=${courseId}`);
  return handleResponse(response);
};

export const getForumById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/forums/${id}`);
  return handleResponse(response);
};

export const createForum = async (data) => {
  const response = await fetch(`${API_BASE_URL}/forums`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Forum Messages
export const getForumMessages = async (forumId) => {
  const response = await fetch(`${API_BASE_URL}/forum-messages?forumId=${forumId}`);
  return handleResponse(response);
};

export const createForumMessage = async (forumId, data) => {
  const response = await fetch(`${API_BASE_URL}/forum-messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, forumId }),
  });
  return handleResponse(response);
};

// Tasks - CRUD completo
export const getAllTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  return handleResponse(response);
};

export const getTaskById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`);
  return handleResponse(response);
};

export const updateTask = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteTask = async (id) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Resources - CRUD completo
export const getAllResources = async () => {
  const response = await fetch(`${API_BASE_URL}/resources`);
  return handleResponse(response);
};

export const getResourceById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`);
  return handleResponse(response);
};

export const updateResource = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteResource = async (id) => {
  const response = await fetch(`${API_BASE_URL}/resources/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Forums - CRUD completo
export const getAllForums = async () => {
  const response = await fetch(`${API_BASE_URL}/forums`);
  return handleResponse(response);
};

export const updateForum = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/forums/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteForum = async (id) => {
  const response = await fetch(`${API_BASE_URL}/forums/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Utility function para búsqueda
export const searchCourses = async (query) => {
  const response = await fetch(`${API_BASE_URL}/courses?search=${encodeURIComponent(query)}`);
  return handleResponse(response);
};

export const searchUsers = async (query) => {
  const response = await fetch(`${API_BASE_URL}/users?search=${encodeURIComponent(query)}`);
  return handleResponse(response);
};


// ============ STATS API ============
export const getStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats`);
  return handleResponse(response);
};

export const getDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/dashboard`);
  return handleResponse(response);
};

export const getWeeklyActivity = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/weekly-activity`);
  return handleResponse(response);
};

export const getTaskDistribution = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/task-distribution`);
  return handleResponse(response);
};

export const getMonthlyProgress = async () => {
  const response = await fetch(`${API_BASE_URL}/stats/monthly-progress`);
  return handleResponse(response);
};

// ============ UPLOADS API ============
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/uploads/single`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const uploadMultipleFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}/uploads/multiple`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

export const deleteUploadedFile = async (filename) => {
  const response = await fetch(`${API_BASE_URL}/uploads/${filename}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const getUploadUrl = (filename) => {
  return `${API_BASE_URL}/uploads/${filename}`;
};

// ============ HELPER FUNCTIONS ============
export const API_URL = API_BASE_URL;

// ============ ENROLLMENTS API ============
export const getEnrollments = async (estudianteId, cursoId) => {
  const params = new URLSearchParams();
  if (estudianteId) params.append('estudianteId', estudianteId);
  if (cursoId) params.append('cursoId', cursoId);
  const response = await fetch(`${API_BASE_URL}/enrollments?${params}`);
  return handleResponse(response);
};

export const createEnrollment = async (data) => {
  const response = await fetch(`${API_BASE_URL}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteEnrollment = async (id) => {
  const response = await fetch(`${API_BASE_URL}/enrollments/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

export const getStudentCourses = async (estudianteId) => {
  const response = await fetch(`${API_BASE_URL}/enrollments/student/${estudianteId}/courses`);
  return handleResponse(response);
};

export const getCourseStudents = async (cursoId) => {
  const response = await fetch(`${API_BASE_URL}/enrollments/course/${cursoId}/students`);
  return handleResponse(response);
};

// ============ SUBMISSIONS API ============
export const getSubmissions = async (tareaId, estudianteId) => {
  const params = new URLSearchParams();
  if (tareaId) params.append('tareaId', tareaId);
  if (estudianteId) params.append('estudianteId', estudianteId);
  const response = await fetch(`${API_BASE_URL}/submissions?${params}`);
  return handleResponse(response);
};

export const createSubmission = async (data) => {
  const response = await fetch(`${API_BASE_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getTaskSubmissions = async (tareaId) => {
  const response = await fetch(`${API_BASE_URL}/submissions/task/${tareaId}`);
  return handleResponse(response);
};

export const getStudentSubmissions = async (estudianteId) => {
  const response = await fetch(`${API_BASE_URL}/submissions/student/${estudianteId}`);
  return handleResponse(response);
};

export const gradeSubmission = async (id, calificacion, comentario) => {
  const response = await fetch(`${API_BASE_URL}/submissions/${id}/grade`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calificacion, comentario }),
  });
  return handleResponse(response);
};

// ============ NOTIFICATIONS API ============
export const getNotifications = async (usuarioId, leida) => {
  const params = new URLSearchParams();
  if (usuarioId) params.append('usuarioId', usuarioId);
  if (leida !== undefined) params.append('leida', leida);
  const response = await fetch(`${API_BASE_URL}/notifications?${params}`);
  return handleResponse(response);
};

export const getUnreadNotificationsCount = async (usuarioId) => {
  const response = await fetch(`${API_BASE_URL}/notifications/unread-count/${usuarioId}`);
  return handleResponse(response);
};

export const markNotificationAsRead = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const markAllNotificationsAsRead = async (usuarioId) => {
  const response = await fetch(`${API_BASE_URL}/notifications/read-all/${usuarioId}`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const deleteNotification = async (id) => {
  const response = await fetch(`${API_BASE_URL}/notifications/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};


// ============ CHAT API ============
export const sendChatMessage = async (data) => {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getGlobalChatMessages = async (limit = 50, afterId) => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (afterId) params.append('afterId', afterId);
  const response = await fetch(`${API_BASE_URL}/chat/global?${params}`);
  return handleResponse(response);
};

export const getPrivateChatMessages = async (userId1, userId2, limit = 50) => {
  const response = await fetch(`${API_BASE_URL}/chat/private/${userId1}/${userId2}?limit=${limit}`);
  return handleResponse(response);
};

export const getGroupChatMessages = async (grupoId, limit = 50) => {
  const response = await fetch(`${API_BASE_URL}/chat/group/${grupoId}?limit=${limit}`);
  return handleResponse(response);
};

export const getUserConversations = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/${userId}`);
  return handleResponse(response);
};

export const markChatAsRead = async (userId, otherUserId) => {
  const response = await fetch(`${API_BASE_URL}/chat/read/${userId}/${otherUserId}`, {
    method: 'PATCH',
  });
  return handleResponse(response);
};

export const getChatUnreadCount = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/chat/unread/${userId}`);
  return handleResponse(response);
};

export const getNewChatMessages = async (afterId, tipo = 'global', grupoId) => {
  const params = new URLSearchParams();
  params.append('afterId', afterId);
  params.append('tipo', tipo);
  if (grupoId) params.append('grupoId', grupoId);
  const response = await fetch(`${API_BASE_URL}/chat/new?${params}`);
  return handleResponse(response);
};

// ============ EXAMS API ============
export const createExam = async (data) => {
  const response = await fetch(`${API_BASE_URL}/exams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getExams = async (cursoId) => {
  const params = cursoId ? `?cursoId=${cursoId}` : '';
  const response = await fetch(`${API_BASE_URL}/exams${params}`);
  return handleResponse(response);
};

export const getExamById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`);
  return handleResponse(response);
};

export const updateExam = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteExam = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Questions
export const addExamQuestion = async (examId, data) => {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getExamQuestions = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/questions`);
  return handleResponse(response);
};

export const updateExamQuestion = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/exams/questions/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteExamQuestion = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exams/questions/${id}`, {
    method: 'DELETE',
  });
  return handleResponse(response);
};

// Attempts
export const startExamAttempt = async (examId, estudianteId) => {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estudianteId }),
  });
  return handleResponse(response);
};

export const submitExamAttempt = async (attemptId, respuestas) => {
  const response = await fetch(`${API_BASE_URL}/exams/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ respuestas }),
  });
  return handleResponse(response);
};

export const getStudentExamAttempts = async (estudianteId, examId) => {
  const params = examId ? `?examId=${examId}` : '';
  const response = await fetch(`${API_BASE_URL}/exams/attempts/student/${estudianteId}${params}`);
  return handleResponse(response);
};

export const getExamAttempts = async (examId) => {
  const response = await fetch(`${API_BASE_URL}/exams/${examId}/attempts`);
  return handleResponse(response);
};

export const getAttemptById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/exams/attempts/${id}`);
  return handleResponse(response);
};

export const checkExamTimeRemaining = async (attemptId) => {
  const response = await fetch(`${API_BASE_URL}/exams/attempts/${attemptId}/time`);
  return handleResponse(response);
};

// ============ ATTENDANCE API ============
export const getAttendance = async (cursoId, estudianteId, fecha) => {
  const params = new URLSearchParams();
  if (cursoId) params.append('cursoId', cursoId);
  if (estudianteId) params.append('estudianteId', estudianteId);
  if (fecha) params.append('fecha', fecha);
  const response = await fetch(`${API_BASE_URL}/attendance?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createAttendance = async (data) => {
  const response = await fetch(`${API_BASE_URL}/attendance`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getAttendanceStats = async (cursoId, estudianteId) => {
  const params = estudianteId ? `?estudianteId=${estudianteId}` : '';
  const response = await fetch(`${API_BASE_URL}/attendance/stats/${cursoId}${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateAttendance = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAttendance = async (id) => {
  const response = await fetch(`${API_BASE_URL}/attendance/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ============ ANNOUNCEMENTS API ============
export const getAnnouncements = async (cursoId, activo) => {
  const params = new URLSearchParams();
  if (cursoId) params.append('cursoId', cursoId);
  if (activo !== undefined) params.append('activo', activo);
  const response = await fetch(`${API_BASE_URL}/announcements?${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createAnnouncement = async (data) => {
  const response = await fetch(`${API_BASE_URL}/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const updateAnnouncement = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteAnnouncement = async (id) => {
  const response = await fetch(`${API_BASE_URL}/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ============ GROUPS API ============
export const getGroups = async (cursoId) => {
  const params = cursoId ? `?cursoId=${cursoId}` : '';
  const response = await fetch(`${API_BASE_URL}/groups${params}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createGroup = async (data) => {
  const response = await fetch(`${API_BASE_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const addGroupMember = async (groupId, userId) => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

export const removeGroupMember = async (groupId, userId) => {
  const response = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateGroup = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteGroup = async (id) => {
  const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ============ BADGES API ============
export const getBadges = async () => {
  const response = await fetch(`${API_BASE_URL}/badges`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const getUserBadges = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/badges/user/${userId}`, {
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const createBadge = async (data) => {
  const response = await fetch(`${API_BASE_URL}/badges`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const awardBadge = async (badgeId, userId) => {
  const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/award`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse(response);
};

export const revokeBadge = async (badgeId, userId) => {
  const response = await fetch(`${API_BASE_URL}/badges/${badgeId}/revoke/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};

export const updateBadge = async (id, data) => {
  const response = await fetch(`${API_BASE_URL}/badges/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const deleteBadge = async (id) => {
  const response = await fetch(`${API_BASE_URL}/badges/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(response);
};
