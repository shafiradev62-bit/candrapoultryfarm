import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

const PenjualanPage = () => (
  <AppLayout title="Produk & Penjualan">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <ShoppingCart className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Produk & Penjualan</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Kelola produk, customer, Sales Order, pricing tiers, dan invoice otomatis.
        </p>
      </CardContent>
    </Card>
  </AppLayout>
);

export default PenjualanPage;
