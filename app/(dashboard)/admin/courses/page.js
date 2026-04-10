'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  createCourse,
  createForum,
  createResource,
  createTask,
  deleteCourse,
  deleteForum,
  deleteResource,
  deleteTask,
  getCourses,
  getForumsByCourse,
  getResourcesByCourse,
  getTasksByCourse,
  getUploadUrl,
  getUsers,
  updateCourse,
  updateForum,
  updateResource,
  updateTask,
} from '@/lib/api';
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

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const saveCourse = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        grado: formData.grado,
        seccion: formData.seccion,
        docenteId: formData.docenteId || null,
      };

      if (editingCourse) {
        await updateCourse(editingCourse.id, payload);
        showNotification('Curso actualizado correctamente');
      } else {
        await createCourse(payload);
        showNotification('Curso creado correctamente');
      }

      await fetchData();
      setShowModal(false);
      setEditingCourse(null);
      setFormData({ titulo: '', descripcion: '', grado: '', seccion: '', docenteId: '' });
    } catch (error) {
      showNotification('Error al guardar curso: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteCourseAndRefresh = async () => {
    if (!deletingCourse) return;
    try {
      await deleteCourse(deletingCourse.id);
      if (selectedCourse?.id === deletingCourse.id) {
        setSelectedCourse(null);
      }
      await fetchData();
      showNotification('Curso eliminado correctamente');
    } catch (error) {
      showNotification('Error al eliminar curso: ' + error.message, 'error');
    }
    setDeletingCourse(null);
    setShowDeleteModal(false);
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

  const openContentManager = (course) => {
    router.push(`/courses/${course.id}`);
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
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Gestión de Cursos</h1>
          <p className="text-muted-foreground mt-1">{courses.length} cursos en total</p>
        </div>
        <Button onClick={() => { setEditingCourse(null); setFormData({ titulo: '', descripcion: '', grado: '', seccion: '', docenteId: '' }); setShowModal(true); }}
          className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all duration-300 rounded-xl">
          <Plus className="h-4 w-4" /> Nuevo Curso
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar cursos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-11 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md border-slate-200/60 dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-800 transition-all" />
        </div>
        <div className="flex gap-2">
          <select value={filterGrado} onChange={(e) => setFilterGrado(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-sm focus:ring-2 focus:ring-indigo-500 transition-all">
            <option value="">Todos los grados</option>
            {uniqueGrados.map(grado => <option key={grado} value={grado}>{grado}</option>)}
          </select>
          <div className="flex border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <button onClick={() => setViewMode('grid')} className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white/70 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-700/50 backdrop-blur-md'}`}>
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button onClick={() => setViewMode('list')} className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white/70 dark:bg-slate-800/70 hover:bg-slate-50 dark:hover:bg-slate-700/50 backdrop-blur-md'}`}>
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 hover:-translate-y-2 group bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-slate-200/60 dark:border-slate-700/60">
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
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-xl overflow-hidden">
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
                <tr key={course.id} className="hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors">
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

      {/* Modal de crear/editar curso Ultra Styling */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingCourse ? 'Editar Curso' : 'Nuevo Curso'} size="md">
        <form onSubmit={saveCourse} className="space-y-6">
          <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 -mx-6 -mt-4 mb-4 border-b border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                 <GraduationCap className="h-5 w-5" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{editingCourse ? 'Configuración del Curso' : 'Apertura de Curso'}</h3>
                  <p className="text-xs text-slate-500">Configura los metadatos y asigna un docente titular.</p>
               </div>
             </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título del Curso <span className="text-red-500">*</span></label>
            <Input value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} required
              placeholder="Ej: Desarrollo Fullstack Avanzado" className="h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Resumen y Objetivos</label>
            <textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Breve descripción del syllabus y aprendizajes esperados..." rows={3}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl resize-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ciclo Académico <span className="text-red-500">*</span></label>
              <select value={formData.grado} onChange={(e) => setFormData({ ...formData, grado: e.target.value })} required
                className="w-full h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none cursor-pointer">
                <option value="">-- Seleccionar --</option>
                {['1ro', '2do', '3ro', '4to', '5to', '6to', 'CGEU-239', 'PIAD-527'].map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bloque / Sección <span className="text-red-500">*</span></label>
              <select value={formData.seccion} onChange={(e) => setFormData({ ...formData, seccion: e.target.value })} required
                className="w-full h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none cursor-pointer">
                <option value="">-- Seleccionar --</option>
                {['A', 'B', 'C', 'D', 'TEC-NRC_17315', 'TEC-NRC_17325'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Instructor Designado</label>
            <div className="relative">
              <select value={formData.docenteId} onChange={(e) => setFormData({ ...formData, docenteId: e.target.value })}
                className="w-full h-11 px-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm appearance-none cursor-pointer">
                <option value="">Colocar en espera o sin titular</option>
                {users.map((user) => <option key={user.id} value={user.id}>{user.nombre} {user.apellido}</option>)}
              </select>
              <User className="h-4 w-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none">
              {saving ? 'Procesando...' : editingCourse ? 'Guardar Cambios' : 'Confirmar y Crear'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de confirmación de eliminación de curso */}
      <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={deleteCourseAndRefresh}
        title="Eliminar Curso" description={`¿Estás seguro de eliminar "${deletingCourse?.titulo}"? Se eliminarán todas las tareas, recursos y foros asociados.`}
        confirmText="Eliminar" variant="danger" />
    </div>
  );
}
