'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, User, GraduationCap, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMemo } from 'react';

export default function CardCurso({ curso }) {
  // Color consistente basado en el ID del curso
  const colorIndex = useMemo(() => curso.id % 6, [curso.id]);
  
  const colors = [
    { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-100 text-blue-700' },
    { bg: 'from-purple-500 to-purple-600', light: 'bg-purple-100 text-purple-700' },
    { bg: 'from-green-500 to-green-600', light: 'bg-green-100 text-green-700' },
    { bg: 'from-orange-500 to-orange-600', light: 'bg-orange-100 text-orange-700' },
    { bg: 'from-pink-500 to-pink-600', light: 'bg-pink-100 text-pink-700' },
    { bg: 'from-indigo-500 to-indigo-600', light: 'bg-indigo-100 text-indigo-700' }
  ];
  
  const color = colors[colorIndex];
  
  // Progreso simulado (en producción vendría del backend)
  const progress = useMemo(() => Math.floor(Math.random() * 60) + 40, [curso.id]);
  const tasksCompleted = useMemo(() => Math.floor(Math.random() * 8) + 2, [curso.id]);
  const totalTasks = useMemo(() => tasksCompleted + Math.floor(Math.random() * 5) + 1, [tasksCompleted]);

  return (
    <Link href={`/courses/${curso.id}`} className="block group">
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer border-0 shadow-md">
        {/* Header con gradiente */}
        <div className={`h-36 bg-gradient-to-br ${color.bg} relative overflow-hidden`}>
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white rounded-full" />
            <div className="absolute -right-4 top-16 w-24 h-24 bg-white rounded-full" />
          </div>
          
          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          
          {/* Contenido del header */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <Badge className="mb-2 bg-white/20 text-white border-0 backdrop-blur-sm">
              <GraduationCap className="h-3 w-3 mr-1" />
              {curso.grado} - {curso.seccion}
            </Badge>
            <h3 className="text-white font-bold text-lg line-clamp-2 group-hover:underline decoration-2 underline-offset-2">
              {curso.titulo}
            </h3>
          </div>
          
          {/* Flecha de navegación */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
              <ArrowRight className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        
        <CardContent className="p-4 space-y-4">
          {/* Docente */}
          {curso.docente && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-sm font-medium">
                {curso.docente.nombre?.charAt(0) || 'D'}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {curso.docente.nombre}
                </p>
                <p className="text-xs text-muted-foreground">Docente</p>
              </div>
            </div>
          )}
          
          {/* Barra de progreso */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progreso del curso</span>
              <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${color.bg} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              <span>{tasksCompleted}/{totalTasks} tareas</span>
            </div>
            <Badge variant="outline" className={`text-xs ${color.light} border-0`}>
              <BookOpen className="h-3 w-3 mr-1" />
              Activo
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
