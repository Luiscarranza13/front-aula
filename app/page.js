import LandingPageClient from '@/components/LandingPageClient';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Aula virtual y plataforma educativa para colegios y academias',
  description:
    'NovaTec Aula Virtual es una plataforma educativa para colegios y academias con cursos, tareas, evaluaciones, recursos y panel administrativo.',
  path: '/',
  keywords: [
    'aula virtual para colegios',
    'plataforma educativa para academias',
    'campus virtual para instituciones',
    'panel administrativo educativo',
  ],
});

export default function HomePage() {
  return <LandingPageClient />;
}
