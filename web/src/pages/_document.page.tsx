/* eslint-disable max-len */
import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/*
            NextJS strips the 'onload' attribute from '<link ....' tags
            This hack prevents that so async font loading can be used.
            See: https://github.com/vercel/next.js/issues/12984
          */}
          <noscript dangerouslySetInnerHTML={{
            __html: `</noscript>
              <link rel="preconnect" href="https://fonts.googleapis.com">
              <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
              <link
              onload="this.media='all'"
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700;900&family=Roboto:wght@200;300;400;500;700;900&family=Open+Sans:wght@400;500;700;900&"
              media="print"
            />
              <noscript>`
          }}></noscript>

          <noscript>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@400;500;700;900&family=Roboto:wght@200;300;400;500;700;900&family=Open+Sans:wght@400;500;700;900&display=swap" />
          </noscript>

          <script dangerouslySetInnerHTML={{ __html: '<!-- Error Reporting snippet -->'}} />

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
export default MyDocument;
