import { NextResponse } from "next/server";

const USER = "charan-rathore";
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

export async function GET() {
  try {
    const [contribRes, userRes, reposRes] = await Promise.all([
      fetch(`https://github-contributions-api.jogruber.de/v4/${USER}`, {
        next: { revalidate: 3600 },
      }),
      fetch(`https://api.github.com/users/${USER}`, {
        headers: { Accept: "application/vnd.github+json" },
        next: { revalidate: 3600 },
      }),
      fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
        {
          headers: { Accept: "application/vnd.github+json" },
          next: { revalidate: 3600 },
        },
      ),
    ]);

    if (!contribRes.ok || !userRes.ok || !reposRes.ok) {
      return NextResponse.json(
        { error: "GitHub upstream failed" },
        { status: 502 },
      );
    }

    const contrib = (await contribRes.json()) as ContributionsResponse;
    const user = (await userRes.json()) as {
      public_repos: number;
      followers: number;
      following: number;
      created_at: string;
    };
    const repos = (await reposRes.json()) as Repo[];

    const days = contrib.contributions ?? [];
    const last30 = days.slice(-30);
    const monthWindow = days.slice(-35); // ~5 weeks for the heatmap strip

    const year = new Date().getFullYear();
    const yearTotal =
      contrib.total?.[String(year)] ??
      last30.reduce((sum, day) => sum + day.count, 0);

    const languageCounts: Record<string, number> = {};
    for (const repo of repos) {
      if (!repo.language) continue;
      languageCounts[repo.language] = (languageCounts[repo.language] ?? 0) + 1;
    }
    const languages = Object.entries(languageCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const recent = [...repos]
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

    const maxDay = Math.max(1, ...last30.map((day) => day.count));

    return NextResponse.json({
      user: USER,
      year,
      yearTotal,
      publicRepos: user.public_repos,
      followers: user.followers,
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      last30: last30.map((day) => ({
        date: day.date,
        count: day.count,
        level: day.level,
        height: Math.max(8, Math.round((day.count / maxDay) * 100)),
      })),
      month: monthWindow,
      languages,
      recent,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load GitHub data" }, { status: 500 });
  }
}
