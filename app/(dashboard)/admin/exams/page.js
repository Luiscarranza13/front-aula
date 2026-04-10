'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getExams, getCourses, createExam, deleteExam } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  FileQuestion, Plus, Trash2, Clock, Users,
  BookOpen, Settings, AlertCircle, Calendar, GraduationCap, X
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminExamsPage() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    cursoId: '',
    tiempoLimite: 60,
    intentosPermitidos: 1,
    fechaInicio: '',
    fechaFin: '',
    mostrarResultados: true,
    aleatorizar: false,
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsData, coursesData] = await Promise.all([
        getExams().catch(() => []),
        getCourses().catch(() => []),
      ]);
      setExams(examsData || []);
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titulo.trim()) errors.titulo = 'El título es obligatorio.';
    if (!formData.cursoId) errors.cursoId = 'Debes seleccionar un curso.';
    if (formData.tiempoLimite < 1) errors.tiempoLimite = 'El tiempo límite debe ser mayor a 0.';
    if (formData.intentosPermitidos < 1) errors.intentosPermitidos = 'Debe permitir al menos 1 intento.';
    
    if (formData.fechaInicio && formData.fechaFin) {
      if (new Date(formData.fechaFin) <= new Date(formData.fechaInicio)) {
        errors.fechaFin = 'La fecha de fin debe ser posterior a la de inicio.';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createExam({
        ...formData,
        cursoId: parseInt(formData.cursoId),
        docenteId: user.id,
      });
      setShowModal(false);
      setFormData({
        titulo: '', descripcion: '', cursoId: '', tiempoLimite: 60,
        intentosPermitidos: 1, fechaInicio: '', fechaFin: '',
        mostrarResultados: true, aleatorizar: false,
      });
      fetchData();
    } catch (error) {
      console.error('Error creando:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este examen? Todos los intentos se perderán.')) return;
    try {
      await deleteExam(id);
      fetchData();
    } catch (error) {
      console.error('Error eliminando:', error);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-8 min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-900/50">
      {/* Premium Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-4 border border-indigo-100 dark:border-indigo-500/20">
            <FileQuestion className="h-3.5 w-3.5" /> Evaluaciones Globales
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Gestión de Exámenes
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xl text-sm leading-relaxed">
            Diseña, asigna y supervisa pruebas estructuradas. Administra tiempos límite y bancos de preguntas para medir el desempeño académico eficientemente.
          </p>
        </div>
        
        <button 
          onClick={() => setShowModal(true)} 
          className="relative z-10 inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" /> Nuevo Examen
        </button>
      </div>

      {/* Lista de Exámenes */}
      {exams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-4">
            <FileQuestion className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Sin evaluaciones</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-6">
            Aún no has creado ningún examen en tus cursos. Comienza creando tu primera evaluación.
          </p>
          <button 
            onClick={() => setShowModal(true)} 
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Crear ahora →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {exams.map((exam, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={exam.id}
            >
              <Card className="hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 border-slate-200/60 dark:border-slate-800/60 rounded-2xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {exam.titulo}
                          </h3>
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                            exam.activo 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {exam.activo ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 line-clamp-2 leading-relaxed">
                          {exam.descripcion || 'Sin descripción detallada proporcionada para este examen.'}
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                          <div className="flex items-center gap-1.5" title="Curso asigando">
                            <BookOpen className="h-3.5 w-3.5 text-indigo-500" />
                            <span className="truncate max-w-[120px]">{exam.curso?.titulo || 'General'}</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <div className="flex items-center gap-1.5" title="Tiempo límite">
                            <Clock className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{exam.tiempoLimite}m</span>
                          </div>
                          <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                          <div className="flex items-center gap-1.5" title="Preguntas configuradas">
                            <FileQuestion className="h-3.5 w-3.5 text-purple-500" />
                            <span>{exam.preguntas?.length || 0} items</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Link href={`/admin/exams/${exam.id}`}>
                          <button className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 transition-colors tooltip-trigger" title="Editar y gestionar">
                            <Settings className="h-4 w-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(exam.id)} 
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors tooltip-trigger" 
                          title="Eliminar examen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Footer decoration */}
                  <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modern Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
              onClick={() => setShowModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-2xl bg-white dark:bg-slate-950 rounded-[2rem] shadow-2xl border border-slate-200/60 dark:border-slate-800/60 z-50 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nueva Evaluación</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configura las directrices generales del examen.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-200/50 hover:bg-slate-200 dark:bg-slate-800 hover:dark:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto">
                <form id="examForm" onSubmit={handleCreate} className="space-y-6">
                  
                  {/* Título y Curso */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Título del Examen <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.titulo}
                        onChange={(e) => {
                          setFormData({ ...formData, titulo: e.target.value });
                          if (formErrors.titulo) setFormErrors({...formErrors, titulo: null});
                        }}
                        placeholder="Ej: Evaluación Parcial Q1"
                        className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${formErrors.titulo ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl px-4 py-3 text-sm outline-none transition-all`}
                      />
                      {formErrors.titulo && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {formErrors.titulo}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Curso Vinculado <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <select
                          value={formData.cursoId}
                          onChange={(e) => {
                            setFormData({ ...formData, cursoId: e.target.value });
                            if (formErrors.cursoId) setFormErrors({...formErrors, cursoId: null});
                          }}
                          className={`w-full appearance-none bg-slate-50 dark:bg-slate-900/50 border ${formErrors.cursoId ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl px-4 py-3 text-sm outline-none transition-all pr-10`}
                        >
                          <option value="">-- Selecciona el curso --</option>
                          {courses.map(c => (
                            <option key={c.id} value={c.id}>{c.titulo || c.nombre} ({c.grado}-{c.seccion})</option>
                          ))}
                        </select>
                        <GraduationCap className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                      {formErrors.cursoId && <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {formErrors.cursoId}</span>}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Descripción / Instrucciones</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                      placeholder="Instrucciones previas al inicio del examen..."
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none h-24"
                    />
                  </div>
                  
                  <div className="h-px bg-slate-100 dark:bg-slate-800/60 w-full" />

                  {/* Parámetros */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Límite (min) <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={formData.tiempoLimite}
                        onChange={(e) => {
                          setFormData({ ...formData, tiempoLimite: parseInt(e.target.value) });
                          if (formErrors.tiempoLimite) setFormErrors({...formErrors, tiempoLimite: null});
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${formErrors.tiempoLimite ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl px-4 py-3 text-sm outline-none transition-all`}
                        min={1}
                      />
                      {formErrors.tiempoLimite && <span className="text-xs text-red-500">{formErrors.tiempoLimite}</span>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Intentos <span className="text-red-500">*</span></label>
                      <input
                        type="number"
                        value={formData.intentosPermitidos}
                        onChange={(e) => {
                          setFormData({ ...formData, intentosPermitidos: parseInt(e.target.value) });
                          if (formErrors.intentosPermitidos) setFormErrors({...formErrors, intentosPermitidos: null});
                        }}
                        className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${formErrors.intentosPermitidos ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-500/20 focus:border-indigo-500'} rounded-xl px-4 py-3 text-sm outline-none transition-all`}
                        min={1}
                      />
                      {formErrors.intentosPermitidos && <span className="text-xs text-red-500">{formErrors.intentosPermitidos}</span>}
                    </div>

                    <div className="space-y-2 lg:col-span-2">
                       <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ventana de Disponibilidad</label>
                       <div className="flex items-center gap-3">
                        <div className="relative w-full">
                           <input
                            type="datetime-local"
                            value={formData.fechaInicio}
                            onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-3 text-sm outline-none transition-all text-slate-900 dark:text-slate-100"
                           />
                           {formErrors.fechaInicio && <span className="absolute -bottom-5 text-[10px] text-red-500 leading-tight">{formErrors.fechaInicio}</span>}
                        </div>
                        <span className="text-slate-400 text-sm">a</span>
                        <div className="relative w-full">
                           <input
                            type="datetime-local"
                            value={formData.fechaFin}
                            onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
                            className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${formErrors.fechaFin ? 'border-red-400 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'} rounded-xl px-3 py-3 text-sm outline-none transition-all text-slate-900 dark:text-slate-100`}
                           />
                           {formErrors.fechaFin && <span className="absolute -bottom-5 text-[10px] text-red-500 leading-tight">{formErrors.fechaFin}</span>}
                        </div>
                       </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-6 mt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={formData.mostrarResultados}
                          onChange={(e) => setFormData({ ...formData, mostrarResultados: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors" />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
                        Mostrar resultados al finalizar
                      </span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={formData.aleatorizar}
                          onChange={(e) => setFormData({ ...formData, aleatorizar: e.target.checked })}
                          className="peer sr-only"
                        />
                        <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 peer-checked:bg-indigo-500 peer-checked:border-indigo-500 transition-colors" />
                        <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">
                        Aleatorizar preguntas
                      </span>
                    </label>
                  </div>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/20 flex justify-end gap-3 rounded-b-[2rem]">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  form="examForm"
                  className="px-6 py-2.5 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                >
                  Confirmar y Crear
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
