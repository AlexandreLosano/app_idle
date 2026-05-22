import { useEffect } from 'react';
import { Dashboard } from './components/Dashboard';

const PROD_IP = import.meta.env.VITE_PROD_IP as string | undefined;

function isDevHost(): boolean {
  if (!PROD_IP) return true;
  return window.location.hostname !== PROD_IP;
}

export default function App() {
  const dev = isDevHost();

  useEffect(() => {
    document.title = dev
      ? '[DEV] Idle Miner Tycom - Tracker'
      : 'Idle Miner Tycom - Tracker';
  }, [dev]);

  return (
    <>
      {dev && (
        <>
          <div className="dev-ribbon dev-ribbon-left">⚠ DEV</div>
          <div className="dev-ribbon dev-ribbon-right">⚠ DEV</div>
        </>
      )}
      <Dashboard />
    </>
  );
}
