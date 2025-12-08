'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardStats, getCourses, getUsers, getAllTasks } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import { BarChart, DonutChart, LineChart } from '@/components/SimpleChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, Users, BookOpen, ClipboardList, TrendingUp, Download, 
  Calendar, PieChart, Activity, FileText
} from 'lucide-react';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!isAdmin()) { router.push('/dashboard'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsData, coursesData, usersData, tasksData] = await Promise.all([
        getDashboardStats().catch(() => null),
        getCourses(),
        getUsers(),
        getAllTasks()
      ]);
      setStats(statsData);
      setCourses(coursesData);
      setUsers(usersData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const usersByRole = [
    { label: 'Admins', value: users.filter(u => u.rol === 'admin').length, color: '#ef4444' },
    { label: 'Docentes', value: users.filter(u => u.rol === 'docente').length, color: '#3b82f6' },
    { label: 'Estudiantes', value: users.filter(u => u.rol === 'estudiante').length, color: '#22c55e' },
  ];

  const tasksByStatus = [
    { label: 'Completadas', value: tasks.filter(t => t.estado === 'completada').length, color: '#22c55e' },
    { label: 'Pendientes', value: tasks.filter(t => t.estado === 'pendiente').length, color: '#f97316' },
    { label: 'En progreso', value: tasks.filter(t => t.estado === 'en_progreso').length, color: '#3b82f6' },
  ];

  const coursesByGrade = ['1ro', '2do', '3ro', '4to', '5to', '6to'].map(g => ({
    label: g,
    value: courses.filter(c => c.grado === g).length
  }));

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8" /> Reportes y Estadísticas
          </h1>
          <p className="text-muted-foreground mt-1">Análisis completo del sistema</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Exportar PDF
        </Button>
      </div>

      {/* Stats principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-xl"><Users className="h-6 w-6 text-white" /></div>
              <div>
                <div className="text-3xl font-bold">{users.length}</div>
                <div className="text-sm text-muted-foreground">Usuarios</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-xl"><BookOpen className="h-6 w-6 text-white" /></div>
              <div>
                <div className="text-3xl font-bold">{courses.length}</div>
                <div className="text-sm text-muted-foreground">Cursos</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-xl"><ClipboardList className="h-6 w-6 text-white" /></div>
              <div>
                <div className="text-3xl font-bold">{tasks.length}</div>
                <div className="text-sm text-muted-foreground">Tareas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-xl"><TrendingUp className="h-6 w-6 text-white" /></div>
              <div>
                <div className="text-3xl font-bold">{stats?.completionRate || 0}%</div>
                <div className="text-sm text-muted-foreground">Completado</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Usuarios por Rol</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <DonutChart data={usersByRole} size={160} strokeWidth={20} />
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {usersByRole.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ClipboardList className="h-5 w-5" /> Estado de Tareas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <DonutChart data={tasksByStatus} size={160} strokeWidth={20} />
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {tasksByStatus.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm">{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" /> Cursos por Grado</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={coursesByGrade} height={180} barColor="bg-gradient-to-t from-indigo-600 to-purple-500" />
          </CardContent>
        </Card>
      </div>

      {/* Tablas de resumen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Cursos</CardTitle>
            <CardDescription>Cursos con más contenido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(0, 5).map((course, idx) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                    <div>
                      <div className="font-medium">{course.titulo}</div>
                      <div className="text-xs text-muted-foreground">{course.grado} - {course.seccion}</div>
                    </div>
                  </div>
                  <Badge variant="secondary">{course.docente?.nombre || 'Sin docente'}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { icon: Users, text: 'Nuevo usuario registrado', time: 'Hace 2 horas', color: 'text-blue-500' },
                { icon: BookOpen, text: 'Curso actualizado', time: 'Hace 3 horas', color: 'text-green-500' },
                { icon: ClipboardList, text: 'Tarea calificada', time: 'Hace 5 horas', color: 'text-orange-500' },
                { icon: FileText, text: 'Recurso subido', time: 'Hace 1 día', color: 'text-purple-500' },
                { icon: Activity, text: 'Sistema actualizado', time: 'Hace 2 días', color: 'text-gray-500' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <item.icon className={`h-5 w-5 ${item.color}`} />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{item.text}</div>
                    <div className="text-xs text-muted-foreground">{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
