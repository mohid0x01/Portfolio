import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Play, Trash2, Copy, Download, ChevronRight } from "lucide-react";

interface HistoryEntry {
  id: number;
  cmd: string;
  output: string;
  ts: string;
  type: "success" | "error" | "info";
}

const COMMANDS: Record<string, (args: string[]) => string> = {
  help: () => `Available commands:
  help          Show this help
  clear         Clear terminal
  whoami        Current user info
  date          Current date/time
  uptime        Session uptime
  echo [text]   Print text
  ls            List mock files
  cat [file]    Show file content
  ping [host]   Ping host (mock)
  curl [url]    HTTP request (mock)
  history       Show command history
  neofetch      System info
  version       App version info`,

  whoami: () => `admin@ghost-panel
UID: 0 (root)
Groups: admin, sudo, hackers
Shell: /bin/zsh
Logged in: ${new Date().toLocaleString()}`,

  date: () => new Date().toString(),

  uptime: () => {
    const s = Math.floor(Date.now() / 1000) % 86400;
    return `up ${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`;
  },

  ls: () => `-rwxr-xr-x  admin  admin  4096  visitor_logs.db
-rw-r--r--  admin  admin  2048  ghost_rooms.json
-rwxr-xr-x  admin  admin  8192  ghost_messages.db
drwxr-xr-x  admin  admin  4096  payloads/
drwxr-xr-x  admin  admin  4096  reports/
-rw-r--r--  admin  admin  1024  config.toml
-rw-------  admin  admin   512  .env`,

  "cat config.toml": () => `[server]
host = "0.0.0.0"
port = 443
tls = true

[database]
url = "***REDACTED***"
pool_size = 20

[auth]
jwt_secret = "***REDACTED***"
session_ttl = 86400

[ghost]
encryption = "AES-256-GCM"
e2e_enabled = true`,

  "cat .env": () => `⚠️  Permission denied: access to .env requires elevated privileges`,

  neofetch: () => `
 ██████╗ ██╗  ██╗ ██████╗ ███████╗████████╗
██╔════╝ ██║  ██║██╔═══██╗██╔════╝╚══██╔══╝
██║  ███╗███████║██║   ██║███████╗   ██║   
██║   ██║██╔══██║██║   ██║╚════██║   ██║   
╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   
 ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   

OS:        Ghost OS v3.0 (Dark Edition)
Kernel:    Linux 6.5.0-ghost-security
Shell:     zsh 5.9 (encrypted)
CPU:       Intel Xeon @ 3.6GHz (32 cores)
Memory:    64 GiB / 128 GiB
Disk:      2.1 TB / 4 TB (NVMe encrypted)
Network:   10 Gbps (TLS 1.3)
Uptime:    ${Math.floor(Math.random() * 30 + 1)} days
Locale:    en_US.UTF-8`,

  version: () => `Ghost Admin Panel v3.0.0
Build: ${Date.now()}
React: 18.3.1
Supabase: 2.x
Encryption: AES-256-GCM
License: MIT`,

  clear: () => "__CLEAR__",
};

export function AdminTerminal() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 0,
      cmd: "welcome",
      output: `Ghost Admin Terminal v3.0\nType 'help' for available commands.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ts: new Date().toLocaleTimeString(),
      type: "info",
    },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(1);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;

    setCmdHistory((h) => [cmd, ...h]);
    setHistIdx(-1);
    setInput("");

    const [base, ...args] = cmd.split(" ");
    const fullCmd = cmd.toLowerCase();
    const handler = COMMANDS[fullCmd] || COMMANDS[base.toLowerCase()];

    let output = "";
    let type: HistoryEntry["type"] = "success";

    if (handler) {
      output = handler(args);
    } else if (base === "echo") {
      output = args.join(" ");
    } else if (base === "ping") {
      const host = args[0] || "localhost";
      output = `PING ${host} (127.0.0.1): 56 data bytes\n64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.042 ms\n64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.039 ms\n--- ${host} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss`;
    } else if (base === "curl") {
      output = `HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"ok","message":"Mock response from ${args[0] || "localhost"}"}`;
    } else if (base === "history") {
      output = cmdHistory.slice(0, 20).map((c, i) => `  ${i + 1}  ${c}`).join("\n");
    } else {
      output = `bash: ${cmd}: command not found\nType 'help' to see available commands.`;
      type = "error";
    }

    if (output === "__CLEAR__") {
      setHistory([]);
      return;
    }

    setHistory((h) => [
      ...h,
      { id: nextId.current++, cmd, output, ts: new Date().toLocaleTimeString(), type },
    ]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") { run(); return; }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(idx);
      setInput(cmdHistory[idx] || "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx);
      setInput(idx === -1 ? "" : cmdHistory[idx]);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const matches = Object.keys(COMMANDS).filter((k) => k.startsWith(input));
      if (matches.length === 1) setInput(matches[0]);
    }
  };

  const exportLog = () => {
    const text = history.map((h) => `[${h.ts}] $ ${h.cmd}\n${h.output}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `terminal-log-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Ghost Terminal
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Encrypted shell — type 'help' for commands</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHistory([])} className="glass px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />Clear
          </button>
          <button onClick={exportLog} className="glass px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-secondary transition-colors flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />Export
          </button>
        </div>
      </div>

      {/* Terminal window */}
      <div
        className="flex-1 rounded-2xl border border-primary/20 overflow-hidden flex flex-col"
        style={{ background: "hsl(0 0% 3%)", boxShadow: "0 0 40px hsl(261 87% 50% / 0.1)" }}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Traffic lights bar */}
        <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/20" style={{ background: "hsl(0 0% 5%)" }}>
          <span className="w-3 h-3 rounded-full bg-destructive/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-secondary/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">ghost@admin — bash — 120×35</span>
        </div>

        {/* Output */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-sm scrollbar-thin">
          <AnimatePresence initial={false}>
            {history.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-0.5"
              >
                {entry.cmd !== "welcome" && (
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-secondary">ghost@admin</span>
                    <span className="text-muted-foreground">:</span>
                    <span className="text-primary">~</span>
                    <span className="text-muted-foreground">$</span>
                    <span className="text-foreground ml-1">{entry.cmd}</span>
                    <span className="ml-auto text-muted-foreground/40 text-[10px]">{entry.ts}</span>
                  </div>
                )}
                <pre
                  className={`text-xs whitespace-pre-wrap leading-relaxed pl-0 ${
                    entry.type === "error" ? "text-destructive" :
                    entry.type === "info" ? "text-primary/80" :
                    "text-secondary/90"
                  }`}
                >
                  {entry.output}
                </pre>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input line */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border/20" style={{ background: "hsl(0 0% 4.5%)" }}>
          <span className="text-secondary font-mono text-sm shrink-0">ghost@admin</span>
          <span className="text-muted-foreground font-mono text-sm">:</span>
          <span className="text-primary font-mono text-sm">~</span>
          <ChevronRight className="w-3 h-3 text-secondary shrink-0" />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            className="flex-1 bg-transparent text-foreground font-mono text-sm outline-none caret-primary"
            placeholder="type a command..."
          />
          <button onClick={run} className="p-1.5 rounded-lg text-muted-foreground hover:text-primary transition-colors">
            <Play className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
