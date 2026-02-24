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
import { CalendarIcon, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MobileInput() {
  const { toast } = useToast();
  const { dailyReports, addDailyReport, warehouseEntries, feedFormulas } = useAppData();
  const [step, setStep] = useState(1);

  // Form state
  const [tanggal, setTanggal] = useState<Date | undefined>(new Date());
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
    if (step === 1) {
      if (!tanggal) {
        toast({ title: "Error", description: "Tanggal wajib diisi", variant: "destructive" });
        return;
      }
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

    // Calculate feed breakdown
    const jagungNeeded = (totalPakanValue * formula.corn_pct) / 100;
    const konsentratNeeded = (totalPakanValue * formula.concentrate_pct) / 100;
    const dedakNeeded = (totalPakanValue * formula.bran_pct) / 100;

    // Validate stock
    if (currentStock) {
      if (jagungNeeded > currentStock.stokJagung) {
        toast({
          title: "Stok tidak cukup",
          description: `Jagung tidak cukup. Tersedia: ${currentStock.stokJagung} kg, Dibutuhkan: ${jagungNeeded.toFixed(2)} kg`,
          variant: "destructive",
        });
        return;
      }
      if (konsentratNeeded > currentStock.stokKonsentrat) {
        toast({
          title: "Stok tidak cukup",
          description: `Konsentrat tidak cukup. Tersedia: ${currentStock.stokKonsentrat} kg, Dibutuhkan: ${konsentratNeeded.toFixed(2)} kg`,
          variant: "destructive",
        });
        return;
      }
      if (dedakNeeded > currentStock.stokDedak) {
        toast({
          title: "Stok tidak cukup",
          description: `Dedak tidak cukup. Tersedia: ${currentStock.stokDedak} kg, Dibutuhkan: ${dedakNeeded.toFixed(2)} kg`,
          variant: "destructive",
        });
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
        tanggal: format(tanggal, "dd-MMM-yy"),
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
      setTanggal(new Date());
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
    <MobileLayout title="Input Harian">
      <div className="p-4 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {step > s ? <Check className="h-5 w-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={cn(
                    "flex-1 h-1 mx-2 transition-colors",
                    step > s ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Info Ayam */}
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 1: Info Ayam</h2>

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

            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Populasi Saat Ini</p>
              <p className="text-2xl font-bold text-primary">
                {lastReport?.jumlahAyam || 0} ekor
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="kematian">Ayam Mati</Label>
              <Input
                id="kematian"
                type="number"
                placeholder="0"
                value={kematian}
                onChange={(e) => setKematian(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jualAyam">Ayam Dijual</Label>
              <Input
                id="jualAyam"
                type="number"
                placeholder="0"
                value={jualAyam}
                onChange={(e) => setJualAyam(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            {(kematian || jualAyam) && (
              <div className="bg-primary/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground mb-1">Populasi Baru</p>
                <p className="text-2xl font-bold text-primary">
                  {(lastReport?.jumlahAyam || 0) -
                    parseInt(kematian || "0") -
                    parseInt(jualAyam || "0")}{" "}
                  ekor
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Produksi Telur */}
        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 2: Produksi Telur</h2>

            <div className="space-y-2">
              <Label htmlFor="prodButir">Produksi Telur (Butir)</Label>
              <Input
                id="prodButir"
                type="number"
                placeholder="0"
                value={prodButir}
                onChange={(e) => setProdButir(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reject">Telur Reject</Label>
              <Input
                id="reject"
                type="number"
                placeholder="0"
                value={reject}
                onChange={(e) => setReject(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            {prodButir && (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-900">
                  <p className="text-xs text-muted-foreground mb-1">Telur Bagus</p>
                  <p className="text-xl font-bold text-green-600">
                    {parseInt(prodButir || "0") - parseInt(reject || "0")} butir
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {((parseInt(prodButir || "0") - parseInt(reject || "0")) / 30).toFixed(2)} tray
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-900">
                  <p className="text-xs text-muted-foreground mb-1">% Produksi</p>
                  <p className="text-xl font-bold text-orange-600">
                    {lastReport?.jumlahAyam
                      ? ((parseInt(prodButir || "0") / lastReport.jumlahAyam) * 100).toFixed(1)
                      : "0"}
                    %
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Pakan */}
        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Step 3: Pakan</h2>

            <div className="space-y-2">
              <Label>Formula Pakan</Label>
              <Select value={selectedFormula} onValueChange={setSelectedFormula}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Pilih formula" />
                </SelectTrigger>
                <SelectContent>
                  {activeFormulas.map((formula) => (
                    <SelectItem key={formula.id} value={formula.id}>
                      {formula.name} ({formula.corn_pct}% / {formula.concentrate_pct}% /{" "}
                      {formula.bran_pct}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalPakan">Total Pakan (kg)</Label>
              <Input
                id="totalPakan"
                type="number"
                step="0.01"
                placeholder="0"
                value={totalPakan}
                onChange={(e) => setTotalPakan(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            {selectedFormula && totalPakan && (
              <div className="bg-muted/50 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold mb-2">Komposisi Pakan:</p>
                {(() => {
                  const formula = feedFormulas.find((f) => f.id === selectedFormula);
                  const total = parseFloat(totalPakan);
                  if (!formula) return null;

                  const jagung = (total * formula.corn_pct) / 100;
                  const konsentrat = (total * formula.concentrate_pct) / 100;
                  const dedak = (total * formula.bran_pct) / 100;

                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Jagung ({formula.corn_pct}%)</span>
                        <span className="font-medium">{jagung.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Konsentrat ({formula.concentrate_pct}%)</span>
                        <span className="font-medium">{konsentrat.toFixed(2)} kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Dedak ({formula.bran_pct}%)</span>
                        <span className="font-medium">{dedak.toFixed(2)} kg</span>
                      </div>

                      {currentStock && (
                        <div className="mt-3 pt-3 border-t space-y-1">
                          <p className="text-xs font-semibold mb-2">Stok Tersedia:</p>
                          <div
                            className={cn(
                              "flex justify-between text-xs",
                              jagung > currentStock.stokJagung && "text-destructive font-semibold"
                            )}
                          >
                            <span>Jagung</span>
                            <span>{currentStock.stokJagung.toFixed(2)} kg</span>
                          </div>
                          <div
                            className={cn(
                              "flex justify-between text-xs",
                              konsentrat > currentStock.stokKonsentrat &&
                                "text-destructive font-semibold"
                            )}
                          >
                            <span>Konsentrat</span>
                            <span>{currentStock.stokKonsentrat.toFixed(2)} kg</span>
                          </div>
                          <div
                            className={cn(
                              "flex justify-between text-xs",
                              dedak > currentStock.stokDedak && "text-destructive font-semibold"
                            )}
                          >
                            <span>Dedak</span>
                            <span>{currentStock.stokDedak.toFixed(2)} kg</span>
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="vitaminObat">Vitamin/Obat (Opsional)</Label>
              <Input
                id="vitaminObat"
                type="text"
                placeholder="Contoh: Vitamin B Complex"
                value={vitaminObat}
                onChange={(e) => setVitaminObat(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keterangan">Keterangan (Opsional)</Label>
              <Input
                id="keterangan"
                type="text"
                placeholder="Catatan tambahan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="h-12 rounded-xl text-base"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 rounded-xl"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Kembali
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1 h-12 rounded-xl">
              Lanjut
              <ChevronRight className="h-5 w-5 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1 h-12 rounded-xl">
              <Check className="h-5 w-5 mr-2" />
              Simpan Laporan
            </Button>
          )}
        </div>
      </div>
    </MobileLayout>
  );
}
