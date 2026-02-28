'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/AppContext';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { state } = useApp();

  useEffect(() => {
    const theme = state.settings.theme;
    const root = document.documentElement;

    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [state.settings.theme]);

  return <>{children}</>;
}
