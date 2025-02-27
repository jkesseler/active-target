import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/users/')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <h1>Users</h1>
      <Outlet />
    </>
  );
}
