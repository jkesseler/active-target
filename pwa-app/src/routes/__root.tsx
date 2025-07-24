import * as React from 'react';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { AppShell } from '@mantine/core';
import { Navbar } from '@/components/NavBar/NavBar';
import { HeaderSimple } from '@/components/Header/HeaderSimple';

const RootLayout = () => {
  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile:false } }}
        padding="md"
      >
        <AppShell.Header>
          <HeaderSimple />
        </AppShell.Header>
      
        <AppShell.Navbar>
          <Navbar />
        </AppShell.Navbar>

        <AppShell.Main>
          <Outlet />
        </AppShell.Main>
      
      </AppShell>
      <TanStackRouterDevtools />
    </>
  );
};


export const Route = createRootRoute({
  component: RootLayout
});
