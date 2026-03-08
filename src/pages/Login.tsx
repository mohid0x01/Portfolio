import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff, Code2, Shield, AlertCircle } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const LoginPage = () => {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const { user, loading, signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (!loading && user) return <Navigate to="/admin" replace />;

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    try {
      await signIn(data.email, data.password);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid credentials.";
      setError(msg.includes("Firebase") ? "Invalid email or password." : msg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, hsl(261 87% 50% / 0.1), transparent)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 120 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="glass p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow"
              style={{ background: "var(--gradient-primary)" }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black gradient-text mb-1">Admin Access</h1>
            <p className="text-muted-foreground text-sm">
              Secure login to your portfolio dashboard.
            </p>
          </div>

          {/* Demo note */}
          <div className="glass p-3 rounded-xl mb-6 flex items-start gap-2">
            <Code2 className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="text-secondary font-medium">Demo mode active.</span>{" "}
              Connect Firebase to enable real authentication. Any credentials will work for preview.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                {...register("email")}
                type="email"
                autoComplete="email"
                placeholder="admin@portfolio.dev"
                className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
              />
              {errors.email && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 rounded-xl glass text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-glow w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            <a href="/" className="hover:text-primary transition-colors">← Back to portfolio</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
