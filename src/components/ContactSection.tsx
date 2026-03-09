import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Github, Linkedin, CheckCircle2, MessageSquare } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { contactSchema, type ContactFormData } from "@/lib/schemas";
import { mockProfile } from "@/lib/mockData";

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (_data: ContactFormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
    reset();
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-28 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 50% at 20% 60%, hsl(261 87% 50% / 0.06), transparent)" }}
      />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(261 87% 50% / 0.25), transparent)" }}
      />

      <div className="container mx-auto max-w-5xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-xs font-mono tracking-widest uppercase mb-4">
            <MessageSquare className="w-3 h-3" />
            Let's Connect
          </div>
          <h2 className="section-title text-5xl md:text-6xl mb-4">Contact</h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            Got a project in mind, a role to fill, or just want to say hi? My inbox is always open.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Info panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-2"
          >
            <GlassCard className="p-7 flex flex-col gap-7 h-full border border-secondary/20
              hover:border-secondary/35 hover:shadow-[0_0_40px_hsl(162_72%_46%_/_0.12)] transition-all duration-300" glow="none">
              <div>
                <h3 className="font-bold text-lg mb-5">Get in touch</h3>
                <div className="space-y-4">
                  <a href={`mailto:${mockProfile.email}`}
                    className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors group">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center group-hover:border-secondary/40 group-hover:shadow-[0_0_16px_hsl(162_72%_46%_/_0.2)] transition-all duration-300">
                      <Mail className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground/60 font-mono uppercase tracking-wider">Email</div>
                      <div className="text-sm font-medium">{mockProfile.email}</div>
                    </div>
                  </a>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground/60 font-mono uppercase tracking-wider">Location</div>
                      <div className="text-sm font-medium">{mockProfile.location}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground/60 font-mono uppercase tracking-wider mb-3">Also on</p>
                <div className="flex gap-3">
                  {[
                    { href: mockProfile.githubUrl, icon: Github, label: "GitHub" },
                    { href: mockProfile.linkedinUrl, icon: Linkedin, label: "LinkedIn" },
                  ].map(({ href, icon: Icon, label }) => (
                    <motion.a key={label} href={href} target="_blank" rel="noopener noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="w-10 h-10 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:shadow-glow-sm transition-all">
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mt-auto glass p-4 rounded-xl border border-secondary/15
                hover:border-secondary/30 hover:shadow-[0_0_20px_hsl(162_72%_46%_/_0.1)] transition-all duration-300">
                <div className="flex items-center gap-2 mb-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary" />
                  </span>
                  <span className="text-secondary text-sm font-bold">Available</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Open to full-time roles and select freelance projects.
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="md:col-span-3"
          >
            <GlassCard className="p-7 h-full border border-primary/20
              hover:border-primary/35 hover:shadow-[0_0_40px_hsl(261_87%_50%_/_0.12)] transition-all duration-300" glow="none">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 18 }}
                  className="h-full flex flex-col items-center justify-center py-16 text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-secondary/10 border border-secondary/25 flex items-center justify-center mb-5 shadow-[0_0_30px_hsl(162_72%_46%_/_0.2)]">
                    <CheckCircle2 className="w-8 h-8 text-secondary" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">Message sent!</h3>
                  <p className="text-muted-foreground">I'll get back to you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    {[
                      { id: "name", label: "Name", type: "text", placeholder: "John Doe", error: errors.name },
                      { id: "email", label: "Email", type: "email", placeholder: "john@example.com", error: errors.email },
                    ].map(({ id, label, type, placeholder, error }) => (
                      <div key={id}>
                        <label className="block text-xs font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">{label}</label>
                        <input
                          {...register(id as "name" | "email")}
                          type={type}
                          placeholder={placeholder}
                          className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground/40
                            focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_hsl(261_87%_50%_/_0.1)]
                            transition-all duration-300 text-sm border border-border/20"
                        />
                        {error && <p className="text-destructive text-xs mt-1.5 font-mono">{error.message}</p>}
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-muted-foreground/70 uppercase tracking-widest mb-2">Message</label>
                    <textarea
                      {...register("message")}
                      rows={6}
                      placeholder="Tell me about your project or say hi..."
                      className="w-full px-4 py-3 rounded-xl glass text-foreground placeholder:text-muted-foreground/40
                        focus:outline-none focus:border-primary/50 focus:shadow-[0_0_20px_hsl(261_87%_50%_/_0.1)]
                        transition-all duration-300 text-sm resize-none border border-border/20"
                    />
                    {errors.message && <p className="text-destructive text-xs mt-1.5 font-mono">{errors.message.message}</p>}
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-glow w-full py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed text-sm overflow-hidden relative group"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    {loading ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              )}
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
