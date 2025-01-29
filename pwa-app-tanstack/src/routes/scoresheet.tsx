import * as React from 'react';
import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/scoresheet')({
  component: ScoreSheetPage
});

function ScoreSheetPage() {
  return (
    <>
      <h1>ScoreSheet</h1>
      <Outlet />
    </>
  );
}
