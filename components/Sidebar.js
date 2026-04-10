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
        "fixed left-0 top-14 z-40 h-[calc(100vh-3.5rem)] w-60 border-r border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex h-full flex-col">
          {/* Close button para móvil */}
          <div className="flex items-center justify-between p-3 md:hidden border-b">
            <span className="font-semibold">Menú</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-auto py-3 px-2.5">
            <nav className="space-y-5">
              {navigation.map((section, idx) => (
                <div key={idx}>
                  <h4 className="px-2.5 mb-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
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
                            "group flex items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium transition-all duration-300",
                            isActive 
                              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 translate-x-1" 
                              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white"
                          )}
                        >
                          <Icon className={cn(
                            "h-4 w-4 transition-transform duration-300 group-hover:scale-110",
                            isActive && "text-white drop-shadow-md"
                          )} />
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "secondary" : "outline"} 
                              className={cn(
                                "h-4 px-1.5 text-[10px]",
                                isActive ? "bg-white/20 text-white hover:bg-white/30" : ""
                              )}
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

          {/* User Profile Mini */}
          {user && (
            <div className="border-t border-slate-200/60 dark:border-slate-800/60 p-3">
              <div className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <Avatar className="h-9 w-9 border-2 border-indigo-100 dark:border-indigo-900">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400 font-medium">
                    {user.nombre?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{user.nombre}</span>
                  <span className="text-xs text-muted-foreground capitalize">{user.rol}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
