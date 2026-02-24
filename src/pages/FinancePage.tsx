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
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Download, FileDown, Trash2 } from "lucide-react";
import { exportToExcel } from "@/lib/exportExcel";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { jsPDF } from "jspdf";
import { endOfMonth, format, isValid, parse, startOfMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";

const FinancePage = () => {
  const { toast } = useToast();
  const { financeEntries, deleteFinanceEntry, dailyReports } = useAppData();
  const [preparedBy, setPreparedBy] = useState(() => localStorage.getItem("candra-pdf-prepared-by") ?? "");
  const [approvedBy, setApprovedBy] = useState(() => localStorage.getItem("candra-pdf-approved-by") ?? "");
  const [preparedSignature, setPreparedSignature] = useState(() => localStorage.getItem("candra-pdf-prepared-signature") ?? "");
  const [approvedSignature, setApprovedSignature] = useState(() => localStorage.getItem("candra-pdf-approved-signature") ?? "");

  useEffect(() => {
    localStorage.setItem("candra-pdf-prepared-by", preparedBy);
  }, [preparedBy]);

  useEffect(() => {
    localStorage.setItem("candra-pdf-approved-by", approvedBy);
  }, [approvedBy]);

  useEffect(() => {
    localStorage.setItem("candra-pdf-prepared-signature", preparedSignature);
  }, [preparedSignature]);

  useEffect(() => {
    localStorage.setItem("candra-pdf-approved-signature", approvedSignature);
  }, [approvedSignature]);

  const parseReportDate = (value: string) => {
    const parsed = parse(value, "dd-MMM-yy", new Date());
    if (isValid(parsed)) return parsed;
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  };

  const monthSummary = useMemo(() => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const withinMonth = (value: string) => {
      const date = parseReportDate(value);
      if (!date) return false;
      return date >= start && date <= end;
    };
    const monthlyDaily = dailyReports.filter((row) => withinMonth(row.tanggal));
    const monthlyFinance = financeEntries.filter((row) => withinMonth(row.tanggal));
    return {
      periodLabel: format(start, "MMMM yyyy"),
      totalEggs: monthlyDaily.reduce((sum, row) => sum + row.prodButir, 0),
      totalFeed: monthlyDaily.reduce((sum, row) => sum + row.totalPakan, 0),
      netProfit: monthlyFinance.reduce((sum, row) => sum + row.credit - row.debit, 0),
    };
  }, [dailyReports, financeEntries]);

  const handleExport = () => {
    exportToExcel(financeEntries.map(r => ({
      "No.": r.no,
      "Tanggal": r.tanggal,
      "Credit (Rp)": r.credit,
      "Debit (Rp)": r.debit,
      "Saldo (Rp)": r.saldo,
      "Keterangan": r.keterangan,
    })), "Laporan_Keuangan", "Finance");
    toast({ title: "Export berhasil", description: "File Excel telah didownload." });
  };

  const handleDownloadPdf = async () => {
    try {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = "/logo.png";
      await logo.decode().catch(() => null);
      if (logo.complete && logo.naturalWidth > 0) {
        doc.addImage(logo, "PNG", 14, 10, 18, 18);
      }
      doc.setFontSize(14);
      doc.text("Candra Poultry Farm", 36, 18);
      doc.setFontSize(10);
      doc.text("Jl. Pendakian Gunung Kerinci (R10), Kec. Kayu Aro Barat, Kab. Kerinci, Jambi", 36, 24);
      doc.text(`Periode: ${monthSummary.periodLabel}`, 36, 30);
      doc.setFontSize(12);
      doc.text("Ringkasan Bulanan", 14, 44);
      doc.setFontSize(10);
      doc.text(`Total Produksi Telur: ${monthSummary.totalEggs.toLocaleString("id-ID")} butir`, 14, 54);
      doc.text(`Total Pakan Terpakai: ${monthSummary.totalFeed.toLocaleString("id-ID")} kg`, 14, 62);
      doc.text(`Net Profit: Rp ${Math.round(monthSummary.netProfit).toLocaleString("id-ID")}`, 14, 70);
      doc.line(14, 84, 90, 84);
      doc.line(120, 84, 196, 84);
      doc.text("Dibuat Oleh", 14, 90);
      doc.text("Disetujui Oleh", 120, 90);
      if (preparedSignature) doc.text(preparedSignature, 14, 102);
      if (approvedSignature) doc.text(approvedSignature, 120, 102);
      if (preparedBy) doc.text(preparedBy, 14, 112);
      if (approvedBy) doc.text(approvedBy, 120, 112);
      doc.save(`Monthly_Report_${monthSummary.periodLabel.replace(/\s/g, "_")}.pdf`);
    } catch (error) {
      toast({ title: "Error", description: "Gagal membuat PDF", variant: "destructive" });
    }
  };

  const latestSaldo = financeEntries.length > 0 ? financeEntries[financeEntries.length - 1].saldo : 0;
  const displayEntries = [...financeEntries].sort((a, b) => b.no - a.no);

  const handleDelete = async (no: number) => {
    try {
      await deleteFinanceEntry(no);
      toast({ title: "Berhasil", description: "Transaksi keuangan dihapus" });
    } catch (error) {
      toast({ title: "Error", description: "Gagal menghapus transaksi keuangan", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Finance">
      <div className="p-4 lg:p-6">
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-primary">Laporan Keuangan</h1>
            <p className="text-sm text-muted-foreground">
              CANDRA POULTRY FARM — Monitoring cash flow harian
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" className="border-primary/30" onClick={handleDownloadPdf}>
              <FileDown className="h-4 w-4 mr-2" />
              Download Monthly Report (PDF)
            </Button>
            <Button variant="outline" className="border-primary/30" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg border p-4">
          <h2 className="text-sm font-semibold text-primary mb-3">Identitas & Tanda Tangan PDF</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nama Pembuat</Label>
              <Input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} placeholder="Nama pembuat laporan" />
            </div>
            <div className="space-y-2">
              <Label>Nama Penyetuju</Label>
              <Input value={approvedBy} onChange={(e) => setApprovedBy(e.target.value)} placeholder="Nama penyetuju" />
            </div>
            <div className="space-y-2">
              <Label>TTD Pembuat</Label>
              <Input value={preparedSignature} onChange={(e) => setPreparedSignature(e.target.value)} placeholder="Contoh: (ttd) Andi" />
            </div>
            <div className="space-y-2">
              <Label>TTD Penyetuju</Label>
              <Input value={approvedSignature} onChange={(e) => setApprovedSignature(e.target.value)} placeholder="Contoh: (ttd) Budi" />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Saldo Terakhir</p>
            <p className="text-xl font-semibold text-primary">Rp {latestSaldo.toLocaleString("id-ID")}</p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Total Credit</p>
            <p className="text-xl font-semibold text-green-600">
              Rp {financeEntries.reduce((s, r) => s + r.credit, 0).toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-card rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">Total Debit</p>
            <p className="text-xl font-semibold text-destructive">
              Rp {financeEntries.reduce((s, r) => s + r.debit, 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader className="bg-secondary">
              <TableRow>
                <TableHead className="text-xs font-semibold text-primary">No.</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Tanggal</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Credit (Rp)</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Debit (Rp)</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-right">Saldo (Rp)</TableHead>
                <TableHead className="text-xs font-semibold text-primary">Keterangan</TableHead>
                <TableHead className="text-xs font-semibold text-primary text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayEntries.length > 0 ? displayEntries.map((row) => (
                <TableRow key={row.no} className="hover:bg-secondary/50">
                  <TableCell className="text-sm tabular-nums">{row.no}</TableCell>
                  <TableCell className="text-sm">{row.tanggal}</TableCell>
                  <TableCell className="text-sm text-right text-green-600 tabular-nums">
                    {row.credit > 0 ? `Rp ${row.credit.toLocaleString("id-ID")}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-right text-destructive tabular-nums">
                    {row.debit > 0 ? `Rp ${row.debit.toLocaleString("id-ID")}` : "-"}
                  </TableCell>
                  <TableCell className="text-sm text-right font-medium tabular-nums">
                    Rp {row.saldo.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{row.keterangan}</TableCell>
                  <TableCell className="text-sm text-center">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus transaksi keuangan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Transaksi tanggal {row.tanggal} akan dihapus dari laporan.
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
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-sm text-muted-foreground text-center">
                    Belum ada transaksi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      </div>
    </AppLayout>
  );
};

export default FinancePage;
