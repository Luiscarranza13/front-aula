'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  BookOpen, 
  ClipboardList, 
  MessageSquare, 
  FolderOpen,
  Users,
  Settings,
  GraduationCap,
  X,
  User,
  Bell,
  Calendar,
  BarChart3,
  Award,
  HelpCircle,
  MessageCircle,
  FileQuestion
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const { isAdmin, isDocente, user } = useAuth();

  const navigation = [
    {
      title: 'PRINCIPAL',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/courses', label: 'Mis Cursos', icon: BookOpen, badge: '6' },
      ]
    },
    {
      title: 'ACADÉMICO',
      items: [
        { href: '/tasks', label: 'Tareas', icon: ClipboardList, badge: '2' },
        { href: '/exams', label: 'Exámenes', icon: FileQuestion },
        { href: '/resources', label: 'Recursos', icon: FolderOpen },
        { href: '/forum', label: 'Foros', icon: MessageSquare },
        { href: '/calendar', label: 'Calendario', icon: Calendar },
        { href: '/chat', label: 'Chat', icon: MessageCircle },
      ]
    }
  ];

  // Sección de cuenta para todos
  navigation.push({
    title: 'MI CUENTA',
    items: [
      { href: '/profile', label: 'Mi Perfil', icon: User },
      { href: '/notifications', label: 'Notificaciones', icon: Bell },
      { href: '/grades', label: 'Mis Calificaciones', icon: Award },
      { href: '/help', label: 'Ayuda', icon: HelpCircle },
    ]
  });

  if (isAdmin() || isDocente()) {
    navigation.push({
      title: 'ADMINISTRACIÓN',
      items: [
        { href: '/admin/courses', label: 'Gestión Cursos', icon: GraduationCap },
        { href: '/admin/exams', label: 'Gestión Exámenes', icon: FileQuestion },
        { href: '/admin/submissions', label: 'Calificar', icon: ClipboardList },
        ...(isAdmin() ? [
          { href: '/admin/users', label: 'Usuarios', icon: Users },
          { href: '/admin/reports', label: 'Reportes', icon: BarChart3 },
        ] : []),
        { href: '/admin/settings', label: 'Configuración', icon: Settings },
      ]
    });
  }

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r bg-white dark:bg-slate-900 transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Close button para móvil */}
          <div className="flex items-center justify-between p-4 md:hidden border-b">
            <span className="font-semibold">Menú</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-4 px-3">
            <nav className="space-y-6">
              {navigation.map((section, idx) => (
                <div key={idx}>
                  <h4 className="px-3 mb-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </h4>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => onClose && onClose()}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                            isActive 
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 transition-transform group-hover:scale-110",
                            isActive && "text-white"
                          )} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "secondary" : "outline"} 
                              className="h-5 px-2 text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          {/* User info at bottom */}
          <div className="border-t p-4">
            <Link href="/profile" onClick={() => onClose && onClose()}
              className="flex items-center gap-3 rounded-lg bg-slate-50 dark:bg-slate-800 p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-slate-700 shadow-md">
                {user?.avatar && <AvatarImage src={user.avatar} alt={user.nombre} />}
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-sm">
                  {user?.nombre?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-slate-900 dark:text-white">
                  {user?.nombre}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.rol}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
