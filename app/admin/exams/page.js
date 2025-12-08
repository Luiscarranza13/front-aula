'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getExams, getCourses, createExam, deleteExam, addExamQuestion } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/Modal';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  FileQuestion, Plus, Trash2, Edit, Eye, Clock, Users,
  BookOpen, Calendar, CheckCircle, Settings
} from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsData, coursesData] = await Promise.all([
        getExams(),
        getCourses(),
      ]);
      setExams(examsData);
      setCourses(coursesData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
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
      console.error('Error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este examen?')) return;
    try {
      await deleteExam(id);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileQuestion className="h-7 w-7" /> Gestión de Exámenes
          </h1>
          <p className="text-slate-500 mt-1">Crea y administra exámenes para tus cursos</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Nuevo Examen
        </Button>
      </div>

      {/* Lista de exámenes */}
      {exams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">No hay exámenes creados</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Crear primer examen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map(exam => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{exam.titulo}</h3>
                      <Badge className={exam.activo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                        {exam.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-4">{exam.descripcion || 'Sin descripción'}</p>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        <span>{exam.curso?.nombre}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{exam.tiempoLimite} min</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileQuestion className="h-4 w-4" />
                        <span>{exam.preguntas?.length || 0} preguntas</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{exam.intentosPermitidos} intento(s)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/exams/${exam.id}`}>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" /> Gestionar
                      </Button>
                    </Link>
                    <Link href={`/admin/exams/${exam.id}/grades`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" /> Calificaciones
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(exam.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal crear examen */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear Nuevo Examen">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Título</label>
            <Input
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              placeholder="Ej: Examen Parcial 1"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Instrucciones del examen..."
              className="w-full p-2 border rounded-lg text-sm"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Curso</label>
            <select
              value={formData.cursoId}
              onChange={(e) => setFormData({ ...formData, cursoId: e.target.value })}
              className="w-full p-2 border rounded-lg text-sm"
              required
            >
              <option value="">Seleccionar curso</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tiempo límite (min)</label>
              <Input
                type="number"
                value={formData.tiempoLimite}
                onChange={(e) => setFormData({ ...formData, tiempoLimite: parseInt(e.target.value) })}
                min={1}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Intentos permitidos</label>
              <Input
                type="number"
                value={formData.intentosPermitidos}
                onChange={(e) => setFormData({ ...formData, intentosPermitidos: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fecha inicio</label>
              <Input
                type="datetime-local"
                value={formData.fechaInicio}
                onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fecha fin</label>
              <Input
                type="datetime-local"
                value={formData.fechaFin}
                onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.mostrarResultados}
                onChange={(e) => setFormData({ ...formData, mostrarResultados: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Mostrar resultados al finalizar</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.aleatorizar}
                onChange={(e) => setFormData({ ...formData, aleatorizar: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm">Aleatorizar preguntas</span>
            </label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
              Crear Examen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
