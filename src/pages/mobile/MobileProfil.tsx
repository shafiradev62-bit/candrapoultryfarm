import { MobileLayout } from "@/components/MobileLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Shield, Info, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function MobileProfil() {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    signOut();
    toast({
      title: "Logout Berhasil",
      description: "Anda telah keluar dari aplikasi",
    });
    navigate("/mobile/login");
  };

  const menuItems = [
    {
      icon: User,
      label: "Informasi Akun",
      description: "Lihat detail akun Anda",
      action: () => {},
    },
    {
      icon: Shield,
      label: "Keamanan",
      description: "Ubah password dan pengaturan keamanan",
      action: () => {},
    },
    {
      icon: Info,
      label: "Tentang Aplikasi",
      description: "Versi dan informasi aplikasi",
      action: () => {},
    },
  ];

  return (
    <MobileLayout title="Profil">
      <div className="p-4 space-y-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground shadow-lg">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-foreground/20 rounded-full flex items-center justify-center">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.username || "User"}</h2>
              <p className="text-sm opacity-90 capitalize">{role || "Role"}</p>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-card rounded-xl p-4 shadow-sm border space-y-3">
          <h3 className="font-semibold text-sm mb-3">Informasi Pengguna</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Username</span>
              <span className="font-medium">{user?.username || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium capitalize">{role || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium text-green-600">Aktif</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full bg-card rounded-xl p-4 shadow-sm border flex items-center gap-4 hover:bg-accent transition-colors"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* App Info */}
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm font-semibold mb-1">Candra Poultry Farm</p>
          <p className="text-xs text-muted-foreground">Mobile App v1.0.0</p>
          <p className="text-xs text-muted-foreground mt-2">
            © 2026 Candra Poultry Farm
          </p>
        </div>

        {/* Logout Button */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              <LogOut className="h-5 w-5 mr-2" />
              Keluar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin keluar dari aplikasi?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLogout}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Ya, Keluar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MobileLayout>
  );
}
