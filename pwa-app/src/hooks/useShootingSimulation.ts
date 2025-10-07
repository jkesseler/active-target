import { useState, useEffect, useCallback } from 'react';
import { simulateTargetHit, simulateTargetMiss, type MockTarget } from '@/mocks/big-screen-mock-data';

export function useShootingSimulation(targets: MockTarget[], onTargetUpdate: (targets: MockTarget[]) => void) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(2000); // ms between shots

  const simulateShot = useCallback(() => {
    const availableTargets = targets.filter(t => t.status === 'default');
    if (availableTargets.length === 0) return;

    const randomTarget = availableTargets[Math.floor(Math.random() * availableTargets.length)];
    const hitChance = 0.8; // 80% hit rate
    const zones = ['A', 'B', 'C', 'D'] as const;

    if (Math.random() < hitChance) {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      const timeHit = Math.random() * 20 + 5; // Random time between 5-25 seconds
      simulateTargetHit(randomTarget.id, zone, timeHit);
    }
    else {
      simulateTargetMiss(randomTarget.id);
    }

    onTargetUpdate([...targets]);
  }, [targets, onTargetUpdate]);

  useEffect(() => {
    let i: NodeJS.Timeout;

    if (isSimulating) {
      i = setInterval(() => {
        simulateShot();
      }, simulationSpeed);
    }

    return () => {
      if (i) {
        clearInterval(i);
      }
    };
  }, [isSimulating, simulationSpeed, simulateShot]);

  const startSimulation = useCallback(() => setIsSimulating(true), []);
  const stopSimulation = useCallback(() => setIsSimulating(false), []);

  const resetTargets = useCallback(() => {
    targets.forEach((target) => {
      target.status = 'default';
      target.zone = null;
      target.points = 0;
      target.timeHit = undefined;
    });
    onTargetUpdate([...targets]);
  }, [targets, onTargetUpdate]);

  return {
    isSimulating,
    simulationSpeed,
    setSimulationSpeed,
    startSimulation,
    stopSimulation,
    resetTargets,
    simulateShot,
  };
}
