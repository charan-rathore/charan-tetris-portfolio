"use client";

import { useEffect, useState } from "react";

type Day = { date: string; count: number; level: number };
type BarDay = Day & { height: number };
type Language = { name: string; count: number };
type RecentRepo = {
  name: string;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
  description: string | null;
};

type GithubPayload = {
  user: string;
  year: number;
  yearTotal: number;
  publicRepos: number;
  followers: number;
  stars: number;
  last30: BarDay[];
  month: Day[];
  languages: Language[];
  recent: RecentRepo[];
  fetchedAt: string;
};

const LEVEL_CLASS = ["lvl-0", "lvl-1", "lvl-2", "lvl-3", "lvl-4"];

function monthLabel(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleString("en-US", { month: "short" });
}

export function GitHubPulse() {
  const [data, setData] = useState<GithubPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github")
      .then((response) => {
        if (!response.ok) throw new Error("bad status");
        return response.json();
      })
      .then((payload: GithubPayload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="gh-pulse is-error">
        <p className="pixel-label">GITHUB LIVE FEED OFFLINE</p>
        <p>
          Couldn&apos;t reach GitHub right now.{" "}
          <a href="https://github.com/charan-rathore" target="_blank" rel="noreferrer">
            Open profile ↗
          </a>
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="gh-pulse is-loading">
        <p className="pixel-label">SYNCING GITHUB…</p>
      </div>
    );
  }

  const monthMarkers: string[] = [];
  let lastMonth = "";
  data.month.forEach((day) => {
    const label = `${monthLabel(day.date)} ${new Date(`${day.date}T12:00:00`).getFullYear()}`;
    if (label !== lastMonth) {
      monthMarkers.push(label);
      lastMonth = label;
    }
  });

  const maxLang = Math.max(1, ...data.languages.map((item) => item.count));

  return (
    <div className="gh-pulse">
      <div className="gh-pulse-top">
        <div>
          <span className="pixel-label accent-cyan">LIVE FROM GITHUB</span>
          <h3>@{data.user}</h3>
          <p>
            Auto-refreshes hourly. No manual portfolio edits when I ship.
          </p>
        </div>
        <a
          className="gh-profile-link"
          href={`https://github.com/${data.user}`}
          target="_blank"
          rel="noreferrer"
        >
          OPEN PROFILE ↗
        </a>
      </div>

      <div className="gh-stat-row">
        <div className="gh-stat">
          <b>{data.yearTotal}</b>
          <span className="pixel-label">COMMITS · {data.year}</span>
        </div>
        <div className="gh-stat">
          <b>{data.publicRepos}</b>
          <span className="pixel-label">PUBLIC REPOS</span>
        </div>
        <div className="gh-stat">
          <b>{data.stars}</b>
          <span className="pixel-label">STARS</span>
        </div>
        <div className="gh-stat">
          <b>{data.followers}</b>
          <span className="pixel-label">FOLLOWERS</span>
        </div>
      </div>

      <div className="gh-panels">
        <div className="gh-panel">
          <div className="gh-panel-head">
            <span className="pixel-label">LAST 30 DAYS · ACTIVITY</span>
          </div>
          <div className="gh-bars" aria-label="Last 30 days of contributions">
            {data.last30.map((day) => (
              <div
                key={day.date}
                className="gh-bar"
                title={`${day.date}: ${day.count} contributions`}
                style={{ height: `${day.height}%` }}
              />
            ))}
          </div>
        </div>

        <div className="gh-panel">
          <div className="gh-panel-head">
            <span className="pixel-label">LANGUAGE MIX · REPOS</span>
          </div>
          <ul className="gh-langs">
            {data.languages.map((lang) => (
              <li key={lang.name}>
                <div className="gh-lang-meta">
                  <span>{lang.name}</span>
                  <b>{lang.count}</b>
                </div>
                <div className="gh-lang-track">
                  <i style={{ width: `${(lang.count / maxLang) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="gh-heatmap-wrap">
        <div className="gh-panel-head">
          <span className="pixel-label">CONTRIBUTION SNAPSHOT · ~5 WEEKS</span>
          <span className="pixel-label">AUTO-UPDATING</span>
        </div>
        <div className="gh-month-labels">
          {monthMarkers.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div
          className="gh-heatmap"
          style={{ gridTemplateColumns: `repeat(${data.month.length}, 1fr)` }}
          aria-label="GitHub contribution heatmap"
        >
          {data.month.map((day) => (
            <i
              key={day.date}
              className={LEVEL_CLASS[day.level] ?? "lvl-0"}
              title={`${day.date}: ${day.count}`}
            />
          ))}
        </div>
        <div className="gh-legend" aria-hidden="true">
          <span>Less</span>
          <i className="lvl-0" />
          <i className="lvl-1" />
          <i className="lvl-2" />
          <i className="lvl-3" />
          <i className="lvl-4" />
          <span>More</span>
        </div>
      </div>

      <div className="gh-recent">
        <span className="pixel-label">RECENTLY PUSHED</span>
        <ul>
          {data.recent.map((repo) => (
            <li key={repo.name}>
              <a href={repo.url} target="_blank" rel="noreferrer">
                {repo.name}
              </a>
              <span>
                {repo.language ?? "misc"} ·{" "}
                {new Date(repo.pushedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
