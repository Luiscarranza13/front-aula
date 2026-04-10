'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Loading from '@/components/Loading';

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin, isDocente } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (!isAdmin() && !isDocente()) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router, isAdmin, isDocente]);

  if (loading) return <Loading />;
  if (!user || (!isAdmin() && !isDocente())) return null;

  // We no longer render Navbar and Sidebar here, since they are handled by app/(dashboard)/layout.js
  return <>{children}</>;
}
