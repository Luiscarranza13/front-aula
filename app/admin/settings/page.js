'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { updateUser } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Settings, User, Bell, Shield, Palette, Globe, 
  Moon, Sun, Monitor, Check, Save, Eye, EyeOff,
  Mail, Lock, AlertCircle, CheckCircle2, GraduationCap,
  BookOpen, Loader2, Zap, Database
} from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUserData } = useAuth();
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState({ email: true, push: false, tasks: true, forums: true });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileData, setProfileData] = useState({ nombre: '', email: '', telefono: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ nombre: user.nombre || '', email: user.email || '', telefono: user.telefono || '' });
    }
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await updateUser(user.id, { nombre: profileData.nombre, telefono: profileData.telefono });
      if (updateUserData) updateUserData({ ...user, ...profileData });
      showToast('Perfil actualizado correctamente');
    } catch (e) {
      showToast('Error al guardar: ' + e.message, 'error');
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
      setPasswordData({ newPassword: '', confirmPassword: '' });
      showToast('Contraseña actualizada correctamente');
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const roleConfig = {
    admin: { gradient: 'from-red-500 to-orange-500', label: 'Administrador', icon: Shield },
    docente: { gradient: 'from-blue-500 to-cyan-500', label: 'Docente', icon: BookOpen },
    estudiante: { gradient: 'from-violet-500 to-purple-600', label: 'Estudiante', icon: GraduationCap },
  }[user?.rol] || { gradient: 'from-gray-500 to-gray-600', label: 'Usuario', icon: User };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const RoleIcon = roleConfig.icon;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-2 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${roleConfig.gradient}`}>
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-muted-foreground text-sm">Administra tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">

          {/* Perfil */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                  <AvatarFallback className={`bg-gradient-to-br ${roleConfig.gradient} text-white text-xl font-bold`}>
                    {getInitials(user?.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{user?.nombre || 'Sin nombre'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${roleConfig.gradient} text-white`}>
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig.label}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input value={profileData.nombre} onChange={(e) => setProfileData({ ...profileData, nombre: e.target.value })}
                      placeholder="Tu nombre" className="pl-9 h-10 rounded-xl" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Correo Electrónico</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input value={profileData.email} disabled className="pl-9 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-not-allowed" />
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}
                className={`h-10 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90`}>
                {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar</>}
              </Button>
            </CardContent>
          </Card>

          {/* Contraseña */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lock className="h-5 w-5 text-muted-foreground" /> Cambiar Contraseña
              </CardTitle>
              <CardDescription>Elige una contraseña segura de al menos 6 caracteres</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Nueva Contraseña</label>
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
                  <label className="text-sm font-medium">Confirmar Contraseña</label>
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
                {savingPassword ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Actualizando...</> : <><Lock className="h-4 w-4 mr-2" />Actualizar Contraseña</>}
              </Button>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-5 w-5 text-muted-foreground" /> Notificaciones
              </CardTitle>
              <CardDescription>Configura cómo quieres recibir alertas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { key: 'email', title: 'Notificaciones por email', desc: 'Recibe alertas en tu correo', icon: Mail },
                { key: 'push', title: 'Notificaciones push', desc: 'Alertas en tiempo real', icon: Zap },
                { key: 'tasks', title: 'Recordatorios de tareas', desc: 'Alertas de tareas próximas', icon: AlertCircle },
                { key: 'forums', title: 'Actividad en foros', desc: 'Nuevos mensajes y respuestas', icon: Globe },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-3 rounded-xl border hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                      <item.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <button onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? `bg-gradient-to-r ${roleConfig.gradient}` : 'bg-gray-200 dark:bg-gray-700'}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Columna lateral */}
        <div className="space-y-6">
          {/* Tema */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-5 w-5 text-muted-foreground" /> Apariencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { value: 'light', label: 'Claro', icon: Sun, desc: 'Fondo blanco' },
                { value: 'dark', label: 'Oscuro', icon: Moon, desc: 'Fondo oscuro' },
                { value: 'system', label: 'Sistema', icon: Monitor, desc: 'Automático' },
              ].map((option) => (
                <button key={option.value} onClick={() => handleThemeChange(option.value)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                    theme === option.value ? 'border-violet-400 bg-violet-50 dark:bg-violet-950' : 'hover:bg-accent/50'
                  }`}>
                  <div className="flex items-center gap-3">
                    <option.icon className={`h-5 w-5 ${theme === option.value ? 'text-violet-600' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <p className={`text-sm font-medium ${theme === option.value ? 'text-violet-700 dark:text-violet-300' : ''}`}>{option.label}</p>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </div>
                  {theme === option.value && <Check className="h-4 w-4 text-violet-600" />}
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Sistema */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Database className="h-5 w-5 text-muted-foreground" /> Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Versión', value: <Badge variant="outline">1.0.0</Badge> },
                { label: 'Estado', value: <Badge className="bg-emerald-500 gap-1 text-white"><span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />Activo</Badge> },
                { label: 'Base de datos', value: <Badge variant="secondary">Supabase</Badge> },
                { label: 'Última actualización', value: <span className="text-sm text-muted-foreground">Hoy</span> },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  {item.value}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Seguridad */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-5 w-5 text-muted-foreground" /> Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Sesión activa y segura</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-500">Autenticado con Supabase</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
