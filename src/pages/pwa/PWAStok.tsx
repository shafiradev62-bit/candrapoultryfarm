import { useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { X } from "lucide-react";
import { format } from "date-fns";

export default function PWAStok() {
  const { toast } = useToast();
  const { warehouseEntries, addWarehouseEntry } = useAppData();
  const [showEggSheet, setShowEggSheet] = useState(false);
  const [showFeedSheet, setShowFeedSheet] = useState(false);
  const [selectedFeedType, setSelectedFeedType] = useState("");
  const [customFeedAmount, setCustomFeedAmount] = useState("");
  const [reductionAmount, setReductionAmount] = useState("");

  const currentStock = warehouseEntries[warehouseEntries.length - 1] ?? {
    stokJagung: 0,
    stokKonsentrat: 0,
    stokDedak: 0,
    telurButir: 0,
    telurTray: "0.00",
  };

  const stockItems = [
    { name: "Jagung", value: currentStock.stokJagung, type: "jagung" },
    { name: "Konsentrat", value: currentStock.stokKonsentrat, type: "konsentrat" },
    { name: "Dedak", value: currentStock.stokDedak, type: "dedak" },
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
      toast({ title: "Berhasil", description: `Stok ${type} +${amount} kg` });
      setShowFeedSheet(false);
      setCustomFeedAmount("");
    } catch (error) {
      toast({ title: "Error", description: "Gagal update stok", variant: "destructive" });
    }
  };

  const handleCustomFeedUpdate = () => {
    const amount = parseFloat(customFeedAmount || "0");
    if (amount <= 0) {
      toast({ title: "Error", description: "Jumlah harus > 0", variant: "destructive" });
      return;
    }
    handleQuickUpdate(selectedFeedType, amount);
  };

  const handleEggReduction = async () => {
    const amount = parseFloat(reductionAmount || "0");
    if (amount <= 0) {
      toast({ title: "Error", description: "Jumlah harus > 0", variant: "destructive" });
      return;
    }
    if (amount > currentStock.telurButir) {
      toast({ title: "Error", description: `Stok tidak cukup. Tersedia: ${currentStock.telurButir} butir`, variant: "destructive" });
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

      toast({ title: "Berhasil", description: `${amount} butir telur dikurangi` });
      setReductionAmount("");
      setShowEggSheet(false);
    } catch (error) {
      toast({ title: "Error", description: "Gagal mengurangi stok", variant: "destructive" });
    }
  };

  const quickPresets = [30, 60, 90, 150, 300, 600];

  return (
    <PWALayout title="Stok">
      <div className="px-6 pt-6 pb-8">
        {/* Egg Stock Card */}
        <div className="bg-[#1B4332] rounded-[28px] p-6 text-white shadow-lg mb-5">
          <p className="text-sm opacity-80 mb-2">Stok Telur</p>
          <p className="text-5xl font-bold mb-1">{currentStock.telurButir.toLocaleString("id-ID")}</p>
          <p className="text-sm opacity-80 mb-5">butir · {currentStock.telurTray} tray</p>
          <button onClick={() => setShowEggSheet(true)} className="w-full h-12 bg-white text-[#1B4332] rounded-[16px] font-bold active:scale-95 transition-all">
            Kurangi Stok
          </button>
        </div>

        {/* Feed Stock */}
        <h3 className="text-base font-bold text-[#1B4332] mb-4">Stok Pakan</h3>
        <div className="space-y-3">
          {stockItems.map((item) => (
            <div key={item.type} className="bg-white rounded-[20px] p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-[#1B4332]">{item.name}</span>
                <span className="text-2xl font-bold text-[#1B4332]">{item.value.toFixed(0)} kg</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100].map((amount) => (
                  <button key={amount} onClick={() => handleQuickUpdate(item.type, amount)} className="h-10 bg-[#40916C]/10 text-[#1B4332] rounded-[12px] font-bold active:scale-95 transition-all">
                    +{amount}
                  </button>
                ))}
                <button onClick={() => { setSelectedFeedType(item.type); setShowFeedSheet(true); }} className="h-10 bg-[#1B4332] text-white rounded-[12px] font-bold active:scale-95 transition-all">
                  Custom
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sheet */}
      {showEggSheet && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowEggSheet(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1B4332]">Kurangi Stok Telur</h3>
              <button onClick={() => setShowEggSheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-[20px] p-5">
                <p className="text-xs text-gray-600 mb-1">Stok Tersedia</p>
                <p className="text-4xl font-bold text-[#1B4332]">{currentStock.telurButir.toLocaleString("id-ID")}</p>
                <p className="text-xs text-gray-500 mt-1">{currentStock.telurTray} tray</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-3 block">Quick Select</label>
                <div className="grid grid-cols-3 gap-2">
                  {quickPresets.map((preset) => (
                    <button key={preset} onClick={() => setReductionAmount(preset.toString())} className={`h-16 rounded-[16px] font-bold transition-all ${reductionAmount === preset.toString() ? "bg-[#1B4332] text-white" : "bg-gray-100 text-[#1B4332]"}`}>
                      <span className="block text-xl">{preset}</span>
                      <span className="block text-xs opacity-70">{(preset / 30).toFixed(1)} tray</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Jumlah (Butir)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setReductionAmount((prev) => Math.max(0, parseInt(prev || "0") - 30).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" value={reductionAmount} onChange={(e) => setReductionAmount(e.target.value)} placeholder="Masukkan jumlah" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setReductionAmount((prev) => (parseInt(prev || "0") + 30).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowEggSheet(false)} className="flex-1 h-12 bg-gray-100 text-[#1B4332] rounded-[16px] font-bold active:scale-95 transition-all">Batal</button>
                <button onClick={handleEggReduction} disabled={!reductionAmount || parseFloat(reductionAmount) <= 0} className="flex-1 h-12 bg-[#1B4332] text-white rounded-[16px] font-bold active:scale-95 transition-all disabled:opacity-50">Kurangi</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Feed Amount Sheet */}
      {showFeedSheet && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowFeedSheet(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-xl font-bold text-[#1B4332]">Tambah Stok {selectedFeedType === "jagung" ? "Jagung" : selectedFeedType === "konsentrat" ? "Konsentrat" : "Dedak"}</h3>
              <button onClick={() => setShowFeedSheet(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Jumlah (kg)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setCustomFeedAmount((prev) => Math.max(0, parseFloat(prev || "0") - 10).toFixed(1))} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" step="0.1" value={customFeedAmount} onChange={(e) => setCustomFeedAmount(e.target.value)} placeholder="Masukkan jumlah" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setCustomFeedAmount((prev) => (parseFloat(prev || "0") + 10).toFixed(1))} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowFeedSheet(false)} className="flex-1 h-12 bg-gray-100 text-[#1B4332] rounded-[16px] font-bold active:scale-95 transition-all">Batal</button>
                <button onClick={handleCustomFeedUpdate} disabled={!customFeedAmount || parseFloat(customFeedAmount) <= 0} className="flex-1 h-12 bg-[#1B4332] text-white rounded-[16px] font-bold active:scale-95 transition-all disabled:opacity-50">Tambah</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PWALayout>
  );
}
