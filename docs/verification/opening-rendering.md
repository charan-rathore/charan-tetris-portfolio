# Opening rendering consistency

The production alias and the current immutable deployment returned the same ETag
(`22b4d5bd98679c9255f0bb607ecf1f39`) at investigation time. The deployment pointed to
53f3ed1. No service worker or custom cache policy was present in this application.
The user's Brave Local State had hardware acceleration disabled. The opening
components previously switched to unrelated older flat SVG artwork when WebGL
failed, making the current deployment resemble an older release.

Both opening scenes now use the same isometric SVG geometry in every browser.
There is no graphics-dependent alternate illustration or canvas initialization.
The thinking board still uses legal placements, real line clears, scoring, pause,
manual drops, visibility suspension and reduced-motion support.

Validation: production build and 11 tests pass; desktop/mobile Brave controls and
44px targets pass. A separate Brave instance launched with --disable-webgl and
--disable-gpu reports no WebGL2 context and passes the same checks. Build SHA is
also exposed in a build-revision metadata tag to distinguish deployment versions.
