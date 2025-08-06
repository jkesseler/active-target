import { createFileRoute } from '@tanstack/react-router';
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Badge,
  Table,
  Group,
  Stack,
  Card,
  Progress,
  Divider,
  Button,
  ActionIcon,
  Kbd,
  Overlay,
  Center
} from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/configureStore';
import { selectCurrentStage } from '@/features/stages/stagesSlice';
// import { selectUsers } from '@/features/users/usersSlice';
// import { selectDevicesByType } from '@/features/devices/devicesSlice';
// import * as DevicesTypes from '@/features/devices/types';
import { useStageTimer } from '@/hooks/useStageTimer';
import { useShootingSimulation } from '@/hooks/useShootingSimulation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Timer } from '@/components/Timer/Timer';
import { mockStageData, mockShooters, mockTargets, type MockShooter, type MockTarget } from '@/mocks/big-screen-mock-data';
import classes from './big-screen.module.css';

export const Route = createFileRoute('/big-screen/')({
  component: BigScreenPage
});

function BigScreenPage() {
  const stage = useAppSelector(selectCurrentStage);
  // const users = useAppSelector(selectUsers);
  // const devices = useAppSelector((state) => selectDevicesByType(state, [
  //   DevicesTypes.DEVICE_TYPE_TARGET,
  //   DevicesTypes.DEVICE_TYPE_POPPER,
  //   DevicesTypes.DEVICE_TYPE_NOSHOOT,
  //   DevicesTypes.DEVICE_TYPE_STOP_PLATE
  // ]));

  // Timer management
  const timer = useStageTimer();

  // Current targets and shooters state
  const [currentTargets, setCurrentTargets] = useState<MockTarget[]>(mockTargets);
  const [currentShooters /*, setCurrentShooters */] = useState<MockShooter[]>(mockShooters);
  const [showHelp, setShowHelp] = useState(false);

  // Simulation controls
  const simulation = useShootingSimulation(currentTargets, setCurrentTargets);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onStartStop: () => simulation.isSimulating ? simulation.stopSimulation() : simulation.startSimulation(),
    onReset: simulation.resetTargets,
    onSimulateShot: simulation.simulateShot,
    onToggleTimer: () => timer.isRunning ? timer.pause() : timer.start(),
    onShowHelp: () => setShowHelp(true)
  });

  // Show help on first load
  useEffect(() => {
    const hasSeenHelp = localStorage.getItem('big-screen-help-seen');
    if (!hasSeenHelp) {
      setShowHelp(true);
      localStorage.setItem('big-screen-help-seen', 'true');
    }
  }, []);

  // Get current and next shooter
  const currentShooter = currentShooters.find(shooter => shooter.userId === mockStageData.currentShooterId);
  const nextShooter = currentShooters.find(shooter => shooter.userId === mockStageData.nextShooterId);

  // Calculate live stats
  const hitTargets = currentTargets.filter(t => t.status === 'hit').length;
  const missedTargets = currentTargets.filter(t => t.status === 'missed').length;
  const totalScore = currentTargets.reduce((sum, t) => sum + t.points, 0);
  const hitFactor = totalScore > 0 && timer.elapsedTime > 0 ? (totalScore / timer.elapsedTime).toFixed(2) : '0.00';

  const getTargetStatusColor = (status: string) => {
    switch (status) {
      case 'hit': return 'green';
      case 'missed': return 'red';
      default: return 'gray';
    }
  };

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'paper': return '📄';
      case 'popper': return '🎯';
      case 'steel': return '🔘';
      case 'noshoot': return '🚫';
      default: return '❓';
    }
  };


  return (
    <div className={classes.bigScreen}>
      <Container fluid className={classes.container}>
        <Grid gutter="md" className={classes.grid}>
          {/* Top Left - Current Shooter Info */}
          <Grid.Col span={6} className={classes.leftPanel}>
            <Card className={classes.currentShooterCard} p="lg">
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <div>
                    <Title order={2} className={classes.stageName}>
                      {stage?.name || mockStageData.stageName}
                    </Title>
                    <Text size="lg" className={classes.currentShooter}>
                      Current: <strong>{currentShooter?.userName || 'No shooter'}</strong>
                    </Text>
                    <Text size="md" className={classes.nextShooter}>
                      Next: {nextShooter?.userName || 'No shooter'}
                    </Text>
                  </div>

                  <Timer />

                </Group>

                <Divider />

                <Grid>
                  <Grid.Col span={6}>
                    <Paper className={classes.statCard} p="md">
                      <Text size="sm" c="dimmed">Score</Text>
                      <Text size="xl" fw={700}>{totalScore}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper className={classes.statCard} p="md">
                      <Text size="sm" c="dimmed">Hit Factor</Text>
                      <Text size="xl" fw={700}>{hitFactor}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper className={classes.statCard} p="md">
                      <Text size="sm" c="dimmed">Hits</Text>
                      <Text size="xl" fw={700} c="green">{hitTargets}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Paper className={classes.statCard} p="md">
                      <Text size="sm" c="dimmed">Misses</Text>
                      <Text size="xl" fw={700} c="red">{missedTargets}</Text>
                    </Paper>
                  </Grid.Col>
                </Grid>
              </Stack>
            </Card>

            {/* Bottom Left - Targets List */}
            <Card className={classes.targetsCard} p="lg" mt="md">
              <Group justify="space-between" mb="md">
                <Title order={3}>Targets Status</Title>
                <Group gap="xs">
                  <Button
                    size="xs"
                    color={simulation.isSimulating ? 'red' : 'green'}
                    onClick={simulation.isSimulating ? simulation.stopSimulation : simulation.startSimulation}
                  >
                    {simulation.isSimulating ? 'Stop' : 'Simulate'}
                  </Button>
                  <Button size="xs" variant="outline" onClick={simulation.resetTargets}>
                    Reset
                  </Button>
                  <Button size="xs" variant="outline" onClick={simulation.simulateShot}>
                    Single Shot
                  </Button>
                </Group>
              </Group>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Target</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Zone</Table.Th>
                    <Table.Th>Points</Table.Th>
                    <Table.Th>Time</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {currentTargets.map((target) => (
                    <Table.Tr key={target.id} data-status={target.status}>
                      <Table.Td>{getTargetTypeIcon(target.type)} {target.name}</Table.Td>
                      <Table.Td>{target.type.toUpperCase()}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={getTargetStatusColor(target.status)}
                          variant="filled"
                          size="sm"
                        >
                          {target.status.toUpperCase()}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{target.zone || '-'}</Table.Td>
                      <Table.Td>{target.points}</Table.Td>
                      <Table.Td>{target.timeHit ? `${target.timeHit.toFixed(2)}s` : '-'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>
          </Grid.Col>

          {/* Top Right - Scores Leaderboard */}
          <Grid.Col span={6} className={classes.rightPanel}>
            <Card className={classes.leaderboardCard} p="lg">
              <Title order={3} mb="md">Leaderboard</Title>
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Rank</Table.Th>
                    <Table.Th>Shooter</Table.Th>
                    <Table.Th>Score</Table.Th>
                    <Table.Th>HF</Table.Th>
                    <Table.Th>Time</Table.Th>
                    <Table.Th>H/M</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {currentShooters
                    .sort((a, b) => b.hitFactor - a.hitFactor)
                    .map((shooter, index) => (
                      <Table.Tr
                        key={shooter.userId}
                        className={shooter.userId === currentShooter?.userId ? classes.currentShooterRow : ''}
                      >
                        <Table.Td>
                          <Badge
                            color={index === 0 ? 'yellow' : index === 1 ? 'gray' : index === 2 ? 'orange' : 'blue'}
                            variant="filled"
                          >
                            {index + 1}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={shooter.userId === currentShooter?.userId ? 700 : 400}>
                            {shooter.userName}
                          </Text>
                          {shooter.status === 'shooting' && (
                            <Badge size="xs" color="red" variant="dot" ml="xs">LIVE</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>{shooter.score}</Table.Td>
                        <Table.Td>{shooter.hitFactor}</Table.Td>
                        <Table.Td>{shooter.time > 0 ? `${shooter.time}s` : '-'}</Table.Td>
                        <Table.Td>
                          <Text c="green" component="span">{shooter.hits}</Text>
                          <Text c="red" component="span">/{shooter.misses}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                </Table.Tbody>
              </Table>

              {/* Stage Progress */}
              <div className={classes.progressSection}>
                <Text size="sm" c="dimmed" mb="xs">Stage Progress</Text>
                <Progress
                  value={(currentShooters.filter(shooter => shooter.status === 'completed').length / currentShooters.length) * 100}
                  size="lg"
                  color="blue"
                />
                <Text size="sm" c="dimmed" mt="xs">
                  {currentShooters.filter(shooter => shooter.status === 'completed').length} of {currentShooters.length} shooters completed
                </Text>
              </div>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>

      {/* Help Overlay */}
      {showHelp && (
        <Overlay onClick={() => setShowHelp(false)} style={{ zIndex: 1000 }}>
          <Center style={{ height: '100vh' }}>
            <Card p="xl" style={{ maxWidth: 400 }}>
              <Title order={3} mb="md">Keyboard Shortcuts</Title>
              <Stack gap="sm">
                <Group>
                  <Kbd>Space</Kbd>
                  <Text>Start/Stop simulation</Text>
                </Group>
                <Group>
                  <Kbd>R</Kbd>
                  <Text>Reset targets</Text>
                </Group>
                <Group>
                  <Kbd>S</Kbd>
                  <Text>Single shot</Text>
                </Group>
                <Group>
                  <Kbd>T</Kbd>
                  <Text>Toggle timer</Text>
                </Group>
                <Group>
                  <Kbd>H</Kbd>
                  <Text>Show this help</Text>
                </Group>
              </Stack>
              <Button fullWidth mt="md" onClick={() => setShowHelp(false)}>
                Got it!
              </Button>
            </Card>
          </Center>
        </Overlay>
      )}

      {/* Help Button */}
      <ActionIcon
        style={{ position: 'fixed', top: 20, right: 20, zIndex: 999 }}
        onClick={() => setShowHelp(true)}
        color="blue"
        variant="filled"
      >
        <IconHelp size={16} />
      </ActionIcon>
    </div>
  );
}
