import { useAuth, type AppRole } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo = "/daily-report",
}: {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
  redirectTo?: string;
}) {
  const { user, loading, role, roleLoading } = useAuth();

  if (loading || roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const effectiveRole: AppRole = role ?? "worker";
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
