import * as React from 'react'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  Container,
  Title,
  Button,
  Table,
  ActionIcon,
  Group,
  TextInput,
  Modal,
  Stack,
  Select,
  Switch,
  Badge,
} from '@mantine/core'
import { IconPlus, IconEdit, IconTrash, IconSearch, IconEye } from '@tabler/icons-react'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { notifications } from '@mantine/notifications'
import { useAppSelector, useAppDispatch } from '@/store/configureStore'
import {
  selectDevices,
  deviceAdded,
  deviceUpdated,
  deviceRemoved,
  deviceOnline,
  deviceOffline,
} from '@/features/devices/devicesSlice'
import * as Types from '@/features/devices/types'

export const Route = createFileRoute('/manage/devices/')({
  component: DevicesManagementPage,
})

// Device type options for the select component
const deviceTypeOptions = [
  { value: Types.DEVICE_TYPE_TARGET, label: 'Target' },
  { value: Types.DEVICE_TYPE_POPPER, label: 'Popper' },
  { value: Types.DEVICE_TYPE_NOSHOOT, label: 'No Shoot' },
  { value: Types.DEVICE_TYPE_STOP_PLATE, label: 'Stop Plate' },
]

function DevicesManagementPage() {
  const devices = useAppSelector(selectDevices)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = React.useState('')
  const [opened, { open, close }] = useDisclosure(false)
  const [editingDevice, setEditingDevice] = React.useState<Types.Device | null>(null)

  // Form for creating/editing devices
  const form = useForm({
    initialValues: {
      name: '',
      type: Types.DEVICE_TYPE_TARGET as Types.DeviceType,
    },
    validate: {
      name: value => (value.length < 2 ? 'Device name must have at least 2 characters' : null),
      type: value => (value ? null : 'Device type is required'),
    },
  })

  // Filter devices based on search term
  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase())
    || device.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleCreateDevice = () => {
    setEditingDevice(null)
    form.reset()
    open()
  }

  const handleEditDevice = (device: Types.Device) => {
    setEditingDevice(device)
    form.setValues({
      name: device.name,
      type: device.type,
    })
    open()
  }

  const handleViewDevice = (deviceId: string) => {
    navigate({ to: '/manage/devices/$deviceId', params: { deviceId } })
  }

  const handleDeleteDevice = (deviceId: string, deviceName: string) => {
    if (window.confirm(`Are you sure you want to delete device "${deviceName}"? This will also remove all associated data.`)) {
      dispatch(deviceRemoved({ id: deviceId }))
      notifications.show({
        title: 'Device Deleted',
        message: `Device "${deviceName}" has been successfully deleted.`,
        color: 'red',
      })
    }
  }

  const handleStatusToggle = (device: Types.Device) => {
    if (device.status === Types.STATUS.ONLINE) {
      dispatch(deviceOffline({ id: device.id }))
      notifications.show({
        title: 'Device Offline',
        message: `Device "${device.name}" is now offline.`,
        color: 'orange',
      })
    }
    else {
      dispatch(deviceOnline({ id: device.id }))
      notifications.show({
        title: 'Device Online',
        message: `Device "${device.name}" is now online.`,
        color: 'green',
      })
    }
  }

  const handleSubmit = (values: typeof form.values) => {
    if (editingDevice) {
      // Update existing device
      dispatch(deviceUpdated({
        id: editingDevice.id,
        ...values,
        lastUpdated: new Date().toISOString(),
      }))
      notifications.show({
        title: 'Device Updated',
        message: `Device "${values.name}" has been successfully updated.`,
        color: 'green',
      })
    }
    else {
      // Create new device
      const newDevice: Types.Device = {
        id: crypto.randomUUID(),
        name: values.name,
        type: values.type,
        status: Types.STATUS.OFFLINE,
        lastUpdated: new Date().toISOString(),
        responses: [],
        sideEffects: [],
      }
      dispatch(deviceAdded(newDevice))
      notifications.show({
        title: 'Device Created',
        message: `Device "${values.name}" has been successfully created.`,
        color: 'green',
      })
    }
    close()
    form.reset()
  }

  const getStatusColor = (status: Types.STATUS | undefined) => {
    switch (status) {
      case Types.STATUS.ONLINE:
        return 'green'
      case Types.STATUS.OFFLINE:
        return 'red'
      default:
        return 'gray'
    }
  }

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Title order={2}>Devices Management</Title>
        <Button leftSection={<IconPlus size={16} />} color="blue" onClick={handleCreateDevice}>
          Add Device
        </Button>
      </Group>

      <Group mb="md">
        <TextInput
          placeholder="Search devices..."
          leftSection={<IconSearch size={16} />}
          value={searchTerm}
          onChange={event => setSearchTerm(event.currentTarget.value)}
          style={{ flexGrow: 1 }}
        />
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Last Updated</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {filteredDevices.map(device => (
            <Table.Tr key={device.id}>
              <Table.Td>
                <strong>{device.name}</strong>
              </Table.Td>
              <Table.Td>
                <Badge variant="light" color="blue">
                  {device.type}
                </Badge>
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Switch
                    checked={device.status === Types.STATUS.ONLINE}
                    onChange={() => handleStatusToggle(device)}
                    color={getStatusColor(device.status)}
                  />
                  <Badge color={getStatusColor(device.status)} size="sm">
                    {device.status || 'Unknown'}
                  </Badge>
                </Group>
              </Table.Td>
              <Table.Td>
                {device.lastUpdated ? new Date(device.lastUpdated).toLocaleString('nl-NL') : 'Never'}
              </Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <ActionIcon
                    variant="subtle"
                    color="green"
                    onClick={() => handleViewDevice(device.id)}
                    title="View Details"
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="blue"
                    onClick={() => handleEditDevice(device)}
                    title="Edit Device"
                  >
                    <IconEdit size={16} />
                  </ActionIcon>
                  <ActionIcon
                    variant="subtle"
                    color="red"
                    onClick={() => handleDeleteDevice(device.id, device.name)}
                    title="Delete Device"
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {filteredDevices.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>
          {searchTerm ? 'No devices found matching your search.' : 'No devices found. Create your first device!'}
        </div>
      )}

      {/* Create/Edit Device Modal */}
      <Modal
        opened={opened}
        onClose={close}
        title={editingDevice ? 'Edit Device' : 'Create New Device'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Device Name"
              placeholder="Enter device name"
              {...form.getInputProps('name')}
              required
            />
            <Select
              label="Device Type"
              placeholder="Select device type"
              data={deviceTypeOptions}
              {...form.getInputProps('type')}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                {editingDevice ? 'Update Device' : 'Create Device'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Outlet />
    </Container>
  )
}
