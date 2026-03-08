import { Github, Heart } from "lucide-react";
import { mockProfile } from "@/lib/mockData";

export function Footer() {
  return (
    <footer className="py-10 px-6 border-t border-border">
      <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="gradient-text font-bold">{mockProfile.name}</span>
          <span>—</span>
          <span>CEH · Bug Bounty Hunter · Pakistan</span>
        </div>
        <div className="flex items-center gap-1">
          Built with
          <Heart className="w-3.5 h-3.5 text-destructive mx-1 fill-destructive" />
          and too much coffee.
        </div>
        <div className="flex items-center gap-3">
          <a href={mockProfile.githubUrl} target="_blank" rel="noopener noreferrer"
            className="hover:text-primary transition-colors flex items-center gap-1.5">
            <Github className="w-4 h-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
