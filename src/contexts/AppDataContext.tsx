import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { format, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { pushAllToSupabase, pullAllFromSupabase, pushToSupabase } from "@/lib/supabase-sync";

export interface WarehouseRow {
  no: number;
  tanggal: string;
  addJagung: number;
  addKonsentrat: number;
  addDedak: number;
  stokJagung: number;
  stokKonsentrat: number;
  stokDedak: number;
  telurButir: number;
  telurTray: string;
}

export interface CustomSaleItem {
  name: string;
  qty: number;
  unit: string;
  harga: number;
}

export interface SalesRow {
  no: number;
  tanggal: string;
  ssTray: number;
  ssHarga: number;
  mTray: number;
  mHarga: number;
  lTray: number;
  lHarga: number;
  xlTray: number;
  xlHarga: number;
  xxlTray: number;
  xxlHarga: number;
  rejectTray: number;
  rejectHarga: number;
  ayam: number;
  ayamHarga: number;
  kohe: number;
  koheHarga: number;
  totalButir: number;
  totalRp: number;
  keterangan: string;
  customItems?: CustomSaleItem[];
}

export interface OperationalRow {
  no: number;
  tanggal: string;
  objek: string;
  jumlah: number;
  uom: string;
  hargaSatuan: number;
  totalHarga: number;
  keterangan: string;
}

export interface DailyReportRow {
  no: number;
  tanggal: string;
  usia: number;
  jumlahAyam: number;
  kematian: number;
  jualAyam: number;
  totalPakan: number;
  jagung: number;
  konsentrat: number;
  dedak: number;
  vitaminObat: string;
  prodButir: number;
  prodTray: string;
  reject: number;
  pctProduksi: string;
  keterangan: string;
}

export interface FinanceRow {
  no: number;
  tanggal: string;
  credit: number;
  debit: number;
  saldo: number;
  keterangan: string;
  sourceType?: "sale" | "operational";
  sourceNo?: number;
}

export interface FeedFormulaRow {
  id: string;
  name: string;
  corn_pct: number;
  concentrate_pct: number;
  bran_pct: number;
  is_active: boolean;
  created_at: string;
}

interface AppDataContextValue {
  warehouseEntries: WarehouseRow[];
  salesEntries: SalesRow[];
  operationalEntries: OperationalRow[];
  dailyReports: DailyReportRow[];
  financeEntries: FinanceRow[];
  feedFormulas: FeedFormulaRow[];
  addWarehouseEntry: (entry: WarehouseRow) => Promise<void>;
  updateWarehouseEntry: (no: number, entry: WarehouseRow) => Promise<void>;
  deleteWarehouseEntry: (no: number) => Promise<void>;
  addSale: (entry: SalesRow) => Promise<void>;
  updateSale: (no: number, entry: SalesRow) => Promise<void>;
  deleteSale: (no: number) => Promise<void>;
  addOperational: (entry: OperationalRow) => Promise<void>;
  updateOperational: (no: number, entry: OperationalRow) => Promise<void>;
  deleteOperational: (no: number) => Promise<void>;
  addDailyReport: (entry: DailyReportRow) => Promise<void>;
  updateDailyReport: (no: number, entry: DailyReportRow) => Promise<void>;
  deleteDailyReport: (no: number) => Promise<void>;
  addDailyReportsBulk: (entries: DailyReportRow[]) => Promise<void>;
  deleteFinanceEntry: (no: number) => Promise<void>;
  addFeedFormula: (entry: Omit<FeedFormulaRow, "id" | "created_at">) => void;
  activateFeedFormula: (id: string) => void;
  deleteFeedFormula: (id: string) => void;
}

const defaultData = {
  warehouseEntries: [
    { no: 1, tanggal: "12-May-24", addJagung: 1000, addKonsentrat: 700, addDedak: 65, stokJagung: 1000, stokKonsentrat: 700, stokDedak: 65, telurButir: 0, telurTray: "0.00" },
    { no: 2, tanggal: "14-May-24", addJagung: 0, addKonsentrat: 0, addDedak: 130, stokJagung: 1000, stokKonsentrat: 700, stokDedak: 162.51, telurButir: 0, telurTray: "0.00" },
    { no: 3, tanggal: "26-May-24", addJagung: 0, addKonsentrat: 0, addDedak: 260, stokJagung: 1000, stokKonsentrat: 700, stokDedak: 353.25, telurButir: 0, telurTray: "0.00" },
    { no: 4, tanggal: "06-Jun-24", addJagung: 350, addKonsentrat: 250, addDedak: 0, stokJagung: 511.02, stokKonsentrat: 353.39, stokDedak: 353.25, telurButir: 0, telurTray: "0.00" },
    { no: 5, tanggal: "08-Jun-24", addJagung: 0, addKonsentrat: 0, addDedak: 260, stokJagung: 511.02, stokKonsentrat: 353.39, stokDedak: 379.09, telurButir: 0, telurTray: "0.00" },
  ],
  salesEntries: [] as SalesRow[],
  operationalEntries: [
    { no: 1, tanggal: "07-Jul-24", objek: "Tray Telur", jumlah: 2, uom: "ball", hargaSatuan: 80000, totalHarga: 160000, keterangan: "" },
    { no: 2, tanggal: "07-Jul-24", objek: "KLK 36", jumlah: 6, uom: "sak", hargaSatuan: 510000, totalHarga: 3060000, keterangan: "" },
    { no: 3, tanggal: "07-Oct-24", objek: "Koleridin", jumlah: 2, uom: "botol", hargaSatuan: 10000, totalHarga: 20000, keterangan: "" },
    { no: 4, tanggal: "07-Dec-24", objek: "Vaksin ND IB Kill", jumlah: 1, uom: "botol", hargaSatuan: 420000, totalHarga: 420000, keterangan: "" },
  ],
  dailyReports: [
    { no: 1, tanggal: "12-May-24", usia: 15, jumlahAyam: 1009, kematian: 0, jualAyam: 0, totalPakan: 70.63, jagung: 31.78, konsentrat: 22.60, dedak: 16.24, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 2, tanggal: "13-May-24", usia: 15, jumlahAyam: 1009, kematian: 0, jualAyam: 0, totalPakan: 70.63, jagung: 31.78, konsentrat: 22.60, dedak: 16.24, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 3, tanggal: "14-May-24", usia: 15, jumlahAyam: 1009, kematian: 0, jualAyam: 0, totalPakan: 70.63, jagung: 31.78, konsentrat: 22.60, dedak: 16.24, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 4, tanggal: "19-May-24", usia: 16, jumlahAyam: 1009, kematian: 0, jualAyam: 0, totalPakan: 72.65, jagung: 32.69, konsentrat: 23.24, dedak: 16.70, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 5, tanggal: "20-May-24", usia: 16, jumlahAyam: 1009, kematian: 1, jualAyam: 0, totalPakan: 72.65, jagung: 32.69, konsentrat: 23.24, dedak: 16.70, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 6, tanggal: "26-May-24", usia: 17, jumlahAyam: 1008, kematian: 0, jualAyam: 0, totalPakan: 75.60, jagung: 34.02, konsentrat: 24.19, dedak: 17.38, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 7, tanggal: "02-Jun-24", usia: 18, jumlahAyam: 1008, kematian: 0, jualAyam: 0, totalPakan: 80.64, jagung: 36.28, konsentrat: 25.80, dedak: 18.54, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
    { no: 8, tanggal: "09-Jun-24", usia: 19, jumlahAyam: 1008, kematian: 0, jualAyam: 0, totalPakan: 85.68, jagung: 42.84, konsentrat: 28.27, dedak: 14.56, vitaminObat: "-", prodButir: 0, prodTray: "0.00", reject: 0, pctProduksi: "0.00%", keterangan: "" },
  ],
  financeEntries: [] as FinanceRow[],
  feedFormulas: [
    { id: "feed-formula-standard-1", name: "Formula Layer Standard Indonesia", corn_pct: 50, concentrate_pct: 35, bran_pct: 15, is_active: true, created_at: "2024-05-01T00:00:00Z" },
    { id: "feed-formula-premium-1", name: "Formula Layer Premium", corn_pct: 55, concentrate_pct: 30, bran_pct: 15, is_active: false, created_at: "2024-05-01T00:00:00Z" },
    { id: "feed-formula-grower-1", name: "Formula Grower (Penggemukan)", corn_pct: 45, concentrate_pct: 40, bran_pct: 15, is_active: false, created_at: "2024-05-01T00:00:00Z" },
    { id: "feed-formula-brooder-1", name: "Formula Brooder (Anak)", corn_pct: 40, concentrate_pct: 45, bran_pct: 15, is_active: false, created_at: "2024-05-01T00:00:00Z" },
  ],
};

const STORAGE_KEY = "candra-appdata-v1";

const loadStoredData = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const stored = loadStoredData();
  const [warehouseEntries, setWarehouseEntries] = useState<WarehouseRow[]>(stored?.warehouseEntries ?? defaultData.warehouseEntries);
  const [salesEntries, setSalesEntries] = useState<SalesRow[]>(stored?.salesEntries ?? defaultData.salesEntries);
  const [operationalEntries, setOperationalEntries] = useState<OperationalRow[]>(stored?.operationalEntries ?? defaultData.operationalEntries);
  const [dailyReports, setDailyReports] = useState<DailyReportRow[]>(stored?.dailyReports ?? defaultData.dailyReports);
  const [financeEntries, setFinanceEntries] = useState<FinanceRow[]>(stored?.financeEntries ?? defaultData.financeEntries);
  const [feedFormulas, setFeedFormulas] = useState<FeedFormulaRow[]>(stored?.feedFormulas ?? defaultData.feedFormulas);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const recomputeSaldo = (entries: FinanceRow[]) => {
    let saldo = 0;
    return entries.map((row) => {
      saldo += row.credit - row.debit;
      return { ...row, saldo };
    });
  };

  const nextNo = (rows: { no: number }[]) => rows.length > 0 ? Math.max(...rows.map((row) => row.no)) + 1 : 1;

  // Initial pull from Supabase on mount
  useEffect(() => {
    const loadFromSupabase = async () => {
      console.log("🔄 Loading data from Supabase...");
      const supabaseData = await pullAllFromSupabase();
      
      if (supabaseData) {
        // Only update if Supabase has data
        if (supabaseData.dailyReports.length > 0) {
          setDailyReports(supabaseData.dailyReports);
        }
        if (supabaseData.warehouseEntries.length > 0) {
          setWarehouseEntries(supabaseData.warehouseEntries);
        }
        if (supabaseData.salesEntries.length > 0) {
          setSalesEntries(supabaseData.salesEntries);
        }
        if (supabaseData.operationalEntries.length > 0) {
          setOperationalEntries(supabaseData.operationalEntries);
        }
        if (supabaseData.financeEntries.length > 0) {
          setFinanceEntries(supabaseData.financeEntries);
        }
        if (supabaseData.feedFormulas.length > 0) {
          setFeedFormulas(supabaseData.feedFormulas);
        }
        console.log("✅ Data loaded from Supabase");
      }
      setIsInitialLoad(false);
    };

    loadFromSupabase();
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload = {
      warehouseEntries,
      salesEntries,
      operationalEntries,
      dailyReports,
      financeEntries,
      feedFormulas,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }, [warehouseEntries, salesEntries, operationalEntries, dailyReports, financeEntries, feedFormulas]);

  // Auto-push to Supabase on every change (debounced)
  const pushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (isInitialLoad) return; // Skip initial load

    if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    pushTimerRef.current = setTimeout(async () => {
      console.log("📤 Auto-pushing to Supabase...");
      await pushAllToSupabase({
        dailyReports,
        warehouseEntries,
        salesEntries,
        operationalEntries,
        financeEntries,
        feedFormulas,
      });
    }, 2000); // Push after 2 seconds of inactivity

    return () => {
      if (pushTimerRef.current) clearTimeout(pushTimerRef.current);
    };
  }, [dailyReports, warehouseEntries, salesEntries, operationalEntries, financeEntries, feedFormulas, isInitialLoad]);

  // Listen for storage changes from other tabs/windows (PWA <-> Web sync)
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue);
          console.log("🔄 Data synced from another tab/window");
          setWarehouseEntries(newData.warehouseEntries || []);
          setSalesEntries(newData.salesEntries || []);
          setOperationalEntries(newData.operationalEntries || []);
          setDailyReports(newData.dailyReports || []);
          setFinanceEntries(newData.financeEntries || []);
          setFeedFormulas(newData.feedFormulas || []);
        } catch (error) {
          console.error("Failed to sync data:", error);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Real-time polling sync for APK <-> Web (every 3 seconds)
  // Now pulls from Supabase instead of just LocalStorage
  const lastSyncHashRef = useRef<string>("");
  useEffect(() => {
    if (typeof window === "undefined") return;

    const pollInterval = setInterval(async () => {
      try {
        // Pull from Supabase
        console.log("🔄 Polling Supabase for updates...");
        const supabaseData = await pullAllFromSupabase();
        
        if (!supabaseData) return;

        const currentData = {
          warehouseEntries,
          salesEntries,
          operationalEntries,
          dailyReports,
          financeEntries,
          feedFormulas,
        };

        // Compare data to avoid unnecessary updates
        const hasChanges = JSON.stringify(supabaseData) !== JSON.stringify(currentData);
        if (hasChanges) {
          console.log("🔄 Auto-sync: New data detected from Supabase");
          setWarehouseEntries(supabaseData.warehouseEntries || []);
          setSalesEntries(supabaseData.salesEntries || []);
          setOperationalEntries(supabaseData.operationalEntries || []);
          setDailyReports(supabaseData.dailyReports || []);
          setFinanceEntries(supabaseData.financeEntries || []);
          setFeedFormulas(supabaseData.feedFormulas || []);
        }
      } catch (error) {
        console.error("Polling sync error:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [warehouseEntries, salesEntries, operationalEntries, dailyReports, financeEntries, feedFormulas]);

  const applyDailyReportToWarehouse = async (entries: DailyReportRow[]) => {
    if (entries.length === 0) return;
    const current = [...warehouseEntries];
    let currentNo = nextNo(current);
    entries.forEach((entry) => {
      const last = current[current.length - 1];
      const lastJagung = last?.stokJagung ?? 0;
      const lastKonsentrat = last?.stokKonsentrat ?? 0;
      const lastDedak = last?.stokDedak ?? 0;
      const lastTelurButir = last?.telurButir ?? 0;
      const lastTelurTray = parseFloat(last?.telurTray ?? "0") || 0;
      const newEntry: WarehouseRow = {
        no: currentNo,
        tanggal: entry.tanggal,
        addJagung: -entry.jagung,
        addKonsentrat: -entry.konsentrat,
        addDedak: -entry.dedak,
        stokJagung: parseFloat((lastJagung - entry.jagung).toFixed(2)),
        stokKonsentrat: parseFloat((lastKonsentrat - entry.konsentrat).toFixed(2)),
        stokDedak: parseFloat((lastDedak - entry.dedak).toFixed(2)),
        telurButir: lastTelurButir + entry.prodButir,
        telurTray: (lastTelurTray + (parseFloat(entry.prodTray) || 0)).toFixed(2),
      };
      currentNo += 1;
      current.push(newEntry);
    });
    setWarehouseEntries(current);
  };

  const addWarehouseEntry = async (entry: WarehouseRow) => {
    setWarehouseEntries((prev) => [...prev, entry]);
  };

  const updateWarehouseEntry = async (no: number, entry: WarehouseRow) => {
    setWarehouseEntries((prev) => prev.map((row) => row.no === no ? entry : row));
  };

  const deleteWarehouseEntry = async (no: number) => {
    setWarehouseEntries((prev) => prev.filter((row) => row.no !== no));
  };

  const addSale = async (entry: SalesRow) => {
    setSalesEntries((prev) => [entry, ...prev]);
    const financeRow: FinanceRow = {
      no: nextNo(financeEntries),
      tanggal: entry.tanggal,
      credit: entry.totalRp,
      debit: 0,
      saldo: 0,
      keterangan: entry.keterangan.trim() || "Penjualan",
      sourceType: "sale",
      sourceNo: entry.no,
    };
    await addFinanceEntry(financeRow);
  };

  const updateSale = async (no: number, entry: SalesRow) => {
    setSalesEntries((prev) => prev.map((row) => row.no === no ? entry : row));
    setFinanceEntries((prev) => recomputeSaldo(prev.map((row) => {
      if (row.sourceType === "sale" && row.sourceNo === no) {
        return { ...row, tanggal: entry.tanggal, credit: entry.totalRp, keterangan: entry.keterangan.trim() || "Penjualan" };
      }
      return row;
    })));
  };

  const deleteSale = async (no: number) => {
    setSalesEntries((prev) => prev.filter((row) => row.no !== no));
    setFinanceEntries((prev) => recomputeSaldo(prev.filter((row) => !(row.sourceType === "sale" && row.sourceNo === no))));
  };

  const addOperational = async (entry: OperationalRow) => {
    setOperationalEntries((prev) => [entry, ...prev]);
    const financeRow: FinanceRow = {
      no: nextNo(financeEntries),
      tanggal: entry.tanggal,
      credit: 0,
      debit: entry.totalHarga,
      saldo: 0,
      keterangan: entry.keterangan.trim() || "Operasional",
      sourceType: "operational",
      sourceNo: entry.no,
    };
    await addFinanceEntry(financeRow);
  };

  const updateOperational = async (no: number, entry: OperationalRow) => {
    setOperationalEntries((prev) => prev.map((row) => row.no === no ? entry : row));
    setFinanceEntries((prev) => recomputeSaldo(prev.map((row) => {
      if (row.sourceType === "operational" && row.sourceNo === no) {
        return { ...row, tanggal: entry.tanggal, debit: entry.totalHarga, keterangan: entry.keterangan.trim() || "Operasional" };
      }
      return row;
    })));
  };

  const deleteOperational = async (no: number) => {
    setOperationalEntries((prev) => prev.filter((row) => row.no !== no));
    setFinanceEntries((prev) => recomputeSaldo(prev.filter((row) => !(row.sourceType === "operational" && row.sourceNo === no))));
  };

  const addDailyReport = async (entry: DailyReportRow) => {
    setDailyReports((prev) => [...prev, entry]);
    await applyDailyReportToWarehouse([entry]);
  };

  const updateDailyReport = async (no: number, entry: DailyReportRow) => {
    const oldEntry = dailyReports.find((row) => row.no === no);
    setDailyReports((prev) => prev.map((row) => row.no === no ? entry : row));
    
    // Update warehouse stock: reverse old entry and apply new entry
    if (oldEntry) {
      setWarehouseEntries((prev) => {
        const current = [...prev];
        // Find warehouse entry that was created for this daily report
        const warehouseIndex = current.findIndex((w) => w.tanggal === oldEntry.tanggal && w.addJagung === -oldEntry.jagung);
        
        if (warehouseIndex >= 0) {
          // Reverse the old stock deduction
          const reversedStocks = {
            stokJagung: current[warehouseIndex].stokJagung + oldEntry.jagung,
            stokKonsentrat: current[warehouseIndex].stokKonsentrat + oldEntry.konsentrat,
            stokDedak: current[warehouseIndex].stokDedak + oldEntry.dedak,
            telurButir: current[warehouseIndex].telurButir - oldEntry.prodButir,
            telurTray: (parseFloat(current[warehouseIndex].telurTray) - parseFloat(oldEntry.prodTray)).toFixed(2),
          };
          
          // Apply new stock deduction
          current[warehouseIndex] = {
            ...current[warehouseIndex],
            tanggal: entry.tanggal,
            addJagung: -entry.jagung,
            addKonsentrat: -entry.konsentrat,
            addDedak: -entry.dedak,
            stokJagung: parseFloat((reversedStocks.stokJagung - entry.jagung).toFixed(2)),
            stokKonsentrat: parseFloat((reversedStocks.stokKonsentrat - entry.konsentrat).toFixed(2)),
            stokDedak: parseFloat((reversedStocks.stokDedak - entry.dedak).toFixed(2)),
            telurButir: reversedStocks.telurButir + entry.prodButir,
            telurTray: (parseFloat(reversedStocks.telurTray) + parseFloat(entry.prodTray)).toFixed(2),
          };
          
          // Recalculate all subsequent warehouse entries
          for (let i = warehouseIndex + 1; i < current.length; i++) {
            const prev = current[i - 1];
            current[i] = {
              ...current[i],
              stokJagung: parseFloat((prev.stokJagung + current[i].addJagung).toFixed(2)),
              stokKonsentrat: parseFloat((prev.stokKonsentrat + current[i].addKonsentrat).toFixed(2)),
              stokDedak: parseFloat((prev.stokDedak + current[i].addDedak).toFixed(2)),
            };
          }
        }
        
        return current;
      });
    }
  };

  const deleteDailyReport = async (no: number) => {
    const oldEntry = dailyReports.find((row) => row.no === no);
    setDailyReports((prev) => prev.filter((row) => row.no !== no));
    
    // Reverse warehouse stock deduction when deleting daily report
    if (oldEntry) {
      setWarehouseEntries((prev) => {
        const current = [...prev];
        // Find warehouse entry that was created for this daily report
        const warehouseIndex = current.findIndex((w) => w.tanggal === oldEntry.tanggal && w.addJagung === -oldEntry.jagung);
        
        if (warehouseIndex >= 0) {
          // Remove the warehouse entry or reverse the stock
          current.splice(warehouseIndex, 1);
          
          // Recalculate all subsequent warehouse entries
          for (let i = warehouseIndex; i < current.length; i++) {
            const prev = i > 0 ? current[i - 1] : null;
            if (prev) {
              current[i] = {
                ...current[i],
                stokJagung: parseFloat((prev.stokJagung + current[i].addJagung).toFixed(2)),
                stokKonsentrat: parseFloat((prev.stokKonsentrat + current[i].addKonsentrat).toFixed(2)),
                stokDedak: parseFloat((prev.stokDedak + current[i].addDedak).toFixed(2)),
              };
            }
          }
        }
        
        return current;
      });
    }
  };

  const addDailyReportsBulk = async (entries: DailyReportRow[]) => {
    if (entries.length === 0) return;
    setDailyReports((prev) => [...prev, ...entries]);
    await applyDailyReportToWarehouse(entries);
  };

  const addFinanceEntry = async (entry: FinanceRow) => {
    setFinanceEntries((prev) => recomputeSaldo([...prev, entry]));
  };

  const deleteFinanceEntry = async (no: number) => {
    setFinanceEntries((prev) => recomputeSaldo(prev.filter((row) => row.no !== no)));
  };

  const addFeedFormula = (entry: Omit<FeedFormulaRow, "id" | "created_at">) => {
    const id = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `feed-formula-${Date.now()}-${Math.round(Math.random() * 10000)}`;
    const createdAt = new Date().toISOString();
    setFeedFormulas((prev) => {
      const hasActive = prev.some((row) => row.is_active);
      const nextEntry = { ...entry, id, created_at: createdAt, is_active: hasActive ? entry.is_active : true };
      const updated = [...prev, nextEntry].map((row) => row.id === nextEntry.id ? nextEntry : row);
      if (nextEntry.is_active) {
        return updated.map((row) => row.id === nextEntry.id ? row : { ...row, is_active: false });
      }
      return updated;
    });
  };

  const activateFeedFormula = (id: string) => {
    setFeedFormulas((prev) => prev.map((row) => ({ ...row, is_active: row.id === id })));
  };

  const deleteFeedFormula = (id: string) => {
    setFeedFormulas((prev) => {
      const filtered = prev.filter((row) => row.id !== id);
      const hasActive = filtered.some((row) => row.is_active);
      if (!hasActive && filtered.length > 0) {
        return filtered.map((row, index) => index === 0 ? { ...row, is_active: true } : row);
      }
      return filtered;
    });
  };

  const value: AppDataContextValue = {
    warehouseEntries,
    salesEntries,
    operationalEntries,
    dailyReports,
    financeEntries,
    feedFormulas,
    addWarehouseEntry,
    updateWarehouseEntry,
    deleteWarehouseEntry,
    addSale,
    updateSale,
    deleteSale,
    addOperational,
    updateOperational,
    deleteOperational,
    addDailyReport,
    updateDailyReport,
    deleteDailyReport,
    addDailyReportsBulk,
    deleteFinanceEntry,
    addFeedFormula,
    activateFeedFormula,
    deleteFeedFormula,
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}

export const useAppData = () => {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData harus digunakan di dalam AppDataProvider");
  }
  return ctx;
};
