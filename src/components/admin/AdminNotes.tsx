import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, Edit3, Save, X, Search, Tag, Clock, Star } from "lucide-react";

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  pinned: boolean;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const COLORS = [
  "hsl(261 87% 50% / 0.15)",
  "hsl(162 72% 46% / 0.15)",
  "hsl(35 90% 55% / 0.15)",
  "hsl(200 80% 55% / 0.15)",
  "hsl(340 75% 55% / 0.15)",
  "hsl(0 0% 12%)",
];

const COLOR_BORDERS = [
  "hsl(261 87% 50% / 0.3)",
  "hsl(162 72% 46% / 0.3)",
  "hsl(35 90% 55% / 0.3)",
  "hsl(200 80% 55% / 0.3)",
  "hsl(340 75% 55% / 0.3)",
  "hsl(0 0% 20%)",
];

const DEFAULT_NOTES: Note[] = [
  {
    id: "1",
    title: "Recon Checklist",
    content: `## Target Recon\n- [ ] Subfinder + Amass passive enum\n- [ ] httpx probe live hosts\n- [ ] Waybackurls endpoint mining\n- [ ] Shodan/Censys ASN lookup\n- [ ] GitHub dorking for secrets\n- [ ] Tech fingerprinting (Wappalyzer)\n- [ ] Google dork: site:target.com ext:env`,
    tags: ["recon", "checklist", "bounty"],
    pinned: true,
    color: COLORS[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Bug Bounty Targets",
    content: `## Active Programs\n\n**Google VRP** - $$$ Critical XSS / SSRF\n**Meta** - Logic bugs, Account Takeover\n**Apple** - iOS/macOS vulns\n**Hackerone Top** - Check daily for new programs\n\n## Pending Reports\n- SSRF in image upload → HackerOne #1234 (P2)\n- Stored XSS in comments → Bugcrowd (triage)`,
    tags: ["targets", "programs", "reports"],
    pinned: true,
    color: COLORS[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Admin Creds (Test)",
    content: `## Test Credentials\nadmin@chat.com : Ghost@Admin2025\n\n⚠️ Change before production!\n\n## DB Connection\nHost: localhost:5432\nDB: ghost_db\nUser: admin\nPass: ***stored in vault***`,
    tags: ["credentials", "admin"],
    pinned: false,
    color: COLORS[4],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const LS_KEY = "ghost-admin-notes";

export function AdminNotes() {
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_NOTES;
    } catch { return DEFAULT_NOTES; }
  });
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", tags: "", color: COLORS[0] });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(notes));
  }, [notes]);

  const save = () => {
    if (!draft.title.trim()) return;
    const now = new Date().toISOString();
    if (editing) {
      setNotes((ns) => ns.map((n) => n.id === editing.id
        ? { ...n, title: draft.title, content: draft.content, tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean), color: draft.color, updatedAt: now }
        : n
      ));
      setEditing(null);
    } else {
      const n: Note = {
        id: Date.now().toString(),
        title: draft.title,
        content: draft.content,
        tags: draft.tags.split(",").map((t) => t.trim()).filter(Boolean),
        pinned: false,
        color: draft.color,
        createdAt: now,
        updatedAt: now,
      };
      setNotes((ns) => [n, ...ns]);
      setCreating(false);
    }
    setDraft({ title: "", content: "", tags: "", color: COLORS[0] });
  };

  const del = (id: string) => setNotes((ns) => ns.filter((n) => n.id !== id));
  const pin = (id: string) => setNotes((ns) => ns.map((n) => n.id === id ? { ...n, pinned: !n.pinned } : n));

  const openEdit = (n: Note) => {
    setEditing(n);
    setDraft({ title: n.title, content: n.content, tags: n.tags.join(", "), color: n.color });
    setCreating(false);
  };

  const filtered = notes.filter((n) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s) || n.tags.some((t) => t.includes(s));
  }).sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const isFormOpen = creating || !!editing;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Secure Notes
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Encrypted local notes — stored in browser vault</p>
        </div>
        <button
          onClick={() => { setCreating(true); setEditing(null); setDraft({ title: "", content: "", tags: "", color: COLORS[0] }); }}
          className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />New Note
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notes, tags..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl glass text-sm placeholder:text-muted-foreground focus:outline-none border border-border/20 focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Note form */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl border border-primary/30 p-5" style={{ background: draft.color }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">{editing ? "Edit Note" : "New Note"}</h3>
                <button onClick={() => { setCreating(false); setEditing(null); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  placeholder="Note title..."
                  className="w-full px-3 py-2 rounded-xl bg-black/20 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-semibold border border-border/20 focus:border-primary/40 transition-colors"
                />
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  placeholder="Write your note... (supports Markdown)"
                  rows={6}
                  className="w-full px-3 py-2 rounded-xl bg-black/20 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-mono resize-none border border-border/20 focus:border-primary/40 transition-colors"
                />
                <input
                  value={draft.tags}
                  onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))}
                  placeholder="Tags (comma-separated: recon, xss, bug)"
                  className="w-full px-3 py-2 rounded-xl bg-black/20 text-foreground placeholder:text-muted-foreground focus:outline-none text-sm border border-border/20 focus:border-primary/40 transition-colors"
                />
                {/* Color picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Color:</span>
                  {COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setDraft((d) => ({ ...d, color: c }))}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${draft.color === c ? "border-foreground scale-110" : "border-transparent"}`}
                      style={{ background: c === "hsl(0 0% 12%)" ? "hsl(0 0% 20%)" : c.replace("0.15", "0.6") }}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="btn-glow flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white">
                    <Save className="w-3.5 h-3.5" />Save
                  </button>
                  <button onClick={() => { setCreating(false); setEditing(null); }} className="glass px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl p-4 flex flex-col gap-3 border transition-all hover:scale-[1.01]"
              style={{ background: note.color, borderColor: COLOR_BORDERS[COLORS.indexOf(note.color)] || "hsl(var(--border))" }}
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-bold text-sm leading-tight">{note.title}</h4>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => pin(note.id)} className={`p-1 rounded transition-colors ${note.pinned ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"}`}>
                    <Star className="w-3.5 h-3.5" fill={note.pinned ? "currentColor" : "none"} />
                  </button>
                  <button onClick={() => openEdit(note)} className="p-1 rounded text-muted-foreground hover:text-primary transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => del(note.id)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-4 font-mono leading-relaxed whitespace-pre-line">
                {note.content}
              </p>
              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((t) => (
                    <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-muted-foreground border border-border/20">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 mt-auto">
                <Clock className="w-3 h-3" />
                {new Date(note.updatedAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">{search ? "No notes match your search" : "No notes yet — create one!"}</p>
        </div>
      )}
    </div>
  );
}
