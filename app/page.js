'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  BookOpen, Users, Award, BarChart3, Shield, Laptop,
  ArrowRight, Star, Menu, X, Play, CheckCircle2,
  Zap, Globe, ChevronRight
} from 'lucide-react';

const getHomePathForRole = (role) => {
  if (role === 'admin' || role === 'docente' || role === 'profesor') {
    return '/admin/courses';
  }

  return '/dashboard';
};

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [featIdx, setFeatIdx] = useState(0);

  // Auto-avance del carrusel
  useEffect(() => {
    const t = setInterval(() => setFeatIdx(i => (i + 1) % 6), 1500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!loading && user) router.push(getHomePathForRole(user.rol));
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: BookOpen, title: 'Gestión de Cursos', desc: 'Organiza contenido educativo con herramientas intuitivas. Crea, edita y publica cursos en minutos.', color: 'from-blue-500 to-blue-600' },
    { icon: Users, title: 'Colaboración', desc: 'Foros de discusión y chat en tiempo real para una comunicación efectiva entre docentes y estudiantes.', color: 'from-violet-500 to-violet-600' },
    { icon: Award, title: 'Evaluaciones', desc: 'Sistema completo de tareas, exámenes y calificaciones con seguimiento detallado del progreso.', color: 'from-amber-500 to-orange-500' },
    { icon: BarChart3, title: 'Reportes', desc: 'Estadísticas detalladas y reportes de rendimiento académico en tiempo real.', color: 'from-emerald-500 to-green-600' },
    { icon: Shield, title: 'Seguridad', desc: 'Protección de datos con los más altos estándares. Acceso controlado por roles.', color: 'from-rose-500 to-red-600' },
    { icon: Laptop, title: 'Multiplataforma', desc: 'Accede desde cualquier dispositivo. Experiencia optimizada en móvil, tablet y escritorio.', color: 'from-cyan-500 to-sky-600' },
  ];

  const stats = [
    { value: '10,000+', label: 'Estudiantes activos', icon: Users },
    { value: '500+', label: 'Cursos disponibles', icon: BookOpen },
    { value: '98%', label: 'Satisfacción', icon: Star },
    { value: '24/7', label: 'Soporte disponible', icon: Zap },
  ];

  const testimonials = [
    { name: 'María García', role: 'Directora Académica', text: 'Ha transformado completamente la manera en que gestionamos nuestra institución educativa. Resultados increíbles.', company: 'Instituto Tecnológico', initial: 'MG' },
    { name: 'Carlos López', role: 'Profesor', text: 'La plataforma más completa y fácil de usar que he encontrado. Mis estudiantes están más comprometidos que nunca.', company: 'Universidad Central', initial: 'CL' },
    { name: 'Ana Martínez', role: 'Coordinadora', text: 'El soporte técnico es excepcional y las actualizaciones constantes demuestran que realmente escuchan a sus usuarios.', company: 'Colegio San José', initial: 'AM' },
  ];

  const plans = [
    { name: 'Básico', price: 'Gratis', desc: 'Perfecto para empezar', features: ['Hasta 30 estudiantes', '5 cursos', 'Foros básicos', 'Soporte por email'], cta: 'Comenzar Gratis', highlight: false },
    { name: 'Pro', price: '$29', period: '/mes', desc: 'Para instituciones en crecimiento', features: ['Estudiantes ilimitados', 'Cursos ilimitados', 'Chat en tiempo real', 'Reportes avanzados', 'Soporte prioritario'], cta: 'Comenzar Ahora', highlight: true },
    { name: 'Enterprise', price: 'Custom', desc: 'Para grandes instituciones', features: ['Todo lo de Pro', 'API personalizada', 'SSO / LDAP', 'SLA garantizado', 'Gerente de cuenta'], cta: 'Contactar Ventas', highlight: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <Image src="/logo-novatec.jpeg" alt="Novatec Academy" width={200} height={60} priority className="h-12 md:h-14 w-auto object-contain" />

            <div className="hidden lg:flex items-center gap-8">
              {['#caracteristicas', '#como-funciona', '#testimonios', '#precios'].map((href, i) => (
                <a key={i} href={href} className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                  {['Características', 'Cómo funciona', 'Testimonios', 'Precios'][i]}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-slate-900 hover:bg-slate-700 text-white font-medium px-5 rounded-xl shadow-md hover:shadow-lg transition-all">
                  Comenzar Gratis <ArrowRight className="ml-1.5 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <button className="lg:hidden p-2 text-slate-600 rounded-lg hover:bg-slate-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl">
            <div className="px-4 py-6 space-y-2">
              {['#caracteristicas', '#como-funciona', '#testimonios', '#precios'].map((href, i) => (
                <a key={i} href={href} onClick={() => setMobileMenuOpen(false)}
                  className="block text-slate-700 hover:text-slate-900 hover:bg-slate-50 py-2.5 px-3 rounded-lg font-medium transition-colors">
                  {['Características', 'Cómo funciona', 'Testimonios', 'Precios'][i]}
                </a>
              ))}
              <div className="pt-4 space-y-2 border-t border-slate-100">
                <Link href="/login" className="block"><Button variant="outline" className="w-full rounded-xl">Iniciar Sesión</Button></Link>
                <Link href="/register" className="block"><Button className="w-full bg-slate-900 hover:bg-slate-800 rounded-xl">Comenzar Gratis</Button></Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <section className="relative pt-28 lg:pt-36 pb-20 lg:pb-32 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 -z-10" />
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-50 to-transparent rounded-full blur-3xl -z-10 opacity-70" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-violet-50 to-transparent rounded-full blur-3xl -z-10 opacity-60" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold mb-8 shadow-lg">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                Plataforma Educativa #1 en Latinoamérica
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-6">
                Educación
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">
                  sin límites
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Gestiona cursos, tareas, evaluaciones y comunicación en una sola plataforma diseñada para instituciones que buscan excelencia.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start mb-12">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 bg-slate-900 hover:bg-slate-700 text-white text-base font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="h-14 px-8 border-slate-200 text-slate-700 hover:bg-slate-50 text-base font-semibold rounded-2xl hover:border-slate-300 transition-all">
                    <Play className="mr-2 w-4 h-4 fill-slate-700" />
                    Ver Demo
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 justify-center lg:justify-start">
                <div className="flex -space-x-3">
                  {['MG', 'CL', 'AM', 'JP'].map((init, i) => (
                    <div key={i} className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold shadow-md ${['bg-blue-500','bg-violet-500','bg-emerald-500','bg-amber-500'][i]}`}>
                      {init}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
                  </div>
                  <p className="text-xs text-slate-500"><span className="font-semibold text-slate-700">10,000+</span> estudiantes activos</p>
                </div>
              </div>
            </div>

            {/* Right — Dashboard mockup */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 to-violet-100 rounded-3xl blur-2xl opacity-50" />
              <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                {/* Browser bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="bg-white rounded-lg px-3 py-1 text-xs text-slate-400 text-center max-w-xs mx-auto border border-slate-200">
                      <span className="inline-flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500 inline" /> novatec-aula.edu</span>
                    </div>
                  </div>
                </div>
                {/* Mock dashboard */}
                <div className="p-5 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-3 w-32 bg-slate-800 rounded-full mb-1.5"></div>
                      <div className="h-2 w-20 bg-slate-300 rounded-full"></div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-500"></div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['bg-blue-500','12','Cursos'],['bg-violet-500','8','Tareas'],['bg-emerald-500','94%','Promedio']].map(([color, val, label], i) => (
                      <div key={i} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                        <div className={`w-7 h-7 rounded-lg ${color} mb-2`}></div>
                        <div className="text-lg font-bold text-slate-800">{val}</div>
                        <div className="text-xs text-slate-400">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="h-2.5 w-24 bg-slate-200 rounded-full"></div>
                      <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                    </div>
                    {[80, 65, 90].map((w, i) => (
                      <div key={i} className="flex items-center gap-3 mb-2">
                        <div className="w-6 h-6 rounded bg-slate-100"></div>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r from-blue-500 to-violet-500`} style={{width:`${w}%`}}></div>
                        </div>
                        <div className="text-xs text-slate-400 w-8">{w}%</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-3 text-white">
                      <div className="text-xs text-slate-400 mb-1">Próximo examen</div>
                      <div className="text-sm font-semibold">Matemáticas</div>
                      <div className="text-xs text-blue-400 mt-1">En 2 días</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm">
                      <div className="text-xs text-slate-400 mb-1">Mensajes</div>
                      <div className="text-sm font-semibold text-slate-800">3 nuevos</div>
                      <div className="text-xs text-emerald-500 mt-1">Sin leer</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">Tarea entregada</div>
                  <div className="text-xs text-slate-400">hace 2 min</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-800">+24 estudiantes</div>
                  <div className="text-xs text-slate-400">esta semana</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-900" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 mb-4 group-hover:bg-white/20 transition-colors">
                  <stat.icon className="w-6 h-6 text-white/80" />
                </div>
                <div className="text-3xl lg:text-4xl font-extrabold text-white mb-1 tracking-tight">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES CAROUSEL ── */}
      <section id="caracteristicas" className="py-24 lg:py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" /> Características
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Todo en una sola plataforma
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Herramientas completas para gestionar tu institución educativa de manera eficiente
            </p>
          </div>

          {/* Carrusel infinito automático */}
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${featIdx * (100 / 3)}%)` }}
            >
              {[...features, ...features].map((feature, i) => (
                <div key={i} className="w-1/3 flex-shrink-0 px-3">
                  <div className="group p-7 rounded-2xl border border-slate-100 bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full cursor-default">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                      Saber más <ChevronRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="como-funciona" className="py-24 lg:py-32 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-slate-200 to-transparent hidden lg:block" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold mb-4">
              <Play className="w-3.5 h-3.5 fill-slate-600" /> Cómo funciona
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Comienza en 3 pasos
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Configurar tu aula virtual es rápido, sencillo y sin tarjeta de crédito
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              { step: '01', title: 'Crea tu cuenta', desc: 'Regístrate gratis en menos de 2 minutos y configura tu perfil institucional.', icon: Users, color: 'from-blue-500 to-blue-600' },
              { step: '02', title: 'Configura tus cursos', desc: 'Añade cursos, sube materiales, crea evaluaciones y asigna docentes.', icon: BookOpen, color: 'from-violet-500 to-violet-600' },
              { step: '03', title: 'Invita y enseña', desc: 'Agrega estudiantes con un enlace y comienza a transformar la educación.', icon: Globe, color: 'from-emerald-500 to-green-600' },
            ].map((item, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 border border-slate-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
                <div className="flex items-center gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform flex-shrink-0`}>
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-5xl font-black text-slate-400 leading-none select-none">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 bg-slate-900 hover:bg-slate-700 text-white text-base font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5">
                Empezar ahora — es gratis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonios" className="py-24 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
              <Star className="w-3.5 h-3.5 fill-amber-500" /> Testimonios
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Miles de instituciones ya transformaron su educación con Novatec
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="relative p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                <div className="flex items-center gap-1 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-slate-700 leading-relaxed flex-1 mb-6 text-[15px]">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-5 border-t border-slate-200">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {t.initial}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs">{t.role} · {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="precios" className="py-24 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200 text-slate-600 text-xs font-semibold mb-4">
              <CheckCircle2 className="w-3.5 h-3.5" /> Precios
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
              Planes para cada institución
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Sin sorpresas. Sin contratos. Cancela cuando quieras.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlight
                  ? 'bg-slate-900 text-white shadow-2xl scale-105 border-0'
                  : 'bg-white border border-slate-200 hover:shadow-xl hover:-translate-y-1'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                    MÁS POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                  <p className={`text-sm mb-4 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.desc}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-5xl font-extrabold tracking-tight ${plan.highlight ? 'text-white' : 'text-slate-900'}`}>{plan.price}</span>
                    {plan.period && <span className={`text-sm mb-2 ${plan.highlight ? 'text-slate-400' : 'text-slate-500'}`}>{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-emerald-500'}`} />
                      <span className={plan.highlight ? 'text-slate-300' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.name === 'Enterprise' ? '#' : '/register'}>
                  <Button className={`w-full h-12 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-lg'
                      : 'bg-slate-900 hover:bg-slate-700 text-white'
                  }`}>
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 lg:py-32 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/50 via-slate-900 to-slate-900" />
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-900/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-900/30 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-8">
            <Zap className="w-3.5 h-3.5 text-yellow-400" /> Únete hoy mismo
          </div>
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
            ¿Listo para transformar<br />tu institución?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Únete a miles de instituciones que ya están mejorando su educación. Configura tu aula en menos de 5 minutos.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Link href="/register">
              <Button size="lg" className="h-14 px-10 bg-white text-slate-900 hover:bg-slate-100 text-base font-bold rounded-2xl shadow-2xl hover:shadow-white/20 transition-all hover:-translate-y-0.5">
                Comenzar Gratis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <button className="h-14 px-10 border-2 border-white text-white bg-transparent hover:bg-white hover:text-slate-900 text-base font-semibold rounded-2xl transition-all">
                Ya tengo cuenta
              </button>
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            {['Sin tarjeta de crédito', 'Configuración en 5 min', 'Soporte incluido'].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-14 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="md:col-span-2">
              <Image src="/logo-novatec.jpeg" alt="Novatec Academy" width={160} height={48} className="h-10 w-auto object-contain mb-4" />
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                La plataforma educativa más completa para gestionar tu institución con eficiencia y modernidad.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Plataforma</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {['Características', 'Precios', 'Seguridad', 'Actualizaciones'].map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-slate-900 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Empresa</h4>
              <ul className="space-y-2.5 text-sm text-slate-500">
                {['Acerca de', 'Blog', 'Contacto', 'Soporte'].map((item, i) => (
                  <li key={i}><a href="#" className="hover:text-slate-900 transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© 2025 Novatec Academy. Todos los derechos reservados.</p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-slate-700 transition-colors">Términos</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-slate-700 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
