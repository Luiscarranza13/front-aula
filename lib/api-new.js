// Nueva versión de API con URL hardcodeada para evitar problemas de caché
const API_BASE_URL = 'https://backend-aula-production.up.railway.app';

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

// Cursos
export const getCourses = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const getCourse = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Dashboard stats
export const getDashboardStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Tareas
export const getTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Exámenes
export const getExams = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const getExam = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/exams/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Usuarios
export const getUsers = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Recursos
export const getResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

// Foros
export const getForums = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/forums`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};

export const getForum = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/forums/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(response);
  } catch (error) {
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      throw new Error(`No se puede conectar con el servidor. Verifica que el backend esté corriendo en ${API_BASE_URL}`);
    }
    throw error;
  }
};