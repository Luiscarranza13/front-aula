'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser, uploadFile, getUploadUrl } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import Modal, { ModalFooter, ConfirmModal } from '@/components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  UserPlus, Pencil, Trash2, Mail, Shield, Search, 
  Grid3X3, List, AlertCircle, CheckCircle2, Users, Eye, EyeOff,
  Camera, Phone, Calendar, Upload, Loader2
} from 'lucide-react';

export default function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', email: '', password: '', rol: 'estudiante', telefono: '', avatar: ''
  });

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterRol) filtered = filtered.filter(u => u.rol === filterRol);
    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRol]);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      showNotification('Error al cargar usuarios', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);

    // Upload
    setUploadingAvatar(true);
    try {
      const result = await uploadFile(file);
      setFormData(prev => ({ ...prev, avatar: getUploadUrl(result.file.filename) }));
      showNotification('Foto subida correctamente');
    } catch (error) {
      showNotification('Error al subir foto: ' + error.message, 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const dataToSend = { ...formData };
      if (editingUser && !formData.password) delete dataToSend.password;
      
      if (editingUser) {
        await updateUser(editingUser.id, dataToSend);
        showNotification('Usuario actualizado correctamente');
      } else {
        await createUser(dataToSend);
        showNotification('Usuario creado correctamente');
      }
      setShowModal(false);
      setEditingUser(null);
      setAvatarPreview(null);
      setFormData({ nombre: '', email: '', password: '', rol: 'estudiante', telefono: '', avatar: '' });
      fetchUsers();
    } catch (error) {
      showNotification('Error al guardar usuario: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setAvatarPreview(user.avatar || null);
    setFormData({
      nombre: user.nombre, email: user.email, password: '',
      rol: user.rol, telefono: user.telefono || '', avatar: user.avatar || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    try {
      await deleteUser(deletingUser.id);
      showNotification('Usuario eliminado correctamente');
      fetchUsers();
    } catch (error) {
      showNotification('Error al eliminar usuario: ' + error.message, 'error');
    }
    setDeletingUser(null);
    setShowDeleteModal(false);
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const getRoleConfig = (rol) => {
    const configs = {
      admin: { color: 'bg-red-500', badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400', icon: Shield },
      docente: { color: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400', icon: Users },
      estudiante: { color: 'bg-green-500', badge: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400', icon: Users }
    };
    return configs[rol] || configs.estudiante;
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.rol === 'admin').length,
    docentes: users.filter(u => u.rol === 'docente').length,
    estudiantes: users.filter(u => u.rol === 'estudiante').length,
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Usuarios</h1>
          <p className="text-muted-foreground mt-1">{users.length} usuarios registrados</p>
        </div>
        <Button onClick={() => { setEditingUser(null); setAvatarPreview(null); setFormData({ nombre: '', email: '', password: '', rol: 'estudiante', telefono: '', avatar: '' }); setShowModal(true); }}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <UserPlus className="h-4 w-4" /> Nuevo Usuario
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-3xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-red-600">{stats.admins}</div>
            <div className="text-sm text-red-600/70">Admins</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.docentes}</div>
            <div className="text-sm text-blue-600/70">Docentes</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="text-3xl font-bold text-green-600">{stats.estudiantes}</div>
            <div className="text-sm text-green-600/70">Estudiantes</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nombre o email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <select value={filterRol} onChange={(e) => setFilterRol(e.target.value)}
            className="px-4 py-2 border rounded-xl bg-white dark:bg-gray-800 text-sm h-11">
            <option value="">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="docente">Docentes</option>
            <option value="estudiante">Estudiantes</option>
          </select>
          <div className="flex border rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de usuarios - Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => {
            const roleConfig = getRoleConfig(user.rol);
            return (
              <Card key={user.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group border-0 shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 ring-4 ring-white dark:ring-gray-800 shadow-lg">
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} alt={user.nombre} />
                      ) : null}
                      <AvatarFallback className={`${roleConfig.color} text-white font-bold text-xl`}>
                        {getInitials(user.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{user.nombre}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      {user.telefono && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                          <Phone className="h-3 w-3" />
                          <span>{user.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <Badge className={`${roleConfig.badge} capitalize`}>
                    <roleConfig.icon className="h-3 w-3 mr-1" />
                    {user.rol}
                  </Badge>
                </CardContent>
                <CardFooter className="gap-2 border-t pt-4">
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                    onClick={() => handleEdit(user)}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => { setDeletingUser(user); setShowDeleteModal(true); }}>
                    <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-0 shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Usuario</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Teléfono</th>
                <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">Rol</th>
                <th className="px-4 py-4 text-right text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const roleConfig = getRoleConfig(user.rol);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {user.avatar ? <AvatarImage src={user.avatar} /> : null}
                          <AvatarFallback className={`${roleConfig.color} text-white text-sm`}>
                            {getInitials(user.nombre)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{user.telefono || '-'}</td>
                    <td className="px-4 py-4">
                      <Badge className={`${roleConfig.badge} capitalize`}>{user.rol}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"
                          onClick={() => { setDeletingUser(user); setShowDeleteModal(true); }}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <Card className="border-0 shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{searchTerm || filterRol ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de crear/editar */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingUser ? 'Editar Usuario' : 'Nuevo Usuario'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Avatar Upload */}
          <div className="flex justify-center">
            <div className="relative group">
              <Avatar className="h-24 w-24 ring-4 ring-gray-100 dark:ring-gray-800">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} />
                ) : null}
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-2xl font-bold">
                  {formData.nombre ? getInitials(formData.nombre) : <Camera className="h-8 w-8" />}
                </AvatarFallback>
              </Avatar>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Camera className="h-6 w-6 text-white" />
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">Haz clic para cambiar la foto</p>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nombre Completo *</label>
            <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} required
              placeholder="Juan Pérez" className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Correo Electrónico *</label>
            <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required
              placeholder="juan@ejemplo.com" className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Teléfono</label>
            <Input type="tel" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="+51 999 999 999" className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contraseña {editingUser && <span className="text-muted-foreground font-normal">(dejar vacío para no cambiar)</span>}
            </label>
            <div className="relative">
              <Input type={showPassword ? 'text' : 'password'} value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser} placeholder="••••••••" className="h-11 rounded-xl pr-10 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rol *</label>
            <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="estudiante">Estudiante</option>
              <option value="docente">Docente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={saving || uploadingAvatar} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              {saving ? 'Guardando...' : editingUser ? 'Actualizar' : 'Crear Usuario'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete}
        title="Eliminar Usuario" description={`¿Estás seguro de eliminar a "${deletingUser?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar" variant="danger" />
    </div>
  );
}
