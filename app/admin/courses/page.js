'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getCourses, getUsers } from '@/lib/api-new';
import { DashboardSkeleton } from '@/components/Skeleton';
import Modal, { ModalFooter, ConfirmModal } from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, Plus, Pencil, Trash2, User, Search, 
  Grid3X3, List, BookOpen, AlertCircle, CheckCircle2,
  FileText, MessageSquare, ClipboardList, Upload, Calendar,
  ChevronRight, Eye, X, FolderOpen, Settings
} from 'lucide-react';

export default function AdminCoursesPage() {
  const { isAdmin, isDocente } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showContentModal, setShowContentModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks');
  const [contentData, setContentData] = useState({ tasks: [], resources: [], forums: [] });
  const [loadingContent, setLoadingContent] = useState(false);

  // Content modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showForumModal, setShowForumModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [showDeleteItemModal, setShowDeleteItemModal] = useState(false);
  const [deleteItemType, setDeleteItemType] = useState('');

  const [formData, setFormData] = useState({
    titulo: '', descripcion: '', grado: '', seccion: '', docenteId: '',
  });

  const [taskForm, setTaskForm] = useState({
    titulo: '', descripcion: '', fecha_entrega: '', estado: 'pendiente'
  });

  const [resourceForm, setResourceForm] = useState({
    nombre_archivo: '', tipo_recurso: 'documento', url: '', descripcion: ''
  });

  const [forumForm, setForumForm] = useState({
    titulo: '', descripcion: ''
  });

  useEffect(() => {
    if (!isAdmin() && !isDocente()) {
      router.push('/dashboard');
      return;
    }
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = courses;
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterGrado) {
      filtered = filtered.filter(c => c.grado === filterGrado);
    }
    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterGrado]);

  const fetchData = async () => {
    try {
      const [coursesData, usersData] = await Promise.all([
        getCourses().catch(() => []), 
        getUsers().catch(() => []),
      ]);
      setCourses(coursesData);
      setFilteredCourses(coursesData);
      setUsers(usersData.filter(u => u.rol === 'docente' || u.rol === 'profesor'));
    } catch (error) {
      showNotification('Error al cargar datos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseContent = async (courseId) => {
    setLoadingContent(true);
    try {
      // Por ahora usar datos mock hasta que se implementen estos endpoints
      setContentData({ 
        tasks: [], 
        resources: [], 
        forums: [] 
      });
    } catch (error) {
      showNotification('Error al cargar contenido', 'error');
    } finally {
      setLoadingContent(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Por ahora mostrar mensaje de funcionalidad no disponible
      showNotification('Funcionalidad de creación/edición no disponible aún', 'error');
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ titulo: '', descripcion: '', grado: '', seccion: '', docenteId: '' });
    } catch (error) {
      showNotification('Error al guardar curso: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setFormData({
      titulo: course.titulo,
      descripcion: course.descripcion || '',
      grado: course.grado,
      seccion: course.seccion,
      docenteId: course.docenteId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;
    try {
      showNotification('Funcionalidad de eliminación no disponible aún', 'error');
    } catch (error) {
      showNotification('Error al eliminar curso: ' + error.message, 'error');
    }
    setDeletingCourse(null);
    setShowDeleteModal(false);
  };

  const openContentManager = (course) => {
    setSelectedCourse(course);
    setActiveTab('tasks');
    fetchCourseContent(course.id);
    setShowContentModal(true);
  };

  // Task handlers
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...taskForm, cursoId: selectedCourse.id };
      if (editingItem) {
        await updateTask(editingItem.id, data);
        showNotification('Tarea actualizada');
      } else {
        await createTask(data);
        showNotification('Tarea creada');
      }
      setShowTaskModal(false);
      setEditingItem(null);
      setTaskForm({ titulo: '', descripcion: '', fecha_entrega: '', estado: 'pendiente' });
      fetchCourseContent(selectedCourse.id);
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Resource handlers
  const handleResourceSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...resourceForm, cursoId: selectedCourse.id };
      if (editingItem) {
        await updateResource(editingItem.id, data);
        showNotification('Recurso actualizado');
      } else {
        await createResource(data);
        showNotification('Recurso creado');
      }
      setShowResourceModal(false);
      setEditingItem(null);
      setResourceForm({ nombre_archivo: '', tipo_recurso: 'documento', url: '', descripcion: '' });
      fetchCourseContent(selectedCourse.id);
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Forum handlers
  const handleForumSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { ...forumForm, cursoId: selectedCourse.id };
      if (editingItem) {
        await updateForum(editingItem.id, data);
        showNotification('Foro actualizado');
      } else {
        await createForum(data);
        showNotification('Foro creado');
      }
      setShowForumModal(false);
      setEditingItem(null);
      setForumForm({ titulo: '', descripcion: '' });
      fetchCourseContent(selectedCourse.id);
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;
    try {
      if (deleteItemType === 'task') await deleteTask(deletingItem.id);
      else if (deleteItemType === 'resource') await deleteResource(deletingItem.id);
      else if (deleteItemType === 'forum') await deleteForum(deletingItem.id);
      showNotification('Eliminado correctamente');
      fetchCourseContent(selectedCourse.id);
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    }
    setDeletingItem(null);
    setShowDeleteItemModal(false);
  };

  const handleFileUpload = async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setResourceForm(prev => ({
        ...prev,
        nombre_archivo: file.originalName || file.filename,
        url: getUploadUrl(file.filename)
      }));
      showNotification('Archivo subido correctamente');
    }
  };

  const uniqueGrados = [...new Set(courses.map(c => c.grado))];

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-green-500 to-green-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600'
  ];

  const tabConfig = [
    { id: 'tasks', label: 'Tareas', icon: ClipboardList, count: contentData.tasks.length },
    { id: 'resources', label: 'Recursos', icon: FileText, count: contentData.resources.length },
    { id: 'forums', label: 'Foros', icon: MessageSquare, count: contentData.forums.length },
  ];

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
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
          <p className="text-muted-foreground mt-1">{courses.length} cursos en total</p>
        </div>
        <Button onClick={() => { setEditingCourse(null); setFormData({ titulo: '', descripcion: '', grado: '', seccion: '', docenteId: '' }); setShowModal(true); }}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="h-4 w-4" /> Nuevo Curso
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cursos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2">
          <select value={filterGrado} onChange={(e) => setFilterGrado(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm">
            <option value="">Todos los grados</option>
            {uniqueGrados.map(grado => <option key={grado} value={grado}>{grado}</option>)}
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('grid')} className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group">
              <div className={`h-28 bg-gradient-to-br ${colors[idx % colors.length]} relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-white font-bold text-lg line-clamp-1">{course.titulo}</h3>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{course.grado} - {course.seccion}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {course.docente ? (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-xs font-medium">
                      {course.docente.nombre?.charAt(0)}
                    </div>
                    <span className="text-muted-foreground">{course.docente.nombre}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <User className="h-4 w-4" /><span>Sin docente asignado</span>
                  </div>
                )}
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <BookOpen className="h-3 w-3 mr-1" /> Activo
                </Badge>
              </CardContent>

              <CardFooter className="gap-2 border-t pt-4 flex-wrap">
                <Button variant="outline" size="sm" className="flex-1 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200"
                  onClick={() => openContentManager(course)}>
                  <FolderOpen className="h-4 w-4 mr-1" /> Contenido
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  onClick={() => handleEdit(course)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  onClick={() => { setDeletingCourse(course); setShowDeleteModal(true); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Curso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Grado</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Docente</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 font-medium">{course.titulo}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{course.grado} - {course.seccion}</td>
                  <td className="px-4 py-3 text-sm">{course.docente?.nombre || <span className="text-orange-600">Sin asignar</span>}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openContentManager(course)}><FolderOpen className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(course)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setDeletingCourse(course); setShowDeleteModal(true); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{searchTerm || filterGrado ? 'No se encontraron cursos' : 'No hay cursos disponibles'}</p>
          </CardContent>
        </Card>
      )}

      {/* Modal de crear/editar curso */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'} size="md">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Título del Curso *</label>
            <Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required
              placeholder="Ej: Matemáticas Avanzadas" className="h-11 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Descripción</label>
            <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del curso..." rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Grado *</label>
              <select value={formData.grado} onChange={(e) => setFormData({ ...formData, grado: e.target.value })} required
                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <option value="">Seleccionar</option>
                {['1ro', '2do', '3ro', '4to', '5to', '6to'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sección *</label>
              <select value={formData.seccion} onChange={(e) => setFormData({ ...formData, seccion: e.target.value })} required
                className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
                <option value="">Seleccionar</option>
                {['A', 'B', 'C', 'D'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Docente Asignado</label>
            <select value={formData.docenteId} onChange={(e) => setFormData({ ...formData, docenteId: e.target.value })}
              className="w-full h-11 px-4 border border-gray-200 rounded-xl bg-white dark:bg-gray-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20">
              <option value="">Sin asignar</option>
              {users.map((user) => <option key={user.id} value={user.id}>{user.nombre}</option>)}
            </select>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              {saving ? 'Guardando...' : editingCourse ? 'Actualizar' : 'Crear Curso'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de gestión de contenido */}
      <Modal isOpen={showContentModal} onClose={() => setShowContentModal(false)} 
        title={`Contenido: ${selectedCourse?.titulo || ''}`} size="xl">
        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            {tabConfig.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600' : 'text-gray-600 hover:text-gray-900'
                }`}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">{tab.count}</Badge>
              </button>
            ))}
          </div>

          {loadingContent ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {/* Tareas */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Tareas del curso</h3>
                    <Button size="sm" onClick={() => { setEditingItem(null); setTaskForm({ titulo: '', descripcion: '', fecha_entrega: '', estado: 'pendiente' }); setShowTaskModal(true); }}
                      className="gap-1 bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4" /> Nueva Tarea
                    </Button>
                  </div>
                  {contentData.tasks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <ClipboardList className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay tareas creadas</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contentData.tasks.map(task => (
                        <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex-1">
                            <h4 className="font-medium">{task.titulo}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {task.fecha_entrega ? new Date(task.fecha_entrega).toLocaleDateString() : 'Sin fecha'}</span>
                              <Badge className={task.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>{task.estado}</Badge>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(task); setTaskForm({ titulo: task.titulo, descripcion: task.descripcion || '', fecha_entrega: task.fecha_entrega?.split('T')[0] || '', estado: task.estado }); setShowTaskModal(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setDeletingItem(task); setDeleteItemType('task'); setShowDeleteItemModal(true); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Recursos */}
              {activeTab === 'resources' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Recursos del curso</h3>
                    <Button size="sm" onClick={() => { setEditingItem(null); setResourceForm({ nombre_archivo: '', tipo_recurso: 'documento', url: '', descripcion: '' }); setShowResourceModal(true); }}
                      className="gap-1 bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4" /> Nuevo Recurso
                    </Button>
                  </div>
                  {contentData.resources.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay recursos creados</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {contentData.resources.map(resource => (
                        <div key={resource.id} className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">{resource.nombre_archivo}</h4>
                            <Badge variant="secondary" className="text-xs">{resource.tipo_recurso}</Badge>
                          </div>
                          <div className="flex gap-1">
                            {resource.url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer"><Eye className="h-4 w-4" /></a>
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(resource); setResourceForm({ nombre_archivo: resource.nombre_archivo, tipo_recurso: resource.tipo_recurso, url: resource.url || '', descripcion: resource.descripcion || '' }); setShowResourceModal(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setDeletingItem(resource); setDeleteItemType('resource'); setShowDeleteItemModal(true); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Foros */}
              {activeTab === 'forums' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Foros del curso</h3>
                    <Button size="sm" onClick={() => { setEditingItem(null); setForumForm({ titulo: '', descripcion: '' }); setShowForumModal(true); }}
                      className="gap-1 bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4" /> Nuevo Foro
                    </Button>
                  </div>
                  {contentData.forums.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay foros creados</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {contentData.forums.map(forum => (
                        <div key={forum.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                              <MessageSquare className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <h4 className="font-medium">{forum.titulo}</h4>
                              {forum.descripcion && <p className="text-sm text-muted-foreground line-clamp-1">{forum.descripcion}</p>}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setEditingItem(forum); setForumForm({ titulo: forum.titulo, descripcion: forum.descripcion || '' }); setShowForumModal(true); }}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setDeletingItem(forum); setDeleteItemType('forum'); setShowDeleteItemModal(true); }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Modal>

      {/* Modal de tarea */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title={editingItem ? 'Editar Tarea' : 'Nueva Tarea'} size="md">
        <form onSubmit={handleTaskSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input value={taskForm.titulo} onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })} required
              placeholder="Ej: Ejercicios del capítulo 5" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={taskForm.descripcion} onChange={(e) => setTaskForm({ ...taskForm, descripcion: e.target.value })}
              placeholder="Instrucciones detalladas..." rows={3}
              className="w-full px-4 py-3 border rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de entrega</label>
              <Input type="date" value={taskForm.fecha_entrega} onChange={(e) => setTaskForm({ ...taskForm, fecha_entrega: e.target.value })}
                className="h-11 rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select value={taskForm.estado} onChange={(e) => setTaskForm({ ...taskForm, estado: e.target.value })}
                className="w-full h-11 px-4 border rounded-xl bg-white dark:bg-gray-800">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completada">Completada</option>
              </select>
            </div>
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de recurso */}
      <Modal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)} title={editingItem ? 'Editar Recurso' : 'Nuevo Recurso'} size="md">
        <form onSubmit={handleResourceSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del archivo *</label>
            <Input value={resourceForm.nombre_archivo} onChange={(e) => setResourceForm({ ...resourceForm, nombre_archivo: e.target.value })} required
              placeholder="Ej: Guía de estudio.pdf" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de recurso</label>
            <select value={resourceForm.tipo_recurso} onChange={(e) => setResourceForm({ ...resourceForm, tipo_recurso: e.target.value })}
              className="w-full h-11 px-4 border rounded-xl bg-white dark:bg-gray-800">
              <option value="documento">Documento</option>
              <option value="presentacion">Presentación</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="enlace">Enlace</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Subir archivo</label>
            <FileUpload onUploadComplete={handleFileUpload} accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.mp4,.mp3" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">O ingresa URL directamente</label>
            <Input value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })}
              placeholder="https://..." className="h-11 rounded-xl" />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowResourceModal(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de foro */}
      <Modal isOpen={showForumModal} onClose={() => setShowForumModal(false)} title={editingItem ? 'Editar Foro' : 'Nuevo Foro'} size="md">
        <form onSubmit={handleForumSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título del foro *</label>
            <Input value={forumForm.titulo} onChange={(e) => setForumForm({ ...forumForm, titulo: e.target.value })} required
              placeholder="Ej: Dudas sobre el tema 3" className="h-11 rounded-xl" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={forumForm.descripcion} onChange={(e) => setForumForm({ ...forumForm, descripcion: e.target.value })}
              placeholder="Describe el propósito del foro..." rows={3}
              className="w-full px-4 py-3 border rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowForumModal(false)} className="rounded-xl">Cancelar</Button>
            <Button type="submit" disabled={saving} className="rounded-xl bg-indigo-600 hover:bg-indigo-700">
              {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación de curso */}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete}
        title="Eliminar Curso" description={`¿Estás seguro de eliminar "${deletingCourse?.titulo}"? Se eliminarán todas las tareas, recursos y foros asociados.`}
        confirmText="Eliminar" variant="danger" />

      {/* Modal de confirmación de eliminación de item */}
      <ConfirmModal isOpen={showDeleteItemModal} onClose={() => setShowDeleteItemModal(false)} onConfirm={handleDeleteItem}
        title={`Eliminar ${deleteItemType === 'task' ? 'Tarea' : deleteItemType === 'resource' ? 'Recurso' : 'Foro'}`}
        description={`¿Estás seguro de eliminar "${deletingItem?.titulo || deletingItem?.nombre_archivo}"?`}
        confirmText="Eliminar" variant="danger" />
    </div>
  );
}
