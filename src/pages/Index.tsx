import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { ProjectsSection } from "@/components/ProjectsSection";
import { SkillsSection } from "@/components/SkillsSection";
import { ContactSection } from "@/components/ContactSection";
import { Footer } from "@/components/Footer";
import { mockProjects, mockSkills } from "@/lib/mockData";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground noise-overlay">
      <Navbar />
      <main>
        <HeroSection />
        <ProjectsSection projects={mockProjects} />
        <SkillsSection skills={mockSkills} />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
