// Centralized Emotion cache factory. Supports insertion point meta tag for stable style ordering.
import createCache from '@emotion/cache';

export default function createEmotionCache() {
  // For React 19, avoid insertionPoint to prevent DOM manipulation conflicts
  const cache = createCache({ 
    key: 'mui', 
    prepend: true,
    // Don't use insertionPoint with React 19 to avoid insertBefore errors
  });
  // @ts-expect-error compat not typed in emotion types shipped
  cache.compat = true;
  return cache;
}
