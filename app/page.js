'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  GraduationCap, BookOpen, Users, MessageCircle, Award, 
  ChevronRight, Star, Shield, Globe, ArrowRight, CheckCircle,
  BarChart3, Clock, Heart, Menu, X, Play, Laptop, FileText
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: BookOpen, title: 'Gestión de Cursos', desc: 'Organiza y administra contenido educativo de manera eficiente con herramientas intuitivas.' },
    { icon: Users, title: 'Colaboración', desc: 'Foros de discusión y chat en tiempo real para una comunicación efectiva.' },
    { icon: Award, title: 'Evaluaciones', desc: 'Sistema completo de tareas, calificaciones y seguimiento del progreso.' },
    { icon: BarChart3, title: 'Reportes', desc: 'Estadísticas detalladas y reportes de rendimiento académico.' },
    { icon: Shield, title: 'Seguridad', desc: 'Protección de datos con los más altos estándares de seguridad.' },
    { icon: Laptop, title: 'Multiplataforma', desc: 'Accede desde cualquier dispositivo, en cualquier momento.' },
  ];

  const stats = [
    { value: '10,000+', label: 'Estudiantes' },
    { value: '500+', label: 'Cursos' },
    { value: '98%', label: 'Satisfacción' },
    { value: '24/7', label: 'Soporte' },
  ];

  const testimonials = [
    { name: 'María García', role: 'Directora Académica', text: 'Ha transformado completamente la manera en que gestionamos nuestra institución educativa.', company: 'Instituto Tecnológico' },
    { name: 'Carlos López', role: 'Profesor', text: 'La plataforma más completa y fácil de usar que he encontrado para mis clases.', company: 'Universidad Central' },
    { name: 'Ana Martínez', role: 'Coordinadora', text: 'El soporte técnico es excepcional y las actualizaciones constantes mejoran la experiencia.', company: 'Colegio San José' },
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
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-slate-100' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-semibold text-slate-900">Aula Virtual</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#caracteristicas" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                Características
              </a>
              <a href="#testimonios" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                Testimonios
              </a>
              <a href="#precios" className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium">
                Precios
              </a>
              <Link href="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                  Comenzar Ahora
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2 text-slate-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-6 space-y-4">
              <a href="#caracteristicas" className="block text-slate-600 hover:text-slate-900 py-2 font-medium">Características</a>
              <a href="#testimonios" className="block text-slate-600 hover:text-slate-900 py-2 font-medium">Testimonios</a>
              <a href="#precios" className="block text-slate-600 hover:text-slate-900 py-2 font-medium">Precios</a>
              <div className="pt-4 space-y-3 border-t border-slate-100">
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full border-slate-300">Iniciar Sesión</Button>
                </Link>
                <Link href="/register" className="block">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800">Comenzar Ahora</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 lg:pt-40 pb-20 lg:pb-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Plataforma Educativa Líder
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                Educación de calidad al alcance de todos
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 max-w-xl mx-auto lg:mx-0">
                Gestiona cursos, tareas, evaluaciones y comunicación en una sola plataforma. 
                Diseñada para instituciones educativas que buscan excelencia.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Link href="/register">
                  <Button size="lg" className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white text-base">
                    Comenzar Gratis
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 border-slate-300 text-slate-700 hover:bg-slate-50 text-base">
                  <Play className="mr-2 w-4 h-4" />
                  Ver Demo
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-12 pt-8 border-t border-slate-200">
                <p className="text-sm text-slate-500 mb-4">Confían en nosotros</p>
                <div className="flex items-center justify-center lg:justify-start gap-8 opacity-60">
                  {['Universidad Nacional', 'Instituto Tech', 'Colegio Premier'].map((name, i) => (
                    <span key={i} className="text-slate-400 font-semibold text-sm">{name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative">
              <div className="bg-slate-100 rounded-2xl p-8 lg:p-12">
                <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                  {/* Mock browser */}
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                      <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-slate-200 rounded px-3 py-1 text-xs text-slate-500 text-center max-w-xs mx-auto">
                        aula-virtual.edu
                      </div>
                    </div>
                  </div>
                  
                  {/* Mock content */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-900"></div>
                        <div>
                          <div className="h-3 w-24 bg-slate-200 rounded"></div>
                          <div className="h-2 w-16 bg-slate-100 rounded mt-1.5"></div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                        <div className="w-8 h-8 rounded-lg bg-slate-100"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="w-8 h-8 rounded bg-slate-200 mb-3"></div>
                          <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                          <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="h-2 w-full bg-slate-200 rounded mb-2"></div>
                      <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="caracteristicas" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Todo lo que necesitas en una plataforma
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Herramientas completas para gestionar tu institución educativa de manera eficiente
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="p-6 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-slate-700" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Comienza en minutos
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Configurar tu aula virtual es rápido y sencillo
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Crea tu cuenta', desc: 'Regístrate gratis y configura tu perfil institucional' },
              { step: '02', title: 'Configura tus cursos', desc: 'Añade cursos, materiales y asigna profesores' },
              { step: '03', title: 'Invita usuarios', desc: 'Agrega estudiantes y comienza a enseñar' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-6">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonios" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Miles de instituciones confían en Aula Virtual
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <div key={i} className="p-8 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-600 font-semibold text-sm">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{testimonial.name}</div>
                    <div className="text-slate-500 text-xs">{testimonial.role} · {testimonial.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            ¿Listo para transformar tu institución?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Únete a miles de instituciones que ya están mejorando su educación con Aula Virtual.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="h-12 px-8 bg-white text-slate-900 hover:bg-slate-100 text-base">
                Comenzar Gratis
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-12 px-8 border-slate-600 text-white hover:bg-slate-800 text-base">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
          
          <p className="text-sm text-slate-400 mt-8">
            Sin tarjeta de crédito · Configuración en 5 minutos · Soporte incluido
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-900">Aula Virtual</span>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-900 transition-colors">Términos</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Privacidad</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Contacto</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Soporte</a>
            </div>
            
            <div className="text-sm text-slate-500">
              © 2025 Aula Virtual. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
