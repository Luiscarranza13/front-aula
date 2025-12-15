'use client';

import { useEffect, useState } from 'react';
import { getCourses, runDiagnostic, checkHealth } from '@/lib/api';
import CardCurso from '@/components/CardCurso';
import { DashboardSkeleton } from '@/components/Skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, Search, Grid3X3, List, GraduationCap, Users, 
  RefreshCw, AlertTriangle, CheckCircle, Wifi, WifiOff,
  Settings, Info, ExternalLink, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrado, setFilterGrado] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [connectivity, setConnectivity] = useState(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnostic, setDiagnostic] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Función para cargar cursos
  const fetchCourses = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(!showLoader);
    
    console.log('🚀 === INICIANDO CARGA DE CURSOS ULTRA ===');
    
    try {
      // Verificar conectividad primero
      const connStatus = await checkHealth();
      setConnectivity(connStatus);
      
      // Cargar cursos
      const data = await getCourses();
      console.log('✅ Cursos recibidos:', data);
      
      setCourses(data);
      setFilteredCourses(data);
      setError('');
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('❌ Error en componente de cursos:', err);
      setError(err.message);
      setConnectivity({ connected: false, message: err.message });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Función para ejecutar diagnóstico
  const runDiagnosticTest = async () => {
    setShowDiagnostic(true);
    try {
      const result = await runDiagnostic();
      setDiagnostic(result);
    } catch (error) {
      setDiagnostic({
        backendUrl: 'https://backend-aula-production.up.railway.app',
        timestamp: new Date().toISOString(),
        tests: [{ name: 'Diagnóstico', status: 'ERROR', message: error.message }]
      });
    }
  };

  // Cargar cursos al montar el componente
  useEffect(() => {
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
      {/* Header mejorado */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Gestión de Cursos</h1>
            {connectivity && (
              <div className="flex items-center gap-2">
                {connectivity.connected ? (
                  <div className="flex items-center gap-1 text-green-600 text-sm">
                    <Wifi className="h-4 w-4" />
                    <span>Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600 text-sm">
                    <WifiOff className="h-4 w-4" />
                    <span>Sin conexión</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Explora todos los cursos disponibles • {courses.length} cursos encontrados
          </p>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => fetchCourses(false)} 
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          
          <Button 
            onClick={runDiagnosticTest}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Settings className="h-4 w-4" />
            Diagnóstico
          </Button>
          
          <Button 
            onClick={() => window.open('https://backend-aula-production.up.railway.app/courses', '_blank')}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Ver API
          </Button>
        </div>
      </div>

      {/* Estado de conectividad */}
      {connectivity && !connectivity.connected && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Problema de conectividad detectado
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                  {connectivity.message}
                </p>
                <p className="text-xs text-orange-500 mt-1">
                  Mostrando datos de respaldo. Los datos podrían no estar actualizados.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Error mejorado */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Error al cargar cursos
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  <div className="mt-2 text-xs text-red-500 space-y-1">
                    <p>• Backend: https://backend-aula-production.up.railway.app/courses</p>
                    <p>• Mostrando datos de respaldo si están disponibles</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => fetchCourses()} 
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Reintentar
                </Button>
                <Button 
                  onClick={runDiagnosticTest}
                  size="sm"
                  variant="outline"
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Diagnosticar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diagnóstico */}
      {showDiagnostic && diagnostic && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <Info className="h-4 w-4" />
                Diagnóstico del Sistema
              </h3>
              <Button 
                onClick={() => setShowDiagnostic(false)}
                variant="ghost"
                size="sm"
              >
                ✕
              </Button>
            </div>
            <div className="text-sm space-y-2">
              <p><strong>Backend:</strong> {diagnostic.backendUrl}</p>
              <p><strong>Timestamp:</strong> {new Date(diagnostic.timestamp).toLocaleString()}</p>
              <div className="space-y-1">
                {diagnostic.tests.map((test, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 rounded bg-white dark:bg-slate-800">
                    {test.status === 'OK' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    )}
                    <div>
                      <span className="font-medium text-sm">{test.name}:</span>
                      <span className="text-xs ml-2">{test.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
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
