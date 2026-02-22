import { 
  LayoutDashboard, 
  Warehouse, 
  ClipboardList, 
  Package, 
  ShoppingCart, 
  Landmark,
  Settings,
  LogOut,
  Database
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
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
  { title: "Dasbor", url: "/", icon: LayoutDashboard },
  { title: "Kandang & Flock", url: "/kandang", icon: Warehouse },
  { title: "Operasi Harian", url: "/operasi", icon: ClipboardList },
  { title: "Inventori", url: "/inventori", icon: Package },
  { title: "Data Eksternal", url: "/external-data", icon: Database },
  { title: "Penjualan", url: "/penjualan", icon: ShoppingCart },
  { title: "Keuangan", url: "/keuangan", icon: Landmark },
];

const systemModules = [
  { title: "Pengaturan", url: "/pengaturan", icon: Settings },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div 
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent"
            style={{
              backgroundImage: 'url(/logo.png)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center'
            }}
          >
            {/* Logo as background image */}
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">CANDRA POULTRY FARM</h1>
            <p className="text-[11px] text-sidebar-muted leading-tight">Manajemen Peternakan</p>
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
              {mainModules.map((item) => (
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

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-sidebar-muted font-medium mb-1 px-3">
            Sistem
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemModules.map((item) => (
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
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-semibold text-sidebar-foreground">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.email || "Pengguna"}</p>
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
      </SidebarFooter>
    </Sidebar>
  );
}