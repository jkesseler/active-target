import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import { MantineProvider } from '@mantine/core';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '@/store/configureStore';

// Create a test store function
export const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: true,
        // Disable middleware that might cause issues in tests
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
};

// Create test wrapper
interface AllTheProvidersProps {
  children: ReactNode
  store?: ReturnType<typeof createTestStore>
}

const AllTheProviders = ({ children, store }: AllTheProvidersProps) => {
  const testStore = store || createTestStore();

  return (
    <Provider store={testStore}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </Provider>
  );
};

// Custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any // eslint-disable-line @typescript-eslint/no-explicit-any
  store?: ReturnType<typeof createTestStore>
}

export const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: CustomRenderOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <AllTheProviders store={store}>{children}</AllTheProviders>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};
