import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/dashboard')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <h1>Dashboard</h1>
      <Outlet />
    </>
  );
}
