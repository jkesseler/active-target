import { useDispatch, useSelector } from 'react-redux';
import { startConnecting, selectIsConnecting, selectIsConnected } from '@/stores/mqttSlice';
import { useBrowserLayoutEffect } from '@/hooks/useBrowserLayoutEffect';
import { selectResults } from './stores/resultsSlice';
import { AppRootState } from './configureStore';

export const TargetsPage = () => {
  const dispatch = useDispatch();
  const isConnecting = useSelector((state: AppRootState) => selectIsConnecting(state));
  const isConnected = useSelector((state: AppRootState) => selectIsConnected(state));
  const results = useSelector((state: AppRootState) => selectResults(state))

  useBrowserLayoutEffect(() => {
    if (!isConnected) {
      dispatch(startConnecting());
    }
  }, []);

 
  return (
    <>
    {isConnecting && <h2>Verbinden ...</h2> }
    {(!isConnecting && isConnected) && <h2>Pew Pew Pew </h2> }
    {(!isConnecting && !isConnected) && <h2>No connection</h2>}

    <div>
      <h3>Totaal: {results.length ?? 0 }</h3>
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
          <div key={idx}>
            {displayName}: {target.result} (Verschil: { difference } sec.)
          </div>
        )
      })}
    </div>
    </>
  );
};

export default TargetsPage;


