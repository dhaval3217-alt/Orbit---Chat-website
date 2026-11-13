import React, { useState, useEffect } from 'react';
import { socketClient } from '../../socket/socketClient.js';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export const NetworkStatusBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSocketConnected, setIsSocketConnected] = useState<boolean>(true);
  const [showRestored, setShowRestored] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      socketClient.connect();
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkSocket = setInterval(() => {
      const s = socketClient.getSocket();
      setIsSocketConnected(s?.connected ?? true);
    }, 4000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkSocket);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-rose-600 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-center gap-2 shadow-lg animate-in slide-in-from-top duration-200">
        <WifiOff className="h-3.5 w-3.5" />
        <span>No Internet Connection. Working offline.</span>
      </div>
    );
  }

  if (!isSocketConnected) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600/95 backdrop-blur-md text-white text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
        <span>Reconnecting to Orbit real-time gateway...</span>
      </div>
    );
  }

  if (showRestored) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white text-xs font-bold py-1.5 px-4 flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top duration-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Connection restored!</span>
      </div>
    );
  }

  return null;
};
