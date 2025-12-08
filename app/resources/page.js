'use client';

import { useEffect, useState } from 'react';
import { getCourses, getResourcesByCourse } from '@/lib/api';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FileText, Download, FolderOpen, Video, Image, File, 
  BookOpen, Search, Grid3X3, List, ExternalLink
} from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const coursesData = await getCourses();
        setCourses(coursesData);
        const allResources = [];
        
        for (const course of coursesData) {
          try {
            const courseResources = await getResourcesByCourse(course.id);
            allResources.push(...courseResources.map(resource => ({
              ...resource,
              courseName: course.titulo,
              courseId: course.id
            })));
          } catch (e) {
            console.log('No resources for course', course.id);
          }
        }
        
        setResources(allResources);
        setFilteredResources(allResources);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  useEffect(() => {
    let filtered = [...resources];
    
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.nombre_archivo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterType) {
      filtered = filtered.filter(r => r.tipo_recurso?.toLowerCase() === filterType);
    }
    
    if (filterCourse) {
      filtered = filtered.filter(r => r.courseId === parseInt(filterCourse));
    }
    
    setFilteredResources(filtered);
  }, [resources, searchTerm, filterType, filterCourse]);

  if (loading) return <DashboardSkeleton />;

  const getResourceIcon = (tipo) => {
    const icons = {
      documento: FileText,
      video: Video,
      imagen: Image,
      pdf: FileText,
      enlace: ExternalLink
    };
    return icons[tipo?.toLowerCase()] || File;
  };

  const getResourceConfig = (tipo) => {
    const configs = {
      documento: { 
        icon: FileText, 
        color: 'bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
        gradient: 'from-blue-500 to-blue-600'
      },
      video: { 
        icon: Video, 
        color: 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400',
        gradient: 'from-red-500 to-red-600'
      },
      imagen: { 
        icon: Image, 
        color: 'bg-green-100 text-green-600 dark:bg-green-950 dark:text-green-400',
        gradient: 'from-green-500 to-green-600'
      },
      pdf: { 
        icon: FileText, 
        color: 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400',
        gradient: 'from-orange-500 to-orange-600'
      },
      enlace: { 
        icon: ExternalLink, 
        color: 'bg-purple-100 text-purple-600 dark:bg-purple-950 dark:text-purple-400',
        gradient: 'from-purple-500 to-purple-600'
      }
    };
    return configs[tipo?.toLowerCase()] || { 
      icon: File, 
      color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      gradient: 'from-gray-500 to-gray-600'
    };
  };

  const uniqueTypes = [...new Set(resources.map(r => r.tipo_recurso?.toLowerCase()).filter(Boolean))];

  const stats = {
    total: resources.length,
    documentos: resources.filter(r => r.tipo_recurso?.toLowerCase() === 'documento').length,
    videos: resources.filter(r => r.tipo_recurso?.toLowerCase() === 'video').length,
    otros: resources.filter(r => !['documento', 'video'].includes(r.tipo_recurso?.toLowerCase())).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Recursos</h1>
        <p className="text-muted-foreground mt-2">
          Accede a todos los materiales de tus cursos
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <FolderOpen className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{stats.documentos}</div>
              <div className="text-xs text-muted-foreground">Documentos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
              <Video className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{stats.videos}</div>
              <div className="text-xs text-muted-foreground">Videos</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-950">
              <File className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{stats.otros}</div>
              <div className="text-xs text-muted-foreground">Otros</div>
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
            placeholder="Buscar recursos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="">Todos los tipos</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type} className="capitalize">{type}</option>
            ))}
          </select>
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

      {/* Lista de recursos */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              {searchTerm || filterType || filterCourse 
                ? 'No se encontraron recursos' 
                : 'No hay recursos disponibles'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Los recursos de tus cursos aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => {
            const config = getResourceConfig(resource.tipo_recurso);
            const Icon = config.icon;
            
            return (
              <Card key={resource.id} className="overflow-hidden hover:shadow-lg transition-all group">
                <div className={`h-2 bg-gradient-to-r ${config.gradient}`} />
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-3 rounded-lg ${config.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base line-clamp-2 group-hover:text-primary transition-colors">
                        {resource.nombre_archivo}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <BookOpen className="h-3 w-3" />
                        {resource.courseName}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Badge variant="secondary" className="capitalize">
                    {resource.tipo_recurso}
                  </Badge>
                  <Button asChild className="w-full" variant="outline">
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Descargar / Ver
                    </a>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Recurso</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Curso</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredResources.map((resource) => {
                const config = getResourceConfig(resource.tipo_recurso);
                const Icon = config.icon;
                
                return (
                  <tr key={resource.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{resource.nombre_archivo}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="capitalize">{resource.tipo_recurso}</Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{resource.courseName}</td>
                    <td className="px-4 py-3 text-right">
                      <Button asChild variant="ghost" size="sm">
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
