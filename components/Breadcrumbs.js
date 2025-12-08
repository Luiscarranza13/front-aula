'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const routeNames = {
  dashboard: 'Dashboard',
  courses: 'Cursos',
  tasks: 'Tareas',
  resources: 'Recursos',
  forum: 'Foros',
  admin: 'Administración',
  users: 'Usuarios',
  settings: 'Configuración',
};

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0 || pathname === '/dashboard') {
    return null;
  }

  const breadcrumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    const isLast = index === segments.length - 1;
    const isId = /^\d+$/.test(segment);
    
    let name = routeNames[segment] || segment;
    if (isId) {
      name = `#${segment}`;
    }

    return {
      name,
      path,
      isLast,
      isId
    };
  });

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link 
        href="/dashboard" 
        className="flex items-center gap-1 hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Inicio</span>
      </Link>
      
      {breadcrumbs.map((crumb, idx) => (
        <div key={idx} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4" />
          {crumb.isLast ? (
            <span className="font-medium text-foreground capitalize">
              {crumb.name}
            </span>
          ) : (
            <Link 
              href={crumb.path}
              className="hover:text-foreground transition-colors capitalize"
            >
              {crumb.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
