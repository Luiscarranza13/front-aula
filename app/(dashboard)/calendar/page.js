'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAllTasks, getCourses } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen } from 'lucide-react';

export default function CalendarPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksData, coursesData] = await Promise.all([getAllTasks(), getCourses()]);
      setTasks(tasksData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getTasksForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.fecha_entrega?.startsWith(dateStr));
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const isToday = (day) => today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <CalendarIcon className="h-8 w-8" /> Calendario
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Button variant="ghost" size="icon" onClick={prevMonth}><ChevronLeft className="h-5 w-5" /></Button>
            <CardTitle className="text-xl">{monthNames[month]} {year}</CardTitle>
            <Button variant="ghost" size="icon" onClick={nextMonth}><ChevronRight className="h-5 w-5" /></Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
              ))}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square" />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dayTasks = getTasksForDate(day);
                const hasTask = dayTasks.length > 0;
                const isSelected = selectedDate === day;
                return (
                  <button key={day} onClick={() => setSelectedDate(day)}
                    className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all relative
                      ${isToday(day) ? 'bg-indigo-600 text-white font-bold' : ''}
                      ${isSelected && !isToday(day) ? 'bg-indigo-100 dark:bg-indigo-900 ring-2 ring-indigo-500' : ''}
                      ${!isToday(day) && !isSelected ? 'hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                    `}>
                    {day}
                    {hasTask && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayTasks.slice(0, 3).map((_, idx) => (
                          <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isToday(day) ? 'bg-white' : 'bg-indigo-500'}`} />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tareas del día */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              {selectedDate ? `${selectedDate} de ${monthNames[month]}` : 'Selecciona un día'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateTasks.length > 0 ? (
                <div className="space-y-3">
                  {selectedDateTasks.map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium">{task.titulo}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className={task.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                          {task.estado}
                        </Badge>
                        {task.curso && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <BookOpen className="h-3 w-3" /> {task.curso.titulo}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No hay tareas para este día</p>
              )
            ) : (
              <p className="text-muted-foreground text-center py-8">Selecciona un día para ver las tareas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximas tareas */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas entregas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter(t => t.estado !== 'completada' && new Date(t.fecha_entrega) >= today)
              .sort((a, b) => new Date(a.fecha_entrega) - new Date(b.fecha_entrega))
              .slice(0, 6)
              .map(task => (
                <div key={task.id} className="p-4 border rounded-xl hover:shadow-md transition-shadow">
                  <h4 className="font-medium line-clamp-1">{task.titulo}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(task.fecha_entrega).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  <Badge variant="secondary" className="mt-2 bg-yellow-100 text-yellow-700">{task.estado}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
