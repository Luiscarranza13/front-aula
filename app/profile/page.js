'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUser, uploadFile } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Shield, Camera, Loader2, Save, 
  Eye, EyeOff, CheckCircle2, AlertCircle, Lock, Edit3,
  GraduationCap, BookOpen, Star, Calendar, Activity
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeSection, setActiveSection] = useState('info');

  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setFormData({ nombre: user.nombre || '', email: user.email || '', telefono: user.telefono || '', avatar: user.avatar || '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleConfig = {
    admin: { gradient: 'from-red-500 to-orange-500', badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300', label: 'Administrador', icon: Shield },
    docente: { gradient: 'from-blue-500 to-cyan-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300', label: 'Docente', icon: BookOpen },
    estudiante: { gradient: 'from-violet-500 to-purple-600', badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300', label: 'Estudiante', icon: GraduationCap },
  }[user?.rol] || { gradient: 'from-gray-500 to-gray-600', badge: 'bg-gray-100 text-gray-700', label: 'Usuario', icon: User };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setUploadingAvatar(true);
    try {
      const result = await uploadFile(file);
      setFormData(prev => ({ ...prev, avatar: result.url }));
      showNotification('Foto actualizada correctamente');
    } catch (error) {
      showNotification('Error al subir foto: ' + error.message, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUser(user.id, { nombre: formData.nombre, telefono: formData.telefono, avatar: formData.avatar });
      if (updateUserData) updateUserData({ ...user, ...formData });
      showNotification('Perfil actualizado correctamente');
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return showNotification('Las contraseñas no coinciden', 'error');
    if (passwordData.newPassword.length < 6) return showNotification('Mínimo 6 caracteres', 'error');
    setSaving(true);
    try {
      const { error } = await import('@/lib/supabase').then(m => m.supabase.auth.updateUser({ password: passwordData.newPassword }));
      if (error) throw error;
      setPasswordData({ newPassword: '', confirmPassword: '' });
      showNotification('Contraseña actualizada correctamente');
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          <span className="font-medium">{notification.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Hero Card */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className={`h-40 bg-gradient-to-r ${roleConfig.gradient} relative`}>
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '40px 40px'}} />
          </div>
          <CardContent className="relative pb-6 px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className="h-28 w-28 ring-4 ring-white dark:ring-gray-900 shadow-2xl">
                  {avatarPreview && <AvatarImage src={avatarPreview} />}
                  <AvatarFallback className={`bg-gradient-to-br ${roleConfig.gradient} text-white text-3xl font-bold`}>
                    {getInitials(user.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingAvatar ? <Loader2 className="h-7 w-7 text-white animate-spin" /> : <Camera className="h-7 w-7 text-white" />}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{user.nombre || 'Sin nombre'}</h1>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.badge}`}>
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig.label}
                  </span>
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              {/* Stats rápidas */}
              <div className="flex gap-4 pb-2">
                {[
                  { icon: Activity, label: 'Activo', value: 'Hoy' },
                  { icon: Star, label: 'Miembro', value: 'Desde 2025' },
                ].map((stat, i) => (
                  <div key={i} className="text-center">
                    <stat.icon className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-semibold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          {[
            { id: 'info', label: 'Información Personal', icon: Edit3 },
            { id: 'password', label: 'Contraseña', icon: Lock },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md`
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Información Personal */}
        {activeSection === 'info' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${roleConfig.gradient}`}>
                  <User className="h-4 w-4 text-white" />
                </div>
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tu nombre, teléfono y foto de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Tu nombre completo" className="pl-10 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.email} disabled className="pl-10 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-muted-foreground">El correo no se puede modificar</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+51 999 999 999" className="pl-10 h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
                <Button type="submit" disabled={saving || uploadingAvatar}
                  className={`h-11 px-8 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 transition-opacity`}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar Cambios</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Cambiar Contraseña */}
        {activeSection === 'password' && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${roleConfig.gradient}`}>
                  <Lock className="h-4 w-4 text-white" />
                </div>
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>Elige una contraseña segura de al menos 6 caracteres</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nueva Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showPassword ? 'text' : 'password'} value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres" className="pl-10 pr-10 h-11 rounded-xl" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirmar Contraseña</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input type={showNewPassword ? 'text' : 'password'} value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Repite la contraseña" className="pl-10 pr-10 h-11 rounded-xl" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={saving}
                  className={`h-11 px-8 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 transition-opacity`}>
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Actualizando...</> : <><Lock className="h-4 w-4 mr-2" />Cambiar Contraseña</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
