# Crestone Roofing Knoxville site (v2, deployed to GitHub Pages, noindex)

Static site. No framework. Every page is built from one template so the header, footer, call bar and noindex tag stay identical everywhere.

## Layout

```
site/
  index.html, about.html, contact.html   built pages (do not hand-edit; edit _build/pages/ and rebuild)
  services/ areas/ guides/               built by parts B and C
  assets/site.css                        the only stylesheet (tokens on :root, mobile first)
  assets/site.js                         nav toggle, form focus states, phone-click tracking stub
  assets/img/                            16 photos + CREDITS.md
  assets/favicon.svg
  _build/template.html                   page shell: {{title}} {{description}} {{canonical}} {{content}} {{root}} {{bodyclass}}
  _build/build.py                        builder, stdlib only
  _build/pages/                          one fragment per page
  _build/gen/gen_pages.py                writes every fragment (all copy lives here)
  _build/phone-icon.html                 phone icon SVG used inside call buttons
  _shots/                                screenshots
  robots.txt (Disallow: /), .nojekyll
```

## Adding a page (parts B and C)

1. Create a fragment in `_build/pages/`, for example `_build/pages/services-roof-repair.html`:

```
---
title: Roof Repair in Knoxville | Crestone Roofing
description: One or two plain sentences for search results.
path: services/roof-repair.html
---
<section class="page-head">
  <div class="wrap">
    <p class="crumbs"><a href="{{root}}index.html">Home</a><span>/</span>Roof repair</p>
    <h1>Roof repair in Knoxville.</h1>
    <p class="lede">...</p>
  </div>
</section>
<div class="wrap split">
  <article class="prose"> ... </article>
  <aside class="aside"><div class="aside-card"> ... </div></aside>
</div>
```

2. Run from the site folder: `python3 _build/build.py`

- `path` decides where the page lands. A page in a subfolder gets `{{root}}` = `../`, a root page gets `./`. Always write links and assets as `{{root}}...`, never `/...`, so the site works under a subpath like `/crestone-knoxville/`.
- A `.md` fragment also works: headings (`##`), paragraphs, `- ` lists, `**bold**`, `[text](url)`. Lines starting with `<` pass through as raw HTML. It is wrapped in `.wrap.prose-page > .prose`.
- The builder stops on missing front matter or an unknown `{{placeholder}}`.

Class kit for inner pages: `.page-head`, `.crumbs`, `.lede`, `.split` + `.aside` + `.aside-card`, `.prose`, `.callout`, `.check-list`, `.faq` (wrap `<details><summary>`), `.steps` (an `<ol>`), `.svc-grid`/`.svc`, `.guide-grid`/`.guide`, `.area-list`, `.cta-band.on-dark` with `.cta-actions`, buttons `.btn.btn-primary|btn-dark|btn-ghost`. Copy the inspection form from `_build/pages/contact.html`.

## Swaps before launch

- **Phone.** Placeholder is `(865) 000-0000` (shown) and `+18650000000` (tel: links). Every visible number has class `phone`. Swap in the fragments and the template, then rebuild:
  `grep -rl -e '000-0000' -e '+18650000000' _build | xargs sed -i '' -e 's/(865) 000-0000/(865) NEW-NUMB/g' -e 's/+18650000000/+1865NEWNUMB/g' -e 's/+1-865-000-0000/+1-865-NEW-NUMB/g'`
- **Form.** Every form posts to `https://formspree.io/f/PLACEHOLDER`. Replace `PLACEHOLDER` with the real Formspree form id in `_build/pages/*`, rebuild, and submit one test request.
- **Canonical URL.** Set `CRESTONE_SITE_URL` when building, for example `CRESTONE_SITE_URL=https://crestoneknoxville.com/ python3 _build/build.py`. Default is a placeholder.
- **noindex.** Two places: `<meta name="robots" content="noindex,nofollow">` in `_build/template.html`, and `robots.txt`. Remove both only when the site is approved to go public.
- **Hours.** `contact.html` has `<!-- HOURS PLACEHOLDER -->`.
- **Analytics.** `track()` in `assets/site.js` only pushes to `window.dataLayer`. Point it at the real tool later.

## Photos (v2, 2026-10-06)

16 licensed photos live in `assets/img/` (WebP, max 1800px). Sources, authors and licenses: `assets/img/CREDITS.md`. CC-BY / CC-BY-SA attributions are on `credits.html`, linked in the footer. Pexels photos need no attribution but are listed anyway.
None of these photos are Crestone jobs. Never caption one as a Knoxville or Crestone project. Swap in real job photos (same filenames) once they exist.

## Copy lives in one script

All page copy is in `_build/gen/gen_pages.py`. It writes every fragment in `_build/pages/`. Edit copy there, then run:
`python3 _build/gen/gen_pages.py && CRESTONE_SITE_URL=https://visiongenesis.github.io/crestone-knoxville/ python3 _build/build.py`

## Hard lines (every page)

1. Never state a Tennessee license exists or print a license number.
2. Never caption or imply a photo is a Knoxville job.
3. No customer quotes or review counts beyond "4.7 stars" and "60+ reviews" (Colorado, Birdeye/Google).
Also: Knoxville is never framed as new (no "now in", "opening", "coming soon", "branch"). No em-dashes. "Not legal advice" appears only in the guide footers.

Check before shipping (prints only guide footers when clean):
`grep -rl -e "$(printf '\342\200\224')" -e "licensed in Tennessee" -e "as we read" -e "not legal advice" --include=*.html --exclude-dir=_build .`

## Screenshots

Headless Chrome will not render narrower than 500px; v2 phone shots are at 500px wide. See `_shots/v2-*`.
