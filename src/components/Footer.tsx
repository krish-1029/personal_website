import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-black/10 bg-white py-3 text-black">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-6 px-4">
        <a
          href="https://www.linkedin.com/in/krish-soni-00385a28b/"
          target="_blank"
          rel="noreferrer"
          aria-label="LinkedIn profile"
          className="text-black/80 transition-colors hover:text-black"
        >
          <Linkedin size={22} />
          <span className="sr-only">LinkedIn</span>
        </a>
        <a
          href="https://github.com/krish-1029"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub profile"
          className="text-black/80 transition-colors hover:text-black"
        >
          <Github size={22} />
          <span className="sr-only">GitHub</span>
        </a>
      </div>
    </footer>
  );
} 