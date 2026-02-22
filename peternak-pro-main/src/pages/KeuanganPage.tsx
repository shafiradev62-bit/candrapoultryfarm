import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark } from "lucide-react";

const KeuanganPage = () => (
  <AppLayout title="Keuangan">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <Landmark className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Keuangan Terintegrasi</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Chart of Accounts, jurnal otomatis, invoice, piutang/hutang, dan laporan keuangan lengkap.
        </p>
      </CardContent>
    </Card>
  </AppLayout>
);

export default KeuanganPage;
