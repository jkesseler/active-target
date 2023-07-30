import { useLayoutEffect } from 'react';

// Prevent the hook running in SSR
// See: https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const useBrowserLayoutEffect = typeof document !== 'undefined' ? useLayoutEffect : () => { };
