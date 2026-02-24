import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function PWALogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await signIn(username, password);
      if (success) {
        toast({
          title: "Login Berhasil",
          description: "Selamat datang",
        });
        navigate("/pwa");
      } else {
        toast({
          title: "Login Gagal",
          description: "Username atau password salah",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-10">
        {/* Logo & Title */}
        <div className="text-center space-y-6">
          <img src="/logo.png" alt="Logo" className="w-28 h-28 mx-auto object-contain drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-[#1B4332] mb-2">Candra Poultry</h1>
            <p className="text-base text-[#40916C]">Farm Management System</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Username Field */}
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-[20px] focus:border-[#40916C] focus:outline-none transition-all text-[#1B4332] text-base peer placeholder-transparent"
              placeholder="Username"
              id="username"
              required
            />
            <label
              htmlFor="username"
              className={`absolute left-5 transition-all pointer-events-none ${
                focusedField === "username" || username
                  ? "-top-2.5 text-xs bg-[#FDFCF7] px-2 text-[#40916C] font-medium"
                  : "top-4 text-base text-gray-400"
              }`}
            >
              Username
            </label>
          </div>

          {/* Password Field */}
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-[20px] focus:border-[#40916C] focus:outline-none transition-all text-[#1B4332] text-base peer placeholder-transparent"
              placeholder="Password"
              id="password"
              required
            />
            <label
              htmlFor="password"
              className={`absolute left-5 transition-all pointer-events-none ${
                focusedField === "password" || password
                  ? "-top-2.5 text-xs bg-[#FDFCF7] px-2 text-[#40916C] font-medium"
                  : "top-4 text-base text-gray-400"
              }`}
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-[#1B4332] text-white rounded-[20px] font-semibold text-base hover:bg-[#2D5F4C] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#1B4332]/20"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-400 space-y-1">
          <p>Demo: owner / owner123</p>
          <p>Worker: worker / worker123</p>
        </div>
      </div>
    </div>
  );
}
