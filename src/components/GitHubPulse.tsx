"use client";

import { useEffect, useState } from "react";
import { LangCrushBoard } from "./LangCrushBoard";
import { sfx } from "./tetris/audio";
import { PIECES, PieceName } from "./tetris/types";

type BarDay = {
  date: string;
  count: number;
  level: number;
  height: number;
};
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
  rangeStart: string;
  rangeEnd: string;
  monthTotal: number;
  publicRepos: number;
  followers: number;
  stars: number;
  month?: BarDay[];
  languages: Language[];
  recent: RecentRepo[];
  fetchedAt: string;
};

const LANG_PIECES: PieceName[] = ["T", "I", "O", "S", "Z", "J", "L"];

const LANG_COLORS: Record<string, string> = {
  Python: "#3572A5",
  "Jupyter Notebook": "#DA5B0B",
  TypeScript: "#3178C6",
  JavaScript: "#F1E05A",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Shell: "#89E051",
};

function formatRange(start: string, end: string) {
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const year = b.getFullYear();
  return `${a.toLocaleDateString("en-US", opts)} – ${b.toLocaleDateString("en-US", opts)} ${year}`;
}

function shortDay(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function monthTick(dateStr: string) {
  const date = new Date(`${dateStr}T12:00:00`);
  if (date.getDate() === 1) {
    return date.toLocaleDateString("en-US", { month: "short" });
  }
  if (date.getDate() % 7 === 0) {
    return String(date.getDate());
  }
  return "";
}

function langSearchUrl(user: string, language: string) {
  return `https://github.com/search?q=user%3A${encodeURIComponent(user)}+language%3A${encodeURIComponent(language)}&type=repositories`;
}

function repoPiece(index: number): PieceName {
  return LANG_PIECES[index % LANG_PIECES.length];
}

const CLIENT_TIMEOUT_MS = 8000;

export function GitHubPulse() {
  const [data, setData] = useState<GithubPayload | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);

    fetch("/api/github", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("bad status");
        return response.json();
      })
      .then((payload: GithubPayload) => {
        if (!cancelled) setData(payload);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        window.clearTimeout(timer);
      });
    return () => {
      cancelled = true;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  if (error) {
    return (
      <div className="gh-pulse is-error">
        <p className="pixel-label">GITHUB LIVE FEED OFFLINE</p>
        <p>
          Couldn&apos;t reach GitHub right now.{" "}
          <a
            href="https://github.com/charan-rathore"
            target="_blank"
            rel="noreferrer"
            onClick={() => sfx.ui()}
          >
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

  const month = data.month ?? [];
  const peak = month.reduce<BarDay | null>(
    (best, day) => (!best || day.count > best.count ? day : best),
    null,
  );

  return (
    <div className="gh-pulse">
      <div className="gh-pulse-top">
        <div>
          <span className="pixel-label accent-cyan">LIVE FROM GITHUB</span>
          <h3>@{data.user}</h3>
          <p>
            Activity for {formatRange(data.rangeStart, data.rangeEnd)}. Refreshes
            hourly.
          </p>
        </div>
        <a
          className="gh-profile-link"
          href={`https://github.com/${data.user}`}
          target="_blank"
          rel="noreferrer"
          onClick={() => sfx.ui()}
        >
          OPEN PROFILE ↗
        </a>
      </div>

      <div className="gh-chart-card">
        <div className="gh-panel-head">
          <span className="pixel-label">COMMITS · PAST MONTH</span>
          <span className="pixel-label accent-yellow">{data.monthTotal} TOTAL</span>
        </div>
        <div className="gh-chart" aria-label="Daily contributions bar chart">
          {month.map((day) => (
            <div key={day.date} className="gh-chart-col">
              <div
                className={`gh-chart-bar ${day.count > 0 ? "is-active" : ""}`}
                title={`${shortDay(day.date)}: ${day.count} contribution${day.count === 1 ? "" : "s"}`}
                style={{ height: `${day.height}%` }}
              />
              <span className="gh-chart-tick">{monthTick(day.date)}</span>
            </div>
          ))}
        </div>
        <div className="gh-chart-meta">
          <span>
            {peak
              ? `Peak ${peak.count} on ${shortDay(peak.date)}`
              : "No contribution days in range"}
          </span>
          <span>
            {data.publicRepos} repos · {data.stars} stars · {data.followers}{" "}
            followers
          </span>
        </div>
      </div>

      <div className="gh-panels">
        <div className="gh-panel gh-panel-lang">
          <div className="gh-panel-head">
            <span className="pixel-label">LANGUAGE MIX · REPOS</span>
            <span className="pixel-label accent-yellow">DROP · LOCK</span>
          </div>
          <LangCrushBoard
            items={data.languages.map((lang, index) => {
              const piece = LANG_PIECES[index % LANG_PIECES.length];
              return {
                name: lang.name,
                count: lang.count,
                piece,
                color: LANG_COLORS[lang.name] ?? PIECES[piece].color,
              };
            })}
            hrefFor={(name) => langSearchUrl(data.user, name)}
            onActivate={() => sfx.ui()}
          />
        </div>

        <div className="gh-recent">
          <div className="gh-panel-head">
            <span className="pixel-label accent-cyan">NEXT QUEUE · PUSHED</span>
            <span className="pixel-label">{data.recent.length} IN BAG</span>
          </div>
          <ul className="gh-queue">
            {data.recent.map((repo, index) => {
              const piece = repoPiece(index);
              const color =
                (repo.language && LANG_COLORS[repo.language]) ||
                PIECES[piece].color;
              return (
                <li key={repo.name}>
                  <a
                    className="gh-queue-row"
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ "--piece": color } as React.CSSProperties}
                    onClick={() => sfx.ui()}
                  >
                    <span className="gh-queue-slot pixel-label">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="gh-queue-piece" aria-hidden="true">
                      {PIECES[piece].rotations[0].map(([x, y], cellIndex) => (
                        <i
                          key={cellIndex}
                          style={{
                            gridColumn: x + 1,
                            gridRow: y + 1,
                            background: color,
                          }}
                        />
                      ))}
                    </span>
                    <span className="gh-queue-body">
                      <b>{repo.name}</b>
                      <em>
                        {repo.language ?? "misc"} ·{" "}
                        {new Date(repo.pushedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </em>
                    </span>
                    <span className="gh-queue-go">↗</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
