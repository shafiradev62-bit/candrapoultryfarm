import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = "owner" | "worker";

const ownerRoleSet: Database["public"]["Enums"]["app_role"][] = ["super_admin", "farm_manager", "keuangan"];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: AppRole | null;
  roleLoading: boolean;
  setUserRole: (nextRole: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  roleLoading: true,
  setUserRole: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseRole, setBaseRole] = useState<AppRole | null>(null);
  const [roleOverride, setRoleOverride] = useState<AppRole | null>(() => {
    const stored = localStorage.getItem("candra-role-override");
    return stored === "owner" || stored === "worker" ? stored : null;
  });
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setBaseRole(null);
      setRoleLoading(false);
      return;
    }
    let cancelled = false;
    const loadRole = async () => {
      setRoleLoading(true);
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (cancelled) return;
      if (error) {
        setBaseRole("worker");
        setRoleLoading(false);
        return;
      }
      const roles = (data ?? []).map((row) => row.role);
      const isOwner = roles.some((item) => ownerRoleSet.includes(item));
      setBaseRole(isOwner ? "owner" : "worker");
      setRoleLoading(false);
    };
    loadRole();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const setUserRole = useCallback(async (nextRole: AppRole) => {
    setRoleOverride(nextRole);
    localStorage.setItem("candra-role-override", nextRole);
    setBaseRole(nextRole);
    if (!user) return;
    const mappedRole: Database["public"]["Enums"]["app_role"] = nextRole === "owner"
      ? "super_admin"
      : "kandang_supervisor";
    const { error } = await supabase.from("user_roles").upsert({
      user_id: user.id,
      role: mappedRole,
    });
    if (error) return;
  }, [user]);

  useEffect(() => {
    if (user && baseRole && !roleOverride && baseRole !== "owner") {
      setUserRole("owner").catch(() => null);
    }
  }, [user, baseRole, roleOverride, setUserRole]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const role = roleOverride ?? baseRole;

  return (
    <AuthContext.Provider value={{ user, session, loading, role, roleLoading, setUserRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
