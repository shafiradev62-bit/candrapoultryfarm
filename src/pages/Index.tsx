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
import { CalendarIcon } from "lucide-react";
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

  return (
    <AppLayout title="Dashboard">
      <div className="p-4 lg:p-6">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-lg font-semibold text-primary">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Ringkasan harian operasional</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-end">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Tanggal Laporan</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("h-9 w-full sm:w-[200px] justify-start text-left font-normal", !reportDate && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {reportDate ? format(reportDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={reportDate} onSelect={setReportDate} initialFocus className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <Button className="bg-green-600 hover:bg-green-700 text-white h-9" onClick={handleWhatsAppReport}>
              <svg viewBox="0 0 32 32" className="h-4 w-4 mr-2 fill-current" aria-hidden="true">
                <path d="M16 3C9.372 3 4 8.372 4 15c0 2.377.698 4.62 2.01 6.53L4 29l7.65-2.007A11.92 11.92 0 0 0 16 27c6.628 0 12-5.372 12-12S22.628 3 16 3zm0 21.818a9.82 9.82 0 0 1-4.992-1.375l-.358-.214-4.535 1.19 1.21-4.41-.234-.37A9.8 9.8 0 0 1 6.182 15 9.82 9.82 0 1 1 16 24.818zm5.55-7.365c-.303-.152-1.793-.884-2.072-.985-.278-.101-.48-.152-.682.151-.202.303-.784.985-.961 1.187-.177.202-.354.227-.657.076-.303-.152-1.28-.471-2.44-1.502-.903-.805-1.513-1.8-1.69-2.103-.177-.303-.019-.467.133-.619.137-.136.303-.354.455-.53.152-.177.202-.303.303-.505.101-.202.05-.379-.025-.53-.076-.152-.682-1.643-.935-2.248-.246-.592-.496-.512-.682-.522l-.581-.01c-.202 0-.53.076-.808.379-.278.303-1.06 1.036-1.06 2.53 0 1.493 1.086 2.934 1.237 3.136.152.202 2.136 3.263 5.176 4.576.723.312 1.287.499 1.727.639.725.23 1.385.198 1.907.12.582-.087 1.793-.733 2.046-1.442.253-.708.253-1.314.177-1.442-.076-.126-.278-.202-.581-.354z" />
              </svg>
              Kirim Laporan ke Bos
            </Button>
          </div>
        </div>
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">NERACA HARIAN</h2>
            <span className="text-sm text-muted-foreground">{normalizedReport?.tanggal || "Belum ada data"}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">OMZET TELUR</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-foreground">Rp {Math.round(omzetTelur).toLocaleString("id-ID")}</p>
                <p className="text-sm text-muted-foreground">Penjualan hari ini</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">BIAYA PAKAN</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-red-800">Rp {Math.round(biayaPakan).toLocaleString("id-ID")}</p>
                <p className="text-sm text-muted-foreground">{(normalizedReport?.totalPakan ?? 0).toFixed(2)} kg × harga rata-rata</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">SISA UANG</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className={`text-xl font-bold ${sisaUang >= 0 ? "text-emerald-900" : "text-red-800"}`}>
                  Rp {Math.round(sisaUang).toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-muted-foreground">Omzet dikurangi biaya pakan</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-primary">KONTROL STOK</h2>
            <span className={`text-sm font-semibold ${selisihAlert ? "text-red-800" : "text-emerald-900"}`}>
              {selisihAlert ? "SELISIH DI ATAS BATAS" : "NORMAL"}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">JATAH MAKAN SEHARUSNYA</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-foreground">{theoreticalConsumption.toFixed(2)} kg</p>
                <p className="text-sm text-muted-foreground">{population.toLocaleString("id-ID")} ekor × 115 g</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">STOK KELUAR AKTUAL</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-foreground">{actualDeduction.toFixed(2)} kg</p>
                <p className="text-sm text-muted-foreground">Input gudang</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">SELISIH</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className={`text-xl font-bold ${selisihAlert ? "text-red-800" : "text-emerald-900"}`}>{selisihPakan.toFixed(2)} kg</p>
                <p className="text-sm text-muted-foreground">{selisihAlert ? "BUTUH AUDIT GUDANG" : "DALAM BATAS"}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-primary">STATISTIK PERFORMA</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">RATA-RATA PRODUKSI</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-foreground">
                  {dailyReports.length > 0 
                    ? Math.round(dailyReports.reduce((sum, r) => sum + r.prodButir, 0) / dailyReports.length)
                    : 0} butir/hari
                </p>
                <p className="text-sm text-muted-foreground">Dari {dailyReports.length} hari</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">TOTAL KEMATIAN</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-red-800">
                  {dailyReports.reduce((sum, r) => sum + r.kematian, 0)} ekor
                </p>
                <p className="text-sm text-muted-foreground">
                  {dailyReports.length > 0 
                    ? ((dailyReports.reduce((sum, r) => sum + r.kematian, 0) / dailyReports.length) * 100 / population).toFixed(2)
                    : 0}% dari populasi
                </p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">EFISIENSI PAKAN</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className="text-xl font-bold text-foreground">
                  {dailyReports.length > 0 
                    ? (dailyReports.reduce((sum, r) => sum + r.totalPakan, 0) / dailyReports.reduce((sum, r) => sum + r.prodButir, 0) * EGG_WEIGHT_KG).toFixed(2)
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">FCR (Feed Conversion Ratio)</p>
              </div>
            </div>
            <div className="rounded-sm border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <p className="text-sm text-muted-foreground">ESTIMASI PROFIT</p>
              </div>
              <div className="pt-2 space-y-1">
                <p className={`text-xl font-bold ${(omzetTelur - totalBiaya) >= 0 ? "text-emerald-900" : "text-red-800"}`}>
                  Rp {Math.round(omzetTelur - totalBiaya).toLocaleString("id-ID")}
                </p>
                <p className="text-sm text-muted-foreground">Hari ini</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-primary">PERFORMA AYAM</h2>
              <p className="text-sm text-muted-foreground">Peringkat FCR per kandang</p>
            </div>
            <span className="text-sm text-muted-foreground">Sisa kas: Rp {latestSaldo.toLocaleString("id-ID")}</span>
          </div>
          <div className="bg-white rounded-sm border border-gray-200 overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground">Peringkat</TableHead>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground">Kandang</TableHead>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground text-right">Pakan (kg)</TableHead>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground text-right">Telur (kg)</TableHead>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground text-right">FCR</TableHead>
                  <TableHead className="border border-gray-200 text-xs font-semibold text-foreground text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kandangStats.length > 0 ? kandangStats.map((row, index) => {
                  const isBest = index === 0;
                  const isWorst = index === kandangStats.length - 1;
                  return (
                    <TableRow key={`${row.kandang}-${index}`}>
                      <TableCell className={`border border-gray-200 py-1.5 text-sm font-semibold ${isBest ? "text-emerald-900" : isWorst ? "text-red-800" : "text-foreground"}`}>
                        {index + 1}
                      </TableCell>
                      <TableCell className="border border-gray-200 py-1.5 text-sm">{row.kandang}</TableCell>
                      <TableCell className="border border-gray-200 py-1.5 text-sm text-right tabular-nums">{row.feedKg.toFixed(2)}</TableCell>
                      <TableCell className="border border-gray-200 py-1.5 text-sm text-right tabular-nums">{row.eggsKg.toFixed(2)}</TableCell>
                      <TableCell className={`border border-gray-200 py-1.5 text-sm text-right font-bold tabular-nums ${isBest ? "text-emerald-900" : isWorst ? "text-red-800" : "text-foreground"}`}>
                        {Number.isFinite(row.fcr) ? row.fcr.toFixed(2) : "-"}
                      </TableCell>
                      <TableCell className="border border-gray-200 py-1.5 text-sm text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="h-8 rounded-sm">
                                Lihat QR
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                              <DialogHeader>
                                <DialogTitle>{row.kandang} - SCAN ME</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center py-4">
                                <QRCodeCanvas value={`CANDRA|${row.kandang}`} size={180} />
                              </div>
                            </DialogContent>
                          </Dialog>
                          {isWorst && (
                            <Button
                              size="sm"
                              className="bg-red-800 text-white hover:bg-red-900 rounded-sm"
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
                    <TableCell colSpan={6} className="border border-gray-200 py-2 text-sm text-muted-foreground text-center">
                      Belum ada data FCR.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
