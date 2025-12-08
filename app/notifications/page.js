'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Bell, Check, CheckCheck, Trash2, Info, AlertCircle, CheckCircle2, AlertTriangle, ExternalLink, MessageCircle, Filter } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(user.id);
      setNotifications(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    await markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead(user.id);
    setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (tipo) => {
    const icons = { info: Info, success: CheckCircle2, warning: AlertTriangle, error: AlertCircle, chat: MessageCircle };
    return icons[tipo] || Info;
  };

  const getColor = (tipo) => {
    const colors = { 
      info: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30', 
      success: 'text-green-500 bg-green-100 dark:bg-green-900/30', 
      warning: 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30', 
      error: 'text-red-500 bg-red-100 dark:bg-red-900/30',
      chat: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30'
    };
    return colors[tipo] || colors.info;
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.leida;
    if (filter === 'read') return n.leida;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.leida).length;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="h-8 w-8" /> Notificaciones
          </h1>
          <p className="text-muted-foreground mt-1">
            {unreadCount > 0 ? `${unreadCount} sin leer` : 'Todas leídas'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" className="gap-2">
            <CheckCheck className="h-4 w-4" /> Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['all', 'unread', 'read'].map(f => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm" onClick={() => setFilter(f)}
            className={filter === f ? 'bg-indigo-600' : ''}>
            {f === 'all' ? 'Todas' : f === 'unread' ? 'Sin leer' : 'Leídas'}
            {f === 'unread' && unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500">{unreadCount}</Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay notificaciones</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = getIcon(notification.tipo);
            const colorClass = getColor(notification.tipo);
            return (
              <Card key={notification.id} className={`transition-all hover:shadow-md ${!notification.leida ? 'border-l-4 border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className={`font-semibold ${!notification.leida ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {notification.titulo}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1">{notification.mensaje}</p>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">{notification.categoria}</Badge>
                        {notification.enlace && (
                          <Link href={notification.enlace}>
                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                              <ExternalLink className="h-3 w-3" /> Ver
                            </Button>
                          </Link>
                        )}
                        {!notification.leida && (
                          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => handleMarkAsRead(notification.id)}>
                            <Check className="h-3 w-3" /> Marcar leída
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-red-500 hover:text-red-600 gap-1" onClick={() => handleDelete(notification.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
