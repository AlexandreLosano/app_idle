import { Dashboard } from './components/Dashboard';

const PROD_IP = import.meta.env.VITE_PROD_IP as string | undefined;

function isDevHost(): boolean {
  if (!PROD_IP) return true;
  return window.location.hostname !== PROD_IP;
}

export default function App() {
  const dev = isDevHost();
  return (
    <>
      {dev && (
        <div className="dev-banner">
          ⚠ DESENVOLVIMENTO — {window.location.hostname}
        </div>
      )}
      <Dashboard />
    </>
  );
}
