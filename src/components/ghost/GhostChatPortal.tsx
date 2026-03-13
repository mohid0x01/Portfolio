import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ghost, X, Minimize2, Maximize2, Terminal, Shield,
  Volume2, VolumeX, Bell, BellOff,
  ChevronLeft, Lock, Zap, Bug, MessageSquare
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GhostAuth } from "./GhostAuth";
import { GhostRoomList } from "./GhostRoomList";
import { GhostChatWindow } from "./GhostChatWindow";
import { GhostBugBounty } from "./GhostBugBounty";
import type { GhostRoom } from "@/hooks/useGhostChat";
import type { User } from "@supabase/supabase-js";

const SIZES = {
  compact: { w: 720, h: 500 },
  normal: { w: 920, h: 600 },
  wide: { w: 1100, h: 700 },
};

type AppTab = "chat" | "bugbounty";

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
  const [connectionStatus] = useState<"connected" | "connecting" | "offline">("connected");
  const [uptime, setUptime] = useState(0);
  const [activeTab, setActiveTab] = useState<AppTab>("chat");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => setPulseCount((c) => c + 1), 8000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) return;
    const interval = setInterval(() => setUptime((u) => u + 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen) { setUnreadCount(0); return; }
    const interval = setInterval(() => {
      if (user && Math.random() < 0.12) setUnreadCount((n) => n + 1);
    }, 14000);
    return () => clearInterval(interval);
  }, [isOpen, user]);

  const handleAuthenticated = (userId: string) => {
    // Re-fetch the full session so we get a proper User object
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Restore codename from localStorage
        const saved = localStorage.getItem(`ghost_codename_${session.user.id}`);
        if (saved) setMyCodename(saved);
      } else {
        setUser({ id: userId } as User);
      }
    });
  };

  const handleSelectRoom = async (room: GhostRoom) => {
    setSelectedRoom(room);
    setUnreadCount(0);
    if (user) {
      // Try to get codename from membership record
      const { data } = await supabase
        .from("ghost_members")
        .select("codename")
        .eq("room_id", room.id)
        .eq("user_id", user.id)
        .single();
      if (data) {
        setMyCodename(data.codename);
      } else {
        // Fall back to localStorage
        const saved = localStorage.getItem(`ghost_codename_${user.id}`);
        if (saved) setMyCodename(saved);
      }
    }
  };

  const handleSignOut = async () => {
    if (user) {
      localStorage.removeItem(`ghost_codename_${user.id}`);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSelectedRoom(null);
    setMyCodename("GHOST");
  };

  const formatUptime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  const statusColor = connectionStatus === "connected"
    ? "hsl(var(--secondary))"
    : "hsl(var(--destructive))";

  const currentSize = SIZES[sizeMode];

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => { setIsOpen(true); setUnreadCount(0); }}
            className="fixed bottom-8 right-8 z-[70] w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl group"
            style={{
              background: "linear-gradient(135deg, hsl(261 87% 50%), hsl(261 87% 35%))",
              boxShadow: "0 0 30px hsl(261 87% 50% / 0.4), 0 10px 40px rgba(0,0,0,0.5)",
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Ghost Protocol"
          >
            <Ghost className="w-6 h-6 text-white" />
            <motion.div
              key={pulseCount}
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{ background: "hsl(261 87% 50% / 0.35)" }}
            />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-5 h-5 rounded-full bg-destructive border-2 border-background flex items-center justify-center text-xs font-black text-white px-1 font-mono"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </motion.div>
            )}
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
            className={`fixed z-[70] flex flex-col overflow-hidden ${
              isMaximized ? "inset-4 rounded-2xl" : "bottom-6 right-6 rounded-2xl"
            }`}
            style={{
              ...(isMaximized ? {} : { width: currentSize.w, height: currentSize.h }),
              background: "hsl(0 0% 4%)",
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

              {/* ── APP TABS ── */}
              <div className="flex items-center gap-1 mx-2">
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider transition-all border ${
                    activeTab === "chat"
                      ? "bg-primary/20 text-primary border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  GHOST CHAT
                </button>
                <button
                  onClick={() => setActiveTab("bugbounty")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black font-mono tracking-wider transition-all border ${
                    activeTab === "bugbounty"
                      ? "bg-red-500/20 text-red-400 border-red-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border-transparent"
                  }`}
                >
                  <Bug className="w-3.5 h-3.5" />
                  BUG BOUNTY
                </button>
              </div>

              {/* Title (center) */}
              <div className="flex items-center gap-2 flex-1 justify-center min-w-0">
                <Terminal className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <span className="text-xs font-black font-mono tracking-widest gradient-text truncate">
                  {activeTab === "bugbounty"
                    ? "BUG BOUNTY HUB"
                    : selectedRoom ? selectedRoom.name : "GHOST PROTOCOL"}
                </span>
                <Shield className="w-3 h-3 text-secondary flex-shrink-0" />
              </div>

              {/* Right controls */}
              <div className="flex items-center gap-1 flex-shrink-0">
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
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {/* BUG BOUNTY TAB — no auth required */}
                {activeTab === "bugbounty" ? (
                  <motion.div
                    key="bugbounty"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="h-full"
                  >
                    <GhostBugBounty />
                  </motion.div>
                ) : (
                  /* CHAT TAB */
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="h-full flex flex-col"
                  >
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
                            <ChatEmptyState onSwitchToBugBounty={() => setActiveTab("bugbounty")} />
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Status bar */}
            <div
              className="px-4 py-1.5 flex items-center gap-3 text-xs font-mono text-muted-foreground border-t border-border/15 flex-shrink-0"
              style={{ background: "hsl(0 0% 3.5%)" }}
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: statusColor }} />
                <span style={{ color: statusColor }}>{connectionStatus.toUpperCase()}</span>
              </span>
              <span className="text-muted-foreground/40">TeamCyberØps Ghost Net v3.0</span>
              {user && uptime > 0 && (
                <span className="text-muted-foreground/40 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {formatUptime(uptime)}
                </span>
              )}
              {/* Tab indicator */}
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded font-bold text-xs border ${
                activeTab === "bugbounty"
                  ? "text-red-400 border-red-500/20 bg-red-500/8"
                  : "text-primary border-primary/20 bg-primary/8"
              }`}>
                {activeTab === "bugbounty" ? <><Bug className="w-3 h-3" /> BUG BOUNTY</> : <><MessageSquare className="w-3 h-3" /> GHOST CHAT</>}
              </span>
              <span className="ml-auto flex items-center gap-2">
                <Lock className="w-3 h-3 text-secondary/60" />
                <span>{user ? `● ${myCodename}` : "○ OFFLINE"}</span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ChatEmptyState({ onSwitchToBugBounty }: { onSwitchToBugBounty: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center font-mono">
      <div className="text-center px-8">
        <Ghost className="w-14 h-14 text-primary/20 mx-auto mb-4" />
        <h3 className="gradient-text font-black text-xl mb-2 tracking-widest">NO CHANNEL SELECTED</h3>
        <p className="text-sm text-muted-foreground mb-1">Create or join a channel to begin</p>
        <p className="text-xs text-muted-foreground mb-6">All communications are E2E encrypted</p>
        <button
          onClick={onSwitchToBugBounty}
          className="flex items-center gap-2 mx-auto px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-black tracking-wider hover:bg-red-500/20 transition-colors"
        >
          <Bug className="w-3.5 h-3.5" />
          OPEN BUG BOUNTY HUB
        </button>
      </div>
    </div>
  );
}
