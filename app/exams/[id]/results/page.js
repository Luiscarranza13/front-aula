'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getExamById, getExamQuestions, getStudentExamAttempts, getAttemptById } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  CheckCircle, XCircle, ArrowLeft, Award, FileQuestion, 
  Clock, Calendar, BookOpen
} from 'lucide-react';
import Link from 'next/link';

export default function ExamResultsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id && id) fetchData();
  }, [user, id]);

  const fetchData = async () => {
    try {
      const [examData, questionsData, attemptsData] = await Promise.all([
        getExamById(id),
        getExamQuestions(id),
        getStudentExamAttempts(user.id, parseInt(id))
      ]);

      setExam(examData);
      setQuestions(questionsData);
      
      // Obtener el intento completado más reciente
      const completedAttempt = attemptsData.find(a => a.estado === 'completado');
      if (completedAttempt) {
        const attemptDetails = await getAttemptById(completedAttempt.id);
        setAttempt(attemptDetails);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionResult = (questionId) => {
    if (!attempt?.respuestas) return null;
    const answer = attempt.respuestas.find(r => r.questionId === questionId);
    if (!answer) return null;
    
    const question = questions.find(q => q.id === questionId);
    if (!question) return null;
    
    const isCorrect = answer.respuesta === question.respuestaCorrecta;
    return { answer: answer.respuesta, isCorrect, correctAnswer: question.respuestaCorrecta };
  };

  if (loading) return <DashboardSkeleton />;
  if (!exam) return <div className="p-6">Examen no encontrado</div>;
  if (!attempt) return (
    <div className="p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileQuestion className="h-12 w-12 text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No hay resultados disponibles para este examen</p>
          <Button onClick={() => router.push('/exams')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Exámenes
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const grade = attempt.calificacion;
  const percentage = attempt.porcentaje;
  const isPassing = percentage >= 60;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="h-7 w-7" /> Resultados del Examen
          </h1>
          <p className="text-slate-500 mt-1">{exam.titulo}</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/exams')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Resumen de Calificación */}
      <Card className={isPassing ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-2">Calificación Final</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{grade?.toFixed(1) || '0.0'}</span>
                <span className="text-xl text-slate-500">/ 20</span>
              </div>
              <div className="mt-2">
                <Badge className={isPassing ? 'bg-green-600' : 'bg-red-600'}>
                  {percentage?.toFixed(1) || '0'}% Correcto
                </Badge>
              </div>
            </div>
            <div className="text-right">
              {isPassing ? (
                <CheckCircle className="h-16 w-16 text-green-600" />
              ) : (
                <XCircle className="h-16 w-16 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Examen */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Examen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Curso</p>
                <p className="font-medium">{exam.curso?.titulo || exam.curso?.nombre || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Preguntas</p>
                <p className="font-medium">{questions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Tiempo</p>
                <p className="font-medium">{exam.tiempoLimite} min</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">Completado</p>
                <p className="font-medium">
                  {attempt.finalizadoEn 
                    ? new Date(attempt.finalizadoEn).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalle de Respuestas */}
      <Card>
        <CardHeader>
          <CardTitle>Detalle de Respuestas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questions.map((question, index) => {
              const result = getQuestionResult(question.id);
              const isCorrect = result?.isCorrect;
              
              return (
                <div 
                  key={question.id} 
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50/50' 
                      : 'border-red-200 bg-red-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">
                        Pregunta {index + 1}
                      </span>
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {question.puntos} puntos
                    </Badge>
                  </div>
                  
                  <p className="font-medium mb-3 text-slate-900">{question.pregunta}</p>
                  
                  {question.tipo === 'multiple' && question.opciones && (
                    <div className="space-y-2 mb-3">
                      {question.opciones.map((opcion, idx) => {
                        const isSelected = result?.answer === opcion;
                        const isCorrectAnswer = question.respuestaCorrecta === opcion;
                        
                        return (
                          <div
                            key={idx}
                            className={`p-2 rounded border ${
                              isCorrectAnswer
                                ? 'bg-green-100 border-green-300'
                                : isSelected && !isCorrect
                                ? 'bg-red-100 border-red-300'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {isCorrectAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {isSelected && !isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span className={isCorrectAnswer ? 'font-semibold' : ''}>
                                {opcion}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {!isCorrect && result && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-800">
                        <strong>Respuesta correcta:</strong> {result.correctAnswer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex gap-3 justify-center">
        <Button onClick={() => router.push('/exams')} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Exámenes
        </Button>
        <Button onClick={() => router.push(`/courses/${exam.cursoId}`)}>
          <BookOpen className="h-4 w-4 mr-2" />
          Ver Curso
        </Button>
      </div>
    </div>
  );
}

