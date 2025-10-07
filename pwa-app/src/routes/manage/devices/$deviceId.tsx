import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  Container,
  Title,
  Button,
  Switch,
  Table,
  Group,
  ActionIcon,
  Badge,
  Card,
  Text,
  Stack,
  Modal,
  TextInput,
  Textarea,
} from '@mantine/core';
import { IconEdit, IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import {
  selectDeviceById,
  deviceOnline,
  deviceOffline,
  deviceUpdated,
} from '@/features/devices/devicesSlice';
import * as Types from '@/features/devices/types';

export const Route = createFileRoute('/manage/devices/$deviceId')({
  component: DeviceDetailsPage,
});

function DeviceDetailsPage() {
  const { deviceId } = Route.useParams();
  const device = useAppSelector(state => selectDeviceById(state, deviceId));
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const [sideEffectOpened, { open: openSideEffect, close: closeSideEffect }] = useDisclosure(false);

  // Form for editing device basic info
  const editForm = useForm({
    initialValues: {
      name: device?.name || '',
    },
    validate: {
      name: value => (value.length < 2 ? 'Device name must have at least 2 characters' : null),
    },
  });

  // Form for adding side effects
  const sideEffectForm = useForm({
    initialValues: {
      topic: '',
      payload: '',
    },
    validate: {
      topic: value => (value.length < 1 ? 'Topic is required' : null),
      payload: value => (value.length < 1 ? 'Payload is required' : null),
    },
  });

  if (!device) {
    return (
      <Container size="xl" py="md">
        <Title order={2} c="red">Device not found</Title>
        <Button mt="md" onClick={() => navigate({ to: '/manage/devices' })}>
          Back to Devices
        </Button>
      </Container>
    );
  }

  const handleStatusToggle = () => {
    if (device.status === Types.STATUS.ONLINE) {
      dispatch(deviceOffline({ id: device.id }));
      notifications.show({
        title: 'Device Offline',
        message: `Device "${device.name}" is now offline.`,
        color: 'orange',
      });
    }
    else {
      dispatch(deviceOnline({ id: device.id }));
      notifications.show({
        title: 'Device Online',
        message: `Device "${device.name}" is now online.`,
        color: 'green',
      });
    }
  };

  const handleEditSubmit = (values: typeof editForm.values) => {
    dispatch(deviceUpdated({
      id: device.id,
      name: values.name,
      lastUpdated: new Date().toISOString(),
    }));
    notifications.show({
      title: 'Device Updated',
      message: `Device "${values.name}" has been successfully updated.`,
      color: 'green',
    });
    closeEdit();
  };

  const handleSideEffectSubmit = (values: typeof sideEffectForm.values) => {
    const newSideEffect: Types.SideEffect = {
      topic: values.topic,
      payload: values.payload,
    };

    dispatch(deviceUpdated({
      id: device.id,
      sideEffects: [...(device.sideEffects || []), newSideEffect],
      lastUpdated: new Date().toISOString(),
    }));

    notifications.show({
      title: 'Side Effect Added',
      message: 'Side effect has been successfully added.',
      color: 'green',
    });
    sideEffectForm.reset();
    closeSideEffect();
  };

  const getStatusColor = (status: Types.STATUS | undefined) => {
    switch (status) {
      case Types.STATUS.ONLINE:
        return 'green';
      case Types.STATUS.OFFLINE:
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container size="xl" py="md">
      <Group mb="lg">
        <ActionIcon
          variant="subtle"
          size="lg"
          onClick={() => navigate({ to: '/manage/devices' })}
        >
          <IconArrowLeft size={20} />
        </ActionIcon>
        <Title order={2}>
          Device Details:
          {device.name}
        </Title>
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={() => {
            editForm.setValues({ name: device.name });
            openEdit();
          }}
        >
          <IconEdit size={16} />
        </ActionIcon>
      </Group>

      <Group align="stretch" mb="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="space-between" mb="xs">
            <Text fw={500}>Basic Information</Text>
          </Group>

          <Stack gap="sm">
            <Group>
              <Text size="sm" c="dimmed">Type:</Text>
              <Badge variant="light" color="blue">{device.type}</Badge>
            </Group>

            <Group>
              <Text size="sm" c="dimmed">Status:</Text>
              <Group gap="xs">
                <Switch
                  checked={device.status === Types.STATUS.ONLINE}
                  onChange={handleStatusToggle}
                  color={getStatusColor(device.status)}
                />
                <Badge color={getStatusColor(device.status)} size="sm">
                  {device.status || 'Unknown'}
                </Badge>
              </Group>
            </Group>

            <Group>
              <Text size="sm" c="dimmed">Last Updated:</Text>
              <Text size="sm">
                {device.lastUpdated ? new Date(device.lastUpdated).toLocaleString('nl-NL') : 'Never'}
              </Text>
            </Group>
          </Stack>
        </Card>
      </Group>

      <Group align="start" gap="lg">
        {/* Side Effects Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Group justify="space-between" mb="md">
            <Text fw={500}>Side Effects</Text>
            <Button
              size="xs"
              leftSection={<IconPlus size={14} />}
              onClick={openSideEffect}
            >
              Add Side Effect
            </Button>
          </Group>

          {device.sideEffects && device.sideEffects.length > 0
            ? (
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Topic</Table.Th>
                      <Table.Th>Payload</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {device.sideEffects.map((sideEffect: Types.SideEffect, index: number) => (
                      <Table.Tr key={index}>
                        <Table.Td>
                          <Text size="sm" ff="monospace">{sideEffect.topic}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" ff="monospace">{sideEffect.payload}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )
            : (
                <Text size="sm" c="dimmed">No side effects configured</Text>
              )}
        </Card>

        {/* Responses Section */}
        <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1 }}>
          <Text fw={500} mb="md">Responses</Text>

          {device.responses && device.responses.length > 0
            ? (
                <Stack gap="xs">
                  {device.responses.slice(-10).map((response: string, index: number) => (
                    <Text key={index} size="sm" ff="monospace" p="xs" bg="gray.1" style={{ borderRadius: 4 }}>
                      {response}
                    </Text>
                  ))}
                  {device.responses.length > 10 && (
                    <Text size="xs" c="dimmed">Showing last 10 responses</Text>
                  )}
                </Stack>
              )
            : (
                <Text size="sm" c="dimmed">No responses recorded</Text>
              )}
        </Card>
      </Group>

      {/* Edit Device Modal */}
      <Modal
        opened={editOpened}
        onClose={closeEdit}
        title="Edit Device"
        size="md"
      >
        <form onSubmit={editForm.onSubmit(handleEditSubmit)}>
          <Stack>
            <TextInput
              label="Device Name"
              placeholder="Enter device name"
              {...editForm.getInputProps('name')}
              required
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeEdit}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                Update Device
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Add Side Effect Modal */}
      <Modal
        opened={sideEffectOpened}
        onClose={closeSideEffect}
        title="Add Side Effect"
        size="md"
      >
        <form onSubmit={sideEffectForm.onSubmit(handleSideEffectSubmit)}>
          <Stack>
            <TextInput
              label="MQTT Topic"
              placeholder="e.g., device/command"
              {...sideEffectForm.getInputProps('topic')}
              required
            />
            <Textarea
              label="Payload"
              placeholder='e.g., {"action": "trigger"}'
              {...sideEffectForm.getInputProps('payload')}
              required
              minRows={3}
            />
            <Group justify="flex-end" mt="md">
              <Button variant="light" onClick={closeSideEffect}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                Add Side Effect
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
