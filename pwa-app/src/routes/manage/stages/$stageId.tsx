import { createFileRoute } from '@tanstack/react-router';
import { Table, Container, Paper } from '@mantine/core';
import { useAppSelector } from '@/store/configureStore';
import { selectDevicesByType } from '@/features/devices/devicesSlice';
import { selectCurrentStage } from '@/features/stages/stagesSlice';
import * as DevicesTypes from '@/features/devices/types';

const scoreDeviceTypes = [
  DevicesTypes.DEVICE_TYPE_TARGET,
  DevicesTypes.DEVICE_TYPE_POPPER,
  DevicesTypes.DEVICE_TYPE_NOSHOOT,
  DevicesTypes.DEVICE_TYPE_STOP_PLATE
];

export const Route = createFileRoute('/manage/stages/$stageId')({
  component: StageDetailsPage
});

function StageDetailsPage() {
  const stage = useAppSelector((state) => selectCurrentStage(state));
  const targets = useAppSelector((state) =>
    selectDevicesByType(state, scoreDeviceTypes)
  );

  return (
    <>
      <Container size="lg" my="md">
        <h1>Historical Data</h1>
        <Paper shadow="xs" p="md">
          <Table striped="odd">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Target</Table.Th>
                <Table.Th>A</Table.Th>
                <Table.Th>C</Table.Th>
                <Table.Th>D</Table.Th>
                <Table.Th>Mi</Table.Th>
                <Table.Th>Major</Table.Th>
                <Table.Th>Minor</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {targets
                .filter((device: DevicesTypes.Device) => device.type === DevicesTypes.DEVICE_TYPE_TARGET)
                .map((device: DevicesTypes.Device) => (
                  <Table.Tr key={device.id}>
                    <Table.Td>{device.name}</Table.Td>
                    <Table.Td>2</Table.Td>
                    <Table.Td>1</Table.Td>
                    <Table.Td>0</Table.Td>
                    <Table.Td>1</Table.Td>
                    <Table.Td>10</Table.Td>
                    <Table.Td>11</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <h2>Poppers</h2>
        <Paper shadow="xs" p="md">
          <Table striped="odd">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Popper</Table.Th>
                <Table.Th>Hit</Table.Th>
                <Table.Th>Miss</Table.Th>
                <Table.Th>Major</Table.Th>
                <Table.Th>Minor</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {targets
                .filter((device: DevicesTypes.Device) => device.type === DevicesTypes.DEVICE_TYPE_POPPER)
                .map((device: DevicesTypes.Device) => (
                  <Table.Tr key={device.id}>
                    <Table.Td>{device.name}</Table.Td>
                    <Table.Td>1</Table.Td>
                    <Table.Td>0</Table.Td>
                    <Table.Td>5</Table.Td>
                    <Table.Td>5</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>

        <h2>No-Shoots</h2>
        <Paper shadow="xs" p="md">
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No-Shoot</Table.Th>
                <Table.Th>Hit</Table.Th>
                <Table.Th>Miss</Table.Th>
                <Table.Th>Penalty</Table.Th>
              </Table.Tr>
            </Table.Thead>
          </Table>
        </Paper>
      </Container>
    </>
  );
}
