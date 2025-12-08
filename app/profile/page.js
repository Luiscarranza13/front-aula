'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { updateUser, uploadFile, getUploadUrl } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  User, Mail, Phone, Shield, Camera, Loader2, Save, 
  Eye, EyeOff, CheckCircle2, AlertCircle, Lock, Edit3
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

  const [formData, setFormData] = useState({
    nombre: '', email: '', telefono: '', avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || '',
        email: user.email || '',
        telefono: user.telefono || '',
        avatar: user.avatar || ''
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const getRoleConfig = (rol) => {
    const configs = {
      admin: { color: 'bg-red-500', badge: 'bg-red-100 text-red-700', label: 'Administrador' },
      docente: { color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', label: 'Docente' },
      estudiante: { color: 'bg-green-500', badge: 'bg-green-100 text-green-700', label: 'Estudiante' }
    };
    return configs[rol] || configs.estudiante;
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    try {
      const result = await uploadFile(file);
      const avatarUrl = getUploadUrl(result.file.filename);
      setFormData(prev => ({ ...prev, avatar: avatarUrl }));
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
      await updateUser(user.id, {
        nombre: formData.nombre,
        telefono: formData.telefono,
        avatar: formData.avatar
      });
      if (updateUserData) {
        updateUserData({ ...user, ...formData });
      }
      showNotification('Perfil actualizado correctamente');
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showNotification('Las contraseñas no coinciden', 'error');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      showNotification('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      await updateUser(user.id, { password: passwordData.newPassword });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showNotification('Contraseña actualizada correctamente');
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  const roleConfig = getRoleConfig(user.rol);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header con Avatar */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
          <CardContent className="relative pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              <div className="relative group">
                <Avatar className="h-32 w-32 ring-4 ring-white dark:ring-gray-800 shadow-xl">
                  {avatarPreview ? <AvatarImage src={avatarPreview} /> : null}
                  <AvatarFallback className={`${roleConfig.color} text-white text-3xl font-bold`}>
                    {getInitials(user.nombre)}
                  </AvatarFallback>
                </Avatar>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingAvatar ? <Loader2 className="h-8 w-8 text-white animate-spin" /> : <Camera className="h-8 w-8 text-white" />}
                </button>
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold">{user.nombre}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge className={`${roleConfig.badge} mt-2`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {roleConfig.label}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <button onClick={() => setActiveSection('info')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'info' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <Edit3 className="h-4 w-4" /> Información Personal
          </button>
          <button onClick={() => setActiveSection('password')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeSection === 'password' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
            }`}>
            <Lock className="h-4 w-4" /> Cambiar Contraseña
          </button>
        </div>

        {/* Información Personal */}
        {activeSection === 'info' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Información Personal
              </CardTitle>
              <CardDescription>Actualiza tu información de perfil</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" /> Nombre Completo
                  </label>
                  <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Tu nombre completo" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" /> Correo Electrónico
                  </label>
                  <Input value={formData.email} disabled className="h-12 rounded-xl bg-gray-50" />
                  <p className="text-xs text-muted-foreground">El correo no se puede cambiar</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" /> Teléfono
                  </label>
                  <Input value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="+51 999 999 999" className="h-12 rounded-xl" />
                </div>
                <Button type="submit" disabled={saving || uploadingAvatar} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando...</> : <><Save className="h-4 w-4 mr-2" /> Guardar Cambios</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Cambiar Contraseña */}
        {activeSection === 'password' && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-indigo-600" />
                Cambiar Contraseña
              </CardTitle>
              <CardDescription>Actualiza tu contraseña de acceso</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nueva Contraseña</label>
                  <div className="relative">
                    <Input type={showPassword ? 'text' : 'password'} value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Mínimo 6 caracteres" className="h-12 rounded-xl pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
                  <div className="relative">
                    <Input type={showNewPassword ? 'text' : 'password'} value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Repite la contraseña" className="h-12 rounded-xl pr-10" />
                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={saving} className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Actualizando...</> : <><Lock className="h-4 w-4 mr-2" /> Cambiar Contraseña</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
