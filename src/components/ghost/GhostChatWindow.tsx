import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Paperclip, Smile, Trash2, Reply, Copy, ShieldAlert,
  Clock, CheckCheck, X, Hash, ImageIcon, FileText,
  Terminal, Wifi, WifiOff, Users, ChevronDown, Search,
  Pin, Edit3, Download, Forward, Star, Volume2, VolumeX,
  Code, Bold, Italic, AlertCircle, ZoomIn, Maximize,
  MoreHorizontal, ThumbsUp, Bookmark, Bell, BellOff,
  Filter, SortAsc, Globe, Lock, Eye, EyeOff, RefreshCw,
  Zap, BarChart2, Info, Flag, Mic, MicOff, Hash as HashIcon,
  AtSign, Link, ChevronUp, ChevronRight, PlayCircle,
  PauseCircle, SkipForward, Music
} from "lucide-react";
import { useGhostChat, type GhostMessage, type GhostMember } from "@/hooks/useGhostChat";

const EMOJI_REACTIONS = ["👍", "🔥", "💀", "🕵️", "⚡", "✅", "❌", "🚨", "😂", "💯", "🎯", "🔑", "💣", "🛡️", "🌐", "⚠️"];
const EMOJI_EXTENDED = ["😀","😎","🤔","😤","🙏","💪","👀","🚀","💡","🎉","🏆","🔐","🗡️","🌙","☠️","🤖","🦾","🔥","💥","⚡","🌊","🎭","🎪","🎯"];

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatFullTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false
  });
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "TODAY";
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "YESTERDAY";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toUpperCase();
}

function renderMessageContent(content: string) {
  // Bold: **text**
  // Italic: _text_
  // Code: `code`
  // Code block: ```code```
  const parts: React.ReactNode[] = [];
  let remaining = content;
  let idx = 0;

  // Code blocks first
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let lastEnd = 0;
  let match;
  const segments: { text: string; type: "text" | "codeblock" }[] = [];

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastEnd) {
      segments.push({ text: content.slice(lastEnd, match.index), type: "text" });
    }
    segments.push({ text: match[1].trim(), type: "codeblock" });
    lastEnd = match.index + match[0].length;
  }
  if (lastEnd < content.length) {
    segments.push({ text: content.slice(lastEnd), type: "text" });
  }

  return segments.map((seg, i) => {
    if (seg.type === "codeblock") {
      return (
        <pre key={i} className="bg-black/40 border border-border/30 rounded-lg p-3 text-xs overflow-x-auto my-2 text-secondary font-mono whitespace-pre-wrap">
          {seg.text}
        </pre>
      );
    }
    // Inline formatting
    const inlineParts: React.ReactNode[] = [];
    const inlineRegex = /(`[^`]+`|\*\*[^*]+\*\*|_[^_]+_)/g;
    let lastI = 0;
    let inlineMatch;
    while ((inlineMatch = inlineRegex.exec(seg.text)) !== null) {
      if (inlineMatch.index > lastI) {
        inlineParts.push(<span key={`t${lastI}`}>{seg.text.slice(lastI, inlineMatch.index)}</span>);
      }
      const raw = inlineMatch[0];
      if (raw.startsWith("`")) {
        inlineParts.push(<code key={`c${inlineMatch.index}`} className="bg-black/40 border border-border/30 rounded px-1.5 py-0.5 text-secondary text-xs font-mono">{raw.slice(1, -1)}</code>);
      } else if (raw.startsWith("**")) {
        inlineParts.push(<strong key={`b${inlineMatch.index}`} className="font-black text-foreground">{raw.slice(2, -2)}</strong>);
      } else if (raw.startsWith("_")) {
        inlineParts.push(<em key={`em${inlineMatch.index}`} className="italic text-foreground/80">{raw.slice(1, -1)}</em>);
      }
      lastI = inlineMatch.index + raw.length;
    }
    if (lastI < seg.text.length) {
      inlineParts.push(<span key={`tail${i}`}>{seg.text.slice(lastI)}</span>);
    }
    return <p key={i} className="break-words whitespace-pre-wrap">{inlineParts}</p>;
  });
}

// Image lightbox
function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center"
        onClick={onClose}
      >
        <motion.img
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          src={src}
          alt={alt}
          className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <a
          href={src}
          download
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary/80 hover:bg-primary flex items-center justify-center text-white transition-colors"
        >
          <Download className="w-4 h-4" />
        </a>
      </motion.div>
    </AnimatePresence>
  );
}

// Message context menu
function MessageContextMenu({
  x, y, msg, isOwn, onClose, onReply, onCopy, onDelete, onPin, onStar, onEdit, onForward
}: {
  x: number; y: number; msg: GhostMessage; isOwn: boolean;
  onClose: () => void; onReply: () => void; onCopy: () => void;
  onDelete: () => void; onPin: () => void; onStar: () => void;
  onEdit?: () => void; onForward: () => void;
}) {
  const items = [
    { icon: Reply, label: "REPLY", action: onReply, color: "text-primary" },
    { icon: Copy, label: "COPY", action: onCopy, color: "text-foreground" },
    { icon: Forward, label: "FORWARD", action: onForward, color: "text-foreground" },
    { icon: Pin, label: "PIN", action: onPin, color: "text-secondary" },
    { icon: Star, label: "STAR", action: onStar, color: "text-yellow-400" },
    ...(isOwn ? [{ icon: Edit3, label: "EDIT", action: onEdit!, color: "text-blue-400" }] : []),
    ...(isOwn ? [{ icon: Trash2, label: "DESTROY", action: onDelete, color: "text-destructive" }] : []),
    { icon: Flag, label: "REPORT", action: onClose, color: "text-orange-400" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-[9998] rounded-xl overflow-hidden shadow-2xl font-mono"
      style={{
        left: Math.min(x, window.innerWidth - 160),
        top: Math.min(y, window.innerHeight - 280),
        background: "hsl(0 0% 8%)",
        border: "1px solid hsl(0 0% 18%)",
        minWidth: 150
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-1">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => { item.action?.(); onClose(); }}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-white/8 transition-colors ${item.color}`}
          >
            <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="tracking-widest">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="px-3 py-1.5 border-t border-border/20 text-xs text-muted-foreground text-center">
        {formatFullTime(msg.created_at)}
      </div>
    </motion.div>
  );
}

interface GhostMessageBubbleProps {
  msg: GhostMessage;
  isOwn: boolean;
  onDelete: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
  onReply: (msg: GhostMessage) => void;
  onPin: (msg: GhostMessage) => void;
  onStar: (msg: GhostMessage) => void;
  onForward: (msg: GhostMessage) => void;
  onEdit: (msg: GhostMessage) => void;
  replyTarget?: GhostMessage | null;
  userId: string;
  isHighlighted?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  searchTerm?: string;
}

function highlightText(text: string, search: string) {
  if (!search) return text;
  const parts = text.split(new RegExp(`(${search})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === search.toLowerCase()
      ? <mark key={i} className="bg-primary/40 text-foreground rounded px-0.5">{part}</mark>
      : part
  );
}

function GhostMessageBubble({
  msg, isOwn, onDelete, onReact, onReply, onPin, onStar, onForward, onEdit,
  replyTarget, userId, isHighlighted, isPinned, isStarred, searchTerm
}: GhostMessageBubbleProps) {
  const [showActions, setShowActions] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showExtendedEmoji, setShowExtendedEmoji] = useState(false);
  const [selfDestructRemaining, setSelfDestructRemaining] = useState<number | null>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!msg.self_destruct_at) return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(msg.self_destruct_at!).getTime() - Date.now()) / 1000));
      setSelfDestructRemaining(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [msg.self_destruct_at]);

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    if (msg.message_type === "system") return;
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  if (msg.is_deleted) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-xs italic py-1 px-3">
        <Trash2 className="w-3 h-3" />
        <span>[MESSAGE DESTROYED]</span>
      </div>
    );
  }

  if (msg.message_type === "system") {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 my-2">
        <div className="flex-1 h-px bg-border/30" />
        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
          <Terminal className="w-3 h-3 text-secondary" />
          {msg.content}
        </span>
        <div className="flex-1 h-px bg-border/30" />
      </motion.div>
    );
  }

  const destructPercent = msg.self_destruct_at
    ? (selfDestructRemaining || 0) / ((new Date(msg.self_destruct_at).getTime() - new Date(msg.created_at).getTime()) / 1000) * 100
    : 0;

  return (
    <>
      {lightboxSrc && <ImageLightbox src={lightboxSrc} alt="image" onClose={() => setLightboxSrc(null)} />}
      {contextMenu && (
        <div className="fixed inset-0 z-[9997]" onClick={() => setContextMenu(null)}>
          <MessageContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            msg={msg}
            isOwn={isOwn}
            onClose={() => setContextMenu(null)}
            onReply={() => onReply(msg)}
            onCopy={handleCopy}
            onDelete={() => onDelete(msg.id)}
            onPin={() => onPin(msg)}
            onStar={() => onStar(msg)}
            onEdit={() => onEdit(msg)}
            onForward={() => onForward(msg)}
          />
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group flex gap-2.5 mb-2 ${isOwn ? "flex-row-reverse" : "flex-row"} ${isHighlighted ? "bg-primary/5 rounded-xl px-2 py-1 -mx-2" : ""}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => { setShowActions(false); setShowEmojis(false); setShowExtendedEmoji(false); }}
        onContextMenu={handleContextMenu}
      >
        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 font-mono border cursor-pointer select-none"
          style={{ backgroundColor: msg.sender_color + "22", color: msg.sender_color, borderColor: msg.sender_color + "44" }}
          title={msg.sender_codename}
        >
          {msg.sender_codename?.[0]}
        </div>

        <div className={`flex flex-col max-w-[72%] ${isOwn ? "items-end" : "items-start"}`}>
          {/* Header */}
          <div className={`flex items-center gap-2 mb-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-xs font-mono font-bold" style={{ color: msg.sender_color }}>
              {msg.sender_codename}
            </span>
            {isPinned && <Pin className="w-3 h-3 text-yellow-400" />}
            {isStarred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
            {selfDestructRemaining !== null && (
              <span className="text-destructive animate-pulse flex items-center gap-1 text-xs font-mono">
                <Clock className="w-3 h-3" />
                {selfDestructRemaining}s
              </span>
            )}
          </div>

          {/* Reply reference */}
          {replyTarget && !replyTarget.is_deleted && (
            <div className={`text-xs font-mono border-l-2 border-primary/50 pl-2 mb-1.5 max-w-full bg-primary/5 rounded-r-lg pr-3 py-1 ${isOwn ? "border-r-2 border-l-0 pl-3 pr-2 rounded-l-lg rounded-r-none" : ""}`}>
              <span className="font-bold" style={{ color: replyTarget.sender_color }}>
                {replyTarget.sender_codename}
              </span>
              <span className="text-muted-foreground ml-2 line-clamp-1">{replyTarget.content?.slice(0, 60)}</span>
            </div>
          )}

          {/* Bubble */}
          <div
            className={`relative rounded-2xl px-4 py-2.5 max-w-full font-mono text-sm select-text ${isOwn ? "rounded-tr-sm" : "rounded-tl-sm"}`}
            style={{
              background: isOwn
                ? `linear-gradient(135deg, hsl(261 87% 50% / 0.25), hsl(261 87% 40% / 0.15))`
                : `rgba(255,255,255,0.05)`,
              borderWidth: 1,
              borderStyle: "solid",
              borderColor: isOwn ? "hsl(261 87% 50% / 0.35)" : "rgba(255,255,255,0.08)",
            }}
          >
            {/* Self-destruct progress bar */}
            {selfDestructRemaining !== null && (
              <div className="absolute top-0 left-0 h-0.5 rounded-full bg-destructive/60 transition-all duration-1000" style={{ width: `${destructPercent}%` }} />
            )}

            {/* Image */}
            {msg.message_type === "image" && msg.file_url && (
              <div className="relative group/img mb-2">
                <img
                  src={msg.file_url}
                  alt={msg.file_name || "image"}
                  className="max-w-full rounded-lg max-h-64 object-cover cursor-zoom-in"
                  onClick={() => setLightboxSrc(msg.file_url!)}
                />
                <button
                  onClick={() => setLightboxSrc(msg.file_url!)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <a
                  href={msg.file_url}
                  download={msg.file_name}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover/img:opacity-100 transition-opacity"
                >
                  <Download className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* File */}
            {msg.message_type === "file" && msg.file_url && (
              <a
                href={msg.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-border/30 hover:border-secondary/40 transition-colors mb-2 group/file"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-secondary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate text-foreground">{msg.file_name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{formatFileSize(msg.file_size)}</div>
                </div>
                <Download className="w-4 h-4 text-muted-foreground group-hover/file:text-secondary transition-colors flex-shrink-0" />
              </a>
            )}

            {/* Text content with formatting */}
            {msg.content && (
              <div className="break-words">
                {searchTerm
                  ? <span>{highlightText(msg.content, searchTerm)}</span>
                  : renderMessageContent(msg.content)
                }
              </div>
            )}

            {/* Timestamp + status */}
            <div className={`text-xs text-muted-foreground/60 mt-1.5 flex items-center gap-1.5 ${isOwn ? "justify-end" : "justify-start"}`}>
              <span>{formatTime(msg.created_at)}</span>
              {isOwn && <CheckCheck className="w-3 h-3 text-secondary/70" />}
              {copied && <span className="text-secondary text-xs">Copied!</span>}
            </div>
          </div>

          {/* Reactions */}
          {Object.keys(msg.reactions || {}).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {Object.entries(msg.reactions).map(([emoji, users]) => (
                <motion.button
                  key={emoji}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onReact(msg.id, emoji)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-all font-mono flex items-center gap-1
                    ${(users as string[]).includes(userId)
                      ? "border-primary/60 bg-primary/15 text-foreground"
                      : "border-border/30 bg-white/4 hover:border-primary/30 text-muted-foreground"
                    }`}
                >
                  <span>{emoji}</span>
                  <span className="text-xs">{(users as string[]).length}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <AnimatePresence>
          {showActions && msg.message_type !== "system" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              className={`flex flex-col gap-1 self-start mt-6 ${isOwn ? "order-first" : "order-last"}`}
            >
              <button onClick={() => onReply(msg)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors" title="Reply">
                <Reply className="w-3.5 h-3.5" />
              </button>
              <div className="relative">
                <button onClick={() => setShowEmojis(!showEmojis)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors" title="React">
                  <Smile className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {showEmojis && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`absolute ${isOwn ? "right-8" : "left-8"} top-0 z-50 rounded-2xl shadow-xl p-2`}
                      style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 18%)", width: 280 }}
                    >
                      <div className="grid grid-cols-8 gap-1 mb-2">
                        {EMOJI_REACTIONS.map((e) => (
                          <button key={e} onClick={() => { onReact(msg.id, e); setShowEmojis(false); }} className="text-base hover:scale-125 transition-transform p-0.5 rounded hover:bg-white/10">
                            {e}
                          </button>
                        ))}
                      </div>
                      <div className="h-px bg-border/30 mb-2" />
                      <div className="grid grid-cols-8 gap-1">
                        {EMOJI_EXTENDED.map((e) => (
                          <button key={e} onClick={() => { onReact(msg.id, e); setShowEmojis(false); }} className="text-base hover:scale-125 transition-transform p-0.5 rounded hover:bg-white/10">
                            {e}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <button onClick={handleCopy} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors" title="Copy">
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onPin(msg)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 transition-colors" title="Pin">
                <Pin className="w-3.5 h-3.5" />
              </button>
              {isOwn && (
                <button onClick={() => onDelete(msg.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Destroy">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// Search overlay
function GhostSearchOverlay({
  messages, onClose, onJumpTo
}: {
  messages: GhostMessage[];
  onClose: () => void;
  onJumpTo: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = query.trim()
    ? messages.filter((m) =>
        m.content?.toLowerCase().includes(query.toLowerCase()) && !m.is_deleted && m.message_type !== "system"
      )
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="absolute inset-x-0 top-0 z-40 rounded-t-none rounded-b-2xl shadow-2xl overflow-hidden"
      style={{ background: "hsl(0 0% 6%)", border: "1px solid hsl(261 87% 50% / 0.3)", borderTop: "none" }}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/20">
        <Search className="w-4 h-4 text-primary flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="SEARCH TRANSMISSIONS..."
          className="flex-1 bg-transparent text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <span className="text-xs text-muted-foreground font-mono">{results.length} FOUND</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {results.length === 0 && query && (
          <div className="text-center py-8 text-xs text-muted-foreground font-mono">NO RESULTS — SIGNAL LOST</div>
        )}
        {results.map((msg) => (
          <button
            key={msg.id}
            onClick={() => { onJumpTo(msg.id); onClose(); }}
            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-border/10"
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono flex-shrink-0 mt-0.5 border border-white/10"
              style={{ backgroundColor: msg.sender_color + "22", color: msg.sender_color }}>
              {msg.sender_codename?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xs font-bold font-mono" style={{ color: msg.sender_color }}>{msg.sender_codename}</span>
                <span className="text-xs text-muted-foreground font-mono">{formatTime(msg.created_at)}</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono truncate">{highlightText(msg.content || "", query)}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Pinned messages bar
function PinnedBar({ msg, onClose }: { msg: GhostMessage; onClose: () => void }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="flex items-center gap-3 px-4 py-2 border-b border-yellow-400/20 bg-yellow-400/5 flex-shrink-0"
    >
      <Pin className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-xs font-mono text-yellow-400/80 mr-2">PINNED:</span>
        <span className="text-xs font-mono text-muted-foreground truncate">{msg.content?.slice(0, 80)}</span>
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground flex-shrink-0">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}

// Formatting toolbar
function FormattingBar({ onFormat }: { onFormat: (wrap: string) => void }) {
  return (
    <div className="flex items-center gap-1 px-2 py-1 border-b border-border/20 bg-background/50">
      <button onClick={() => onFormat("**")} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors text-xs font-bold" title="Bold (**text**)">B</button>
      <button onClick={() => onFormat("_")} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors text-xs italic" title="Italic (_text_)">I</button>
      <button onClick={() => onFormat("`")} className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-white/8 transition-colors" title="Inline code (`code`)">
        <Code className="w-3 h-3" />
      </button>
      <div className="w-px h-4 bg-border/30 mx-1" />
      <span className="text-xs text-muted-foreground font-mono">Enter ↵ send · Shift+Enter newline</span>
    </div>
  );
}

// Stats panel
function StatsPanel({ messages, members, userId }: { messages: GhostMessage[]; members: GhostMember[]; userId: string }) {
  const myMessages = messages.filter((m) => m.sender_id === userId && !m.is_deleted);
  const totalMessages = messages.filter((m) => !m.is_deleted && m.message_type !== "system").length;
  const images = messages.filter((m) => m.message_type === "image").length;
  const files = messages.filter((m) => m.message_type === "file").length;
  const topSender = [...members].sort((a, b) => {
    const aCount = messages.filter((m) => m.sender_id === a.user_id).length;
    const bCount = messages.filter((m) => m.sender_id === b.user_id).length;
    return bCount - aCount;
  })[0];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-48 border-l border-border/20 bg-background/50 p-3 font-mono overflow-y-auto"
    >
      <div className="text-xs font-black tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
        <BarChart2 className="w-3.5 h-3.5 text-primary" />
        INTEL
      </div>
      <div className="space-y-2">
        {[
          { label: "TOTAL MSG", value: totalMessages },
          { label: "YOUR MSG", value: myMessages.length },
          { label: "IMAGES", value: images },
          { label: "FILES", value: files },
          { label: "AGENTS", value: members.length },
          { label: "ONLINE", value: members.filter((m) => m.is_online).length },
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-xs font-bold text-secondary">{value}</span>
          </div>
        ))}
        {topSender && (
          <div className="pt-2 border-t border-border/20">
            <div className="text-xs text-muted-foreground mb-1">TOP AGENT</div>
            <div className="text-xs font-bold" style={{ color: topSender.avatar_color }}>
              {topSender.codename}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface GhostChatWindowProps {
  roomId: string;
  roomName: string;
  userId: string;
  inviteCode?: string | null;
  onClose?: () => void;
}

export function GhostChatWindow({ roomId, roomName, userId, inviteCode, onClose }: GhostChatWindowProps) {
  const {
    messages, members, typingUsers, loading,
    sendMessage, sendFile, deleteMessage, addReaction, setTyping, markOnline
  } = useGhostChat(roomId, userId, inviteCode);

  const [input, setInput] = useState("");
  const [replyTo, setReplyTo] = useState<GhostMessage | null>(null);
  const [editingMsg, setEditingMsg] = useState<GhostMessage | null>(null);
  const [selfDestructSeconds, setSelfDestructSeconds] = useState<number | null>(null);
  const [showDestructMenu, setShowDestructMenu] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState<GhostMessage | null>(null);
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set());
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filter, setFilter] = useState<"all" | "images" | "files" | "starred">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement>>({});

  const myMember = members.find((m) => m.user_id === userId);
  const onlineCount = members.filter((m) => m.is_online).length;

  useEffect(() => {
    markOnline(true);
    return () => { markOnline(false); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    if (!showScrollDown) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showScrollDown]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setShowSearch((s) => !s);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setReplyTo(null);
        setEditingMsg(null);
      }
    };
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 120);
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    if (editingMsg) {
      // For now just clear edit (full edit would need DB update logic)
      setEditingMsg(null);
      setInput("");
      return;
    }

    await sendMessage(content, {
      selfDestruct: selfDestructSeconds || undefined,
      replyTo: replyTo?.id,
    });
    setInput("");
    setReplyTo(null);
    setSelfDestructSeconds(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    setTyping(val.length > 0);
  };

  const handleFormat = (wrap: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = input.slice(start, end);
    const before = input.slice(0, start);
    const after = input.slice(end);
    const newVal = selected
      ? `${before}${wrap}${selected}${wrap}${after}`
      : `${before}${wrap}${wrap}${after}`;
    setInput(newVal);
    setTimeout(() => {
      ta.focus();
      const pos = selected ? end + wrap.length * 2 : start + wrap.length;
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleJumpTo = (id: string) => {
    setHighlightId(id);
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => setHighlightId(null), 2500);
  };

  const handlePin = (msg: GhostMessage) => {
    setPinnedIds((prev) => {
      const next = new Set(prev);
      if (next.has(msg.id)) next.delete(msg.id);
      else next.add(msg.id);
      return next;
    });
    setPinnedMsg((prev) => prev?.id === msg.id ? null : msg);
  };

  const handleStar = (msg: GhostMessage) => {
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(msg.id)) next.delete(msg.id);
      else next.add(msg.id);
      return next;
    });
  };

  const handleForward = (msg: GhostMessage) => {
    if (msg.content) {
      setInput(`↪ ${msg.sender_codename}: ${msg.content}`);
      textareaRef.current?.focus();
    }
  };

  // Filter messages
  const filteredMessages = messages.filter((m) => {
    if (filter === "images") return m.message_type === "image";
    if (filter === "files") return m.message_type === "file";
    if (filter === "starred") return starredIds.has(m.id);
    return true;
  });

  // Group messages by date
  const groupedMessages: { date: string; msgs: GhostMessage[] }[] = [];
  filteredMessages.forEach((msg) => {
    const d = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (!last || last.date !== d) groupedMessages.push({ date: d, msgs: [msg] });
    else last.msgs.push(msg);
  });

  const DESTRUCT_OPTIONS = [
    { label: "10s", value: 10 },
    { label: "30s", value: 30 },
    { label: "1m", value: 60 },
    { label: "5m", value: 300 },
    { label: "30m", value: 1800 },
    { label: "OFF", value: null },
  ];

  const FILTER_OPTIONS: { label: string; value: typeof filter; icon: React.ReactNode }[] = [
    { label: "ALL", value: "all", icon: <Hash className="w-3 h-3" /> },
    { label: "IMG", value: "images", icon: <ImageIcon className="w-3 h-3" /> },
    { label: "FILES", value: "files", icon: <FileText className="w-3 h-3" /> },
    { label: "★", value: "starred", icon: <Star className="w-3 h-3" /> },
  ];

  return (
    <div className="flex flex-col h-full relative">
      {/* Search overlay */}
      <AnimatePresence>
        {showSearch && (
          <GhostSearchOverlay
            messages={messages}
            onClose={() => setShowSearch(false)}
            onJumpTo={handleJumpTo}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/30 bg-background/80 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Hash className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <div className="font-black font-mono text-sm truncate gradient-text flex items-center gap-2">
              {roomName}
              {inviteCode && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-secondary/15 border border-secondary/30 text-secondary text-xs font-bold tracking-wider">
                  🔒 E2E
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block animate-pulse" />
              <span>{onlineCount} ONLINE</span>
              <span className="text-border">·</span>
              <span>{members.length} AGENTS</span>
            </div>
          </div>
        </div>

        {/* Header actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {FILTER_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                filter === f.value
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
            >
              {f.icon}
              <span className="hidden xl:inline">{f.label}</span>
            </button>
          ))}
          <div className="w-px h-4 bg-border/30 mx-1" />
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded-lg transition-colors ${showSearch ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            title="Search (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setSoundEnabled((s) => !s)}
            className={`p-1.5 rounded-lg transition-colors ${soundEnabled ? "text-secondary" : "text-muted-foreground"} hover:bg-white/5`}
            title="Sound"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-1.5 rounded-lg transition-colors ${showStats ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            title="Intel"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowMembers(!showMembers)}
            className={`p-1.5 rounded-lg transition-colors ${showMembers ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
            title="Agents"
          >
            <Users className="w-3.5 h-3.5" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pinned message bar */}
      <AnimatePresence>
        {pinnedMsg && <PinnedBar msg={pinnedMsg} onClose={() => setPinnedMsg(null)} />}
      </AnimatePresence>

      <div className="flex flex-1 min-h-0">
        {/* Messages */}
        <div className="flex flex-col flex-1 min-w-0">
          <div
            ref={chatContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 font-mono"
            style={{ scrollbarWidth: "thin" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-xs font-mono text-muted-foreground">ESTABLISHING SECURE CHANNEL...</p>
                </div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-4xl mb-3">
                    {filter === "starred" ? "⭐" : filter === "images" ? "🖼️" : filter === "files" ? "📁" : "👻"}
                  </div>
                  <p className="text-xs font-mono text-muted-foreground">
                    {filter !== "all" ? `NO ${filter.toUpperCase()} FOUND` : "CHANNEL SILENCE — FIRST TRANSMISSION?"}
                  </p>
                </div>
              </div>
            ) : (
              <>
                {groupedMessages.map(({ date, msgs }) => (
                  <div key={date}>
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border/15" />
                      <span className="text-xs font-mono text-muted-foreground/50 px-2 py-0.5 rounded border border-border/15 bg-white/2">{date}</span>
                      <div className="flex-1 h-px bg-border/15" />
                    </div>
                    {msgs.map((msg) => {
                      const replyTarget = msg.reply_to ? messages.find((m) => m.id === msg.reply_to) || null : null;
                      return (
                        <div
                          key={msg.id}
                          ref={(el) => { if (el) messageRefs.current[msg.id] = el; }}
                        >
                          <GhostMessageBubble
                            msg={msg}
                            isOwn={msg.sender_id === userId}
                            onDelete={deleteMessage}
                            onReact={addReaction}
                            onReply={setReplyTo}
                            onPin={handlePin}
                            onStar={handleStar}
                            onForward={handleForward}
                            onEdit={setEditingMsg}
                            replyTarget={replyTarget}
                            userId={userId}
                            isHighlighted={highlightId === msg.id}
                            isPinned={pinnedIds.has(msg.id)}
                            isStarred={starredIds.has(msg.id)}
                            searchTerm={showSearch ? searchTerm : undefined}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Typing indicator */}
                <AnimatePresence>
                  {typingUsers.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="flex items-center gap-2 text-xs font-mono text-muted-foreground py-2 px-2"
                    >
                      <div className="flex gap-0.5">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full bg-secondary animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                      <span className="text-secondary">{typingUsers.join(", ")}</span>
                      <span>{typingUsers.length === 1 ? "is" : "are"} transmitting...</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })}
                className="absolute bottom-28 right-6 p-2 rounded-full bg-primary/80 backdrop-blur-sm text-white shadow-glow-sm hover:bg-primary transition-colors z-10"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Edit banner */}
          <AnimatePresence>
            {editingMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-blue-500/10 border-t border-blue-500/20 flex items-center gap-3 font-mono text-xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-blue-400">EDITING:</span>
                  <span className="text-muted-foreground ml-2 truncate">{editingMsg.content?.slice(0, 60)}</span>
                </div>
                <button onClick={() => { setEditingMsg(null); setInput(""); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Reply banner */}
          <AnimatePresence>
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="px-4 py-2 bg-primary/10 border-t border-primary/20 flex items-center gap-3 font-mono text-xs"
              >
                <Reply className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-primary font-bold">{replyTo.sender_codename}</span>
                  <span className="text-muted-foreground ml-2 truncate">{replyTo.content?.slice(0, 60)}</span>
                </div>
                <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formatting toolbar */}
          <AnimatePresence>
            {showFormatBar && <FormattingBar onFormat={handleFormat} />}
          </AnimatePresence>

          {/* Input area */}
          <div className="px-3 py-3 border-t border-border/30 bg-background/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-end gap-2">
              {/* Self-destruct */}
              <div className="relative">
                <button
                  onClick={() => setShowDestructMenu(!showDestructMenu)}
                  className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                    selfDestructSeconds
                      ? "text-destructive bg-destructive/10 border border-destructive/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                  title="Self-destruct timer"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showDestructMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute bottom-12 left-0 rounded-xl p-2 flex flex-col gap-1 z-50 font-mono text-xs w-20 shadow-xl"
                      style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 18%)" }}
                    >
                      <div className="text-muted-foreground text-center mb-1 text-xs tracking-wider">BURN</div>
                      {DESTRUCT_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => { setSelfDestructSeconds(opt.value); setShowDestructMenu(false); }}
                          className={`px-2 py-1.5 rounded-lg text-center transition-colors ${
                            selfDestructSeconds === opt.value
                              ? "bg-destructive/20 text-destructive font-bold"
                              : "hover:bg-white/10 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Format toggle */}
              <button
                onClick={() => setShowFormatBar(!showFormatBar)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${showFormatBar ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}
                title="Formatting"
              >
                <Bold className="w-4 h-4" />
              </button>

              {/* File attach */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors flex-shrink-0"
                title="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Image attach */}
              <button
                onClick={() => imageInputRef.current?.click()}
                className="p-2 rounded-lg text-muted-foreground hover:text-secondary hover:bg-secondary/10 transition-colors flex-shrink-0"
                title="Send image"
              >
                <ImageIcon className="w-4 h-4" />
              </button>

              <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) sendFile(f); e.target.value = ""; }} />
              <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) sendFile(f); e.target.value = ""; }} />

              {/* Text input */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={editingMsg ? "EDIT TRANSMISSION..." : `Transmit as ${myMember?.codename || "GHOST"}...`}
                rows={1}
                className="flex-1 bg-white/5 border border-border/30 rounded-xl px-4 py-2.5 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none min-h-[40px] max-h-[120px] overflow-y-auto transition-colors"
                style={{ scrollbarWidth: "thin" }}
                onInput={(e) => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 120) + "px";
                }}
              />

              {/* Send */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl btn-glow text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Status bar */}
            <div className="flex items-center gap-3 mt-2 text-xs font-mono text-muted-foreground">
              {selfDestructSeconds && (
                <span className="text-destructive flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  BURN: {selfDestructSeconds >= 60 ? `${selfDestructSeconds / 60}m` : `${selfDestructSeconds}s`}
                </span>
              )}
              {replyTo && <span className="text-primary flex items-center gap-1"><Reply className="w-3 h-3" /> REPLY</span>}
              {editingMsg && <span className="text-blue-400 flex items-center gap-1"><Edit3 className="w-3 h-3" /> EDITING</span>}
              <span className="ml-auto flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-secondary" />
                <span className="text-secondary">E2E SECURED</span>
              </span>
            </div>
          </div>
        </div>

        {/* Members sidebar */}
        <AnimatePresence>
          {showMembers && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 180, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-border/20 bg-background/50 overflow-hidden flex-shrink-0 flex flex-col"
            >
              <div className="p-3 border-b border-border/20">
                <div className="text-xs font-black font-mono tracking-widest text-muted-foreground flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-primary" />
                  AGENTS
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {/* Online */}
                {members.filter((m) => m.is_online).length > 0 && (
                  <div className="text-xs font-mono text-secondary/60 px-2 py-1 tracking-wider">
                    ONLINE — {members.filter((m) => m.is_online).length}
                  </div>
                )}
                {members.filter((m) => m.is_online).map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
                {members.filter((m) => !m.is_online).length > 0 && (
                  <div className="text-xs font-mono text-muted-foreground/50 px-2 py-1 tracking-wider mt-2">
                    OFFLINE — {members.filter((m) => !m.is_online).length}
                  </div>
                )}
                {members.filter((m) => !m.is_online).map((member) => (
                  <MemberRow key={member.id} member={member} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats sidebar */}
        <AnimatePresence>
          {showStats && (
            <StatsPanel messages={messages} members={members} userId={userId} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function MemberRow({ member }: { member: GhostMember }) {
  const [showInfo, setShowInfo] = useState(false);
  return (
    <div
      className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group relative"
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black font-mono border"
          style={{ backgroundColor: member.avatar_color + "22", color: member.avatar_color, borderColor: member.avatar_color + "44" }}
        >
          {member.codename[0]}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background ${member.is_online ? "bg-secondary" : "bg-muted"}`} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-mono font-bold truncate" style={{ color: member.avatar_color }}>
          {member.codename}
        </div>
        <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wide truncate text-[10px]">
          {member.role}
        </div>
      </div>
      {member.is_online ? (
        <Wifi className="w-3 h-3 text-secondary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      ) : (
        <WifiOff className="w-3 h-3 text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}

      {/* Hover tooltip */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute right-full top-0 mr-2 z-50 rounded-xl p-3 shadow-xl w-40 font-mono"
            style={{ background: "hsl(0 0% 8%)", border: "1px solid hsl(0 0% 18%)" }}
          >
            <div className="font-bold text-xs mb-1" style={{ color: member.avatar_color }}>{member.codename}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{member.role}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <div className={`w-2 h-2 rounded-full ${member.is_online ? "bg-secondary animate-pulse" : "bg-muted"}`} />
              <span className="text-xs text-muted-foreground">{member.is_online ? "ACTIVE" : "GHOST MODE"}</span>
            </div>
            {member.last_seen && !member.is_online && (
              <div className="text-xs text-muted-foreground/60 mt-1">
                LAST: {formatTime(member.last_seen)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
