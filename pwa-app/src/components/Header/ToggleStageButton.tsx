import { Button } from '@mantine/core';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppSelector, useAppDispatch } from '@/store/configureStore';
import { selectCurrentStage, stageActivated, stageDeactivated } from '@/features/stages/stagesSlice';
import * as StageTypes from '@/features/stages/types';

export const ToggleStageButton = () => {
  const { t } = useTranslation('header');
  const dispatch = useAppDispatch();
  const currentStage = useAppSelector(state => selectCurrentStage(state));
  const isStageActive = currentStage?.status === StageTypes.STATUS.STAGE_ACTIVE;

  const handleStageStartStop = () => {
    if (isStageActive) {
      dispatch(stageDeactivated({ id: currentStage.id }));
    } else {
      currentStage && dispatch(stageActivated({ id: currentStage.id }));
    }
  };

  return (
    <Button onMouseDown={handleStageStartStop} color={isStageActive ? 'red' : 'green'} disabled={!currentStage}>
      {isStageActive ? t('button:stop') : t('button:start')}
    </Button>
  );
};
