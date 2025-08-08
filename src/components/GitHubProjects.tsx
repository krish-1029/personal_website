import { env } from "@/env";
import SpotlightCard from "@/components/SpotlightCard";
import type { CSSProperties } from "react";

export type GitHubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  topics?: string[];
  created_at: string;
  updated_at: string;
};

function languageTheme(language: string | null): {
  name: string;
  colorHex: string; // solid text/border color
  borderRgba: string; // subtle border color
  glowRgba: string; // spotlight glow color
} {
  const lang = (language ?? "").toLowerCase();
  // TypeScript lighter blue (tailwind blue-400)
  if (lang === "typescript") {
    const hex = "#60a5fa"; // blue-400
    return {
      name: "TypeScript",
      colorHex: hex,
      borderRgba: "rgba(96, 165, 250, 0.45)",
      glowRgba: "rgba(96, 165, 250, 0.26)",
    };
  }
  // Default neutral theme
  return {
    name: language ?? "Other",
    colorHex: "#9ca3af", // slate-400
    borderRgba: "rgba(255,255,255,0.15)",
    glowRgba: "rgba(255,255,255,0.18)",
  };
}

async function fetchRepos(): Promise<GitHubRepo[]> {
  const username = env.NEXT_PUBLIC_GITHUB_USERNAME ?? env.GITHUB_USERNAME ?? "krish-1029";
  const token = env.GITHUB_TOKEN;

  const response = await fetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=12`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "X-GitHub-Api-Version": "2022-11-28",
      },
      next: { revalidate: 3600 },
    },
  );

  if (!response.ok) {
    // Gracefully degrade on rate limits or errors
    return [];
  }

  const repos = (await response.json()) as GitHubRepo[];

  // Filter out forks and archived by default; prioritize those with recent activity
  const filtered = repos
    .filter((r: any) => !r.fork && !r.archived)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 12);

  return filtered;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export default async function GitHubProjects() {
  const repos = await fetchRepos();

  if (repos.length === 0) {
    return (
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-white/80">
        Could not load repositories right now. Please try again later.
      </div>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="mb-4 text-2xl font-semibold">Latest Projects</h2>
      <div className="grid auto-rows-fr gap-6 lg:grid-cols-3">
        {repos.map((repo, index) => {
          const theme = languageTheme(repo.language);
          const cardStyle: CSSProperties = {
            animationDelay: `${index * 80}ms`,
            borderColor: theme.borderRgba,
          };
          const badgeStyle: CSSProperties = {
            color: theme.colorHex,
            borderColor: theme.colorHex,
            backgroundColor: "transparent",
          };
          return (
            <SpotlightCard
              key={repo.id}
              className="animate-rise flex h-full flex-col rounded-2xl border p-8 backdrop-blur-md transition-colors min-h-[260px]"
              spotlightColor={theme.glowRgba}
              style={cardStyle}
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xl font-semibold text-white hover:underline"
                >
                  {repo.name}
                </a>
                <span
                  className="shrink-0 rounded-full border px-2 py-0.5 text-xs"
                  style={badgeStyle}
                >
                  {theme.name}
                </span>
              </div>

              {repo.description ? (
                <p className="line-clamp-3 text-sm text-white/75">{repo.description}</p>
              ) : (
                <p className="text-sm text-white/50">No description provided.</p>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex flex-wrap items-center gap-3 text-xs text-white/65">
                  <span>⭐ {repo.stargazers_count}</span>
                  <span>🍴 {repo.forks_count}</span>
                  <span>Updated {formatDate(repo.updated_at)}</span>
                </div>

                {repo.homepage ? (
                  <div className="flex gap-2">
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border px-3 py-1.5 text-sm text-white/95 hover:bg-white/5"
                      style={{ borderColor: theme.borderRgba }}
                    >
                      Live Demo
                    </a>
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border px-3 py-1.5 text-sm text-white/95 hover:bg-white/5"
                      style={{ borderColor: theme.borderRgba }}
                    >
                      GitHub
                    </a>
                  </div>
                ) : (
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block rounded-md border px-3 py-1.5 text-sm text-white/95 hover:bg-white/5"
                    style={{ borderColor: theme.borderRgba }}
                  >
                    GitHub
                  </a>
                )}
              </div>
            </SpotlightCard>
          );
        })}
      </div>
    </section>
  );
} 