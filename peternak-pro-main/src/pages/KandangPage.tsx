import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Warehouse } from "lucide-react";

const KandangPage = () => (
  <AppLayout title="Manajemen Kandang & Flock">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <Warehouse className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Kandang & Flock</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Kelola master data kandang, flock lifecycle, transaksi harian, dan produksi per kandang.
        </p>
      </CardContent>
    </Card>
  </AppLayout>
);

export default KandangPage;
