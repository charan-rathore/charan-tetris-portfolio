import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const USER = "charan-rathore";
type Repo = { name: string; html_url: string; language: string | null; stargazers_count: number; pushed_at: string; description: string | null };
type Day = { date: string; count: number; level: number };

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "charan-tetris-portfolio" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const ttl = token ? 15 : 180;
  async function get<T>(url: string, github = true): Promise<T | null> {
    try {
      const response = await fetch(url, { headers: github ? headers : undefined, next: { revalidate: ttl }, signal: AbortSignal.timeout(6500) });
      return response.ok ? await response.json() as T : null;
    } catch { return null; }
  }
  const [profile, repos, activity] = await Promise.all([
    get<{ public_repos: number; followers: number }>(`https://api.github.com/users/${USER}`),
    get<Repo[]>(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`),
    get<{ contributions: Day[] }>(`https://github-contributions-api.jogruber.de/v4/${USER}`, false),
  ]);
  if (!profile && !repos && !activity) return NextResponse.json({ error: "GitHub is temporarily unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);
  const date = (d: Date) => d.toISOString().slice(0, 10);
  const days = new Map((activity?.contributions ?? []).map(d => [d.date, d]));
  const month: Day[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(start); d.setUTCDate(d.getUTCDate() + i);
    return days.get(date(d)) ?? { date: date(d), count: 0, level: 0 };
  });
  const allRepos = Array.isArray(repos) ? repos : [];
  const counts = new Map<string, number>();
  for (const repo of allRepos) if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
  const peak = Math.max(1, ...month.map(d => d.count));
  return NextResponse.json({
    user: USER, rangeStart: date(start), rangeEnd: date(end),
    monthTotal: month.reduce((sum, d) => sum + d.count, 0),
    publicRepos: profile?.public_repos ?? 0, followers: profile?.followers ?? 0,
    stars: allRepos.reduce((sum, r) => sum + r.stargazers_count, 0),
    month: month.map(d => ({ ...d, height: Math.max(4, d.count / peak * 100) })),
    languages: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 6),
    recent: allRepos.slice(0, 5).map(r => ({ name: r.name, url: r.html_url, language: r.language, stars: r.stargazers_count, pushedAt: r.pushed_at, description: r.description })),
    fetchedAt: new Date().toISOString(), partial: !profile || !repos || !activity,
    activityAvailable: Boolean(activity), refreshSeconds: ttl,
  }, { headers: { "Cache-Control": "no-store" } });
}
