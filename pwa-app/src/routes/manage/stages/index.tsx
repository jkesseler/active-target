import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  Table,
  Button,
  Group,
  Modal,
  TextInput,
  MultiSelect,
  ActionIcon,
  Paper,
  Title,
  Badge
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconTarget } from '@tabler/icons-react';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import { selectStages, stageAdded, stageUpdated, stageRemoved } from '@/features/stages/stagesSlice';
import { selectDevices } from '@/features/devices/devicesSlice';
import * as StageTypes from '@/features/stages/types';
import { notifications } from '@mantine/notifications';

export const Route = createFileRoute('/manage/stages/')({
  component: StageManagement
});

interface StageFormData {
  id?: string;
  name: string;
  devices: string[];
}

function StageManagement() {
  const dispatch = useAppDispatch();
  const stages = useAppSelector(selectStages);
  const devices = useAppSelector(selectDevices);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingStage, setEditingStage] = useState<StageTypes.Stage | null>(null);

  const form = useForm<StageFormData>({
    initialValues: {
      name: '',
      devices: []
    },
    validate: {
      name: (value) => value.length < 2 ? 'Stage name must be at least 2 characters' : null,
      devices: (value) => value.length === 0 ? 'At least one device must be selected' : null
    }
  });

  const deviceOptions = devices.map(device => ({
    value: device.id,
    label: `${device.name} (${device.type})`
  }));

  const handleSubmit = (values: StageFormData) => {
    if (editingStage) {
      // Update existing stage
      dispatch(stageUpdated({
        id: editingStage.id,
        name: values.name,
        devices: values.devices
      }));
      notifications.show({
        title: 'Stage Updated',
        message: `${values.name} has been updated successfully`,
        color: 'blue'
      });
    } else {
      // Create new stage
      const newStage: StageTypes.Stage = {
        id: `stage-${Date.now()}`,
        name: values.name,
        devices: values.devices,
        status: StageTypes.STATUS.STAGE_INACTIVE
      };
      dispatch(stageAdded(newStage));
      notifications.show({
        title: 'Stage Created',
        message: `${values.name} has been created successfully`,
        color: 'green'
      });
    }

    setModalOpened(false);
    setEditingStage(null);
    form.reset();
  };

  const handleEdit = (stage: StageTypes.Stage) => {
    setEditingStage(stage);
    form.setValues({
      name: stage.name,
      devices: stage.devices
    });
    setModalOpened(true);
  };

  const handleDelete = (stage: StageTypes.Stage) => {
    if (window.confirm(`Are you sure you want to delete "${stage.name}"?`)) {
      dispatch(stageRemoved({ id: stage.id }));
      notifications.show({
        title: 'Stage Deleted',
        message: `${stage.name} has been deleted`,
        color: 'red'
      });
    }
  };

  const handleCreate = () => {
    setEditingStage(null);
    form.reset();
    setModalOpened(true);
  };

  const getStatusColor = (status: StageTypes.STATUS) => {
    return status === StageTypes.STATUS.STAGE_ACTIVE ? 'green' : 'gray';
  };

  return (
    <>
      <Paper p="md">
        <Group justify="space-between" mb="md">
          <Group>
            <IconTarget size={24} />
            <Title order={2}>Stage Management</Title>
          </Group>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Create Stage
          </Button>
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Devices</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {stages.map((stage) => (
              <Table.Tr key={stage.id}>
                <Table.Td>{stage.name}</Table.Td>
                <Table.Td>
                  <Badge color={getStatusColor(stage.status)} variant="light">
                    {stage.status}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {stage.devices.map(deviceId => {
                      const device = devices.find(d => d.id === deviceId);
                      return device ? (
                        <Badge key={deviceId} size="sm" variant="outline">
                          {device.name}
                        </Badge>
                      ) : null;
                    })}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      onClick={() => handleEdit(stage)}
                    >
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="red"
                      onClick={() => handleDelete(stage)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {stages.length === 0 && (
          <Paper p="xl" style={{ textAlign: 'center' }}>
            <IconTarget size={48} style={{ opacity: 0.3 }} />
            <Title order={4} mt="md" c="dimmed">No stages found</Title>
            <Button mt="md" onClick={handleCreate}>Create your first stage</Button>
          </Paper>
        )}
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => {
          setModalOpened(false);
          setEditingStage(null);
          form.reset();
        }}
        title={editingStage ? 'Edit Stage' : 'Create New Stage'}
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Stage Name"
            placeholder="Enter stage name"
            required
            {...form.getInputProps('name')}
            mb="md"
          />

          <MultiSelect
            label="Devices"
            placeholder="Select devices for this stage"
            data={deviceOptions}
            required
            {...form.getInputProps('devices')}
            mb="lg"
          />

          <Group justify="flex-end">
            <Button
              variant="light"
              onClick={() => {
                setModalOpened(false);
                setEditingStage(null);
                form.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingStage ? 'Update Stage' : 'Create Stage'}
            </Button>
          </Group>
        </form>
      </Modal>
    </>
  );
}
