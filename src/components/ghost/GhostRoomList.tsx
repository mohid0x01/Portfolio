import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, LogIn, Copy, Check, Hash, LogOut, Terminal,
  ChevronRight, Search, Bell, BellOff, Trash2, Settings,
  Star, Users, Lock, Globe, RefreshCw, X, Shield, Zap, Eye
} from "lucide-react";
import { useGhostRooms, type GhostRoom } from "@/hooks/useGhostChat";

interface GhostRoomListProps {
  userId: string;
  selectedRoomId: string | null;
  onSelectRoom: (room: GhostRoom) => void;
  onSignOut: () => void;
  myCodename: string;
}

const HACKER_CODENAMES = [
  "SHADOW", "CIPHER", "PHANTOM", "RECON", "ZERO_DAY", "EXPLOIT", "VIPER",
  "GHOST", "ORACLE", "WRAITH", "SPECTER", "NEXUS", "VOID", "APEX", "VECTOR",
  "BREACH", "SENTINEL", "ECLIPSE", "ROGUE", "DAEMON", "KERNEL", "PROXY",
  "STYX", "NOVA", "VORTEX", "ENTROPY", "MIRAGE", "BLAZE", "ATLAS"
];

function randomCodename() {
  return HACKER_CODENAMES[Math.floor(Math.random() * HACKER_CODENAMES.length)];
}

export function GhostRoomList({ userId, selectedRoomId, onSelectRoom, onSignOut, myCodename }: GhostRoomListProps) {
  const { rooms, myMemberships, createRoom, joinRoom, fetchRooms } = useGhostRooms(userId);
  const [mode, setMode] = useState<null | "create" | "join">(null);
  const [roomName, setRoomName] = useState("");
  const [roomDesc, setRoomDesc] = useState("");
  // Pre-fill codename from localStorage (set during anonymous auth)
  const [codename, setCodename] = useState(() => {
    const saved = localStorage.getItem(`ghost_codename_${userId}`);
    return saved || randomCodename();
  });
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [mutedRooms, setMutedRooms] = useState<Set<string>>(new Set());
  const [favRooms, setFavRooms] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [showInviteFor, setShowInviteFor] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim() || !codename.trim()) return;
    setLoading(true);
    setError("");
    const room = await createRoom(roomName.trim(), roomDesc.trim(), codename.trim());
    if (room) {
      onSelectRoom(room);
      setMode(null);
      setRoomName("");
      setRoomDesc("");
      setCodename(randomCodename());
    } else {
      setError("FAILED TO CREATE CHANNEL");
    }
    setLoading(false);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim() || !codename.trim()) return;
    setLoading(true);
    setError("");
    const room = await joinRoom(inviteCode.trim().toUpperCase(), codename.trim());
    if (room) {
      onSelectRoom(room);
      setMode(null);
      setInviteCode("");
      setCodename(randomCodename());
    } else {
      setError("INVALID CODE OR CHANNEL OFFLINE");
    }
    setLoading(false);
  };

  const copyInvite = async (code: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setTimeout(() => setRefreshing(false), 600);
  };

  const toggleMute = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMutedRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const toggleFav = (roomId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavRooms((prev) => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  const filteredRooms = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return rooms.filter((r) =>
      r.name.toLowerCase().includes(query) ||
      r.description?.toLowerCase().includes(query) ||
      myMemberships[r.id]?.codename.toLowerCase().includes(query)
    );
  }, [rooms, searchQuery, myMemberships]);

  const sortedRooms = useMemo(() => {
    return [...filteredRooms].sort((a, b) => {
      const aFav = favRooms.has(a.id) ? -1 : 0;
      const bFav = favRooms.has(b.id) ? -1 : 0;
      return aFav - bFav;
    });
  }, [filteredRooms, favRooms]);

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header */}
      <div className="p-3 border-b border-border/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-black tracking-widest gradient-text text-sm">GHOST NET</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${showSearch ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/8"}`}
              title="Search channels"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleRefresh}
              className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
            </button>
          </div>
        </div>

        {/* Identity badge */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/4 border border-border/20">
          <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary">
            {myCodename[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-foreground truncate">{myCodename}</div>
            <div className="text-xs text-muted-foreground/60">{rooms.length} channels</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-secondary animate-pulse flex-shrink-0" title="Online" />
        </div>

        {/* Search bar */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 bg-white/5 border border-border/30 rounded-xl px-3 py-2">
                <Search className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH CHANNELS..."
                  className="flex-1 bg-transparent text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Room list */}
      <div className="flex-1 overflow-y-auto py-1" style={{ scrollbarWidth: "thin" }}>
        {sortedRooms.length === 0 && (
          <div className="text-center py-8 px-4">
            {searchQuery ? (
              <>
                <div className="text-2xl mb-2">🔍</div>
                <p className="text-xs text-muted-foreground">NO CHANNELS MATCH</p>
              </>
            ) : (
              <>
                <div className="text-3xl mb-3">👻</div>
                <p className="text-xs text-muted-foreground">NO ACTIVE CHANNELS</p>
                <p className="text-xs text-muted-foreground/60 mt-1">CREATE OR JOIN ONE BELOW</p>
              </>
            )}
          </div>
        )}

        {/* Favorites section */}
        {sortedRooms.some((r) => favRooms.has(r.id)) && (
          <div className="px-2 pt-2 pb-1">
            <div className="text-xs text-yellow-400/60 font-bold tracking-wider px-2 mb-1 flex items-center gap-1">
              <Star className="w-3 h-3" /> STARRED
            </div>
            {sortedRooms.filter((r) => favRooms.has(r.id)).map((room) => (
              <RoomItem
                key={room.id}
                room={room}
                membership={myMemberships[room.id]}
                isSelected={selectedRoomId === room.id}
                isHovered={hoveredRoom === room.id}
                isMuted={mutedRooms.has(room.id)}
                isFav={true}
                copiedCode={copiedCode}
                showInvite={showInviteFor === room.id}
                onSelect={() => onSelectRoom(room)}
                onHover={(id) => setHoveredRoom(id)}
                onCopy={copyInvite}
                onMute={toggleMute}
                onFav={toggleFav}
                onShowInvite={(id, e) => { e.stopPropagation(); setShowInviteFor(showInviteFor === id ? null : id); }}
              />
            ))}
            <div className="h-px bg-border/20 mx-2 my-2" />
          </div>
        )}

        {/* All channels */}
        <div className="px-2">
          {sortedRooms.filter((r) => !favRooms.has(r.id)).length > 0 && (
            <div className="text-xs text-muted-foreground/50 font-bold tracking-wider px-2 mb-1 flex items-center gap-1">
              <Hash className="w-3 h-3" /> CHANNELS
            </div>
          )}
          {sortedRooms.filter((r) => !favRooms.has(r.id)).map((room) => (
            <RoomItem
              key={room.id}
              room={room}
              membership={myMemberships[room.id]}
              isSelected={selectedRoomId === room.id}
              isHovered={hoveredRoom === room.id}
              isMuted={mutedRooms.has(room.id)}
              isFav={false}
              copiedCode={copiedCode}
              showInvite={showInviteFor === room.id}
              onSelect={() => onSelectRoom(room)}
              onHover={(id) => setHoveredRoom(id)}
              onCopy={copyInvite}
              onMute={toggleMute}
              onFav={toggleFav}
              onShowInvite={(id, e) => { e.stopPropagation(); setShowInviteFor(showInviteFor === id ? null : id); }}
            />
          ))}
        </div>
      </div>

      {/* Footer actions */}
      <div className="p-3 border-t border-border/30 space-y-2">
        <div className="flex gap-2">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setMode(mode === "create" ? null : "create"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${
              mode === "create"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-border/30"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            NEW
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => { setMode(mode === "join" ? null : "join"); setError(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-black tracking-wider transition-all ${
              mode === "join"
                ? "bg-secondary/20 text-secondary border border-secondary/30"
                : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 border border-border/30"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            JOIN
          </motion.button>
        </div>

        {/* Create / Join form */}
        <AnimatePresence>
          {mode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={mode === "create" ? handleCreate : handleJoin} className="space-y-2 pt-1">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2 flex items-center gap-2"
                    >
                      <X className="w-3 h-3 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {mode === "create" && (
                  <>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value.toUpperCase())}
                      placeholder="CHANNEL NAME"
                      required
                      maxLength={30}
                      className="w-full bg-white/5 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                    <input
                      type="text"
                      value={roomDesc}
                      onChange={(e) => setRoomDesc(e.target.value)}
                      placeholder="MISSION BRIEF (optional)"
                      maxLength={80}
                      className="w-full bg-white/5 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
                    />
                  </>
                )}

                {mode === "join" && (
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                    placeholder="INVITE CODE"
                    required
                    className="w-full bg-white/5 border border-border/30 rounded-xl px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary/40 transition-colors uppercase"
                  />
                )}

                {/* Codename with randomize */}
                <div className="relative">
                  <input
                    type="text"
                    value={codename}
                    onChange={(e) => setCodename(e.target.value.toUpperCase())}
                    placeholder="YOUR CODENAME"
                    required
                    maxLength={16}
                    className="w-full bg-white/5 border border-border/30 rounded-xl px-3 py-2 pr-8 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-secondary/40 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setCodename(randomCodename())}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                    title="Randomize codename"
                  >
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.97 }}
                  disabled={loading}
                  className={`w-full py-2 rounded-xl text-xs font-black tracking-wider text-white transition-all disabled:opacity-50 ${
                    mode === "create" ? "btn-glow" : "btn-teal"
                  }`}
                >
                  {loading
                    ? <span className="flex items-center justify-center gap-2"><div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> PROCESSING...</span>
                    : mode === "create" ? "ESTABLISH CHANNEL" : "INFILTRATE"
                  }
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sign out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSignOut}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all border border-border/20 hover:border-destructive/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          DISCONNECT
        </motion.button>
      </div>
    </div>
  );
}

// Room item component
function RoomItem({
  room, membership, isSelected, isHovered, isMuted, isFav, copiedCode,
  showInvite, onSelect, onHover, onCopy, onMute, onFav, onShowInvite
}: {
  room: GhostRoom;
  membership: any;
  isSelected: boolean;
  isHovered: boolean;
  isMuted: boolean;
  isFav: boolean;
  copiedCode: string | null;
  showInvite: boolean;
  onSelect: () => void;
  onHover: (id: string | null) => void;
  onCopy: (code: string, e?: React.MouseEvent) => void;
  onMute: (id: string, e: React.MouseEvent) => void;
  onFav: (id: string, e: React.MouseEvent) => void;
  onShowInvite: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={onSelect}
        onMouseEnter={() => onHover(room.id)}
        onMouseLeave={() => onHover(null)}
        className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl text-left transition-all group mb-0.5 ${
          isSelected
            ? "bg-primary/12 border border-primary/25"
            : "border border-transparent hover:bg-white/5 hover:border-border/20"
        }`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black font-mono text-sm border ${
            isSelected ? "border-primary/40" : "border-border/30"
          }`}
          style={{
            background: isSelected
              ? "linear-gradient(135deg, hsl(261 87% 50% / 0.2), hsl(261 87% 40% / 0.1))"
              : "rgba(255,255,255,0.04)",
            color: membership?.avatar_color || "hsl(var(--primary))"
          }}
        >
          {room.name[0]}
        </div>

        <div className="flex-1 min-w-0">
          <div className={`text-xs font-bold truncate ${isSelected ? "text-primary" : "text-foreground"}`}>
            {room.name}
          </div>
          {membership && (
            <div className="text-xs text-muted-foreground/60 truncate" style={{ fontSize: "10px" }}>
              as <span className="font-bold" style={{ color: membership.avatar_color + "cc" }}>{membership.codename}</span>
              {" · "}{membership.role}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className={`flex items-center gap-0.5 flex-shrink-0 transition-opacity ${isHovered || isSelected ? "opacity-100" : "opacity-0"}`}>
          <button
            onClick={(e) => onFav(room.id, e)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isFav ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}
            title="Star"
          >
            <Star className="w-3 h-3" fill={isFav ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => onMute(room.id, e)}
            className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isMuted ? "text-muted-foreground" : "text-secondary hover:text-muted-foreground"}`}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
          </button>
          <button
            onClick={(e) => onShowInvite(room.id, e)}
            className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            title="Invite code"
          >
            <Eye className="w-3 h-3" />
          </button>
        </div>

        {isSelected && <div className="w-1 h-6 rounded-full bg-primary flex-shrink-0" />}
      </button>

      {/* Invite code panel */}
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mx-2 mb-1"
          >
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/5 border border-secondary/20">
              <span className="text-xs text-muted-foreground font-mono flex-1 tracking-widest">{room.invite_code}</span>
              <button
                onClick={(e) => onCopy(room.invite_code, e)}
                className="text-muted-foreground hover:text-secondary transition-colors flex-shrink-0"
                title="Copy invite code"
              >
                {copiedCode === room.invite_code ? (
                  <Check className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
