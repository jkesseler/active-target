import { createFileRoute } from '@tanstack/react-router';
import { Container, Table, Paper } from '@mantine/core';
import { useAppSelector } from '@/store/configureStore';
import { selectDevicesByType } from '@/features/devices/devicesSlice';
// import { selectCurrentStage } from '@/features/stages/stagesSlice';
import * as DevicesTypes from '@/features/devices/types';
import type { Scores, Result } from '@/features/scoresTable/types';
import { calculateTotals } from '@/utils/scoreUtils';

const scoreDeviceTypes = [
  DevicesTypes.DEVICE_TYPE_TARGET,
  DevicesTypes.DEVICE_TYPE_POPPER,
  DevicesTypes.DEVICE_TYPE_NOSHOOT,
  DevicesTypes.DEVICE_TYPE_STOP_PLATE,
];

export const Route = createFileRoute('/manage/stages/current')({
  component: StageDetailsPage,
});

function StageDetailsPage() {
  const devices = useAppSelector(state => selectDevicesByType(state, scoreDeviceTypes));
  // TODO: Implement scoring system - using empty array for now
  const currentScores: Scores[] = [];
  const total = { major: 0, minor: 0 };

  devices.forEach((device: DevicesTypes.Device) => {
    const targetScores = currentScores.find((score: Scores) => score.deviceId === device.id);
    if (device.type === DevicesTypes.DEVICE_TYPE_TARGET) {
      const scores = targetScores?.results.map((result: Result) => result.targetZone) || [];
      const [major, minor] = calculateTotals(scores);
      total.major += major;
      total.minor += minor;
    }
    else if (device.type === DevicesTypes.DEVICE_TYPE_POPPER) {
      total.major += 5;
      total.minor += 5;
    }
  });

  return (
    <>
      <Container size="lg" my="md">
        <h1>Current Stage</h1>

        <Paper>
          Total Major:
          {' '}
          {total.major}
          {' '}
          / Time: 12.51 = HF:
          {' '}
          {(total.major / 12.51).toFixed(2)}
          {' '}
          <br />
          Total Minor:
          {' '}
          {total.minor}
          {' '}
          / Time: 12.51 = HF:
          {' '}
          {(total.minor / 12.51).toFixed(2)}
          {' '}
          <br />
        </Paper>

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
              {devices
                .filter((device: DevicesTypes.Device) => device.type === DevicesTypes.DEVICE_TYPE_TARGET)
                .map((device: DevicesTypes.Device) => {
                  const targetScores = currentScores.find((score: Scores) => score.deviceId === device.id);
                  const scores = targetScores?.results.map((result: Result) => result.targetZone) || [];
                  const [major, minor] = calculateTotals(scores);

                  const aHits = scores.filter(score => score === 'A').length;
                  const cHits = scores.filter(score => score === 'C').length;
                  const dHits = scores.filter(score => score === 'D').length;
                  const missHits = 0; // TODO: Add miss tracking to scoring system

                  return (
                    <Table.Tr key={device.id}>
                      <Table.Td>{device.name}</Table.Td>
                      <Table.Td>{aHits}</Table.Td>
                      <Table.Td>{cHits}</Table.Td>
                      <Table.Td>{dHits}</Table.Td>
                      <Table.Td>{missHits}</Table.Td>
                      <Table.Td>{major}</Table.Td>
                      <Table.Td>{minor}</Table.Td>
                    </Table.Tr>
                  );
                })}
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
              {devices
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
          <Table striped="odd">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>No-Shoot</Table.Th>
                <Table.Th>Hit</Table.Th>
                <Table.Th>Miss</Table.Th>
                <Table.Th>Penalty</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {devices
                .filter((device: DevicesTypes.Device) => device.type === DevicesTypes.DEVICE_TYPE_NOSHOOT)
                .map((device: DevicesTypes.Device) => (
                  <Table.Tr key={device.id}>
                    <Table.Td>{device.name}</Table.Td>
                    <Table.Td>0</Table.Td>
                    <Table.Td>1</Table.Td>
                    <Table.Td>0</Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Paper>
      </Container>
    </>
  );
}
