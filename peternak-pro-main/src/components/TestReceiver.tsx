import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjectConnector, CONNECTOR_EVENTS } from '@/services/projectConnector';
import { Download, Trash2 } from 'lucide-react';

export function TestReceiver() {
  const [receivedData, setReceivedData] = useState<any[]>([]);
  const [stats, setStats] = useState({ received: 0, processed: 0 });

  const connector = getProjectConnector('farm-hub-app', 'farm-management-app');

  useEffect(() => {
    // Listen for incoming data
    const handleDataReceived = (event: any) => {
      const data = event.detail;
      console.log('Received data:', data);
      
      setReceivedData(prev => [...prev, data]);
      setStats(prev => ({
        ...prev,
        received: prev.received + 1
      }));
    };

    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);

    // Get initial stats
    const initialStats = connector.getStatus();
    setStats({
      received: initialStats.receivedCount,
      processed: initialStats.processedCount
    });

    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    };
  }, [connector]);

  const handleProcessData = (dataId: string) => {
    const success = connector.markAsProcessed(dataId);
    if (success) {
      setStats(prev => ({
        ...prev,
        processed: prev.processed + 1
      }));
      setReceivedData(prev => prev.filter(item => item.id !== dataId));
    }
  };

  const handleClearAll = () => {
    setReceivedData([]);
    setStats({ received: 0, processed: 0 });
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Test Data Receiver
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Received: {stats.received}</Badge>
            <Badge variant="secondary">Processed: {stats.processed}</Badge>
            {receivedData.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="h-8"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {receivedData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Download className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p>No data received yet</p>
            <p className="text-sm">Add stock items in the form to test data sharing</p>
          </div>
        ) : (
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
                      <p><strong>Product:</strong> {item.data.productName}</p>
                      <p><strong>Quantity:</strong> {item.data.quantity} {item.data.unit}</p>
                      <p><strong>Category:</strong> {item.data.category}</p>
                      <p><strong>Source:</strong> {item.data.source}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleProcessData(item.id)}
                    className="ml-4"
                  >
                    Process
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}