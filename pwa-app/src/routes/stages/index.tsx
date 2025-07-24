import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/stages/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Stages</h1>
      <Outlet />
    </>
  );
}
