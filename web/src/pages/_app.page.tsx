import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { BasicLayout } from '@/components/Layouts/Basic';
import { store } from '@/store';

import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.scss';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <Provider store={store}>
    <BasicLayout>
      <Component {...pageProps} />
      <ToastContainer position="top-center" />
    </BasicLayout>
  </Provider>
);

export default MyApp;
