import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjectConnector, CONNECTOR_EVENTS } from '@/services/projectConnector';
import { initRedisConnector, syncFromRedis, markRedisDataAsProcessed } from '@/services/redisProjectConnector';
import { RefreshCw, Database, AlertCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export function DebugExternalData() {
  const [debugInfo, setDebugInfo] = useState({
    localStorageKeys: 0,
    receivedData: 0,
    redisSyncCount: 0,
    isConnected: false
  });
  
  const [receivedData, setReceivedData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState({
    productName: 'Test Product',
    quantity: 100,
    unit: 'kg',
    category: 'pakan'
  });

  const connector = getProjectConnector('farm-management-app', 'external-project');
  const redisConnector = initRedisConnector('farm-management-app', 'external-project');

  useEffect(() => {
    // Update debug info
    const updateDebugInfo = () => {
      const keys = Object.keys(localStorage).filter(k => k.includes('project_connector'));
      const storedData = connector.getStoredData();
      
      setDebugInfo(prev => ({
        ...prev,
        localStorageKeys: keys.length,
        receivedData: storedData.filter(d => d.targetProjectId === 'farm-management-app').length
      }));
    };

    // Listen for data received events
    const handleDataReceived = (event: any) => {
      const data = event.detail;
      setReceivedData(prev => [...prev, data]);
      setDebugInfo(prev => ({ ...prev, receivedData: prev.receivedData + 1 }));
      toast.success(`External data received: ${data.type}`);
    };

    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    
    // Initial update
    updateDebugInfo();
    
    // Set up interval to update debug info
    const interval = setInterval(updateDebugInfo, 5000);

    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
      clearInterval(interval);
    };
  }, []);

  const handleSendTestData = () => {
    const dataToSend = {
      ...testData,
      timestamp: Date.now(),
      source: 'Debug Test'
    };

    const success = connector.sendData('stock_item', dataToSend);
    if (success) {
      toast.success('Test data sent successfully');
    } else {
      toast.error('Failed to send test data');
    }
  };

  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      await syncFromRedis();
      toast.success('Redis sync completed');
      setDebugInfo(prev => ({ ...prev, redisSyncCount: prev.redisSyncCount + 1 }));
    } catch (error) {
      console.error('Redis sync error:', error);
      toast.error('Redis sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessData = async (dataId: string) => {
    const success = await markRedisDataAsProcessed(dataId);
    if (success) {
      setReceivedData(prev => prev.filter(item => item.id !== dataId));
      toast.success('Data marked as processed');
    } else {
      toast.error('Failed to mark data as processed');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          External Data Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Local Keys</p>
            <p className="text-xl font-bold">{debugInfo.localStorageKeys}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Received Data</p>
            <p className="text-xl font-bold">{debugInfo.receivedData}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Redis Syncs</p>
            <p className="text-xl font-bold">{debugInfo.redisSyncCount}</p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">Connection</p>
            <Badge variant={debugInfo.isConnected ? "default" : "secondary"}>
              {debugInfo.isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleForceSync} 
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Force Sync from Redis
          </Button>
          <Button 
            onClick={handleSendTestData} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Send Test Data
          </Button>
        </div>

        {receivedData.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-medium">Received Data ({receivedData.length})</h3>
            {receivedData.map((item, index) => (
              <div 
                key={item.id || index} 
                className="p-4 border rounded-lg bg-muted/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default">{item.type || 'unknown'}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'no timestamp'}
                      </span>
                    </div>
                    <div className="text-sm space-y-1">
                      {item.data && Object.entries(item.data).map(([key, value]) => (
                        <p key={key}><strong>{key}:</strong> {String(value)}</p>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => item.id && handleProcessData(item.id)}
                    className="ml-2"
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
            <p>No external data received yet</p>
            <p className="text-sm mt-1">Data will appear here when received from external sources</p>
          </div>
        )}

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4" />
            Troubleshooting Tips
          </h4>
          <ul className="text-sm space-y-1">
            <li>• Make sure external systems are sending data to the correct project ID</li>
            <li>• Check that Redis credentials are properly configured</li>
            <li>• Use the "Force Sync" button to manually check for new data</li>
            <li>• Verify that the external project is using the same target project ID</li>
            <li>• Test by sending data from this interface to verify the system works</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}