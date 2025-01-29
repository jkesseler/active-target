import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test/')({
  component: TestPage,
});

function TestPage() {
  return (
    <div className="p-2">
      <h3>Testing</h3>
      <p>
        Here will be buttons to that dispatch various actions like:
        <ul>
          <li>Add a user</li>
          <li>Add a device</li>
          <li>Add a target hit message</li>
        </ul>
      </p>
    </div>
  );
}
