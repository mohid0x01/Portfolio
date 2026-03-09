import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { TechStackSection } from "@/components/TechStackSection";
import { ExperienceSection } from "@/components/ExperienceSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";
import { mockProjects, mockSkills } from "@/lib/mockData";
import { useVisitorLog } from "@/hooks/useVisitorLog";

const Index = () => {
  useVisitorLog();

  return (
    <div className="min-h-screen bg-background text-foreground noise-overlay">
      <Navbar />
      <main>
        <HeroSection />

        <ScrollReveal delay={0}>
          <ProjectsSection projects={mockProjects} />
        </ScrollReveal>

        <ScrollReveal delay={0.05} direction="left">
          <TechStackSection />
        </ScrollReveal>

        <ScrollReveal delay={0.05} direction="right">
          <ExperienceSection />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <SkillsSection skills={mockSkills} />
        </ScrollReveal>

        <ScrollReveal delay={0.05}>
          <ContactSection />
        </ScrollReveal>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
