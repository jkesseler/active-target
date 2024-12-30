/* eslint-disable @next/next/no-img-element */
import { Provider } from 'react-redux';
import { config } from '@fortawesome/fontawesome-svg-core';
import App, { AppContext, type AppProps } from 'next/app';
import { type NextPage } from 'next';
import { wrapper } from '@/configureStore';

import '@fortawesome/fontawesome-svg-core/styles.css';
import '@/styles/globals.scss';

export type PageWithLayout<P = unknown, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode
}

type MyAppProps = AppProps & {
  Component: PageWithLayout;
  pageProps: any;
}

// Prevent unstyled font-awsome icons on SSR
config.autoAddCss = false;

export const MyApp = (props: MyAppProps) => {
  const { store } = wrapper.useWrappedStore(props);
  const { Component, pageProps } = props;

  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
};

(MyApp as any).getInitialProps = wrapper.getInitialAppProps((/*store: any*/) => async (context: AppContext) => {
  const initialProps = await App.getInitialProps(context);

  return {
    ...initialProps
  };
});
export default MyApp;
