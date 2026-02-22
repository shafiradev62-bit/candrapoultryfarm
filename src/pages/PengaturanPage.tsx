import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Settings, Beaker, Plus, Check, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/contexts/AppDataContext";
import { useAuth } from "@/contexts/AuthContext";

const PengaturanPage = () => {
  const { toast } = useToast();
  const { feedFormulas, addFeedFormula, activateFeedFormula, deleteFeedFormula } = useAppData();
  const { role, setUserRole } = useAuth();
  const [name, setName] = useState("");
  const [cornPct, setCornPct] = useState("45");
  const [concPct, setConcPct] = useState("33");
  const [branPct, setBranPct] = useState("22");

  const handleCreate = async () => {
    const corn = parseFloat(cornPct);
    const conc = parseFloat(concPct);
    const bran = parseFloat(branPct);
    if (corn + conc + bran !== 100) {
      toast({ title: "Error", description: "Total persentase harus 100%", variant: "destructive" });
      return;
    }
    if (!name.trim()) {
      toast({ title: "Error", description: "Nama formulasi wajib diisi", variant: "destructive" });
      return;
    }
    addFeedFormula({
      name: name.trim(),
      corn_pct: corn,
      concentrate_pct: conc,
      bran_pct: bran,
      is_active: feedFormulas.length === 0,
    });
    toast({ title: "Berhasil", description: "Formulasi pakan berhasil dibuat" });
    setName(""); setCornPct("45"); setConcPct("33"); setBranPct("22");
  };

  const handleActivate = async (id: string) => {
    activateFeedFormula(id);
    toast({ title: "Berhasil", description: "Formulasi diaktifkan" });
  };

  const handleDelete = async (id: string) => {
    deleteFeedFormula(id);
    toast({ title: "Berhasil", description: "Formulasi dihapus" });
  };

  const handleRoleChange = async (nextRole: "owner" | "worker") => {
    try {
      await setUserRole(nextRole);
      toast({ title: "Role diperbarui", description: `Mode ${nextRole === "owner" ? "Owner" : "Worker"} aktif` });
    } catch (error) {
      toast({ title: "Error", description: "Gagal memperbarui role", variant: "destructive" });
    }
  };

  const totalPct = parseFloat(cornPct || "0") + parseFloat(concPct || "0") + parseFloat(branPct || "0");

  return (
    <AppLayout title="Pengaturan">
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-primary">Pengaturan Sistem</h1>
          <p className="text-sm text-muted-foreground">CANDRA POULTRY FARM — Konfigurasi formulasi pakan dan sistem</p>
        </div>

        <Tabs defaultValue="formula" className="space-y-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="formula" className="data-[state=active]:bg-card">
              <Beaker className="h-4 w-4 mr-2" />
              Formulasi Pakan
            </TabsTrigger>
            <TabsTrigger value="profil" className="data-[state=active]:bg-card">
              <Settings className="h-4 w-4 mr-2" />
              Profil Farm
            </TabsTrigger>
          </TabsList>

          <TabsContent value="formula" className="space-y-6">
            {/* Create New Formula */}
            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Buat Formulasi Pakan Baru
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Nama Formulasi</Label>
                  <Input placeholder="Contoh: Formulasi A" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Jagung (%)</Label>
                  <Input type="number" value={cornPct} onChange={(e) => setCornPct(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Konsentrat (%)</Label>
                  <Input type="number" value={concPct} onChange={(e) => setConcPct(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Dedak (%)</Label>
                  <Input type="number" value={branPct} onChange={(e) => setBranPct(e.target.value)} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className={`text-sm font-medium ${totalPct === 100 ? "text-green-600" : "text-destructive"}`}>
                  Total: {totalPct}% {totalPct === 100 ? "✓" : "(harus 100%)"}
                </p>
                <Button onClick={handleCreate} disabled={totalPct !== 100} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Simpan Formulasi
                </Button>
              </div>
            </div>

            {/* Existing Formulas */}
            <div className="bg-card rounded-lg border overflow-hidden">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-primary">Daftar Formulasi Pakan</h3>
              </div>
              {feedFormulas.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Beaker className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  <p>Belum ada formulasi pakan. Buat formulasi pertama di atas.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-secondary">
                    <TableRow>
                      <TableHead className="text-xs font-semibold text-primary">Nama</TableHead>
                      <TableHead className="text-xs font-semibold text-primary text-right">Jagung (%)</TableHead>
                      <TableHead className="text-xs font-semibold text-primary text-right">Konsentrat (%)</TableHead>
                      <TableHead className="text-xs font-semibold text-primary text-right">Dedak (%)</TableHead>
                      <TableHead className="text-xs font-semibold text-primary text-center">Status</TableHead>
                      <TableHead className="text-xs font-semibold text-primary">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[...feedFormulas].sort((a, b) => b.created_at.localeCompare(a.created_at)).map((f) => (
                      <TableRow key={f.id} className="hover:bg-secondary/50">
                        <TableCell className="text-sm font-medium">{f.name}</TableCell>
                        <TableCell className="text-sm text-right">{f.corn_pct}%</TableCell>
                        <TableCell className="text-sm text-right">{f.concentrate_pct}%</TableCell>
                        <TableCell className="text-sm text-right">{f.bran_pct}%</TableCell>
                        <TableCell className="text-center">
                          {f.is_active ? (
                            <Badge className="bg-green-600 text-xs">Aktif</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Nonaktif</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!f.is_active && (
                              <Button variant="ghost" size="sm" className="h-8 text-green-600" onClick={() => handleActivate(f.id)}>
                                <Check className="h-3 w-3 mr-1" /> Aktifkan
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 text-destructive" onClick={() => handleDelete(f.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profil" className="space-y-4">
            <div className="bg-card rounded-lg border p-5 space-y-4">
              <h3 className="font-semibold text-primary">Role Switcher</h3>
              <div className="space-y-2">
                <Label>Mode Tampilan</Label>
                <Select value={role ?? undefined} onValueChange={(value) => handleRoleChange(value as "owner" | "worker")}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Pilih role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner View</SelectItem>
                    <SelectItem value="worker">Worker View</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-card rounded-lg border p-5">
              <h3 className="font-semibold text-primary mb-4">Profil Peternakan</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Nama Peternakan</Label>
                  <Input value="CANDRA POULTRY FARM" readOnly className="bg-secondary" />
                </div>
                <div className="space-y-2">
                  <Label>Alamat</Label>
                  <Input value="Jl. Pendakian Gunung Kerinci (R10), Kec. Kayu Aro Barat, Kab. Kerinci, Jambi" readOnly className="bg-secondary" />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default PengaturanPage;
