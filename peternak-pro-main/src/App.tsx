import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import KandangPage from "./pages/KandangPage";
import OperasiPage from "./pages/OperasiPage";
import InventoriPage from "./pages/InventoriPage";
import PenjualanPage from "./pages/PenjualanPage";
import KeuanganPage from "./pages/KeuanganPage";
import PengaturanPage from "./pages/PengaturanPage";
import AuditTrailPage from "./pages/AuditTrailPage";
import ExternalDataPage from "./pages/ExternalDataPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <HashRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/kandang" element={<ProtectedRoute><KandangPage /></ProtectedRoute>} />
              <Route path="/operasi" element={<ProtectedRoute><OperasiPage /></ProtectedRoute>} />
              <Route path="/inventori" element={<ProtectedRoute><InventoriPage /></ProtectedRoute>} />
              <Route path="/external-data" element={<ProtectedRoute><ExternalDataPage /></ProtectedRoute>} />
              <Route path="/penjualan" element={<ProtectedRoute><PenjualanPage /></ProtectedRoute>} />
              <Route path="/keuangan" element={<ProtectedRoute><KeuanganPage /></ProtectedRoute>} />
              <Route path="/pengaturan" element={<ProtectedRoute><PengaturanPage /></ProtectedRoute>} />
              <Route path="/pengaturan/security/audit-trail" element={<ProtectedRoute><AuditTrailPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </HashRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
