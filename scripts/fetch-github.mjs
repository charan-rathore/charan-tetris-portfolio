#!/usr/bin/env node
/** Build-time GitHub pulse payload for static hosting (GitHub Pages). */

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const USER = "charan-rathore";
const UPSTREAM_MS = 4500;
const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "public", "github.json");

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

function eachDay(start, end) {
  const out = [];
  const cursor = new Date(`${start}T12:00:00Z`);
  const last = new Date(`${end}T12:00:00Z`);
  while (cursor <= last) {
    out.push(isoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return out;
}

function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "charan-tetris-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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

async function fetchJson(url, init = {}) {
  try {
    const response = await fetch(url, {
      ...init,
      signal: AbortSignal.timeout(UPSTREAM_MS),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function emptyPayload(start, end) {
  return {
    user: USER,
    rangeStart: start,
    rangeEnd: end,
    monthTotal: 0,
    publicRepos: 0,
    followers: 0,
    stars: 0,
    month: [],
    languages: [],
    recent: [],
    fetchedAt: new Date().toISOString(),
    partial: true,
  };
}

const { start, end } = activityWindow();
const [contrib, user, repos] = await Promise.all([
  fetchJson(`https://github-contributions-api.jogruber.de/v4/${USER}`),
  fetchJson(`https://api.github.com/users/${USER}`, {
    headers: githubHeaders(),
  }),
  fetchJson(
    `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
    { headers: githubHeaders() },
  ),
]);

const byDate = new Map();
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

const languageCounts = {};
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

const payload =
  !contrib && !user && !repos
    ? emptyPayload(start, end)
    : {
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
      };

writeFileSync(outPath, `${JSON.stringify(payload)}\n`);
console.log(`wrote ${outPath}`);
