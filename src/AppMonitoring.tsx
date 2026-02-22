import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { LandscapeOptimizer } from "@/components/LandscapeOptimizer";
import MonitoringDashboard from "./pages/MonitoringDashboard";

const queryClient = new QueryClient();

const AppMonitoring = () => (
  <QueryClientProvider client={queryClient}>
    <AppDataProvider>
      <TooltipProvider>
        <LandscapeOptimizer />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MonitoringDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AppDataProvider>
  </QueryClientProvider>
);

export default AppMonitoring;
