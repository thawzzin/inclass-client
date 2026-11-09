'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAuth } from '@/src/features/auth/auth-context';

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [router, status]);

  if (status !== 'authenticated') {
    return <main className="grid min-h-screen place-items-center text-sm text-zinc-500">Restoring session…</main>;
  }

  return <>{children}</>;
}
