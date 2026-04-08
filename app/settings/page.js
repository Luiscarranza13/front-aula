'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { updateUser } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  User, Bell, Shield, Palette, Moon, Sun, Monitor,
  Check, Save, Eye, EyeOff, Mail, Lock, AlertCircle,
  CheckCircle2, GraduationCap, BookOpen, Loader2,
  Zap, Globe, ChevronRight, LogOut, Key
} from 'lucide-react';

const SECTIONS = [
  { id: 'cuenta', label: 'Cuenta', icon: User },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'apariencia', label: 'Apariencia', icon: Palette },
  { id: 'notificaciones', label: 'Notificaciones', icon: Bell },
];

export default function SettingsPage() {
  const { user, updateUserData, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('cuenta');
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState('system');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: false, tasks: true, forums: true, grades: true });
  const [profileData, setProfileData] = useState({ nombre: '', email: '', telefono: '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) setProfileData({ nombre: user.nombre || '', email: user.email || '', telefono: user.telefono || '' });
    setTheme(localStorage.getItem('theme') || 'system');
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser(user.id, { nombre: profileData.nombre, telefono: profileData.telefono });
      if (updateUserData) updateUserData({ ...user, ...profileData });
      showToast('Perfil actualizado correctamente');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) return showToast('Las contraseñas no coinciden', 'error');
    if (passwordData.newPassword.length < 6) return showToast('Mínimo 6 caracteres', 'error');
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showToast('Contraseña actualizada correctamente');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    const root = document.documentElement;
    if (newTheme === 'system') {
      root.classList.toggle('dark', window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      root.classList.toggle('dark', newTheme === 'dark');
    }
    showToast('Tema actualizado');
  };

  const roleConfig = {
    admin: { gradient: 'from-red-500 to-orange-500', label: 'Administrador', icon: Shield, color: 'text-red-600' },
    docente: { gradient: 'from-blue-500 to-cyan-500', label: 'Docente', icon: BookOpen, color: 'text-blue-600' },
    estudiante: { gradient: 'from-violet-500 to-purple-600', label: 'Estudiante', icon: GraduationCap, color: 'text-violet-600' },
  }[user?.rol] || { gradient: 'from-gray-500 to-gray-600', label: 'Usuario', icon: User, color: 'text-gray-600' };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        } text-white`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground text-sm mt-1">Administra tu cuenta y preferencias</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar de navegación */}
          <aside className="w-full md:w-56 flex-shrink-0">
            {/* Mini perfil */}
            <div className="flex items-center gap-3 p-3 mb-4 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
              <Avatar className="h-10 w-10">
                <AvatarFallback className={`bg-gradient-to-br ${roleConfig.gradient} text-white text-sm font-bold`}>
                  {getInitials(user?.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user?.nombre || 'Usuario'}</p>
                <p className="text-xs text-muted-foreground truncate">{roleConfig.label}</p>
              </div>
            </div>

            {/* Nav items */}
            <nav className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              {SECTIONS.map((section, i) => (
                <button key={section.id} onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                    i < SECTIONS.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''
                  } ${activeSection === section.id
                    ? `bg-gradient-to-r ${roleConfig.gradient} text-white`
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}>
                  <div className="flex items-center gap-3">
                    <section.icon className="h-4 w-4" />
                    <span className="font-medium">{section.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              ))}
            </nav>

            {/* Cerrar sesión */}
            <button onClick={logout}
              className="w-full mt-3 flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 rounded-2xl border border-red-100 dark:border-red-900 transition-colors bg-white dark:bg-gray-900">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </button>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 space-y-5">

            {/* CUENTA */}
            {activeSection === 'cuenta' && (
              <>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <User className="h-4 w-4" /> Información Personal
                    </CardTitle>
                    <CardDescription>Actualiza tu nombre y datos de contacto</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre completo</label>
                        <Input value={profileData.nombre}
                          onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                          placeholder="Tu nombre" className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Correo electrónico</label>
                        <Input value={profileData.email} disabled
                          className="h-10 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-not-allowed opacity-60" />
                        <p className="text-xs text-muted-foreground">No se puede modificar</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Teléfono</label>
                        <Input value={profileData.telefono}
                          onChange={(e) => setProfileData({ ...profileData, telefono: e.target.value })}
                          placeholder="+51 999 999 999" className="h-10 rounded-xl" />
                      </div>
                    </div>
                    <Button onClick={handleSaveProfile} disabled={saving}
                      className={`h-10 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90`}>
                      {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar cambios</>}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Key className="h-4 w-4" /> Rol y Permisos
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${roleConfig.gradient}`}>
                        <roleConfig.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{roleConfig.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {user?.rol === 'admin' && 'Acceso completo a todas las funciones del sistema'}
                          {user?.rol === 'docente' && 'Puedes crear cursos, tareas y gestionar estudiantes'}
                          {user?.rol === 'estudiante' && 'Acceso a cursos, tareas, exámenes y recursos'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* SEGURIDAD */}
            {activeSection === 'seguridad' && (
              <>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lock className="h-4 w-4" /> Cambiar Contraseña
                    </CardTitle>
                    <CardDescription>Usa una contraseña segura de al menos 6 caracteres</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nueva contraseña</label>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                            placeholder="••••••••" className="pr-10 h-10 rounded-xl" />
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Confirmar contraseña</label>
                        <div className="relative">
                          <Input type={showConfirm ? 'text' : 'password'} value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                            placeholder="••••••••" className="pr-10 h-10 rounded-xl" />
                          <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handleChangePassword} disabled={savingPassword} variant="outline" className="h-10 px-6 rounded-xl">
                      {savingPassword ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Actualizando...</> : <><Lock className="h-4 w-4 mr-2" />Actualizar contraseña</>}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Estado de Sesión
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Sesión activa y segura</p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500">Autenticado con Supabase · {user?.email}</p>
                      </div>
                    </div>
                    <Button onClick={logout} variant="outline" className="h-10 px-6 rounded-xl text-red-600 border-red-200 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}

            {/* APARIENCIA */}
            {activeSection === 'apariencia' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Palette className="h-4 w-4" /> Tema de la Interfaz
                  </CardTitle>
                  <CardDescription>Elige cómo se ve la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: 'Claro', icon: Sun, desc: 'Fondo blanco, ideal para el día', preview: 'bg-white border-2' },
                      { value: 'dark', label: 'Oscuro', icon: Moon, desc: 'Fondo oscuro, ideal para la noche', preview: 'bg-gray-900 border-2' },
                      { value: 'system', label: 'Sistema', icon: Monitor, desc: 'Se adapta a tu dispositivo', preview: 'bg-gradient-to-r from-white to-gray-900 border-2' },
                    ].map((option) => (
                      <button key={option.value} onClick={() => handleThemeChange(option.value)}
                        className={`relative p-4 rounded-2xl border-2 text-left transition-all ${
                          theme === option.value
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-950'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}>
                        {theme === option.value && (
                          <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-violet-500 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                        <div className={`h-16 rounded-xl mb-3 ${option.preview} ${theme === option.value ? 'border-violet-300' : 'border-gray-200'}`} />
                        <option.icon className={`h-5 w-5 mb-1 ${theme === option.value ? 'text-violet-600' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-semibold ${theme === option.value ? 'text-violet-700 dark:text-violet-300' : ''}`}>{option.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NOTIFICACIONES */}
            {activeSection === 'notificaciones' && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="h-4 w-4" /> Preferencias de Notificaciones
                  </CardTitle>
                  <CardDescription>Controla qué alertas quieres recibir</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    { key: 'email', title: 'Notificaciones por email', desc: 'Recibe alertas en tu correo electrónico', icon: Mail },
                    { key: 'push', title: 'Notificaciones push', desc: 'Alertas en tiempo real en el navegador', icon: Zap },
                    { key: 'tasks', title: 'Recordatorios de tareas', desc: 'Aviso cuando una tarea está por vencer', icon: AlertCircle },
                    { key: 'forums', title: 'Actividad en foros', desc: 'Nuevas respuestas en tus hilos', icon: Globe },
                    { key: 'grades', title: 'Calificaciones', desc: 'Cuando el docente califica tu entrega', icon: CheckCircle2 },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                          <item.icon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                      <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                        className={`relative w-11 h-6 rounded-full transition-all ${
                          notifications[item.key] ? `bg-gradient-to-r ${roleConfig.gradient}` : 'bg-gray-200 dark:bg-gray-700'
                        }`}>
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                          notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
