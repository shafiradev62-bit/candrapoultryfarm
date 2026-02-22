import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductionChart } from "@/components/dashboard/ProductionChart";
import { FeedEfficiencyChart } from "@/components/dashboard/FeedEfficiencyChart";
import { FlockDistributionChart } from "@/components/dashboard/FlockDistributionChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { 
  Bird, 
  Egg, 
  Skull, 
  Wheat, 
  TrendingUp, 
  DollarSign, 
  Wallet,
  Activity,
  Package,
  Users
} from "lucide-react";
import { formatIDR, formatNumber } from "@/lib/formatters";

const Dashboard = () => {
  // Sample data - in real implementation this would come from API
  const productionData = [
    { kandang: "Kandang A", populasi: 8500, telur: 7800, hdp: "91.8%", fcr: "2.05" },
    { kandang: "Kandang B", populasi: 8200, telur: 7450, hdp: "90.9%", fcr: "2.12" },
    { kandang: "Kandang C", populasi: 8800, telur: 8100, hdp: "92.0%", fcr: "2.01" },
    { kandang: "Kandang D", populasi: 8600, telur: 7920, hdp: "92.1%", fcr: "1.98" },
  ];

  const financialSummary = [
    { item: "Revenue Hari Ini", value: "Rp 18,400,000", change: "+3.2%" },
    { item: "Biaya Operasional", value: "Rp 12,800,000", change: "+1.5%" },
    { item: "Laba Kotor", value: "Rp 5,600,000", change: "+5.8%" },
    { item: "Cash Position", value: "Rp 245,000,000", change: "+12.0jt" },
  ];

  return (
    <AppLayout title="Dashboard Utama">
      <div className="space-y-6">
        {/* Production Summary Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Ringkasan Produksi Harian
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kandang</TableHead>
                  <TableHead className="text-right">Populasi</TableHead>
                  <TableHead className="text-right">Telur (Butir)</TableHead>
                  <TableHead className="text-right">HDP</TableHead>
                  <TableHead className="text-right">FCR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productionData.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{row.kandang}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.populasi)}</TableCell>
                    <TableCell className="text-right">{formatNumber(row.telur)}</TableCell>
                    <TableCell className="text-right text-green-600 font-medium">{row.hdp}</TableCell>
                    <TableCell className="text-right">{row.fcr}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50 font-semibold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">{formatNumber(34100)}</TableCell>
                  <TableCell className="text-right">{formatNumber(31270)}</TableCell>
                  <TableCell className="text-right text-green-600">91.7%</TableCell>
                  <TableCell className="text-right">2.04</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductionChart />
          <FeedEfficiencyChart />
        </div>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Ringkasan Keuangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Nilai</TableHead>
                  <TableHead className="text-right">Perubahan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {financialSummary.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell className="text-right font-medium">{item.value}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.change.startsWith('+') ? "text-green-600" : "text-red-600"}>
                        {item.change}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FlockDistributionChart />
          </div>
          <QuickActions />
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
