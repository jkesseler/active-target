import * as React from 'react'
import { Outlet, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/')({
  component: RouteComponent,
})

function RouteComponent() {
  // TODO: Number of users, number of online devices
  // Summary of last users and scores
  // StageName | name | Score | Time | Hitfactor
  return (
    <>
      <h1>Dashboard</h1>
      <Outlet />
    </>
  )
}
