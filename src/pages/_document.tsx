import React from 'react';
import Document, { Head, Html, Main, NextScript } from 'next/document';

export default class _Document extends Document {
  render() {
    return (
      <Html>
        <Head>{/*  Add your manifest assets here */}</Head>
        <body>
          <Main />
        </body>
        <NextScript />
      </Html>
    );
  }
}
