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

    // Upstream returns an unsorted mix of years — always sort by date.
    const byDate = new Map<string, Day>();
    for (const day of contrib.contributions ?? []) {
      byDate.set(day.date, day);
    }

    const today = new Date();
    const end = isoDate(today);
    // Past one month window: July 1 of current year through today when we are
    // in Jul/Aug+, otherwise rolling ~31 days ending today.
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth(); // 0-indexed
    const start =
      month >= 6
        ? `${year}-07-01`
        : isoDate(new Date(Date.UTC(year, month, today.getUTCDate() - 30)));

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

    return NextResponse.json({
      user: USER,
      rangeStart: start,
      rangeEnd: end,
      monthTotal,
      publicRepos: user.public_repos,
      followers: user.followers,
      stars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
      month: monthDays.map((day) => ({
        date: day.date,
        count: day.count,
        level: day.level,
        height: Math.max(4, Math.round((day.count / maxDay) * 100)),
      })),
      languages,
      recent,
      fetchedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Failed to load GitHub data" }, { status: 500 });
  }
}
