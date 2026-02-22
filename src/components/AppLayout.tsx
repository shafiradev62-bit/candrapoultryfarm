import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, ClipboardList, Landmark, LayoutDashboard, Settings, ShoppingCart, Warehouse, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { role } = useAuth();
  const isWorker = role !== "owner";
  const bottomModules = isWorker
    ? [
      { title: "Daily", url: "/daily-report", icon: ClipboardList },
      { title: "Inventory", url: "/warehouse", icon: Warehouse },
    ]
    : [
      { title: "Dashboard", url: "/", icon: LayoutDashboard },
      { title: "Daily", url: "/daily-report", icon: ClipboardList },
      { title: "Warehouse", url: "/warehouse", icon: Warehouse },
      { title: "Sales", url: "/penjualan", icon: ShoppingCart },
      { title: "Finance", url: "/finance", icon: Landmark },
      { title: "Ops", url: "/operasional", icon: Wrench },
      { title: "Settings", url: "/pengaturan", icon: Settings },
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
          <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20 md:pb-6">
            {children}
          </main>
        </div>
        <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card md:hidden">
          <div className="flex items-center justify-around px-2 py-2">
            {bottomModules.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/"}
                className="flex flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted-foreground"
                activeClassName="text-primary"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </SidebarProvider>
  );
}
