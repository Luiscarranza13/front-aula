'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getExamById, getExamQuestions, startExamAttempt, submitExamAttempt, checkExamTimeRemaining } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, 
  Send, FileQuestion, AlertCircle
} from 'lucide-react';} from 'lucide-react';

export default function TakeExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (user?.id && id) initExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user, id]);

  const initExam = async () => {
    try {
      const [examData, questionsData] = await Promise.all([
        getExamById(id),
        getExamQuestions(id),
      ]);
      setExam(examData);
      setQuestions(questionsData);

      // Iniciar intento
      const attemptData = await startExamAttempt(id, user.id);
      setAttempt(attemptData);

      // Cargar respuestas previas si existen
      if (attemptData.respuestas) {
        const prevAnswers = {};
        attemptData.respuestas.forEach(r => {
          prevAnswers[r.questionId] = r.respuesta;
        });
        setAnswers(prevAnswers);
      }

      // Iniciar timer
      startTimer(attemptData.id);
    } catch (error) {
      console.error('Error:', error);
      alert(error.message);
      router.push('/exams');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (attemptId) => {
    const updateTime = async () => {
      try {
        const { remaining, expired } = await checkExamTimeRemaining(attemptId);
        setTimeRemaining(remaining);
        if (expired) {
          clearInterval(timerRef.current);
          alert('¡El tiempo ha terminado!');
          router.push('/exams');
        }
      } catch (e) {}
    };

    await updateTime();
    timerRef.current = setInterval(updateTime, 1000);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '--:--';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    setSubmitting(true);
    try {
      const respuestas = Object.entries(answers).map(([questionId, respuesta]) => ({
        questionId: parseInt(questionId),
        respuesta,
      }));
      
      await submitExamAttempt(attempt.id, respuestas);
      clearInterval(timerRef.current);
      router.push(`/exams/${id}/results`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar el examen');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (loading) return <DashboardSkeleton />;
  if (!exam || !questions.length) return <div className="p-6">Examen no encontrado</div>;

  const question = questions[currentQuestion];
  const isTimeWarning = timeRemaining !== null && timeRemaining < 300; // menos de 5 min

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header fijo */}
      <div className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-lg">{exam.titulo}</h1>
              <p className="text-sm text-slate-500">{exam.curso?.nombre}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isTimeWarning ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100'
            }`}>
              <Clock className="h-5 w-5" />
              <span className="font-mono text-xl font-bold">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          
          {/* Barra de progreso */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm text-slate-500 mb-1">
              <span>Progreso: {answeredCount}/{questions.length} respondidas</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Navegación de preguntas */}
        <div className="flex flex-wrap gap-2 mb-6">
          {questions.map((q, idx) => (
            <button
              key={q.id}
              onClick={() => setCurrentQuestion(idx)}
              className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                idx === currentQuestion
                  ? 'bg-slate-900 text-white'
                  : answers[q.id]
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-white border border-slate-200 hover:border-slate-400'
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {/* Pregunta actual */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">Pregunta {currentQuestion + 1} de {questions.length}</Badge>
              <Badge className="bg-slate-100 text-slate-700">{question.puntos} puntos</Badge>
            </div>
            <CardTitle className="text-xl mt-4">{question.pregunta}</CardTitle>
          </CardHeader>
          <CardContent>
            {question.tipo === 'multiple' && question.opciones && (
              <div className="space-y-3">
                {question.opciones.map((opcion, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[question.id] === opcion
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opcion}
                      checked={answers[question.id] === opcion}
                      onChange={() => handleAnswer(question.id, opcion)}
                      className="w-5 h-5 text-slate-900"
                    />
                    <span className="flex-1">{opcion}</span>
                    {answers[question.id] === opcion && (
                      <CheckCircle className="h-5 w-5 text-slate-900" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.tipo === 'true_false' && (
              <div className="flex gap-4">
                {['Verdadero', 'Falso'].map(opcion => (
                  <label
                    key={opcion}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      answers[question.id] === opcion
                        ? 'border-slate-900 bg-slate-50'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={opcion}
                      checked={answers[question.id] === opcion}
                      onChange={() => handleAnswer(question.id, opcion)}
                      className="w-5 h-5"
                    />
                    <span className="font-medium">{opcion}</span>
                  </label>
                ))}
              </div>
            )}

            {question.tipo === 'short_answer' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(question.id, e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full p-4 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent min-h-[120px]"
              />
            )}
          </CardContent>
        </Card>

        {/* Navegación */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
            disabled={currentQuestion === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Anterior
          </Button>

          {currentQuestion < questions.length - 1 ? (
            <Button
              onClick={() => setCurrentQuestion(prev => prev + 1)}
              className="bg-slate-900 hover:bg-slate-800"
            >
              Siguiente <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4 mr-2" />
              {showConfirm ? 'Confirmar Envío' : 'Finalizar Examen'}
            </Button>
          )}
        </div>

        {/* Advertencia de preguntas sin responder */}
        {showConfirm && answeredCount < questions.length && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-yellow-800">Tienes {questions.length - answeredCount} preguntas sin responder</p>
              <p className="text-sm text-yellow-700">¿Estás seguro de que deseas enviar el examen?</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
