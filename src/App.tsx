import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LandscapeOptimizer } from "@/components/LandscapeOptimizer";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import DailyReportPage from "./pages/DailyReportPage";
import WarehousePage from "./pages/WarehousePage";
import PenjualanPage from "./pages/PenjualanPage";
import OperasionalPage from "./pages/OperasionalPage";
import FinancePage from "./pages/FinancePage";
import PengaturanPage from "./pages/PengaturanPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppDataProvider>
        <TooltipProvider>
          <LandscapeOptimizer />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<ProtectedRoute allowedRoles={["owner"]}><Index /></ProtectedRoute>} />
              <Route path="/daily-report" element={<ProtectedRoute allowedRoles={["owner", "worker"]}><DailyReportPage /></ProtectedRoute>} />
              <Route path="/warehouse" element={<ProtectedRoute allowedRoles={["owner", "worker"]}><WarehousePage /></ProtectedRoute>} />
              <Route path="/penjualan" element={<ProtectedRoute allowedRoles={["owner"]}><PenjualanPage /></ProtectedRoute>} />
              <Route path="/operasional" element={<ProtectedRoute allowedRoles={["owner"]}><OperasionalPage /></ProtectedRoute>} />
              <Route path="/finance" element={<ProtectedRoute allowedRoles={["owner"]}><FinancePage /></ProtectedRoute>} />
              <Route path="/pengaturan" element={<ProtectedRoute allowedRoles={["owner"]}><PengaturanPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AppDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
