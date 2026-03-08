import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, User, Bell, Shield, Palette, Code,
  Save, Eye, EyeOff, RefreshCw, Check, Key,
  Moon, Sun, Zap, Lock,
  ToggleLeft, ToggleRight, ChevronRight, Info
} from "lucide-react";
import { useTheme } from "@/lib/theme";

type Section = "profile" | "security" | "notifications" | "appearance" | "advanced";

const SECTION_ICONS: Record<Section, React.ElementType> = {
  profile: User,
  security: Shield,
  notifications: Bell,
  appearance: Palette,
  advanced: Code,
};

export function AdminSettings() {
  const [section, setSection] = useState<Section>("profile");
  const [saved, setSaved] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { theme, setTheme } = useTheme();

  // Profile
  const [profile, setProfile] = useState({ name: "Ghost Admin", email: "admin@chat.com", bio: "Cybersecurity researcher & bug hunter", handle: "gh0st_admin" });

  // Security
  const [security, setSecurity] = useState({ mfa: false, sessionTimeout: "24h", apiKey: "sk-ghost-••••••••••••••••", loginNotif: true, ipWhitelist: "" });

  // Notifications
  const [notifs, setNotifs] = useState({ newVisitor: true, botDetect: true, threatAlert: true, chatMsg: true, dailyReport: false, weeklyReport: true });

  // Appearance
  const [appearance, setAppearance] = useState({ accentColor: "indigo", theme: "dark", fontSize: "md", animations: true, blur: true, compactMode: false });

  // Advanced
  const [advanced, setAdvanced] = useState({ debugMode: false, apiRateLimit: "100", logRetention: "30", cacheEnabled: true, betaFeatures: false });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button onClick={() => onChange(!value)} className="flex-shrink-0">
      {value
        ? <ToggleRight className="w-6 h-6 text-secondary" />
        : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
      }
    </button>
  );

  const SettingRow = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/10 last:border-0">
      <div>
        <div className="text-sm font-medium">{label}</div>
        {desc && <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>}
      </div>
      <div className="flex-shrink-0 ml-4">{children}</div>
    </div>
  );

  const ACCENT_COLORS = [
    { name: "indigo", bg: "hsl(261 87% 50%)" },
    { name: "teal", bg: "hsl(162 72% 46%)" },
    { name: "blue", bg: "hsl(200 80% 55%)" },
    { name: "rose", bg: "hsl(340 75% 55%)" },
    { name: "amber", bg: "hsl(35 90% 55%)" },
    { name: "violet", bg: "hsl(280 70% 55%)" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black gradient-text flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Settings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Configure admin panel preferences</p>
        </div>
        <motion.button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
            saved ? "bg-secondary/20 text-secondary border border-secondary/30" : "btn-glow text-white"
          }`}
          whileTap={{ scale: 0.97 }}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Changes"}
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <div className="glass rounded-2xl p-3 border border-border/20 h-fit">
          {(Object.keys(SECTION_ICONS) as Section[]).map((s) => {
            const Icon = SECTION_ICONS[s];
            return (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium capitalize transition-all mb-0.5 ${
                  section === s
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                <Icon className="w-4 h-4" />
                {s}
                {section === s && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 glass rounded-2xl p-5 border border-border/20">
          <AnimatePresence mode="wait">
            {section === "profile" && (
              <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><User className="w-4 h-4 text-primary" />Profile Settings</h3>
                {/* Avatar */}
                <div className="flex items-center gap-4 pb-4 border-b border-border/20">
                  <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center text-2xl font-black text-primary">
                    {profile.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{profile.name}</p>
                    <p className="text-xs text-muted-foreground">{profile.email}</p>
                    <button className="text-xs text-primary mt-1 hover:underline">Change avatar</button>
                  </div>
                </div>
                {[
                  { label: "Display Name", key: "name" as const, placeholder: "Your name" },
                  { label: "Email", key: "email" as const, placeholder: "admin@ghost.io" },
                  { label: "Handle", key: "handle" as const, placeholder: "@handle" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs text-muted-foreground mb-1.5">{label}</label>
                    <input
                      value={profile[key]}
                      onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="w-full px-3 py-2.5 rounded-xl glass text-sm border border-border/20 focus:border-primary/40 focus:outline-none transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-muted-foreground mb-1.5">Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl glass text-sm border border-border/20 focus:border-primary/40 focus:outline-none transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}

            {section === "security" && (
              <motion.div key="security" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Shield className="w-4 h-4 text-destructive" />Security Settings</h3>
                <div className="divide-y divide-border/10">
                  <SettingRow label="Two-Factor Authentication" desc="Add extra security with TOTP authenticator">
                    <Toggle value={security.mfa} onChange={(v) => setSecurity((s) => ({ ...s, mfa: v }))} />
                  </SettingRow>
                  <SettingRow label="Login Notifications" desc="Email alert on new admin login">
                    <Toggle value={security.loginNotif} onChange={(v) => setSecurity((s) => ({ ...s, loginNotif: v }))} />
                  </SettingRow>
                  <SettingRow label="Session Timeout" desc="Auto logout after inactivity">
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity((s) => ({ ...s, sessionTimeout: e.target.value }))}
                      className="glass px-3 py-1.5 rounded-lg text-xs border border-border/20 focus:outline-none focus:border-primary/40"
                    >
                      {["1h", "4h", "12h", "24h", "7d", "Never"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </SettingRow>
                  <div className="py-3">
                    <label className="block text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Key className="w-3 h-3" /> API Key</label>
                    <div className="flex items-center gap-2">
                      <input
                        value={security.apiKey}
                        type={showPass ? "text" : "password"}
                        readOnly
                        className="flex-1 px-3 py-2 rounded-xl glass text-sm font-mono border border-border/20 focus:outline-none"
                      />
                      <button onClick={() => setShowPass((v) => !v)} className="glass p-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button className="glass p-2 rounded-xl text-muted-foreground hover:text-primary transition-colors" title="Regenerate">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {section === "notifications" && (
              <motion.div key="notifs" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Bell className="w-4 h-4 text-yellow-400" />Notification Preferences</h3>
                <div className="divide-y divide-border/10">
                  {[
                    { key: "newVisitor" as const, label: "New Visitor", desc: "Alert when a new visitor lands" },
                    { key: "botDetect" as const, label: "Bot Detected", desc: "Alert when a bot is fingerprinted" },
                    { key: "threatAlert" as const, label: "Security Threats", desc: "Alert on SQLi/XSS/brute-force attempts" },
                    { key: "chatMsg" as const, label: "Ghost Chat Messages", desc: "Notify on new chat messages" },
                    { key: "dailyReport" as const, label: "Daily Report", desc: "Email summary every day at 09:00" },
                    { key: "weeklyReport" as const, label: "Weekly Report", desc: "Weekly analytics digest" },
                  ].map(({ key, label, desc }) => (
                    <SettingRow key={key} label={label} desc={desc}>
                      <Toggle value={notifs[key]} onChange={(v) => setNotifs((n) => ({ ...n, [key]: v }))} />
                    </SettingRow>
                  ))}
                </div>
              </motion.div>
            )}

            {section === "appearance" && (
              <motion.div key="appearance" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Palette className="w-4 h-4 text-blue-400" />Appearance</h3>
                <div className="space-y-5">
                  {/* Theme Mode */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-3 block font-semibold uppercase tracking-widest">Color Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { val: "dark" as const, icon: Moon, label: "Dark Mode", desc: "Cyberpunk dark theme" },
                        { val: "light" as const, icon: Sun, label: "Light Mode", desc: "Clean light theme" },
                      ]).map(({ val, icon: Icon, label: lbl, desc }) => (
                        <button
                          key={val}
                          onClick={() => setTheme(val)}
                          className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border-2 transition-all text-left ${
                            theme === val
                              ? "border-primary bg-primary/10"
                              : "border-border/30 hover:border-border/60 bg-muted/10"
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${theme === val ? "bg-primary/20" : "bg-muted/30"}`}>
                            <Icon className={`w-5 h-5 ${theme === val ? "text-primary" : "text-muted-foreground"}`} />
                          </div>
                          <div>
                            <p className={`text-sm font-bold ${theme === val ? "text-primary" : "text-foreground"}`}>{lbl}</p>
                            <p className="text-xs text-muted-foreground">{desc}</p>
                          </div>
                          {theme === val && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">Active</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Accent colors */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Accent Color</label>
                    <div className="flex gap-2">
                      {ACCENT_COLORS.map(({ name, bg }) => (
                        <button
                          key={name}
                          onClick={() => setAppearance((a) => ({ ...a, accentColor: name }))}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${appearance.accentColor === name ? "border-foreground scale-110" : "border-transparent"}`}
                          style={{ background: bg }}
                          title={name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="divide-y divide-border/10">
                    <SettingRow label="Animations" desc="Enable smooth transitions and micro-interactions">
                      <Toggle value={appearance.animations} onChange={(v) => setAppearance((a) => ({ ...a, animations: v }))} />
                    </SettingRow>
                    <SettingRow label="Glassmorphism Blur" desc="Backdrop blur effects (performance impact)">
                      <Toggle value={appearance.blur} onChange={(v) => setAppearance((a) => ({ ...a, blur: v }))} />
                    </SettingRow>
                    <SettingRow label="Compact Mode" desc="Reduce padding for information density">
                      <Toggle value={appearance.compactMode} onChange={(v) => setAppearance((a) => ({ ...a, compactMode: v }))} />
                    </SettingRow>
                  </div>
                </div>
              </motion.div>
            )}

            {section === "advanced" && (
              <motion.div key="advanced" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Code className="w-4 h-4 text-secondary" />Advanced</h3>
                <div className="space-y-1 mb-3 p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400 flex items-center gap-1.5"><Info className="w-3.5 h-3.5" />Advanced settings may affect system stability</p>
                </div>
                <div className="divide-y divide-border/10">
                  <SettingRow label="Debug Mode" desc="Verbose logging in browser console">
                    <Toggle value={advanced.debugMode} onChange={(v) => setAdvanced((a) => ({ ...a, debugMode: v }))} />
                  </SettingRow>
                  <SettingRow label="Response Cache" desc="Cache API responses for performance">
                    <Toggle value={advanced.cacheEnabled} onChange={(v) => setAdvanced((a) => ({ ...a, cacheEnabled: v }))} />
                  </SettingRow>
                  <SettingRow label="Beta Features" desc="Early access to experimental features">
                    <Toggle value={advanced.betaFeatures} onChange={(v) => setAdvanced((a) => ({ ...a, betaFeatures: v }))} />
                  </SettingRow>
                  <SettingRow label="API Rate Limit (req/min)" desc="">
                    <input
                      value={advanced.apiRateLimit}
                      onChange={(e) => setAdvanced((a) => ({ ...a, apiRateLimit: e.target.value }))}
                      className="glass w-20 px-3 py-1.5 rounded-lg text-xs text-center border border-border/20 focus:outline-none focus:border-primary/40"
                    />
                  </SettingRow>
                  <SettingRow label="Log Retention (days)" desc="">
                    <input
                      value={advanced.logRetention}
                      onChange={(e) => setAdvanced((a) => ({ ...a, logRetention: e.target.value }))}
                      className="glass w-20 px-3 py-1.5 rounded-lg text-xs text-center border border-border/20 focus:outline-none focus:border-primary/40"
                    />
                  </SettingRow>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
