'use client';

import { useEffect, useState } from 'react';
import { getCourses, getTasksByCourse } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar, BookOpen, Clock, CheckCircle2, AlertCircle, 
  Search, Filter, ClipboardList, ArrowUpDown
} from 'lucide-react';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [sortBy, setSortBy] = useState('fecha');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        const allTasks = [];
        
        for (const course of coursesData) {
          try {
            const courseTasks = await getTasksByCourse(course.id);
            allTasks.push(...courseTasks.map(task => ({
              ...task,
              courseName: course.titulo,
              courseId: course.id
            })));
          } catch (e) {
            console.log('No tasks for course', course.id);
          }
        }
        
        setTasks(allTasks);
        setFilteredTasks(allTasks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];
    
    if (searchTerm) {
      filtered = filtered.filter(t => 
        t.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus) {
      filtered = filtered.filter(t => (t.estado || 'pendiente') === filterStatus);
    }
    
    if (filterCourse) {
      filtered = filtered.filter(t => t.courseId === parseInt(filterCourse));
    }
    
    // Ordenar
    filtered.sort((a, b) => {
      if (sortBy === 'fecha') {
        return new Date(a.fecha_entrega) - new Date(b.fecha_entrega);
      } else if (sortBy === 'titulo') {
        return a.titulo.localeCompare(b.titulo);
      }
      return 0;
    });
    
    setFilteredTasks(filtered);
  }, [tasks, searchTerm, filterStatus, filterCourse, sortBy]);

  if (loading) return <DashboardSkeleton />;

  const getStatusConfig = (estado) => {
    const configs = {
      pendiente: { 
        variant: 'secondary', 
        icon: Clock, 
        color: 'text-orange-600 bg-orange-100 dark:bg-orange-950',
        label: 'Pendiente'
      },
      completada: { 
        variant: 'default', 
        icon: CheckCircle2, 
        color: 'text-green-600 bg-green-100 dark:bg-green-950',
        label: 'Completada'
      },
      vencida: { 
        variant: 'destructive', 
        icon: AlertCircle, 
        color: 'text-red-600 bg-red-100 dark:bg-red-950',
        label: 'Vencida'
      }
    };
    return configs[estado] || configs.pendiente;
  };

  const isUrgent = (fecha) => {
    const diff = new Date(fecha) - new Date();
    return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
  };

  const getDaysRemaining = (fecha) => {
    const diff = new Date(fecha) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Vencida';
    if (days === 0) return 'Hoy';
    if (days === 1) return 'Mañana';
    return `${days} días`;
  };

  const stats = {
    total: tasks.length,
    pendientes: tasks.filter(t => (t.estado || 'pendiente') === 'pendiente').length,
    completadas: tasks.filter(t => t.estado === 'completada').length,
    urgentes: tasks.filter(t => isUrgent(t.fecha_entrega)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mis Tareas</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          Gestiona y revisa todas tus tareas pendientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <ClipboardList className="h-4 w-4 md:h-5 md:w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-orange-100 dark:bg-orange-950">
              <Clock className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-orange-600">{stats.pendientes}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Pendientes</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.completadas}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Completadas</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-red-100 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-red-600">{stats.urgentes}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Urgentes</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tareas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 md:h-10 text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 md:px-3 py-1.5 md:py-2 border rounded-lg bg-white dark:bg-gray-800 text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
            <option value="vencida">Vencidas</option>
          </select>
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-2 md:px-3 py-1.5 md:py-2 border rounded-lg bg-white dark:bg-gray-800 text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="">Todos los cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.titulo}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 md:px-3 py-1.5 md:py-2 border rounded-lg bg-white dark:bg-gray-800 text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="fecha">Ordenar por fecha</option>
            <option value="titulo">Ordenar por título</option>
          </select>
        </div>
      </div>

      {/* Lista de tareas */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterStatus || filterCourse 
                ? 'No se encontraron tareas' 
                : 'No tienes tareas asignadas'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Las tareas de tus cursos aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const statusConfig = getStatusConfig(task.estado || 'pendiente');
            const StatusIcon = statusConfig.icon;
            const urgent = isUrgent(task.fecha_entrega);
            
            return (
              <Card 
                key={task.id} 
                className={`transition-all hover:shadow-md ${
                  urgent ? 'border-orange-300 dark:border-orange-700 border-2' : ''
                }`}
              >
                <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-2 md:gap-4">
                    <div className="space-y-1 flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-base md:text-xl">{task.titulo}</CardTitle>
                        {urgent && (
                          <Badge variant="outline" className="text-orange-600 border-orange-300 animate-pulse text-[10px] md:text-xs">
                            ⚡ Urgente
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center gap-2 text-xs md:text-sm">
                        <BookOpen className="h-3 w-3 md:h-4 md:w-4" />
                        {task.courseName || 'Curso'}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusConfig.color} gap-1 text-[10px] md:text-xs whitespace-nowrap`}>
                      <StatusIcon className="h-2.5 w-2.5 md:h-3 md:w-3" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 p-3 pt-0 md:p-6 md:pt-0">
                  <p className="text-sm md:text-base text-muted-foreground">{task.descripcion}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 md:gap-4">
                    <div className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${urgent ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span className="hidden md:inline">
                        Entrega: {new Date(task.fecha_entrega).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      <span className="md:hidden">
                        {new Date(task.fecha_entrega).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <Badge variant="outline" className={`${urgent ? 'text-orange-600 border-orange-300' : ''} text-[10px] md:text-xs`}>
                        {getDaysRemaining(task.fecha_entrega)}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" className="text-xs md:text-sm h-8 md:h-9 w-full sm:w-auto">
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
