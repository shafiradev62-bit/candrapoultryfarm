import { useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PWAInput() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { dailyReports, addDailyReport, warehouseEntries, feedFormulas } = useAppData();
  const [step, setStep] = useState(1);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tanggal, setTanggal] = useState(format(new Date(), "yyyy-MM-dd"));
  const [kematian, setKematian] = useState("");
  const [jualAyam, setJualAyam] = useState("");
  const [prodButir, setProdButir] = useState("");
  const [reject, setReject] = useState("");
  const [selectedFormula, setSelectedFormula] = useState("");
  const [totalPakan, setTotalPakan] = useState("");
  const [vitaminObat, setVitaminObat] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const activeFormulas = feedFormulas.filter((f) => f.is_active);
  const currentStock = warehouseEntries[warehouseEntries.length - 1];
  const lastReport = dailyReports[dailyReports.length - 1];

  const handleNext = () => {
    if (step === 1 && !tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!tanggal) {
      toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
      return;
    }

    const totalPakanValue = parseFloat(totalPakan || "0");
    
    // Use selected formula or default to first active formula
    let formula = feedFormulas.find((f) => f.id === selectedFormula);
    if (!formula && activeFormulas.length > 0) {
      formula = activeFormulas[0]; // Use first active formula as default
    }
    
    // If still no formula, use hardcoded default (50/35/15)
    if (!formula) {
      formula = {
        id: "default",
        name: "Default",
        corn_pct: 50,
        concentrate_pct: 35,
        bran_pct: 15,
        is_active: true,
        created_at: new Date().toISOString(),
      };
    }

    const jagungNeeded = (totalPakanValue * formula.corn_pct) / 100;
    const konsentratNeeded = (totalPakanValue * formula.concentrate_pct) / 100;
    const dedakNeeded = (totalPakanValue * formula.bran_pct) / 100;

    if (currentStock) {
      if (jagungNeeded > currentStock.stokJagung) {
        toast({ title: "Stok tidak cukup", description: `Jagung tidak cukup. Tersedia: ${currentStock.stokJagung.toFixed(2)} kg`, variant: "destructive" });
        return;
      }
      if (konsentratNeeded > currentStock.stokKonsentrat) {
        toast({ title: "Stok tidak cukup", description: `Konsentrat tidak cukup. Tersedia: ${currentStock.stokKonsentrat.toFixed(2)} kg`, variant: "destructive" });
        return;
      }
      if (dedakNeeded > currentStock.stokDedak) {
        toast({ title: "Stok tidak cukup", description: `Dedak tidak cukup. Tersedia: ${currentStock.stokDedak.toFixed(2)} kg`, variant: "destructive" });
        return;
      }
    }

    const kematianValue = parseInt(kematian || "0");
    const jualAyamValue = parseInt(jualAyam || "0");
    const lastJumlahAyam = lastReport?.jumlahAyam || 0;
    const jumlahAyam = lastJumlahAyam - kematianValue - jualAyamValue;
    const prodButirValue = parseInt(prodButir || "0");
    const rejectValue = parseInt(reject || "0");
    const prodTray = ((prodButirValue - rejectValue) / 30).toFixed(2);
    const pctProduksi = jumlahAyam > 0 ? ((prodButirValue / jumlahAyam) * 100).toFixed(2) + "%" : "0%";
    const nextNo = dailyReports.length > 0 ? Math.max(...dailyReports.map((r) => r.no)) + 1 : 1;

    try {
      await addDailyReport({
        no: nextNo,
        tanggal: format(new Date(tanggal), "dd-MMM-yy"),
        usia: (lastReport?.usia || 0) + 1,
        jumlahAyam,
        kematian: kematianValue,
        jualAyam: jualAyamValue,
        totalPakan: totalPakanValue,
        jagung: jagungNeeded,
        konsentrat: konsentratNeeded,
        dedak: dedakNeeded,
        vitaminObat: vitaminObat || "-",
        prodButir: prodButirValue,
        prodTray,
        reject: rejectValue,
        pctProduksi,
        keterangan: keterangan || "-",
      });

      toast({ title: "Berhasil", description: "Laporan harian berhasil ditambahkan" });
      
      // Reset form
      setStep(1);
      setTanggal(format(new Date(), "yyyy-MM-dd"));
      setKematian("");
      setJualAyam("");
      setProdButir("");
      setReject("");
      setSelectedFormula("");
      setTotalPakan("");
      setVitaminObat("");
      setKeterangan("");
      
      // Navigate to dashboard after data is synced (wait for auto-push debounce + buffer)
      setTimeout(() => {
        navigate("/pwa");
      }, 2500);
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah laporan", variant: "destructive" });
    }
  };

  return (
    <PWALayout title="Input Harian">
      <div className="space-y-4">
        {/* Progress - Proper */}
        <div className="mb-4">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1B4332] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-medium ${step >= 1 ? "text-[#1B4332]" : "text-gray-400"}`}>Info</span>
            <span className={`text-xs font-medium ${step >= 2 ? "text-[#1B4332]" : "text-gray-400"}`}>Produksi</span>
            <span className={`text-xs font-medium ${step >= 3 ? "text-[#1B4332]" : "text-gray-400"}`}>Pakan</span>
          </div>
        </div>

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div className="fixed inset-0 z-[9999] bg-black/40 flex items-end" onClick={() => setShowDatePicker(false)}>
            <div className="w-full bg-white rounded-t-[32px] p-6 pb-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-[#1B4332]">Pilih Tanggal</h3>
                <button onClick={() => setShowDatePicker(false)} className="text-[#40916C] font-semibold">Selesai</button>
              </div>
              <input type="date" value={tanggal} onChange={(e) => { setTanggal(e.target.value); setShowDatePicker(false); }} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332]" />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-[20px] p-5 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Tanggal</label>
              <button type="button" onClick={() => setShowDatePicker(true)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] text-left text-[#1B4332] font-medium">
                {format(new Date(tanggal), "dd MMM yyyy")}
              </button>
            </div>
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-1">Populasi Saat Ini</p>
              <p className="text-3xl font-bold text-[#1B4332]">{lastReport?.jumlahAyam || 0} <span className="text-sm font-normal text-gray-500">ekor</span></p>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Ayam Mati</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setKematian((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                <input type="number" value={kematian} onChange={(e) => setKematian(e.target.value)} placeholder="0" className="flex-1 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                <button type="button" onClick={() => setKematian((prev) => (parseInt(prev || "0") + 1).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Ayam Dijual</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setJualAyam((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                <input type="number" value={jualAyam} onChange={(e) => setJualAyam(e.target.value)} placeholder="0" className="flex-1 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                <button type="button" onClick={() => setJualAyam((prev) => (parseInt(prev || "0") + 1).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
              </div>
            </div>
            {(kematian || jualAyam) && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Populasi Baru</p>
                <p className="text-3xl font-bold text-[#1B4332]">{(lastReport?.jumlahAyam || 0) - parseInt(kematian || "0") - parseInt(jualAyam || "0")} <span className="text-sm font-normal text-gray-500">ekor</span></p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-[20px] p-5 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Produksi Telur (Butir)</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setProdButir((prev) => Math.max(0, parseInt(prev || "0") - 10).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                <input type="number" value={prodButir} onChange={(e) => setProdButir(e.target.value)} placeholder="0" className="flex-1 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                <button type="button" onClick={() => setProdButir((prev) => (parseInt(prev || "0") + 10).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Telur Reject</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setReject((prev) => Math.max(0, parseInt(prev || "0") - 5).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                <input type="number" value={reject} onChange={(e) => setReject(e.target.value)} placeholder="0" className="flex-1 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                <button type="button" onClick={() => setReject((prev) => (parseInt(prev || "0") + 5).toString())} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
              </div>
            </div>
            {prodButir && (
              <>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-500">Telur Bagus</span>
                    <span className="text-xl font-bold text-[#1B4332]">{parseInt(prodButir || "0") - parseInt(reject || "0")} <span className="text-xs font-normal text-gray-500">butir</span></span>
                  </div>
                  <p className="text-xs text-gray-400">{((parseInt(prodButir || "0") - parseInt(reject || "0")) / 30).toFixed(1)} tray</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">% Produksi</span>
                    <span className="text-xl font-bold text-[#1B4332]">{lastReport?.jumlahAyam ? ((parseInt(prodButir || "0") / lastReport.jumlahAyam) * 100).toFixed(1) : "0"}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="bg-white rounded-[20px] p-5 shadow-sm space-y-4">
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Formula Pakan</label>
              <select value={selectedFormula} onChange={(e) => setSelectedFormula(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332]">
                <option value="">Pilih formula</option>
                {activeFormulas.map((formula) => (
                  <option key={formula.id} value={formula.id}>{formula.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Total Pakan (kg)</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setTotalPakan((prev) => Math.max(0, parseFloat(prev || "0") - 5).toFixed(1))} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                <input type="number" step="0.1" value={totalPakan} onChange={(e) => setTotalPakan(e.target.value)} placeholder="0" className="flex-1 px-3 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-center" />
                <button type="button" onClick={() => setTotalPakan((prev) => (parseFloat(prev || "0") + 5).toFixed(1))} className="w-11 h-11 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Vitamin/Obat</label>
              <input type="text" value={vitaminObat} onChange={(e) => setVitaminObat(e.target.value)} placeholder="Opsional" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332]" />
            </div>
            <div>
              <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Keterangan</label>
              <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Opsional" className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332]" />
            </div>
          </div>
        )}
      </div>

      {/* Sticky Bottom - Proper */}
      <div 
        className="fixed left-0 right-0 px-4 pb-3 bg-gradient-to-t from-[#FDFCF7] via-[#FDFCF7] to-transparent pt-4 z-40"
        style={{ bottom: 'calc(80px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 h-12 bg-white border-2 border-gray-200 text-[#1B4332] rounded-[16px] font-bold active:scale-95 transition-all">Kembali</button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="flex-1 h-12 bg-[#1B4332] text-white rounded-[16px] font-bold active:scale-95 transition-all shadow-lg">Lanjut</button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 h-12 bg-[#1B4332] text-white rounded-[16px] font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />Simpan
            </button>
          )}
        </div>
      </div>
    </PWALayout>
  );
}
