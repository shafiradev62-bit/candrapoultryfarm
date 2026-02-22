import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { TestStockForm } from "@/components/TestStockForm";
import { TestReceiver } from "@/components/TestReceiver";
import { ExternalProjectTester } from "@/components/ExternalProjectTester";
import { RedisReceiver } from "@/components/RedisReceiver";
import { Package } from "lucide-react";

const InventoriPage = () => (
  <AppLayout title="Inventori & Logistik">
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">Inventori & Logistik</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Master barang, stok masuk/keluar, low stock alert, Purchase Order, dan Delivery Order.
            </p>
          </CardContent>
        </Card>
        
        <TestStockForm />
      </div>
      
      <TestReceiver />
      
      <ExternalProjectTester />
      
      <RedisReceiver 
        projectId="farm-management-app" 
        targetProjectId="external-project"
      />
    </div>
  </AppLayout>
);

export default InventoriPage;
