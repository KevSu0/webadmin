import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getConnectionStatus } from '../services/firebase';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const { error, refetchUser } = useAuth();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await refetchUser();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Show connection status only if there are issues
  const hasConnectionIssues = !isOnline || error;
  
  if (!hasConnectionIssues) {
    return null;
  }

  // Determine the appropriate message and styling
  let message = 'Connection issues detected';
  let bgColor = 'bg-yellow-50';
  let borderColor = 'border-yellow-400';
  let textColor = 'text-yellow-700';
  let buttonColor = 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700';
  let icon = <AlertTriangle className="h-5 w-5 text-yellow-400" />;

  if (!isOnline) {
    message = 'You are currently offline';
    bgColor = 'bg-red-50';
    borderColor = 'border-red-400';
    textColor = 'text-red-700';
    buttonColor = 'bg-red-100 hover:bg-red-200 text-red-700';
    icon = <WifiOff className="h-5 w-5 text-red-400" />;
  } else if (error) {
    message = error;
  }

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icon}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${textColor}`}>
            {message}
          </p>
        </div>
        <div className="ml-4">
          <button
            onClick={handleRetry}
            disabled={isRetrying}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded ${buttonColor} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;