import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, Eye, Download } from "lucide-react";
import { RedisReceiver } from "@/components/RedisReceiver";
import { DebugExternalData } from "@/components/DebugExternalData";
import { useState, useEffect } from "react";
import { getProjectConnector, CONNECTOR_EVENTS } from "@/services/projectConnector";

export default function ExternalDataPage() {
  const [receivedData, setReceivedData] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReceived: 0,
    todayReceived: 0,
    pending: 0,
    processed: 0
  });

  const connector = getProjectConnector('farm-management-app', 'external-project');

  // Load data and stats
  useEffect(() => {
    const updateData = () => {
      const allData = connector.getReceivedData();
      setReceivedData(allData);
      
      // Calculate stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      const todayData = allData.filter(item => {
        const itemDate = new Date(item.timestamp).getTime();
        return itemDate >= today;
      });
      
      const pendingData = allData.filter(item => !item.processed);
      const processedData = allData.filter(item => item.processed);
      
      setStats({
        totalReceived: allData.length,
        todayReceived: todayData.length,
        pending: pendingData.length,
        processed: processedData.length
      });
    };

    // Initial load
    updateData();
    
    // Listen for new data
    const handleDataReceived = () => {
      updateData();
    };
    
    window.addEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
    
    // Update every 5 seconds
    const interval = setInterval(updateData, 5000);

    return () => {
      window.removeEventListener(CONNECTOR_EVENTS.DATA_RECEIVED, handleDataReceived);
      clearInterval(interval);
    };
  }, [connector]);

  const handleViewDetails = (dataId: string) => {
    console.log("Viewing details for:", dataId);
  };

  const handleDownload = (dataId: string) => {
    console.log("Downloading data:", dataId);
  };

  const handleProcessData = (dataId: string) => {
    const success = connector.markAsProcessed(dataId);
    if (success) {
      // Update local state
      setReceivedData(prev => prev.map(item => 
        item.id === dataId ? { ...item, processed: true } : item
      ));
    }
  };

  return (
    <AppLayout title="Data Eksternal">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Diterima</p>
                <p className="text-2xl font-bold">{stats.totalReceived}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Hari Ini</p>
                <p className="text-2xl font-bold">{stats.todayReceived}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Menunggu</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <RefreshCw className="h-6 w-6 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Diproses</p>
                <p className="text-2xl font-bold">{stats.processed}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <DebugExternalData />

        {/* Redis Receiver Component */}
        <RedisReceiver 
          projectId="farm-management-app" 
          targetProjectId="external-project"
        />

        {/* Data List */}
        <Card>
          <CardHeader>
            <CardTitle>Data Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            {receivedData.length > 0 ? (
              <div className="space-y-4">
                {receivedData.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-4 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default">
                            {item.type.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                          <Badge variant="outline">{item.sourceProjectId}</Badge>
                          {item.processed && (
                            <Badge variant="secondary">Processed</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm space-y-1">
                          {item.type === 'stock_item' && (
                            <>
                              <p><strong>Produk:</strong> {item.data.productName}</p>
                              <p><strong>Kuantitas:</strong> {item.data.quantity} {item.data.unit}</p>
                              <p><strong>Kategori:</strong> {item.data.category}</p>
                              {item.data.source && <p><strong>Sumber:</strong> {item.data.source}</p>}
                            </>
                          )}
                          
                          {item.type === 'production_data' && (
                            <>
                              <p><strong>Telur:</strong> {item.data.eggCount} butir</p>
                              <p><strong>Pakan:</strong> {item.data.feedConsumption} kg</p>
                              <p><strong>Kematian:</strong> {item.data.mortality}</p>
                              <p><strong>Kandang:</strong> {item.data.kandang}</p>
                            </>
                          )}
                          
                          {item.type !== 'stock_item' && item.type !== 'production_data' && (
                            <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                              {JSON.stringify(item.data, null, 2)}
                            </pre>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(item.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Detail
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleProcessData(item.id)}
                        >
                          {item.processed ? 'Processed' : 'Mark Processed'}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-40" />
                <p>Belum ada data eksternal yang diterima</p>
                <p className="text-sm mt-1">Data akan muncul saat diterima dari sistem eksternal</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}