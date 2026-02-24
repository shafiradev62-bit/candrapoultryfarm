import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

// PWA Mobile Pages
import PWALogin from "@/pages/pwa/PWALogin";
import PWADashboard from "@/pages/pwa/PWADashboard";
import PWAInput from "@/pages/pwa/PWAInput";
import PWAStok from "@/pages/pwa/PWAStok";
import PWAPenjualan from "@/pages/pwa/PWAPenjualan";
import PWAProfil from "@/pages/pwa/PWAProfil";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/pwa/login" replace />;
}

function AppPWA() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="pwa-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <AppDataProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/pwa/login" element={<PWALogin />} />

              {/* Protected Routes */}
              <Route
                path="/pwa"
                element={
                  <ProtectedRoute>
                    <PWADashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pwa/input"
                element={
                  <ProtectedRoute>
                    <PWAInput />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pwa/stok"
                element={
                  <ProtectedRoute>
                    <PWAStok />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pwa/penjualan"
                element={
                  <ProtectedRoute>
                    <PWAPenjualan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pwa/profil"
                element={
                  <ProtectedRoute>
                    <PWAProfil />
                  </ProtectedRoute>
                }
              />

              {/* Redirect */}
              <Route path="/" element={<Navigate to="/pwa" replace />} />
              <Route path="*" element={<Navigate to="/pwa" replace />} />
            </Routes>
            <Toaster />
          </AppDataProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default AppPWA;
