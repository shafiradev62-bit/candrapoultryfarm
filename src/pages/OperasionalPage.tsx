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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, Plus, Trash2, Pencil, CalendarIcon } from "lucide-react";
import { exportToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { useState } from "react";
import { format, parse } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const OperasionalPage = () => {
  const { toast } = useToast();
  const { operationalEntries, addOperational, updateOperational, deleteOperational } = useAppData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editNo, setEditNo] = useState<number | null>(null);
  const [editTanggal, setEditTanggal] = useState<Date | undefined>(undefined);
  const [editObjek, setEditObjek] = useState("");
  const [editJumlah, setEditJumlah] = useState("");
  const [editUom, setEditUom] = useState("");
  const [editHargaSatuan, setEditHargaSatuan] = useState("");
  const [editKeterangan, setEditKeterangan] = useState("");
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
  const [objek, setObjek] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [uom, setUom] = useState("");
  const [hargaSatuan, setHargaSatuan] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const handleExport = () => {
    exportToExcel(operationalEntries.map(r => ({
      "No.": r.no,
      "Tanggal": r.tanggal,
      "Objek": r.objek,
      "Jumlah": r.jumlah,
      "UOM": r.uom,
      "Harga Satuan": r.hargaSatuan,
      "Total Harga": r.totalHarga,
      "Keterangan": r.keterangan,
    })), "Operasional", "Operasional");
    toast({ title: "Export berhasil", description: "File Excel telah didownload." });
  };

  const totalBiaya = operationalEntries.reduce((sum, r) => sum + r.totalHarga, 0);
  const totalHargaPreview = (parseFloat(jumlah || "0") || 0) * (parseFloat(hargaSatuan || "0") || 0);

  const handleTambahPengeluaran = async () => {
    const jumlahValue = parseFloat(jumlah);
    const hargaValue = parseFloat(hargaSatuan);
    if (!tanggal || !objek.trim() || !uom.trim()) {
      toast({ title: "Error", description: "Tanggal, objek, dan UOM wajib diisi", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(jumlahValue) || jumlahValue <= 0 || !Number.isFinite(hargaValue) || hargaValue <= 0) {
      toast({ title: "Error", description: "Jumlah dan harga satuan harus lebih dari 0", variant: "destructive" });
      return;
    }
    const tanggalStr = format(tanggal, "dd-MMM-yy");
    const nextNo = operationalEntries.length > 0 ? Math.max(...operationalEntries.map((row) => row.no)) + 1 : 1;
    try {
      await addOperational({
        no: nextNo,
        tanggal: tanggalStr,
        objek: objek.trim(),
        jumlah: jumlahValue,
        uom: uom.trim(),
        hargaSatuan: hargaValue,
        totalHarga: jumlahValue * hargaValue,
        keterangan: keterangan.trim(),
      });
      setTanggal(new Date());
      setObjek("");
      setJumlah("");
      setUom("");
      setHargaSatuan("");
      setKeterangan("");
      setOpen(false);
      toast({ title: "Berhasil", description: "Pengeluaran operasional ditambahkan" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah pengeluaran", variant: "destructive" });
    }
  };

  const handleDelete = async (no: number) => {
    try {
      await deleteOperational(no);
      toast({ title: "Berhasil", description: "Pengeluaran operasional dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus pengeluaran", variant: "destructive" });
    }
  };

  const handleOpenEdit = (row: (typeof operationalEntries)[number]) => {
    setEditNo(row.no);
    try {
      setEditTanggal(parse(row.tanggal, "dd-MMM-yy", new Date()));
    } catch {
      setEditTanggal(new Date());
    }
    setEditObjek(row.objek);
    setEditJumlah(row.jumlah.toString());
    setEditUom(row.uom);
    setEditHargaSatuan(row.hargaSatuan.toString());
    setEditKeterangan(row.keterangan);
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (editNo === null) return;
    const jumlahValue = parseFloat(editJumlah);
    const hargaValue = parseFloat(editHargaSatuan);
    if (!editTanggal || !editObjek.trim() || !editUom.trim()) {
      toast({ title: "Error", description: "Tanggal, objek, dan UOM wajib diisi", variant: "destructive" });
      return;
    }
    if (!Number.isFinite(jumlahValue) || jumlahValue <= 0 || !Number.isFinite(hargaValue) || hargaValue <= 0) {
      toast({ title: "Error", description: "Jumlah dan harga satuan harus lebih dari 0", variant: "destructive" });
      return;
    }
    const tanggalStr = format(editTanggal, "dd-MMM-yy");
    try {
      await updateOperational(editNo, {
        no: editNo,
        tanggal: tanggalStr,
        objek: editObjek.trim(),
        jumlah: jumlahValue,
        uom: editUom.trim(),
        hargaSatuan: hargaValue,
        totalHarga: jumlahValue * hargaValue,
        keterangan: editKeterangan.trim(),
      });
      setEditOpen(false);
      toast({ title: "Berhasil", description: "Pengeluaran operasional diperbarui" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui pengeluaran", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Operasional">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">Operasional</h1>
            <p className="text-sm text-muted-foreground">
              Total biaya operasional: Rp {totalBiaya.toLocaleString("id-ID")}
            </p>
            <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
              <span>Total Transaksi: {operationalEntries.length}</span>
              <span>Rata-rata: Rp {operationalEntries.length > 0 ? Math.round(totalBiaya / operationalEntries.length).toLocaleString("id-ID") : 0}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-primary/30" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Pengeluaran
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Pengeluaran Operasional</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
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
                  <div className="space-y-2">
                    <Label>Objek</Label>
                    <Input placeholder="Contoh: Jagung" value={objek} onChange={(e) => setObjek(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Jumlah</Label>
                    <Input type="number" value={jumlah} onChange={(e) => setJumlah(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>UOM</Label>
                    <Input placeholder="kg / sak / botol" value={uom} onChange={(e) => setUom(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Harga Satuan</Label>
                    <Input type="number" value={hargaSatuan} onChange={(e) => setHargaSatuan(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Keterangan</Label>
                    <Input placeholder="Opsional" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
                  </div>
                </div>
                <div className="text-sm font-medium text-primary">
                  Total: Rp {totalHargaPreview.toLocaleString("id-ID")}
                </div>
                <DialogFooter>
                  <Button onClick={handleTambahPengeluaran} className="bg-primary hover:bg-primary/90">
                    Simpan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="text-xs font-semibold text-primary">No.</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Objek</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Jumlah</TableHead>
                <TableHead className="text-xs font-semibold text-primary">UOM</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Harga Satuan</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Total Harga</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Keterangan</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {operationalEntries.map((row) => (
                <TableRow key={row.no} className="hover:bg-secondary/50">
                  <TableCell className="text-sm">{row.no}</TableCell>
                  <TableCell className="text-sm">{row.tanggal}</TableCell>
                  <TableCell className="text-sm font-medium">{row.objek}</TableCell>
                  <TableCell className="text-sm text-right">{row.jumlah}</TableCell>
                  <TableCell className="text-sm">{row.uom}</TableCell>
                  <TableCell className="text-sm text-right">Rp {row.hargaSatuan.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-sm text-right font-medium">Rp {row.totalHarga.toLocaleString("id-ID")}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.keterangan}</TableCell>
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
                            <AlertDialogTitle>Hapus pengeluaran?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Pengeluaran tanggal {row.tanggal} akan dihapus dari tabel.
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
              {/* Total Row */}
              <TableRow className="bg-secondary/50 font-semibold">
                <TableCell colSpan={6} className="text-sm text-right">TOTAL</TableCell>
                <TableCell className="text-sm text-right text-primary">
                  Rp {totalBiaya.toLocaleString("id-ID")}
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Pengeluaran Operasional</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
                <Label>Objek</Label>
                <Input placeholder="Contoh: Jagung" value={editObjek} onChange={(e) => setEditObjek(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Jumlah</Label>
                <Input type="number" value={editJumlah} onChange={(e) => setEditJumlah(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>UOM</Label>
                <Input placeholder="kg / sak / botol" value={editUom} onChange={(e) => setEditUom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Harga Satuan</Label>
                <Input type="number" value={editHargaSatuan} onChange={(e) => setEditHargaSatuan(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input placeholder="Opsional" value={editKeterangan} onChange={(e) => setEditKeterangan(e.target.value)} />
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
    </AppLayout>
  );
};

export default OperasionalPage;
