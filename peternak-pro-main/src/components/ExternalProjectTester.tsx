import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getProjectConnector } from '@/services/projectConnector';
import { Send, Download } from 'lucide-react';
import { toast } from 'sonner';

export function ExternalProjectTester() {
  const [productName, setProductName] = useState('Test Product');
  const [quantity, setQuantity] = useState('50');
  const [unit, setUnit] = useState('kg');
  const [category, setCategory] = useState('pakan');
  const [isSending, setIsSending] = useState(false);
  const [receivedData, setReceivedData] = useState<any[]>([]);

  // Connector for sending data (as external project)
  const senderConnector = getProjectConnector('external-project', 'farm-management-app');
  
  // Connector for receiving data (as farm management app)
  const receiverConnector = getProjectConnector('farm-management-app', 'external-project');

  useEffect(() => {
    // Listen for data sent from external project to farm app
    const handleDataReceived = (event: any) => {
      const data = event.detail;
      console.log('Farm app received data:', data);
      setReceivedData(prev => [...prev, data]);
      toast.success(`Received data from external project: ${data.data?.productName || 'Unknown'}`);
    };

    window.addEventListener('project_connector_data_received', handleDataReceived);

    return () => {
      window.removeEventListener('project_connector_data_received', handleDataReceived);
    };
  }, []);

  const handleSendData = async () => {
    if (!productName || !quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    
    try {
      const testData = {
        productName,
        quantity: parseFloat(quantity),
        unit,
        category,
        timestamp: Date.now(),
        source: 'External Project Tester'
      };

      // Send data from external project to farm management app
      const success = senderConnector.sendData('stock_item', testData);
      
      if (success) {
        toast.success(`Data sent to farm management app!`);
        // Reset form
        setProductName('Test Product');
        setQuantity('50');
      } else {
        toast.error('Failed to send data');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      toast.error('Error sending data');
    } finally {
      setIsSending(false);
    }
  };

  const handleProcessReceived = (dataId: string) => {
    const success = receiverConnector.markAsProcessed(dataId);
    if (success) {
      setReceivedData(prev => prev.filter(item => item.id !== dataId));
      toast.success('Data marked as processed');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Sender Section */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            External Project - Send Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extProductName">Product Name</Label>
              <Input
                id="extProductName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Enter product name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="extQuantity">Quantity</Label>
              <Input
                id="extQuantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="liter">liter</SelectItem>
                  <SelectItem value="sack">sack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pakan">Pakan</SelectItem>
                  <SelectItem value="obat">Obat</SelectItem>
                  <SelectItem value="vitamin">Vitamin</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleSendData} 
              className="w-full" 
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Farm App
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Receiver Section */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Farm Management App - Received Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          {receivedData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Download className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No data received from external project</p>
              <p className="text-sm">Use the sender form to test data transfer</p>
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
                        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {item.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
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
                      variant="outline"
                      onClick={() => handleProcessReceived(item.id)}
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
    </div>
  );
}