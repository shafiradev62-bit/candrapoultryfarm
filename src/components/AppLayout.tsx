import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, ClipboardList, Landmark, LayoutDashboard, Settings, ShoppingCart, Warehouse, Wrench, Home, TrendingUp, Package, DollarSign, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { role } = useAuth();
  const isWorker = role !== "owner";
  const bottomModules = isWorker
    ? [
        { title: "Daily", url: "/daily-report", icon: ClipboardList, color: "text-forest-600" },
        { title: "Inventory", url: "/warehouse", icon: Warehouse, color: "text-forest-600" },
      ]
    : [
        { title: "Home", url: "/", icon: Home, color: "text-forest-600" },
        { title: "Daily", url: "/daily-report", icon: ClipboardList, color: "text-forest-600" },
        { title: "Inventory", url: "/warehouse", icon: Warehouse, color: "text-forest-600" },
        { title: "Sales", url: "/penjualan", icon: ShoppingCart, color: "text-forest-600" },
        { title: "Finance", url: "/finance", icon: DollarSign, color: "text-forest-600" },
      ];
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 lg:px-6 shrink-0">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hidden md:inline-flex text-muted-foreground hover:text-foreground" />
              {title && (
                <h2 className="text-sm font-semibold text-foreground">{title}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-warning" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto pb-20 md:pb-0">
            {children}
          </main>
        </div>
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          <div className="bg-white/95 backdrop-blur-lg border-t border-cream-200 safe-area-padding-bottom">
            <div className="flex items-center justify-around px-4 py-2">
              {bottomModules.map((item, index) => {
                const isActive = window.location.pathname === item.url;
                return (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    className="flex flex-col items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 transition-all duration-200 hover:bg-cream-50 group"
                  >
                    <div className={cn(
                      "relative transition-all duration-200",
                      isActive ? "text-forest-600" : "text-forest-400 group-hover:text-forest-600"
                    )}>
                      <item.icon className="h-6 w-6" />
                      {isActive && (
                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-forest-600 rounded-full" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium transition-all duration-200",
                      isActive ? "text-forest-600 font-semibold" : "text-forest-400 group-hover:text-forest-600"
                    )}>
                      {item.title}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}
