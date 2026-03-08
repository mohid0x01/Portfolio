import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder, File, FileText, Image, Code, Archive,
  Upload, Download, Trash2, Search, Grid, List,
  Lock, Shield, Plus, Eye, MoreHorizontal, HardDrive
} from "lucide-react";

interface FileItem {
  id: string;
  name: string;
  type: "folder" | "image" | "code" | "doc" | "archive" | "other";
  size: string;
  modified: string;
  encrypted: boolean;
  path: string;
}

const MOCK_FILES: FileItem[] = [
  { id: "1", name: "payloads", type: "folder", size: "—", modified: "2h ago", encrypted: false, path: "/" },
  { id: "2", name: "reports", type: "folder", size: "—", modified: "1d ago", encrypted: true, path: "/" },
  { id: "3", name: "wordlists", type: "folder", size: "—", modified: "3d ago", encrypted: false, path: "/" },
  { id: "4", name: "nuclei-results.txt", type: "doc", size: "24 KB", modified: "1h ago", encrypted: false, path: "/" },
  { id: "5", name: "recon-target.json", type: "code", size: "8 KB", modified: "3h ago", encrypted: true, path: "/" },
  { id: "6", name: "vulnerability-report.pdf", type: "doc", size: "1.2 MB", modified: "1d ago", encrypted: true, path: "/" },
  { id: "7", name: "screenshots.zip", type: "archive", size: "15 MB", modified: "2d ago", encrypted: false, path: "/" },
  { id: "8", name: "subdomain-list.txt", type: "doc", size: "45 KB", modified: "4h ago", encrypted: false, path: "/" },
  { id: "9", name: "burpsuite-export.xml", type: "code", size: "3.4 MB", modified: "6h ago", encrypted: false, path: "/" },
  { id: "10", name: "exploit-poc.py", type: "code", size: "2 KB", modified: "30m ago", encrypted: true, path: "/" },
  { id: "11", name: "target-screenshot.png", type: "image", size: "890 KB", modified: "1h ago", encrypted: false, path: "/" },
  { id: "12", name: "credentials-encrypted.vault", type: "archive", size: "1 KB", modified: "5d ago", encrypted: true, path: "/" },
];

const TYPE_ICONS: Record<string, React.ElementType> = {
  folder: Folder,
  image: Image,
  code: Code,
  doc: FileText,
  archive: Archive,
  other: File,
};

const TYPE_COLORS: Record<string, string> = {
  folder: "text-yellow-400",
  image: "text-blue-400",
  code: "text-secondary",
  doc: "text-primary",
  archive: "text-orange-400",
  other: "text-muted-foreground",
};

export function AdminFileVault() {
  const [files, setFiles] = useState<FileItem[]>(MOCK_FILES);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | FileItem["type"]>("all");

  const filtered = files.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== "all" && f.type !== filterType) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  };

  const del = () => {
    setFiles((fs) => fs.filter((f) => !selected.includes(f.id)));
    setSelected([]);
  };

  const totalSize = "67.3 MB";
  const encrypted = files.filter((f) => f.encrypted).length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Shield className="w-6 h-6" />
            File Vault
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Encrypted file storage — ghost protocol</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="glass px-3 py-1.5 rounded-xl text-xs text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />Upload
          </button>
          <button className="btn-glow flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white">
            <Plus className="w-3.5 h-3.5" />New Folder
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Files", value: files.length, icon: HardDrive, color: "text-primary", bg: "bg-primary/10" },
          { label: "Encrypted", value: encrypted, icon: Lock, color: "text-secondary", bg: "bg-secondary/10" },
          { label: "Storage Used", value: totalSize, icon: Archive, color: "text-blue-400", bg: "bg-blue-400/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="glass rounded-2xl p-4 border border-border/20 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div>
              <div className="text-xl font-black">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-8 pr-3 py-2 rounded-xl glass text-sm border border-border/20 focus:border-primary/40 focus:outline-none transition-colors"
          />
        </div>
        {/* Type filter */}
        <div className="flex items-center gap-1">
          {(["all", "folder", "code", "doc", "image", "archive"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                filterType === t ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground glass"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        {/* View toggle */}
        <div className="flex items-center glass rounded-lg p-0.5">
          <button onClick={() => setView("grid")} className={`p-1.5 rounded-md transition-colors ${view === "grid" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setView("list")} className={`p-1.5 rounded-md transition-colors ${view === "list" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
        {selected.length > 0 && (
          <button onClick={del} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors border border-destructive/20">
            <Trash2 className="w-3.5 h-3.5" />Delete ({selected.length})
          </button>
        )}
      </div>

      {/* Files */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          <AnimatePresence>
            {filtered.map((file, i) => {
              const Icon = TYPE_ICONS[file.type];
              const isSelected = selected.includes(file.id);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleSelect(file.id)}
                  className={`glass rounded-2xl p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-all border ${
                    isSelected
                      ? "border-primary/40 bg-primary/10"
                      : "border-border/20 hover:border-primary/20 hover:bg-muted/20"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-10 h-10 ${TYPE_COLORS[file.type]}`} />
                    {file.encrypted && <Lock className="w-3 h-3 text-secondary absolute -bottom-0.5 -right-0.5" />}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-medium truncate max-w-20">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{file.size}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="glass rounded-2xl border border-border/20 overflow-hidden">
          <div className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 px-4 py-2.5 bg-muted/10 text-xs text-muted-foreground font-medium border-b border-border/20">
            <span className="w-4"></span>
            <span>Name</span>
            <span>Size</span>
            <span>Modified</span>
            <span>Security</span>
            <span></span>
          </div>
          <AnimatePresence>
            {filtered.map((file, i) => {
              const Icon = TYPE_ICONS[file.type];
              const isSelected = selected.includes(file.id);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => toggleSelect(file.id)}
                  className={`grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-3 items-center px-4 py-2.5 border-b border-border/10 last:border-0 cursor-pointer transition-colors text-xs ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/10"
                  }`}
                >
                  <input type="checkbox" checked={isSelected} readOnly className="accent-primary w-3.5 h-3.5" />
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 flex-shrink-0 ${TYPE_COLORS[file.type]}`} />
                    <span className="truncate font-medium">{file.name}</span>
                  </div>
                  <span className="text-muted-foreground">{file.size}</span>
                  <span className="text-muted-foreground">{file.modified}</span>
                  <span>
                    {file.encrypted
                      ? <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary border border-secondary/20 flex items-center gap-1"><Lock className="w-2.5 h-2.5" />ENC</span>
                      : <span className="text-[10px] text-muted-foreground/40">—</span>
                    }
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="p-1 rounded text-muted-foreground hover:text-primary transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="p-1 rounded text-muted-foreground hover:text-secondary transition-colors"><Download className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setFiles((fs) => fs.filter((f) => f.id !== file.id)); }} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
