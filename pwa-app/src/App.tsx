import * as React from 'react'
import { Provider } from 'react-redux'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { MantineProvider } from '@mantine/core'
import { DatesProvider } from '@mantine/dates'
import { Notifications } from '@mantine/notifications'
import { ModalsProvider } from '@mantine/modals'
import { store } from '@/store/configureStore'
import { useThemes } from '@/hooks/useThemes'
import { initializeAudioContext, markUserInteraction } from '@/utils/audioUtils'

import { routeTree } from './routes.gen'

import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/nprogress/styles.css'
import './global.css'

const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export const App = () => {
  const { themes, currentThemeName } = useThemes()

  // Initialize audio context on first user interaction
  React.useEffect(() => {
    const handleUserInteraction = () => {
      markUserInteraction()
      initializeAudioContext()
      // Remove listeners after first interaction
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }

    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('touchstart', handleUserInteraction)

    return () => {
      document.removeEventListener('click', handleUserInteraction)
      document.removeEventListener('keydown', handleUserInteraction)
      document.removeEventListener('touchstart', handleUserInteraction)
    }
  }, [])

  return (
    <Provider store={store}>
      <MantineProvider
        theme={themes[currentThemeName].mantineTheme}
        defaultColorScheme="dark"
      >
        <Notifications />
        <DatesProvider settings={{ locale: 'nl-NL', firstDayOfWeek: 0, weekendDays: [0], timezone: 'UTC' }}>
          <RouterProvider router={router} />
          <ModalsProvider data-testid="modals" />
        </DatesProvider>
      </MantineProvider>
    </Provider>
  )
}
