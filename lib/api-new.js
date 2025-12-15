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

// Exportar todas las demás funciones del API original
export * from './api';