'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCourses, getForumsByCourse } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MessageSquare, Users, BookOpen, ArrowRight, Search, Grid3X3, List } from 'lucide-react';

export default function ForumPage() {
  const [forums, setForums] = useState([]);
  const [filteredForums, setFilteredForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchForums = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        const allForums = [];
        
        for (const course of coursesData) {
          try {
            const courseForums = await getForumsByCourse(course.id);
            allForums.push(...courseForums.map(forum => ({
              ...forum,
              courseName: course.titulo,
              courseId: course.id
            })));
          } catch (e) {
            console.log('No forums for course', course.id);
          }
        }
        
        setForums(allForums);
        setFilteredForums(allForums);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchForums();
  }, []);

  useEffect(() => {
    let filtered = [...forums];
    
    if (searchTerm) {
      filtered = filtered.filter(f => 
        f.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCourse) {
      filtered = filtered.filter(f => f.courseId === parseInt(filterCourse));
    }
    
    setFilteredForums(filtered);
  }, [forums, searchTerm, filterCourse]);

  if (loading) return <DashboardSkeleton />;

  const colors = [
    'from-blue-500 to-indigo-600',
    'from-purple-500 to-pink-600',
    'from-green-500 to-teal-600',
    'from-orange-500 to-red-600',
    'from-cyan-500 to-blue-600',
    'from-rose-500 to-purple-600'
  ];

  const stats = {
    total: forums.length,
    activos: forums.length,
    cursos: new Set(forums.map(f => f.courseId)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Foros de Discusión</h1>
        <p className="text-muted-foreground mt-2">
          Participa en las discusiones de tus cursos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <MessageSquare className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total Foros</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.activos}</div>
              <div className="text-xs text-muted-foreground">Activos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.cursos}</div>
              <div className="text-xs text-muted-foreground">Cursos</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar foros..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Todos los cursos</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.titulo}</option>
            ))}
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de foros */}
      {filteredForums.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterCourse 
                ? 'No se encontraron foros' 
                : 'No hay foros disponibles'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Los foros de tus cursos aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredForums.map((forum, idx) => (
            <Link key={forum.id} href={`/forum/${forum.id}`}>
              <Card className="h-full hover:shadow-xl transition-all cursor-pointer group border-2 hover:border-primary/50 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${colors[idx % colors.length]}`} />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {forum.titulo}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {forum.courseName}
                      </CardDescription>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground line-clamp-2">
                    {forum.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      Activo
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      Participar
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Foro</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Curso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredForums.map((forum) => (
                <tr key={forum.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{forum.titulo}</div>
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          {forum.descripcion || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{forum.courseName}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">Activo</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/forum/${forum.id}`}>
                      <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-white transition-colors">
                        Ver foro →
                      </Badge>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
