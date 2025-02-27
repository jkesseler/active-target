import * as React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Table, TextInput, Container, Grid, Paper } from '@mantine/core';

const targets = Array.from({ length: 16 }, (_, i) => `Target ${i + 1}`);
export const Route = createFileRoute('/scoresheet/')({
  component: ScoreSheetPage,
});

function ScoreSheetPage() {
  return (
    <>
      <Container size="lg" my="md">
        <Paper shadow="xs" p="md">
          <Table striped="odd">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Target</Table.Th>
                <Table.Th>A</Table.Th>
                <Table.Th>C</Table.Th>
                <Table.Th>D</Table.Th>
                <Table.Th>Time</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <tbody>
              {targets.map((target) => (
                <Table.Tr key={target}>
                  <Table.Td>{target}</Table.Td>
                  {[...Array(4)].map((_, i) => (
                    <Table.Td key={i}>
                      <TextInput size="xs" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </tbody>
          </Table>
        </Paper>

        <Paper shadow="xs" p="md" mt="md">
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
        </Paper>
      </Container>
    </>
  );
}
