import { useDispatch, useSelector } from 'react-redux';
import useTranslation from 'next-translate/useTranslation';
import Table from 'react-bootstrap/Table';
import { startConnecting, selectIsConnecting, selectIsConnected } from '@/stores/mqttSlice';
import { useBrowserLayoutEffect } from '@/hooks/useBrowserLayoutEffect';
import { selectResults } from '@/stores/resultsSlice';
import { AppRootState } from '@/configureStore';


export const TargetsPage = () => {
  const { t } = useTranslation('targetspage');
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
      {isConnecting && <h2>{t('state.connecting')} ...</h2> }
      {(!isConnecting && isConnected) && <h2>{t('state.connected')}</h2> }
      {(!isConnecting && !isConnected) && <h2>{t('state.not-connected')}</h2>}

      <div>
        <h3>{t('Total')}: {results.length ?? 0 }</h3>
        <Table striped>
          <thead>
            <tr>
              <th>{t('th.target')}</th>
              <th>{t('th.result')}</th>
              <th>{t('th.time-difference')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((target, idx) => {
              let difference = 0;
              if (idx > 0) {
              // timestamp is Unix Epoch in milliseconds
                const previousTimestamp = results[idx - 1].timestamp ?? 0;
                const currentTimestamp = target.timestamp || 0;
                difference = (currentTimestamp - previousTimestamp) / 1000;
              }
              const displayName = target?.targetName || target?.targetId;

              return (
                <tr key={idx}>
                  <td>
                    {displayName}
                  </td>
                  <td>{target.result}</td>
                  <td>{t('difference', { difference })}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </>
  );
};

export default TargetsPage;
