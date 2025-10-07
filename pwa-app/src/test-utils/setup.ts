import { vi, beforeAll, afterAll } from 'vitest';
import React from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock window.getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock crypto.randomUUID for consistent IDs
let idCounter = 0;
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => `test-uuid-${idCounter++}`,
    getRandomValues: vi.fn(),
    // Add a way to reset the counter
    resetIdCounter: () => { idCounter = 0; },
  },
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock TanStack Router components
vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to, activeProps, ...props }: any) => {
    // Filter out TanStack Router specific props that shouldn't be on DOM elements
    const { activeProps: _, ...domProps } = props;
    return React.createElement('a', { href: to, ...domProps }, children);
  },
  useNavigate: () => vi.fn(),
  useRouter: () => ({
    navigate: vi.fn(),
    state: {
      location: {
        pathname: '/',
        search: '',
        hash: '',
      },
    },
  }),
  useRouterState: () => ({
    location: {
      pathname: '/',
      search: '',
      hash: '',
    },
  }),
}));



beforeAll(() => {
      // Reset the global ID counter and mock Math.random for consistent snapshots
      // Mantine uses Math.random in its ID generation
    (global.crypto as any).resetIdCounter?.();
    Math.random = () => 1;
});

afterAll(() => {
    Math.random = Math.random;
});