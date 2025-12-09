'use client';

import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Search, LogOut, User, Settings, Menu, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from './ThemeToggle';
import GlobalSearch from './GlobalSearch';
import { getUnreadNotificationsCount, getChatUnreadCount } from '@/lib/api';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) {
      getUnreadNotificationsCount(user.id).then(setUnreadCount).catch(() => {});
      getChatUnreadCount(user.id).then(setChatUnreadCount).catch(() => {});
      
      // Polling para notificaciones y chat cada 10 segundos
      const interval = setInterval(() => {
        getUnreadNotificationsCount(user.id).then(setUnreadCount).catch(() => {});
        getChatUnreadCount(user.id).then(setChatUnreadCount).catch(() => {});
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const getRoleColor = (rol) => {
    const colors = {
      admin: 'bg-red-500',
      docente: 'bg-blue-500',
      estudiante: 'bg-green-500'
    };
    return colors[rol] || 'bg-gray-500';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2 mr-4">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">AV</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Aula Virtual
            </h1>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex-1 flex items-center justify-center px-2 md:px-4 max-w-2xl mx-auto">
          <button onClick={() => setSearchOpen(true)}
            className="w-full h-8 md:h-10 pl-8 md:pl-10 pr-3 md:pr-4 rounded-lg border border-input bg-background/50 text-xs md:text-sm text-left text-muted-foreground hover:bg-accent transition-all relative">
            <Search className="absolute left-2 md:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Buscar... </span>
            <span className="sm:hidden">Buscar</span>
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
        </div>

        <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Right side actions */}
        <div className="flex items-center gap-1 md:gap-2">
          <ThemeToggle />

          {/* Chat button */}
          <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-accent h-8 w-8 md:h-10 md:w-10"
            onClick={() => router.push('/chat')}>
            <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
            {chatUnreadCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs bg-indigo-500 animate-pulse">
                {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
              </Badge>
            )}
          </Button>

          {/* Notifications button */}
          <Button variant="ghost" size="icon" className="rounded-full relative hover:bg-accent h-8 w-8 md:h-10 md:w-10"
            onClick={() => router.push('/notifications')}>
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center p-0 text-[10px] md:text-xs bg-red-500">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {user && (
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 md:h-10 gap-0 md:gap-2 rounded-full px-1 md:px-2 hover:bg-accent">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8 ring-2 ring-background">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.nombre} />}
                    <AvatarFallback className={`${getRoleColor(user.rol)} text-white font-semibold text-[10px] md:text-xs`}>
                      {getInitials(user.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user.nombre}</span>
                    <span className="text-xs text-muted-foreground capitalize">{user.rol}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <div className="flex items-center gap-3 p-3">
                  <Avatar className="h-12 w-12 ring-2 ring-background">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.nombre} />}
                    <AvatarFallback className={`${getRoleColor(user.rol)} text-white font-semibold`}>
                      {getInitials(user.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1">
                    <span className="text-sm font-semibold">{user.nombre}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                    <Badge variant="secondary" className="w-fit mt-1 text-xs capitalize">
                      {user.rol}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Mi Perfil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Configuración
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
