import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { Home, PlusCircle, Package, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface PWALayoutProps {
  children: ReactNode;
  title?: string;
}

const bottomNavItems = [
  { title: "Dashboard", url: "/pwa", icon: Home },
  { title: "Input", url: "/pwa/input", icon: PlusCircle },
  { title: "Stok", url: "/pwa/stok", icon: Package },
  { title: "Penjualan", url: "/pwa/penjualan", icon: ShoppingCart },
  { title: "Profil", url: "/pwa/profil", icon: User },
];

export function PWALayout({ children, title }: PWALayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-[#FDFCF7] w-full max-w-full overflow-x-hidden">
      {/* Header - Balanced */}
      {title && (
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-lg border-b border-gray-200 px-4 py-3.5 w-full shadow-sm">
          <h1 className="text-lg font-bold text-[#1B4332] text-center tracking-tight">{title}</h1>
        </header>
      )}

      {/* Main Content - Proper spacing */}
      <main className="flex-1 overflow-y-auto w-full" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        <div className="w-full max-w-full px-4 py-4">
          {children}
        </div>
      </main>

      {/* Bottom Navigation - PROPER SIZE */}
      <nav 
        className="fixed left-3 right-3 z-50 bg-white rounded-[24px] shadow-xl border border-gray-200"
        style={{ bottom: 'calc(12px + env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around px-2 py-3">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/pwa"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-[18px] transition-all flex-1 max-w-[80px]",
                  isActive
                    ? "bg-[#1B4332] text-white"
                    : "text-gray-500"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-5 w-5", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                  <span className={cn("text-[10px] font-medium leading-tight", isActive && "font-semibold")}>
                    {item.title}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
