import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ApprovalDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      // Get user role
      const { data: { user } } = await supabase.auth.getUser();
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id);
      
      const role = roles?.[0]?.role || "";
      setUserRole(role);

      let query = supabase
        .from("approval_workflows")
        .select(`
          *,
          submitted_user:submitted_by(full_name),
          level1_approver:approved_by_level_1(full_name),
          level2_approver:approved_by_level_2(full_name)
        `)
        .order("created_at", { ascending: false });

      // Filter based on role
      if (role === "farm_manager") {
        query = query.eq("status", "submitted");
      } else if (role === "keuangan") {
        query = query.eq("status", "approved_level_1");
      }

      const { data, error } = await query;
      if (error) throw error;
      setPendingApprovals(data || []);
    } catch (error) {
      console.error("Error fetching approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId: string, level: number) => {
    try {
      const { error } = await supabase
        .from("approval_workflows")
        .update({
          status: level === 1 ? "approved_level_1" : "approved_level_2",
          [`approved_by_level_${level}`]: (await supabase.auth.getUser()).data.user?.id,
          [`approved_at_level_${level}`]: new Date().toISOString()
        })
        .eq("id", workflowId);
      
      if (error) throw error;
      fetchPendingApprovals();
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleReject = async (workflowId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("approval_workflows")
        .update({
          status: "rejected",
          rejected_by: (await supabase.auth.getUser()).data.user?.id,
          rejected_at: new Date().toISOString(),
          rejection_reason: reason
        })
        .eq("id", workflowId);
      
      if (error) throw error;
      fetchPendingApprovals();
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> Menunggu Persetujuan
        </Badge>;
      case "approved_level_1":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Disetujui Level 1
        </Badge>;
      case "approved_level_2":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Disetujui Level 2
        </Badge>;
      case "rejected":
        return <Badge variant="destructive">
          <XCircle className="mr-1 h-3 w-3" /> Ditolak
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Dashboard Persetujuan</span>
          <Badge variant="outline">
            {pendingApprovals.length} Menunggu
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">Loading...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dokumen</TableHead>
                <TableHead>Jumlah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Diserahkan</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingApprovals.map((approval) => (
                <TableRow key={approval.id}>
                  <TableCell>
                    <div className="font-medium">
                      {approval.document_type.replace("_", " ").toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ID: {approval.document_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    {approval.total_amount ? 
                      new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR"
                      }).format(approval.total_amount) : "-"}
                  </TableCell>
                  <TableCell>{getStatusBadge(approval.status)}</TableCell>
                  <TableCell>
                    <div>
                      {approval.submitted_user?.full_name || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(approval.submitted_at), "dd MMM yyyy", { locale: id })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleApprove(approval.id, userRole === "farm_manager" ? 1 : 2)}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" /> Setujui
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const reason = prompt("Alasan penolakan:");
                          if (reason) handleReject(approval.id, reason);
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" /> Tolak
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}