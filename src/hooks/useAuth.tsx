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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from localStorage
    const stored = localStorage.getItem("portfolio_admin_session");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("portfolio_admin_session");
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Demo mode: accept any valid-looking credentials
    await new Promise((r) => setTimeout(r, 800));
    const u = { email, uid: "demo-" + Math.random().toString(36).slice(2) };
    setUser(u);
    localStorage.setItem("portfolio_admin_session", JSON.stringify(u));
  };

  const signOut = async () => {
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
