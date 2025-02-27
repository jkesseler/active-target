import { createFileRoute } from '@tanstack/react-router';
import { Table, TextInput, Container, Grid, Paper } from '@mantine/core';
import { useAppSelector } from '@/store';
import { selectDevicesByType } from '@/features/devices/devicesSlice';
import {
  selectStageById,
  selectCurrentScores,
  selectCurrentStage,
} from '@/features/stages/stagesSlice';
import * as DevicesTypes from '@/features/devices/types';

const scoreDeviceTypes = [
  DevicesTypes.DEVICE_TYPE_TARGET,
  DevicesTypes.DEVICE_TYPE_POPPER,
  DevicesTypes.DEVICE_TYPE_NOSHOOT,
  DevicesTypes.DEVICE_TYPE_STOP_PLATE,
];

export const Route = createFileRoute('/stages/$stageId')({
  component: StageDetailsPage,
});

function StageDetailsPage() {
  const stage = useAppSelector((state) => selectCurrentStage(state));
  const targets = useAppSelector((state) =>
    selectDevicesByType(state, scoreDeviceTypes),
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
                <Table.Th>Total</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <tbody>
              {targets.map((target: DevicesTypes.Device) => (
                <Table.Tr key={target.id}>
                  <Table.Td>{target.name}</Table.Td>
                  {[...Array(4)].map((_, i) => (
                    <Table.Td key={i}>
                      {stage?.scoresTable?.scores?.results}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </tbody>
          </Table>
        </Paper>

        {/* <Paper shadow="xs" p="md" mt="md">
          <Grid>
            <Grid.Col span={4}>
              <TextInput label="Competitor" />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput label="Range Officer" />
            </Grid.Col>
            <Grid.Col span={2}>
              <TextInput label="Keyed" />
            </Grid.Col>
            <Grid.Col span={2}>
              <TextInput label="Verified" />
            </Grid.Col>
          </Grid>
        </Paper> */}
      </Container>
    </>
  );
}
