'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">¡Algo salió mal!</h1>
        <p className="text-muted-foreground mb-8">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
            <RefreshCw className="h-4 w-4" /> Intentar de nuevo
          </Button>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="gap-2">
            <Home className="h-4 w-4" /> Ir al Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
