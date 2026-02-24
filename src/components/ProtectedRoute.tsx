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

  console.log("ProtectedRoute - loading:", loading, "roleLoading:", roleLoading, "user:", user, "role:", role);

  if (loading || roleLoading) {
    console.log("ProtectedRoute - showing loading spinner");
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    console.log("ProtectedRoute - no user, redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  const effectiveRole: AppRole = role ?? "worker";
  if (allowedRoles && !allowedRoles.includes(effectiveRole)) {
    console.log("ProtectedRoute - role not allowed, redirecting to", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  console.log("ProtectedRoute - rendering children");
  return <>{children}</>;
}
