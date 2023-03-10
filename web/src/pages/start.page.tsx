import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Container, Row, Col , Form, InputGroup } from 'react-bootstrap';
import { actions } from '@/stores/targets';
import { useAppDispatch } from '@/store';

const TargetsPage = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [numberOfRounds, setNumberOfRounds] = useState(8);
  const [turnsPerRound, setTurnsPerRound] = useState(5);

  const handleRoundsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setNumberOfRounds(value);
  };


  const handleTurnsPerRoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTurnsPerRound(value);
  };

  const handleGameStart = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await actions.makeRounds(dispatch)({ numberOfRounds, turnsPerRound });
    router.push('/targets');
  };

  return (
    <Container>
      <Row>
        <Col>
          <Form.Label>Number of rounds</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={numberOfRounds}
              onChange={handleRoundsChange}
            />
          </InputGroup>
        </Col>
        <Col>
          <Form.Label>Turns per round</Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              value={turnsPerRound}
              onChange={handleTurnsPerRoundChange}
            />
          </InputGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <Button type="button" onClick={handleGameStart}>Start Game</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default TargetsPage;
