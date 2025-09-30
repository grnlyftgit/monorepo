'use client';

import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { ThemeProviderProps } from 'next-themes';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useState } from 'react';
import { Toaster } from './components/ui/sonner';
import { TooltipProvider } from './components/ui/tooltip';
import { ThemeProvider } from './providers/theme';

type SystemProviderProperties = ThemeProviderProps & {
  // privacyUrl?: string; --- IGNORE ---
  // termsUrl?: string; --- IGNORE ---
  // helpUrl?: string; --- IGNORE ---
};

export const SystemProvider = ({
  children,
  ...properties
}: SystemProviderProperties) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (err) => {
            let errorMessage: string;
            if (err instanceof Error) {
              errorMessage = err.message;
            } else {
              errorMessage = 'An unknown error occurred.';
            }
          },
        }),
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <ThemeProvider {...properties} themes={['light']}>
          <TooltipProvider>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
};
