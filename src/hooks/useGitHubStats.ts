import { useQuery } from "@tanstack/react-query";

export interface GitHubRepoStats {
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  pushedAt: string | null;
  description: string | null;
  topics: string[];
  size: number;
  watchers: number;
}

function parseRepoPath(githubUrl: string): string | null {
  try {
    const url = new URL(githubUrl);
    if (!url.hostname.includes("github.com")) return null;
    // path = /owner/repo  (strip leading slash and trailing slashes)
    const parts = url.pathname.replace(/^\/|\/$/g, "").split("/");
    if (parts.length < 2) return null;
    return `${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

async function fetchRepoStats(repoPath: string): Promise<GitHubRepoStats> {
  const res = await fetch(`https://api.github.com/repos/${repoPath}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  const data = await res.json();
  return {
    stars: data.stargazers_count ?? 0,
    forks: data.forks_count ?? 0,
    openIssues: data.open_issues_count ?? 0,
    language: data.language ?? null,
    pushedAt: data.pushed_at ?? null,
    description: data.description ?? null,
    topics: data.topics ?? [],
    size: data.size ?? 0,
    watchers: data.watchers_count ?? 0,
  };
}

export function useGitHubStats(githubUrl: string | undefined) {
  const repoPath = githubUrl ? parseRepoPath(githubUrl) : null;

  return useQuery({
    queryKey: ["github-stats", repoPath],
    queryFn: () => fetchRepoStats(repoPath!),
    enabled: !!repoPath,
    staleTime: 1000 * 60 * 10, // cache 10 minutes
    retry: 1,
  });
}
