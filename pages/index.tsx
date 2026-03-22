import dynamic from 'next/dynamic';
import Head from 'next/head';

// Disable SSR for the main App component because it relies heavily
const TradeLabApp = dynamic(() => import('../src/App'), { 
  ssr: false,
  loading: () => <div style={{ color: 'white', padding: '2rem' }}>Loading TradeLab Application...</div>
});

export default function Home() {
  return (
    <>
      <Head>
        <title>TradeLab | Dashboard</title>
      </Head>
     <TradeLabApp />
    </>
  );
}
