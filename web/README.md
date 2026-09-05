# Harness Learning Site

The bilingual Next.js learning interface for the repository's `s01_*` through `s17_*` Agent Harness course.

## Develop

```bash
npm ci
npm run dev
```

Open <http://localhost:3000/en/> or <http://localhost:3000/zh/>.

Primary routes are `/{locale}/course`, `/{locale}/topics`, `/{locale}/compare`, and `/{locale}/sNN`.

## Content and validation

```bash
npm run extract
npx tsc --noEmit
npm run build
```

The extractor requires all 17 root chapters, each with `code.py`, `README.md`, and `README.zh.md`. It generates only English and Simplified Chinese site data under `src/data/generated/` and copies chapter images to `public/course-assets/`.

## Homepage motion

`src/components/home/home-motion.tsx` and its CSS module add decorative contour drawing, fine-pointer parallax, repeatable viewport reveals (1.4s, 36px rise, cards staggered by 70ms), and course-card hover/focus feedback. `home-text-effects.tsx` resolves the brand title from scrambled characters in 2.8s and types the syntax-highlighted homepage code in 2.6s when it enters view. The existing homepage sections remain unchanged. The contours are decoration, not a Harness architecture diagram.

Inspired by the interaction examples at <https://www.unicorn.studio/inspiration>; implemented locally without copied scenes, a Unicorn SDK, or external assets. Panel entrances replay on re-entry after the panel has fully left the viewport by 80px, in either scroll direction, including after reaching the page bottom. They do not loop while stationary; title and code animations still finish once per visit. Touch pointers do not drive parallax, and `prefers-reduced-motion` disables movement. Content remains visible without JavaScript or the animation APIs.

For browser regression, check `/zh/` and `/en/` at desktop and 390px widths: move the pointer across the hero, scroll to the cards, Tab through links, and toggle reduced motion while the page is open. Confirm the 17 lesson links still work, no horizontal page overflow occurs, and the hero stops moving under reduced motion. Verify that code typing and title scrambling finish once without changing element dimensions, scrolling down and back up repeatedly reveals panels progressively (including the bottom topics), focused links become visible immediately, and reduced motion shows the full title, code, and panels at once.

## Font

Space Grotesk is self-hosted from `public/fonts/`. Its source attribution and SIL Open Font License 1.1 are included in that directory.
