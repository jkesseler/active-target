import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AppShell, Burger } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { Navbar } from '@/components/NavBar/NavBar'
import { HeaderSimple } from '@/components/Header/HeaderSimple'

const RootLayout = () => {
  const [navbarOpened, navbarHandlers] = useDisclosure(true)

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          breakpoint: 'sm',
          collapsed: { mobile: false },
          width: { base: navbarOpened ? 200 : 60 },
        }}
        padding="md"
      >
        <AppShell.Header>
          <HeaderSimple />
        </AppShell.Header>

        <AppShell.Navbar>
          <Burger
            variant="subtle"
            // pos="absolute"
            // top="50%"
            // right={0}
            // ml="auto"
            bg="var(--mantine-color-body)"
            size="md"
            onClick={navbarHandlers.toggle}
            // hiddenFrom="sm"
            opened={navbarOpened}
          />
          <Navbar />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>

      </AppShell>
      <TanStackRouterDevtools />
    </>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
