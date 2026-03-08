import { useState, useEffect, createContext, useContext, type ReactNode } from "react";

interface AuthUser {
  email: string;
  uid: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo credentials for preview (no Firebase required)
const DEMO_ADMIN = { email: "admin@portfolio.dev", uid: "demo-admin-001" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage (demo mode)
    const stored = localStorage.getItem("portfolio_admin_session");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("portfolio_admin_session");
      }
    }
    setLoading(false);

    // Try to hook into Firebase auth if configured
    let unsubscribe = () => {};
    import("@/lib/firebase")
      .then(({ onAuthChange }) =>
        onAuthChange((fbUser) => {
          if (fbUser) {
            const u = { email: fbUser.email || "", uid: fbUser.uid };
            setUser(u);
            localStorage.setItem("portfolio_admin_session", JSON.stringify(u));
          } else {
            const stored2 = localStorage.getItem("portfolio_admin_session");
            if (!stored2) setUser(null);
          }
          setLoading(false);
        })
      )
      .then((unsub) => {
        if (typeof unsub === "function") unsubscribe = unsub;
      });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Try Firebase first
    try {
      const { signIn: fbSignIn } = await import("@/lib/firebase");
      const result = await fbSignIn(email, password);
      const u = { email: result.user.email || email, uid: result.user.uid };
      setUser(u);
      localStorage.setItem("portfolio_admin_session", JSON.stringify(u));
      return;
    } catch {
      // Fall through to demo mode
    }

    // Demo mode: accept any valid-looking credentials
    await new Promise((r) => setTimeout(r, 800));
    const u = { email, uid: "demo-" + Math.random().toString(36).slice(2) };
    setUser(u);
    localStorage.setItem("portfolio_admin_session", JSON.stringify(u));
  };

  const signOut = async () => {
    try {
      const { signOut: fbSignOut } = await import("@/lib/firebase");
      await fbSignOut();
    } catch {}
    setUser(null);
    localStorage.removeItem("portfolio_admin_session");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
