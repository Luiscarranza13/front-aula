'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <div className="text-[150px] font-bold text-gray-200 dark:text-gray-800 leading-none">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-2xl">
              <Search className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-muted-foreground mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600">
            <Link href="/dashboard"><Home className="h-4 w-4" /> Ir al Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}
