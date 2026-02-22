import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { initRedisConnector, syncFromRedis, markRedisDataAsProcessed, getRedisConnector } from '@/services/redisProjectConnector';
import { getProjectConnector, CONNECTOR_EVENTS } from '@/services/projectConnector';
import { RefreshCw, Database, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RedisReceiverProps {
  projectId: string;
  targetProjectId?: string;
  className?: string;
}

export function RedisReceiver({ projectId, targetProjectId = 'farm-hub-app', className = '' }: RedisReceiverProps) {
  const [redisStats, setRedisStats] = useState({
    connected: false,
    lastSync: null as Date | null,
    pendingCount: 0,
    receivedCount: 0
  });
  const [receivedData, setReceivedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const localConnector = getProjectConnector(projectId, targetProjectId);
  const redisConnector = initRedisConnector(projectId, targetProjectId);

  useEffect(() => {
    // Initialize Redis connector
    setRedisStats(prev => ({ ...prev, connected: true }));

    // Listen for data from Redis
    const handleDataReceived = (event: any) => {
      const data = event.detail;
      setReceivedData(prev => [...prev, data]);
      
      setRedisStats(prev => ({
        ...prev,
        receivedCount: prev.receivedCount + 1,
        lastSync: new Date()
      }));
      
      toast.success(`Data received via Redis: ${data.type}`);
    };

    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);

    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    };
  }, [projectId, targetProjectId]);

  const handleSync = async () => {
    setIsLoading(true);
    try {
      await syncFromRedis();
      toast.success('Successfully synced from Redis');
    } catch (error) {
      console.error('Error syncing from Redis:', error);
      toast.error('Error syncing from Redis');
    } finally {
      setIsLoading(false);
      setRedisStats(prev => ({ ...prev, lastSync: new Date() }));
    }
  };

  const handleProcessData = async (dataId: string) => {
    const success = await markRedisDataAsProcessed(dataId);
    if (success) {
      setReceivedData(prev => prev.filter(item => item.id !== dataId));
      toast.success('Data marked as processed');
    } else {
      toast.error('Error marking data as processed');
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString();
  };

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Redis Data Receiver
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={isLoading}
              className="h-8"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Status</Badge>
              <Badge variant="default" className={redisStats.connected ? "bg-green-500" : "bg-red-500"}>
                {redisStats.connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Received</Badge>
              <Badge variant="default" className="bg-purple-500">
                {redisStats.receivedCount}
              </Badge>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Last sync: {formatTime(redisStats.lastSync)}
          </div>
        </div>

        {receivedData.length > 0 ? (
          <div className="space-y-3">
            {receivedData.map((item) => (
              <div 
                key={item.id} 
                className="p-4 border rounded-lg bg-muted/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">{item.type}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {item.type === 'stock_item' && (
                        <>
                          <p><strong>Product:</strong> {item.data.productName}</p>
                          <p><strong>Quantity:</strong> {item.data.quantity} {item.data.unit}</p>
                          <p><strong>Category:</strong> {item.data.category}</p>
                        </>
                      )}
                      {item.type === 'production_data' && (
                        <>
                          <p><strong>Eggs:</strong> {item.data.eggCount}</p>
                          <p><strong>Feed:</strong> {item.data.feedConsumption} kg</p>
                          <p><strong>Mortality:</strong> {item.data.mortality}</p>
                        </>
                      )}
                      <p><strong>Source:</strong> {item.data.source || item.sourceProjectId}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleProcessData(item.id)}
                    className="ml-4"
                  >
                    Process
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No data received from Redis yet</p>
            <p className="text-sm mt-1">Click sync to check for new data</p>
          </div>
        )}

        {!redisStats.connected && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Redis connection not established. Check your credentials.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}