/* eslint-disable @next/next/no-img-element */
import { Provider } from 'react-redux';
import { store } from '@/configureStore'
import type { AppProps } from 'next/app';
import '@/styles/globals.scss';

export const MyApp = (props: AppProps) => {
  const { Component, pageProps } = props;

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

export default MyApp;
