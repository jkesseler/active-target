import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import { store } from '@/configureStore';
import { TargetsPage } from './TargetsPage'
import './global.scss';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <TargetsPage />
  </Provider>
)
