import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await signIn(username, password);
      if (success) {
        toast.success("Berhasil masuk!");
        navigate("/");
      } else {
        toast.error("Username atau password salah!");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center p-6 safe-area-padding">
      <div className="w-full max-w-sm">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img src="/logo.png" alt="Candra Poultry Farm" className="mx-auto h-20 w-20 object-contain drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-forest-700 mb-2">Candra Poultry Farm</h1>
          <p className="text-forest-500 text-sm">
            Selamat datang kembali!
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-[24px] shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder=" "
                required
                className={`peer h-12 bg-cream-50 border-2 rounded-xl transition-all duration-200 ${
                  focusedField === 'username' 
                    ? 'border-forest-500 ring-2 ring-forest-200' 
                    : 'border-cream-200'
                }`}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
              />
              <Label 
                htmlFor="username" 
                className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  username || focusedField === 'username'
                    ? '-top-2.5 text-xs bg-white px-1 text-forest-600'
                    : 'top-3.5 text-forest-400 text-sm'
                }`}
              >
                Username
              </Label>
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=" "
                required
                minLength={6}
                className={`peer h-12 bg-cream-50 border-2 rounded-xl pr-12 transition-all duration-200 ${
                  focusedField === 'password' 
                    ? 'border-forest-500 ring-2 ring-forest-200' 
                    : 'border-cream-200'
                }`}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <Label 
                htmlFor="password" 
                className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                  password || focusedField === 'password'
                    ? '-top-2.5 text-xs bg-white px-1 text-forest-600'
                    : 'top-3.5 text-forest-400 text-sm'
                }`}
              >
                Password
              </Label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-forest-400 hover:text-forest-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full h-14 bg-forest-700 hover:bg-forest-800 text-white font-semibold rounded-xl shadow-lg transition-all duration-200 transform hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Masuk
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-forest-500 text-xs">
              Demo: owner/owner123 atau worker/worker123
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-forest-400 text-xs">
            © 2024 Candra Poultry Farm
          </p>
        </div>
      </div>
    </div>
  );
}
