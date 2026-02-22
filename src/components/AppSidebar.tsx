import { 
  LayoutDashboard, 
  ClipboardList, 
  Warehouse, 
  ShoppingCart, 
  Wrench,
  Landmark,
  Settings,
  LogOut,
  Egg,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainModules = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Daily Report", url: "/daily-report", icon: ClipboardList },
  { title: "Warehouse", url: "/warehouse", icon: Warehouse },
  { title: "Penjualan", url: "/penjualan", icon: ShoppingCart },
  { title: "Operasional", url: "/operasional", icon: Wrench },
  { title: "Finance", url: "/finance", icon: Landmark },
];

const systemModules = [
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const { user, signOut, role, setUserRole } = useAuth();
  const isWorker = role !== "owner";
  const visibleMainModules = isWorker
    ? mainModules.filter((item) => item.title === "Daily Report" || item.title === "Warehouse")
    : mainModules;
  const visibleSystemModules = isWorker ? [] : systemModules;

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Candra Poultry Farm" className="h-9 w-9 object-contain rounded-lg" />
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">CANDRA</h1>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight leading-tight">POULTRY FARM</h1>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-muted font-medium mb-1 px-3">
            Modul Utama
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMainModules.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      activeClassName="bg-sidebar-accent text-sidebar-foreground"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {visibleSystemModules.length > 0 && (
          <SidebarGroup className="mt-6">
            <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-muted font-medium mb-1 px-3">
              Sistem
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {visibleSystemModules.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
                        activeClassName="bg-sidebar-accent text-sidebar-foreground"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-[11px] uppercase tracking-wider text-sidebar-muted font-medium px-1">Role View</p>
            <Select value={role ?? undefined} onValueChange={(value) => setUserRole(value as "owner" | "worker")}>
              <SelectTrigger className="h-10 bg-sidebar-accent border-sidebar-border text-xs">
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Owner View</SelectItem>
                <SelectItem value="worker">Worker View</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.email || "User"}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
