import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Globe, Shield, X, Eye, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  type: "visitor" | "threat" | "bot";
  message: string;
  detail: string;
  time: Date;
  read: boolean;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Supabase realtime — new visitor_logs rows
  useEffect(() => {
    const channel = supabase
      .channel("realtime-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "visitor_logs" },
        (payload) => {
          const row = payload.new as {
            id: string;
            country?: string | null;
            city?: string | null;
            is_bot?: boolean | null;
            ip_address?: string | null;
            visited_at?: string;
          };

          if (row.is_bot) {
            setNotifications((prev) => [
              {
                id: row.id,
                type: "bot",
                message: "Bot detected & logged",
                detail: row.ip_address ? `IP: ${row.ip_address}` : "Unknown IP",
                time: new Date(row.visited_at || Date.now()),
                read: false,
              },
              ...prev.slice(0, 49),
            ]);
          } else {
            const location =
              [row.city, row.country].filter(Boolean).join(", ") || "Unknown location";
            setNotifications((prev) => [
              {
                id: row.id,
                type: "visitor",
                message: `New visitor from ${location}`,
                detail: row.ip_address || "Unknown IP",
                time: new Date(row.visited_at || Date.now()),
                read: false,
              },
              ...prev.slice(0, 49),
            ]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));

  const iconForType = (type: Notification["type"]) => {
    if (type === "visitor") return <Globe className="w-3.5 h-3.5 text-primary" />;
    if (type === "bot") return <Zap className="w-3.5 h-3.5 text-destructive" />;
    return <Shield className="w-3.5 h-3.5 text-yellow-400" />;
  };

  const bgForType = (type: Notification["type"]) => {
    if (type === "visitor") return "bg-primary/10";
    if (type === "bot") return "bg-destructive/10";
    return "bg-yellow-400/10";
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => { setOpen((v) => !v); if (!open && unread > 0) markAllRead(); }}
        className="relative glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-white text-[9px] font-black flex items-center justify-center"
          >
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive/50 animate-ping" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-border/30 overflow-hidden"
            style={{
              background: "hsl(var(--card))",
              backdropFilter: "blur(20px)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Live Notifications</span>
                {unread > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/20 text-destructive font-bold">
                    {unread} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.length > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/10"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>

            {/* Notification list */}
            <div className="max-h-80 overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                  <Eye className="w-8 h-8 text-muted-foreground/30 mb-2" />
                  <p className="text-xs text-muted-foreground">Watching for visitors...</p>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">
                    Realtime updates will appear here
                  </p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border/10 hover:bg-muted/10 transition-colors group ${
                        !n.read ? "bg-primary/3" : ""
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg ${bgForType(n.type)} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        {iconForType(n.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-tight truncate">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{n.detail}</p>
                        <p className="text-[10px] text-muted-foreground/50 mt-0.5">{timeAgo(n.time)}</p>
                      </div>
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                      <button
                        onClick={() => dismiss(n.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-border/20">
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                <span className="text-secondary font-mono font-bold">REALTIME ACTIVE</span>
                <span className="ml-auto">{notifications.length} total</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
