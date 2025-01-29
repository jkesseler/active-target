import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/devices')({
  component: DevicesPage
});

function DevicesPage() {
  return (
    <>
      <h1>Devices</h1>
      <Outlet />
    </>
  );
}
