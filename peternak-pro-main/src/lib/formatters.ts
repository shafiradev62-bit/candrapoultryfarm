import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";

export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("id-ID").format(num);
};

export const formatIndonesianDate = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMMM yyyy", { locale: id });
};

export const formatDateTime = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd MMMM yyyy HH:mm", { locale: id });
};

export const formatTime = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "HH:mm", { locale: id });
};

export const formatShortDate = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "dd/MM/yyyy", { locale: id });
};

export const formatPercentage = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
};

export const formatDecimal = (value: number, decimals: number = 2) => {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
};

export const formatWeight = (weight: number, unit: string = "kg") => {
  return `${formatDecimal(weight)} ${unit}`;
};

export const formatEggCount = (count: number) => {
  return `${formatNumber(count)} butir`;
};

export const translateTerm = (term: string): string => {
  const translations: Record<string, string> = {
    // Farming Terms
    "Hen Day Production": "HDP (Hen Day Production)",
    "Feed Conversion Ratio": "FCR (Feed Conversion Ratio)",
    "Mortality": "Mortalitas",
    "Population": "Populasi",
    "Eggs": "Telur",
    "Broken Eggs": "Telur pecah",
    "Discard": "Afkir",
    "Cage": "Sangkar",
    "Floor": "Lantai",
    "Doc": "DOC",
    "Brooding": "Brooding",
    "Grower": "Grower",
    "Layer": "Layer",
    "Depopulation": "Depopulasi",
    
    // Business Terms
    "Purchase Order": "Purchase Order",
    "Sales Order": "Sales Order",
    "Invoice": "Invoice",
    "Inventory": "Inventori",
    "Stock": "Stok",
    "Transfer": "Mutasi",
    "Adjustment": "Penyesuaian",
    "Customer": "Pelanggan",
    "Supplier": "Pemasok",
    
    // UI Terms
    "Dashboard": "Dasbor",
    "Reports": "Laporan",
    "Settings": "Pengaturan",
    "Profile": "Profil",
    "Logout": "Keluar",
    "Login": "Masuk",
    "Save": "Simpan",
    "Cancel": "Batal",
    "Delete": "Hapus",
    "Edit": "Ubah",
    "View": "Lihat",
    "Search": "Cari",
    "Filter": "Filter",
    "Export": "Ekspor",
    "Print": "Cetak",
    "Download": "Unduh",
    "Add": "Tambah",
    "Update": "Perbarui",
    "Create": "Buat",
    "Submit": "Kirim",
    "Approve": "Setujui",
    "Reject": "Tolak",
    "Pending": "Menunggu",
    "Approved": "Disetujui",
    "Rejected": "Ditolak",
    "Draft": "Draft",
    "Active": "Aktif",
    "Inactive": "Tidak Aktif"
  };
  
  return translations[term] || term;
};

export const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { text: string; variant: string }> = {
    "draft": { text: "Draft", variant: "secondary" },
    "submitted": { text: "Dikirim", variant: "default" },
    "approved": { text: "Disetujui", variant: "success" },
    "rejected": { text: "Ditolak", variant: "destructive" },
    "active": { text: "Aktif", variant: "success" },
    "inactive": { text: "Tidak Aktif", variant: "secondary" },
    "pending": { text: "Menunggu", variant: "warning" },
    "completed": { text: "Selesai", variant: "success" },
    "cancelled": { text: "Dibatalkan", variant: "destructive" }
  };
  
  return statusMap[status.toLowerCase()] || { text: status, variant: "secondary" };
};