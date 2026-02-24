import { useState } from "react";
import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { Plus, Minus, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { format } from "date-fns";

export default function MobileStok() {
  const { toast } = useToast();
  const { warehouseEntries, addWarehouseEntry } = useAppData();
  const [reductionAmount, setReductionAmount] = useState("");
  const [reductionNote, setReductionNote] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentStock = warehouseEntries[warehouseEntries.length - 1] ?? {
    stokJagung: 0,
    stokKonsentrat: 0,
    stokDedak: 0,
    telurButir: 0,
    telurTray: "0.00",
  };

  const stockItems = [
    {
      name: "Jagung",
      value: currentStock.stokJagung,
      unit: "kg",
      type: "jagung",
      alert: currentStock.stokJagung < 100,
    },
    {
      name: "Konsentrat",
      value: currentStock.stokKonsentrat,
      unit: "kg",
      type: "konsentrat",
      alert: currentStock.stokKonsentrat < 70,
    },
    {
      name: "Dedak",
      value: currentStock.stokDedak,
      unit: "kg",
      type: "dedak",
      alert: currentStock.stokDedak < 50,
    },
  ];

  const handleQuickUpdate = async (type: string, amount: number) => {
    const last = warehouseEntries[warehouseEntries.length - 1];
    const nextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((r) => r.no)) + 1 : 1;

    const updates: any = {
      no: nextNo,
      tanggal: format(new Date(), "dd-MMM-yy"),
      addJagung: 0,
      addKonsentrat: 0,
      addDedak: 0,
      stokJagung: last?.stokJagung || 0,
      stokKonsentrat: last?.stokKonsentrat || 0,
      stokDedak: last?.stokDedak || 0,
      telurButir: last?.telurButir || 0,
      telurTray: last?.telurTray || "0.00",
    };

    if (type === "jagung") {
      updates.addJagung = amount;
      updates.stokJagung = (last?.stokJagung || 0) + amount;
    } else if (type === "konsentrat") {
      updates.addKonsentrat = amount;
      updates.stokKonsentrat = (last?.stokKonsentrat || 0) + amount;
    } else if (type === "dedak") {
      updates.addDedak = amount;
      updates.stokDedak = (last?.stokDedak || 0) + amount;
    }

    try {
      await addWarehouseEntry(updates);
      toast({
        title: "Berhasil",
        description: `Stok ${type} berhasil ditambah ${amount} kg`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal update stok",
        variant: "destructive",
      });
    }
  };

  const handleEggReduction = async () => {
    const amount = parseFloat(reductionAmount || "0");
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Jumlah harus lebih dari 0",
        variant: "destructive",
      });
      return;
    }

    if (amount > currentStock.telurButir) {
      toast({
        title: "Error",
        description: `Stok tidak cukup. Tersedia: ${currentStock.telurButir} butir`,
        variant: "destructive",
      });
      return;
    }

    const last = warehouseEntries[warehouseEntries.length - 1];
    const nextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((r) => r.no)) + 1 : 1;
    const newTelurButir = currentStock.telurButir - amount;
    const newTelurTray = (newTelurButir / 30).toFixed(2);

    try {
      await addWarehouseEntry({
        no: nextNo,
        tanggal: format(new Date(), "dd-MMM-yy"),
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
        description: `${amount} butir telur berhasil dikurangi${reductionNote ? ` (${reductionNote})` : ""}`,
      });

      setReductionAmount("");
      setReductionNote("");
      setDrawerOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengurangi stok telur",
        variant: "destructive",
      });
    }
  };

  const quickReductionPresets = [
    { label: "1 Tray", value: 30 },
    { label: "2 Tray", value: 60 },
    { label: "3 Tray", value: 90 },
    { label: "5 Tray", value: 150 },
    { label: "10 Tray", value: 300 },
    { label: "20 Tray", value: 600 },
  ];

  return (
    <MobileLayout title="Manajemen Stok">
      <div className="p-4 space-y-6">
        {/* Egg Stock Section */}
        <div>
          <h3 className="text-base font-semibold mb-3">Stok Telur</h3>
          <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg">
            <p className="text-sm opacity-90 mb-2">Stok Saat Ini</p>
            <p className="text-4xl font-bold mb-1">
              {currentStock.telurButir.toLocaleString("id-ID")}
            </p>
            <p className="text-sm opacity-90">butir ({currentStock.telurTray} tray)</p>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="secondary"
                  className="w-full mt-4 h-12 rounded-xl font-semibold"
                >
                  <Minus className="h-5 w-5 mr-2" />
                  Kurangi Stok Telur
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Pengurangan Stok Telur</DrawerTitle>
                  <DrawerDescription>
                    Input manual pengurangan telur sesuai penjualan
                  </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 space-y-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Stok Tersedia</p>
                    <p className="text-2xl font-bold text-primary">
                      {currentStock.telurButir.toLocaleString("id-ID")} butir
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {currentStock.telurTray} tray
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Quick Select</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {quickReductionPresets.map((preset) => (
                        <Button
                          key={preset.value}
                          variant="outline"
                          className="h-16 flex-col"
                          onClick={() => setReductionAmount(preset.value.toString())}
                        >
                          <span className="text-lg font-bold">{preset.value}</span>
                          <span className="text-xs text-muted-foreground">{preset.label}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reductionAmount">Jumlah (Butir)</Label>
                    <Input
                      id="reductionAmount"
                      type="number"
                      placeholder="Masukkan jumlah"
                      value={reductionAmount}
                      onChange={(e) => setReductionAmount(e.target.value)}
                      className="h-12 rounded-xl text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reductionNote">Keterangan (Opsional)</Label>
                    <Input
                      id="reductionNote"
                      type="text"
                      placeholder="Contoh: Penjualan harian"
                      value={reductionNote}
                      onChange={(e) => setReductionNote(e.target.value)}
                      className="h-12 rounded-xl text-base"
                    />
                  </div>
                </div>

                <DrawerFooter>
                  <Button
                    onClick={handleEggReduction}
                    className="h-12 rounded-xl"
                    disabled={!reductionAmount || parseFloat(reductionAmount) <= 0}
                  >
                    <TrendingDown className="h-5 w-5 mr-2" />
                    Kurangi Stok
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="h-12 rounded-xl">
                      Batal
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>

        {/* Feed Stock Section */}
        <div>
          <h3 className="text-base font-semibold mb-3">Stok Pakan</h3>
          <div className="space-y-3">
            {stockItems.map((item) => (
              <div
                key={item.type}
                className={cn(
                  "bg-card rounded-xl p-4 shadow-sm border",
                  item.alert && "border-destructive border-2"
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.name}</p>
                    <p
                      className={cn(
                        "text-2xl font-bold",
                        item.alert ? "text-destructive" : "text-primary"
                      )}
                    >
                      {item.value.toLocaleString("id-ID")} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(item.type, 10)}
                    className="h-10 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    10
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(item.type, 50)}
                    className="h-10 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    50
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(item.type, 100)}
                    className="h-10 rounded-lg"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    100
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
