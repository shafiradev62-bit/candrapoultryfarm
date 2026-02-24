import { useState } from "react";
import { PWALayout } from "@/components/PWALayout";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { format } from "date-fns";
import { Check } from "lucide-react";

export default function PWAInput() {
  const { toast } = useToast();
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
    const formula = feedFormulas.find((f) => f.id === selectedFormula);

    if (!formula) {
      toast({ title: "Error", description: "Pilih formula pakan", variant: "destructive" });
      return;
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
    } catch (error) {
      toast({ title: "Error", description: "Gagal menambah laporan", variant: "destructive" });
    }
  };

  return (
    <PWALayout title="Input Harian">
      <div className="px-6 pt-6 pb-28">
        {/* iOS Progress */}
        <div className="mb-6">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#1B4332] transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <span className={`text-xs font-medium ${step >= 1 ? "text-[#1B4332]" : "text-gray-400"}`}>Info</span>
            <span className={`text-xs font-medium ${step >= 2 ? "text-[#1B4332]" : "text-gray-400"}`}>Produksi</span>
            <span className={`text-xs font-medium ${step >= 3 ? "text-[#1B4332]" : "text-gray-400"}`}>Pakan</span>
          </div>
        </div>

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

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Tanggal</label>
                <button
                  type="button"
                  onClick={() => setShowDatePicker(true)}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] text-left text-[#1B4332] font-medium"
                >
                  {format(new Date(tanggal), "dd MMMM yyyy", { locale: { localize: { month: (n: number) => ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"][n] } } })}
                </button>
              </div>
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Populasi Saat Ini</p>
                <p className="text-3xl font-bold text-[#1B4332]">{lastReport?.jumlahAyam || 0} <span className="text-base font-normal text-gray-500">ekor</span></p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Ayam Mati</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setKematian((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" value={kematian} onChange={(e) => setKematian(e.target.value)} placeholder="0" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setKematian((prev) => (parseInt(prev || "0") + 1).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Ayam Dijual</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setJualAyam((prev) => Math.max(0, parseInt(prev || "0") - 1).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" value={jualAyam} onChange={(e) => setJualAyam(e.target.value)} placeholder="0" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setJualAyam((prev) => (parseInt(prev || "0") + 1).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>
              {(kematian || jualAyam) && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Populasi Baru</p>
                  <p className="text-3xl font-bold text-[#1B4332]">{(lastReport?.jumlahAyam || 0) - parseInt(kematian || "0") - parseInt(jualAyam || "0")} <span className="text-base font-normal text-gray-500">ekor</span></p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-4">
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Produksi Telur (Butir)</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setProdButir((prev) => Math.max(0, parseInt(prev || "0") - 10).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" value={prodButir} onChange={(e) => setProdButir(e.target.value)} placeholder="0" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setProdButir((prev) => (parseInt(prev || "0") + 10).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-[#1B4332] mb-2 block">Telur Reject</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setReject((prev) => Math.max(0, parseInt(prev || "0") - 5).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" value={reject} onChange={(e) => setReject(e.target.value)} placeholder="0" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setReject((prev) => (parseInt(prev || "0") + 5).toString())} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
                </div>
              </div>
              {prodButir && (
                <>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">Telur Bagus</span>
                      <span className="text-2xl font-bold text-[#1B4332]">{parseInt(prodButir || "0") - parseInt(reject || "0")} <span className="text-sm font-normal text-gray-500">butir</span></span>
                    </div>
                    <p className="text-xs text-gray-400">{((parseInt(prodButir || "0") - parseInt(reject || "0")) / 30).toFixed(1)} tray</p>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">% Produksi</span>
                      <span className="text-2xl font-bold text-[#1B4332]">{lastReport?.jumlahAyam ? ((parseInt(prodButir || "0") / lastReport.jumlahAyam) * 100).toFixed(1) : "0"}%</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white rounded-[24px] p-5 shadow-sm space-y-4">
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
                  <button type="button" onClick={() => setTotalPakan((prev) => Math.max(0, parseFloat(prev || "0") - 5).toFixed(1))} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">-</button>
                  <input type="number" step="0.1" value={totalPakan} onChange={(e) => setTotalPakan(e.target.value)} placeholder="0" className="flex-1 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-[16px] focus:border-[#40916C] outline-none text-[#1B4332] text-lg text-center" />
                  <button type="button" onClick={() => setTotalPakan((prev) => (parseFloat(prev || "0") + 5).toFixed(1))} className="w-12 h-12 bg-gray-100 rounded-[12px] font-bold text-[#1B4332] active:scale-95 transition-all">+</button>
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
          </div>
        )}
      </div>

      {/* Sticky Bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-6 pb-4 bg-gradient-to-t from-[#FDFCF7] via-[#FDFCF7] to-transparent pt-6">
        <div className="flex gap-3">
          {step > 1 && (
            <button onClick={handleBack} className="flex-1 h-14 bg-white border-2 border-gray-200 text-[#1B4332] rounded-[20px] font-bold active:scale-95 transition-all">Kembali</button>
          )}
          {step < 3 ? (
            <button onClick={handleNext} className="flex-1 h-14 bg-[#1B4332] text-white rounded-[20px] font-bold active:scale-95 transition-all shadow-lg">Lanjut</button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 h-14 bg-[#1B4332] text-white rounded-[20px] font-bold active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />Simpan
            </button>
          )}
        </div>
      </div>
    </PWALayout>
  );
}
