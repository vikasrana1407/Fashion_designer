import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const HERO = "https://images.unsplash.com/photo-1766299231533-27fb998d1a6e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxoaWdoJTIwZmFzaGlvbiUyMGVkaXRvcmlhbCUyMHBvcnRyYWl0JTIwZGFya3xlbnwwfHx8fDE3Nzg0NzY3NTV8MA&ixlib=rb-4.1.0&q=85";

export default function AuthPage({ mode = "login" }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form.email, form.password, form.name);
        toast.success("Welcome to the atelier");
      } else {
        await login(form.email, form.password);
        toast.success("Welcome back");
      }
      navigate("/studio");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        <img src={HERO} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0C]" />
        <div className="absolute bottom-12 left-12 right-12">
          <span className="font-mono-label text-white/60">A.I COUTURE · STUDIO ACCESS</span>
          <p className="font-serif-display text-4xl mt-4 max-w-md leading-tight">
            "Fashion is the armor to survive the reality of everyday life."
          </p>
          <p className="font-mono-label text-white/40 mt-4">— Bill Cunningham</p>
        </div>
      </div>

      <div className="flex flex-col justify-center px-8 lg:px-24 py-16 relative">
        <Link to="/" className="absolute top-8 left-8 lg:left-24 flex items-baseline gap-3" data-testid="logo-back">
          <span className="font-serif-display text-2xl tracking-tighter">Atelier</span>
          <span className="font-mono-label text-white/40">Noir</span>
        </Link>

        <div className="max-w-md w-full">
          <span className="font-mono-label text-white/40">{isRegister ? "Create Account" : "Sign In"}</span>
          <h1 className="font-serif-display text-5xl lg:text-6xl tracking-tighter mt-6 mb-3">
            {isRegister ? "Begin your studio." : "Welcome back."}
          </h1>
          <p className="text-white/50 mb-12 text-sm">
            {isRegister
              ? "A private creative atelier, instantly yours."
              : "Pick up where your last vision left off."}
          </p>

          <form onSubmit={submit} className="space-y-8">
            {isRegister && (
              <div>
                <label className="font-mono-label text-white/40 block mb-2">Name</label>
                <input
                  type="text"
                  className="input-line"
                  placeholder="Your atelier name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="auth-name-input"
                />
              </div>
            )}
            <div>
              <label className="font-mono-label text-white/40 block mb-2">Email</label>
              <input
                type="email"
                required
                className="input-line"
                placeholder="you@maison.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                data-testid="auth-email-input"
              />
            </div>
            <div>
              <label className="font-mono-label text-white/40 block mb-2">Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-line"
                placeholder="At least 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                data-testid="auth-password-input"
              />
            </div>

            <button type="submit" className="btn-primary w-full justify-center" disabled={loading} data-testid="auth-submit">
              {loading ? <span className="spin-line" /> : (isRegister ? "Enter the Atelier" : "Sign In")}
            </button>
          </form>

          <p className="mt-10 font-mono-label text-white/40">
            {isRegister ? (
              <>Already have an account? <Link to="/login" className="text-white hover:text-[#D4AF37]" data-testid="switch-to-login">Sign in</Link></>
            ) : (
              <>No account yet? <Link to="/register" className="text-white hover:text-[#D4AF37]" data-testid="switch-to-register">Create one</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
