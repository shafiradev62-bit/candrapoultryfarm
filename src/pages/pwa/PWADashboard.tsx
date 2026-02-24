import { PWALayout } from "@/components/PWALayout";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";

export default function PWADashboard() {
  const { warehouseEntries, dailyReports } = useAppData();
  const { role } = useAuth();

  const currentStock = warehouseEntries[warehouseEntries.length - 1] ?? {
    stokJagung: 0,
    stokKonsentrat: 0,
    stokDedak: 0,
    telurButir: 0,
    telurTray: "0.00",
  };

  const latestReport = dailyReports[dailyReports.length - 1];
  const hasLowStock = currentStock.stokJagung < 100 || currentStock.stokKonsentrat < 70 || currentStock.stokDedak < 50;

  return (
    <PWALayout>
      <div className="px-6 pt-6 pb-8">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">Hello, Good Morning</p>
          <h2 className="text-2xl font-bold text-[#1B4332] capitalize">{role || "User"}</h2>
          <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" })}</p>
        </div>

        {/* Main Stats */}
        <div className="bg-white rounded-[28px] p-6 shadow-sm mb-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">Populasi</p>
              <p className="text-3xl font-bold text-[#1B4332]">{latestReport?.jumlahAyam || 0}</p>
              <p className="text-xs text-gray-400">ekor</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Stok Telur</p>
              <p className="text-3xl font-bold text-[#1B4332]">{currentStock.telurButir.toLocaleString("id-ID")}</p>
              <p className="text-xs text-gray-400">{currentStock.telurTray} tray</p>
            </div>
          </div>

          {hasLowStock && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="bg-red-50 rounded-[16px] px-4 py-3">
                <p className="text-xs font-semibold text-red-900">⚠️ Peringatan Stok</p>
                <p className="text-xs text-red-700 mt-1">Beberapa stok pakan menipis</p>
              </div>
            </div>
          )}
        </div>

        {/* Stock Pakan */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#1B4332] mb-3">Stok Pakan</h3>
          <div className="space-y-3">
            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#1B4332]">Jagung</span>
                <span className="text-xl font-bold text-[#1B4332]">{currentStock.stokJagung.toFixed(0)} <span className="text-sm font-normal text-gray-500">kg</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${currentStock.stokJagung < 100 ? "bg-red-500" : "bg-[#40916C]"}`} style={{ width: `${Math.min((currentStock.stokJagung / 1000) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#1B4332]">Konsentrat</span>
                <span className="text-xl font-bold text-[#1B4332]">{currentStock.stokKonsentrat.toFixed(0)} <span className="text-sm font-normal text-gray-500">kg</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${currentStock.stokKonsentrat < 70 ? "bg-red-500" : "bg-[#40916C]"}`} style={{ width: `${Math.min((currentStock.stokKonsentrat / 700) * 100, 100)}%` }} />
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-[#1B4332]">Dedak</span>
                <span className="text-xl font-bold text-[#1B4332]">{currentStock.stokDedak.toFixed(0)} <span className="text-sm font-normal text-gray-500">kg</span></span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${currentStock.stokDedak < 50 ? "bg-red-500" : "bg-[#40916C]"}`} style={{ width: `${Math.min((currentStock.stokDedak / 500) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Latest Report */}
        {latestReport && (
          <div>
            <h3 className="text-base font-bold text-[#1B4332] mb-3">Laporan Terakhir</h3>
            <div className="bg-white rounded-[20px] p-5 shadow-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tanggal</span>
                <span className="font-semibold text-[#1B4332]">{latestReport.tanggal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Produksi Telur</span>
                <span className="font-bold text-[#40916C]">{latestReport.prodButir} butir</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total Pakan</span>
                <span className="font-bold text-orange-600">{latestReport.totalPakan} kg</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">% Produksi</span>
                <span className="font-bold text-[#1B4332]">{latestReport.pctProduksi}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </PWALayout>
  );
}
