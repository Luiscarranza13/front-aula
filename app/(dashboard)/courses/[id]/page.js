'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  getCourseById, getTasksByCourse, getResourcesByCourse, getForumsByCourse, getExams,
  getStudentExamAttempts, getStudentSubmissions
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { CourseSkeleton } from '@/components/Skeleton';
import Link from 'next/link';
import { 
  FileText, Download, Calendar, MessageSquare, User, 
  Clock, BookOpen, ArrowLeft, ClipboardList, ChevronDown, CheckCircle2,
  Mail, Users, Award, Play, Trophy, FilePlus2, Megaphone, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CourseUltraPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAdmin, isDocente } = useAuth();
  const [course, setCourse] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [resources, setResources] = useState([]);
  const [forums, setForums] = useState([]);
  const [exams, setExams] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('contenido');
  const [expandedModules, setExpandedModules] = useState({ 'module-1': true, 'module-2': true });

  const canEdit = isAdmin() || isDocente();
  const isStudent = !isAdmin() && !isDocente();

  const fetchData = async () => {
    try {
      const [courseData, tasksData, resourcesData, forumsData, examsData] = await Promise.all([
        getCourseById(params.id),
        getTasksByCourse(params.id).catch(() => []),
        getResourcesByCourse(params.id).catch(() => []),
        getForumsByCourse(params.id).catch(() => []),
        getExams(params.id).catch(() => []),
      ]);
      setCourse(courseData);
      setTasks(tasksData || []);
      setResources(resourcesData || []);
      setForums(forumsData || []);
      setExams(examsData || []);

      if (user && !isAdmin() && !isDocente()) {
        const [attemptsData, submissionsData] = await Promise.all([
          getStudentExamAttempts(user.id).catch(() => []),
          getStudentSubmissions(user.id).catch(() => []),
        ]);
        setExamAttempts(attemptsData || []);
        setSubmissions(submissionsData || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  if (loading) return <CourseSkeleton />;
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Curso no encontrado</h2>
        <button onClick={() => router.push('/courses')} className="mt-4 text-indigo-600 hover:underline">Volver a mis cursos</button>
      </div>
    );
  }

  // Combinar recursos, tareas y exámenes en "módulos" de contenido (Simulando Blackboard)
  // En un sistema real, los recursos pertenecerían a "módulos o semanas".
  const allContentItems = [
    ...resources.map(r => ({ ...r, ultraType: 'resource', icon: FileText })),
    ...tasks.map(t => ({ ...t, ultraType: 'task', icon: ClipboardList })),
    ...exams.map(e => ({ ...e, ultraType: 'exam', icon: Award }))
  ].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  return (
    <div className="bg-[#f0f0f0] min-h-screen pb-12 -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8">
      
      {/* Top Black Navigation Bar */}
      <div className="bg-[#262626] text-[#b3b3b3] sticky top-[64px] z-30 shadow-md">
        <div className="flex items-center px-4 h-12 overflow-x-auto no-scrollbar max-w-[1600px] mx-auto text-sm font-semibold">
          <button onClick={() => router.push('/courses')} className="text-[#cccccc] hover:text-white mr-6 flex items-center pr-4 border-r border-[#404040]">
            <ArrowLeft className="w-4 h-4 mr-2" /> Cursos
          </button>
          
          <span className="text-[#a6a6a6] truncate max-w-[200px] mr-2">
            {new Date().getFullYear()}-{course.grado}-{course.seccion}
          </span>
          <span className="text-white font-bold truncate max-w-[300px] mr-8">
            • {course.titulo}
          </span>

          <nav className="flex items-center space-x-6">
            {[
              { id: 'contenido', label: 'Contenido' },
              { id: 'calendario', label: 'Calendario' },
              { id: 'anuncios', label: 'Anuncios' },
              { id: 'debates', label: 'Debates' },
              { id: 'calificaciones', label: 'Libro de calificaciones' },
              { id: 'mensajes', label: 'Mensajes' },
              { id: 'grupos', label: 'Grupos' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 leading-[48px] border-b-2 hover:text-white transition-colors ${
                  activeTab === tab.id 
                    ? 'border-white text-white' 
                    : 'border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Hero Banner Image */}
      <div className="relative w-full h-[180px] sm:h-[220px] bg-gradient-to-r from-[#0033A0] via-[#0052cc] to-[#00174f] flex flex-col justify-end overflow-hidden max-w-[1600px] mx-auto">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute right-0 bottom-0 h-full w-1/3 bg-gradient-to-l from-[#00174f] to-transparent opacity-80" />
        <div className="absolute -right-20 top-0 opacity-20">
          <BookOpen className="w-[300px] h-[300px] text-white" />
        </div>
        
        <div className="relative z-10 px-8 pb-6">
          <h1 className="text-4xl sm:text-5xl font-black text-white drop-shadow-md tracking-tight">
            {course.titulo}
          </h1>
          <p className="text-[#a6c8ff] font-medium mt-1">
            {new Date().getFullYear()}-{course.grado}-{course.seccion}
          </p>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 mt-6">
        
        {/* Contenido principal vs Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Columna Izquierda (70%) */}
          <div className="w-full lg:w-[70%]">
            
            {activeTab === 'contenido' && (
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-4">
                <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
                  <h2 className="text-[#333333] font-bold text-lg flex items-center gap-2">
                    Contenido del curso
                  </h2>
                  {canEdit && (
                    <div className="flex gap-2">
                      <button className="text-sm font-semibold text-[#5c5c5c] hover:text-black transition-colors rounded hover:bg-gray-100 px-3 py-1 flex items-center">
                        <FilePlus2 className="w-4 h-4 mr-1.5" /> Agregar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* Modulo 1 Fijo (Simulado) */}
                  <div className="border border-gray-200 hover:border-gray-300 transition-colors bg-white hover:bg-[#fafafa]">
                    <div 
                      onClick={() => toggleModule('module-1')}
                      className="px-5 py-4 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#f0f0f0] group-hover:bg-[#e6e6e6] rounded-sm transition-colors">
                          <MessageSquare className="w-5 h-5 text-[#5c5c5c]" />
                        </div>
                        <h3 className="font-semibold text-[15px] text-[#333333] group-hover:underline">Bienvenida al Periodo {new Date().getFullYear()}</h3>
                      </div>
                      <button className="p-2 flex items-center justify-center rounded-full hover:bg-gray-200">
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedModules['module-1'] ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedModules['module-1'] && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-200 bg-[#fafafa]">
                           <div className="px-16 py-4 flex flex-col gap-3">
                             <div className="flex items-center gap-3 text-sm text-[#4d4d4d] cursor-pointer hover:underline">
                               <FileText className="w-4 h-4 text-[#8c8c8c]" /> Sílabo del curso (PDF)
                             </div>
                             <div className="flex items-center gap-3 text-sm text-[#4d4d4d] cursor-pointer hover:underline">
                               <Video className="w-4 h-4 text-[#8c8c8c]" /> Clase en TEAMS con el Instructor
                             </div>
                           </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Modulo 2: Contenido Dinámico Real */}
                  <div className="border border-gray-200 hover:border-gray-300 transition-colors bg-white hover:bg-[#fafafa]">
                    <div 
                      onClick={() => toggleModule('module-2')}
                      className="px-5 py-4 flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#f0f0f0] group-hover:bg-[#e6e6e6] rounded-sm transition-colors">
                          <BookOpen className="w-5 h-5 text-[#5c5c5c]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[15px] text-[#333333] group-hover:underline">Materiales y Actividades del Curso</h3>
                          <p className="text-[#737373] text-sm mt-0.5 max-w-[500px]">Estimado estudiante, todos los archivos y tareas podrán accederse a continuación.</p>
                        </div>
                      </div>
                      <button className="p-2 flex items-center justify-center rounded-full hover:bg-gray-200">
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expandedModules['module-2'] ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    <AnimatePresence>
                      {expandedModules['module-2'] && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-200 bg-[#fafafa]">
                           <div className="flex flex-col">
                             {allContentItems.length === 0 ? (
                               <div className="px-16 py-6 text-sm text-[#737373]">No hay contenidos disponibles en este módulo.</div>
                             ) : (
                               allContentItems.map((item, idx) => (
                                 <div key={`${item.ultraType}-${item.id}`} className={`px-16 py-4 flex items-center justify-between hover:bg-[#f0f0f0] transition-colors cursor-pointer ${idx !== allContentItems.length-1 ? 'border-b border-gray-200' : ''}`}>
                                   <div className="flex items-center gap-4">
                                     <item.icon className="w-5 h-5 text-[#303030]" />
                                     <div>
                                       <span className="text-[15px] font-medium text-[#333333] hover:underline">
                                         {item.titulo || item.nombre_archivo}
                                       </span>
                                       {item.ultraType === 'task' && (
                                         <div className="text-xs text-[#737373] mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Vence: {item.fecha_entrega ? new Date(item.fecha_entrega).toLocaleDateString() : 'Sin fecha'}</div>
                                       )}
                                     </div>
                                   </div>
                                   {/* Acciones de estudiante */}
                                   {isStudent && item.ultraType === 'task' && (
                                     <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded uppercase">Entregar</span>
                                   )}
                                   {isStudent && item.ultraType === 'exam' && (
                                     <button onClick={() => router.push(`/exams/${item.id}/take`)} className="text-sm font-semibold text-[#0052cc] hover:underline flex items-center gap-1">
                                       <Play className="w-4 h-4" /> Iniciar Examen
                                     </button>
                                   )}
                                   {canEdit && (
                                     <button className="text-[#a6a6a6] hover:text-black">
                                       •••
                                     </button>
                                   )}
                                 </div>
                               ))
                             )}
                           </div>
                         </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {/* OTRAS PESTAÑAS (Simples por ahora) */}
            {activeTab !== 'contenido' && (
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-16 flex flex-col items-center justify-center text-center">
                <Megaphone className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-[#333333]">Esta sección aún está vacía</h3>
                <p className="text-[#737373] mt-2">No hay información disponible para {activeTab} en este momento.</p>
              </div>
            )}
            
          </div>

          {/* Columna Derecha (30%) */}
          <div className="w-full lg:w-[30%] space-y-6">
            
            {/* Profesores del curso */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-[#fcfcfc] border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-[15px] text-[#333333]">Profesores del curso</h3>
              </div>
              <div className="p-5 flex items-center justify-between hover:bg-[#fafafa] transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  {course?.docente?.avatar ? (
                    <img src={course.docente.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border border-[#e6e6e6]" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#5c5c5c] flex items-center justify-center text-white text-lg font-bold">
                      {course?.docente?.nombre?.[0]?.toUpperCase() || 'P'}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-[14px] text-[#333333] group-hover:underline">
                      {course?.docente?.nombre ? `${course.docente.nombre} ${course.docente.apellido || ''}` : 'Docente Asignado'}
                    </h4>
                    <span className="text-[10px] font-bold text-[#737373] bg-[#f0f0f0] px-1.5 py-0.5 rounded-sm inline-block mt-1">INSTRUCTOR</span>
                  </div>
                </div>
                <button className="text-[#8c8c8c] hover:text-[#333333] transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Detalles y acciones */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-[#fcfcfc] border-b border-gray-200 px-5 py-3">
                <h3 className="font-semibold text-[15px] text-[#333333]">Detalles y acciones</h3>
              </div>
              <div className="flex flex-col p-2">
                
                <div className="flex items-start gap-4 p-3 hover:bg-[#fafafa] cursor-pointer rounded">
                  <Users className="w-5 h-5 text-[#8c8c8c] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#333333]">Lista</h4>
                    <Link href="#" className="text-xs text-[#0052cc] hover:underline">Ver a los participantes de su curso</Link>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 hover:bg-[#fafafa] cursor-pointer rounded">
                  <Clock className="w-5 h-5 text-[#8c8c8c] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#333333]">Asistencia</h4>
                    <Link href="#" className="text-xs text-[#0052cc] hover:underline">Ver su asistencia</Link>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 hover:bg-[#fafafa] cursor-pointer rounded">
                  <BookOpen className="w-5 h-5 text-[#8c8c8c] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#333333]">Libros y herramientas</h4>
                    <Link href="#" className="text-xs text-[#0052cc] hover:underline max-w-[200px] block">Ver herramientas del curso y de la institución</Link>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-3 hover:bg-[#fafafa] cursor-pointer rounded">
                  <Award className="w-5 h-5 text-[#8c8c8c] mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-[#333333]">Estado del curso</h4>
                    <div className="text-xs mt-1"><span className="bg-green-100 text-green-800 px-1.5 py-0.5 font-semibold rounded-sm">ABIERTO</span> a los estudiantes</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
