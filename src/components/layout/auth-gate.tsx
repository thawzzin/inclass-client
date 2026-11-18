'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { LoadingState } from '@/src/components/ui/loading-state';
import { useAuth } from '@/src/features/auth/auth-context';

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [router, status]);

  if (status !== 'authenticated') {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <LoadingState label="Restoring session" compact className="w-64" />
      </main>
    );
  }

  return <>{children}</>;
}
