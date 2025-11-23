'use client';

import { useState } from 'react';
import { ThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Create an emotion cache that uses the insertion point if present.
function createEmotionCache() {
  let insertionPoint: HTMLElement | undefined;
  if (typeof document !== 'undefined') {
    insertionPoint = document.querySelector('meta[name="emotion-insertion-point"]') as HTMLElement | undefined;
  }
  return createCache({ key: 'mui', insertionPoint });
}

export default function MUIProvider({ children }: { children: React.ReactNode }) {
  const [cache] = useState(() => createEmotionCache());

  return (
    <CacheProvider value={cache}>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </StyledEngineProvider>
    </CacheProvider>
  );
}
