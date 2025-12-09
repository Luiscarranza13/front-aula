'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses, getDashboardStats, getWeeklyActivity, getTaskDistribution, getMonthlyProgress } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CardCurso from '@/components/CardCurso';
import { DashboardSkeleton } from '@/components/Skeleton';
import AnimatedCounter from '@/components/AnimatedCounter';
import { BarChart, DonutChart, LineChart, ProgressRing } from '@/components/SimpleChart';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, CheckCircle2, Clock, MessageSquare, TrendingUp, 
  Calendar, ArrowUpRight, ArrowDownRight, Users, GraduationCap, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [taskDistribution, setTaskDistribution] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [coursesData, statsData, weeklyData, taskData, monthlyData] = await Promise.all([
        getCourses(),
        getDashboardStats().catch(() => null),
        getWeeklyActivity().catch(() => []),
        getTaskDistribution().catch(() => []),
        getMonthlyProgress().catch(() => []),
      ]);
      
      setCourses(coursesData.slice(0, 6));
      setDashboardStats(statsData);
      setWeeklyActivity(weeklyData);
      setTaskDistribution(taskData);
      setMonthlyProgress(monthlyData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <DashboardSkeleton />;

  // Usar datos reales o valores por defecto
  const stats = [
    {
      title: 'Cursos Activos',
      value: dashboardStats?.courses || courses.length,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      change: `+${courses.length}`,
      changeType: 'positive',
      changeText: 'disponibles'
    },
    {
      title: 'Tareas Completadas',
      value: dashboardStats?.tasksCompleted || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-950',
      change: `${dashboardStats?.completionRate || 0}%`,
      changeType: 'positive',
      changeText: 'completado'
    },
    {
      title: 'Tareas Pendientes',
      value: dashboardStats?.tasksPending || 0,
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-950',
      change: dashboardStats?.tasksPending > 0 ? 'Pendientes' : '0',
      changeType: dashboardStats?.tasksPending > 0 ? 'negative' : 'positive',
      changeText: 'por completar'
    },
    {
      title: 'Mensajes',
      value: dashboardStats?.newMessages || 0,
      icon: MessageSquare,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-950',
      change: `+${dashboardStats?.newMessages || 0}`,
      changeType: 'positive',
      changeText: 'en foros'
    },
  ];

  // Datos por defecto si no hay datos del backend
  const defaultWeeklyActivity = [
    { label: 'Lun', value: 2 },
    { label: 'Mar', value: 4 },
    { label: 'Mié', value: 3 },
    { label: 'Jue', value: 5 },
    { label: 'Vie', value: 6 },
    { label: 'Sáb', value: 1 },
    { label: 'Dom', value: 1 },
  ];

  const defaultTaskDistribution = [
    { label: 'Completadas', value: dashboardStats?.tasksCompleted || 0, color: '#22c55e' },
    { label: 'Pendientes', value: dashboardStats?.tasksPending || 0, color: '#f97316' },
    { label: 'Vencidas', value: 0, color: '#ef4444' },
  ];

  const chartWeeklyData = weeklyActivity.length > 0 ? weeklyActivity : defaultWeeklyActivity;
  const chartTaskData = taskDistribution.length > 0 ? taskDistribution : defaultTaskDistribution;
  const chartMonthlyData = monthlyProgress.length > 0 ? monthlyProgress : [
    { label: 'Ene', value: 50 },
    { label: 'Feb', value: 60 },
    { label: 'Mar', value: 55 },
    { label: 'Abr', value: 70 },
    { label: 'May', value: 75 },
    { label: 'Jun', value: 80 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Bienvenido, {user?.nombre?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Aquí está tu resumen académico de hoy
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 md:mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Actualizar</span>
          </Button>
          <Badge variant="outline" className="gap-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span className="hidden sm:inline">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className="sm:hidden">
              {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-3 grid-cols-2 md:gap-4 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 md:p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-3 w-3 md:h-4 md:w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                <div className="text-2xl md:text-3xl font-bold">
                  <AnimatedCounter value={stat.value} duration={1500} />
                </div>
                <div className="flex items-center gap-1 mt-1 md:mt-2">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                  )}
                  <span className={`text-xs md:text-sm font-medium ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">{stat.changeText}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Actividad Semanal */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
              Actividad Semanal
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Tareas y actividades completadas esta semana
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <BarChart 
              data={chartWeeklyData} 
              height={150} 
              barColor="bg-gradient-to-t from-blue-600 to-indigo-500"
            />
          </CardContent>
        </Card>

        {/* Distribución de Tareas */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5" />
              Estado de Tareas
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Distribución actual
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-4 pt-0 md:p-6 md:pt-0">
            <DonutChart data={chartTaskData} size={120} strokeWidth={16} />
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-3 md:mt-4">
              {chartTaskData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1 md:gap-2">
                  <div className="w-2 h-2 md:w-3 md:h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] md:text-xs text-muted-foreground">{item.label}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segunda fila */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Progreso Mensual */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <GraduationCap className="h-4 w-4 md:h-5 md:w-5" />
              Progreso Mensual
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Rendimiento académico de los últimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <LineChart data={chartMonthlyData} height={130} lineColor="#8b5cf6" />
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Resumen Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="grid grid-cols-2 gap-2 md:gap-4">
              <div className="text-center p-3 md:p-4 rounded-lg bg-blue-50 dark:bg-blue-950">
                <div className="text-2xl md:text-3xl font-bold text-blue-600">
                  <AnimatedCounter value={courses.length} />
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Cursos Inscritos</p>
              </div>
              <div className="text-center p-3 md:p-4 rounded-lg bg-green-50 dark:bg-green-950">
                <div className="text-2xl md:text-3xl font-bold text-green-600">
                  <AnimatedCounter value={dashboardStats?.completionRate || 0} suffix="%" />
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Tasa Completado</p>
              </div>
              <div className="text-center p-3 md:p-4 rounded-lg bg-purple-50 dark:bg-purple-950">
                <div className="text-2xl md:text-3xl font-bold text-purple-600">
                  <AnimatedCounter value={dashboardStats?.newMessages || 0} />
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Mensajes</p>
              </div>
              <div className="text-center p-3 md:p-4 rounded-lg bg-orange-50 dark:bg-orange-950">
                <div className="text-2xl md:text-3xl font-bold text-orange-600">
                  <AnimatedCounter value={dashboardStats?.tasksPending || 0} />
                </div>
                <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mis Cursos */}
      <div>
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">Mis Cursos</h2>
          <Link href="/courses" className="text-xs md:text-sm text-primary hover:underline flex items-center gap-1">
            Ver todos
            <ArrowUpRight className="h-3 w-3 md:h-4 md:w-4" />
          </Link>
        </div>
        {courses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
              <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">No hay cursos disponibles</p>
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                Los cursos aparecerán aquí cuando estén disponibles
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {courses.map((curso) => (
              <CardCurso key={curso.id} curso={curso} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
