import { useAppData } from "@/contexts/AppDataContext";
import { useMemo } from "react";
import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const EGG_WEIGHT_KG = 0.06;

const MonitoringDashboard = () => {
  const {
    dailyReports,
    warehouseEntries,
    salesEntries,
    operationalEntries,
  } = useAppData();

  const latestReport = dailyReports[dailyReports.length - 1];
  const lastWarehouse = warehouseEntries[warehouseEntries.length - 1];
  
  const totalRevenue = salesEntries.reduce((s, r) => s + r.totalRp, 0);
  const totalCost = operationalEntries.reduce((s, r) => s + r.totalHarga, 0);
  const netProfit = totalRevenue - totalCost;

  const stats = useMemo(() => {
    const totalEggs = dailyReports.reduce((sum, r) => sum + r.prodButir, 0);
    const totalFeed = dailyReports.reduce((sum, r) => sum + r.totalPakan, 0);
    const totalDeaths = dailyReports.reduce((sum, r) => sum + r.kematian, 0);
    const avgProduction = dailyReports.length > 0 ? totalEggs / dailyReports.length : 0;
    const fcr = totalEggs > 0 ? totalFeed / (totalEggs * EGG_WEIGHT_KG) : 0;

    return {
      totalEggs,
      totalFeed,
      totalDeaths,
      avgProduction,
      fcr,
    };
  }, [dailyReports]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Logo" className="h-12 w-12 object-contain" />
          <div>
            <h1 className="text-2xl font-bold text-primary">CANDRA POULTRY FARM</h1>
            <p className="text-sm text-muted-foreground">Dashboard Monitoring - {format(new Date(), "dd MMMM yyyy, HH:mm")}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-xs text-muted-foreground mb-1">Populasi Ayam</p>
          <p className="text-2xl font-bold text-primary">{latestReport?.jumlahAyam.toLocaleString("id-ID") || 0}</p>
          <p className="text-xs text-muted-foreground">ekor</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-xs text-muted-foreground mb-1">Produksi Hari Ini</p>
          <p className="text-2xl font-bold text-green-600">{latestReport?.prodButir.toLocaleString("id-ID") || 0}</p>
          <p className="text-xs text-muted-foreground">butir ({latestReport?.prodTray || "0"} tray)</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-xs text-muted-foreground mb-1">Pakan Hari Ini</p>
          <p className="text-2xl font-bold text-orange-600">{latestReport?.totalPakan.toFixed(1) || 0}</p>
          <p className="text-xs text-muted-foreground">kg</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-3">
          <p className="text-xs text-muted-foreground mb-1">% Produksi</p>
          <p className="text-2xl font-bold text-blue-600">{latestReport?.pctProduksi || "0%"}</p>
          <p className="text-xs text-muted-foreground">dari populasi</p>
        </div>
      </div>

      {/* Stock Status */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-bold text-primary mb-3">Status Stok Pakan</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className={`p-3 rounded-lg ${(lastWarehouse?.stokJagung || 0) < 100 ? 'bg-red-50 border-2 border-red-500' : 'bg-green-50'}`}>
            <p className="text-xs text-muted-foreground">Jagung</p>
            <p className="text-xl font-bold">{lastWarehouse?.stokJagung.toFixed(1) || 0} kg</p>
            {(lastWarehouse?.stokJagung || 0) < 100 && (
              <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Stok Menipis!</p>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${(lastWarehouse?.stokKonsentrat || 0) < 70 ? 'bg-red-50 border-2 border-red-500' : 'bg-green-50'}`}>
            <p className="text-xs text-muted-foreground">Konsentrat</p>
            <p className="text-xl font-bold">{lastWarehouse?.stokKonsentrat.toFixed(1) || 0} kg</p>
            {(lastWarehouse?.stokKonsentrat || 0) < 70 && (
              <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Stok Menipis!</p>
            )}
          </div>
          
          <div className={`p-3 rounded-lg ${(lastWarehouse?.stokDedak || 0) < 50 ? 'bg-red-50 border-2 border-red-500' : 'bg-green-50'}`}>
            <p className="text-xs text-muted-foreground">Dedak</p>
            <p className="text-xl font-bold">{lastWarehouse?.stokDedak.toFixed(1) || 0} kg</p>
            {(lastWarehouse?.stokDedak || 0) < 50 && (
              <p className="text-xs text-red-600 font-semibold mt-1">⚠️ Stok Menipis!</p>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-bold text-primary mb-3">Ringkasan Keuangan</h2>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Penjualan</p>
            <p className="text-xl font-bold text-green-600">Rp {totalRevenue.toLocaleString("id-ID")}</p>
          </div>
          
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Biaya</p>
            <p className="text-xl font-bold text-red-600">Rp {totalCost.toLocaleString("id-ID")}</p>
          </div>
          
          <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className="text-xs text-muted-foreground">Net Profit</p>
            <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              Rp {netProfit.toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-bold text-primary mb-3">Statistik Performa</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Produksi</p>
            <p className="text-lg font-bold">{stats.totalEggs.toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground">butir</p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Rata-rata/Hari</p>
            <p className="text-lg font-bold">{Math.round(stats.avgProduction).toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground">butir</p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Pakan</p>
            <p className="text-lg font-bold">{stats.totalFeed.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">kg</p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">FCR</p>
            <p className="text-lg font-bold">{stats.fcr.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">efisiensi</p>
          </div>
          
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-muted-foreground">Total Kematian</p>
            <p className="text-lg font-bold text-red-600">{stats.totalDeaths}</p>
            <p className="text-xs text-muted-foreground">ekor</p>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-bold text-primary mb-3">Laporan Harian Terbaru (7 Hari Terakhir)</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Tanggal</TableHead>
                <TableHead className="text-xs text-right">Usia</TableHead>
                <TableHead className="text-xs text-right">Populasi</TableHead>
                <TableHead className="text-xs text-right">Pakan (kg)</TableHead>
                <TableHead className="text-xs text-right">Produksi</TableHead>
                <TableHead className="text-xs text-right">% Prod</TableHead>
                <TableHead className="text-xs text-right">Kematian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...dailyReports].slice(-7).reverse().map((row) => (
                <TableRow key={row.no}>
                  <TableCell className="text-xs font-medium">{row.tanggal}</TableCell>
                  <TableCell className="text-xs text-right">{row.usia} mg</TableCell>
                  <TableCell className="text-xs text-right">{row.jumlahAyam.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-xs text-right">{row.totalPakan.toFixed(1)}</TableCell>
                  <TableCell className="text-xs text-right font-semibold text-green-600">
                    {row.prodButir} ({row.prodTray})
                  </TableCell>
                  <TableCell className="text-xs text-right">{row.pctProduksi}</TableCell>
                  <TableCell className="text-xs text-right text-red-600">{row.kematian}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-4 text-xs text-muted-foreground">
        <p>© 2026 Candra Poultry Farm - Dashboard Monitoring</p>
        <p className="mt-1">Data diperbarui secara real-time dari aplikasi input</p>
      </div>
    </div>
  );
};

export default MonitoringDashboard;
