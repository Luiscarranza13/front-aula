'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getExamById, getExamQuestions, addExamQuestion, updateExamQuestion, deleteExamQuestion, updateExam } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Modal from '@/components/Modal';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  FileQuestion, Plus, Trash2, Edit, Save, GripVertical,
  CheckCircle, XCircle, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function ManageExamPage() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    pregunta: '',
    tipo: 'multiple',
    opciones: ['', '', '', ''],
    respuestaCorrecta: '',
    puntos: 10,
  });

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [examData, questionsData] = await Promise.all([
        getExamById(id),
        getExamQuestions(id),
      ]);
      setExam(examData);
      setQuestions(questionsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        opciones: formData.tipo === 'multiple' ? formData.opciones.filter(o => o.trim()) : null,
        orden: questions.length,
      };
      
      if (editingQuestion) {
        await updateExamQuestion(editingQuestion.id, data);
      } else {
        await addExamQuestion(id, data);
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      pregunta: question.pregunta,
      tipo: question.tipo,
      opciones: question.opciones || ['', '', '', ''],
      respuestaCorrecta: question.respuestaCorrecta,
      puntos: question.puntos,
    });
    setShowModal(true);
  };

  const handleDelete = async (questionId) => {
    if (!confirm('¿Eliminar esta pregunta?')) return;
    try {
      await deleteExamQuestion(questionId);
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setEditingQuestion(null);
    setFormData({
      pregunta: '',
      tipo: 'multiple',
      opciones: ['', '', '', ''],
      respuestaCorrecta: '',
      puntos: 10,
    });
  };

  const updateOption = (index, value) => {
    const newOpciones = [...formData.opciones];
    newOpciones[index] = value;
    setFormData({ ...formData, opciones: newOpciones });
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.puntos, 0);

  if (loading) return <DashboardSkeleton />;
  if (!exam) return <div className="p-6">Examen no encontrado</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/exams">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{exam.titulo}</h1>
          <p className="text-slate-500">{exam.curso?.nombre} · {questions.length} preguntas · {totalPoints} puntos totales</p>
        </div>
        <Button onClick={() => { resetForm(); setShowModal(true); }} className="bg-slate-900 hover:bg-slate-800">
          <Plus className="h-4 w-4 mr-2" /> Agregar Pregunta
        </Button>
      </div>

      {/* Lista de preguntas */}
      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileQuestion className="h-12 w-12 text-slate-300 mb-4" />
            <p className="text-slate-500">No hay preguntas en este examen</p>
            <Button onClick={() => setShowModal(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" /> Agregar primera pregunta
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question, idx) => (
            <Card key={question.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <GripVertical className="h-5 w-5" />
                    <span className="font-bold text-lg">{idx + 1}</span>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {question.tipo === 'multiple' ? 'Opción múltiple' : 
                         question.tipo === 'true_false' ? 'Verdadero/Falso' : 'Respuesta corta'}
                      </Badge>
                      <Badge className="bg-slate-100 text-slate-700">{question.puntos} pts</Badge>
                    </div>
                    
                    <p className="font-medium mb-3">{question.pregunta}</p>
                    
                    {question.tipo === 'multiple' && question.opciones && (
                      <div className="grid grid-cols-2 gap-2">
                        {question.opciones.map((opcion, i) => (
                          <div 
                            key={i}
                            className={`p-2 rounded text-sm ${
                              opcion === question.respuestaCorrecta 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : 'bg-slate-50 text-slate-600'
                            }`}
                          >
                            {opcion === question.respuestaCorrecta && (
                              <CheckCircle className="h-4 w-4 inline mr-1" />
                            )}
                            {opcion}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {question.tipo === 'true_false' && (
                      <p className="text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Respuesta correcta: {question.respuestaCorrecta}
                      </p>
                    )}
                    
                    {question.tipo === 'short_answer' && (
                      <p className="text-sm text-green-600">
                        <CheckCircle className="h-4 w-4 inline mr-1" />
                        Respuesta: {question.respuestaCorrecta}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(question)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(question.id)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal agregar/editar pregunta */}
      <Modal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); resetForm(); }} 
        title={editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
      >
        <form onSubmit={handleAddQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Pregunta</label>
            <textarea
              value={formData.pregunta}
              onChange={(e) => setFormData({ ...formData, pregunta: e.target.value })}
              placeholder="Escribe la pregunta..."
              className="w-full p-2 border rounded-lg text-sm"
              rows={3}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de pregunta</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="w-full p-2 border rounded-lg text-sm"
              >
                <option value="multiple">Opción múltiple</option>
                <option value="true_false">Verdadero/Falso</option>
                <option value="short_answer">Respuesta corta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Puntos</label>
              <Input
                type="number"
                value={formData.puntos}
                onChange={(e) => setFormData({ ...formData, puntos: parseInt(e.target.value) })}
                min={1}
              />
            </div>
          </div>
          
          {formData.tipo === 'multiple' && (
            <div>
              <label className="block text-sm font-medium mb-2">Opciones</label>
              <div className="space-y-2">
                {formData.opciones.map((opcion, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correcta"
                      checked={formData.respuestaCorrecta === opcion && opcion !== ''}
                      onChange={() => setFormData({ ...formData, respuestaCorrecta: opcion })}
                      className="w-4 h-4"
                    />
                    <Input
                      value={opcion}
                      onChange={(e) => updateOption(idx, e.target.value)}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">Selecciona la opción correcta</p>
            </div>
          )}
          
          {formData.tipo === 'true_false' && (
            <div>
              <label className="block text-sm font-medium mb-2">Respuesta correcta</label>
              <div className="flex gap-4">
                {['Verdadero', 'Falso'].map(opcion => (
                  <label key={opcion} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correcta"
                      checked={formData.respuestaCorrecta === opcion}
                      onChange={() => setFormData({ ...formData, respuestaCorrecta: opcion })}
                      className="w-4 h-4"
                    />
                    <span>{opcion}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          
          {formData.tipo === 'short_answer' && (
            <div>
              <label className="block text-sm font-medium mb-1">Respuesta correcta</label>
              <Input
                value={formData.respuestaCorrecta}
                onChange={(e) => setFormData({ ...formData, respuestaCorrecta: e.target.value })}
                placeholder="Respuesta esperada"
                required
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => { setShowModal(false); resetForm(); }}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
              {editingQuestion ? 'Guardar Cambios' : 'Agregar Pregunta'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
