import { NextResponse } from "next/server";

const USER = "charan-rathore";
const UPSTREAM_MS = 4500;
export const revalidate = 3600; // refresh GitHub data hourly

type Day = { date: string; count: number; level: number };

type ContributionsResponse = {
  total: Record<string, number>;
  contributions: Day[];
};

type Repo = {
  name: string;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  description: string | null;
};

type GithubUser = {
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
};

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

/** Inclusive day range from start → end (YYYY-MM-DD). */
function eachDay(start: string, end: string): string[] {
  const out: string[] = [];
  const cursor = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cursor <= last) {
    out.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "charan-tetris-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

async function fetchJson<T>(url: string, init: RequestInit = {}): Promise<T | null> {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function activityWindow(today = new Date()) {
  const end = isoDate(today);
  const year = today.getUTCFullYear();
  const month = today.getUTCMonth();
  const start =
    month >= 6
      ? `${year}-07-01`
      : isoDate(new Date(Date.UTC(year, month, today.getUTCDate() - 30)));
  return { start, end };
}

export async function GET() {
  const { start, end } = activityWindow();

  const [contrib, user, repos] = await Promise.all([
    fetchJson<ContributionsResponse>(
      `https://github-contributions-api.jogruber.de/v4/${USER}`,
      { next: { revalidate: 3600 } },
    ),
    fetchJson<GithubUser>(`https://api.github.com/users/${USER}`, {
      headers: githubHeaders(),
      next: { revalidate: 3600 },
    }),
    fetchJson<Repo[]>(
      `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
      {
        headers: githubHeaders(),
        next: { revalidate: 3600 },
      },
    ),
  ]);

  const byDate = new Map<string, Day>();
  for (const day of contrib?.contributions ?? []) {
    byDate.set(day.date, day);
  }

  const monthDays = eachDay(start, end).map((date) => {
    const hit = byDate.get(date);
    return {
      date,
      count: hit?.count ?? 0,
      level: hit?.level ?? 0,
    };
  });

  const monthTotal = monthDays.reduce((sum, day) => sum + day.count, 0);
  const maxDay = Math.max(1, ...monthDays.map((day) => day.count));
  const safeRepos = Array.isArray(repos) ? repos : [];

  const languageCounts: Record<string, number> = {};
  for (const repo of safeRepos) {
    if (!repo.language) continue;
    languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
  }
  const languages = Object.entries(languageCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const recent = [...safeRepos]
    .sort(
      (a, b) =>
        new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime(),
    )
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      pushedAt: repo.pushed_at,
      description: repo.description,
    }));

  return NextResponse.json({
    user: USER,
    rangeStart: start,
    rangeEnd: end,
    monthTotal,
    publicRepos: user?.public_repos ?? 0,
    followers: user?.followers ?? 0,
    stars: safeRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    month: monthDays.map((day) => ({
      date: day.date,
      count: day.count,
      level: day.level,
      height: Math.max(4, Math.round((day.count / maxDay) * 100)),
    })),
    languages,
    recent,
    fetchedAt: new Date().toISOString(),
    partial: !contrib || !user || !repos,
  });
}
