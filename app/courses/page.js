'use client';

import { useEffect, useState } from 'react';
import { getCourses } from '@/lib/api-new';
import CardCurso from '@/components/CardCurso';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Search, Grid3X3, List, GraduationCap, Users } from 'lucide-react';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getCourses();
        setCourses(data);
        setFilteredCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = [...courses];
    
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.docente?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterGrado) {
      filtered = filtered.filter(c => c.grado === filterGrado);
    }
    
    setFilteredCourses(filtered);
  }, [courses, searchTerm, filterGrado]);

  if (loading) return <DashboardSkeleton />;

  const uniqueGrados = [...new Set(courses.map(c => c.grado).filter(Boolean))];

  const stats = {
    total: courses.length,
    grados: uniqueGrados.length,
    docentes: new Set(courses.map(c => c.docenteId).filter(Boolean)).size,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
          Explora todos los cursos disponibles
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{stats.total}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Cursos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
              <GraduationCap className="h-4 w-4 md:h-5 md:w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-purple-600">{stats.grados}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Grados</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <Users className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold text-green-600">{stats.docentes}</div>
              <div className="text-[10px] md:text-xs text-muted-foreground">Docentes</div>
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
      <div className="flex flex-col sm:flex-row gap-2 md:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar cursos o docentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 md:h-10 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterGrado}
            onChange={(e) => setFilterGrado(e.target.value)}
            className="px-2 md:px-3 py-1.5 md:py-2 border rounded-lg bg-white dark:bg-gray-800 text-xs md:text-sm flex-1 sm:flex-none"
          >
            <option value="">Todos los grados</option>
            {uniqueGrados.map(grado => (
              <option key={grado} value={grado}>{grado}</option>
            ))}
          </select>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 md:p-2 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 md:p-2 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-white dark:bg-gray-800'}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Lista de cursos */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 md:py-12">
            <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mb-3 md:mb-4" />
            <p className="text-sm md:text-base text-muted-foreground">
              {searchTerm || filterGrado 
                ? 'No se encontraron cursos' 
                : 'No hay cursos disponibles'}
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredCourses.map((curso) => (
            <CardCurso key={curso.id} curso={curso} />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Curso</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Grado</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500 hidden sm:table-cell">Docente</th>
                <th className="px-3 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredCourses.map((curso) => (
                <tr 
                  key={curso.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                  onClick={() => window.location.href = `/courses/${curso.id}`}
                >
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="p-1.5 md:p-2 rounded-lg bg-primary/10">
                        <BookOpen className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                      </div>
                      <span className="font-medium text-xs md:text-sm">{curso.titulo}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm text-muted-foreground">
                    {curso.grado} - {curso.seccion}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3 text-xs md:text-sm hidden sm:table-cell">
                    {curso.docente?.nombre || <span className="text-muted-foreground">Sin asignar</span>}
                  </td>
                  <td className="px-3 md:px-4 py-2 md:py-3">
                    <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] md:text-xs">Activo</Badge>
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
