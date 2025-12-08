'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getStudentSubmissions, getCourses, getStudentExamAttempts, getTasksByCourse, getExams } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Award, BookOpen, FileText, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GradesPage() {
  const { user, isEstudiante } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseTasks, setCourseTasks] = useState([]);
  const [courseExams, setCourseExams] = useState([]);
  const [allTasksByCourse, setAllTasksByCourse] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [subsData, coursesData, attemptsData] = await Promise.all([
        getStudentSubmissions(user.id).catch(() => []),
        getCourses().catch(() => []),
        getStudentExamAttempts(user.id).catch(() => [])
      ]);
      setSubmissions(subsData);
      setCourses(coursesData);
      setExamAttempts(attemptsData);
      
      // Cargar tareas de todos los cursos para mostrar el conteo
      const tasksByCourse = {};
      for (const course of coursesData) {
        try {
          const tasks = await getTasksByCourse(course.id).catch(() => []);
          tasksByCourse[course.id] = tasks;
        } catch (e) {
          tasksByCourse[course.id] = [];
        }
      }
      setAllTasksByCourse(tasksByCourse);
      
      // Si hay cursos, seleccionar el primero por defecto
      if (coursesData.length > 0 && !selectedCourse) {
        await loadCourseData(coursesData[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCourseData = async (course) => {
    setSelectedCourse(course);
    try {
      const [tasksData, examsData] = await Promise.all([
        getTasksByCourse(course.id).catch(() => []),
        getExams(course.id).catch(() => [])
      ]);
      setCourseTasks(tasksData);
      setCourseExams(examsData);
    } catch (error) {
      console.error('Error al cargar datos del curso:', error);
    }
  };

  // Calcular estadísticas del curso seleccionado
  const getCourseStats = () => {
    if (!selectedCourse) return { taskCount: 0, gradedCount: 0, average: 0 };

    const courseSubmissions = submissions.filter(s => 
      courseTasks.some(t => t.id === s.tarea?.id)
    );
    const courseExamAttempts = examAttempts.filter(a => 
      courseExams.some(e => e.id === a.exam?.id)
    );

    const taskGrades = courseSubmissions
      .filter(s => s.calificacion !== null)
      .map(s => parseFloat(s.calificacion));
    
    const examGrades = courseExamAttempts
      .filter(a => a.estado === 'completado' && a.calificacion !== null)
      .map(a => {
        const grade = parseFloat(a.calificacion);
        return grade > 20 ? (grade / 100) * 20 : grade;
      });

    const allGrades = [...taskGrades, ...examGrades];
    const average = allGrades.length > 0 
      ? (allGrades.reduce((a, b) => a + b, 0) / allGrades.length).toFixed(1)
      : '0.0';

    return {
      taskCount: courseTasks.length,
      gradedCount: allGrades.length,
      average: parseFloat(average)
    };
  };

  // Obtener elementos de calificación del curso
  const getGradeItems = () => {
    if (!selectedCourse) return [];

    const gradeItems = [];

    // Agregar tareas
    courseTasks.forEach((task) => {
      const submission = submissions.find(s => s.tarea?.id === task.id);
      const grade = submission?.calificacion;
      const status = submission?.estado || 'pendiente';
      
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
    courseExams.forEach((exam) => {
      const attempt = examAttempts.find(a => a.exam?.id === exam.id);
      const grade = attempt?.calificacion;
      const isCompleted = attempt?.estado === 'completado';
      
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

    return gradeItems;
  };

  if (loading) return <DashboardSkeleton />;

  const stats = getCourseStats();
  const gradeItems = getGradeItems();

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-6">
      {/* Título */}
      <div className="flex items-center gap-3">
        <Award className="h-8 w-8 text-purple-600" />
        <h1 className="text-3xl font-bold tracking-tight">Libro de Calificaciones</h1>
      </div>

      {/* Selector de Curso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Seleccionar Curso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {courses.map(course => {
              const isSelected = selectedCourse?.id === course.id;
              const taskCount = allTasksByCourse[course.id]?.length || 0;
              
              return (
                <button
                  key={course.id}
                  onClick={() => loadCourseData(course)}
                  className={`p-4 rounded-xl text-left transition-all ${
                    isSelected 
                      ? 'bg-purple-600 text-white shadow-lg ring-2 ring-purple-600' 
                      : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border'
                  }`}
                >
                  <p className="font-semibold text-sm line-clamp-1">{course.titulo}</p>
                  <p className={`text-xs mt-1 ${isSelected ? 'text-purple-100' : 'text-muted-foreground'}`}>
                    {taskCount} tareas
                  </p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Calificaciones del Curso Seleccionado */}
      {selectedCourse && (
        <Card className="border-0 shadow-none">
          <CardContent className="p-0">
            {/* Encabezado con ID del curso */}
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                {selectedCourse.id}-{selectedCourse.grado}-{selectedCourse.seccion}
              </p>
            </div>

            {/* Título del curso y botón ABIERTO */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{selectedCourse.titulo}</h2>
              <Badge className="bg-blue-600 text-white px-4 py-2">ABIERTO</Badge>
            </div>

            {/* Información del estudiante y calificación actual */}
            {user && (
              <div className="mb-6 pb-4 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">{user.nombre} {user.apellido}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">Calificación actual</span>
                    <div className="bg-black text-white px-6 py-3 rounded font-bold text-2xl">
                      {stats.average.toFixed(1)}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                    {gradeItems.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                          No hay elementos de calificación disponibles
                        </td>
                      </tr>
                    ) : (
                      gradeItems.map((item) => {
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
                                      router.push(`/tasks?taskId=${item.taskId}`);
                                    } else {
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
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
