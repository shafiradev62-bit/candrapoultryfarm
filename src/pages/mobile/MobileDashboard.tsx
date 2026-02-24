import { MobileLayout } from "@/components/MobileLayout";
import { useAppData } from "@/contexts/AppDataContext";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, TrendingDown, Egg } from "lucide-react";

export default function MobileDashboard() {
  const { warehouseEntries, dailyReports } = useAppData();

  const currentStock = warehouseEntries[warehouseEntries.length - 1] ?? {
    stokJagung: 0,
    stokKonsentrat: 0,
    stokDedak: 0,
    telurButir: 0,
    telurTray: "0.00",
  };

  const latestReport = dailyReports[dailyReports.length - 1];

  const stockCards = [
    {
      label: "Jagung",
      value: currentStock.stokJagung,
      unit: "kg",
      alert: currentStock.stokJagung < 100,
      threshold: 100,
    },
    {
      label: "Konsentrat",
      value: currentStock.stokKonsentrat,
      unit: "kg",
      alert: currentStock.stokKonsentrat < 70,
      threshold: 70,
    },
    {
      label: "Dedak",
      value: currentStock.stokDedak,
      unit: "kg",
      alert: currentStock.stokDedak < 50,
      threshold: 50,
    },
    {
      label: "Telur (Butir)",
      value: currentStock.telurButir,
      unit: "butir",
      alert: false,
    },
    {
      label: "Telur (Tray)",
      value: parseFloat(currentStock.telurTray),
      unit: "tray",
      alert: false,
    },
    {
      label: "Populasi Ayam",
      value: latestReport?.jumlahAyam || 0,
      unit: "ekor",
      alert: false,
    },
  ];

  return (
    <MobileLayout title="Dashboard">
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg">
          <h2 className="text-xl font-bold mb-2">Selamat Datang</h2>
          <p className="text-sm opacity-90">Candra Poultry Farm Mobile</p>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <Egg className="h-4 w-4" />
            <span>Monitoring Real-time</span>
          </div>
        </div>

        {/* Alert Section */}
        {stockCards.some((card) => card.alert) && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="font-semibold text-destructive mb-1">Peringatan Stok</h3>
                <p className="text-sm text-muted-foreground">
                  Beberapa stok pakan menipis. Segera lakukan pembelian.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stock Cards Grid */}
        <div>
          <h3 className="text-base font-semibold mb-3">Stok Saat Ini</h3>
          <div className="grid grid-cols-2 gap-3">
            {stockCards.map((card, index) => (
              <div
                key={index}
                className={cn(
                  "bg-card rounded-xl p-4 shadow-sm border",
                  card.alert && "border-destructive border-2"
                )}
              >
                <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                <p
                  className={cn(
                    "text-2xl font-bold",
                    card.alert ? "text-destructive" : "text-primary"
                  )}
                >
                  {typeof card.value === "number"
                    ? card.value.toLocaleString("id-ID")
                    : card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.unit}</p>
                {card.alert && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <span>{"<"} {card.threshold} {card.unit}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        {latestReport && (
          <div>
            <h3 className="text-base font-semibold mb-3">Laporan Terakhir</h3>
            <div className="bg-card rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tanggal</span>
                <span className="text-sm font-medium">{latestReport.tanggal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Produksi Telur</span>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>{latestReport.prodButir} butir</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Pakan</span>
                <div className="flex items-center gap-1 text-sm font-medium text-orange-600">
                  <TrendingDown className="h-4 w-4" />
                  <span>{latestReport.totalPakan} kg</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">% Produksi</span>
                <span className="text-sm font-medium">{latestReport.pctProduksi}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
