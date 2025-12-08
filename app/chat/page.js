'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getGlobalChatMessages, sendChatMessage, getNewChatMessages,
  getUsers, getUserConversations, getPrivateChatMessages, markChatAsRead,
  getChatUnreadCount, API_URL
} from '@/lib/api';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { DashboardSkeleton } from '@/components/Skeleton';
import { 
  MessageCircle, Send, Users, Globe, Search, 
  ChevronLeft, Bell, Check, CheckCheck, Image, Smile
} from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chatMode, setChatMode] = useState('global');
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastMessageId, setLastMessageId] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newMessageNotification, setNewMessageNotification] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const pollingRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchInitialData();
      fetchUnreadCount();
    }
  }, [user]);

  useEffect(() => {
    if (chatMode === 'global' || (chatMode === 'private' && selectedUser)) {
      startPolling();
    }
    return () => stopPolling();
  }, [chatMode, selectedUser, lastMessageId]);

  const fetchInitialData = async () => {
    try {
      const [messagesData, usersData, convsData] = await Promise.all([
        getGlobalChatMessages(50),
        getUsers(),
        getUserConversations(user.id).catch(() => [])
      ]);
      const sortedMessages = messagesData.reverse();
      setMessages(sortedMessages);
      setUsers(usersData.filter(u => u.id !== user.id));
      setConversations(convsData);
      if (sortedMessages.length > 0) {
        setLastMessageId(sortedMessages[sortedMessages.length - 1].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await getChatUnreadCount(user.id);
      setUnreadCount(count);
    } catch (e) {}
  };

  const startPolling = () => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        if (chatMode === 'global') {
          const newMsgs = await getNewChatMessages(lastMessageId, 'global');
          if (newMsgs.length > 0) {
            const filteredMsgs = newMsgs.filter(m => m.remitenteId !== user.id);
            if (filteredMsgs.length > 0) {
              setMessages(prev => [...prev, ...newMsgs]);
              setLastMessageId(newMsgs[newMsgs.length - 1].id);
              showNotification(filteredMsgs[filteredMsgs.length - 1]);
              scrollToBottom();
            } else {
              setMessages(prev => [...prev, ...newMsgs]);
              setLastMessageId(newMsgs[newMsgs.length - 1].id);
            }
          }
        } else if (chatMode === 'private' && selectedUser) {
          const msgs = await getPrivateChatMessages(user.id, selectedUser.id, 50);
          setMessages(msgs.reverse());
        }
        fetchUnreadCount();
      } catch (e) {}
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const showNotification = (msg) => {
    setNewMessageNotification(msg);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = setTimeout(() => setNewMessageNotification(null), 5000);
    
    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification(`Nuevo mensaje de ${msg.remitente?.nombre || 'Usuario'}`, {
        body: msg.contenido.substring(0, 100),
        icon: msg.remitente?.avatar || '/favicon.ico'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const messageData = {
        remitenteId: user.id,
        contenido: newMessage.trim(),
        tipo: chatMode === 'private' ? 'privado' : 'global',
        destinatarioId: chatMode === 'private' ? selectedUser?.id : null,
      };

      const sent = await sendChatMessage(messageData);
      const messageWithUser = {
        ...sent,
        remitente: sent.remitente || { id: user.id, nombre: user.nombre, avatar: user.avatar, rol: user.rol },
        remitenteId: user.id,
      };
      setMessages(prev => [...prev, messageWithUser]);
      setNewMessage('');
      setLastMessageId(sent.id);
      inputRef.current?.focus();
      scrollToBottom();
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    } finally {
      setSending(false);
    }
  };

  const selectPrivateChat = async (otherUser) => {
    setSelectedUser(otherUser);
    setChatMode('private');
    setShowSidebar(false); // Cerrar sidebar en móvil
    setLoading(true);
    try {
      const msgs = await getPrivateChatMessages(user.id, otherUser.id, 50);
      setMessages(msgs.reverse());
      await markChatAsRead(user.id, otherUser.id);
      fetchUnreadCount();
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToGlobalChat = () => {
    setChatMode('global');
    setSelectedUser(null);
    fetchInitialData();
  };

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
  const formatTime = (date) => new Date(date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Hoy';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Ayer';
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${API_URL}/uploads/${avatar}`;
  };

  const getRoleColor = (rol) => {
    const colors = {
      admin: 'from-red-500 to-pink-500',
      docente: 'from-blue-500 to-cyan-500',
      estudiante: 'from-green-500 to-emerald-500'
    };
    return colors[rol] || 'from-gray-500 to-slate-500';
  };

  const getRoleBadgeColor = (rol) => {
    const colors = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      docente: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      estudiante: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    };
    return colors[rol] || 'bg-gray-100 text-gray-700';
  };

  const filteredUsers = users.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && messages.length === 0) return <DashboardSkeleton />;

  return (
    <div className="h-[calc(100vh-7rem)] flex gap-4 p-2 md:p-4 relative">
      {/* Notificación flotante de nuevo mensaje */}
      {newMessageNotification && (
        <div className="fixed top-20 right-2 md:right-4 z-50 animate-in slide-in-from-right duration-300 max-w-[calc(100vw-1rem)]">
          <Card className="w-full md:w-80 shadow-2xl border-l-4 border-l-indigo-500 bg-white dark:bg-slate-900">
            <CardContent className="p-3 md:p-4">
              <div className="flex items-start gap-2 md:gap-3">
                <div className="relative">
                  <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-indigo-500/20">
                    <AvatarImage src={getAvatarUrl(newMessageNotification.remitente?.avatar)} />
                    <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(newMessageNotification.remitente?.rol)} text-white text-xs md:text-sm font-medium`}>
                      {getInitials(newMessageNotification.remitente?.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -top-1 -right-1 flex h-3 w-3 md:h-4 md:w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <Bell className="relative h-3 w-3 md:h-4 md:w-4 text-indigo-600" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-xs md:text-sm truncate">{newMessageNotification.remitente?.nombre}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(newMessageNotification.remitente?.rol)}`}>
                      {newMessageNotification.remitente?.rol}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-1">{newMessageNotification.contenido}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">Ahora mismo</p>
                </div>
                <Button variant="ghost" size="icon" className="h-5 w-5 md:h-6 md:w-6 shrink-0" onClick={() => setNewMessageNotification(null)}>
                  ×
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sidebar de usuarios - Responsive */}
      <Card className={`${showSidebar ? 'fixed inset-0 z-40' : 'hidden'} md:relative md:flex md:w-80 flex-shrink-0 flex-col overflow-hidden shadow-xl border-0 bg-white dark:bg-slate-900 md:bg-white/80 md:dark:bg-slate-900/80 md:backdrop-blur-xl`}>
        <CardHeader className="pb-3 border-b bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Mensajes</h2>
                <p className="text-xs text-muted-foreground">{users.length} usuarios activos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">{unreadCount}</Badge>
              )}
              {/* Botón cerrar sidebar móvil */}
              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)} className="md:hidden rounded-xl">
                ×
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* Tabs mejorados */}
        <div className="flex p-2 gap-2 bg-gray-50 dark:bg-slate-800/50">
          <button onClick={goToGlobalChat}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all ${
              chatMode === 'global' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-muted-foreground hover:bg-white dark:hover:bg-slate-700'
            }`}>
            <Globe className="h-4 w-4" /> Global
          </button>
          <button onClick={() => setChatMode('conversations')}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 rounded-xl transition-all ${
              chatMode === 'conversations' || chatMode === 'private' 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                : 'text-muted-foreground hover:bg-white dark:hover:bg-slate-700'
            }`}>
            <Users className="h-4 w-4" /> Privado
          </button>
        </div>

        {/* Búsqueda mejorada */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar usuarios..." 
              className="pl-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500" />
          </div>
        </div>

        {/* Lista de usuarios mejorada */}
        <div className="flex-1 overflow-auto px-2 pb-2">
          {chatMode === 'global' ? (
            <div className="p-6 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                <Globe className="h-10 w-10 text-indigo-500" />
              </div>
              <p className="font-semibold text-lg">Chat Global</p>
              <p className="text-sm text-muted-foreground mt-1">Todos pueden ver los mensajes</p>
              <div className="flex items-center justify-center gap-1 mt-3">
                <div className="flex -space-x-2">
                  {users.slice(0, 4).map(u => (
                    <Avatar key={u.id} className="h-8 w-8 border-2 border-white dark:border-slate-900">
                      <AvatarImage src={getAvatarUrl(u.avatar)} />
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(u.rol)} text-white text-xs`}>
                        {getInitials(u.nombre)}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                {users.length > 4 && (
                  <span className="text-xs text-muted-foreground ml-2">+{users.length - 4} más</span>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredUsers.map(u => (
                <button key={u.id} onClick={() => selectPrivateChat(u)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                    selectedUser?.id === u.id 
                      ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10 shadow-md' 
                      : 'hover:bg-gray-100 dark:hover:bg-slate-800'
                  }`}>
                  <div className="relative">
                    <Avatar className={`h-12 w-12 ring-2 ${selectedUser?.id === u.id ? 'ring-indigo-500' : 'ring-transparent'}`}>
                      <AvatarImage src={getAvatarUrl(u.avatar)} />
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(u.rol)} text-white font-medium`}>
                        {getInitials(u.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{u.nombre}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(u.rol)}`}>
                        {u.rol}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Área de chat mejorada */}
      <Card className="flex-1 flex flex-col overflow-hidden shadow-xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        {/* Header del chat */}
        <CardHeader className="pb-3 border-b flex-shrink-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              {/* Botón menú móvil */}
              <Button variant="ghost" size="icon" onClick={() => setShowSidebar(true)} className="md:hidden rounded-xl shrink-0">
                <Users className="h-5 w-5" />
              </Button>
              
              {chatMode === 'private' && selectedUser && (
                <Button variant="ghost" size="icon" onClick={goToGlobalChat} className="md:hidden rounded-xl shrink-0">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              )}
              {chatMode === 'global' ? (
                <>
                  <div className="p-2 md:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl shadow-lg shadow-indigo-500/25 shrink-0">
                    <Globe className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base md:text-lg truncate">Chat Global</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      <p className="text-xs md:text-sm text-muted-foreground truncate">{users.length + 1} participantes en línea</p>
                    </div>
                  </div>
                </>
              ) : selectedUser ? (
                <>
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-indigo-500/20">
                      <AvatarImage src={getAvatarUrl(selectedUser.avatar)} />
                      <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(selectedUser.rol)} text-white font-medium`}>
                        {getInitials(selectedUser.nombre)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedUser.nombre}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleBadgeColor(selectedUser.rol)}`}>
                        {selectedUser.rol}
                      </span>
                      <span className="text-xs text-green-500">● En línea</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-muted-foreground">Selecciona un usuario para chatear</div>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Área de mensajes */}
        <CardContent className="flex-1 overflow-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-gradient-to-b from-gray-50/50 to-white dark:from-slate-800/50 dark:to-slate-900">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                <MessageCircle className="h-12 w-12 text-indigo-500" />
              </div>
              <p className="text-xl font-semibold">No hay mensajes aún</p>
              <p className="text-sm mt-1">¡Sé el primero en escribir!</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isOwn = msg.remitenteId === user?.id;
                const showDate = idx === 0 || formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt);
                const showAvatar = !isOwn && (idx === 0 || messages[idx - 1].remitenteId !== msg.remitenteId);
                
                return (
                  <div key={msg.id || idx}>
                    {showDate && (
                      <div className="flex justify-center my-6">
                        <span className="text-xs bg-white dark:bg-slate-800 px-4 py-1.5 rounded-full text-muted-foreground shadow-sm border">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''} ${!showAvatar && !isOwn ? 'ml-14' : ''}`}>
                      {showAvatar && !isOwn && (
                        <Avatar className="h-10 w-10 flex-shrink-0 ring-2 ring-white dark:ring-slate-800 shadow-md">
                          <AvatarImage src={getAvatarUrl(msg.remitente?.avatar)} />
                          <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(msg.remitente?.rol)} text-white text-sm font-medium`}>
                            {getInitials(msg.remitente?.nombre || 'U')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
                        {showAvatar && !isOwn && chatMode === 'global' && (
                          <div className="flex items-center gap-2 mb-1.5 ml-1">
                            <p className="text-sm font-semibold">{msg.remitente?.nombre}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleBadgeColor(msg.remitente?.rol)}`}>
                              {msg.remitente?.rol}
                            </span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOwn 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-br-md shadow-indigo-500/25' 
                            : 'bg-white dark:bg-slate-800 rounded-bl-md border'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.contenido}</p>
                        </div>
                        <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? 'justify-end mr-1' : 'ml-1'}`}>
                          <p className="text-[11px] text-muted-foreground">{formatTime(msg.createdAt)}</p>
                          {isOwn && (
                            <CheckCheck className="h-3.5 w-3.5 text-indigo-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </CardContent>

        {/* Input de mensaje mejorado */}
        {(chatMode === 'global' || selectedUser) && (
          <div className="p-4 border-t flex-shrink-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <form onSubmit={handleSend} className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-indigo-500">
                <Smile className="h-5 w-5" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-indigo-500">
                <Image className="h-5 w-5" />
              </Button>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={chatMode === 'global' ? 'Escribe un mensaje para todos...' : `Mensaje para ${selectedUser?.nombre}...`}
                  className="h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 border-0 focus-visible:ring-2 focus-visible:ring-indigo-500 pr-4 pl-4 text-sm"
                  disabled={sending}
                />
              </div>
              <Button 
                type="submit" 
                size="icon" 
                disabled={!newMessage.trim() || sending}
                className="h-12 w-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
}
