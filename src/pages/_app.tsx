import React from 'react';
import { AuthProvider } from '@providers';
import '@styles/index.css';

export default function _App({ Component, pageProps: props }) {
  return (
    <AuthProvider>
      <Component {...props} />
    </AuthProvider>
  );
}

// https://nextjs.org/docs/advanced-features/measuring-performance
export function reportWebVitals(metric) {}
