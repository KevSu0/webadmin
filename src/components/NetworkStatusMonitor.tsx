// Enhanced draggable network status monitoring component
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle, Minus, X, Move } from 'lucide-react';
import { getConnectionStatus } from '../services/firebase';

interface NetworkStatusProps {
  showDetails?: boolean;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center' | 'inline';
  compact?: boolean;
  onRetry?: () => void;
  draggable?: boolean;
  closable?: boolean;
  minimizable?: boolean;
}

interface Position {
  x: number;
  y: number;
}

interface WindowState {
  isMinimized: boolean;
  isVisible: boolean;
  position: Position;
}

interface ConnectionStats {
  isOnline: boolean;
  lastUpdate: Date;
  retryCount: number;
}

const NetworkStatusMonitor: React.FC<NetworkStatusProps> = ({
  showDetails = false,
  position = 'top-right',
  compact = false,
  onRetry,
  draggable = true,
  closable = true,
  minimizable = true
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [stats, setStats] = useState<ConnectionStats>({
    isOnline: navigator.onLine,
    lastUpdate: new Date(),
    retryCount: 0
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Window state management
  const [windowState, setWindowState] = useState<WindowState>(() => {
    const saved = localStorage.getItem('networkMonitor-state');
    return saved ? JSON.parse(saved) : {
      isMinimized: false,
      isVisible: true,
      position: { x: 16, y: 16 }
    };
  });
  
  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const componentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // Update connection status
  const updateStatus = () => {
    const online = navigator.onLine;
    const firebaseStatus = getConnectionStatus();
    
    setIsOnline(online);
    setStats(prev => ({
      isOnline: online,
      lastUpdate: new Date(),
      retryCount: prev.retryCount
    }));
  };

  useEffect(() => {
    // Initial status update
    updateStatus();

    // Listen to browser online/offline events
    const handleOnline = () => {
      console.log('📊 Network: Online');
      updateStatus();
    };

    const handleOffline = () => {
      console.log('📊 Network: Offline');
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic status updates
    const interval = setInterval(updateStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Save window state to localStorage
  const saveWindowState = useCallback((newState: WindowState) => {
    localStorage.setItem('networkMonitor-state', JSON.stringify(newState));
    setWindowState(newState);
  }, []);

  // Window control handlers
  const handleMinimize = useCallback(() => {
    const newState = { ...windowState, isMinimized: !windowState.isMinimized };
    saveWindowState(newState);
  }, [windowState, saveWindowState]);

  const handleClose = useCallback(() => {
    const newState = { ...windowState, isVisible: false };
    saveWindowState(newState);
  }, [windowState, saveWindowState]);

  const handleShow = useCallback(() => {
    const newState = { ...windowState, isVisible: true };
    saveWindowState(newState);
  }, [windowState, saveWindowState]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!draggable || !componentRef.current) return;
    
    const rect = componentRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    e.preventDefault();
  }, [draggable]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !draggable) return;
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Keep within viewport bounds
    const maxX = window.innerWidth - 200; // min component width
    const maxY = window.innerHeight - 100; // min component height
    
    const boundedX = Math.max(0, Math.min(newX, maxX));
    const boundedY = Math.max(0, Math.min(newY, maxY));
    
    const newState = {
      ...windowState,
      position: { x: boundedX, y: boundedY }
    };
    saveWindowState(newState);
  }, [isDragging, dragOffset, windowState, saveWindowState, draggable]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable) {
        handleClose();
      }
    };

    if (windowState.isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [windowState.isVisible, closable, handleClose]);

  // Handle manual retry
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      // Simple retry by calling the onRetry callback
      if (onRetry) {
        onRetry();
      }
      // Update status after retry
      setTimeout(updateStatus, 1000);
    } catch (error) {
      console.error('Manual retry failed:', error);
    } finally {
      setTimeout(() => setIsRetrying(false), 2000);
    }
  };

  // Get status icon and color
  const getStatusDisplay = () => {
    if (isRetrying) {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        label: 'Reconnecting',
        description: 'Attempting to reconnect...'
      };
    }

    if (isOnline) {
      return {
        icon: <Wifi className="w-4 h-4" />,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Online',
        description: 'Connected and ready'
      };
    } else {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Offline',
        description: 'No internet connection'
      };
    }
  };

  const statusDisplay = getStatusDisplay();

  // Don't render if not visible
  if (!windowState.isVisible) {
    return null;
  }

  const getPositionStyle = () => {
    if (draggable) {
      return {
        position: 'fixed' as const,
        left: `${windowState.position.x}px`,
        top: `${windowState.position.y}px`,
        transform: 'none',
        zIndex: 9999
      };
    }
    
    // Fallback to original position classes for non-draggable
    switch (position) {
      case 'top-left':
        return { position: 'fixed' as const, top: '16px', left: '16px', zIndex: 9999 };
      case 'top-right':
        return { position: 'fixed' as const, top: '16px', right: '16px', zIndex: 9999 };
      case 'bottom-left':
        return { position: 'fixed' as const, bottom: '16px', left: '16px', zIndex: 9999 };
      case 'bottom-right':
        return { position: 'fixed' as const, bottom: '16px', right: '16px', zIndex: 9999 };
      case 'center':
        return { 
          position: 'fixed' as const, 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 9999 
        };
      default:
        return { position: 'fixed' as const, top: '16px', right: '16px', zIndex: 9999 };
    }
  };

  return (
    <div 
      ref={componentRef}
      style={getPositionStyle()}
      className={`transition-all duration-300 ease-in-out ${
        isDragging ? 'opacity-80 shadow-2xl' : 'opacity-100 shadow-lg'
      } ${
        windowState.isMinimized ? 'transform scale-95' : 'transform scale-100'
      }`}
    >
      {/* Window Header (only for draggable/closable/minimizable) */}
      {(draggable || closable || minimizable) && (
        <div
          ref={headerRef}
          className={`bg-gray-100 hover:bg-gray-150 border-b border-gray-200 rounded-t-lg px-3 py-2 flex items-center justify-between transition-colors duration-200 ${
             draggable ? 'cursor-grab active:cursor-grabbing hover:bg-gray-200' : ''
           }`}
          onMouseDown={handleMouseDown}
          onDoubleClick={minimizable ? handleMinimize : undefined}
        >
          <div className="flex items-center space-x-2">
            <Move className="w-3 h-3 text-gray-400" />
            <span className="text-xs font-medium text-gray-700">Network Monitor</span>
          </div>
          <div className="flex items-center space-x-1">
            {minimizable && (
               <button
                 onClick={handleMinimize}
                 className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 hover:shadow-md"
                 title={windowState.isMinimized ? 'Restore' : 'Minimize'}
               >
                 <Minus className="w-2 h-2 text-white transition-transform duration-200" />
               </button>
             )}
             {closable && (
               <button
                 onClick={handleClose}
                 className="w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 hover:scale-110 active:scale-95 flex items-center justify-center transition-all duration-200 hover:shadow-md"
                 title="Close"
               >
                 <X className="w-2 h-2 text-white transition-transform duration-200" />
               </button>
             )}
          </div>
        </div>
      )}

      {/* Content Area */}
       <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
         (draggable || closable || minimizable) ? 'rounded-b-lg' : 'rounded-lg'
       } ${
         windowState.isMinimized 
           ? 'max-h-0 opacity-0 transform scale-y-0' 
           : 'max-h-96 opacity-100 transform scale-y-100'
       }`}>
        {/* Compact View */}
        {compact && (
          <div
            className="bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg p-2 cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => setShowTooltip(!showTooltip)}
          >
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span className="text-xs font-medium text-gray-700">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Tooltip */}
            {showTooltip && (
              <div className="absolute top-full mt-2 left-0 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl z-10 min-w-48">
                <div className="space-y-1">
                  <div>Status: {statusDisplay.label}</div>
                  <div>Updated: {stats.lastUpdate.toLocaleTimeString()}</div>
                  {stats.retryCount > 0 && (
                    <div>Retries: {stats.retryCount}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full View */}
        {!compact && (
          <div className="bg-white/95 backdrop-blur-sm border border-gray-200 shadow-xl p-4 min-w-64 max-w-80">
            {/* Header (only if no window controls) */}
            {!(draggable || closable || minimizable) && (
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                  <span className="text-blue-600">📊</span>
                  <span>Network Status</span>
                </h3>
                <div className={`w-3 h-3 rounded-full ${
                  isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`} />
              </div>
            )}

            {/* Status Details */}
            <div className="space-y-3">
              {/* Connection Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Connection:</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  isOnline 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {statusDisplay.label}
                </span>
              </div>

              {/* Health Status */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Health:</span>
                <span className="text-xs font-medium text-green-600 flex items-center space-x-1">
                  <span>✓</span>
                  <span>Good</span>
                </span>
              </div>

              {/* Last Updated */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Updated:</span>
                <span className="text-xs text-gray-800">
                  {stats.lastUpdate.toLocaleTimeString()}
                </span>
              </div>

              {/* Retry Count */}
              {stats.retryCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-600">Retries:</span>
                  <span className="text-xs text-orange-600 font-medium">
                    {stats.retryCount}
                  </span>
                </div>
              )}

              {/* Manual Retry Button */}
              {onRetry && (
                <button
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="w-full mt-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  {isRetrying ? (
                    <>
                      <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                      <span>Retrying...</span>
                    </>
                  ) : (
                    <>
                      <span>🔄</span>
                      <span>Retry Connection</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NetworkStatusMonitor;

// Simplified hook for using network status in components
export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnecting, setIsConnecting] = useState(false);
  const [stats, setStats] = useState<ConnectionStats>({
    isOnline: navigator.onLine,
    lastUpdate: new Date(),
    retryCount: 0
  });

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine;
      setIsOnline(online);
      setStats(prev => ({
        ...prev,
        isOnline: online,
        lastUpdate: new Date()
      }));
    };

    const handleOnline = () => updateStatus();
    const handleOffline = () => updateStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const retry = async () => {
    setIsConnecting(true);
    // Simple retry logic - just wait and check status
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsConnecting(false);
        resolve();
      }, 2000);
    });
  };

  return {
    isOnline,
    isConnecting,
    stats,
    retry
  };
};