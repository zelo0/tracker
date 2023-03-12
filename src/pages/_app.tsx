import DefaultLayout from '@/components/layout/DefaultLayout';
import '@/styles/global.scss'
import type { AppProps } from 'next/app'
import { SessionProvider } from 'next-auth/react'
import LoadingLayout from '@/components/layout/LoadingLayout';
import Head from 'next/head';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <title>가격 추적기</title>
      </Head>

      <SessionProvider session={ session } >
        <LoadingLayout>
          <DefaultLayout>
            <Component {...pageProps} />
          </DefaultLayout>
        </LoadingLayout>
      </SessionProvider>
    </>
  );
}
