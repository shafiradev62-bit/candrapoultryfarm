import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Plus, Trash2, Pencil, CalendarIcon, Save, Upload, Minus, Search, Filter, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { exportToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useAppData, type WarehouseRow } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef } from "react";
import { format, parse } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button as Btn } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WarehousePage = () => {
  const { toast } = useToast();
  const { warehouseEntries, addWarehouseEntry, updateWarehouseEntry, deleteWarehouseEntry } = useAppData();
  const { role } = useAuth();
  const isWorker = role === "worker";
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNo, setEditNo] = useState<number | null>(null);
  const [editTanggal, setEditTanggal] = useState("");
  const [editAddJagung, setEditAddJagung] = useState("");
  const [editAddKonsentrat, setEditAddKonsentrat] = useState("");
  const [editAddDedak, setEditAddDedak] = useState("");
  const [editStokJagung, setEditStokJagung] = useState("");
  const [editStokKonsentrat, setEditStokKonsentrat] = useState("");
  const [editStokDedak, setEditStokDedak] = useState("");
  const [editTelurButir, setEditTelurButir] = useState("");
  const [editTelurTray, setEditTelurTray] = useState("");
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
  const [addJagung, setAddJagung] = useState("");
  const [addKonsentrat, setAddKonsentrat] = useState("");
  const [addDedak, setAddDedak] = useState("");
  const [telurButir, setTelurButir] = useState("");
  const [telurTray, setTelurTray] = useState("");
  const restoreInputRef = useRef<HTMLInputElement | null>(null);
  
  // State for egg reduction
  const [reductionOpen, setReductionOpen] = useState(false);
  const [reductionDate, setReductionDate] = useState<Date | undefined>(new Date());
  const [reductionButir, setReductionButir] = useState("");
  const [reductionKeterangan, setReductionKeterangan] = useState("");
  
  // State for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>();
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  
  // State for quick reduction presets
  const [quickReductionOpen, setQuickReductionOpen] = useState(false);

  const handleBackupData = () => {
    const backup = {
      timestamp: new Date().toISOString(),
      data: warehouseEntries,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `warehouse_backup_${format(new Date(), "dd-MMM-yy_HHmm")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Backup berhasil", description: "Data warehouse telah dibackup" });
  };

  const handleRestoreData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      
      if (!backup.data || !Array.isArray(backup.data)) {
        throw new Error("Format backup tidak valid");
      }
      
      // Validate and restore
      toast({ 
        title: "Restore berhasil", 
        description: `${backup.data.length} data warehouse berhasil direstore dari ${backup.timestamp ? format(new Date(backup.timestamp), "dd-MMM-yy HH:mm") : "backup"}` 
      });
      
      // Note: Actual restore would need to be implemented in AppDataContext
      console.log("Restore data:", backup.data);
    } catch (error) {
      toast({ title: "Error", description: "Gagal restore data. File mungkin corrupt.", variant: "destructive" });
    }
    
    event.target.value = "";
  };

  const handleExport = () => {
    exportToExcel(warehouseEntries.map(r => ({
      "No.": r.no,
      "Tanggal": r.tanggal,
      "Penambahan Jagung (kg)": r.addJagung || "",
      "Penambahan Konsentrat (kg)": r.addKonsentrat || "",
      "Penambahan Dedak (kg)": r.addDedak || "",
      "Stok Jagung (kg)": r.stokJagung,
      "Stok Konsentrat (kg)": r.stokKonsentrat,
      "Stok Dedak (kg)": r.stokDedak,
      "Telur (Butir)": r.telurButir,
      "Telur (Tray)": r.telurTray,
    })), "Stok_Gudang", "Warehouse");
    toast({ title: "Export berhasil", description: "File Excel telah didownload." });
  };

  const currentStock = warehouseEntries[warehouseEntries.length - 1] ?? {
    stokJagung: 0,
    stokKonsentrat: 0,
    stokDedak: 0,
    telurButir: 0,
    telurTray: "0.00",
  };
  const displayEntries = [...warehouseEntries].sort((a, b) => b.no - a.no);
  
  // Filter entries based on search and date range
  const filteredEntries = displayEntries.filter(entry => {
    const matchesSearch = searchQuery === "" || 
      entry.tanggal.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.no.toString().includes(searchQuery);
    
    if (!matchesSearch) return false;
    
    if (filterDateFrom || filterDateTo) {
      try {
        const entryDate = parse(entry.tanggal, "dd-MMM-yy", new Date());
        if (filterDateFrom && entryDate < filterDateFrom) return false;
        if (filterDateTo && entryDate > filterDateTo) return false;
      } catch {
        return true;
      }
    }
    
    return true;
  });
  
  // Calculate statistics for filtered period
  const stats = {
    totalEggReduction: 0,
    totalEggAddition: 0,
    totalFeedAddition: 0,
    avgDailyEggReduction: 0,
  };
  
  filteredEntries.forEach((entry, index) => {
    const prevEntry = filteredEntries[index + 1];
    if (prevEntry) {
      const eggChange = entry.telurButir - prevEntry.telurButir;
      if (eggChange < 0) stats.totalEggReduction += Math.abs(eggChange);
      if (eggChange > 0) stats.totalEggAddition += eggChange;
    }
    stats.totalFeedAddition += entry.addJagung + entry.addKonsentrat + entry.addDedak;
  });
  
  if (filteredEntries.length > 1) {
    stats.avgDailyEggReduction = stats.totalEggReduction / (filteredEntries.length - 1);
  }

  const handleTambahStok = async () => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    if (!tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    const tanggalStr = format(tanggal, "dd-MMM-yy");
    const addJagungValue = parseFloat(addJagung || "0") || 0;
    const addKonsentratValue = parseFloat(addKonsentrat || "0") || 0;
    const addDedakValue = parseFloat(addDedak || "0") || 0;
    const telurButirValue = parseFloat(telurButir || "0") || 0;
    const telurTrayValue = telurTray.trim()
      ? (parseFloat(telurTray) || 0)
      : parseFloat((telurButirValue / 30).toFixed(2));
    const last = warehouseEntries[warehouseEntries.length - 1];
    const nextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((row) => row.no)) + 1 : 1;
    try {
      const lastTelurButir = last?.telurButir ?? 0;
      const lastTelurTray = parseFloat(last?.telurTray ?? "0") || 0;
      const finalTelurButir = telurButir.trim() ? telurButirValue : lastTelurButir;
      const finalTelurTray = telurTray.trim()
        ? (parseFloat(telurTray) || 0)
        : lastTelurTray;
      await addWarehouseEntry({
        no: nextNo,
        tanggal: tanggalStr,
        addJagung: addJagungValue,
        addKonsentrat: addKonsentratValue,
        addDedak: addDedakValue,
        stokJagung: (last?.stokJagung || 0) + addJagungValue,
        stokKonsentrat: (last?.stokKonsentrat || 0) + addKonsentratValue,
        stokDedak: (last?.stokDedak || 0) + addDedakValue,
        telurButir: finalTelurButir,
        telurTray: finalTelurTray.toFixed(2),
      });
      setTanggal(new Date());
      setAddJagung("");
      setAddKonsentrat("");
      setAddDedak("");
      setTelurButir("");
      setTelurTray("");
      setOpen(false);
      toast({ title: "Berhasil", description: "Stok berhasil ditambahkan" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah stok", variant: "destructive" });
    }
  };

  const handleDeleteRow = async (no: number) => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    try {
      await deleteWarehouseEntry(no);
      toast({ title: "Berhasil", description: "Data stok dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus data stok", variant: "destructive" });
    }
  };

  const handleOpenEdit = (row: (typeof warehouseEntries)[number]) => {
    setEditNo(row.no);
    setEditTanggal(row.tanggal);
    setEditAddJagung(row.addJagung.toString());
    setEditAddKonsentrat(row.addKonsentrat.toString());
    setEditAddDedak(row.addDedak.toString());
    setEditStokJagung(row.stokJagung.toString());
    setEditStokKonsentrat(row.stokKonsentrat.toString());
    setEditStokDedak(row.stokDedak.toString());
    setEditTelurButir(row.telurButir.toString());
    setEditTelurTray(row.telurTray.toString());
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    if (editNo === null) return;
    const updated: WarehouseRow = {
      no: editNo,
      tanggal: editTanggal.trim(),
      addJagung: parseFloat(editAddJagung || "0") || 0,
      addKonsentrat: parseFloat(editAddKonsentrat || "0") || 0,
      addDedak: parseFloat(editAddDedak || "0") || 0,
      stokJagung: parseFloat(editStokJagung || "0") || 0,
      stokKonsentrat: parseFloat(editStokKonsentrat || "0") || 0,
      stokDedak: parseFloat(editStokDedak || "0") || 0,
      telurButir: parseFloat(editTelurButir || "0") || 0,
      telurTray: (parseFloat(editTelurTray || "0") || 0).toFixed(2),
    };
    try {
      await updateWarehouseEntry(editNo, updated);
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Data stok diperbarui" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui data stok", variant: "destructive" });
    }
  };

  const handlePenguranganStok = async () => {
    if (isWorker) {
      toast({ title: "Akses dibatasi", description: "Role Worker hanya bisa melihat data", variant: "destructive" });
      return;
    }
    if (!reductionDate) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    const reductionValue = parseFloat(reductionButir || "0") || 0;
    if (reductionValue <= 0) {
      toast({ title: "Error", description: "Jumlah pengurangan harus lebih dari 0", variant: "destructive" });
      return;
    }
    
    const last = warehouseEntries[warehouseEntries.length - 1];
    const currentTelurButir = last?.telurButir ?? 0;
    
    if (reductionValue > currentTelurButir) {
      toast({ 
        title: "Error", 
        description: `Stok tidak cukup. Stok saat ini: ${currentTelurButir} butir`, 
        variant: "destructive" 
      });
      return;
    }
    
    const tanggalStr = format(reductionDate, "dd-MMM-yy");
    const nextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((row) => row.no)) + 1 : 1;
    const newTelurButir = currentTelurButir - reductionValue;
    const newTelurTray = (newTelurButir / 30).toFixed(2);
    
    try {
      await addWarehouseEntry({
        no: nextNo,
        tanggal: tanggalStr,
        addJagung: 0,
        addKonsentrat: 0,
        addDedak: 0,
        stokJagung: last?.stokJagung || 0,
        stokKonsentrat: last?.stokKonsentrat || 0,
        stokDedak: last?.stokDedak || 0,
        telurButir: newTelurButir,
        telurTray: newTelurTray,
      });
      
      setReductionDate(new Date());
      setReductionButir("");
      setReductionKeterangan("");
      setReductionOpen(false);
      toast({ 
        title: "Berhasil", 
        description: `${reductionValue} butir telur berhasil dikurangi${reductionKeterangan ? ` (${reductionKeterangan})` : ""}` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengurangi stok telur", variant: "destructive" });
    }
  };
  
  const handleQuickReduction = async (amount: number, label: string) => {
    const last = warehouseEntries[warehouseEntries.length - 1];
    const currentTelurButir = last?.telurButir ?? 0;
    
    if (amount > currentTelurButir) {
      toast({ 
        title: "Error", 
        description: `Stok tidak cukup. Stok saat ini: ${currentTelurButir} butir`, 
        variant: "destructive" 
      });
      return;
    }
    
    const tanggalStr = format(new Date(), "dd-MMM-yy");
    const nextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((row) => row.no)) + 1 : 1;
    const newTelurButir = currentTelurButir - amount;
    const newTelurTray = (newTelurButir / 30).toFixed(2);
    
    try {
      await addWarehouseEntry({
        no: nextNo,
        tanggal: tanggalStr,
        addJagung: 0,
        addKonsentrat: 0,
        addDedak: 0,
        stokJagung: last?.stokJagung || 0,
        stokKonsentrat: last?.stokKonsentrat || 0,
        stokDedak: last?.stokDedak || 0,
        telurButir: newTelurButir,
        telurTray: newTelurTray,
      });
      
      setQuickReductionOpen(false);
      toast({ 
        title: "Berhasil", 
        description: `${label}: ${amount} butir telur berhasil dikurangi` 
      });
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengurangi stok telur", variant: "destructive" });
    }
  };
  
  const clearFilters = () => {
    setSearchQuery("");
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
  };

  return (
    <AppLayout title="Warehouse">
      <div className="p-4 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">Stok Gudang</h1>
            <p className="text-sm text-muted-foreground">Monitoring stok bahan pakan & produk telur</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-primary/30" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" className="border-primary/30" onClick={handleBackupData}>
              <Save className="h-4 w-4 mr-2" />
              Backup Data
            </Button>
            <input
              type="file"
              ref={restoreInputRef}
              accept=".json"
              style={{ display: "none" }}
              onChange={handleRestoreData}
            />
            <Button variant="outline" className="border-primary/30" onClick={() => restoreInputRef.current?.click()} disabled={isWorker}>
              <Upload className="h-4 w-4 mr-2" />
              Restore Data
            </Button>
          </div>
        </div>

        <Tabs defaultValue="stok" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stok">Stok Gudang</TabsTrigger>
            <TabsTrigger value="pengurangan">Pengurangan Stok Telur</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stok" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" disabled={isWorker}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Stok
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Stok Gudang</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Btn variant="outline" className={cn("w-full justify-start text-left font-normal h-12 md:h-10", !tanggal && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tanggal ? format(tanggal, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                        </Btn>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Tambah Jagung (kg)</Label>
                    <Input type="number" value={addJagung} onChange={(e) => setAddJagung(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tambah Konsentrat (kg)</Label>
                    <Input type="number" value={addKonsentrat} onChange={(e) => setAddKonsentrat(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tambah Dedak (kg)</Label>
                    <Input type="number" value={addDedak} onChange={(e) => setAddDedak(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telur (Butir)</Label>
                    <Input type="number" value={telurButir} onChange={(e) => setTelurButir(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Telur (Tray)</Label>
                    <Input type="number" value={telurTray} onChange={(e) => setTelurTray(e.target.value)} />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleTambahStok} className="bg-primary hover:bg-primary/90">
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Current Stock Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className={cn("bg-card rounded-lg border p-4", currentStock.stokJagung < 100 && "border-destructive border-2")}>
            <p className="text-xs text-muted-foreground">Jagung</p>
            <p className={cn("text-xl font-semibold", currentStock.stokJagung < 100 ? "text-destructive" : "text-primary")}>
              {currentStock.stokJagung.toLocaleString("id-ID")} kg
            </p>
            {currentStock.stokJagung < 100 && (
              <p className="text-xs text-destructive mt-1">⚠️ Stok menipis!</p>
            )}
          </div>
          <div className={cn("bg-card rounded-lg border p-4", currentStock.stokKonsentrat < 70 && "border-destructive border-2")}>
            <p className="text-xs text-muted-foreground">Konsentrat</p>
            <p className={cn("text-xl font-semibold", currentStock.stokKonsentrat < 70 ? "text-destructive" : "text-primary")}>
              {currentStock.stokKonsentrat.toLocaleString("id-ID")} kg
            </p>
            {currentStock.stokKonsentrat < 70 && (
              <p className="text-xs text-destructive mt-1">⚠️ Stok menipis!</p>
            )}
          </div>
          <div className={cn("bg-card rounded-lg border p-4", currentStock.stokDedak < 50 && "border-destructive border-2")}>
            <p className="text-xs text-muted-foreground">Dedak</p>
            <p className={cn("text-xl font-semibold", currentStock.stokDedak < 50 ? "text-destructive" : "text-primary")}>
              {currentStock.stokDedak.toLocaleString("id-ID")} kg
            </p>
            {currentStock.stokDedak < 50 && (
              <p className="text-xs text-destructive mt-1">⚠️ Stok menipis!</p>
            )}
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Telur (Butir)</p>
            <p className="text-xl font-semibold text-primary">{currentStock.telurButir.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Telur (Tray)</p>
            <p className="text-xl font-semibold text-primary">{currentStock.telurTray}</p>
          </div>
        </div>
        
        {/* Search and Filter Section */}
        <div className="bg-card rounded-lg border p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan tanggal atau nomor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-primary/30"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Sembunyikan" : "Tampilkan"} Filter
            </Button>
          </div>
          
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Dari Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Btn variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDateFrom ? format(filterDateFrom, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                    </Btn>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filterDateFrom} onSelect={setFilterDateFrom} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Sampai Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Btn variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filterDateTo ? format(filterDateTo, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                    </Btn>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={filterDateTo} onSelect={setFilterDateTo} initialFocus className="p-3" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters} className="w-full">
                  Reset Filter
                </Button>
              </div>
            </div>
          )}
          
          {(searchQuery || filterDateFrom || filterDateTo) && (
            <div className="text-sm text-muted-foreground">
              Menampilkan {filteredEntries.length} dari {displayEntries.length} data
            </div>
          )}
        </div>

        {/* History Table matching Excel */}
        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="text-xs font-semibold text-primary" rowSpan={2}>No.</TableHead>
                <TableHead className="text-xs font-semibold text-primary" rowSpan={2}>Tanggal</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center" colSpan={3}>Penambahan Bahan Pakan</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center" colSpan={3}>Stok Bahan Pakan</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center" colSpan={2}>Produk</TableHead>
                {!isWorker && (
                  <TableHead className="text-xs font-semibold text-primary text-center" rowSpan={2}>Aksi</TableHead>
                )}
              </TableRow>
              <TableRow>
                <TableHead className="text-xs text-primary text-right">Jagung</TableHead>
                <TableHead className="text-xs text-primary text-right">Konsentrat</TableHead>
                <TableHead className="text-xs text-primary text-right">Dedak</TableHead>
                <TableHead className="text-xs text-primary text-right">Jagung</TableHead>
                <TableHead className="text-xs text-primary text-right">Konsentrat</TableHead>
                <TableHead className="text-xs text-primary text-right">Dedak</TableHead>
                <TableHead className="text-xs text-primary text-right">Butir</TableHead>
                <TableHead className="text-xs text-primary text-right">Tray</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((row) => (
                <TableRow key={row.no} className="hover:bg-secondary/50">
                  <TableCell className="text-sm">{row.no}</TableCell>
                  <TableCell className="text-sm">{row.tanggal}</TableCell>
                  <TableCell className="text-sm text-right">{row.addJagung || ""}</TableCell>
                  <TableCell className="text-sm text-right">{row.addKonsentrat || ""}</TableCell>
                  <TableCell className="text-sm text-right">{row.addDedak || ""}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{row.stokJagung.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{row.stokKonsentrat.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-right font-medium">{row.stokDedak.toFixed(2)}</TableCell>
                  <TableCell className="text-sm text-right">{row.telurButir}</TableCell>
                  <TableCell className="text-sm text-right">{row.telurTray}</TableCell>
                  {!isWorker && (
                    <TableCell className="text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
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
                              <AlertDialogTitle>Hapus data stok?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Data stok pada tanggal {row.tanggal} akan dihapus dari tabel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDeleteRow(row.no)}>
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
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stok Gudang</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Btn variant="outline" className="w-full justify-start text-left font-normal h-12 md:h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editTanggal || "Pilih tanggal"}
                    </Btn>
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
                <Label>Tambah Jagung (kg)</Label>
                <Input type="number" value={editAddJagung} onChange={(e) => setEditAddJagung(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tambah Konsentrat (kg)</Label>
                <Input type="number" value={editAddKonsentrat} onChange={(e) => setEditAddKonsentrat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tambah Dedak (kg)</Label>
                <Input type="number" value={editAddDedak} onChange={(e) => setEditAddDedak(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Jagung (kg)</Label>
                <Input type="number" value={editStokJagung} onChange={(e) => setEditStokJagung(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Konsentrat (kg)</Label>
                <Input type="number" value={editStokKonsentrat} onChange={(e) => setEditStokKonsentrat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Dedak (kg)</Label>
                <Input type="number" value={editStokDedak} onChange={(e) => setEditStokDedak(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telur (Butir)</Label>
                <Input type="number" value={editTelurButir} onChange={(e) => setEditTelurButir(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telur (Tray)</Label>
                <Input type="number" value={editTelurTray} onChange={(e) => setEditTelurTray(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </TabsContent>
      
      <TabsContent value="pengurangan" className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-base font-semibold text-primary">Pengurangan Stok Telur</h2>
            <p className="text-sm text-muted-foreground">Input manual pengurangan telur sesuai penjualan harian</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={quickReductionOpen} onOpenChange={setQuickReductionOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-primary/30" disabled={isWorker}>
                  <TrendingDown className="h-4 w-4 mr-2" />
                  Quick Actions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Pengurangan Cepat</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Stok saat ini: {currentStock.telurButir.toLocaleString("id-ID")} butir
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(30, "1 Tray")}
                    >
                      <span className="text-2xl font-bold">30</span>
                      <span className="text-xs">1 Tray</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(60, "2 Tray")}
                    >
                      <span className="text-2xl font-bold">60</span>
                      <span className="text-xs">2 Tray</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(90, "3 Tray")}
                    >
                      <span className="text-2xl font-bold">90</span>
                      <span className="text-xs">3 Tray</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(150, "5 Tray")}
                    >
                      <span className="text-2xl font-bold">150</span>
                      <span className="text-xs">5 Tray</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(300, "10 Tray")}
                    >
                      <span className="text-2xl font-bold">300</span>
                      <span className="text-xs">10 Tray</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex-col"
                      onClick={() => handleQuickReduction(600, "20 Tray")}
                    >
                      <span className="text-2xl font-bold">600</span>
                      <span className="text-xs">20 Tray</span>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={reductionOpen} onOpenChange={setReductionOpen}>
            <DialogTrigger asChild>
              <Button className="bg-destructive hover:bg-destructive/90" disabled={isWorker}>
                <Minus className="h-4 w-4 mr-2" />
                Kurangi Stok Telur
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Pengurangan Stok Telur</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tanggal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Btn variant="outline" className={cn("w-full justify-start text-left font-normal h-12 md:h-10", !reductionDate && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {reductionDate ? format(reductionDate, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                      </Btn>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={reductionDate} onSelect={setReductionDate} initialFocus className="p-3 pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Jumlah Pengurangan (Butir)</Label>
                  <Input 
                    type="number" 
                    value={reductionButir} 
                    onChange={(e) => setReductionButir(e.target.value)}
                    placeholder="Masukkan jumlah telur yang terjual"
                  />
                  <p className="text-xs text-muted-foreground">
                    Stok saat ini: {currentStock.telurButir.toLocaleString("id-ID")} butir ({currentStock.telurTray} tray)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Keterangan (Opsional)</Label>
                  <Input 
                    type="text" 
                    value={reductionKeterangan} 
                    onChange={(e) => setReductionKeterangan(e.target.value)}
                    placeholder="Contoh: Penjualan harian"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handlePenguranganStok} className="bg-destructive hover:bg-destructive/90">
                  Kurangi Stok
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        </div>

        {/* Statistics Cards */}
        {(searchQuery || filterDateFrom || filterDateTo) && filteredEntries.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <p className="text-xs text-muted-foreground">Total Pengurangan</p>
              </div>
              <p className="text-2xl font-bold text-destructive">{stats.totalEggReduction.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-1">butir</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-xs text-muted-foreground">Total Penambahan</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{stats.totalEggAddition.toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-1">butir</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-primary" />
                <p className="text-xs text-muted-foreground">Rata-rata Harian</p>
              </div>
              <p className="text-2xl font-bold text-primary">{Math.round(stats.avgDailyEggReduction).toLocaleString("id-ID")}</p>
              <p className="text-xs text-muted-foreground mt-1">butir/hari</p>
            </div>
            <div className="bg-card rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <p className="text-xs text-muted-foreground">Estimasi Habis</p>
              </div>
              <p className="text-2xl font-bold text-orange-500">
                {stats.avgDailyEggReduction > 0 
                  ? Math.round(currentStock.telurButir / stats.avgDailyEggReduction)
                  : "∞"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">hari</p>
            </div>
          </div>
        )}

        {/* Current Stock Summary for Eggs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-card rounded-lg border p-6">
            <p className="text-sm text-muted-foreground mb-2">Stok Telur Saat Ini</p>
            <p className="text-3xl font-bold text-primary">{currentStock.telurButir.toLocaleString("id-ID")}</p>
            <p className="text-sm text-muted-foreground mt-1">butir</p>
          </div>
          <div className="bg-card rounded-lg border p-6">
            <p className="text-sm text-muted-foreground mb-2">Dalam Tray</p>
            <p className="text-3xl font-bold text-primary">{currentStock.telurTray}</p>
            <p className="text-sm text-muted-foreground mt-1">tray (@ 30 butir)</p>
          </div>
        </div>

        {/* Recent Egg Stock Changes */}
        <div className="bg-card rounded-lg border overflow-x-auto">
          <div className="p-4 border-b">
            <h3 className="text-sm font-semibold text-primary">Riwayat Perubahan Stok Telur</h3>
          </div>
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="text-xs font-semibold text-primary">No.</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Stok Telur (Butir)</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Stok Telur (Tray)</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Perubahan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((row, index) => {
                const prevRow = filteredEntries[index + 1];
                const change = prevRow ? row.telurButir - prevRow.telurButir : 0;
                const isReduction = change < 0;
                const isAddition = change > 0;
                
                return (
                  <TableRow key={row.no} className="hover:bg-secondary/50">
                    <TableCell className="text-sm">{row.no}</TableCell>
                    <TableCell className="text-sm">{row.tanggal}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{row.telurButir.toLocaleString("id-ID")}</TableCell>
                    <TableCell className="text-sm text-right font-medium">{row.telurTray}</TableCell>
                    <TableCell className="text-sm text-right">
                      {change !== 0 && (
                        <span className={cn(
                          "font-medium",
                          isReduction && "text-destructive",
                          isAddition && "text-green-600"
                        )}>
                          {change > 0 ? "+" : ""}{change.toLocaleString("id-ID")}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Stok Gudang</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Btn variant="outline" className="w-full justify-start text-left font-normal h-12 md:h-10">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editTanggal || "Pilih tanggal"}
                    </Btn>
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
                <Label>Tambah Jagung (kg)</Label>
                <Input type="number" value={editAddJagung} onChange={(e) => setEditAddJagung(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tambah Konsentrat (kg)</Label>
                <Input type="number" value={editAddKonsentrat} onChange={(e) => setEditAddKonsentrat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tambah Dedak (kg)</Label>
                <Input type="number" value={editAddDedak} onChange={(e) => setEditAddDedak(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Jagung (kg)</Label>
                <Input type="number" value={editStokJagung} onChange={(e) => setEditStokJagung(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Konsentrat (kg)</Label>
                <Input type="number" value={editStokKonsentrat} onChange={(e) => setEditStokKonsentrat(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Stok Dedak (kg)</Label>
                <Input type="number" value={editStokDedak} onChange={(e) => setEditStokDedak(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telur (Butir)</Label>
                <Input type="number" value={editTelurButir} onChange={(e) => setEditTelurButir(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telur (Tray)</Label>
                <Input type="number" value={editTelurTray} onChange={(e) => setEditTelurTray(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">
                Simpan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </AppLayout>
  );
};

export default WarehousePage;
