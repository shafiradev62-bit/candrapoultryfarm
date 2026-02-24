import { PWALayout } from "@/components/PWALayout";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function PWAProfil() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem("candra-role-override");
      toast({ title: "Berhasil", description: "Anda telah keluar" });
      navigate("/pwa/login");
    } catch (error) {
      toast({ title: "Error", description: "Gagal keluar", variant: "destructive" });
    }
  };

  return (
    <PWALayout title="Profil">
      <div className="px-6 pt-6 pb-8 space-y-5">
        {/* User Card */}
        <div className="bg-[#1B4332] rounded-[28px] p-6 text-white shadow-lg">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              {(user?.email?.[0] || "U").toUpperCase()}
            </div>
            <h2 className="text-xl font-bold">{user?.email || "User"}</h2>
            <p className="text-sm opacity-90 capitalize mt-1">{role || "worker"}</p>
          </div>
        </div>

        {/* Info List */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Role</span>
            <span className="font-bold text-[#1B4332] capitalize">{role || "worker"}</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Aplikasi</span>
            <span className="font-bold text-[#1B4332]">Candra Poultry</span>
          </div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Versi</span>
            <span className="font-bold text-[#1B4332]">1.0.0</span>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-[20px] p-5 shadow-sm">
          <h3 className="font-bold text-[#1B4332] mb-3">Tentang</h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            Aplikasi manajemen peternakan ayam petelur untuk mengelola laporan harian, stok pakan & telur, penjualan, dan monitoring keuangan.
          </p>
        </div>

        {/* Logout */}
        <button onClick={handleLogout} className="w-full h-14 bg-red-500 text-white rounded-[20px] font-bold active:scale-95 transition-all shadow-lg">
          Keluar
        </button>

        <div className="text-center text-xs text-gray-400 pt-4">
          <p>© 2024 Candra Poultry Farm</p>
        </div>
      </div>
    </PWALayout>
  );
}
