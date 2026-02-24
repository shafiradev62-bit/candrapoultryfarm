import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobilePenjualan() {
  const { toast } = useToast();
  const { salesEntries, addSalesEntry, warehouseEntries, addWarehouseEntry } = useAppData();
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());

  // Egg categories
  const [ssTray, setSsTray] = useState("");
  const [ssHarga, setSsHarga] = useState("");
  const [mTray, setMTray] = useState("");
  const [mHarga, setMHarga] = useState("");
  const [lTray, setLTray] = useState("");
  const [lHarga, setLHarga] = useState("");
  const [xlTray, setXlTray] = useState("");
  const [xlHarga, setXlHarga] = useState("");
  const [xxlTray, setXxlTray] = useState("");
  const [xxlHarga, setXxlHarga] = useState("");
  const [rejectTray, setRejectTray] = useState("");
  const [rejectHarga, setRejectHarga] = useState("");

  const [keterangan, setKeterangan] = useState("");

  const currentStock = warehouseEntries[warehouseEntries.length - 1];

  const categories = [
    { label: "SS", tray: ssTray, setTray: setSsTray, harga: ssHarga, setHarga: setSsHarga },
    { label: "S (M)", tray: mTray, setTray: setMTray, harga: mHarga, setHarga: setMHarga },
    { label: "M (L)", tray: lTray, setTray: setLTray, harga: lHarga, setHarga: setLHarga },
    { label: "L (XL)", tray: xlTray, setTray: setXlTray, harga: xlHarga, setHarga: setXlHarga },
    { label: "XL (XXL)", tray: xxlTray, setTray: setXxlTray, harga: xxlHarga, setHarga: setXxlHarga },
    { label: "Reject", tray: rejectTray, setTray: setRejectTray, harga: rejectHarga, setHarga: setRejectHarga },
  ];

  const calculateTotal = () => {
    const totalButir =
      (parseFloat(ssTray || "0") +
        parseFloat(mTray || "0") +
        parseFloat(lTray || "0") +
        parseFloat(xlTray || "0") +
        parseFloat(xxlTray || "0") +
        parseFloat(rejectTray || "0")) *
      30;

    const totalRp =
      parseFloat(ssTray || "0") * parseFloat(ssHarga || "0") +
      parseFloat(mTray || "0") * parseFloat(mHarga || "0") +
      parseFloat(lTray || "0") * parseFloat(lHarga || "0") +
      parseFloat(xlTray || "0") * parseFloat(xlHarga || "0") +
      parseFloat(xxlTray || "0") * parseFloat(xxlHarga || "0") +
      parseFloat(rejectTray || "0") * parseFloat(rejectHarga || "0");

    return { totalButir, totalRp };
  };

  const { totalButir, totalRp } = calculateTotal();

  const handleSubmit = async () => {
    if (!tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }

    if (totalButir === 0) {
      toast({ title: "Error", description: "Minimal satu kategori harus diisi", variant: "destructive" });
      return;
    }

    // Check stock
    if (currentStock && totalButir > currentStock.telurButir) {
      toast({
        title: "Stok tidak cukup",
        description: `Stok telur: ${currentStock.telurButir} butir. Penjualan: ${totalButir} butir`,
        variant: "destructive",
      });
      return;
    }

    const nextNo = salesEntries.length > 0 ? Math.max(...salesEntries.map((r) => r.no)) + 1 : 1;

    try {
      // Add sales entry
      await addSalesEntry({
        no: nextNo,
        tanggal: format(tanggal, "dd-MMM-yy"),
        ssTray: parseFloat(ssTray || "0"),
        ssHarga: parseFloat(ssHarga || "0"),
        mTray: parseFloat(mTray || "0"),
        mHarga: parseFloat(mHarga || "0"),
        lTray: parseFloat(lTray || "0"),
        lHarga: parseFloat(lHarga || "0"),
        xlTray: parseFloat(xlTray || "0"),
        xlHarga: parseFloat(xlHarga || "0"),
        xxlTray: parseFloat(xxlTray || "0"),
        xxlHarga: parseFloat(xxlHarga || "0"),
        rejectTray: parseFloat(rejectTray || "0"),
        rejectHarga: parseFloat(rejectHarga || "0"),
        ayam: 0,
        ayamHarga: 0,
        kohe: 0,
        koheHarga: 0,
        totalButir,
        totalRp,
        keterangan: keterangan || "-",
      });

      // Update warehouse stock
      const last = warehouseEntries[warehouseEntries.length - 1];
      const warehouseNextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((r) => r.no)) + 1 : 1;
      const newTelurButir = (last?.telurButir || 0) - totalButir;
      const newTelurTray = (newTelurButir / 30).toFixed(2);

      await addWarehouseEntry({
        no: warehouseNextNo,
        tanggal: format(tanggal, "dd-MMM-yy"),
        addJagung: 0,
        addKonsentrat: 0,
        addDedak: 0,
        stokJagung: last?.stokJagung || 0,
        stokKonsentrat: last?.stokKonsentrat || 0,
        stokDedak: last?.stokDedak || 0,
        telurButir: newTelurButir,
        telurTray: newTelurTray,
      });

      toast({
        title: "Berhasil",
        description: `Penjualan ${totalButir} butir telur berhasil disimpan`,
      });

      // Reset form
      setTanggal(new Date());
      setSsTray("");
      setSsHarga("");
      setMTray("");
      setMHarga("");
      setLTray("");
      setLHarga("");
      setXlTray("");
      setXlHarga("");
      setXxlTray("");
      setXxlHarga("");
      setRejectTray("");
      setRejectHarga("");
      setKeterangan("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan penjualan",
        variant: "destructive",
      });
    }
  };

  return (
    <MobileLayout title="Penjualan">
      <div className="p-4 space-y-6">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Tanggal</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal h-12 rounded-xl",
                  !tanggal && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {tanggal ? format(tanggal, "dd-MMM-yy") : <span>Pilih tanggal</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={tanggal} onSelect={setTanggal} initialFocus />
            </PopoverContent>
          </Popover>
        </div>

        {/* Stock Info */}
        {currentStock && (
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-1">Stok Telur Tersedia</p>
            <p className="text-2xl font-bold text-primary">
              {currentStock.telurButir.toLocaleString("id-ID")} butir
            </p>
            <p className="text-sm text-muted-foreground mt-1">{currentStock.telurTray} tray</p>
          </div>
        )}

        {/* Egg Categories */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold">Kategori Telur</h3>
          {categories.map((cat) => (
            <div key={cat.label} className="bg-card rounded-xl p-4 shadow-sm border space-y-3">
              <h4 className="font-semibold text-sm">{cat.label}</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Jumlah (Tray)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={cat.tray}
                    onChange={(e) => cat.setTray(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Harga/Tray (Rp)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={cat.harga}
                    onChange={(e) => cat.setHarga(e.target.value)}
                    className="h-10 rounded-lg"
                  />
                </div>
              </div>
              {cat.tray && cat.harga && (
                <div className="text-xs text-muted-foreground">
                  Subtotal: Rp{" "}
                  {(parseFloat(cat.tray) * parseFloat(cat.harga)).toLocaleString("id-ID")}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Keterangan */}
        <div className="space-y-2">
          <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
          <Input
            id="keterangan"
            type="text"
            placeholder="Catatan penjualan"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="h-12 rounded-xl"
          />
        </div>

        {/* Summary */}
        {totalButir > 0 && (
          <div className="bg-primary/10 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm mb-2">Ringkasan Penjualan</h3>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Telur</span>
              <span className="font-semibold">{totalButir.toLocaleString("id-ID")} butir</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Tray</span>
              <span className="font-semibold">{(totalButir / 30).toFixed(2)} tray</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t">
              <span className="font-semibold">Total Harga</span>
              <span className="font-bold text-primary">
                Rp {totalRp.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full h-12 rounded-xl text-base font-semibold"
          disabled={totalButir === 0}
        >
          <Check className="h-5 w-5 mr-2" />
          Simpan Penjualan
        </Button>
      </div>
    </MobileLayout>
  );
}
