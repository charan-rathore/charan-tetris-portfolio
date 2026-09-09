# Charan Rathore · Systris

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

The browser checks on focus/online and every 30 seconds while visible. Server fetches use a 180-second cache without a GitHub key, or 15 seconds with optional server-only `GITHUB_TOKEN`. Repo activity and the contribution-calendar provider can lag upstream. The UI reports that limitation and retains the last successful check on outage; it does not promise instantaneous commits.

## Design and evidence

The seven approved project image files remain under `public/projects/tetris-art`. Original generation hashes and browser evidence are in `docs/verification`. The bridge is a Three.js render; the project progression uses accessible HTML/CSS so visitors do not need WebGL or gameplay to open projects. Reduced motion disables assembly animations.
