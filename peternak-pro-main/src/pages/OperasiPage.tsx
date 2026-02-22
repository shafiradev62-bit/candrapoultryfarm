import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";

const OperasiPage = () => (
  <AppLayout title="Operasi Harian">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <ClipboardList className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Operasi Harian</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Input harian produksi telur, mortalitas, pakan, dan generate laporan otomatis.
        </p>
      </CardContent>
    </Card>
  </AppLayout>
);

export default OperasiPage;
