import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Target } from './Components/Target';
import { actions, selectors } from '@/stores/targets';
import { useAppDispatch, useAppSelector } from '@/store';

const TargetsPage = () => {
  const dispatch = useAppDispatch();
  const numberOfRounds = useAppSelector(selectors.selectNumberOrRounds);
  const turnsPerRound = useAppSelector(selectors.selectTurnsPerRound);
  const turnIndex = useAppSelector(selectors.selectTurnIndex);
  const roundIndex = useAppSelector(selectors.selectRoundIndex);
  const rounds = useAppSelector(selectors.selectRounds);

  const handleTargetHit = () => {
    actions.addResult(dispatch)({ roundIndex, turnIndex, targetResult: 'hit' });
  };

  const handleTargetMissed = () => {
    actions.addResult(dispatch)({ roundIndex, turnIndex, targetResult: 'missed' });
  };

  useEffect(() => {
    actions.makeRounds(dispatch)({ numberOfRounds, turnsPerRound });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <Container>
      {rounds.map((round, rIdx) => (
        <Row key={rIdx} className={`my-2 ${rIdx > roundIndex ? 'd-none' : ''}`}>
          {round.map((target: Turn, tIdx:number) => (
            <Col key={`${rIdx}-${tIdx}`}>
              <Target targetResult={target.targetResult} />
            </Col>
          ))}
        </Row>
      ))}
      <Row>
        <Col>
          <button type="button" onClick={handleTargetHit}>Hit Me</button>
        </Col>
        <Col>
          <button type="button" onClick={handleTargetMissed}>Miss Me</button>
        </Col>
      </Row>
    </Container>
  );
};

export default TargetsPage;
