'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  Eye,
  EyeOff,
  Home,
  LayoutDashboard,
  Loader2,
  Lock,
  Mail,
  MessageSquare,
  Shield,
  Sparkles,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { login as apiLogin } from '@/lib/api';

const DEMO_ACCOUNTS = [
  {
    label: 'Admin',
    description: 'Acceso total al panel y usuarios',
    email: 'admin@aula.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    label: 'Docente',
    description: 'Gestion de cursos, tareas y examenes',
    email: 'docente@test.com',
    password: 'admin123',
    role: 'docente',
  },
  {
    label: 'Estudiante',
    description: 'Cursos, tareas y seguimiento academico',
    email: 'estudiante@test.com',
    password: 'admin123',
    role: 'estudiante',
  },
];

const LOGIN_FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Panel administrativo operativo',
    description: 'Gestiona cursos, recursos, foros, usuarios y evaluaciones desde un solo lugar.',
  },
  {
    icon: ClipboardList,
    title: 'Flujos academicos centralizados',
    description: 'Tareas, entregas, calificaciones y reportes conectados con los datos reales.',
  },
  {
    icon: MessageSquare,
    title: 'Comunicacion continua',
    description: 'Foros y chat listos para la coordinacion entre estudiantes, docentes y admin.',
  },
];

const ACCESS_CARDS = [
  { icon: Shield, title: 'Administrador', detail: 'Usuarios, cursos, reportes y configuracion' },
  { icon: BookOpen, title: 'Docente', detail: 'Contenido, examenes y seguimiento del aula' },
  { icon: Sparkles, title: 'Estudiante', detail: 'Aprendizaje, entregas y progreso' },
];

const getRedirectPath = (role) => {
  if (role === 'admin' || role === 'docente' || role === 'profesor') {
    return '/admin/courses';
  }

  return '/dashboard';
};

const getPasswordMeta = (password) => {
  if (!password) {
    return { score: 0, label: 'Sin evaluar', color: 'bg-slate-200' };
  }

  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 8) score += 25;
  if (/[A-Z]/.test(password)) score += 25;
  if (/[0-9]/.test(password)) score += 25;

  if (score <= 25) return { score, label: 'Debil', color: 'bg-red-500' };
  if (score <= 50) return { score, label: 'Regular', color: 'bg-orange-500' };
  if (score <= 75) return { score, label: 'Buena', color: 'bg-yellow-500' };

  return { score, label: 'Fuerte', color: 'bg-green-500' };
};

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [emailValid, setEmailValid] = useState(null);

  const passwordMeta = getPasswordMeta(password);

  useEffect(() => {
    setMounted(true);

    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace(getRedirectPath(user.rol));
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!email) {
      setEmailValid(null);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(email));
  }, [email]);

  const fillDemoAccount = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiLogin(email, password);

      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      login(data.user, data.access_token);
      router.push(getRedirectPath(data.user?.rol));
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)]" />
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center justify-between">
              <Image
                src="/logo-novatec.jpeg"
                alt="Novatec Academy"
                width={220}
                height={66}
                className="h-14 w-auto rounded-2xl object-contain"
              />

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white/15"
              >
                <ArrowLeft className="h-4 w-4" />
                <Home className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>

            <div className={`max-w-2xl transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-4 w-4" />
                Acceso unificado
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-[1.02] tracking-tight text-white xl:text-6xl">
                Entra al aula y controla toda la operacion academica.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
                El acceso ahora dirige a cada usuario a su flujo correcto y deja listo el panel administrativo
                para gestionar cursos, usuarios, contenido y seguimiento del aprendizaje.
              </p>

              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {ACCESS_CARDS.map((card) => (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/30 backdrop-blur"
                  >
                    <div className="mb-3 inline-flex rounded-xl bg-white/10 p-3 text-white">
                      <card.icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-base font-semibold text-white">{card.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-300">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {LOGIN_FEATURES.map((item, index) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition-all duration-700 ${
                    mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="mb-3 inline-flex rounded-xl bg-white/10 p-3 text-cyan-200">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-slate-50 px-6 py-10 sm:px-8 lg:px-10">
          <Link
            href="/"
            className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Ver inicio
          </Link>

          <div className={`w-full max-w-xl transition-all duration-700 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)] sm:p-8">
              <div className="mb-8">
                <div className="mb-5 flex items-center gap-3 lg:hidden">
                  <Image
                    src="/logo-novatec.jpeg"
                    alt="Novatec Academy"
                    width={180}
                    height={54}
                    className="h-12 w-auto object-contain"
                  />
                </div>

                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                  <Shield className="h-3.5 w-3.5" />
                  Acceso seguro
                </div>
                <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">Iniciar sesion</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Ingresa con tu cuenta para abrir el panel correcto segun tu rol.
                </p>
              </div>

              <div className="mb-6 grid gap-3 sm:grid-cols-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.label}
                    type="button"
                    onClick={() => fillDemoAccount(account)}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-slate-300 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{account.label}</span>
                      <span className="rounded-full bg-slate-900 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                        demo
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">{account.description}</p>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Correo electronico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      placeholder="correo@ejemplo.com"
                      className={`w-full rounded-2xl border bg-white py-3 pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 ${
                        emailValid === false
                          ? 'border-red-300'
                          : emailValid === true
                          ? 'border-green-300'
                          : 'border-slate-200'
                      }`}
                    />
                    {emailValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {emailValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  {emailValid === false && <p className="text-xs text-red-500">Ingresa un correo valido.</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {password.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-600">Fortaleza</span>
                        <span className="font-semibold text-slate-900">{passwordMeta.label}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full transition-all ${passwordMeta.color}`}
                          style={{ width: `${passwordMeta.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Recordarme
                  </label>

                  <span className="text-xs font-medium text-slate-400">Recuperacion proxima</span>
                </div>

                <button
                  type="submit"
                  disabled={loading || emailValid === false}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Iniciando sesion...
                    </>
                  ) : (
                    'Entrar al aula'
                  )}
                </button>
              </form>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Credenciales demo</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  {DEMO_ACCOUNTS.map((account) => (
                    <div key={`${account.label}-credentials`} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-slate-900">{account.label}</span>
                      <span className="text-xs sm:text-sm">
                        {account.email} / {account.password}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="font-semibold text-slate-900 hover:underline">
                  Registrate aqui
                </Link>
              </p>

              <p className="mt-8 text-center text-xs text-slate-400">© 2026 Novatec Academy. Todos los derechos reservados.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
