import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, History, Calendar as CalendarIcon2, Download, Beaker, Pencil, Trash2, Upload, CalendarIcon, FileDown, Filter } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { exportToExcel } from "@/lib/exportExcel";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { useAppData, type DailyReportRow } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import * as XLSX from "xlsx";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DailyReportPage = () => {
  const { toast } = useToast();
  const { dailyReports, addDailyReport, updateDailyReport, deleteDailyReport, addDailyReportsBulk, feedFormulas } = useAppData();
  const { role } = useAuth();
  const isWorker = role !== "owner";
  const [activeTab, setActiveTab] = useState("input");
  const [inputDate, setInputDate] = useState<Date | undefined>(new Date());
  const [usia, setUsia] = useState("");
  const [jumlahAyam, setJumlahAyam] = useState("");
  const [kematian, setKematian] = useState("");
  const [jualAyam, setJualAyam] = useState("");
  const [totalPakan, setTotalPakan] = useState("");
  const [cornKg, setCornKg] = useState(0);
  const [concKg, setConcKg] = useState(0);
  const [branKg, setBranKg] = useState(0);
  const [vitaminObat, setVitaminObat] = useState("");
  const [prodButir, setProdButir] = useState("");
  const [reject, setReject] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editNo, setEditNo] = useState<number | null>(null);
  const [editTanggal, setEditTanggal] = useState("");
  const [editUsia, setEditUsia] = useState("");
  const [editJumlahAyam, setEditJumlahAyam] = useState("");
  const [editKematian, setEditKematian] = useState("");
  const [editJualAyam, setEditJualAyam] = useState("");
  const [editTotalPakan, setEditTotalPakan] = useState("");
  const [editCornKg, setEditCornKg] = useState(0);
  const [editConcKg, setEditConcKg] = useState(0);
  const [editBranKg, setEditBranKg] = useState(0);
  const [editVitaminObat, setEditVitaminObat] = useState("");
  const [editProdButir, setEditProdButir] = useState("");
  const [editReject, setEditReject] = useState("");
  const [editKeterangan, setEditKeterangan] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [showFilter, setShowFilter] = useState(false);

  const activeFormula = useMemo(
    () => feedFormulas.find((formula) => formula.is_active) ?? null,
    [feedFormulas],
  );

  useEffect(() => {
    const total = parseFloat(totalPakan) || 0;
    if (activeFormula && total > 0) {
      setCornKg(parseFloat((total * activeFormula.corn_pct / 100).toFixed(2)));
      setConcKg(parseFloat((total * activeFormula.concentrate_pct / 100).toFixed(2)));
      setBranKg(parseFloat((total * activeFormula.bran_pct / 100).toFixed(2)));
    } else {
      setCornKg(0); setConcKg(0); setBranKg(0);
    }
  }, [totalPakan, activeFormula]);

  useEffect(() => {
    const total = parseFloat(editTotalPakan) || 0;
    if (activeFormula && total > 0) {
      setEditCornKg(parseFloat((total * activeFormula.corn_pct / 100).toFixed(2)));
      setEditConcKg(parseFloat((total * activeFormula.concentrate_pct / 100).toFixed(2)));
      setEditBranKg(parseFloat((total * activeFormula.bran_pct / 100).toFixed(2)));
    } else {
      setEditCornKg(0); setEditConcKg(0); setEditBranKg(0);
    }
  }, [editTotalPakan, activeFormula]);

  useEffect(() => {
    if (isWorker) {
      setActiveTab("history");
    }
  }, [isWorker]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (activeTab === "input" && !isWorker) {
          handleSimpanInput();
        }
      }
      // Ctrl+E or Cmd+E to export
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        handleExport();
      }
      // Ctrl+P or Cmd+P to export PDF
      if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handleExportPDF();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isWorker, inputDate, usia, jumlahAyam, kematian, jualAyam, totalPakan, vitaminObat, prodButir, reject, keterangan]);

  const filteredReports = useMemo(() => {
    if (!filterStartDate && !filterEndDate) return dailyReports;
    
    return dailyReports.filter((row) => {
      try {
        const rowDate = parse(row.tanggal, "dd-MMM-yy", new Date());
        if (filterStartDate && rowDate < filterStartDate) return false;
        if (filterEndDate && rowDate > filterEndDate) return false;
        return true;
      } catch {
        return true;
      }
    });
  }, [dailyReports, filterStartDate, filterEndDate]);

  const handleExport = () => {
    exportToExcel(filteredReports.map(r => ({
      "No.": r.no,
      "Tanggal": r.tanggal,
      "Usia Ayam (Minggu)": r.usia,
      "Jumlah Ayam (ekor)": r.jumlahAyam,
      "Kematian (ekor)": r.kematian,
      "Jual Ayam (ekor)": r.jualAyam,
      "Total Pakan (kg)": r.totalPakan,
      "Jagung (kg)": r.jagung,
      "Konsentrat (kg)": r.konsentrat,
      "Dedak (kg)": r.dedak,
      "Vitamin/Obat/Vaksin": r.vitaminObat,
      "Produksi Telur (Butir)": r.prodButir,
      "Produksi Telur (Tray)": r.prodTray,
      "Reject (butir)": r.reject,
      "Persentase Produksi (%)": r.pctProduksi,
      "Keterangan": r.keterangan,
    })), "Laporan_Harian_Kandang", "Daily Report");
    toast({ title: "Export berhasil", description: "File Excel telah didownload." });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(16);
      doc.text("CANDRA POULTRY FARM", 105, 15, { align: "center" });
      doc.setFontSize(10);
      doc.text("Laporan Harian Kandang", 105, 22, { align: "center" });
      
      if (filterStartDate || filterEndDate) {
        const start = filterStartDate ? format(filterStartDate, "dd-MMM-yy") : "Awal";
        const end = filterEndDate ? format(filterEndDate, "dd-MMM-yy") : "Akhir";
        doc.text(`Periode: ${start} - ${end}`, 105, 28, { align: "center" });
      }
      
      // Summary
      const totalEggs = filteredReports.reduce((sum, r) => sum + r.prodButir, 0);
      const totalFeed = filteredReports.reduce((sum, r) => sum + r.totalPakan, 0);
      const avgProduction = filteredReports.length > 0 
        ? (totalEggs / filteredReports.length).toFixed(0) 
        : "0";
      
      doc.setFontSize(9);
      let yPos = 38;
      doc.text(`Total Produksi: ${totalEggs.toLocaleString("id-ID")} butir`, 14, yPos);
      yPos += 6;
      doc.text(`Total Pakan: ${totalFeed.toFixed(2)} kg`, 14, yPos);
      yPos += 6;
      doc.text(`Rata-rata Produksi/Hari: ${avgProduction} butir`, 14, yPos);
      yPos += 10;
      
      // Table header
      doc.setFontSize(8);
      doc.text("Tgl", 14, yPos);
      doc.text("Usia", 32, yPos);
      doc.text("Ayam", 45, yPos);
      doc.text("Pakan", 62, yPos);
      doc.text("Telur", 80, yPos);
      doc.text("Reject", 98, yPos);
      doc.text("%Prod", 115, yPos);
      yPos += 5;
      
      // Table rows
      filteredReports.slice(0, 30).forEach((row) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.text(row.tanggal, 14, yPos);
        doc.text(row.usia.toString(), 32, yPos);
        doc.text(row.jumlahAyam.toString(), 45, yPos);
        doc.text(row.totalPakan.toFixed(1), 62, yPos);
        doc.text(row.prodButir.toString(), 80, yPos);
        doc.text(row.reject.toString(), 98, yPos);
        doc.text(row.pctProduksi, 115, yPos);
        yPos += 5;
      });
      
      if (filteredReports.length > 30) {
        doc.text(`... dan ${filteredReports.length - 30} baris lainnya`, 14, yPos + 5);
      }
      
      doc.save(`Laporan_Harian_${format(new Date(), "dd-MMM-yy")}.pdf`);
      toast({ title: "PDF berhasil dibuat", description: "File PDF telah didownload." });
    } catch (error) {
      toast({ title: "Error", description: "Gagal membuat PDF", variant: "destructive" });
    }
  };

  const formatTanggal = () => {
    if (inputDate) {
      return format(inputDate, "dd-MMM-yy");
    }
    const formatted = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
    return formatted.replace(/\s/g, "-");
  };

  const handleSimpanInput = async () => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    const usiaValue = parseFloat(usia);
    const jumlahAyamValue = parseFloat(jumlahAyam);
    const kematianValue = parseFloat(kematian || "0") || 0;
    const jualAyamValue = parseFloat(jualAyam || "0") || 0;
    const totalPakanValue = parseFloat(totalPakan || "0") || 0;
    const prodButirValue = parseFloat(prodButir || "0") || 0;
    const rejectValue = parseFloat(reject || "0") || 0;
    if (!Number.isFinite(usiaValue) || usiaValue <= 0 || !Number.isFinite(jumlahAyamValue) || jumlahAyamValue <= 0) {
      toast({ title: "Error", description: "Usia dan jumlah ayam wajib diisi", variant: "destructive" });
      return;
    }
    const prodTrayValue = parseFloat((prodButirValue / 30).toFixed(2));
    const pctProduksiValue = jumlahAyamValue > 0 ? ((prodButirValue / jumlahAyamValue) * 100).toFixed(2) : "0.00";
    const nextNo = dailyReports.length > 0 ? Math.max(...dailyReports.map((row) => row.no)) + 1 : 1;
    try {
      await addDailyReport({
        no: nextNo,
        tanggal: formatTanggal(),
        usia: usiaValue,
        jumlahAyam: jumlahAyamValue,
        kematian: kematianValue,
        jualAyam: jualAyamValue,
        totalPakan: parseFloat(totalPakanValue.toFixed(2)),
        jagung: parseFloat(cornKg.toFixed(2)),
        konsentrat: parseFloat(concKg.toFixed(2)),
        dedak: parseFloat(branKg.toFixed(2)),
        vitaminObat: vitaminObat.trim() || "-",
        prodButir: prodButirValue,
        prodTray: prodTrayValue.toFixed(2),
        reject: rejectValue,
        pctProduksi: `${pctProduksiValue}%`,
        keterangan: keterangan.trim(),
      });
      setActiveTab("history");
      setUsia("");
      setJumlahAyam("");
      setKematian("");
      setJualAyam("");
      setTotalPakan("");
      setVitaminObat("");
      setProdButir("");
      setReject("");
      setKeterangan("");
      toast({ title: "Berhasil", description: "Input harian tersimpan" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan data harian", variant: "destructive" });
    }
  };

  const handleOpenEdit = (row: (typeof dailyReports)[number]) => {
    setEditNo(row.no);
    setEditTanggal(row.tanggal);
    setEditUsia(row.usia.toString());
    setEditJumlahAyam(row.jumlahAyam.toString());
    setEditKematian(row.kematian.toString());
    setEditJualAyam(row.jualAyam.toString());
    setEditTotalPakan(row.totalPakan.toString());
    setEditCornKg(row.jagung);
    setEditConcKg(row.konsentrat);
    setEditBranKg(row.dedak);
    setEditVitaminObat(row.vitaminObat);
    setEditProdButir(row.prodButir.toString());
    setEditReject(row.reject.toString());
    setEditKeterangan(row.keterangan);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    if (editNo === null) return;
    const usiaValue = parseFloat(editUsia);
    const jumlahAyamValue = parseFloat(editJumlahAyam);
    const kematianValue = parseFloat(editKematian || "0") || 0;
    const jualAyamValue = parseFloat(editJualAyam || "0") || 0;
    const totalPakanValue = parseFloat(editTotalPakan || "0") || 0;
    const prodButirValue = parseFloat(editProdButir || "0") || 0;
    const rejectValue = parseFloat(editReject || "0") || 0;
    if (!Number.isFinite(usiaValue) || usiaValue <= 0 || !Number.isFinite(jumlahAyamValue) || jumlahAyamValue <= 0) {
      toast({ title: "Error", description: "Usia dan jumlah ayam wajib diisi", variant: "destructive" });
      return;
    }
    const prodTrayValue = parseFloat((prodButirValue / 30).toFixed(2));
    const pctProduksiValue = jumlahAyamValue > 0 ? ((prodButirValue / jumlahAyamValue) * 100).toFixed(2) : "0.00";
    try {
      await updateDailyReport(editNo, {
        no: editNo,
        tanggal: editTanggal,
        usia: usiaValue,
        jumlahAyam: jumlahAyamValue,
        kematian: kematianValue,
        jualAyam: jualAyamValue,
        totalPakan: parseFloat(totalPakanValue.toFixed(2)),
        jagung: parseFloat(editCornKg.toFixed(2)),
        konsentrat: parseFloat(editConcKg.toFixed(2)),
        dedak: parseFloat(editBranKg.toFixed(2)),
        vitaminObat: editVitaminObat.trim() || "-",
        prodButir: prodButirValue,
        prodTray: prodTrayValue.toFixed(2),
        reject: rejectValue,
        pctProduksi: `${pctProduksiValue}%`,
        keterangan: editKeterangan.trim(),
      });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Data harian diperbarui" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui data harian", variant: "destructive" });
    }
  };

  const handleDelete = async (no: number) => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    try {
      await deleteDailyReport(no);
      toast({ title: "Berhasil", description: "Data harian dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus data harian", variant: "destructive" });
    }
  };

  const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

  const toNumber = (value: unknown) => {
    if (typeof value === "number") return value;
    if (value === null || value === undefined) return 0;
    const cleaned = String(value).replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toDateText = (value: unknown) => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return format(value, "dd-MMM-yy");
    }
    return String(value ?? "").trim();
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      event.target.value = "";
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const startNo = dailyReports.length > 0 ? Math.max(...dailyReports.map((row) => row.no)) + 1 : 1;
      const entries: DailyReportRow[] = rows.map((row, index) => {
        const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeKey(key), value]));
        const getValue = (aliases: string[]) => {
          for (const alias of aliases) {
            const key = normalizeKey(alias);
            if (key in normalized) return normalized[key];
          }
          return undefined;
        };
        const tanggalValue = toDateText(getValue(["tanggal", "date", "record_date"]));
        const usiaValue = toNumber(getValue(["usia", "age", "age_weeks", "umur"]));
        const jumlahAyamValue = toNumber(getValue(["jumlahayam", "population", "populasi", "populasi_awal"]));
        const kematianValue = toNumber(getValue(["kematian", "mortality"]));
        const jualAyamValue = toNumber(getValue(["jualayam", "sold", "terjual"]));
        const totalPakanValue = toNumber(getValue(["totalpakan", "feed_total", "pakan_kg", "total_pakan"]));
        const jagungValue = toNumber(getValue(["jagung", "feed_corn", "corn"]));
        const konsentratValue = toNumber(getValue(["konsentrat", "concentrate", "feed_concentrate"]));
        const dedakValue = toNumber(getValue(["dedak", "bran", "feed_bran"]));
        const vitaminObatValue = String(getValue(["vitaminobat", "vitamin", "obat", "medicine_notes"]) ?? "-").trim();
        const prodButirValue = toNumber(getValue(["prodbutir", "telur", "eggs", "eggs_total", "produksi"]));
        const rejectValue = toNumber(getValue(["reject", "telur_reject"]));
        const keteranganValue = String(getValue(["keterangan", "notes", "catatan"]) ?? "").trim();
        const prodTrayValue = parseFloat((prodButirValue / 30).toFixed(2));
        const pctProduksiValue = jumlahAyamValue > 0 ? ((prodButirValue / jumlahAyamValue) * 100).toFixed(2) : "0.00";
        const finalJagung = jagungValue || (activeFormula ? parseFloat((totalPakanValue * activeFormula.corn_pct / 100).toFixed(2)) : 0);
        const finalKonsentrat = konsentratValue || (activeFormula ? parseFloat((totalPakanValue * activeFormula.concentrate_pct / 100).toFixed(2)) : 0);
        const finalDedak = dedakValue || (activeFormula ? parseFloat((totalPakanValue * activeFormula.bran_pct / 100).toFixed(2)) : 0);
        return {
          no: startNo + index,
          tanggal: tanggalValue,
          usia: usiaValue,
          jumlahAyam: jumlahAyamValue,
          kematian: kematianValue,
          jualAyam: jualAyamValue,
          totalPakan: parseFloat(totalPakanValue.toFixed(2)),
          jagung: parseFloat(finalJagung.toFixed(2)),
          konsentrat: parseFloat(finalKonsentrat.toFixed(2)),
          dedak: parseFloat(finalDedak.toFixed(2)),
          vitaminObat: vitaminObatValue || "-",
          prodButir: prodButirValue,
          prodTray: prodTrayValue.toFixed(2),
          reject: rejectValue,
          pctProduksi: `${pctProduksiValue}%`,
          keterangan: keteranganValue,
        };
      }).filter((row) => row.tanggal && row.usia > 0 && row.jumlahAyam > 0);
      if (entries.length === 0) {
        toast({ title: "Error", description: "Tidak ada data valid untuk diimpor", variant: "destructive" });
        return;
      }
      await addDailyReportsBulk(entries);
      toast({ title: "Berhasil", description: `${entries.length} baris berhasil diimpor` });
      event.target.value = "";
      setActiveTab("history");
    } catch (error) {
      toast({ title: "Error", description: "Gagal import Excel", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Daily Report">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">Laporan Harian Kandang</h1>
            <p className="text-sm text-muted-foreground">
              CANDRA POULTRY FARM — Jl. Pendakian Gunung Kerinci (R10), Kec. Kayu Aro Barat, Kab. Kerinci, Jambi
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon2 className="h-4 w-4" />
            <span>{new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-secondary">
            {!isWorker && (
              <TabsTrigger value="input" className="data-[state=active]:bg-card">Input Harian</TabsTrigger>
            )}
            <TabsTrigger value="history" className="data-[state=active]:bg-card">Riwayat</TabsTrigger>
          </TabsList>

          {!isWorker && (
            <TabsContent value="input" className="space-y-4">
            {/* Active Formula Banner */}
            {activeFormula ? (
              <div className="bg-accent/50 border border-primary/10 rounded-lg p-4 flex items-center gap-3">
                <Beaker className="h-5 w-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-primary">Formulasi Aktif: {activeFormula.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Jagung {activeFormula.corn_pct}% | Konsentrat {activeFormula.concentrate_pct}% | Dedak {activeFormula.bran_pct}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-sm text-destructive font-medium">Belum ada formulasi pakan aktif. Silakan buat di menu Pengaturan.</p>
              </div>
            )}

            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold text-primary mb-4">Form Input Produksi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className={cn("w-full justify-start text-left font-normal h-12 md:h-11", !inputDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {inputDate ? format(inputDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={inputDate} onSelect={setInputDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Usia Ayam (Minggu)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={usia} onChange={(e) => setUsia(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Jumlah Ayam (ekor)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={jumlahAyam} onChange={(e) => setJumlahAyam(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Kematian (ekor)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={kematian} onChange={(e) => setKematian(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Jual Ayam (ekor)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={jualAyam} onChange={(e) => setJualAyam(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Total Pakan (kg)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0"
                    className="h-12 md:h-11 border-primary/30"
                    value={totalPakan}
                    onChange={(e) => setTotalPakan(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Vitamin/Obat/Vaksin</Label>
                  <Input placeholder="-" className="h-12 md:h-11" value={vitaminObat} onChange={(e) => setVitaminObat(e.target.value)} />
                </div>
              </div>

              {/* Auto-calculated feed breakdown */}
              {parseFloat(totalPakan) > 0 && activeFormula && (
                <div className="mt-4 p-4 bg-accent/30 rounded-lg border border-primary/10">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Breakdown Pakan Otomatis (Formulasi: {activeFormula.name})</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Jagung ({activeFormula.corn_pct}%)</p>
                      <p className="text-lg font-semibold text-primary">{cornKg} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Konsentrat ({activeFormula.concentrate_pct}%)</p>
                      <p className="text-lg font-semibold text-primary">{concKg} kg</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Dedak ({activeFormula.bran_pct}%)</p>
                      <p className="text-lg font-semibold text-primary">{branKg} kg</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Produksi Telur (Butir)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={prodButir} onChange={(e) => setProdButir(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Reject (butir)</Label>
                  <Input type="number" placeholder="0" className="h-12 md:h-11" value={reject} onChange={(e) => setReject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Keterangan</Label>
                  <Input placeholder="-" className="h-12 md:h-11" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                </div>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button className="bg-primary hover:bg-primary/90 h-12 md:h-11" onClick={handleSimpanInput}>
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Input
                </Button>
                <p className="text-xs text-muted-foreground self-center">
                  Shortcut: Ctrl+S (Save) | Ctrl+E (Export Excel) | Ctrl+P (Export PDF)
                </p>
              </div>
            </div>
            </TabsContent>
          )}

          <TabsContent value="history" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" onClick={handleExport} className="border-primary/30">
                  <Download className="h-4 w-4 mr-2" />
                  Export Excel
                </Button>
                <Button variant="outline" onClick={handleExportPDF} className="border-primary/30">
                  <FileDown className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" onClick={() => setShowFilter(!showFilter)} className="border-primary/30">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-primary/30" disabled={isWorker}>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Excel
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Import Excel Harian</DialogTitle>
                    </DialogHeader>
                    <Input type="file" accept=".xlsx,.xls" ref={fileInputRef} onChange={handleImportFile} />
                    <DialogFooter>
                      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Pilih File</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            
            {showFilter && (
              <div className="bg-card rounded-lg border p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Tanggal Mulai</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filterStartDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filterStartDate ? format(filterStartDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={filterStartDate} onSelect={setFilterStartDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Tanggal Akhir</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !filterEndDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filterEndDate ? format(filterEndDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={filterEndDate} onSelect={setFilterEndDate} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => { setFilterStartDate(undefined); setFilterEndDate(undefined); }} className="flex-1">
                      Reset
                    </Button>
                    <Button onClick={() => setShowFilter(false)} className="flex-1 bg-primary">
                      Terapkan
                    </Button>
                  </div>
                </div>
                {(filterStartDate || filterEndDate) && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Menampilkan {filteredReports.length} dari {dailyReports.length} data
                  </p>
                )}
              </div>
            )}
            
            <div className="bg-card rounded-lg border overflow-x-auto">
              <Table>
                <TableHeader className="bg-secondary">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-primary">No.</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">Tanggal</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Usia (Mg)</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Jml Ayam</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Kematian</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Jual</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Total Pakan</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Jagung</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Konsentrat</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Dedak</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">Vitamin/Obat</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Butir</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Tray</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">Reject</TableHead>
                    <TableHead className="text-xs font-semibold text-primary text-right">% Prod</TableHead>
                    <TableHead className="text-xs font-semibold text-primary">Ket</TableHead>
                    {!isWorker && (
                      <TableHead className="text-xs font-semibold text-primary text-center">Aksi</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredReports].sort((a, b) => b.no - a.no).map((row) => (
                    <TableRow key={row.no} className="hover:bg-secondary/50">
                      <TableCell className="text-sm">{row.no}</TableCell>
                      <TableCell className="text-sm">{row.tanggal}</TableCell>
                      <TableCell className="text-sm text-right">{row.usia}</TableCell>
                      <TableCell className="text-sm text-right">{row.jumlahAyam.toLocaleString("id-ID")}</TableCell>
                      <TableCell className="text-sm text-right">{row.kematian}</TableCell>
                      <TableCell className="text-sm text-right">{row.jualAyam}</TableCell>
                      <TableCell className="text-sm text-right font-medium">{row.totalPakan}</TableCell>
                      <TableCell className="text-sm text-right">{row.jagung}</TableCell>
                      <TableCell className="text-sm text-right">{row.konsentrat}</TableCell>
                      <TableCell className="text-sm text-right">{row.dedak}</TableCell>
                      <TableCell className="text-sm">{row.vitaminObat}</TableCell>
                      <TableCell className="text-sm text-right">{row.prodButir}</TableCell>
                      <TableCell className="text-sm text-right">{row.prodTray}</TableCell>
                      <TableCell className="text-sm text-right">{row.reject}</TableCell>
                      <TableCell className="text-sm text-right">{row.pctProduksi}</TableCell>
                      <TableCell className="text-sm">{row.keterangan}</TableCell>
                      {!isWorker && (
                        <TableCell className="text-sm text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" className="h-8" onClick={() => handleOpenEdit(row)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus laporan harian?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Data tanggal {row.tanggal} akan dihapus dari tabel.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(row.no)}>
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Edit Laporan Harian</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               <div className="space-y-2">
                <Label className="text-sm">Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal h-12 md:h-11">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editTanggal || "Pilih tanggal"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={(() => { try { return parse(editTanggal, "dd-MMM-yy", new Date()); } catch { return undefined; } })()}
                      onSelect={(d) => d && setEditTanggal(format(d, "dd-MMM-yy"))}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Usia Ayam (Minggu)</Label>
                <Input type="number" value={editUsia} onChange={(e) => setEditUsia(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Jumlah Ayam (ekor)</Label>
                <Input type="number" value={editJumlahAyam} onChange={(e) => setEditJumlahAyam(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Kematian (ekor)</Label>
                <Input type="number" value={editKematian} onChange={(e) => setEditKematian(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Jual Ayam (ekor)</Label>
                <Input type="number" value={editJualAyam} onChange={(e) => setEditJualAyam(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Total Pakan (kg)</Label>
                <Input type="number" step="0.01" value={editTotalPakan} onChange={(e) => setEditTotalPakan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Vitamin/Obat/Vaksin</Label>
                <Input value={editVitaminObat} onChange={(e) => setEditVitaminObat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Produksi Telur (Butir)</Label>
                <Input type="number" value={editProdButir} onChange={(e) => setEditProdButir(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Reject (butir)</Label>
                <Input type="number" value={editReject} onChange={(e) => setEditReject(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label className="text-sm">Keterangan</Label>
                <Input value={editKeterangan} onChange={(e) => setEditKeterangan(e.target.value)} />
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Jagung</p>
                <p className="text-sm font-semibold text-primary">{editCornKg} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Konsentrat</p>
                <p className="text-sm font-semibold text-primary">{editConcKg} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dedak</p>
                <p className="text-sm font-semibold text-primary">{editBranKg} kg</p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default DailyReportPage;
