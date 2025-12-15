'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { login as apiLogin } from '@/lib/api-new';
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle2, XCircle, AlertCircle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    setMounted(true);
    // Cargar email guardado
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Validación de email en tiempo real
  useEffect(() => {
    if (email.length === 0) {
      setEmailValid(null);
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(email));
    }
  }, [email]);

  // Calcular fortaleza de contraseña
  useEffect(() => {
    if (password.length === 0) {
      setPasswordStrength(0);
      return;
    }
    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (passwordStrength <= 25) return 'Débil';
    if (passwordStrength <= 50) return 'Regular';
    if (passwordStrength <= 75) return 'Buena';
    return 'Fuerte';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiLogin(email, password);
      
      // Guardar email si "recordarme" está activo
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      // Guardar usuario y token
      login(data.user, data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado izquierdo - Imagen/Gradiente */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12 relative overflow-hidden">
        {/* Botón Ver Inicio - Desktop */}
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white transition-all text-sm font-medium">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">Ver Inicio</span>
        </Link>

        {/* Decoración sutil */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-slate-800 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-slate-800 rounded-full blur-3xl"></div>
        
        <div className={`max-w-md text-white relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl font-bold mb-6">Aula Virtual</h1>
          <p className="text-lg text-slate-300 mb-8">
            Plataforma educativa moderna para gestionar cursos, tareas y recursos de forma eficiente.
          </p>
          <div className="space-y-4">
            {[
              { icon: '📚', title: 'Gestión de Cursos', desc: 'Organiza y administra tus clases' },
              { icon: '✅', title: 'Tareas y Evaluaciones', desc: 'Seguimiento del progreso estudiantil' },
              { icon: '💬', title: 'Foros de Discusión', desc: 'Comunicación efectiva' },
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}
                style={{ transitionDelay: `${(idx + 1) * 200}ms` }}
              >
                <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{item.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white dark:bg-slate-900 relative">
        {/* Botón para ver inicio */}
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-sm font-medium">
          <ArrowLeft className="h-4 w-4" />
          <span>Ver Inicio</span>
        </Link>

        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Logo móvil */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Aula Virtual</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Plataforma Educativa</p>
          </div>

          {/* Título */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar Sesión</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white dark:bg-slate-800 dark:text-white text-sm ${
                    emailValid === false ? 'border-red-300' : emailValid === true ? 'border-green-300' : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="correo@ejemplo.com"
                />
                {emailValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValid ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {emailValid === false && email.length > 0 && (
                <p className="text-xs text-red-500">Ingresa un email válido</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all bg-white dark:bg-slate-800 dark:text-white text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Recordarme y Olvidé contraseña */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Recordarme
                </span>
              </label>
              <a href="#" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={loading || emailValid === false}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>

            {/* Credenciales de prueba */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Credenciales de prueba:</p>
              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <p>Admin: admin@aula.com / admin123</p>
                <p>Docente: docente@test.com / admin123</p>
                <p>Estudiante: estudiante@test.com / admin123</p>
              </div>
            </div>
          </form>

          {/* Registro */}
          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-slate-900 dark:text-white hover:underline">
              Regístrate aquí
            </Link>
          </p>

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400">
            © 2025 Aula Virtual. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </div>
  );
}
