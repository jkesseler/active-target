import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Text,
  Group,
  ActionIcon,
} from '@mantine/core'
import { IconPlayerPlay, IconPlayerPause, IconPlayerStop, IconRefresh } from '@tabler/icons-react'
import { useAppSelector, useAppDispatch } from '@/store/configureStore'
import { selectCurrentStage, stageDeactivated } from '@/features/stages/stagesSlice'
import { selectCurrentMatch, activateStageInMatch } from '@/features/match/matchSlice'
import * as StageTypes from '@/features/stages/types'
import { useStageTimer } from '@/hooks/useStageTimer'

import classes from './Timer.module.css'

export const Timer = () => {
  const dispatch = useAppDispatch()
  const [time, setTime] = useState(0)
  const intervalId = useRef<NodeJS.Timeout | null>(null)
  const currentStage = useAppSelector(state => selectCurrentStage(state))
  const currentMatch = useAppSelector(state => selectCurrentMatch(state))
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE

  // Handle timer intervals with proper TypeScript types and cleanup
  useEffect(() => {
    if (isStageActive) {
      intervalId.current = setInterval(() => setTime(value => value + 1), 10)
    }
    else if (intervalId.current) {
      clearInterval(intervalId.current)
      intervalId.current = null
    }

    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current)
        intervalId.current = null
      }
    }
  }, [isStageActive])

  // Calculate display values from centisecond counter
  const minute = Math.floor((time % 360000) / 6000)
  const second = Math.floor((time % 6000) / 100)
  const millisecond = time % 100

  const handleReset = useCallback(() => {
    setTime(0)
  }, [])

  const tm = (number: number) => number.toString().padStart(2, '0')
  const timer = useStageTimer()

  const handleStageStart = useCallback(() => {
    if (currentStage && currentMatch) {
      dispatch(activateStageInMatch({
        matchId: currentMatch.id,
        stageId: currentStage.id,
      }))
    }
  }, [currentStage, currentMatch, dispatch])

  const handleStageStop = useCallback(() => {
    if (currentStage) {
      dispatch(stageDeactivated({ id: currentStage.id }))
    }
  }, [currentStage, dispatch])

  return (
    <div className={classes.timer}>
      <Text size="xl" fw={700}>
        {`${tm(minute)}:${tm(second)}:${tm(millisecond)}`}
      </Text>
      <Group gap="xs" justify="center" mt="xs">
        <ActionIcon
          onClick={handleStageStart}
          color={timer.isRunning ? 'yellow' : 'green'}
          size="sm"
        >
          {timer.isRunning && !timer.isPaused ? <IconPlayerPause size={14} /> : <IconPlayerPlay size={14} />}
        </ActionIcon>
        <ActionIcon onClick={handleStageStop} color="red" size="sm">
          <IconPlayerStop size={14} />
        </ActionIcon>
        <ActionIcon onClick={handleReset} color="gray" size="sm">
          <IconRefresh size={14} />
        </ActionIcon>
      </Group>
    </div>
  )
}
