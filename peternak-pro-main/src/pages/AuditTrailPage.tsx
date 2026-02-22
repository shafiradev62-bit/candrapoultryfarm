import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Download, 
  Filter,
  User,
  Database
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function AuditTrailPage() {
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    module: "",
    user: "",
    action: "",
    dateFrom: "",
    dateTo: ""
  });

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("audit_trail")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.module) {
        query = query.eq("table_name", filters.module);
      }
      if (filters.user) {
        query = query.eq("user_email", filters.user);
      }
      if (filters.action) {
        query = query.eq("action", filters.action);
      }
      if (filters.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAuditLogs(data || []);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [filters]);

  const exportToExcel = async () => {
    // Will implement Excel export functionality later
    alert("Export ke Excel akan diimplementasikan");
  };

  const modules = [
    "flocks", "daily_records", "inventory_transactions", 
    "purchase_orders", "invoices", "kandang", "customers", "products", "sales_orders"
  ];

  const actions = ["INSERT", "UPDATE", "DELETE"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Trail</h1>
        <Button onClick={exportToExcel}>
          <Download className="mr-2 h-4 w-4" />
          Ekspor ke Excel
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filter Audit
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="text-sm font-medium">Modul</label>
            <Select value={filters.module} onValueChange={(v) => setFilters({...filters, module: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih modul" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua</SelectItem>
                {modules.map(mod => (
                  <SelectItem key={mod} value={mod}>{mod}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Pengguna</label>
            <Input 
              placeholder="Email pengguna" 
              value={filters.user}
              onChange={(e) => setFilters({...filters, user: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Aksi</label>
            <Select value={filters.action} onValueChange={(v) => setFilters({...filters, action: v})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Semua</SelectItem>
                {actions.map(action => (
                  <SelectItem key={action} value={action}>{action}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium">Tanggal Dari</label>
            <Input 
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Tanggal Sampai</label>
            <Input 
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Log Audit ({auditLogs.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">Loading...</div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Modul</TableHead>
                    <TableHead>Aksi</TableHead>
                    <TableHead>Pengguna</TableHead>
                    <TableHead>Detail</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.created_at), "dd MMMM yyyy HH:mm", { locale: id })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Database className="mr-2 h-4 w-4" />
                          {log.table_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          log.action === 'INSERT' ? 'bg-green-100 text-green-800' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          {log.user_email || 'System'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <details className="text-sm">
                          <summary className="cursor-pointer hover:underline">
                            Lihat perubahan
                          </summary>
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-red-600">Sebelum</h4>
                                <pre className="text-xs overflow-auto max-h-32">
                                  {JSON.stringify(log.old_values, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <h4 className="font-medium text-green-600">Sesudah</h4>
                                <pre className="text-xs overflow-auto max-h-32">
                                  {JSON.stringify(log.new_values, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </div>
                        </details>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}