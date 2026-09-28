# AGENTS.md — rules for AI assistants working on coffee-claude

A personal coffee-journal **Jekyll site on GitHub Pages**, used mostly as an **iPhone home-screen
PWA**. Full reference: [`README.md`](README.md). Read the relevant section before changing a
subsystem.

## Hard constraints

- **No build step.** GitHub Pages builds the repo with the `github-pages` gem: **Jekyll 3.10,
  Liquid 4, kramdown**, whitelisted plugins only (just `jekyll-seo-tag` is in use). Don't add
  plugins, npm, bundlers, TypeScript, frameworks or a CI build.
- **Vanilla JS & one stylesheet.** Page scripts are inline `<script>` blocks or files in
  `assets/js/`. Styling uses the tokens in `assets/coffee.css`; per-page `<style>` blocks are for
  page-only rules. Don't introduce CSS frameworks or new colour literals when a token fits.
- **`baseurl` is `/coffee-claude`.** Every internal link or asset goes through
  `{{ '/path/' | relative_url }}`. `manifest.json`, `sw.js` and `offline.html` hard-code
  `/coffee-claude/`.
- **Content = plain pages, not collections.** Sections are folders (`brews/`, `beans/`,
  `methods/`) found with `site.pages | where_exp: "p", "p.path contains 'brews/'"` (excluding
  `index.md`). Front-matter schemas: README §6.
- **Mobile first, and iOS in particular:**
  - Fixed/sticky UI and edge padding must use the `--safe-top/right/bottom/left` insets.
  - Hover-only effects go inside `@media (hover: hover)`, because iOS keeps `:hover` stuck after
    a tap.
  - Inputs are ≥ 16px, or iOS zooms on focus.
  - Test at 393×852.

## Invariants — don't break these

- `_data/gallery.yml`: UTF-8 with **no BOM**, `captions:` stays the **last** top-level key (the
  uploader appends lines to the end), and keys match image paths exactly (case-sensitive).
- Gallery thumbnails mirror the originals: `assets/gallery-thumbs/<Album>/<same filename>`. The grid
  falls back to the full image if a thumbnail is missing. After adding images by git, run
  `python3 scripts/make-thumbs.py`.
- The upload page must keep creating **one commit per batch** (Git Data API), use
  `cache: 'no-store'` on every GitHub call, **strip EXIF/GPS** by re-encoding, and never overwrite
  existing files (it adds `-2` suffixes).
- The GitHub token lives only in `localStorage.gh_pat` on the device. Never log it, hard-code it,
  commit it or send it anywhere except `api.github.com`.
- `sw.js`: the cache name is versioned per build (`site.time`) and pages/CSS/JS are network-first.
  Never go back to cache-first for CSS/JS: installed apps would be stuck on stale styles.
- Liquid division: coerce to a float first (`| plus: 0.0`) or `divided_by` truncates.
- File names for pages and images: lowercase, hyphens, **no spaces**.

## Where things live

| Change | Files |
|---|---|
| Header / nav / footer / chrome JS | `_includes/head.html`, `nav.html`, `footer.html` |
| Page shells & page flags | `_layouts/default.html` (`show_title`, `plain`, `narrow`, `eyebrow`, `description`, `no_sw`), `brew.html`, `bean.html` |
| Colours, fonts, components, breakpoints | `assets/coffee.css` (edit light `:root` **and** both dark blocks) |
| Brew / bean / method content | `brews/*.md`, `beans/*.md`, `methods/*.md` |
| Gallery page, tile, lightbox, albums | `brews-and-frames/index.md`, `_includes/gallery-card.html`, `assets/js/gallery.js`, `_data/gallery.yml` |
| Photo uploader | `upload-photo/index.html` (presets, pipeline, Git Data API) |
| Brew logger | `add-brew/index.html` (Contents API) |
| Calculator recipes | `tools/brew-calculator/calculator.js` |
| PWA / offline | `manifest.json`, `sw.js`, `offline.html` |
| Push reminders | OneSignal in `_layouts/default.html`, `notifications/index.html` |

## Verify every change

```bash
export PATH="/opt/homebrew/bin:$PATH" && eval "$(rbenv init - bash)"   # Ruby 3.2.2 via rbenv
bundle exec jekyll build --destination /tmp/coffee-site                 # must finish with no Liquid errors
```

- Look at the pages you touched at **phone width** (393px, touch) **and** desktop (1280px), in
  light and dark. Serve `/tmp/coffee-site` under `/coffee-claude/` (README §15).
- For the GitHub write flows (`add-brew`, `upload-photo`), **mock `window.fetch`** for
  `api.github.com` and assert on the request sequence and payloads. **Never** run tests against the
  real repo: every call there is a real commit to production.
- Headless Chrome can emulate safe-area insets (`Emulation.setSafeAreaInsetsOverride`) but not
  `display-mode: standalone`.
- OneSignal logs `Can only be used on: https://truedevopsmk-lab.github.io` on localhost. That's
  expected.

## Git & deploy

- `main` is production: a push deploys to GitHub Pages in about a minute. Commits from the phone
  land on `main` directly, so **pull first**.
- Personal repo (`truedevopsmk-lab`). On the owner's Mac, run `gitswitch personal` before pushing.
- **Ask before committing or pushing.** Group related changes into one commit (each commit
  triggers a rebuild). Use conventional-style subjects: `fix(mobile): …`, `feat(upload): …`,
  `brew: add …`, `gallery: add …`.

## Style

Match the surrounding code: its naming, comment density (short "why" comments, no narration) and
idioms. Keep things small and readable: this is a hobby site the owner edits with different AI
tools. When you find a bug you didn't fix, add it to README §19 (Known issues).
