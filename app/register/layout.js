import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Crear cuenta',
  description: 'Registro privado para crear una cuenta en NovaTec Aula Virtual.',
  path: '/register',
  keywords: ['registro aula virtual', 'crear cuenta plataforma educativa', 'registro campus virtual'],
  index: false,
});

export default function RegisterLayout({ children }) {
  return children;
}
