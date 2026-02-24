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
  signIn: (username: string, password: string) => Promise<boolean>;
  setUserRole: (nextRole: AppRole) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  role: null,
  roleLoading: true,
  signIn: async () => false,
  setUserRole: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("=== AUTH PROVIDER INITIALIZING ===");
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [baseRole, setBaseRole] = useState<AppRole | null>(null);
  const [roleOverride, setRoleOverride] = useState<AppRole | null>(() => {
    const stored = localStorage.getItem("candra-role-override");
    console.log("Stored role override:", stored);
    return stored === "owner" || stored === "worker" ? stored : null;
  });
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    console.log("=== AUTH EFFECT RUNNING ===");
    
    // Check local auth first for PWA/Mobile
    const storedAuth = localStorage.getItem("candra-auth-user");
    console.log("Stored auth:", storedAuth);
    
    if (storedAuth) {
      try {
        const { username, role } = JSON.parse(storedAuth);
        console.log("Restoring user:", username, "with role:", role);
        const mockUser = {
          id: username,
          email: `${username}@candra.farm`,
          aud: "authenticated",
          role: "authenticated",
          created_at: new Date().toISOString(),
          app_metadata: {},
          user_metadata: {},
        } as User;
        setUser(mockUser);
        setBaseRole(role);
        setRoleOverride(role);
        setLoading(false);
        setRoleLoading(false);
        return;
      } catch (e) {
        console.error("Error parsing stored auth:", e);
        localStorage.removeItem("candra-auth-user");
      }
    }

    // Fallback to Supabase auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("Supabase auth state changed:", _event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Supabase session:", session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch(err => {
      console.error("Supabase error:", err);
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

  const signIn = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Simple local authentication for demo
    const validCredentials = [
      { username: "owner", password: "owner123", role: "owner" as AppRole },
      { username: "worker", password: "worker123", role: "worker" as AppRole },
    ];

    const credential = validCredentials.find(
      (c) => c.username === username && c.password === password
    );

    if (credential) {
      // Store auth in localStorage for PWA/Mobile
      localStorage.setItem("candra-auth-user", JSON.stringify({ username, role: credential.role }));
      localStorage.setItem("candra-role-override", credential.role);
      setRoleOverride(credential.role);
      setBaseRole(credential.role);
      
      // Create a mock user object
      const mockUser = {
        id: username,
        email: `${username}@candra.farm`,
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {},
      } as User;
      
      setUser(mockUser);
      return true;
    }

    return false;
  }, []);

  const signOut = async () => {
    localStorage.removeItem("candra-auth-user");
    localStorage.removeItem("candra-role-override");
    setUser(null);
    setSession(null);
    setRoleOverride(null);
    setBaseRole(null);
    await supabase.auth.signOut();
  };

  const role = roleOverride ?? baseRole;

  return (
    <AuthContext.Provider value={{ user, session, loading, role, roleLoading, signIn, setUserRole, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
