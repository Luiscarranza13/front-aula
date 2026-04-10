import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Centro de ayuda del aula virtual',
  description:
    'Preguntas frecuentes y soporte sobre cursos, tareas, foros, perfiles y uso de la plataforma educativa NovaTec Aula Virtual.',
  path: '/help',
  keywords: [
    'ayuda aula virtual',
    'preguntas frecuentes plataforma educativa',
    'soporte LMS',
    'ayuda para docentes y estudiantes',
    'centro de ayuda aula virtual',
  ],
});

export default function HelpLayout({ children }) {
  return children;
}
