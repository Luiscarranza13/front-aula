'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUser, uploadFile } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User, Mail, Phone, Shield, Camera, Loader2, Save,
  Eye, EyeOff, CheckCircle2, AlertCircle, Lock,
  GraduationCap, BookOpen, Edit2, Sparkles, Calendar,
  MapPin, Link2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUserData } = useAuth();
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({ nombre: '', email: '', telefono: '', avatar: '' });
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (user) {
      setFormData({ nombre: user.nombre || '', email: user.email || '', telefono: user.telefono || '', avatar: user.avatar || '' });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleConfig = {
    admin: { gradient: 'from-rose-500 via-pink-500 to-orange-400', soft: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300', label: 'Administrador', icon: Shield },
    docente: { gradient: 'from-blue-600 via-indigo-500 to-violet-500', soft: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300', label: 'Docente', icon: BookOpen },
    estudiante: { gradient: 'from-violet-600 via-purple-500 to-fuchsia-500', soft: 'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300', label: 'Estudiante', icon: GraduationCap },
  }[user?.rol] || { gradient: 'from-gray-500 to-gray-600', soft: 'bg-gray-100 text-gray-700', label: 'Usuario', icon: User };

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
      showToast('Foto actualizada');
    } catch (e) {
      showToast(e.message, 'error');
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
      setEditMode(false);
      showToast('Perfil actualizado correctamente');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return showToast('Las contraseñas no coinciden', 'error');
    if (passwordData.newPassword.length < 6) return showToast('Mínimo 6 caracteres', 'error');
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
      if (error) throw error;
      setPasswordData({ newPassword: '', confirmPassword: '' });
      showToast('Contraseña actualizada');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (!user) return null;
  const RoleIcon = roleConfig.icon;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-gray-950">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-5 py-3 rounded-2xl shadow-2xl text-white text-sm font-medium animate-in slide-in-from-top-3 ${
          toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-5">

        {/* === HERO CARD === */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl bg-white dark:bg-gray-900">
          {/* Banner */}
          <div className={`h-44 bg-gradient-to-r ${roleConfig.gradient} relative`}>
            {/* Patrón decorativo */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.5" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Info del usuario */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 mb-4">
              {/* Avatar */}
              <div className="relative group w-fit">
                <div className="ring-4 ring-white dark:ring-gray-900 rounded-full shadow-xl">
                  <Avatar className="h-28 w-28">
                    {avatarPreview && <AvatarImage src={avatarPreview} className="object-cover" />}
                    <AvatarFallback className={`bg-gradient-to-br ${roleConfig.gradient} text-white text-3xl font-bold`}>
                      {getInitials(user.nombre)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer">
                  {uploadingAvatar
                    ? <Loader2 className="h-7 w-7 text-white animate-spin" />
                    : <Camera className="h-7 w-7 text-white" />}
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </div>

              {/* Nombre y rol */}
              <div className="flex-1 sm:pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold tracking-tight">{user.nombre || 'Sin nombre'}</h1>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${roleConfig.soft}`}>
                    <RoleIcon className="h-3 w-3" />
                    {roleConfig.label}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>
                {user.telefono && (
                  <p className="text-muted-foreground text-sm flex items-center gap-1.5 mt-0.5">
                    <Phone className="h-3.5 w-3.5" />
                    {user.telefono}
                  </p>
                )}
              </div>

              {/* Botón editar */}
              <button onClick={() => { setActiveTab('info'); setEditMode(true); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md hover:opacity-90 transition-opacity sm:mb-2`}>
                <Edit2 className="h-4 w-4" />
                Editar perfil
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="text-center">
                <p className="text-lg font-bold">—</p>
                <p className="text-xs text-muted-foreground">Cursos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold">—</p>
                <p className="text-xs text-muted-foreground">Tareas</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold capitalize">{user.rol || '—'}</p>
                <p className="text-xs text-muted-foreground">Rol</p>
              </div>
            </div>
          </div>
        </div>

        {/* === TABS === */}
        <div className="flex gap-1 p-1 bg-white dark:bg-gray-900 rounded-2xl shadow-sm">
          {[
            { id: 'info', label: 'Información', icon: User },
            { id: 'password', label: 'Contraseña', icon: Lock },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${roleConfig.gradient} text-white shadow-md`
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}>
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* === INFORMACIÓN PERSONAL === */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Información Personal</h2>
                <p className="text-sm text-muted-foreground">Actualiza tus datos de perfil</p>
              </div>
              {!editMode && (
                <button onClick={() => setEditMode(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700">
                  <Edit2 className="h-4 w-4" /> Editar
                </button>
              )}
            </div>

            {!editMode ? (
              /* Vista de solo lectura */
              <div className="space-y-4">
                {[
                  { icon: User, label: 'Nombre completo', value: user.nombre || 'Sin nombre' },
                  { icon: Mail, label: 'Correo electrónico', value: user.email },
                  { icon: Phone, label: 'Teléfono', value: user.telefono || 'No especificado' },
                  { icon: RoleIcon, label: 'Rol', value: roleConfig.label },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${roleConfig.gradient}`}>
                      <item.icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-sm font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Formulario de edición */
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        placeholder="Tu nombre completo" className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo electrónico</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.email} disabled className="pl-9 h-11 rounded-xl bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed" />
                    </div>
                    <p className="text-xs text-muted-foreground">No se puede modificar</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+51 999 999 999" className="pl-9 h-11 rounded-xl" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={saving}
                    className={`h-11 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 shadow-md`}>
                    {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Guardando...</> : <><Save className="h-4 w-4 mr-2" />Guardar cambios</>}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} className="h-11 px-6 rounded-xl">
                    Cancelar
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* === CONTRASEÑA === */}
        {activeTab === 'password' && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold">Cambiar Contraseña</h2>
              <p className="text-sm text-muted-foreground">Elige una contraseña segura de al menos 6 caracteres</p>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showPassword ? 'text' : 'password'} value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres" className="pl-9 pr-10 h-11 rounded-xl" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Confirmar contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input type={showConfirm ? 'text' : 'password'} value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Repite la contraseña" className="pl-9 pr-10 h-11 rounded-xl" />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Indicador de fortaleza */}
              {passwordData.newPassword && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${
                        passwordData.newPassword.length >= i * 3
                          ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-yellow-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-400'
                          : 'bg-gray-200'
                      }`} />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordData.newPassword.length < 4 ? 'Muy débil' : passwordData.newPassword.length < 7 ? 'Débil' : passwordData.newPassword.length < 10 ? 'Buena' : 'Muy segura'}
                  </p>
                </div>
              )}

              <Button type="submit" disabled={savingPassword}
                className={`h-11 px-6 rounded-xl bg-gradient-to-r ${roleConfig.gradient} hover:opacity-90 shadow-md`}>
                {savingPassword ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Actualizando...</> : <><Lock className="h-4 w-4 mr-2" />Actualizar contraseña</>}
              </Button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
