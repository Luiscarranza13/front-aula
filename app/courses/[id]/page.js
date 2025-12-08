'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getCourseById, getTasksByCourse, getResourcesByCourse, getForumsByCourse,
  createTask, createResource, createForum, deleteTask, deleteResource, deleteForum,
  getExams, getStudentExamAttempts, getStudentSubmissions,
  API_URL
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CourseSkeleton } from '@/components/Skeleton';
import Modal, { ModalFooter, ConfirmModal } from '@/components/Modal';
import FileUpload from '@/components/FileUpload';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, Download, Calendar, MessageSquare, User, GraduationCap, 
  ExternalLink, Plus, Trash2, AlertCircle, CheckCircle2,
  Clock, BookOpen, ArrowLeft, ClipboardList, Award, Play, Trophy
} from 'lucide-react';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isDocente } = useAuth();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [forums, setForums] = useState([]);
  const [exams, setExams] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
  // Modales
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [showForumModal, setShowForumModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Forms
  const [taskForm, setTaskForm] = useState({ titulo: '', descripcion: '', fecha_entrega: '', estado: 'pendiente' });
  const [resourceForm, setResourceForm] = useState({ nombre_archivo: '', tipo_recurso: 'documento', url: '' });
  const [forumForm, setForumForm] = useState({ titulo: '', descripcion: '' });
  const [uploadedFile, setUploadedFile] = useState(null);

  const canEdit = isAdmin() || isDocente();
  const isStudent = !isAdmin() && !isDocente();

  const fetchData = async () => {
    try {
      const [courseData, tasksData, resourcesData, forumsData, examsData] = await Promise.all([
        getCourseById(params.id),
        getTasksByCourse(params.id).catch(() => []),
        getResourcesByCourse(params.id).catch(() => []),
        getForumsByCourse(params.id).catch(() => []),
        getExams(params.id).catch(() => []),
      ]);

      setCourse(courseData);
      setTasks(tasksData);
      setResources(resourcesData);
      setForums(forumsData);
      setExams(examsData);

      // Si es estudiante, cargar sus intentos de exámenes y entregas
      if (user && !isAdmin() && !isDocente()) {
        const [attemptsData, submissionsData] = await Promise.all([
          getStudentExamAttempts(user.id).catch(() => []),
          getStudentSubmissions(user.id).catch(() => []),
        ]);
        setExamAttempts(attemptsData);
        setSubmissions(submissionsData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Handlers para Tareas
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTask({ ...taskForm, cursoId: parseInt(params.id) });
      showNotification('Tarea creada correctamente');
      setShowTaskModal(false);
      setTaskForm({ titulo: '', descripcion: '', fecha_entrega: '', estado: 'pendiente' });
      fetchData();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para Recursos
  const handleFileUpload = async (files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFile(file);
      setResourceForm(prev => ({
        ...prev,
        nombre_archivo: file.originalName,
        url: `${API_URL}${file.url}`,
      }));
    }
  };

  const handleCreateResource = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createResource({ ...resourceForm, cursoId: parseInt(params.id) });
      showNotification('Recurso creado correctamente');
      setShowResourceModal(false);
      setResourceForm({ nombre_archivo: '', tipo_recurso: 'documento', url: '' });
      setUploadedFile(null);
      fetchData();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handlers para Foros
  const handleCreateForum = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createForum({ ...forumForm, cursoId: parseInt(params.id) });
      showNotification('Foro creado correctamente');
      setShowForumModal(false);
      setForumForm({ titulo: '', descripcion: '' });
      fetchData();
    } catch (error) {
      showNotification(error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Handler para eliminar
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      if (deleteItem.type === 'task') {
        await deleteTask(deleteItem.id);
      } else if (deleteItem.type === 'resource') {
        await deleteResource(deleteItem.id);
      } else if (deleteItem.type === 'forum') {
        await deleteForum(deleteItem.id);
      }
      showNotification('Eliminado correctamente');
      fetchData();
    } catch (error) {
      showNotification(error.message, 'error');
    }
    setDeleteItem(null);
    setShowDeleteModal(false);
  };

  if (loading) return <CourseSkeleton />;
  if (!course) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Curso no encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/courses')}>
            Volver a cursos
          </Button>
        </CardContent>
      </Card>
    );
  }

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
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/courses')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>

      <Card className="border-2 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-6 right-6">
            <h1 className="text-3xl font-bold text-white">{course.titulo}</h1>
          </div>
        </div>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <Badge variant="secondary" className="gap-1">
              <GraduationCap className="h-3 w-3" />
              {course.grado} - {course.seccion}
            </Badge>
            {course.docente && (
              <Badge variant="outline" className="gap-1">
                <User className="h-3 w-3" />
                {course.docente.nombre}
              </Badge>
            )}
            <Badge className="bg-green-500 gap-1">Activo</Badge>
          </div>
          {course.descripcion && (
            <p className="text-muted-foreground mt-4">{course.descripcion}</p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="calificaciones" className="space-y-4">
        <TabsList className="grid w-full grid-cols-8 border-b border-gray-200 dark:border-gray-700 bg-transparent h-auto p-0">
          <TabsTrigger value="contenido" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <FileText className="h-4 w-4" />
            <span>Contenido</span>
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <Calendar className="h-4 w-4" />
            <span>Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="anuncios" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <MessageSquare className="h-4 w-4" />
            <span>Anuncios</span>
          </TabsTrigger>
          <TabsTrigger value="debates" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <MessageSquare className="h-4 w-4" />
            <span>Debates</span>
          </TabsTrigger>
          <TabsTrigger value="calificaciones" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <Award className="h-4 w-4" />
            <span>Libro de calificaciones</span>
            {(() => {
              const ungradedCount = submissions.filter(s => s.calificacion === null && s.estado === 'entregado').length;
              return ungradedCount > 0 ? ` (${ungradedCount})` : '';
            })()}
          </TabsTrigger>
          <TabsTrigger value="mensajes" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <MessageSquare className="h-4 w-4" />
            <span>Mensajes</span>
          </TabsTrigger>
          <TabsTrigger value="grupos" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <User className="h-4 w-4" />
            <span>Grupos</span>
          </TabsTrigger>
          <TabsTrigger value="logros" className="gap-2 border-b-2 border-transparent data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 rounded-none">
            <Trophy className="h-4 w-4" />
            <span>Logros</span>
          </TabsTrigger>
        </TabsList>

        {/* TAREAS */}
        <TabsContent value="tareas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Tareas del Curso</CardTitle>
                <CardDescription>Asignaciones y trabajos</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => setShowTaskModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nueva Tarea
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay tareas disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <Card key={task.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{task.titulo}</CardTitle>
                            <CardDescription>{task.descripcion}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={task.estado === 'completada' ? 'default' : 'secondary'}>
                              {task.estado === 'completada' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
                              {task.estado}
                            </Badge>
                            {canEdit && (
                              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                                setDeleteItem({ id: task.id, type: 'task', name: task.titulo });
                                setShowDeleteModal(true);
                              }}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Entrega: {new Date(task.fecha_entrega).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EXÁMENES */}
        <TabsContent value="examenes" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Exámenes del Curso</CardTitle>
                <CardDescription>Evaluaciones y tests disponibles</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => router.push('/admin/exams')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Gestionar Exámenes
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {exams.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay exámenes disponibles</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exams.map((exam) => {
                    const attempt = examAttempts.find(a => a.exam?.id === exam.id);
                    const isCompleted = attempt?.estado === 'completado';
                    const score = attempt?.calificacion;
                    
                    return (
                      <Card key={exam.id} className={isCompleted ? 'border-green-200 bg-green-50/50' : ''}>
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg flex items-center gap-2">
                                {exam.titulo}
                                {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                              </CardTitle>
                              <CardDescription>{exam.descripcion}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <Badge className="bg-green-600">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  {score?.toFixed(1)}/100
                                </Badge>
                              ) : (
                                <Badge variant="secondary">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {exam.tiempo_limite} min
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <ClipboardList className="h-4 w-4" />
                                {exam.preguntas?.length || 0} preguntas
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {exam.tiempo_limite} minutos
                              </span>
                            </div>
                            {!isCompleted && (
                              <Button onClick={() => router.push(`/exams/${exam.id}/take`)} className="gap-2">
                                <Play className="h-4 w-4" />
                                Iniciar Examen
                              </Button>
                            )}
                            {isCompleted && (
                              <Button variant="outline" onClick={() => router.push(`/exams`)}>
                                Ver Resultados
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALIFICACIONES - LIBRO DE CALIFICACIONES */}
        <TabsContent value="calificaciones" className="space-y-4">
          <Card className="border-0 shadow-none">
            <CardContent className="p-0">
              {/* Encabezado con ID del curso */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">{course.id}-{course.grado}-{course.seccion}</p>
              </div>

              {/* Título del curso y botón ABIERTO */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{course.titulo}</h2>
                <Badge className="bg-blue-600 text-white px-4 py-2">ABIERTO</Badge>
              </div>

              {/* Información del estudiante y calificación actual */}
              {isStudent && user && (() => {
                const courseSubmissions = submissions.filter(s => 
                  tasks.some(t => t.id === s.tarea?.id && t.cursoId === course.id)
                );
                const courseExamAttempts = examAttempts.filter(a => 
                  exams.some(e => e.id === a.exam?.id && e.cursoId === course.id)
                );
                
                const taskGrades = courseSubmissions
                  .filter(s => s.calificacion !== null)
                  .map(s => parseFloat(s.calificacion));
                const examGrades = courseExamAttempts
                  .filter(a => a.estado === 'completado' && a.calificacion !== null)
                  .map(a => {
                    // Convertir de escala 0-100 a 0-20 si es necesario
                    const grade = parseFloat(a.calificacion);
                    return grade > 20 ? (grade / 100) * 20 : grade;
                  });
                
                const allGrades = [...taskGrades, ...examGrades];
                const currentGrade = allGrades.length > 0 
                  ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1)
                  : '0.0';

                return (
                  <div className="mb-6 pb-4 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold">{user.nombre} {user.apellido}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Calificación actual</span>
                        <div className="bg-black text-white px-6 py-3 rounded font-bold text-2xl">
                          {currentGrade}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Tabla de Calificaciones */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Calificaciones</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                          <div className="flex items-center gap-2">
                            Nombre del elemento
                            <span className="text-xs text-gray-400">↕</span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                          <div className="flex items-center gap-2">
                            Fecha de vencimiento
                            <span className="text-xs text-gray-400">↕</span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                          <div className="flex items-center gap-2">
                            Estado
                            <span className="text-xs text-gray-400">↕</span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                          <div className="flex items-center gap-2">
                            Calificación
                            <span className="text-xs text-gray-400">↕</span>
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700 dark:text-gray-300 border-b">
                          Resultados
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const gradeItems = [];
                        
                        // Agregar tareas
                        tasks.forEach((task) => {
                          const submission = submissions.find(s => s.tarea?.id === task.id);
                          const grade = submission?.calificacion;
                          const status = submission?.estado || 'pendiente';
                          
                          // Formatear fecha de vencimiento
                          let fechaVencimiento = null;
                          if (task.fecha_entrega) {
                            fechaVencimiento = new Date(task.fecha_entrega);
                          }
                          
                          gradeItems.push({
                            id: `task-${task.id}`,
                            nombre: task.titulo,
                            fechaVencimiento: fechaVencimiento,
                            estado: status === 'calificado' ? 'Calificado' : status === 'entregado' ? 'Entregado' : '',
                            calificacion: grade !== null && grade !== undefined ? parseFloat(grade).toFixed(1) : null,
                            tipo: 'tarea',
                            submissionId: submission?.id,
                            taskId: task.id
                          });
                        });

                        // Agregar exámenes
                        exams.forEach((exam) => {
                          const attempt = examAttempts.find(a => a.exam?.id === exam.id);
                          const grade = attempt?.calificacion;
                          const isCompleted = attempt?.estado === 'completado';
                          
                          // Convertir calificación de 0-100 a 0-20 si es necesario
                          let displayGrade = null;
                          if (grade !== null && grade !== undefined) {
                            const numGrade = parseFloat(grade);
                            displayGrade = numGrade > 20 ? ((numGrade / 100) * 20).toFixed(1) : numGrade.toFixed(1);
                          }
                          
                          gradeItems.push({
                            id: `exam-${exam.id}`,
                            nombre: exam.titulo,
                            fechaVencimiento: exam.fechaFin || exam.fechaInicio,
                            estado: isCompleted ? 'Calificado' : '',
                            calificacion: displayGrade,
                            tipo: 'examen',
                            attemptId: attempt?.id,
                            examId: exam.id
                          });
                        });

                        if (gradeItems.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                                No hay elementos de calificación disponibles
                              </td>
                            </tr>
                          );
                        }

                        return gradeItems.map((item) => {
                          let fechaFormateada = 'Continuo';
                          if (item.fechaVencimiento) {
                            try {
                              const fecha = item.fechaVencimiento instanceof Date 
                                ? item.fechaVencimiento 
                                : new Date(item.fechaVencimiento);
                              fechaFormateada = fecha.toLocaleDateString('es-ES', { 
                                day: '2-digit', 
                                month: '2-digit', 
                                year: '2-digit' 
                              });
                            } catch (e) {
                              fechaFormateada = 'Continuo';
                            }
                          }

                          return (
                            <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                                  {item.tipo === 'tarea' ? (
                                    <FileText className="h-4 w-4 text-gray-600" />
                                  ) : (
                                    <Calendar className="h-4 w-4 text-gray-600" />
                                  )}
                                  <span className="font-medium">{item.nombre}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {fechaFormateada}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                {item.estado || ''}
                              </td>
                              <td className="px-4 py-3">
                                {item.calificacion !== null ? (
                                  <div className="bg-black text-white px-3 py-1.5 rounded font-bold inline-block">
                                    {item.calificacion}
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.calificacion !== null && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-black text-white hover:bg-gray-800 border-black"
                                    onClick={() => {
                                      if (item.tipo === 'tarea') {
                                        // Navegar a detalles de la tarea o mostrar modal
                                        router.push(`/tasks?taskId=${item.taskId}`);
                                      } else {
                                        // Navegar a resultados del examen
                                        router.push(`/exams/${item.examId}/results`);
                                      }
                                    }}
                                  >
                                    Vista
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTENIDO */}
        <TabsContent value="contenido" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recursos del Curso</CardTitle>
                <CardDescription>Materiales y archivos compartidos</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => setShowResourceModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Recurso
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {resources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay recursos disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{resource.nombre_archivo}</p>
                          <p className="text-sm text-muted-foreground capitalize">{resource.tipo_recurso}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button asChild size="sm" variant="outline">
                          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                            <Download className="h-4 w-4" />
                            Descargar
                          </a>
                        </Button>
                        {canEdit && (
                          <Button size="sm" variant="ghost" className="text-red-600" onClick={() => {
                            setDeleteItem({ id: resource.id, type: 'resource', name: resource.nombre_archivo });
                            setShowDeleteModal(true);
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CALENDARIO */}
        <TabsContent value="calendario" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendario del Curso</CardTitle>
              <CardDescription>Fechas importantes y eventos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>El calendario se mostrará aquí</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANUNCIOS */}
        <TabsContent value="anuncios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anuncios del Curso</CardTitle>
              <CardDescription>Comunicaciones importantes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay anuncios disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* DEBATES */}
        <TabsContent value="debates" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Foros del Curso</CardTitle>
                <CardDescription>Espacios de discusión</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => setShowForumModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Foro
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {forums.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay foros disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {forums.map((forum) => (
                    <Link key={forum.id} href={`/forum/${forum.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{forum.titulo}</p>
                            <p className="text-sm text-muted-foreground">{forum.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          {canEdit && (
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={(e) => {
                              e.preventDefault();
                              setDeleteItem({ id: forum.id, type: 'forum', name: forum.titulo });
                              setShowDeleteModal(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* MENSAJES */}
        <TabsContent value="mensajes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensajes del Curso</CardTitle>
              <CardDescription>Comunicación con el docente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay mensajes disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GRUPOS */}
        <TabsContent value="grupos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grupos del Curso</CardTitle>
              <CardDescription>Grupos de trabajo y colaboración</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay grupos disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGROS */}
        <TabsContent value="logros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logros del Curso</CardTitle>
              <CardDescription>Reconocimientos y logros obtenidos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay logros disponibles</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FOROS */}
        <TabsContent value="foro" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Foros del Curso</CardTitle>
                <CardDescription>Espacios de discusión</CardDescription>
              </div>
              {canEdit && (
                <Button onClick={() => setShowForumModal(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nuevo Foro
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {forums.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay foros disponibles</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {forums.map((forum) => (
                    <Link key={forum.id} href={`/forum/${forum.id}`}>
                      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <MessageSquare className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium group-hover:text-primary transition-colors">{forum.titulo}</p>
                            <p className="text-sm text-muted-foreground">{forum.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          {canEdit && (
                            <Button size="sm" variant="ghost" className="text-red-600" onClick={(e) => {
                              e.preventDefault();
                              setDeleteItem({ id: forum.id, type: 'forum', name: forum.titulo });
                              setShowDeleteModal(true);
                            }}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Nueva Tarea */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Nueva Tarea" description="Crea una nueva tarea para este curso">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input value={taskForm.titulo} onChange={(e) => setTaskForm({ ...taskForm, titulo: e.target.value })} required placeholder="Título de la tarea" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={taskForm.descripcion} onChange={(e) => setTaskForm({ ...taskForm, descripcion: e.target.value })} placeholder="Descripción de la tarea..." className="w-full px-3 py-2 border rounded-lg resize-none h-20" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Fecha de Entrega *</label>
            <Input type="date" value={taskForm.fecha_entrega} onChange={(e) => setTaskForm({ ...taskForm, fecha_entrega: e.target.value })} required />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Tarea'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Nuevo Recurso */}
      <Modal isOpen={showResourceModal} onClose={() => setShowResourceModal(false)} title="Nuevo Recurso" description="Sube un archivo o agrega un enlace">
        <form onSubmit={handleCreateResource} className="space-y-4">
          <FileUpload onUploadComplete={handleFileUpload} accept="*" />
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre del Archivo *</label>
            <Input value={resourceForm.nombre_archivo} onChange={(e) => setResourceForm({ ...resourceForm, nombre_archivo: e.target.value })} required placeholder="Nombre del recurso" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Recurso</label>
            <select value={resourceForm.tipo_recurso} onChange={(e) => setResourceForm({ ...resourceForm, tipo_recurso: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              <option value="documento">Documento</option>
              <option value="video">Video</option>
              <option value="imagen">Imagen</option>
              <option value="pdf">PDF</option>
              <option value="enlace">Enlace</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">URL {!uploadedFile && '*'}</label>
            <Input value={resourceForm.url} onChange={(e) => setResourceForm({ ...resourceForm, url: e.target.value })} required={!uploadedFile} placeholder="https://..." />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowResourceModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Recurso'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Nuevo Foro */}
      <Modal isOpen={showForumModal} onClose={() => setShowForumModal(false)} title="Nuevo Foro" description="Crea un espacio de discusión">
        <form onSubmit={handleCreateForum} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título *</label>
            <Input value={forumForm.titulo} onChange={(e) => setForumForm({ ...forumForm, titulo: e.target.value })} required placeholder="Título del foro" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Descripción</label>
            <textarea value={forumForm.descripcion} onChange={(e) => setForumForm({ ...forumForm, descripcion: e.target.value })} placeholder="Descripción del foro..." className="w-full px-3 py-2 border rounded-lg resize-none h-20" />
          </div>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => setShowForumModal(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Crear Foro'}</Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Confirmar Eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        description={`¿Estás seguro de eliminar "${deleteItem?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        variant="danger"
      />
    </div>
  );
}
