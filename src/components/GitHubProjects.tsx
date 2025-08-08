import { env } from "@/env";
import SpotlightCard from "@/components/SpotlightCard";

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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {repos.map((repo, index) => (
          <SpotlightCard
            key={repo.id}
            className="animate-rise rounded-xl border-white/15 bg-white/10 p-7 backdrop-blur-md transition-colors hover:border-white/25 min-h-[180px]"
            spotlightColor="rgba(0, 229, 255, 0.2)"
            style={{ animationDelay: `${index * 70}ms` } as React.CSSProperties}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-lg font-semibold text-white hover:underline"
              >
                {repo.name}
              </a>
              <span className="shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">
                {repo.language ?? "Other"}
              </span>
            </div>
            {repo.description ? (
              <p className="mb-3 line-clamp-3 text-sm text-white/70">{repo.description}</p>
            ) : null}

            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-white/60">
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
                  className="rounded-md border border-white/10 px-3 py-1 text-sm text-white hover:border-white/20"
                >
                  Live Demo
                </a>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-md border border-white/10 px-3 py-1 text-sm text-white hover:border-white/20"
                >
                  GitHub
                </a>
              </div>
            ) : (
              <a
                href={repo.html_url}
                target="_blank"
                rel="noreferrer"
                className="inline-block rounded-md border border-white/10 px-3 py-1 text-sm text-white hover:border-white/20"
              >
                GitHub
              </a>
            )}
          </SpotlightCard>
        ))}
      </div>
    </section>
  );
} 