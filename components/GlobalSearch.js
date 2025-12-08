'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCourses, getAllTasks, getAllForums, getUsers } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ClipboardList, MessageSquare, User, X, Loader2 } from 'lucide-react';

export default function GlobalSearch({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ courses: [], tasks: [], forums: [], users: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (query.length < 2) { setResults({ courses: [], tasks: [], forums: [], users: [] }); return; }
    const search = async () => {
      setLoading(true);
      try {
        const [courses, tasks, forums, users] = await Promise.all([
          getCourses(), getAllTasks(), getAllForums(), getUsers()
        ]);
        const q = query.toLowerCase();
        setResults({
          courses: courses.filter(c => c.titulo.toLowerCase().includes(q)).slice(0, 5),
          tasks: tasks.filter(t => t.titulo.toLowerCase().includes(q)).slice(0, 5),
          forums: forums.filter(f => f.titulo.toLowerCase().includes(q)).slice(0, 5),
          users: users.filter(u => u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)).slice(0, 5),
        });
      } catch (e) { console.error(e); }
      setLoading(false);
    };
    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const navigate = (path) => { router.push(path); onClose(); setQuery(''); };
  const hasResults = Object.values(results).some(arr => arr.length > 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-w-2xl mx-auto mt-20 p-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input ref={inputRef} value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cursos, tareas, foros, usuarios..."
              className="border-0 focus-visible:ring-0 text-lg" />
            {loading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-auto">
            {query.length < 2 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Escribe al menos 2 caracteres para buscar</p>
              </div>
            ) : !hasResults && !loading ? (
              <div className="p-8 text-center text-muted-foreground">
                <p>No se encontraron resultados para "{query}"</p>
              </div>
            ) : (
              <div className="p-2">
                {results.courses.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Cursos</h3>
                    {results.courses.map(course => (
                      <button key={course.id} onClick={() => navigate(`/courses/${course.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{course.titulo}</div>
                          <div className="text-sm text-muted-foreground">{course.grado} - {course.seccion}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.tasks.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Tareas</h3>
                    {results.tasks.map(task => (
                      <button key={task.id} onClick={() => navigate(`/tasks`)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left">
                        <ClipboardList className="h-5 w-5 text-orange-500" />
                        <div>
                          <div className="font-medium">{task.titulo}</div>
                          <div className="text-sm text-muted-foreground">{task.estado}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.forums.length > 0 && (
                  <div className="mb-4">
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Foros</h3>
                    {results.forums.map(forum => (
                      <button key={forum.id} onClick={() => navigate(`/forum/${forum.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left">
                        <MessageSquare className="h-5 w-5 text-purple-500" />
                        <div className="font-medium">{forum.titulo}</div>
                      </button>
                    ))}
                  </div>
                )}
                {results.users.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">Usuarios</h3>
                    {results.users.map(user => (
                      <button key={user.id} onClick={() => navigate(`/admin/users`)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-left">
                        <User className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">{user.nombre}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t bg-gray-50 dark:bg-gray-800 text-xs text-muted-foreground text-center">
            Presiona <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">ESC</kbd> para cerrar
          </div>
        </div>
      </div>
    </div>
  );
}
