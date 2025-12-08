'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAllTasks, getTasksByCourse, getTaskSubmissions, gradeSubmission, getCourses, getCourseStudents, createSubmission } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardList, CheckCircle2, AlertCircle, Save, BookOpen, 
  Calendar, Users, ChevronDown, FileText
} from 'lucide-react';

export default function SubmissionsPage() {
  const { isAdmin, isDocente } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [courseTasks, setCourseTasks] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [grades, setGrades] = useState({});
  const [tasksByCourse, setTasksByCourse] = useState({});

  useEffect(() => {
    if (!isAdmin() && !isDocente()) { router.push('/dashboard'); return; }
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [tasksData, coursesData] = await Promise.all([
        getAllTasks().catch(() => []),
        getCourses().catch(() => [])
      ]);
      setTasks(tasksData || []);
      setCourses(coursesData || []);
      
      // Cargar tareas por curso para mostrar el conteo correcto
      const tasksByCourseMap = {};
      if (coursesData && coursesData.length > 0) {
        for (const course of coursesData) {
          try {
            const courseTasks = await getTasksByCourse(course.id).catch(() => []);
            tasksByCourseMap[course.id] = courseTasks;
          } catch (e) {
            tasksByCourseMap[course.id] = [];
          }
        }
      }
      setTasksByCourse(tasksByCourseMap);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (course) => {
    setSelectedCourse(course);
    setLoadingData(true);
    setGrades({});
    
    try {
      // Obtener estudiantes del curso
      const studentsData = await getCourseStudents(course.id);
      setStudents(studentsData);
      
      // Obtener tareas del curso directamente desde la API
      const courseTasksData = await getTasksByCourse(course.id).catch(() => []);
      setCourseTasks(courseTasksData);
      
      // Actualizar el conteo de tareas en el mapa
      setTasksByCourse(prev => ({
        ...prev,
        [course.id]: courseTasksData
      }));
      
      // Obtener todas las entregas de todas las tareas del curso
      const submissionsPromises = courseTasksData.map(task => 
        getTaskSubmissions(task.id).catch(() => [])
      );
      const submissionsResults = await Promise.all(submissionsPromises);
      const allSubs = submissionsResults.flat();
      setAllSubmissions(allSubs);
      
      // Inicializar grades
      const initialGrades = {};
      studentsData.forEach(student => {
        initialGrades[student.id] = {};
        courseTasksData.forEach(task => {
          const sub = allSubs.find(s => s.estudiante?.id === student.id && s.tarea?.id === task.id);
          initialGrades[student.id][task.id] = {
            calificacion: sub?.calificacion ?? '',
            submissionId: sub?.id || null,
            hasSubmission: !!sub
          };
        });
      });
      setGrades(initialGrades);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleGradeChange = (studentId, taskId, value) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [taskId]: {
          ...prev[studentId]?.[taskId],
          calificacion: value
        }
      }
    }));
  };

  const saveGrade = async (studentId, taskId) => {
    const gradeData = grades[studentId]?.[taskId];
    if (!gradeData || gradeData.calificacion === '') return;
    
    setSaving(true);
    try {
      if (gradeData.submissionId) {
        await gradeSubmission(gradeData.submissionId, parseFloat(gradeData.calificacion), '');
      } else {
        const newSub = await createSubmission({
          tareaId: taskId,
          estudianteId: studentId,
          contenido: 'Calificación directa',
          estado: 'calificado'
        });
        await gradeSubmission(newSub.id, parseFloat(gradeData.calificacion), '');
        setGrades(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            [taskId]: { ...prev[studentId][taskId], submissionId: newSub.id, hasSubmission: true }
          }
        }));
      }
      showNotification('Calificación guardada');
    } catch (error) {
      showNotification('Error: ' + error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveAllGrades = async () => {
    setSaving(true);
    let saved = 0;
    
    for (const student of students) {
      for (const task of courseTasks) {
        const gradeData = grades[student.id]?.[task.id];
        if (gradeData && gradeData.calificacion !== '' && gradeData.calificacion !== null) {
          try {
            if (gradeData.submissionId) {
              await gradeSubmission(gradeData.submissionId, parseFloat(gradeData.calificacion), '');
            } else {
              const newSub = await createSubmission({
                tareaId: task.id,
                estudianteId: student.id,
                contenido: 'Calificación directa',
                estado: 'calificado'
              });
              await gradeSubmission(newSub.id, parseFloat(gradeData.calificacion), '');
            }
            saved++;
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    
    setSaving(false);
    showNotification(`${saved} calificaciones guardadas`);
    loadCourseData(selectedCourse);
  };

  const calculateAverage = (studentId) => {
    const studentGrades = grades[studentId];
    if (!studentGrades) return null;
    
    const validGrades = Object.values(studentGrades)
      .map(g => parseFloat(g.calificacion))
      .filter(g => !isNaN(g));
    
    if (validGrades.length === 0) return null;
    return (validGrades.reduce((a, b) => a + b, 0) / validGrades.length).toFixed(1);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {notification.message}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-indigo-600" /> Libro de Calificaciones
        </h1>
        {selectedCourse && students.length > 0 && (
          <Button onClick={saveAllGrades} disabled={saving} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4" /> {saving ? 'Guardando...' : 'Guardar Todo'}
          </Button>
        )}
      </div>

      {/* Selector de Curso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          {courses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-semibold mb-2">No hay cursos disponibles</p>
              <p className="text-sm mb-4">Crea cursos primero para poder calificar tareas</p>
              <Button 
                variant="outline" 
                onClick={() => router.push(`/admin/courses`)}
                className="gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Ir a Gestión de Cursos
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {courses.map(course => {
              // Usar el conteo de tareas cargado por curso
              const taskCount = tasksByCourse[course.id]?.length || 0;
              const isSelected = selectedCourse?.id === course.id;
              return (
                <button
                  key={course.id}
                  onClick={() => loadCourseData(course)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-indigo-600 text-white shadow-lg ring-2 ring-indigo-600' 
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border'
                  }`}
                >
                  <p className="font-semibold text-sm line-clamp-1">{course.titulo}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-indigo-100' : 'text-muted-foreground'}`}>
                    {taskCount} tareas
                  </p>
                </button>
              );
            })}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Calificaciones */}
      {selectedCourse && (
        <Card>
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{selectedCourse.titulo}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {students.length} estudiantes • {courseTasks.length} tareas
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loadingData ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No hay estudiantes inscritos</p>
              </div>
            ) : courseTasks.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold mb-2">No hay tareas en este curso</p>
                <p className="text-sm mb-4">Crea tareas desde la página de gestión del curso para poder calificar</p>
                <Button 
                  variant="outline" 
                  onClick={() => router.push(`/admin/courses`)}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Ir a Gestión de Cursos
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800 border-b">
                      <th className="text-left p-4 font-semibold text-sm sticky left-0 bg-gray-50 dark:bg-gray-800 min-w-[200px]">
                        Estudiante
                      </th>
                      {courseTasks.map(task => (
                        <th key={task.id} className="p-3 font-medium text-xs text-center min-w-[100px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className="line-clamp-2">{task.titulo}</span>
                            <span className="text-muted-foreground font-normal">
                              {task.fecha_entrega ? new Date(task.fecha_entrega).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }) : '-'}
                            </span>
                          </div>
                        </th>
                      ))}
                      <th className="p-3 font-semibold text-sm text-center min-w-[80px] bg-indigo-50 dark:bg-indigo-900/30">
                        Promedio
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, idx) => {
                      const average = calculateAverage(student.id);
                      return (
                        <tr key={student.id} className={`border-b ${idx % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50/50 dark:bg-gray-800/50'}`}>
                          <td className="p-4 sticky left-0 bg-inherit">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-semibold text-sm">
                                {student.nombre?.charAt(0) || 'E'}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{student.nombre}</p>
                                <p className="text-xs text-muted-foreground">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          {courseTasks.map(task => {
                            const gradeData = grades[student.id]?.[task.id] || {};
                            const hasValue = gradeData.calificacion !== '' && gradeData.calificacion !== undefined;
                            return (
                              <td key={task.id} className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Input
                                    type="number"
                                    min="0"
                                    max="20"
                                    step="0.5"
                                    value={gradeData.calificacion ?? ''}
                                    onChange={(e) => handleGradeChange(student.id, task.id, e.target.value)}
                                    onBlur={() => hasValue && saveGrade(student.id, task.id)}
                                    placeholder="-"
                                    className={`w-16 text-center text-sm h-8 ${
                                      hasValue 
                                        ? parseFloat(gradeData.calificacion) >= 11 
                                          ? 'bg-green-50 border-green-300 text-green-700' 
                                          : 'bg-red-50 border-red-300 text-red-700'
                                        : ''
                                    }`}
                                  />
                                </div>
                              </td>
                            );
                          })}
                          <td className="p-3 text-center bg-indigo-50/50 dark:bg-indigo-900/20">
                            {average !== null ? (
                              <Badge className={`text-sm px-3 py-1 ${
                                parseFloat(average) >= 11 
                                  ? 'bg-green-600' 
                                  : 'bg-red-600'
                              }`}>
                                {average}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leyenda */}
      {selectedCourse && students.length > 0 && courseTasks.length > 0 && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
            <span>Aprobado (≥11)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span>Desaprobado (&lt;11)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
            <span>Sin calificar</span>
          </div>
        </div>
      )}
    </div>
  );
}
