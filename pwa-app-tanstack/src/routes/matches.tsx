import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/matches')({
  component: RouteComponent
});

function RouteComponent() {
  return (
    <>
      <h1>Matches</h1>
      <Outlet />
    </>
  );
}
