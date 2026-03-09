import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  Bug,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Lock,
  Zap,
  Target,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const bugBountySchema = z.object({
  reporter_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  reporter_contact: z.string().trim().email("Must be a valid email").max(255),
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  category: z.enum(["xss", "sqli", "rce", "idor", "csrf", "ssrf", "auth", "disclosure", "other"]),
  cvss_score: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined))
    .pipe(z.number().min(0).max(10).optional()),
  affected_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  description: z.string().trim().min(20, "Please provide a detailed description (min 20 chars)").max(2000),
  steps_to_reproduce: z.string().trim().min(10, "Please provide steps to reproduce").max(2000),
  expected_behavior: z.string().trim().max(1000).optional(),
  actual_behavior: z.string().trim().max(1000).optional(),
  proof_of_concept: z.string().trim().max(3000).optional(),
});

type FormData = z.input<typeof bugBountySchema>;

const SEVERITY_OPTIONS = [
  { value: "critical", label: "Critical", color: "text-red-400 border-red-500/30 bg-red-500/10", desc: "CVSS 9.0–10.0 · RCE, Auth Bypass" },
  { value: "high", label: "High", color: "text-orange-400 border-orange-500/30 bg-orange-500/10", desc: "CVSS 7.0–8.9 · SQLi, SSRF" },
  { value: "medium", label: "Medium", color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10", desc: "CVSS 4.0–6.9 · XSS, IDOR" },
  { value: "low", label: "Low", color: "text-green-400 border-green-500/30 bg-green-500/10", desc: "CVSS 0.1–3.9 · Info Leak" },
  { value: "info", label: "Informational", color: "text-blue-400 border-blue-500/30 bg-blue-500/10", desc: "CVSS 0.0 · Best Practices" },
];

const CATEGORY_OPTIONS = [
  { value: "xss", label: "XSS" },
  { value: "sqli", label: "SQL Injection" },
  { value: "rce", label: "RCE" },
  { value: "idor", label: "IDOR" },
  { value: "csrf", label: "CSRF" },
  { value: "ssrf", label: "SSRF" },
  { value: "auth", label: "Auth Bypass" },
  { value: "disclosure", label: "Info Disclosure" },
  { value: "other", label: "Other" },
];

export default function BugBountyPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(bugBountySchema),
    defaultValues: {
      severity: "medium",
      category: "other",
    },
  });

  const selectedSeverity = form.watch("severity");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const row = {
        title: data.title,
        description: data.description,
        severity: data.severity,
        category: data.category,
        cvss_score: data.cvss_score ?? null,
        affected_url: data.affected_url || null,
        steps_to_reproduce: data.steps_to_reproduce,
        expected_behavior: data.expected_behavior || null,
        actual_behavior: data.actual_behavior || null,
        proof_of_concept: data.proof_of_concept || null,
        reporter_name: data.reporter_name,
        reporter_contact: data.reporter_contact,
        status: "open",
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from("bug_reports").insert(row as any);
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      toast({
        title: "Submission failed",
        description: "Please try again or contact directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-20"
            style={{ background: "radial-gradient(ellipse, hsl(var(--primary)), transparent)" }} />
        </div>

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-mono mb-6">
              <Shield className="w-3.5 h-3.5" />
              Responsible Disclosure Program
            </div>
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              Bug <span className="text-primary">Bounty</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Found a vulnerability? Report it responsibly. All valid reports are reviewed,
              acknowledged, and rewarded based on severity. Help keep the systems secure.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            {[
              { icon: <Zap className="w-4 h-4" />, label: "Fast Response", sub: "< 48h triage" },
              { icon: <Target className="w-4 h-4" />, label: "In Scope", sub: "All owned domains" },
              { icon: <Lock className="w-4 h-4" />, label: "Confidential", sub: "Safe harbor" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm">
                <span className="text-secondary">{s.icon}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.sub}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Form / Success */}
      <section className="pb-24 px-6">
        <div className="container mx-auto max-w-3xl">
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <GlassCard className="p-12 flex flex-col items-center gap-5" glow="secondary">
                  <div className="w-20 h-20 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-secondary" />
                  </div>
                  <h2 className="text-3xl font-black">Report Submitted!</h2>
                  <p className="text-muted-foreground max-w-md">
                    Your report has been securely received. You'll be contacted within 48 hours if
                    the vulnerability is confirmed. Thank you for responsible disclosure.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => { setSubmitted(false); form.reset(); }}
                  >
                    Submit Another Report
                  </Button>
                </GlassCard>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Reporter info */}
                    <GlassCard className="p-6 space-y-4">
                      <h2 className="font-semibold text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
                        <Bug className="w-3.5 h-3.5 text-primary" /> Reporter Info
                      </h2>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="reporter_name" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Name / Handle</FormLabel>
                            <FormControl><Input placeholder="0xMohid" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="reporter_contact" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Email</FormLabel>
                            <FormControl><Input type="email" placeholder="you@proton.me" {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>
                    </GlassCard>

                    {/* Vulnerability details */}
                    <GlassCard className="p-6 space-y-4">
                      <h2 className="font-semibold text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-secondary" /> Vulnerability Details
                      </h2>

                      <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vulnerability Title</FormLabel>
                          <FormControl><Input placeholder="Stored XSS in profile bio field" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      {/* Severity selector */}
                      <FormField control={form.control} name="severity" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Severity</FormLabel>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {SEVERITY_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => field.onChange(opt.value)}
                                className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all text-left ${opt.color} ${
                                  field.value === opt.value
                                    ? "ring-2 ring-offset-1 ring-offset-background ring-current scale-[1.03]"
                                    : "opacity-50 hover:opacity-80"
                                }`}
                              >
                                <div className="font-bold">{opt.label}</div>
                                <div className="opacity-70 mt-0.5 text-[10px] hidden sm:block">{opt.desc}</div>
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Category */}
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <div className="relative">
                              <select
                                {...field}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-8 appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {CATEGORY_OPTIONS.map((c) => (
                                  <option key={c.value} value={c.value}>{c.label}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* CVSS Score */}
                        <FormField control={form.control} name="cvss_score" render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVSS Score <span className="text-muted-foreground">(optional)</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                min="0"
                                max="10"
                                placeholder="e.g. 8.5"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      {/* Affected URL */}
                      <FormField control={form.control} name="affected_url" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Affected URL <span className="text-muted-foreground">(optional)</span></FormLabel>
                          <FormControl><Input placeholder="https://example.com/profile/edit" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </GlassCard>

                    {/* Description & repro */}
                    <GlassCard className="p-6 space-y-4">
                      <h2 className="font-semibold text-sm text-muted-foreground font-mono uppercase tracking-widest flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-primary" /> Description & Reproduction
                      </h2>

                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe the vulnerability, its impact, and affected components in detail..."
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="steps_to_reproduce" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steps to Reproduce</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={"1. Navigate to /profile/edit\n2. Insert payload <script>alert(1)</script> in bio\n3. Save and visit another user's view\n4. Observe XSS execution"}
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="expected_behavior" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expected Behavior <span className="text-muted-foreground">(optional)</span></FormLabel>
                            <FormControl>
                              <Textarea placeholder="Input should be sanitized..." className="min-h-[80px] font-mono text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="actual_behavior" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Actual Behavior <span className="text-muted-foreground">(optional)</span></FormLabel>
                            <FormControl>
                              <Textarea placeholder="Script executed in victim's browser..." className="min-h-[80px] font-mono text-sm" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="proof_of_concept" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Proof of Concept <span className="text-muted-foreground">(optional)</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={"# PoC\ncurl -X POST https://target.com/api/upload \\\n  -H 'Authorization: Bearer <token>' \\\n  -d 'payload=...'"}
                              className="min-h-[120px] font-mono text-sm"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </GlassCard>

                    {/* Disclaimer + submit */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <p className="text-xs text-muted-foreground flex-1">
                        By submitting, you agree to responsible disclosure guidelines.
                        Do not exploit vulnerabilities beyond proof-of-concept verification.
                      </p>
                      <Button
                        type="submit"
                        size="lg"
                        disabled={loading}
                        className="w-full sm:w-auto shrink-0 font-mono"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Submitting…
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Bug className="w-4 h-4" />
                            Submit Report
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
