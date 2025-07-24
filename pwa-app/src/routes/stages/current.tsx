import { createFileRoute } from '@tanstack/react-router';
import { Table, TextInput, Container, Grid, Paper } from '@mantine/core';
import { useAppSelector } from '@/store';
import { selectDevicesByType, } from '@/features/devices/devicesSlice';
import { selectStageById, selectCurrentScores, selectCurrentStage } from '@/features/stages/stagesSlice';
import * as DevicesTypes from '@/features/devices/types';
import { calculateTotals } from '@/utils/scoreUtils';

const scoreDeviceTypes = [
  DevicesTypes.DEVICE_TYPE_TARGET,
  DevicesTypes.DEVICE_TYPE_POPPER,
  DevicesTypes.DEVICE_TYPE_NOSHOOT,
  DevicesTypes.DEVICE_TYPE_STOP_PLATE
];

export const Route = createFileRoute('/stages/current')({
  component: StageDetailsPage
});

function StageDetailsPage() {
  const stage = useAppSelector((state) => selectCurrentStage(state));
  const devices = useAppSelector((state) => selectDevicesByType(state, scoreDeviceTypes));
  const currentScores = useAppSelector(state => selectCurrentScores(state))
  const total = { major: 0, minor: 0 };

  devices.forEach((device: DevicesTypes.Device) => {
    const targetScores = currentScores.find(score => score.deviceId === device.id);
    if (device.type === DevicesTypes.DEVICE_TYPE_TARGET) {
      const scores = targetScores?.results.map(result => result.targetZone) || [];
      const [major, minor] = calculateTotals(scores);
      total.major += major;
      total.minor += minor;
    } else if (device.type === DevicesTypes.DEVICE_TYPE_POPPER) {
      total.major += 5;
      total.minor += 5;
    }
  });

  return (
    <>
      <Container size="lg" my="md">
        <h1>Current Stage</h1>

        <Paper>
          Total Major: {total.major} / Time: 12.51 = HF: {(total.major / 12.51).toFixed(2)} <br />
          Total Minor: {total.minor} / Time: 12.51 = HF: {(total.minor / 12.51).toFixed(2)} <br />
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
            <tbody>
              {devices.map((device: DevicesTypes.Device) => {
                const targetScores = currentScores.find(score => score.deviceId === device.id);
                const scoreByZone = (targetZone: string) => targetScores?.results.filter(result => result.targetZone === targetZone);

                return (
                  <Table.Tr key={device.id}>
                    <Table.Td>{device.name}</Table.Td>
                    {['A', 'C', 'D'].map((targetZone) => {
                      const zoneScores = scoreByZone(targetZone);
                      const zoneScoreCount = !!zoneScores?.length ? zoneScores.length : ' ';

                      return (
                        <Table.Td key={`${device.id}-${targetZone}`}>
                          {zoneScoreCount}
                        </Table.Td>
                      )
                    })}
                    <Table.Td>
                      {/* Mi */}
                    </Table.Td>
                    <>
                      {/* Total */}
                      {(() => {
                        if (device.type === DevicesTypes.DEVICE_TYPE_TARGET) {
                          const scores = targetScores?.results.map(result => result.targetZone) || [];
                          const [major, minor] = calculateTotals(scores);

                          return (
                            <>
                              <Table.Td>{major}</Table.Td>
                              <Table.Td>{minor}</Table.Td>
                            </>
                          );
                        } else if (device.type === DevicesTypes.DEVICE_TYPE_POPPER) {
                          return (
                            <>
                              <Table.Td>5</Table.Td>
                              <Table.Td>5</Table.Td>
                            </>
                          );
                        } else {
                          return (
                            <>
                              <Table.Td></Table.Td>
                              <Table.Td></Table.Td>
                            </>
                          );
                        }
                      })()}
                    </>
                  </Table.Tr>
                )
              })}
            </tbody>
          </Table>
        </Paper>
      </Container>
    </>
  );
}
