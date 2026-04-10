'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Obtener sesión activa al cargar
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await loadUserProfile(session);
      }
      setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await loadUserProfile(session);
      } else {
        setUser(null);
        setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (session) => {
    try {
      setToken(session.access_token);

      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', session.user.id)
        .single();

      const fullUser = { ...session.user, ...(profile || {}) };
      setUser(fullUser);

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(fullUser));
        localStorage.setItem('token', session.access_token);
      }
    } catch (e) {
      // Si falla cargar el perfil, igual dejamos al usuario logueado con los datos básicos
      setUser(session.user);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(session.user));
        localStorage.setItem('token', session.access_token);
      }
    }
  };

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', accessToken);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error al cerrar sesión:', e);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      router.push('/login');
    }
  };

  const updateUserData = async (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    // Sincronizar con Supabase
    if (user?.id) {
      await supabase.from('usuarios').update(newData).eq('id', user.id);
    }
  };

  const isAdmin = () => user?.rol === 'admin';
  const isProfesor = () => user?.rol === 'profesor' || user?.rol === 'docente';
  const isDocente = () => user?.rol === 'docente' || user?.rol === 'profesor';
  const isEstudiante = () => user?.rol === 'estudiante';
  const getToken = () => token;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin, isProfesor, isDocente, isEstudiante, updateUserData, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

