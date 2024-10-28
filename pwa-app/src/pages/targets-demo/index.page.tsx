import { useDispatch, useSelector } from 'react-redux';
import useTranslation from 'next-translate/useTranslation';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import { startConnecting, selectIsConnecting, selectIsConnected } from '@/stores/mqttSlice';
import { useBrowserLayoutEffect } from '@/hooks/useBrowserLayoutEffect';
import { selectResults } from '@/stores/resultsSlice';
import { AppRootState } from '@/configureStore';


export const ShotsPage = () => {
  const { t } = useTranslation('shotspage');
  const dispatch = useDispatch();
  const isConnecting = useSelector((state: AppRootState) => selectIsConnecting(state));
  const isConnected = useSelector((state: AppRootState) => selectIsConnected(state));
  const results = useSelector((state: AppRootState) => selectResults(state));

  useBrowserLayoutEffect(() => {
    if (!isConnected) {
      dispatch(startConnecting());
    }
  }, []);


  return (
    <>
      <Container>
        <Row>
          <Col>
            <h3>{t('Total')}: {results.length ?? 0 }</h3>
          </Col>
          <Col xs="auto" className="ms-auto">
            {isConnecting && <Badge bg="warning">{t('state.connecting')}</Badge>}
            {(!isConnecting && isConnected) && <Badge bg="success">{t('state.connected')}</Badge>}
            {(!isConnecting && !isConnected) && <Badge bg="danger">{t('state.not-connected')}</Badge>}
          </Col>
        </Row>
        <Row>
          <Col>
            <Table striped>
              <thead>
                <tr>
                  <th>{t('th.target')}</th>
                  <th>{t('th.result')}</th>
                  <th>{t('th.time-difference')}</th>
                </tr>
              </thead>
              <tbody>
                {results.map((device, idx) => {
                  let difference = 0;
                  if (idx > 0) {
                    // timestamp is Unix Epoch in milliseconds
                    const previousTimestamp = results[idx - 1].timeMillies ?? 0;
                    const currentTimestamp = device.timeMillies || 0;
                    difference = (currentTimestamp - previousTimestamp) / 1000;
                  }
                  const displayName = device?.deviceName || device?.deviceId;

                  return (
                    <tr key={idx}>
                      <td>
                        {displayName}
                      </td>
                      <td>{device.result}</td>
                      <td>{t('td.difference', { difference })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ShotsPage;
