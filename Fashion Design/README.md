# MAISON NOIRE — The Form of Silence

> A luxury fashion editorial website and front-end motion design study, built with plain HTML, CSS and JavaScript. No frameworks, no animation libraries, no build step.

---

## Overview

**MAISON NOIRE** is a conceptual luxury label presented through an editorial digital campaign, *The Form of Silence*. The project shows that an art-directed, motion-rich fashion site can be built with web standards alone: semantic HTML5, CSS custom properties, CSS animations/transitions, `IntersectionObserver`, and a small amount of vanilla JavaScript.

MAISON NOIRE is a fictional brand created for portfolio and educational purposes.

---

## Page Structure

1. **Header** — wordmark, navigation, mobile drawer
2. **Hero** — masked headline reveal, curtain reveal of Plate I, subtle image parallax
3. **Manifesto** — quote revealed in three phrase groups
4. **Collection Archive** — asymmetric 12-column grid, eight pieces
5. **Signature Piece** — *The Obsidian Harness*, with its own slower horizontal curtain reveal
6. **Motion Study** — portrait campaign film (native 9:16) with captions
7. **Closing Statement** — line reveal, then a hairline that drops into the footer
8. **Footer**

---

## Motion System

All motion lives in the last section of `Style.css` and in `min.Js`.

| Area | Technique |
| --- | --- |
| Opening | Header wordmark wipe; hero headline and tagline revealed line by line behind `overflow: hidden` masks; hero photograph via `clip-path` curtain + scale; supporting text sequenced after the headline. Navigation is usable immediately. |
| Typography | Phrase-group line masks (`.line-mask` / `.line-inner`) with a stagger driven by a `--i` index. Text stays inline in DOM reading order; nothing is split into characters. |
| Image reveals | One `IntersectionObserver` adds `.is-revealed` once per element. Cards open with a restrained `clip-path` window and a small image settle; cards entering together get a 0–330 ms stagger. The signature piece uses a slower left-to-right curtain. |
| Parallax | Hero and signature images shift by about 3.5 % of their frame height. One passive scroll listener, gated by an `IntersectionObserver` and `requestAnimationFrame`, writes a CSS variable applied through `translate`. Only active on fine-pointer devices and never under reduced motion. |
| Micro-interactions | Image zoom, card lift, category colour change, meta hairline draw, animated underlines on nav and footer links. Hover effects apply only where hover exists (`@media (hover: hover) and (pointer: fine)`); all information is visible on touch screens. |
| Campaign film | `preload="none"`, so nothing downloads until playback starts. Silent, looping playback starts only while the film is on screen and pauses when it leaves. A visitor's own pause is respected. Never autoplays under reduced motion or Data Saver. |
| Closing | Statement revealed in two lines, then actions, then a vertical hairline that draws down into the footer. |

**Motion tokens** (`:root` in `Style.css`): `--dur-micro/fast/standard/reveal/slow`, `--ease-editorial/out-expo/in-out-luxury/subtle`, `--move-xs/sm/md/lg`, `--stagger-step`, `--mask-inset`. Animation is limited to `transform`, `opacity`, `clip-path` and the individual `scale` / `translate` properties.

### Progressive enhancement

- Content is visible by default. Hidden start states exist only under `html.js-motion`.
- A small inline script in `<head>` adds `js-motion` before first paint when `IntersectionObserver` is available and reduced motion is **not** requested.
- `min.Js` adds `motion-ready` once initialised. If that has not happened after 3 seconds (for example the script failed to load), the head script removes `js-motion` and everything is shown.
- With JavaScript disabled, the page renders fully and the video keeps its native controls.

---

## Accessibility

- `prefers-reduced-motion: reduce` disables all reveal states, parallax, and video autoplay.
- Visible 2 px focus ring on every interactive element, light-coloured on dark surfaces.
- Mobile drawer works with keyboard; `Escape` closes it and returns focus to the toggle.
- Secondary text colours meet WCAG AA for small text: `--text-subtle` `#68655C` is 5.2:1 on ivory and 4.7:1 on warm ivory; light-on-dark captions use `--text-inverse-muted` (8.1:1).
- Interactive targets in the mobile header are at least 44 × 44 px.
- Video has a play/pause button with a state-aware label and a text description (`.sr-only`).
- In-page anchors account for the sticky header via `scroll-padding-top`.

---

## Performance

- Photography is served from `img/optimized/` as WebP at 640, 960 and 1280 px via `srcset` / `sizes`. The original JPEGs in `img/` are untouched.
- The hero image is **not** lazy-loaded; it is preloaded with `fetchpriority="high"`. Below-the-fold images use `loading="lazy"` and `decoding="async"`.
- Width and height attributes plus CSS `aspect-ratio` prevent layout shift.
- The favicon is a small SVG (`img/optimized/favicon.svg`).
- In a local Chromium test, loading and scrolling the full page on desktop transferred roughly 0.8 MB excluding the video, compared with roughly 13 MB before optimisation. This is a measured transfer size on a local server, not a Lighthouse score.
- The campaign film (`img/2c267ca5…mp4`, about 20 MB, 606 × 1080, 24 s) is unchanged and loads only when played.

---

## Project Structure

```
Fashion Design/
├── index.html          # Entry point; semantic markup and head motion gate
├── Style.css           # Design tokens, layout, responsive rules, motion system
├── min.Js              # Navigation, reveals, parallax, video controller
├── README.md
├── CASE_STUDY.md
├── .gitignore
├── img/
│   ├── optimized/      # WebP derivatives, video poster, SVG favicon (published)
│   └── …               # Original photography and campaign film
└── _backup_phase1/     # Historical backups (kept locally, not published)
```

File names are case-sensitive on GitHub Pages. `index.html` references `Style.css` and `min.Js` with exactly that capitalisation.

---

## Run Locally

From the project folder:

```bash
python -m http.server 8080
```

Open `http://localhost:8080/index.html`. Alternatives: `npx serve .` or VS Code Live Server.

---

## Deployment (GitHub Pages)

1. Push the repository to GitHub (commands below).
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, branch `main`, folder `/ (root)`, then **Save**.
4. The site is served at `https://<username>.github.io/<repository-name>/` after a minute or two.

All asset paths are relative, so project sub-paths work. Netlify (drag-and-drop or linked repo, no build command, publish directory `.`) and Vercel (framework preset *Other*) work the same way.

### Git commands

Run from `D:\Fashion Design` in PowerShell:

```bash
git init
git add .
git status                      # confirm _backup_phase1/ and unused images are NOT listed
git commit -m "feat: MAISON NOIRE editorial site with motion system"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

Nothing is pushed or deployed until you run these yourself.

---

## Media Attribution & Licensing

- **Photography (6 images in the hero, collection and signature piece):** Vladislav Nahorny via [Pexels](https://www.pexels.com/@vladislav-nahorny-171529149/), Pexels licence. Attribution is not required by that licence but is given here.
- **`img/S6015_14.webp` and `img/B152_10.webp`** (collection pieces 07 and 08): source and licence are **not documented** in this project. Confirm rights or replace before publishing.
- **Campaign film** (`img/2c267ca5…mp4`): source and licence are **not documented**. The footage includes a short burned-in Arabic text overlay, which suggests it comes from another party's campaign. Confirm you have the right to publish it, or replace it, before making the site public.
- **Typography:** *Cormorant Garamond* (Christian Thalmann) and *Plus Jakarta Sans* (Tokotype), SIL Open Font License, loaded from Google Fonts. This sends a request to Google's servers when the page loads.
- Source images listed in `.gitignore` under "Source images not used by index.html" stay on disk and are not published.

---

## Known Limitations

- Video playback was not exercised with the real H.264 file in automated tests (the test browser has no H.264 decoder). Controller logic was tested with a substitute WebM; confirm playback manually in Chrome, Safari and Firefox.
- Lighthouse and real-device testing have not been run.
- Some `alt` text describes garment details (materials, cuts) that are part of the fictional copy and cannot be confirmed from the photographs.
