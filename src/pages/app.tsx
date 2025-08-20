
import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import AppShell from '@/components/AppShell';
import { Toaster } from 'react-hot-toast';
import Head from 'next/head';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#3b82f6" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      
      <AppShell>
        <Component {...pageProps} />
      </AppShell>
      
      <Toaster position="top-center" />
    </>
  );
}
