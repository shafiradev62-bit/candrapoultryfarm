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
    <div className="flex flex-col h-screen bg-[#FDFCF7]">
      {/* Header - Clean & Minimal */}
      {title && (
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-6 py-5">
          <h1 className="text-xl font-bold text-[#1B4332] text-center">{title}</h1>
        </header>
      )}

      {/* Main Content - Scrollable with safe area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 bg-white rounded-[28px] shadow-2xl shadow-black/10 border border-gray-100">
        <div className="flex items-center justify-around px-2 py-3">
          {bottomNavItems.map((item) => (
            <NavLink
              key={item.title}
              to={item.url}
              end={item.url === "/pwa"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1.5 py-2 px-4 rounded-[20px] transition-all min-w-[68px]",
                  isActive
                    ? "bg-[#1B4332] text-white"
                    : "text-gray-400"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("h-6 w-6", isActive ? "stroke-[2.5]" : "stroke-[2]")} />
                  <span className={cn("text-[10px] font-medium", isActive && "font-semibold")}>
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
