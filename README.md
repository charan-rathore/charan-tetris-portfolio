# Charan Rathore · Systris

[Open the live portfolio](https://charan-tetris-portfolio.vercel.app/) · Analyst at MiQ, working across MENA markets.

A portfolio that builds itself from Tetris levels, with optional gameplay unlocking personal intel. Next.js App Router, self-hosted fonts, generated project art, Three.js bridge/game rendering and a 2D recovery renderer.

## Develop and verify

Use Node 24, `npm ci`, then `npm run dev`. Run `npm run lint`, `npm test`, and `npm run build` before publishing. The build uses supported Webpack mode for reproducibility on this Mac and Vercel.

## Hosting

Connect `charan-rathore/charan-tetris-portfolio`, branch `main`, to the existing Vercel project `charan-tetris-portfolio`. Root directory is the repository root. Framework: Next.js. Build: `npm run build`. Let Next.js select the output directory. GitHub Pages static export is incompatible with the contact and GitHub API routes and has been retired.

## Contact delivery

Add server-only variables in Vercel, then redeploy:

- `RESEND_API_KEY`: sending key, never a NEXT_PUBLIC variable.
- `CONTACT_FROM_EMAIL`: verified sender, e.g. `Charan Portfolio <hello@your-verified-domain>`.
- `CONTACT_TO_EMAIL`: receiving inbox; defaults to the existing portfolio inbox `ra7hore.charan@gmail.com`.

The visitor is Reply-To, never the authenticated sender. The route validates and bounds input, rejects cross-origin browser requests, uses a honeypot, deduplicates provider retries, and applies a best-effort per-instance throttle. Configure a shared WAF/Redis rate limit before broad promotion; instance memory is not a distributed abuse control. Unconfigured or failed delivery returns an explicit failure and preserves the message. A successful API response means the provider accepted it, not proof of inbox delivery. Unit tests mock transport; no test messages are sent.

## GitHub activity

The browser refreshes on focus/online and every 30 seconds while visible. Server checks have a hard 1.8-second upstream deadline, a shared in-flight request, a 60-second warm cache and CDN stale-on-error handling. Each source updates independently; an upstream outage keeps a dated saved snapshot instead of timing out the page or resetting charts to zero. The shipped snapshot contains real observed public data and is explicitly marked stale until refreshed.

The calendar labels **contributions**, which can include commits, pull requests and issues. Hover, keyboard focus or tap shows the exact date/count above the bars. Two additional Tetris charts show cumulative contributions and weekday totals. Repo updates and GitHub's contribution provider can lag upstream; this is bounded polling, not a promise of instant commit visibility. Optional server-only `GITHUB_TOKEN` improves GitHub rate limits.

## Design and evidence

The seven approved project image files remain under `public/projects/tetris-art`. Original generation hashes and browser evidence are in `docs/verification`. The bridge is a Three.js render; the project progression uses accessible HTML/CSS so visitors do not need WebGL or gameplay to open projects. Reduced motion disables assembly animations.

## Current interaction pass

The hero connects a pixel-built thinking field to the moving Three.js human interface. Build, Analyze and Connect change the direction and lighting of tetromino signals. Seven automatic Tetris sequences assemble the project levels; optional play unlocks bonus intel. Active navigation follows the visible section. The unused final grid cell and contact side column now offer message starters that fill a draft without replacing anything already typed.

Desktop and mobile layouts are checked in visible Brave/Chromium. This is not a physical Android/iOS or Safari certification. Reduced motion, 2D graphics recovery, keyboard controls and touch targets are covered by the verification flow. Contact transport tests pass with a mock provider; real Resend acceptance/inbox delivery still requires the private configuration above.

The player identity uses the public avatar supplied by Charan from [@huesofbanter](https://x.com/huesofbanter/photo), stored locally for reliable loading. The seven project illustrations remain unchanged.
