import React, { useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Target } from './Components/Target';
import { makeRounds, addResult } from './targets.slice';
import { useAppDispatch, useAppSelector } from '@/store';

const TargetsPage = () => {
  const dispatch = useAppDispatch();
  const numberOfRounds = useAppSelector(state => state.targets.numberOfRounds);
  const turnsPerRound = useAppSelector(state => state.targets.turnsPerRound);
  const turnIndex = useAppSelector(state => state.targets.turnIndex);
  const roundIndex = useAppSelector(state => state.targets.roundIndex);
  const rounds = useAppSelector(state => state.targets.rounds);

  const handleTargetHit = () => {
    addResult(dispatch)({ roundIndex, turnIndex, targetResult: 'hit' });
  };

  const handleTargetMissed = () => {
    addResult(dispatch)({ roundIndex, turnIndex, targetResult: 'missed' });
  };

  useEffect(() => {
    makeRounds(dispatch)({ numberOfRounds, turnsPerRound });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log(rounds);
  return (
    <Container>
      {rounds.map((round, rIdx) => (
        <Row key={rIdx} className={`my-2 ${rIdx > roundIndex ? 'd-none' : ''}`}>
          {round.map((target: TargetResultPayload, tIdx:number) => (
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
