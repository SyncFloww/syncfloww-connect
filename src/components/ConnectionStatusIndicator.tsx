import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import apiClient from '@/lib/apiClient';

type ConnectionStatus = 'checking' | 'connected' | 'disconnected';

export default function ConnectionStatusIndicator() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [dismissed, setDismissed] = useState(false);

  const checkConnection = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setStatus('disconnected');
      return;
    }

    setStatus('checking');
    try {
      // Backend exposes a /health/ endpoint (see SyncFloww-api/syncfloww/urls.py)
      await apiClient.get('/health/', { timeout: 5000 });
      setStatus('connected');
    } catch {
      // Try a simpler root request as fallback
      try {
        await apiClient.head('/', { timeout: 5000 });
        setStatus('connected');
      } catch {
        setStatus('disconnected');
      }
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss after 4s if connected
  useEffect(() => {
    if (status === 'connected') {
      const timeout = setTimeout(() => setDismissed(true), 4000);
      return () => clearTimeout(timeout);
    }
    setDismissed(false);
  }, [status]);

  if (dismissed && status === 'connected') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
          status === 'checking'
            ? 'bg-muted text-muted-foreground'
            : status === 'connected'
            ? 'bg-success/10 text-success border border-success/20'
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}
      >
        {status === 'checking' && (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Checking server connection…</span>
          </>
        )}
        {status === 'connected' && (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span>Connected to server</span>
          </>
        )}
        {status === 'disconnected' && (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Can't reach the server — check your connection or try again</span>
            <button
              onClick={checkConnection}
              className="ml-1 underline hover:no-underline"
            >
              Retry
            </button>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
