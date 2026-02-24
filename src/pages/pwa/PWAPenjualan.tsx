import { useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";
import { Check } from "lucide-react";

export default function PWAPenjualan() {
  const { toast } = useToast();
  const { salesEntries, addSale, warehouseEntries, addWarehouseEntry } = useAppData();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tanggal, setTanggal] = useState(format(new Date(), "yyyy-MM-dd"));
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

  const totalButir = (parseFloat(ssTray || "0") + parseFloat(mTray || "0") + parseFloat(lTray || "0") + parseFloat(xlTray || "0") + parseFloat(xxlTray || "0") + parseFloat(rejectTray || "0")) * 30;
  const totalRp = parseFloat(ssTray || "0") * parseFloat(ssHarga || "0") + parseFloat(mTray || "0") * parseFloat(mHarga || "0") + parseFloat(lTray || "0") * parseFloat(lHarga || "0") + parseFloat(xlTray || "0") * parseFloat(xlHarga || "0") + parseFloat(xxlTray || "0") * parseFloat(xxlHarga || "0") + parseFloat(rejectTray || "0") * parseFloat(rejectHarga || "0");

  const handleSubmit = async () => {
    if (!tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    if (totalButir === 0) {
      toast({ title: "Error", description: "Minimal satu kategori harus diisi", variant: "destructive" });
      return;
    }
    if (currentStock && totalButir > currentStock.telurButir) {
      toast({ title: "Stok tidak cukup", description: `Stok: ${currentStock.telurButir} butir. Penjualan: ${totalButir} butir`, variant: "destructive" });
      return;
    }

    const nextNo = salesEntries.length > 0 ? Math.max(...salesEntries.map((r) => r.no)) + 1 : 1;

    try {
      await addSale({
        no: nextNo,
        tanggal: format(new Date(tanggal), "dd-MMM-yy"),
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

      const last = warehouseEntries[warehouseEntries.length - 1];
      const warehouseNextNo = warehouseEntries.length > 0 ? Math.max(...warehouseEntries.map((r) => r.no)) + 1 : 1;
      const newTelurButir = (last?.telurButir || 0) - totalButir;
      const newTelurTray = (newTelurButir / 30).toFixed(2);

      await addWarehouseEntry({
        no: warehouseNextNo,
        tanggal: format(new Date(tanggal), "dd-MMM-yy"),
        addJagung: 0,
        addKonsentrat: 0,
        addDedak: 0,
        stokJagung: last?.stokJagung || 0,
        stokKonsentrat: last?.stokKonsentrat || 0,
        stokDedak: last?.stokDedak || 0,
        telurButir: newTelurButir,
        telurTray: newTelurTray,
      });

      toast({ title: "Berhasil", description: `Penjualan ${totalButir} butir telur disimpan` });
      setTanggal(format(new Date(), "yyyy-MM-dd"));
      setSsTray(""); setSsHarga(""); setMTray(""); setMHarga(""); setLTray(""); setLHarga(""); setXlTray(""); setXlHarga(""); setXxlTray(""); setXxlHarga(""); setRejectTray(""); setRejectHarga(""); setKeterangan("");
    } catch (error) {
      toast({ title: "Error", description: "Gagal menyimpan penjualan", variant: "destructive" });
    }
  };

  return (
    <PWALayout title="Penjualan">
      <div className="px-6 pt-6 pb-28 space-y-5">
        {/* iOS Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={() => setShowDatePicker(false)}>
            <div className="w-full bg-white rounded-t-[32px] p-6 pb-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#1B4332]">Pilih Tanggal</h3>
                <button onClick={() => setShowDatePicker(false)} className="text-[#40916C] font-semibold">Selesai</button>
              </div>
              <input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setShowDatePicker(false); }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg" />
            </div>
          </div>
        )}

        <div className="bg-white rounded-[24px] p-5 shadow-sm">
          <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Tanggal</label>
          <button type="button" onClick={() => setShowDatePicker(true)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] text-left text-[#1B4332] font-medium">
            {format(new Date(tanggal), "dd MMMM yyyy", { locale: { localize: { month: (n: number) => ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][n] } } })}
          </button>
        </div>

        {currentStock && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">Stok Tersedia</p>
            <p className="text-3xl font-bold text-[#1B4332]">{currentStock.telurButir.toLocaleString("id-ID")} <span className="text-base font-normal text-gray-500">butir</span></p>
            <p className="text-xs text-gray-400 mt-1">{currentStock.telurTray} tray</p>
          </div>
        )}

        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat.label} className="bg-white rounded-[24px] p-5 shadow-sm">
              <h4 className="font-bold text-[#1B4332] mb-3">{cat.label}</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Tray</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => cat.setTray((prev) => Math.max(0, parseFloat(prev || "0") - 0.5).toFixed(1))} className="w-10 h-10 bg-gray-100 rounded-[10px] font-bold text-[#1B4332] active:scale-95 transition-all text-sm">-</button>
                    <input type="number" step="0.1" value={cat.tray} onChange={(e) => cat.setTray(e.target.value)} placeholder="0" className="flex-1 px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-[12px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                    <button type="button" onClick={() => cat.setTray((prev) => (parseFloat(prev || "0") + 0.5).toFixed(1))} className="w-10 h-10 bg-gray-100 rounded-[10px] font-bold text-[#1B4332] active:scale-95 transition-all text-sm">+</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Harga/Tray</label>
                  <input type="number" value={cat.harga} onChange={(e) => cat.setHarga(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-[12px] focus:border-[#40916C] outline-none text-[#1B4332]" />
                </div>
              </div>
              {cat.tray && cat.harga && (
                <p className="text-xs text-gray-500 mt-2">Subtotal: <span className="font-bold text-[#1B4332]">Rp {(parseFloat(cat.tray) * parseFloat(cat.harga)).toLocaleString("id-ID")}</span></p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[24px] p-5 shadow-sm">
          <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Keterangan</label>
          <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Opsional" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332]" />
        </div>

        {totalButir > 0 && (
          <div className="bg-white rounded-[24px] p-5 shadow-sm border-2 border-[#40916C]">
            <h3 className="font-bold text-[#1B4332] mb-3">Ringkasan</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Telur</span>
                <span className="font-bold text-[#1B4332]">{totalButir.toLocaleString("id-ID")} butir</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-[#1B4332]">Total Harga</span>
                <span className="font-bold text-[#1B4332] text-xl">Rp {totalRp.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-[#FDFCF7] via-[#FDFCF7] to-transparent pt-6">
        <button onClick={handleSubmit} disabled={totalButir === 0} className="w-full h-14 bg-[#1B4332] text-white rounded-[20px] font-bold active:scale-95 transition-all disabled:opacity-50 shadow-lg flex items-center justify-center gap-2">
          <Check className="h-5 w-5" />Simpan Penjualan
        </button>
      </div>
    </PWALayout>
  );
}
