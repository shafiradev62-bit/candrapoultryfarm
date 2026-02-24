import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// Mobile Pages
import MobileLogin from "@/pages/mobile/MobileLogin";
import MobileDashboard from "@/pages/mobile/MobileDashboard";
import MobileInput from "@/pages/mobile/MobileInput";
import MobileStok from "@/pages/mobile/MobileStok";
import MobilePenjualan from "@/pages/mobile/MobilePenjualan";
import MobileProfil from "@/pages/mobile/MobileProfil";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/mobile/login" replace />;
}

function AppMobile() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="mobile-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/mobile/login" element={<MobileLogin />} />

              {/* Protected Routes */}
              <Route
                path="/mobile"
                element={
                  <ProtectedRoute>
                    <MobileDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/input"
                element={
                  <ProtectedRoute>
                    <MobileInput />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/stok"
                element={
                  <ProtectedRoute>
                    <MobileStok />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/penjualan"
                element={
                  <ProtectedRoute>
                    <MobilePenjualan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/mobile/profil"
                element={
                  <ProtectedRoute>
                    <MobileProfil />
                  </ProtectedRoute>
                }
              />

              {/* Redirect root to mobile dashboard */}
              <Route path="/" element={<Navigate to="/mobile" replace />} />
              <Route path="*" element={<Navigate to="/mobile" replace />} />
            </Routes>
            <Toaster />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default AppMobile;
