import * as React from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { Container, Title, Tabs } from '@mantine/core'
import { IconTarget, IconUsers, IconTrophy, IconDeviceDesktop } from '@tabler/icons-react'

export const Route = createFileRoute('/manage/')({
  component: ManageLayout,
})

function ManageLayout() {
  const navigate = useNavigate()

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="lg">Manage</Title>

      <Tabs
        defaultValue="stages"
        variant="outline"
        onChange={(value) => {
          if (value === 'stages') {
            navigate({ to: '/manage/stages' })
          }
          else if (value === 'users') {
            navigate({ to: '/manage/users' })
          }
          else if (value === 'devices') {
            navigate({ to: '/manage/devices' })
          }
        }}
      >
        <Tabs.List>
          <Tabs.Tab value="stages" leftSection={<IconTarget size={16} />}>
            Stages
          </Tabs.Tab>
          <Tabs.Tab value="users" leftSection={<IconUsers size={16} />}>
            Users
          </Tabs.Tab>
          <Tabs.Tab value="devices" leftSection={<IconDeviceDesktop size={16} />}>
            Devices
          </Tabs.Tab>
          <Tabs.Tab value="matches" leftSection={<IconTrophy size={16} />}>
            Matches
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stages" pt="md">
          <Outlet />
        </Tabs.Panel>

        <Tabs.Panel value="users" pt="md">
          <Outlet />
        </Tabs.Panel>

        <Tabs.Panel value="devices" pt="md">
          <Outlet />
        </Tabs.Panel>

        <Tabs.Panel value="matches" pt="md">
          <div>Match management coming soon...</div>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
