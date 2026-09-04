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

## Font

Space Grotesk is self-hosted from `public/fonts/`. Its source attribution and SIL Open Font License 1.1 are included in that directory.
