import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, Send, Download, AlertCircle } from 'lucide-react';
import { getProjectConnector, ConnectorStats, CONNECTOR_EVENTS } from '@/services/projectConnector';

interface ProjectConnectorProps {
  projectId: string;
  targetProjectId?: string;
  showStatus?: boolean;
  autoSync?: boolean;
  className?: string;
}

export function ProjectConnector({
  projectId,
  targetProjectId = 'farm-hub-app',
  showStatus = true,
  autoSync = true,
  className = ''
}: ProjectConnectorProps) {
  const [stats, setStats] = useState<ConnectorStats>({
    pendingCount: 0,
    sentCount: 0,
    receivedCount: 0,
    processedCount: 0,
    connectedProjects: 1
  });
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const connector = getProjectConnector(projectId, targetProjectId);

  useEffect(() => {
    // Update stats periodically
    const updateStats = () => {
      const currentStats = connector.getStatus();
      setStats(currentStats);
      setLastSync(new Date());
    };

    // Listen for connector events
    const handleDataSent = () => {
      updateStats();
    };

    const handleDataReceived = () => {
      updateStats();
    };

    const handleConnected = () => {
      setIsConnected(true);
      updateStats();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
    };

    // Add event listeners
    window.addEventListener(CONNECTOR_EVENTS.DATA_SENT, handleDataSent);
    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    window.addEventListener(CONNECTOR_EVENTS.CONNECTED, handleConnected);
    window.addEventListener(CONNECTOR_EVENTS.DISCONNECTED, handleDisconnected);

    // Initial stats update
    updateStats();

    // Set up periodic updates
    const interval = setInterval(updateStats, 5000);

    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_SENT, handleDataSent);
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
      window.removeEventListener(CONNECTOR_EVENTS.CONNECTED, handleConnected);
      window.removeEventListener(CONNECTOR_EVENTS.DISCONNECTED, handleDisconnected);
      clearInterval(interval);
    };
  }, [connector]);

  const handleSync = () => {
    const currentStats = connector.getStatus();
    setStats(currentStats);
    setLastSync(new Date());
  };

  const handleCleanup = () => {
    const cleanedCount = connector.cleanupProcessedData(24);
    alert(`Cleaned up ${cleanedCount} old processed items`);
    handleSync();
  };

  if (!showStatus) {
    return null;
  }

  const getStatusColor = (count: number) => {
    if (count > 10) return 'bg-red-500';
    if (count > 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            Project Connector
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanup}
              className="h-8 w-8 p-0"
            >
              <AlertCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          Connected to: <Badge variant="secondary">{targetProjectId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pending</span>
              <Badge 
                className={`${getStatusColor(stats.pendingCount)} text-white`}
              >
                {stats.pendingCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sent</span>
              <Badge variant="default" className="bg-blue-500">
                {stats.sentCount}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Received</span>
              <Badge variant="default" className="bg-purple-500">
                {stats.receivedCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Processed</span>
              <Badge variant="default" className="bg-green-500">
                {stats.processedCount}
              </Badge>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last sync:</span>
            <span className="font-medium">{formatTime(lastSync)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </div>

        {stats.pendingCount > 5 && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              High pending items ({stats.pendingCount}). Consider processing or cleaning up old data.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}