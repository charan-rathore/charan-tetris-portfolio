import fallback from "../../../data/activity-timeline.json";

export const dynamic = "force-dynamic";
const url = "https://api.github.com/search/issues?q=is%3Apr+author%3Acharan-rathore+is%3Amerged+merged%3A2026-09-01..2026-09-30&sort=updated&order=desc&per_page=100";
const fixPrefix = /\b(fix|fixes|fixed|bugfix|hotfix|test|tests|revert|regression|repair)(ed|ing)?\b/i;
type Event = {date:string;kind:"merged"|"merged_fix";title:string;repo:string;url:string;weight:number};
let lastGood: Event[] = (fallback.events as Event[]).filter(event=>event.date.startsWith("2026-09-"));
let checkedAt = fallback.asOf;
let refreshedAt = 0;
let inFlight: Promise<void> | null = null;
async function refresh() {
  const response = await fetch(url,{headers:{Accept:"application/vnd.github+json","User-Agent":"systris-public-activity"},cache:"no-store",signal:AbortSignal.timeout(5000)});
  if (!response.ok) throw new Error(`GitHub search ${response.status}`);
  const data = await response.json() as {items?:Array<{title?:string;html_url?:string;repository_url?:string;pull_request?:{merged_at?:string}}>};
  if (!Array.isArray(data.items)) throw new Error("GitHub returned no items");
  const next = data.items.flatMap((item):Event[] => {
    const date = item.pull_request?.merged_at?.slice(0,10);
    const repo = item.repository_url?.split("/repos/")[1];
    if (!date?.startsWith("2026-09-") || !item.title || !item.html_url || !repo) return [];
    return [{date,kind:fixPrefix.test(item.title)?"merged_fix":"merged",title:item.title,repo,url:item.html_url,weight:1}];
  }).sort((a,b)=>a.date.localeCompare(b.date));
  if (next.length) {lastGood=next;checkedAt=new Date().toISOString();refreshedAt=Date.now()}
}
export async function GET() {
  if (Date.now()-refreshedAt>60_000) {
    inFlight??=refresh().catch(()=>{}).finally(()=>{inFlight=null});
    await inFlight;
  }
  return Response.json({events:lastGood,checkedAt,stale:Date.now()-refreshedAt>180_000,source:"https://github.com/pulls?q=is%3Apr+author%3Acharan-rathore+is%3Amerged"},{headers:{"Cache-Control":"public, max-age=0, s-maxage=60, stale-while-revalidate=60"}});
}
