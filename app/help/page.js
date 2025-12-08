'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, Search, BookOpen, ClipboardList, MessageSquare, 
  User, Settings, ChevronDown, ChevronUp, Mail, Phone
} from 'lucide-react';

const faqs = [
  {
    category: 'Cursos',
    icon: BookOpen,
    questions: [
      { q: '¿Cómo me inscribo en un curso?', a: 'Ve a la sección "Mis Cursos" y haz clic en "Inscribirse" en el curso deseado. El docente aprobará tu solicitud.' },
      { q: '¿Puedo ver cursos de otros grados?', a: 'Solo puedes ver los cursos en los que estás inscrito. Contacta al administrador para más información.' },
      { q: '¿Cómo accedo al contenido del curso?', a: 'Haz clic en el curso para ver sus tareas, recursos y foros disponibles.' },
    ]
  },
  {
    category: 'Tareas',
    icon: ClipboardList,
    questions: [
      { q: '¿Cómo entrego una tarea?', a: 'Ve a la tarea, haz clic en "Entregar" y sube tu archivo o escribe tu respuesta.' },
      { q: '¿Puedo entregar tarde?', a: 'Depende de la configuración del docente. Las entregas tardías pueden tener penalización.' },
      { q: '¿Dónde veo mis calificaciones?', a: 'En la sección "Mis Calificaciones" del menú lateral.' },
    ]
  },
  {
    category: 'Foros',
    icon: MessageSquare,
    questions: [
      { q: '¿Cómo participo en un foro?', a: 'Entra al foro y escribe tu mensaje en el campo de texto. Puedes responder a otros mensajes.' },
      { q: '¿Puedo editar mis mensajes?', a: 'Sí, puedes editar tus mensajes dentro de las primeras 24 horas.' },
      { q: '¿Cómo reporto contenido inapropiado?', a: 'Usa el botón de reportar junto al mensaje o contacta al administrador.' },
    ]
  },
  {
    category: 'Cuenta',
    icon: User,
    questions: [
      { q: '¿Cómo cambio mi contraseña?', a: 'Ve a "Mi Perfil" y selecciona "Cambiar Contraseña".' },
      { q: '¿Cómo actualizo mi foto de perfil?', a: 'En "Mi Perfil", haz clic en tu foto actual para subir una nueva.' },
      { q: '¿Olvidé mi contraseña, qué hago?', a: 'Contacta al administrador para restablecer tu contraseña.' },
    ]
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg mb-4">
          <HelpCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold">Centro de Ayuda</h1>
        <p className="text-muted-foreground mt-2">Encuentra respuestas a las preguntas más frecuentes</p>
      </div>

      {/* Búsqueda */}
      <div className="relative max-w-xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar en preguntas frecuentes..."
          className="pl-12 h-14 rounded-2xl text-lg" />
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        {filteredFaqs.map((category, catIdx) => (
          <Card key={catIdx} className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
              <CardTitle className="flex items-center gap-3">
                <category.icon className="h-5 w-5 text-indigo-600" />
                {category.category}
                <Badge variant="secondary">{category.questions.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {category.questions.map((item, qIdx) => {
                const key = `${catIdx}-${qIdx}`;
                const isOpen = openItems[key];
                return (
                  <div key={qIdx} className="border-b last:border-b-0">
                    <button onClick={() => toggleItem(key)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <span className="font-medium pr-4">{item.q}</span>
                      {isOpen ? <ChevronUp className="h-5 w-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-muted-foreground bg-gray-50 dark:bg-gray-800/50">
                        {item.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contacto */}
      <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-bold mb-2">¿No encontraste lo que buscabas?</h2>
          <p className="text-muted-foreground mb-6">Contáctanos y te ayudaremos</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:soporte@aulavirtual.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Mail className="h-5 w-5 text-indigo-600" />
              <span>soporte@aulavirtual.com</span>
            </a>
            <a href="tel:+51999999999" className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <Phone className="h-5 w-5 text-indigo-600" />
              <span>+51 999 999 999</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
