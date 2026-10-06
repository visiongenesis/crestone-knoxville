# Crestone Roofing Knoxville site (draft, not deployed)

Static site. No framework. Every page is built from one template so the header, footer, call bar and noindex tag stay identical everywhere.

## Layout

```
site/
  index.html, about.html, contact.html   built pages (do not hand-edit; edit _build/pages/ and rebuild)
  services/ areas/ guides/               built by parts B and C
  assets/site.css                        the only stylesheet (tokens on :root, mobile first)
  assets/site.js                         nav toggle, form focus states, phone-click tracking stub
  assets/ridge.svg, ridge-dark.svg       roofline art used behind .page-head and .cta-band
  assets/favicon.svg
  _build/template.html                   page shell: {{title}} {{description}} {{canonical}} {{content}} {{root}} {{bodyclass}}
  _build/build.py                        builder, stdlib only
  _build/pages/                          one fragment per page
  _build/ridge-inline.html               inline roofline SVG (home hero); paste into a hero if a page needs it
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

## Photo slots

There are no photos on the site, on purpose. Real Knoxville photos go where the comments say: `grep -rn "PHOTO SLOT" _build/pages`. No stock photos, no Colorado job photos presented as Knoxville work.

## Honesty rules (every page)

No Tennessee license claim or number until the state issues one. No manufacturer certifications (the Colorado company's GAF and Owens Corning status does not transfer to Knoxville). No testimonials. No invented numbers. No stock people. No em-dashes. The "4.7 stars" line is the Colorado Birdeye rating (about 60 reviews) from `research/crestone-public-profile.md` and must say Colorado.
The Crestone story uses only facts from that same profile. The About page wording ("building it with the Crestone team in Colorado") should be confirmed with Crestone before launch, since the brand and deal terms are still being settled.

Check before shipping (prints nothing when clean): `grep -rl -e "$(printf '\342\200\224')" -e "licen[s]ed" -e "Master[ ]Elite" .`

## Screenshots

Headless Chrome will not render narrower than 500px, so phone shots go through a 390px iframe. See `_shots/`.
