'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getExams, getCourses } from '@/lib/api-new';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  FileQuestion, Clock, Calendar, CheckCircle, XCircle, 
  Play, Eye, Award, BookOpen, AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ExamsPage() {
  const { user, isEstudiante } = useAuth();
  const [exams, setExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('all');

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const [examsData, coursesData] = await Promise.all([
        getExams().catch(() => []),
        getCourses().catch(() => []),
      ]);
      setExams(examsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAttemptForExam = (examId) => {
    return attempts.find(a => a.examId === examId);
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const inicio = exam.fechaInicio ? new Date(exam.fechaInicio) : null;
    const fin = exam.fechaFin ? new Date(exam.fechaFin) : null;
    
    if (!exam.activo) return { status: 'inactivo', label: 'Inactivo', color: 'bg-gray-100 text-gray-600' };
    if (inicio && now < inicio) return { status: 'pendiente', label: 'Próximamente', color: 'bg-blue-100 text-blue-600' };
    if (fin && now > fin) return { status: 'finalizado', label: 'Finalizado', color: 'bg-gray-100 text-gray-600' };
    return { status: 'disponible', label: 'Disponible', color: 'bg-green-100 text-green-600' };
  };

  const filteredExams = selectedCourse === 'all' 
    ? exams 
    : exams.filter(e => e.cursoId === parseInt(selectedCourse));

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileQuestion className="h-7 w-7" /> Exámenes
          </h1>
          <p className="text-slate-500 mt-1">
            {isEstudiante() ? 'Realiza tus exámenes y revisa tus calificaciones' : 'Gestiona los exámenes de tus cursos'}
          </p>
        </div>
      </div>

      {/* Filtro por curso */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500">Filtrar por curso:</span>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-slate-900"
        >
          <option value="all">Todos los cursos</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.titulo || c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Lista de exámenes */}
      {filteredExams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">No hay exámenes disponibles</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map(exam => {
            const status = getExamStatus(exam);
            const attempt = getAttemptForExam(exam.id);
            const canTake = status.status === 'disponible' && (!attempt || attempt.estado !== 'completado');
            
            return (
              <Card key={exam.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className={status.color}>{status.label}</Badge>
                      <CardTitle className="text-lg mt-2">{exam.titulo}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-slate-500 line-clamp-2">{exam.descripcion || 'Sin descripción'}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{exam.curso?.titulo || exam.curso?.nombre || 'Curso'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{exam.tiempoLimite} minutos</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileQuestion className="h-4 w-4" />
                      <span>{exam.preguntas?.length || 0} preguntas</span>
                    </div>
                    {exam.fechaFin && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        <span>Hasta: {new Date(exam.fechaFin).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Estado del intento (para estudiantes) */}
                  {isEstudiante() && attempt && (
                    <div className={`p-3 rounded-lg ${
                      attempt.estado === 'completado' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {attempt.estado === 'completado' ? 'Completado' : 'En progreso'}
                        </span>
                        {attempt.calificacion !== null && (
                          <span className="font-bold text-lg">{attempt.calificacion}/20</span>
                        )}
                      </div>
                      {attempt.porcentaje !== null && (
                        <div className="mt-2">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${attempt.porcentaje >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${attempt.porcentaje}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{attempt.porcentaje}% correcto</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botones de acción */}
                  <div className="flex gap-2 pt-2">
                    {isEstudiante() ? (
                      <>
                        {canTake && (
                          <Link href={`/exams/${exam.id}/take`} className="flex-1">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800">
                              <Play className="h-4 w-4 mr-2" />
                              {attempt ? 'Continuar' : 'Iniciar'}
                            </Button>
                          </Link>
                        )}
                        {attempt?.estado === 'completado' && exam.mostrarResultados && (
                          <Link href={`/exams/${exam.id}/results`}>
                            <Button variant="outline">
                              <Eye className="h-4 w-4 mr-2" /> Ver Resultados
                            </Button>
                          </Link>
                        )}
                      </>
                    ) : (
                      <Link href={`/admin/exams/${exam.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          <Eye className="h-4 w-4 mr-2" /> Gestionar
                        </Button>
                      </Link>
                    )}
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
