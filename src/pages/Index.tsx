import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppData } from "@/contexts/AppDataContext";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format, parse } from "date-fns";
import { QRCodeCanvas } from "qrcode.react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Users, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle, ArrowUpRight, ArrowDownRight, User, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const STANDARD_INTAKE_KG = 0.115;
const EGG_WEIGHT_KG = 0.06;
const FEED_KEYWORDS = ["pakan", "jagung", "konsentrat", "dedak"];
const SALARY_KEYWORDS = ["gaji", "upah", "insentif"];

const Dashboard = () => {
  const {
    dailyReports,
    financeEntries,
    warehouseEntries,
    operationalEntries,
    salesEntries,
  } = useAppData();
  const { toast } = useToast();
  const [submittingKandang, setSubmittingKandang] = useState<string | null>(null);
  const latestReport = dailyReports[dailyReports.length - 1];
  const [reportDate, setReportDate] = useState<Date | undefined>(() => {
    if (latestReport?.tanggal) {
      try {
        return parse(latestReport.tanggal, "dd-MMM-yy", new Date());
      } catch {
        return new Date();
      }
    }
    return new Date();
  });
  const latestSaldo = financeEntries.length > 0 ? financeEntries[financeEntries.length - 1].saldo : 0;
  const lastWarehouse = warehouseEntries.length > 0 ? warehouseEntries[warehouseEntries.length - 1] : null;
  const prevWarehouse = warehouseEntries.length > 1 ? warehouseEntries[warehouseEntries.length - 2] : null;

  const totalStock = (entry: typeof lastWarehouse) => (entry ? entry.stokJagung + entry.stokKonsentrat + entry.stokDedak : 0);
  const totalAdded = (entry: typeof lastWarehouse) => (entry ? entry.addJagung + entry.addKonsentrat + entry.addDedak : 0);

  const actualDeduction = lastWarehouse && prevWarehouse
    ? totalStock(prevWarehouse) + totalAdded(lastWarehouse) - totalStock(lastWarehouse)
    : 0;
  const population = latestReport?.jumlahAyam ?? 1000;
  const theoreticalConsumption = population * STANDARD_INTAKE_KG;
  const selisihPakan = actualDeduction - theoreticalConsumption;
  const selisihAlert = Math.abs(selisihPakan) > 5;

  const lower = (value: string) => value.toLowerCase();

  const feedCostPerKg = useMemo(() => {
    const candidates = operationalEntries.filter((row) => FEED_KEYWORDS.some((keyword) => lower(row.objek).includes(keyword)));
    const totalHarga = candidates.reduce((sum, row) => sum + row.totalHarga, 0);
    const totalJumlah = candidates.reduce((sum, row) => sum + row.jumlah, 0);
    return totalJumlah > 0 ? totalHarga / totalJumlah : 0;
  }, [operationalEntries]);

  const sellPricePerKg = useMemo(() => {
    const totalRp = salesEntries.reduce((sum, row) => sum + row.totalRp, 0);
    const totalButir = salesEntries.reduce((sum, row) => sum + row.totalButir, 0);
    const totalKg = totalButir * EGG_WEIGHT_KG;
    return totalKg > 0 ? totalRp / totalKg : 0;
  }, [salesEntries]);

  const findReportByDate = (value: Date | undefined) => {
    if (!value) return null;
    const dateStr = format(value, "dd-MMM-yy");
    return dailyReports.find((row) => row.tanggal === dateStr);
  };
  const normalizedReport = findReportByDate(reportDate) ?? latestReport;
  const todayOps = normalizedReport
    ? operationalEntries.filter((row) => row.tanggal === normalizedReport.tanggal)
    : [];
  const todaySalary = todayOps.filter((row) => SALARY_KEYWORDS.some((keyword) => lower(row.objek).includes(keyword)));
  const todayOtherOps = todayOps.filter((row) => !SALARY_KEYWORDS.some((keyword) => lower(row.objek).includes(keyword)) && !FEED_KEYWORDS.some((keyword) => lower(row.objek).includes(keyword)));

  const biayaPakan = (normalizedReport?.totalPakan ?? 0) * feedCostPerKg;
  const biayaOps = todayOtherOps.reduce((sum, row) => sum + row.totalHarga, 0);
  const biayaGaji = todaySalary.reduce((sum, row) => sum + row.totalHarga, 0);
  const totalBiaya = biayaPakan + biayaOps + biayaGaji;
  const eggsKgToday = (normalizedReport?.prodButir ?? 0) * EGG_WEIGHT_KG;
  const bepToday = eggsKgToday > 0 ? totalBiaya / eggsKgToday : 0;
  const todaySales = normalizedReport
    ? salesEntries.filter((row) => row.tanggal === normalizedReport.tanggal)
    : [];
  const omzetTelur = todaySales.reduce((sum, row) => sum + row.totalRp, 0);
  const sisaUang = omzetTelur - biayaPakan;
  const kandangStats = useMemo(() => {
    const source = dailyReports.slice(-7);
    const map = new Map<string, { feedKg: number; eggsKg: number }>();
    source.forEach((row) => {
      const kandang = row.keterangan && row.keterangan.toLowerCase().includes("kandang") ? row.keterangan : "Kandang A";
      const eggsKg = row.prodButir * EGG_WEIGHT_KG;
      const feedKg = row.totalPakan;
      const current = map.get(kandang) ?? { feedKg: 0, eggsKg: 0 };
      current.feedKg += feedKg;
      current.eggsKg += eggsKg;
      map.set(kandang, current);
    });
    return Array.from(map, ([kandang, data]) => ({
      kandang,
      feedKg: data.feedKg,
      eggsKg: data.eggsKg,
      fcr: data.eggsKg > 0 ? data.feedKg / data.eggsKg : Number.POSITIVE_INFINITY,
    })).sort((a, b) => a.fcr - b.fcr);
  }, [dailyReports]);

  const handleAjukanAfkir = async (row: { kandang: string; feedKg: number; eggsKg: number; fcr: number }) => {
    const tanggal = normalizedReport?.tanggal || format(new Date(), "dd-MMM-yy");
    const fcrValue = Number.isFinite(row.fcr) ? row.fcr : 0;
    const payload = {
      tanggal,
      kandang: row.kandang,
      fcr: parseFloat(fcrValue.toFixed(2)),
      feed_kg: parseFloat(row.feedKg.toFixed(2)),
      eggs_kg: parseFloat(row.eggsKg.toFixed(2)),
      status: "pending",
    };
    setSubmittingKandang(row.kandang);
    const stored = localStorage.getItem("candra-afkir-requests");
    const existing = stored ? JSON.parse(stored) : [];
    const next = [...existing, { ...payload, created_at: new Date().toISOString() }];
    localStorage.setItem("candra-afkir-requests", JSON.stringify(next));
    toast({ title: "Berhasil", description: `Pengajuan afkir ${row.kandang} tersimpan` });
    setSubmittingKandang(null);
  };

  const handleWhatsAppReport = () => {
    const tanggal = normalizedReport?.tanggal || format(new Date(), "dd-MMM-yy");
    const telur = normalizedReport?.prodButir ?? 0;
    const pakan = normalizedReport?.totalPakan ?? 0;
    const estimasiProfit = Math.round(omzetTelur - totalBiaya);
    const text = [
      "Laporan Harian CANDRA POULTRY FARM:",
      `Tanggal: ${tanggal}`,
      `Telur: ${telur.toLocaleString("id-ID")} butir`,
      `Pakan: ${pakan.toFixed(2)} kg`,
      `Estimasi Profit: Rp ${estimasiProfit.toLocaleString("id-ID")}`,
      "Status: Aman.",
    ].join("\n");
    const encoded = encodeURIComponent(text);
    const appUrl = `whatsapp://send?phone=6285288478968&text=${encoded}`;
    const webUrl = `https://wa.me/6285288478968?text=${encoded}`;
    window.location.href = appUrl;
    setTimeout(() => {
      window.open(webUrl, "_blank");
    }, 800);
  };

  const handleRefreshData = () => {
    window.location.reload();
    toast({ title: "Data Diperbarui", description: "Dashboard telah dimuat ulang" });
  };

  return (
    <AppLayout title="Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-50 safe-area-padding">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Header with Personal Greeting */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-forest-700 mb-1">
                  Halo, Owner! 👋
                </h1>
                <p className="text-forest-500">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm text-forest-500">Saldo Kas</p>
                  <p className="text-lg font-bold text-forest-700">
                    Rp {latestSaldo.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-forest-500 to-forest-700 rounded-full flex items-center justify-center text-white font-bold">
                  <User size={20} />
                </div>
              </div>
            </div>

            {/* Date Picker and WhatsApp Report */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="space-y-1">
                <Label className="text-xs text-forest-500 font-medium">Tanggal Laporan</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-10 w-full sm:w-[200px] justify-start text-left font-normal bg-white border-forest-200 hover:bg-cream-50 rounded-xl", !reportDate && "text-forest-400")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {reportDate ? format(reportDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={reportDate} onSelect={setReportDate} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="bg-white border-forest-200 hover:bg-cream-50 text-forest-700 h-10 rounded-xl shadow-sm transition-all duration-200" onClick={handleRefreshData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button className="bg-forest-600 hover:bg-forest-700 text-white h-10 rounded-xl shadow-md transition-all duration-200 transform hover:scale-[1.02]" onClick={handleWhatsAppReport}>
                  <svg viewBox="0 0 32 32" className="h-4 w-4 mr-2 fill-current" aria-hidden="true">
                    <path d="M16 3C9.372 3 4 8.372 4 15c0 2.377.698 4.62 2.01 6.53L4 29l7.65-2.007A11.92 11.92 0 0 0 16 27c6.628 0 12-5.372 12-12S22.628 3 16 3zm0 21.818a9.82 9.82 0 0 1-4.992-1.375l-.358-.214-4.535 1.19 1.21-4.41-.234-.37A9.8 9.8 0 0 1 6.182 15 9.82 9.82 0 1 1 16 24.818zm5.55-7.365c-.303-.152-1.793-.884-2.072-.985-.278-.101-.48-.152-.682.151-.202.303-.784.985-.961 1.187-.177.202-.354.227-.657.076-.303-.152-1.28-.471-2.44-1.502-.903-.805-1.513-1.8-1.69-2.103-.177-.303-.019-.467.133-.619.137-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.05-.379-.025-.53-.076-.152-.682-1.643-.935-2.248-.246-.592-.496-.512-.682-.522l-.581-.01c-.202 0-.53.076-.808.379-.278.303-1.06 1.036-1.06 2.53 0 1.493 1.086 2.934 1.237 3.136.152.202 2.136 3.263 5.176 4.576.723.312 1.287.499 1.727.639.725.23 1.385.198 1.907.12.582-.087 1.793-.733 2.046-1.442.253-.708.253-1.314.177-1.442-.076-.126-.278-.202-.581-.354z" />
                  </svg>
                  Kirim Laporan
                </Button>
              </div>
            </div>
          </div>

          {/* Population Card */}
          <div className="mb-6">
            <div className="bg-white rounded-[24px] shadow-lg p-6 border border-cream-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-forest-100 to-forest-200 rounded-[20px] flex items-center justify-center">
                    <Users className="h-7 w-7 text-forest-600" />
                  </div>
                  <div>
                    <p className="text-sm text-forest-500 font-medium">Populasi Ayam</p>
                    <p className="text-3xl font-bold text-forest-700">
                      {population.toLocaleString("id-ID")} ekor
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-1 text-forest-600">
                    <TrendingUp size={16} />
                    <span className="text-sm font-medium">Aktif</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Financial Overview Cards */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-forest-700 mb-4">NERACA HARIAN</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-50 to-green-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-xs text-forest-400">{normalizedReport?.tanggal || "Hari ini"}</span>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">OMZET TELUR</p>
                <p className="text-2xl font-bold text-forest-700 mb-2">
                  Rp {Math.round(omzetTelur).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center space-x-1 text-xs text-green-600">
                  <ArrowUpRight size={12} />
                  <span>Penjualan hari ini</span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <span className="text-xs text-forest-400">{normalizedReport?.tanggal || "Hari ini"}</span>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">BIAYA PAKAN</p>
                <p className="text-2xl font-bold text-red-600 mb-2">
                  Rp {Math.round(biayaPakan).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>{(normalizedReport?.totalPakan ?? 0).toFixed(2)} kg × harga rata-rata</span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    sisaUang >= 0 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
                      : 'bg-gradient-to-br from-red-50 to-red-100'
                  }`}>
                    {sisaUang >= 0 ? (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <span className="text-xs text-forest-400">{normalizedReport?.tanggal || "Hari ini"}</span>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">SISA UANG</p>
                <p className={`text-2xl font-bold mb-2 ${
                  sisaUang >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  Rp {Math.round(sisaUang).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>Omzet dikurangi biaya pakan</span>
                </div>
              </div>
            </div>
          </section>

          {/* Stock Control Cards */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-forest-700">KONTROL STOK</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                selisihAlert 
                  ? "bg-red-100 text-red-700" 
                  : "bg-emerald-100 text-emerald-700"
              }`}>
                {selisihAlert ? "SELISIH DI ATAS BATAS" : "NORMAL"}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">JATAH MAKAN SEHARUSNYA</p>
                <p className="text-2xl font-bold text-forest-700 mb-2">
                  {theoreticalConsumption.toFixed(2)} kg
                </p>
                <div className="w-full bg-cream-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '75%'}}></div>
                </div>
                <p className="text-xs text-forest-400">{population.toLocaleString("id-ID")} ekor × 115 g</p>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center">
                    <ArrowDownRight className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">STOK KELUAR AKTUAL</p>
                <p className="text-2xl font-bold text-forest-700 mb-2">
                  {actualDeduction.toFixed(2)} kg
                </p>
                <div className="w-full bg-cream-200 rounded-full h-2 mb-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${Math.min((actualDeduction / theoreticalConsumption) * 100, 100)}%`}}></div>
                </div>
                <p className="text-xs text-forest-400">Input gudang</p>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    selisihAlert 
                      ? 'bg-gradient-to-br from-red-50 to-red-100' 
                      : 'bg-gradient-to-br from-emerald-50 to-emerald-100'
                  }`}>
                    {selisihAlert ? (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">SELISIH</p>
                <p className={`text-2xl font-bold mb-2 ${
                  selisihAlert ? "text-red-600" : "text-emerald-600"
                }`}>
                  {selisihPakan.toFixed(2)} kg
                </p>
                <div className="w-full bg-cream-200 rounded-full h-2 mb-2">
                  <div className={`h-2 rounded-full ${
                    selisihAlert ? 'bg-red-500' : 'bg-emerald-500'
                  }`} style={{width: `${Math.min(Math.abs(selisihPakan) / 5 * 100, 100)}%`}}></div>
                </div>
                <p className="text-xs text-forest-400">{selisihAlert ? "BUTUH AUDIT GUDANG" : "DALAM BATAS"}</p>
              </div>
            </div>
          </section>

          {/* Performance Statistics */}
          <section className="mb-6">
            <h2 className="text-lg font-bold text-forest-700 mb-4">STATISTIK PERFORMA</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">RATA-RATA PRODUKSI</p>
                <p className="text-2xl font-bold text-forest-700 mb-2">
                  {dailyReports.length > 0 
                    ? Math.round(dailyReports.reduce((sum, r) => sum + r.prodButir, 0) / dailyReports.length)
                    : 0} butir/hari
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>Dari {dailyReports.length} hari</span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-50 to-red-100 rounded-xl flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">TOTAL KEMATIAN</p>
                <p className="text-2xl font-bold text-red-600 mb-2">
                  {dailyReports.reduce((sum, r) => sum + r.kematian, 0)} ekor
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>
                    {dailyReports.length > 0 
                      ? ((dailyReports.reduce((sum, r) => sum + r.kematian, 0) / dailyReports.length) * 100 / population).toFixed(2)
                      : 0}% dari populasi
                  </span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">EFISIENSI PAKAN</p>
                <p className="text-2xl font-bold text-forest-700 mb-2">
                  {dailyReports.length > 0 
                    ? (dailyReports.reduce((sum, r) => sum + r.totalPakan, 0) / dailyReports.reduce((sum, r) => sum + r.prodButir, 0) * EGG_WEIGHT_KG).toFixed(2)
                    : 0}
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>FCR (Feed Conversion Ratio)</span>
                </div>
              </div>

              <div className="bg-white rounded-[24px] shadow-md p-5 border border-cream-100">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    (omzetTelur - totalBiaya) >= 0 
                      ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' 
                      : 'bg-gradient-to-br from-red-50 to-red-100'
                  }`}>
                    {(omzetTelur - totalBiaya) >= 0 ? (
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
                <p className="text-sm text-forest-500 font-medium mb-1">ESTIMASI PROFIT</p>
                <p className={`text-2xl font-bold mb-2 ${
                  (omzetTelur - totalBiaya) >= 0 ? "text-emerald-600" : "text-red-600"
                }`}>
                  Rp {Math.round(omzetTelur - totalBiaya).toLocaleString("id-ID")}
                </p>
                <div className="flex items-center space-x-1 text-xs text-forest-400">
                  <span>Hari ini</span>
                </div>
              </div>
            </div>
          </section>

          {/* Chicken Performance Table */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-forest-700">PERFORMA AYAM</h2>
                <p className="text-sm text-forest-500">Peringkat FCR per kandang</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-forest-500">Sisa kas</p>
                <p className="text-sm font-bold text-forest-600">Rp {latestSaldo.toLocaleString("id-ID")}</p>
              </div>
            </div>
            <div className="bg-white rounded-[24px] shadow-md border border-cream-100 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-cream-50">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4">Peringkat</TableHead>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4">Kandang</TableHead>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4 text-right">Pakan (kg)</TableHead>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4 text-right">Telur (kg)</TableHead>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4 text-right">FCR</TableHead>
                      <TableHead className="text-xs font-semibold text-forest-700 py-3 px-4 text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {kandangStats.length > 0 ? kandangStats.map((row, index) => {
                      const isBest = index === 0;
                      const isWorst = index === kandangStats.length - 1;
                      return (
                        <TableRow key={`${row.kandang}-${index}`} className="hover:bg-cream-50 transition-colors">
                          <TableCell className={`py-3 px-4 text-sm font-semibold ${
                            isBest ? "text-emerald-600" : isWorst ? "text-red-600" : "text-forest-700"
                          }`}>
                            <div className="flex items-center space-x-2">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isBest ? "bg-emerald-100 text-emerald-700" : 
                                isWorst ? "bg-red-100 text-red-700" : 
                                "bg-cream-100 text-forest-600"
                              }`}>
                                {index + 1}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm font-medium text-forest-700">{row.kandang}</TableCell>
                          <TableCell className="py-3 px-4 text-sm text-right tabular-nums text-forest-600">{row.feedKg.toFixed(2)}</TableCell>
                          <TableCell className="py-3 px-4 text-sm text-right tabular-nums text-forest-600">{row.eggsKg.toFixed(2)}</TableCell>
                          <TableCell className={`py-3 px-4 text-sm text-right font-bold tabular-nums ${
                            isBest ? "text-emerald-600" : isWorst ? "text-red-600" : "text-forest-700"
                          }`}>
                            {Number.isFinite(row.fcr) ? row.fcr.toFixed(2) : "-"}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-sm text-center">
                            <div className="flex flex-wrap items-center justify-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="h-8 rounded-xl border-forest-200 hover:bg-cream-50">
                                    Lihat QR
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-sm rounded-[24px]">
                                  <DialogHeader>
                                    <DialogTitle className="text-forest-700">{row.kandang} - SCAN ME</DialogTitle>
                                  </DialogHeader>
                                  <div className="flex justify-center py-4">
                                    <QRCodeCanvas value={`CANDRA|${row.kandang}`} size={180} />
                                  </div>
                                </DialogContent>
                              </Dialog>
                              {isWorst && (
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                                  disabled={submittingKandang === row.kandang}
                                  onClick={() => handleAjukanAfkir(row)}
                                >
                                  Ajukan Afkir
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-sm text-forest-400 text-center">
                          Belum ada data FCR.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
