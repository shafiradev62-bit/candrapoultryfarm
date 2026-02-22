import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

const PengaturanPage = () => (
  <AppLayout title="Pengaturan">
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-20 text-center">
        <Settings className="h-12 w-12 text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-1">Pengaturan Sistem</h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Kelola pengguna, role, profil perusahaan, dan konfigurasi sistem.
        </p>
      </CardContent>
    </Card>
  </AppLayout>
);

export default PengaturanPage;
