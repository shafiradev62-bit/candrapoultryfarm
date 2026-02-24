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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Plus, Trash2, Pencil, X, CalendarIcon } from "lucide-react";
import { exportToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useAppData, type CustomSaleItem } from "@/contexts/AppDataContext";
import { useState } from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const UNIT_OPTIONS = ["Tray", "Ekor", "Kg", "Karung", "Pcs", "Liter"];

interface CustomItemForm {
  name: string;
  qty: string;
  unit: string;
  harga: string;
}

const emptyCustomItem = (): CustomItemForm => ({ name: "", qty: "0", unit: "Pcs", harga: "0" });

const PenjualanPage = () => {
  const { toast } = useToast();
  const { salesEntries, addSale, updateSale, deleteSale } = useAppData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNo, setEditNo] = useState<number | null>(null);

  // Add form state
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
  const [ssTray, setSsTray] = useState("0");
  const [ssHarga, setSsHarga] = useState("0");
  const [mTray, setMTray] = useState("0");
  const [mHarga, setMHarga] = useState("0");
  const [lTray, setLTray] = useState("0");
  const [lHarga, setLHarga] = useState("0");
  const [xlTray, setXlTray] = useState("0");
  const [xlHarga, setXlHarga] = useState("0");
  const [xxlTray, setXxlTray] = useState("0");
  const [xxlHarga, setXxlHarga] = useState("0");
  const [rejectTray, setRejectTray] = useState("0");
  const [rejectHarga, setRejectHarga] = useState("0");
  const [ayam, setAyam] = useState("0");
  const [ayamHarga, setAyamHarga] = useState("0");
  const [kohe, setKohe] = useState("0");
  const [koheHarga, setKoheHarga] = useState("0");
  const [keterangan, setKeterangan] = useState("");
  const [customItems, setCustomItems] = useState<CustomItemForm[]>([]);

  // Edit form state
  const [editTanggal, setEditTanggal] = useState<Date | undefined>(undefined);
  const [editSsTray, setEditSsTray] = useState("0");
  const [editSsHarga, setEditSsHarga] = useState("0");
  const [editMTray, setEditMTray] = useState("0");
  const [editMHarga, setEditMHarga] = useState("0");
  const [editLTray, setEditLTray] = useState("0");
  const [editLHarga, setEditLHarga] = useState("0");
  const [editXlTray, setEditXlTray] = useState("0");
  const [editXlHarga, setEditXlHarga] = useState("0");
  const [editXxlTray, setEditXxlTray] = useState("0");
  const [editXxlHarga, setEditXxlHarga] = useState("0");
  const [editRejectTray, setEditRejectTray] = useState("0");
  const [editRejectHarga, setEditRejectHarga] = useState("0");
  const [editAyam, setEditAyam] = useState("0");
  const [editAyamHarga, setEditAyamHarga] = useState("0");
  const [editKohe, setEditKohe] = useState("0");
  const [editKoheHarga, setEditKoheHarga] = useState("0");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [editCustomItems, setEditCustomItems] = useState<CustomItemForm[]>([]);

  const p = (v: string) => parseFloat(v || "0") || 0;

  const calcTotals = (ss: string, ssH: string, m: string, mH: string, l: string, lH: string, xl: string, xlH: string, xxl: string, xxlH: string, rej: string, rejH: string, ay: string, ayH: string, ko: string, koH: string, items: CustomItemForm[]) => {
    const trayTotal = p(ss) + p(m) + p(l) + p(xl) + p(xxl) + p(rej);
    const totalButir = trayTotal * 30;
    const totalRp = p(ss) * p(ssH) + p(m) * p(mH) + p(l) * p(lH) + p(xl) * p(xlH) + p(xxl) * p(xxlH) + p(rej) * p(rejH) + p(ay) * p(ayH) + p(ko) * p(koH)
      + items.reduce((sum, item) => sum + p(item.qty) * p(item.harga), 0);
    return { totalButir, totalRp };
  };

  const { totalButir: totalButirPreview, totalRp: totalRpPreview } = calcTotals(ssTray, ssHarga, mTray, mHarga, lTray, lHarga, xlTray, xlHarga, xxlTray, xxlHarga, rejectTray, rejectHarga, ayam, ayamHarga, kohe, koheHarga, customItems);

  const handleExport = () => {
    exportToExcel(salesEntries.map(r => ({
      "No.": r.no,
      "Tanggal": r.tanggal,
      "SS (Tray)": r.ssTray || "",
      "SS Harga/tray": r.ssHarga || "",
      "M (Tray)": r.mTray || "",
      "M Harga/tray": r.mHarga || "",
      "L (Tray)": r.lTray || "",
      "L Harga/tray": r.lHarga || "",
      "XL (Tray)": r.xlTray || "",
      "XL Harga/tray": r.xlHarga || "",
      "XXL (Tray)": r.xxlTray || "",
      "XXL Harga/tray": r.xxlHarga || "",
      "Reject (Tray)": r.rejectTray || "",
      "Reject Harga": r.rejectHarga || "",
      "Ayam": r.ayam || "",
      "Ayam Harga": r.ayamHarga || "",
      "Kohe": r.kohe || "",
      "Kohe Harga": r.koheHarga || "",
      "Produk Lain": (r.customItems || []).map(ci => `${ci.name}: ${ci.qty} ${ci.unit} @${ci.harga}`).join("; "),
      "Jumlah (Butir)": r.totalButir,
      "Total (Rp)": r.totalRp,
      "Keterangan": r.keterangan,
    })), "Data_Penjualan", "Penjualan");
    toast({ title: "Export berhasil", description: "File Excel telah didownload." });
  };

  const totalRevenue = salesEntries.reduce((s, r) => s + r.totalRp, 0);

  const resetAddForm = () => {
    setTanggal(new Date()); setSsTray("0"); setSsHarga("0"); setMTray("0"); setMHarga("0");
    setLTray("0"); setLHarga("0"); setXlTray("0"); setXlHarga("0"); setXxlTray("0");
    setXxlHarga("0"); setRejectTray("0"); setRejectHarga("0"); setAyam("0"); setAyamHarga("0");
    setKohe("0"); setKoheHarga("0"); setKeterangan(""); setCustomItems([]);
  };

  const handleTambahPenjualan = async () => {
    if (!tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    const tanggalStr = format(tanggal, "dd-MMM-yy");
    const nextNo = salesEntries.length > 0 ? Math.max(...salesEntries.map((row) => row.no)) + 1 : 1;
    const parsedCustom: CustomSaleItem[] = customItems.filter(i => i.name.trim()).map(i => ({
      name: i.name.trim(), qty: p(i.qty), unit: i.unit, harga: p(i.harga),
    }));
    try {
      await addSale({
        no: nextNo, tanggal: tanggalStr,
        ssTray: p(ssTray), ssHarga: p(ssHarga), mTray: p(mTray), mHarga: p(mHarga),
        lTray: p(lTray), lHarga: p(lHarga), xlTray: p(xlTray), xlHarga: p(xlHarga),
        xxlTray: p(xxlTray), xxlHarga: p(xxlHarga), rejectTray: p(rejectTray), rejectHarga: p(rejectHarga),
        ayam: p(ayam), ayamHarga: p(ayamHarga), kohe: p(kohe), koheHarga: p(koheHarga),
        totalButir: totalButirPreview, totalRp: totalRpPreview, keterangan: keterangan.trim(),
        customItems: parsedCustom.length > 0 ? parsedCustom : undefined,
      });
      resetAddForm();
      setOpen(false);
      toast({ title: "Berhasil", description: "Penjualan berhasil ditambahkan" });
    } catch {
      toast({ title: "Error", description: "Gagal menambahkan penjualan", variant: "destructive" });
    }
  };

  const handleDelete = async (no: number) => {
    try {
      await deleteSale(no);
      toast({ title: "Berhasil", description: "Data penjualan dihapus" });
    } catch {
      toast({ title: "Error", description: "Gagal menghapus data penjualan", variant: "destructive" });
    }
  };

  const handleOpenEdit = (row: (typeof salesEntries)[number]) => {
    setEditNo(row.no);
    try {
      setEditTanggal(parse(row.tanggal, "dd-MMM-yy", new Date()));
    } catch {
      setEditTanggal(new Date());
    }
    setEditSsTray(row.ssTray.toString()); setEditSsHarga(row.ssHarga.toString());
    setEditMTray(row.mTray.toString()); setEditMHarga(row.mHarga.toString());
    setEditLTray(row.lTray.toString()); setEditLHarga(row.lHarga.toString());
    setEditXlTray(row.xlTray.toString()); setEditXlHarga(row.xlHarga.toString());
    setEditXxlTray(row.xxlTray.toString()); setEditXxlHarga(row.xxlHarga.toString());
    setEditRejectTray(row.rejectTray.toString()); setEditRejectHarga(row.rejectHarga.toString());
    setEditAyam(row.ayam.toString()); setEditAyamHarga(row.ayamHarga.toString());
    setEditKohe(row.kohe.toString()); setEditKoheHarga(row.koheHarga.toString());
    setEditKeterangan(row.keterangan);
    setEditCustomItems((row.customItems || []).map(ci => ({
      name: ci.name, qty: ci.qty.toString(), unit: ci.unit, harga: ci.harga.toString(),
    })));
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (editNo === null) return;
    if (!editTanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    const tanggalStr = format(editTanggal, "dd-MMM-yy");
    const parsedCustom: CustomSaleItem[] = editCustomItems.filter(i => i.name.trim()).map(i => ({
      name: i.name.trim(), qty: p(i.qty), unit: i.unit, harga: p(i.harga),
    }));
    const { totalButir, totalRp } = calcTotals(editSsTray, editSsHarga, editMTray, editMHarga, editLTray, editLHarga, editXlTray, editXlHarga, editXxlTray, editXxlHarga, editRejectTray, editRejectHarga, editAyam, editAyamHarga, editKohe, editKoheHarga, editCustomItems);
    try {
      await updateSale(editNo, {
        no: editNo, tanggal: tanggalStr,
        ssTray: p(editSsTray), ssHarga: p(editSsHarga), mTray: p(editMTray), mHarga: p(editMHarga),
        lTray: p(editLTray), lHarga: p(editLHarga), xlTray: p(editXlTray), xlHarga: p(editXlHarga),
        xxlTray: p(editXxlTray), xxlHarga: p(editXxlHarga), rejectTray: p(editRejectTray), rejectHarga: p(editRejectHarga),
        ayam: p(editAyam), ayamHarga: p(editAyamHarga), kohe: p(editKohe), koheHarga: p(editKoheHarga),
        totalButir, totalRp, keterangan: editKeterangan.trim(),
        customItems: parsedCustom.length > 0 ? parsedCustom : undefined,
      });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Penjualan diperbarui" });
    } catch {
      toast({ title: "Error", description: "Gagal memperbarui penjualan", variant: "destructive" });
    }
  };

  const updateCustomItem = (items: CustomItemForm[], setItems: (v: CustomItemForm[]) => void, index: number, field: keyof CustomItemForm, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const removeCustomItem = (items: CustomItemForm[], setItems: (v: CustomItemForm[]) => void, index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const renderCustomItemsSection = (items: CustomItemForm[], setItems: (v: CustomItemForm[]) => void) => (
    <div className="md:col-span-3 space-y-3 border-t pt-4 mt-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Produk Tambahan</Label>
        <Button type="button" variant="outline" size="sm" onClick={() => setItems([...items, emptyCustomItem()])}>
          <Plus className="h-3 w-3 mr-1" /> Tambah Produk
        </Button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end bg-secondary/30 p-3 rounded-lg relative">
          <div className="space-y-1 col-span-2 md:col-span-1">
            <Label className="text-xs">Nama Produk</Label>
            <Input placeholder="cth: Telur Omega" value={item.name} onChange={(e) => updateCustomItem(items, setItems, idx, "name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Jumlah</Label>
            <Input type="number" value={item.qty} onChange={(e) => updateCustomItem(items, setItems, idx, "qty", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Satuan</Label>
            <Select value={item.unit} onValueChange={(v) => updateCustomItem(items, setItems, idx, "unit", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNIT_OPTIONS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Harga/Satuan</Label>
            <div className="flex gap-1">
              <Input type="number" value={item.harga} onChange={(e) => updateCustomItem(items, setItems, idx, "harga", e.target.value)} />
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive" onClick={() => removeCustomItem(items, setItems, idx)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {item.name && <p className="text-xs text-muted-foreground col-span-2 md:col-span-5">
            Subtotal: Rp {(p(item.qty) * p(item.harga)).toLocaleString("id-ID")}
          </p>}
        </div>
      ))}
    </div>
  );

  return (
    <AppLayout title="Penjualan">
      <div className="p-4 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">Data Penjualan</h1>
            <p className="text-sm text-muted-foreground">
              Penjualan per ukuran telur (SS, M, L, XL, XXL) + Produk lain
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-primary/30" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" /> Export to Excel
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Penjualan
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Tambah Penjualan</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 md:col-span-3">
                    <Label>Tanggal</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !tanggal && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tanggal ? format(tanggal, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus className="p-3 pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2"><Label>SS (Tray)</Label><Input type="number" value={ssTray} onChange={(e) => setSsTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>SS Harga/Tray</Label><Input type="number" value={ssHarga} onChange={(e) => setSsHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>M (Tray)</Label><Input type="number" value={mTray} onChange={(e) => setMTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>M Harga/Tray</Label><Input type="number" value={mHarga} onChange={(e) => setMHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>L (Tray)</Label><Input type="number" value={lTray} onChange={(e) => setLTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>L Harga/Tray</Label><Input type="number" value={lHarga} onChange={(e) => setLHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>XL (Tray)</Label><Input type="number" value={xlTray} onChange={(e) => setXlTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>XL Harga/Tray</Label><Input type="number" value={xlHarga} onChange={(e) => setXlHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>XXL (Tray)</Label><Input type="number" value={xxlTray} onChange={(e) => setXxlTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>XXL Harga/Tray</Label><Input type="number" value={xxlHarga} onChange={(e) => setXxlHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Reject (Tray)</Label><Input type="number" value={rejectTray} onChange={(e) => setRejectTray(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Reject Harga</Label><Input type="number" value={rejectHarga} onChange={(e) => setRejectHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Ayam</Label><Input type="number" value={ayam} onChange={(e) => setAyam(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Ayam Harga</Label><Input type="number" value={ayamHarga} onChange={(e) => setAyamHarga(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Kohe</Label><Input type="number" value={kohe} onChange={(e) => setKohe(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Kohe Harga</Label><Input type="number" value={koheHarga} onChange={(e) => setKoheHarga(e.target.value)} /></div>
                  {renderCustomItemsSection(customItems, setCustomItems)}
                  <div className="space-y-2 md:col-span-3">
                    <Label>Keterangan</Label>
                    <Input placeholder="Opsional" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-sm font-medium text-primary">
                  <span>Total Butir: {totalButirPreview.toLocaleString("id-ID")}</span>
                  <span>Total Rp: {totalRpPreview.toLocaleString("id-ID")}</span>
                </div>
                <DialogFooter>
                  <Button onClick={handleTambahPenjualan} className="bg-primary hover:bg-primary/90">Simpan</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Total Revenue Periode</p>
          <p className="text-2xl font-semibold text-primary">Rp {totalRevenue.toLocaleString("id-ID")}</p>
          <div className="mt-3 grid grid-cols-3 gap-4 pt-3 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Total Transaksi</p>
              <p className="text-lg font-semibold">{salesEntries.length}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rata-rata/Transaksi</p>
              <p className="text-lg font-semibold">
                Rp {salesEntries.length > 0 ? Math.round(totalRevenue / salesEntries.length).toLocaleString("id-ID") : 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Telur Terjual</p>
              <p className="text-lg font-semibold">
                {salesEntries.reduce((s, r) => s + r.totalButir, 0).toLocaleString("id-ID")} butir
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="text-xs font-semibold text-primary">No.</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">SS</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">M</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">L</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">XL</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">XXL</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Butir</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Total (Rp)</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Ket</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesEntries.map((row) => (
                <TableRow key={row.no} className="hover:bg-secondary/50">
                  <TableCell className="text-sm">{row.no}</TableCell>
                  <TableCell className="text-sm">{row.tanggal}</TableCell>
                  <TableCell className="text-sm text-right">{row.ssTray || "-"}</TableCell>
                  <TableCell className="text-sm text-right">{row.mTray || "-"}</TableCell>
                  <TableCell className="text-sm text-right">{row.lTray || "-"}</TableCell>
                  <TableCell className="text-sm text-right">{row.xlTray || "-"}</TableCell>
                  <TableCell className="text-sm text-right">{row.xxlTray || "-"}</TableCell>
                  <TableCell className="text-sm text-right">{row.totalButir.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-sm text-right font-medium">Rp {row.totalRp.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.keterangan}
                    {(row.customItems || []).length > 0 && (
                      <span className="block text-xs text-primary/70 mt-0.5">
                        +{row.customItems!.length} produk lain
                      </span>
                    )}
                  </TableCell>
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
                            <AlertDialogTitle>Hapus data penjualan?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Data penjualan tanggal {row.tanggal} akan dihapus dari tabel.
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Edit Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Penjualan</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-3">
                <Label>Tanggal</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editTanggal && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {editTanggal ? format(editTanggal, "dd-MMM-yy") : <span>Pilih tanggal</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={editTanggal} onSelect={setEditTanggal} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2"><Label>SS (Tray)</Label><Input type="number" value={editSsTray} onChange={(e) => setEditSsTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>SS Harga/Tray</Label><Input type="number" value={editSsHarga} onChange={(e) => setEditSsHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>M (Tray)</Label><Input type="number" value={editMTray} onChange={(e) => setEditMTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>M Harga/Tray</Label><Input type="number" value={editMHarga} onChange={(e) => setEditMHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>L (Tray)</Label><Input type="number" value={editLTray} onChange={(e) => setEditLTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>L Harga/Tray</Label><Input type="number" value={editLHarga} onChange={(e) => setEditLHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>XL (Tray)</Label><Input type="number" value={editXlTray} onChange={(e) => setEditXlTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>XL Harga/Tray</Label><Input type="number" value={editXlHarga} onChange={(e) => setEditXlHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>XXL (Tray)</Label><Input type="number" value={editXxlTray} onChange={(e) => setEditXxlTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>XXL Harga/Tray</Label><Input type="number" value={editXxlHarga} onChange={(e) => setEditXxlHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>Reject (Tray)</Label><Input type="number" value={editRejectTray} onChange={(e) => setEditRejectTray(e.target.value)} /></div>
              <div className="space-y-2"><Label>Reject Harga</Label><Input type="number" value={editRejectHarga} onChange={(e) => setEditRejectHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>Ayam</Label><Input type="number" value={editAyam} onChange={(e) => setEditAyam(e.target.value)} /></div>
              <div className="space-y-2"><Label>Ayam Harga</Label><Input type="number" value={editAyamHarga} onChange={(e) => setEditAyamHarga(e.target.value)} /></div>
              <div className="space-y-2"><Label>Kohe</Label><Input type="number" value={editKohe} onChange={(e) => setEditKohe(e.target.value)} /></div>
              <div className="space-y-2"><Label>Kohe Harga</Label><Input type="number" value={editKoheHarga} onChange={(e) => setEditKoheHarga(e.target.value)} /></div>
              {renderCustomItemsSection(editCustomItems, setEditCustomItems)}
              <div className="space-y-2 md:col-span-3">
                <Label>Keterangan</Label>
                <Input placeholder="Opsional" value={editKeterangan} onChange={(e) => setEditKeterangan(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpdate} className="bg-primary hover:bg-primary/90">Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      </div>
    </AppLayout>
  );
};

export default PenjualanPage;
