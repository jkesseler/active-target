import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/test/')({
  component: TestPage
});


// To test a Stage:
// Grab devices from state
// Create a timed sequence on wich to fire mqtt messages for each device

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
