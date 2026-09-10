import snapshot from "../../../data/github-snapshot.json";

export const dynamic = "force-dynamic";
export const maxDuration = 10;
const USER = "charan-rathore";
type Repo = { name: string; html_url: string; language: string | null; stargazers_count: number; pushed_at: string; description: string | null };
type Day = { date: string; count: number; level: number };
let lastGood = { ...snapshot, stale: true, checkedAt: snapshot.fetchedAt, repositoryUpdatedAt: snapshot.fetchedAt, calendarUpdatedAt: snapshot.fetchedAt };
let refreshedAt = 0;
let inFlight: Promise<typeof lastGood> | null = null;

async function refresh() {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "charan-tetris-portfolio" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  async function get<T>(url: string, github = true): Promise<T | null> {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    const deadline = new Promise<null>(resolve => { timer = setTimeout(() => { controller.abort(); resolve(null); }, 1800); });
    try {
      return await Promise.race([deadline, fetch(url, { headers: github ? headers : undefined, cache: "no-store", signal: controller.signal })
        .then(async response => response.ok ? await response.json() as T : null).catch(() => null)]);
    } finally { clearTimeout(timer!); }
  }
  const [profile, repositories, calendar] = await Promise.all([
    get<{ public_repos: number; followers: number }>(`https://api.github.com/users/${USER}`),
    get<Repo[]>(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`),
    get<{ contributions: Day[] }>(`https://github-contributions-api.jogruber.de/v4/${USER}`, false),
  ]);
  const now = new Date().toISOString();
  const repos = Array.isArray(repositories) ? repositories : null;
  const activity = Array.isArray(calendar?.contributions) ? calendar.contributions : null;
  const next = { ...lastGood, checkedAt: now, stale: !profile || !repos || !activity, partial: !profile || !repos || !activity, refreshSeconds: 60 };
  if (profile && typeof profile.public_repos === "number") { next.publicRepos = profile.public_repos; next.followers = profile.followers; }
  if (repos) {
    const counts = new Map<string, number>();
    for (const repo of repos) if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
    next.languages = [...counts].map(([name,count]) => ({name,count})).sort((a,b) => b.count-a.count).slice(0,6);
    next.stars = repos.reduce((sum,r) => sum+r.stargazers_count,0);
    next.recent = repos.slice(0,5).map(r => ({name:r.name,url:r.html_url,language:r.language ?? "",stars:r.stargazers_count,pushedAt:r.pushed_at,description:r.description ?? ""}));
    next.repositoryUpdatedAt = now;
  }
  if (activity) {
    const end = new Date(), start = new Date(); start.setUTCDate(end.getUTCDate()-29);
    const days = new Map(activity.map(d => [d.date,d]));
    const month = Array.from({length:30},(_,i) => {const d=new Date(start);d.setUTCDate(start.getUTCDate()+i);const date=d.toISOString().slice(0,10);return days.get(date) ?? {date,count:0,level:0};});
    const peak = Math.max(1,...month.map(d=>d.count));
    next.month = month.map(d=>({...d,height:Math.max(4,d.count/peak*100)}));
    next.monthTotal = month.reduce((sum,d)=>sum+d.count,0);
    next.rangeStart = start.toISOString().slice(0,10);next.rangeEnd = end.toISOString().slice(0,10);
    next.calendarUpdatedAt=now;next.activityAvailable=true;
  }
  next.fetchedAt = next.calendarUpdatedAt < next.repositoryUpdatedAt ? next.calendarUpdatedAt : next.repositoryUpdatedAt;
  lastGood = next; refreshedAt=Date.now(); return next;
}

export async function GET() {
  if (Date.now()-refreshedAt > 60_000) {
    inFlight ??= refresh().finally(()=>{inFlight=null;});
    await inFlight;
  }
  return Response.json(lastGood,{headers:{"Cache-Control":"public, max-age=0, s-maxage=60, stale-while-revalidate=300, stale-if-error=86400"}});
}
