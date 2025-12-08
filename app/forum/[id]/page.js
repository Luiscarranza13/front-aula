'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getForumById, getForumMessages, createForumMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MessageSquare, Send, ArrowLeft, Users, Clock, 
  ThumbsUp, Reply, MoreHorizontal, AlertCircle, CheckCircle2
} from 'lucide-react';

export default function ForumDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [forum, setForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const messagesData = await getForumMessages(params.id);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forumData] = await Promise.all([
          getForumById(params.id),
        ]);
        setForum(forumData);
        await fetchMessages();
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      await createForumMessage(params.id, {
        contenido: newMessage,
        usuarioId: user.id,
      });
      setNewMessage('');
      await fetchMessages();
      showNotification('Mensaje enviado correctamente');
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      showNotification('Error al enviar el mensaje', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return past.toLocaleDateString('es-ES');
  };

  const colors = [
    'bg-blue-500',
    'bg-purple-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-red-500'
  ];

  const getAvatarColor = (userId) => {
    return colors[(userId || 0) % colors.length];
  };

  if (loading) return <DashboardSkeleton />;
  if (!forum) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">Foro no encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/forum')}>
            Volver a foros
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Notificación */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-top-2 ${
          notification.type === 'error' 
            ? 'bg-red-500 text-white' 
            : 'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <CheckCircle2 className="h-5 w-5" />
          )}
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/forum')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{forum.titulo}</h1>
          <p className="text-muted-foreground">{forum.descripcion}</p>
        </div>
      </div>

      {/* Info del foro */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Activo
            </Badge>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span>{messages.length} mensajes</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{new Set(messages.map(m => m.usuarioId)).size} participantes</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mensajes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discusión
          </CardTitle>
          <CardDescription>
            {messages.length === 0 
              ? '¡Sé el primero en comentar!' 
              : `${messages.length} mensajes en esta discusión`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay mensajes aún</p>
              <p className="text-sm">¡Inicia la conversación!</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {messages.map((message, idx) => {
                const isOwn = message.usuarioId === user?.id;
                return (
                  <div 
                    key={message.id} 
                    className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                  >
                    <Avatar className={`h-10 w-10 flex-shrink-0 ${getAvatarColor(message.usuarioId)}`}>
                      <AvatarFallback className="text-white font-semibold text-sm">
                        {getInitials(message.usuario?.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex-1 max-w-[80%] ${isOwn ? 'text-right' : ''}`}>
                      <div className={`inline-block rounded-2xl px-4 py-3 ${
                        isOwn 
                          ? 'bg-primary text-primary-foreground rounded-tr-sm' 
                          : 'bg-muted rounded-tl-sm'
                      }`}>
                        <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end' : ''}`}>
                          <span className={`text-sm font-medium ${isOwn ? 'text-primary-foreground/90' : ''}`}>
                            {message.usuario?.nombre || 'Usuario'}
                          </span>
                          {message.usuario?.rol && (
                            <Badge variant="outline" className={`text-xs py-0 ${isOwn ? 'border-primary-foreground/30 text-primary-foreground/80' : ''}`}>
                              {message.usuario.rol}
                            </Badge>
                          )}
                        </div>
                        <p className={isOwn ? 'text-primary-foreground' : ''}>{message.contenido}</p>
                      </div>
                      <div className={`flex items-center gap-3 mt-1 text-xs text-muted-foreground ${isOwn ? 'justify-end' : ''}`}>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Formulario de nuevo mensaje */}
          <form onSubmit={handleSubmit} className="pt-4 border-t">
            <div className="flex gap-3">
              <Avatar className={`h-10 w-10 flex-shrink-0 ${getAvatarColor(user?.id)}`}>
                <AvatarFallback className="text-white font-semibold text-sm">
                  {getInitials(user?.nombre)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  placeholder="Escribe tu mensaje..."
                  required
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Publicando como <span className="font-medium">{user?.nombre}</span>
                  </p>
                  <Button 
                    type="submit" 
                    disabled={submitting || !newMessage.trim()}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Enviando...' : 'Enviar'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
