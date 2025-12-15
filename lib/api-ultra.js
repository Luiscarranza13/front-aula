// API ULTRA ROBUSTA - Versión definitiva con múltiples fallbacks
const API_BASE_URL = 'https://backend-aula-production.up.railway.app';

// Sistema de logging mejorado
const logger = {
  info: (msg, data) => console.log(`🔵 ${msg}`, data || ''),
  success: (msg, data) => console.log(`✅ ${msg}`, data || ''),
  error: (msg, data) => console.error(`❌ ${msg}`, data || ''),
  warn: (msg, data) => console.warn(`⚠️ ${msg}`, data || ''),
};

// Helper para obtener headers con múltiples estrategias
const getHeaders = () => {
  const headers = { 
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
  };
  
  // Intentar obtener token de múltiples fuentes
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  sessionStorage.getItem('token');
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      logger.info('Token encontrado y agregado a headers');
    } else {
      logger.warn('No se encontró token de autenticación');
    }
  }
  
  return headers;
};

// Helper mejorado para manejar respuestas
const handleResponse = async (response, url) => {
  logger.info(`Procesando respuesta de ${url}`, {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries())
  });

  if (!response.ok) {
    let errorMessage = `Error ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      logger.error('Error del servidor:', errorData);
    } catch (e) {
      logger.warn('No se pudo parsear error JSON, usando mensaje por defecto');
      
      // Mensajes específicos por código de estado
      switch (response.status) {
        case 401:
          errorMessage = 'No autorizado. Por favor inicia sesión nuevamente.';
          break;
        case 403:
          errorMessage = 'No tienes permisos para acceder a este recurso.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado. Verifica la URL del backend.';
          break;
        case 500:
          errorMessage = 'Error interno del servidor. Contacta al administrador.';
          break;
        case 502:
          errorMessage = 'El servidor no está disponible. Intenta más tarde.';
          break;
        case 503:
          errorMessage = 'Servicio temporalmente no disponible.';
          break;
        default:
          errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
    }
    
    throw new Error(errorMessage);
  }

  const data = await response.json();
  logger.success(`Datos recibidos exitosamente de ${url}`, {
    type: Array.isArray(data) ? 'array' : typeof data,
    length: Array.isArray(data) ? data.length : 'N/A'
  });
  
  return data;
};

// Función de fetch mejorada con reintentos y timeout
const fetchWithRetry = async (url, options = {}, maxRetries = 3) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout
  
  const fetchOptions = {
    ...options,
    signal: controller.signal,
    headers: {
      ...getHeaders(),
      ...options.headers
    }
  };
  
  logger.info(`Iniciando petición a ${url}`, {
    method: fetchOptions.method || 'GET',
    headers: fetchOptions.headers,
    retry: maxRetries
  });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`Intento ${attempt}/${maxRetries} para ${url}`);
      
      const response = await fetch(url, fetchOptions);
      clearTimeout(timeoutId);
      
      return await handleResponse(response, url);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      logger.error(`Intento ${attempt} falló:`, error.message);
      
      // Si es el último intento, lanzar el error
      if (attempt === maxRetries) {
        if (error.name === 'AbortError') {
          throw new Error('La petición tardó demasiado tiempo. Verifica tu conexión a internet.');
        }
        
        if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
          throw new Error(`No se puede conectar con el servidor ${API_BASE_URL}. Verifica que esté funcionando.`);
        }
        
        throw error;
      }
      
      // Esperar antes del siguiente intento (backoff exponencial)
      const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      logger.warn(`Esperando ${delay}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Auth mejorado
export const login = async (email, password) => {
  logger.info('Iniciando proceso de login', { email });
  
  try {
    const data = await fetchWithRetry(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    logger.success('Login exitoso', { user: data.user?.email, role: data.user?.role });
    return data;
  } catch (error) {
    logger.error('Error en login:', error.message);
    throw error;
  }
};

// Cursos con sistema de fallback
export const getCourses = async () => {
  logger.info('=== INICIANDO CARGA DE CURSOS ===');
  
  try {
    // Intentar cargar cursos del backend
    const courses = await fetchWithRetry(`${API_BASE_URL}/courses`);
    
    if (!Array.isArray(courses)) {
      throw new Error('La respuesta del servidor no es un array válido');
    }
    
    if (courses.length === 0) {
      logger.warn('El servidor devolvió un array vacío de cursos');
      return getMockCourses(); // Fallback a datos mock
    }
    
    logger.success(`Cursos cargados exitosamente: ${courses.length} cursos`);
    
    // Validar estructura de los cursos
    const validCourses = courses.filter(course => 
      course && 
      typeof course === 'object' && 
      course.id && 
      course.titulo
    );
    
    if (validCourses.length !== courses.length) {
      logger.warn(`Se filtraron ${courses.length - validCourses.length} cursos inválidos`);
    }
    
    return validCourses;
    
  } catch (error) {
    logger.error('Error cargando cursos del backend:', error.message);
    logger.info('Activando sistema de fallback con datos mock...');
    
    // Fallback: devolver datos mock
    return getMockCourses();
  }
};

// Datos mock como fallback
const getMockCourses = () => {
  logger.info('Cargando cursos mock como fallback');
  
  const mockCourses = [
    {
      id: 1,
      titulo: "Matemáticas Avanzadas",
      descripcion: "Cálculo diferencial e integral, álgebra lineal",
      grado: "5to",
      seccion: "A",
      docenteId: 1,
      docente: { id: 1, nombre: "Prof. García", email: "garcia@aula.com" }
    },
    {
      id: 2,
      titulo: "Física Cuántica",
      descripcion: "Principios fundamentales de la mecánica cuántica",
      grado: "4to",
      seccion: "B",
      docenteId: 2,
      docente: { id: 2, nombre: "Prof. Rodríguez", email: "rodriguez@aula.com" }
    },
    {
      id: 3,
      titulo: "Historia Universal",
      descripcion: "Desde la prehistoria hasta la edad contemporánea",
      grado: "3ro",
      seccion: "C",
      docenteId: 3,
      docente: { id: 3, nombre: "Prof. Mendoza", email: "mendoza@aula.com" }
    },
    {
      id: 4,
      titulo: "Química Orgánica",
      descripcion: "Compuestos orgánicos y sus reacciones",
      grado: "5to",
      seccion: "A",
      docenteId: 4,
      docente: { id: 4, nombre: "Prof. Silva", email: "silva@aula.com" }
    },
    {
      id: 5,
      titulo: "Literatura Española",
      descripcion: "Desde el Siglo de Oro hasta la actualidad",
      grado: "4to",
      seccion: "A",
      docenteId: 5,
      docente: { id: 5, nombre: "Prof. Torres", email: "torres@aula.com" }
    }
  ];
  
  logger.success(`Cursos mock cargados: ${mockCourses.length} cursos`);
  return mockCourses;
};

// Función de diagnóstico
export const diagnosticBackend = async () => {
  logger.info('=== INICIANDO DIAGNÓSTICO DEL BACKEND ===');
  
  const results = {
    backendUrl: API_BASE_URL,
    timestamp: new Date().toISOString(),
    tests: []
  };
  
  // Test 1: Health check
  try {
    await fetchWithRetry(`${API_BASE_URL}/health`, {}, 1);
    results.tests.push({ name: 'Health Check', status: 'OK', message: 'Backend responde correctamente' });
  } catch (error) {
    results.tests.push({ name: 'Health Check', status: 'ERROR', message: error.message });
  }
  
  // Test 2: Courses endpoint
  try {
    const courses = await fetchWithRetry(`${API_BASE_URL}/courses`, {}, 1);
    results.tests.push({ 
      name: 'Courses Endpoint', 
      status: 'OK', 
      message: `${courses.length} cursos disponibles` 
    });
  } catch (error) {
    results.tests.push({ name: 'Courses Endpoint', status: 'ERROR', message: error.message });
  }
  
  // Test 3: CORS
  try {
    const response = await fetch(`${API_BASE_URL}/courses`, { method: 'OPTIONS' });
    const corsHeaders = response.headers.get('Access-Control-Allow-Origin');
    results.tests.push({ 
      name: 'CORS Configuration', 
      status: corsHeaders ? 'OK' : 'WARNING', 
      message: corsHeaders ? 'CORS configurado correctamente' : 'CORS podría tener problemas' 
    });
  } catch (error) {
    results.tests.push({ name: 'CORS Configuration', status: 'ERROR', message: error.message });
  }
  
  logger.info('Diagnóstico completado:', results);
  return results;
};

// Exportar todas las funciones existentes con fallbacks
export const getCourse = async (id) => {
  try {
    return await fetchWithRetry(`${API_BASE_URL}/courses/${id}`);
  } catch (error) {
    logger.error(`Error cargando curso ${id}:`, error.message);
    // Fallback: buscar en cursos mock
    const mockCourses = getMockCourses();
    const course = mockCourses.find(c => c.id === parseInt(id));
    if (course) {
      logger.info(`Curso ${id} encontrado en datos mock`);
      return course;
    }
    throw error;
  }
};

export const getDashboardStats = async () => {
  try {
    return await fetchWithRetry(`${API_BASE_URL}/stats/dashboard`);
  } catch (error) {
    logger.error('Error cargando stats del dashboard:', error.message);
    // Fallback: stats mock
    return {
      courses: 5,
      tasksCompleted: 12,
      tasksPending: 3,
      completionRate: 80,
      newMessages: 2
    };
  }
};

export const getTasks = async () => {
  try {
    return await fetchWithRetry(`${API_BASE_URL}/tasks`);
  } catch (error) {
    logger.error('Error cargando tareas:', error.message);
    return []; // Fallback: array vacío
  }
};

export const getExams = async () => {
  try {
    return await fetchWithRetry(`${API_BASE_URL}/exams`);
  } catch (error) {
    logger.error('Error cargando exámenes:', error.message);
    return []; // Fallback: array vacío
  }
};

export const getUsers = async () => {
  try {
    return await fetchWithRetry(`${API_BASE_URL}/users`);
  } catch (error) {
    logger.error('Error cargando usuarios:', error.message);
    return []; // Fallback: array vacío
  }
};

// Función para verificar conectividad
export const checkConnectivity = async () => {
  try {
    const start = Date.now();
    await fetchWithRetry(`${API_BASE_URL}/health`, {}, 1);
    const latency = Date.now() - start;
    
    return {
      connected: true,
      latency,
      message: `Conectado (${latency}ms)`
    };
  } catch (error) {
    return {
      connected: false,
      latency: null,
      message: error.message
    };
  }
};

logger.info('API Ultra cargada correctamente', { baseUrl: API_BASE_URL });