'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useState, type ReactNode } from 'react';
import { Toaster } from '@/src/components/ui/sonner';

import { createQueryClient } from '@/src/lib/query/client';
import { AuthProvider } from '@/src/features/auth/auth-context';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <Toaster richColors />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
