import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  Ghost, X, Minimize2, Maximize2, Terminal, Shield,
  Volume2, VolumeX, Wifi, Bell, BellOff, Settings,
  ChevronLeft, Lock, Zap, Info
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GhostAuth } from "./GhostAuth";
import { GhostRoomList } from "./GhostRoomList";
import { GhostChatWindow } from "./GhostChatWindow";
import type { GhostRoom } from "@/hooks/useGhostChat";
import type { User } from "@supabase/supabase-js";

const SIZES = {
  compact: { w: 680, h: 480 },
  normal: { w: 860, h: 580 },
  wide: { w: 1060, h: 680 },
};

export function GhostChatPortal() {
  const [isOpen, setIsOpen] = useState(false);
  const [sizeMode, setSizeMode] = useState<"compact" | "normal" | "wide">("normal");
  const [isMaximized, setIsMaximized] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<GhostRoom | null>(null);
  const [myCodename, setMyCodename] = useState("GHOST");
  const [pulseCount, setPulseCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showRoomBack, setShowRoomBack] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "offline">("connecting");
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      setConnectionStatus(session ? "connected" : "connected");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Pulse when closed
  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => setPulseCount((c) => c + 1), 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Uptime counter
  useEffect(() => {
    if (!isOpen || !user) return;
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  // Simulate unread when closed
  useEffect(() => {
    if (isOpen) { setUnreadCount(0); return; }
    const interval = setInterval(() => {
      if (user && Math.random() < 0.15) setUnreadCount((n) => n + 1);
    }, 12000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  const handleAuthenticated = (userId: string) => {
    setUser({ id: userId } as User);
    setConnectionStatus("connected");
  };

  const handleSelectRoom = async (room: GhostRoom) => {
    setSelectedRoom(room);
    setUnreadCount(0);
    if (user) {
      const { data } = await supabase
        .from("ghost_members")
        .select("codename")
        .eq("room_id", room.id)
        .eq("user_id", user.id)
        .single();
      if (data) setMyCodename(data.codename);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedRoom(null);
    setMyCodename("GHOST");
    setConnectionStatus("connected");
  };

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const currentSize = SIZES[sizeMode];
  const statusColor = connectionStatus === "connected" ? "hsl(var(--secondary))" : connectionStatus === "connecting" ? "hsl(var(--primary))" : "hsl(var(--destructive))";

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group"
            style={{
              background: "linear-gradient(135deg, hsl(261 87% 50%), hsl(261 87% 35%))",
              boxShadow: "0 0 30px hsl(261 87% 50% / 0.4), 0 10px 40px rgba(0,0,0,0.5)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Ghost Chat — Press to open"
          >
            <Ghost className="w-6 h-6 text-white" />

            {/* Pulse ring */}
            <motion.div
              key={pulseCount}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "hsl(261 87% 50% / 0.35)" }}
            />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-5 h-5 rounded-full bg-destructive border-2 border-background flex items-center justify-center text-xs font-black text-white px-1 font-mono"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.div>
            )}

            {/* Online dot */}
            {user && (
              <span
                className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background animate-pulse"
                style={{ background: "hsl(var(--secondary))" }}
              />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className={`fixed z-50 flex flex-col overflow-hidden ${
              isMaximized ? "inset-4 rounded-2xl" : "bottom-6 right-6 rounded-2xl"
            }`}
            style={{
              ...(isMaximized ? {} : { width: currentSize.w, height: currentSize.h }),
              background: "hsl(var(--background))",
              border: "1px solid hsl(261 87% 50% / 0.2)",
              boxShadow: "0 0 60px hsl(261 87% 50% / 0.12), 0 30px 80px rgba(0,0,0,0.8)",
            }}
          >
            {/* Title bar */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 flex-shrink-0 border-b border-border/20 select-none"
              style={{ background: "hsl(0 0% 5%)" }}
            >
              {/* Traffic lights */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-3.5 h-3.5 rounded-full bg-destructive/70 hover:bg-destructive transition-colors flex items-center justify-center group/tl"
                  title="Close"
                >
                  <X className="w-2 h-2 text-white opacity-0 group-hover/tl:opacity-100" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-3.5 h-3.5 rounded-full bg-yellow-500/70 hover:bg-yellow-500 transition-colors"
                  title="Minimize"
                />
                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="w-3.5 h-3.5 rounded-full bg-secondary/70 hover:bg-secondary transition-colors"
                  title="Maximize"
                />
              </div>

              {/* Back to rooms (mobile/narrow) */}
              {selectedRoom && (
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors lg:hidden"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Title */}
              <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                <Terminal className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-sm font-black font-mono tracking-widest gradient-text truncate">
                  {selectedRoom ? selectedRoom.name : "GHOST PROTOCOL"}
                </span>
                <Shield className="w-3 h-3 text-secondary flex-shrink-0" />
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {/* Size selector */}
                {!isMaximized && (
                  <div className="flex items-center gap-0.5 px-1.5 py-1 rounded-lg bg-white/4 border border-border/20">
                    {(["compact", "normal", "wide"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSizeMode(s)}
                        className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold transition-colors ${
                          sizeMode === s ? "bg-primary/30 text-primary" : "text-muted-foreground hover:text-foreground"
                        }`}
                        title={s.toUpperCase()}
                      >
                        {s[0].toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => setSoundEnabled((s) => !s)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  title={soundEnabled ? "Mute" : "Unmute"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-secondary" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setNotifEnabled((n) => !n)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                  title={notifEnabled ? "Notifications on" : "Notifications off"}
                >
                  {notifEnabled ? <Bell className="w-3.5 h-3.5 text-secondary" /> : <BellOff className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsMaximized(!isMaximized)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Body */}
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center font-mono">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs text-muted-foreground tracking-widest">INITIALIZING SECURE TUNNEL...</p>
                </div>
              </div>
            ) : !user ? (
              <div className="flex-1 overflow-hidden">
                <GhostAuth onAuthenticated={handleAuthenticated} />
              </div>
            ) : (
              <div className="flex flex-1 min-h-0">
                {/* Sidebar */}
                <div
                  className="w-52 flex-shrink-0 border-r border-border/20 flex flex-col"
                  style={{ background: "hsl(0 0% 5%)" }}
                >
                  <GhostRoomList
                    userId={user.id}
                    selectedRoomId={selectedRoom?.id || null}
                    onSelectRoom={handleSelectRoom}
                    onSignOut={handleSignOut}
                    myCodename={myCodename}
                  />
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col min-w-0">
                  {selectedRoom ? (
                    <GhostChatWindow
                      roomId={selectedRoom.id}
                      roomName={selectedRoom.name}
                      userId={user.id}
                    />
                  ) : (
                    <EmptyState />
                  )}
                </div>
              </div>
            )}

            {/* Status bar */}
            <div
              className="px-4 py-1.5 flex items-center gap-3 text-xs font-mono text-muted-foreground border-t border-border/15 flex-shrink-0"
              style={{ background: "hsl(0 0% 3.5%)" }}
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: statusColor }}
                />
                <span style={{ color: statusColor }}>
                  {connectionStatus.toUpperCase()}
                </span>
              </span>

              <span className="text-muted-foreground/50">TeamCyberØps Ghost Net v3.0</span>

              {user && uptime > 0 && (
                <span className="text-muted-foreground/40 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {formatUptime(uptime)}
                </span>
              )}

              <span className="ml-auto flex items-center gap-2">
                <Lock className="w-3 h-3 text-secondary/60" />
                <span>{user ? `● ${user.email?.split("@")[0].toUpperCase()}` : "○ OFFLINE"}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function EmptyState() {
  const features = [
    "↳ Real-time encrypted messaging",
    "↳ Image lightbox & file download",
    "↳ Self-destruct burn timers",
    "↳ Typing indicators",
    "↳ Emoji reactions (24+ emojis)",
    "↳ Reply threads",
    "↳ Message search (Ctrl+F)",
    "↳ Pin & star messages",
    "↳ Right-click context menu",
    "↳ Message formatting (bold, italic, code)",
    "↳ Code block rendering",
    "↳ Agent stats & intel panel",
    "↳ Members presence sidebar",
    "↳ Channel filter (all/images/files/starred)",
    "↳ Sound & notification toggles",
    "↳ Compact/normal/wide window sizes",
  ];

  return (
    <div className="flex-1 flex items-center justify-center font-mono overflow-y-auto">
      <div className="text-center px-6 py-4 max-w-sm">
        <Ghost className="w-14 h-14 text-primary/20 mx-auto mb-4" />
        <h3 className="gradient-text font-black text-lg mb-1 tracking-widest">GHOST PROTOCOL</h3>
        <p className="text-xs text-muted-foreground mb-4">Select a channel or create one</p>
        <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground text-left">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary/60 inline-block flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
