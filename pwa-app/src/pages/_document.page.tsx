/* eslint-disable max-len */
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    // @ts-expect-error: env is not typed on props
    const runtimeEnv = JSON.stringify(this.props.env);
    return (
      <Html>
        <Head>
          <script
            dangerouslySetInnerHTML={{
              __html: `window.env = ${runtimeEnv}`
            }}
          />
        </Head>
        <body>
          <Main />
          <div id="portal" />
          <NextScript />
        </body>
      </Html>
    );
  }
}

MyDocument.getInitialProps = async (ctx) => {
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => key.startsWith('NEXT_PUBLIC_')));

  const initialProps = await Document.getInitialProps(ctx);
  return {
    ...initialProps,
    env: {
      ...env,
      NEXT_PUBLIC_URL_WWW_EXTERNAL: process.env.URL_WWW_EXTERNAL
    }
  };
};
export default MyDocument;
