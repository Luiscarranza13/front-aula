import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Iniciar sesion',
  description: 'Acceso privado para docentes, estudiantes y administradores de NovaTec Aula Virtual.',
  path: '/login',
  keywords: ['iniciar sesion aula virtual', 'acceso plataforma educativa'],
  index: false,
});

export default function LoginLayout({ children }) {
  return children;
}
