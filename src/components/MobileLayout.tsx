import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Home, PlusCircle, Package, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
}

const bottomNavItems = [
  { title: "Dashboard", url: "/mobile", icon: Home },
  { title: "Input", url: "/mobile/input", icon: PlusCircle },
  { title: "Stok", url: "/mobile/stok", icon: Package },
  { title: "Penjualan", url: "/mobile/penjualan", icon: ShoppingCart },
  { title: "Profil", url: "/mobile/profil", icon: User },
];

export function MobileLayout({ children, title }: MobileLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      {title && (
        <header className="sticky top-0 z-10 bg-primary text-primary-foreground px-4 py-3 shadow-md">
          <h1 className="text-lg font-semibold text-center">{title}</h1>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border">
        <div className="flex items-center justify-around px-2 py-2">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/mobile"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors min-w-[60px]",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
