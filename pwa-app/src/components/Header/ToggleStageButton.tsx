import { Button } from '@mantine/core'
import { useTranslation } from '@/hooks/useTranslation'
import { useAppSelector, useAppDispatch } from '@/store/configureStore'
import { selectCurrentStage, stageDeactivated } from '@/features/stages/stagesSlice'
import { selectCurrentMatch, activateStageInMatch } from '@/features/match/matchSlice'
import * as StageTypes from '@/features/stages/types'

export const ToggleStageButton = () => {
  const { t } = useTranslation('header')
  const dispatch = useAppDispatch()
  const currentStage = useAppSelector(state => selectCurrentStage(state))
  const currentMatch = useAppSelector(state => selectCurrentMatch(state))
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE

  const handleStageStartStop = () => {
    if (!currentStage || !currentMatch) return

    if (isStageActive) {
      dispatch(stageDeactivated({ id: currentStage.id }))
    }
    else {
      // Use coordinated action to activate stage in match context
      dispatch(activateStageInMatch({
        matchId: currentMatch.id,
        stageId: currentStage.id,
      }))
    }
  }

  return (
    <Button onMouseDown={handleStageStartStop} color={isStageActive ? 'red' : 'green'} disabled={!currentStage || !currentMatch}>
      {isStageActive ? t('button:stop') : t('button:start')}
    </Button>
  )
}
