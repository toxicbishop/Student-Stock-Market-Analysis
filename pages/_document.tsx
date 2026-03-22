import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="description" content="TradeLab - AI-Guided Paper Trading & Financial Learning Platform" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </Head>
      <body className="bg-bg-main text-main antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
