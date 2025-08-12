// Simplified offline mode indicator component
import React, { useState, useEffect } from 'react';
import { WifiOff, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useNetworkStatus } from './NetworkStatusMonitor';

interface OfflineIndicatorProps {
  showDetails?: boolean;
  position?: 'top' | 'bottom';
  onDismiss?: () => void;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  showDetails = true,
  position = 'bottom',
  onDismiss
}) => {
  const { isOnline, isConnecting } = useNetworkStatus();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Auto-dismiss when back online
  useEffect(() => {
    if (isOnline && isDismissed) {
      setIsDismissed(false);
    }
  }, [isOnline, isDismissed]);

  // Don't show if online or dismissed
  if (isOnline || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const getStatusMessage = () => {
    if (isConnecting) {
      return 'Reconnecting to server...';
    }
    return 'You\'re currently offline';
  };

  const getAvailableFeatures = () => {
    return [
      'View previously loaded data',
      'Browse cached content',
      'Access user interface',
      'Make changes (limited)'
    ];
  };

  const getLimitedFeatures = () => {
    return [
      'Real-time updates',
      'New data from server',
      'Data synchronization',
      'File uploads'
    ];
  };

  const positionClasses = position === 'top' 
    ? 'top-0 border-b' 
    : 'bottom-0 border-t';

  return (
    <div className={`fixed left-0 right-0 ${positionClasses} bg-orange-50 border-orange-200 z-40 shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start justify-between">
          {/* Main Status */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {isConnecting ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-orange-800">
                  {getStatusMessage()}
                </span>
              </div>
              
              <p className="text-sm text-orange-700 mt-1">
                Some features are limited while offline. You can still browse previously loaded content.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {showDetails && (
              <button
                onClick={() => setShowFullDetails(!showFullDetails)}
                className="text-sm text-orange-700 hover:text-orange-800 underline"
              >
                {showFullDetails ? 'Less info' : 'More info'}
              </button>
            )}
            
            <button
              onClick={handleDismiss}
              className="p-1 text-orange-600 hover:text-orange-800 hover:bg-orange-100 rounded"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Detailed Information */}
        {showFullDetails && (
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Available Features */}
              <div>
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Available Features
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {getAvailableFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Limited Features */}
              <div>
                <h4 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Limited Features
                </h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  {getLimitedFeatures().map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Connection Status */}
            <div className="mt-4 pt-4 border-t border-orange-200">
              <h4 className="font-medium text-orange-800 mb-2">
                Connection Status
              </h4>
              
              <div className="text-sm text-orange-700">
                <p className="mb-2">
                  {isConnecting 
                    ? 'Attempting to reconnect to the server...' 
                    : 'No internet connection detected. Please check your network settings.'}
                </p>
                <p className="text-xs text-orange-600">
                  The app will automatically reconnect when your internet connection is restored.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;

// Simplified hook for checking if app should show offline mode
export const useOfflineMode = () => {
  const { isOnline, isConnecting } = useNetworkStatus();

  return {
    isOffline: !isOnline,
    isConnecting,
    hasPendingChanges: false, // Simplified - no queue tracking
    canMakeChanges: isOnline, // Only allow changes when online
    canViewCachedData: true // Always allow viewing cached data
  };
};