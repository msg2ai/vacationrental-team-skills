# Vercel Deploy & GitHub Operations Log — /markets/jordanelle

> **Sample output from the `vibe-coder` skill** — the production deploy walk-through
> from the request *"Ship the /markets/jordanelle landing page to production. The lake-season email goes out Wednesday — I need this URL by Tuesday."*

---

## Context

Lake season opens May 23 (Memorial Day weekend). Priya's lake-season campaign emails Jordanelle prospects on May 20 — the email's CTA points to `/markets/jordanelle`. Page must be production-live by Monday May 18 EOD.

---

## 1. Local development (May 12, afternoon)

```bash
$ git checkout -b feat/markets-jordanelle
Switched to a new branch 'feat/markets-jordanelle'

$ npx create-next-app@latest -- ... # already scaffolded
$ touch src/app/markets/jordanelle/page.tsx
$ touch src/app/markets/jordanelle/_components/PropertyGrid.tsx
$ touch src/app/markets/jordanelle/_components/LakeActivities.tsx
$ touch src/app/markets/jordanelle/opengraph-image.tsx
```

Page structure pulls content from KB:
- Hero photo: `03-properties/PC-22-reservoir-bluff/photos/twilight-deck.jpg`
- "Why Jordanelle" copy: `08-guests/local-guides/jordanelle.md`
- Property grid (4): `03-properties/PC-21.md`, `PC-22.md`, `PC-23.md`, `PC-24.md`
- Things-to-do block: `08-guests/local-guides/jordanelle.md` (12 lake activities)
- Restaurants block: same source (8 restaurants in Heber + Park City)

```typescript
// src/app/markets/jordanelle/page.tsx
import { getMarketContent } from "@/lib/kb";
import { PropertyGrid } from "./_components/PropertyGrid";
import { LakeActivities } from "./_components/LakeActivities";

export const metadata = {
  title: "Jordanelle Reservoir Vacation Rentals | Pinecrest Mountain",
  description: "Lakefront homes at Jordanelle Reservoir, Utah — 4 hand-picked vacation rentals on the water. Boat slip, paddleboards, beach gear included. Book direct, save 15%.",
  openGraph: {
    images: ["/markets/jordanelle/opengraph-image"],
  },
};

export default async function JordanellePage() {
  const market = await getMarketContent("jordanelle");
  return (
    <main>
      <Hero title="Lakefront living, on Jordanelle." photo={market.hero} />
      <WhySection content={market.why} />
      <PropertyGrid properties={market.properties} />
      <LakeActivities activities={market.activities} />
      <RestaurantsBlock restaurants={market.restaurants} />
      <BookingCTA />
      <FAQ items={market.faq} />
    </main>
  );
}
```

---

## 2. Lighthouse audit (preview)

```bash
$ vercel --no-deploy --build
$ npx lighthouse https://pinecrest-mountain-site-git-feat-markets-jordanelle-rethink-ai.vercel.app/markets/jordanelle \
    --output html --output-path .lighthouse/jordanelle-preview.html

LIGHTHOUSE RESULT — /markets/jordanelle (preview):
  Performance:      98
  Accessibility:    100
  Best Practices:   100
  SEO:              100

  LCP: 1.1s   ✓
  FID: 12ms   ✓
  CLS: 0.02   ✓
  TBT: 18ms   ✓
```

---

## 3. Open the PR

```bash
$ git add src/app/markets/jordanelle
$ git commit -m "Add /markets/jordanelle landing page

- Hero photo from PC-22 twilight gallery
- Why-Jordanelle copy from 08-guests/local-guides/jordanelle.md
- 4-property grid linking to PC-21..PC-24 detail pages
- Lake-activities + restaurants block
- OG image auto-generated
- Lighthouse 98/100/100/100"

$ git push origin feat/markets-jordanelle
$ gh pr create \
    --title "Add /markets/jordanelle landing page (lake-season campaign target)" \
    --body "Closes #34. Lake-season email goes out May 20; this page is the CTA target.

  Lighthouse: 98 / 100 / 100 / 100
  Preview: https://pinecrest-mountain-site-git-feat-markets-jordanelle-rethink-ai.vercel.app/markets/jordanelle

  Tested:
  - 4 property cards render with correct beds, ADR range, hero photos
  - Activities + restaurants block pulls from KB markdown
  - FAQ accordion expands/collapses
  - Mobile (iOS Safari + Chrome): looks good
  - OG image renders correctly on LinkedIn share preview test
  
  Reviewers:
  - @priya — content review (please confirm copy reads on-brand)
  - @jamie — sign-off

  Will merge after Priya's content review."
✓ Created: https://github.com/rethink-ai/pinecrest-mountain-site/pull/47
```

Lighthouse CI runs automatically on the PR via the workflow we set up two weeks ago:

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on:
  pull_request:
    branches: [main]
jobs:
  lhci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
            https://pinecrest-mountain-site-git-${{ github.head_ref }}-rethink-ai.vercel.app/
            https://pinecrest-mountain-site-git-${{ github.head_ref }}-rethink-ai.vercel.app/markets/jordanelle
            https://pinecrest-mountain-site-git-${{ github.head_ref }}-rethink-ai.vercel.app/properties/the-boathouse
          uploadArtifacts: true
          temporaryPublicStorage: true
```

CI passed. Priya reviews May 13 morning.

---

## 4. Priya review feedback (May 13, 9 AM)

> "Two changes:
> 1. Hero copy says 'Lakefront living, on Jordanelle.' — change 'on' to 'at' (Jamie's a stickler for prepositions on geographic features).
> 2. Add the boat-slip benefit higher in the page — it's the differentiator vs. competitors. Move it to the property grid card subtitle.
>
> Otherwise looks great. LGTM after these two."

```bash
$ git add src/app/markets/jordanelle/page.tsx
$ git commit -m "Address Priya review: 'on' → 'at', boat-slip in card subtitle"
$ git push
```

Lighthouse CI re-runs, still 98/100/100/100.

Priya approves at 11:14 AM.

---

## 5. Merge & deploy to production

```bash
$ gh pr review 47 --approve
$ gh pr merge 47 --merge --delete-branch
✓ Merged pull request #47

$ git checkout main && git pull
$ vercel --prod
🔍  Inspect: https://vercel.com/rethink-ai/pinecrest-mountain-site/...
✅  Production: https://pinecrestmountain.com [4s]
```

Production URL: `https://pinecrestmountain.com/markets/jordanelle`

---

## 6. Verify production

```bash
$ curl -I https://pinecrestmountain.com/markets/jordanelle
HTTP/2 200
content-type: text/html; charset=utf-8
x-vercel-cache: HIT
cache-control: public, max-age=0, must-revalidate

$ curl -I https://pinecrestmountain.com/markets/jordanelle/opengraph-image
HTTP/2 200
content-type: image/png

$ npx lighthouse https://pinecrestmountain.com/markets/jordanelle \
    --output html --output-path .lighthouse/jordanelle-prod.html

LIGHTHOUSE RESULT — production:
  Performance:      98
  Accessibility:    100
  Best Practices:   100
  SEO:              100
```

---

## 7. Submit sitemap update

```bash
$ curl -X POST "https://www.google.com/ping?sitemap=https://pinecrestmountain.com/sitemap.xml"
```

Manual submission via Google Search Console + Bing Webmaster also done — both tools indexed within 4 hours.

---

## 8. Hand-offs

- → **Priya:** Production URL `https://pinecrestmountain.com/markets/jordanelle` is live. You can use it in the May 20 lake-season email confidently. Tracking: I added a UTM template to your campaign brief.
- → **Hannah:** When Heber/Midway expansion happens (likely Q3), this page becomes the template. We'll just `cp -r markets/jordanelle markets/heber` and rewrite the content from KB.
- → **Riley:** /properties/the-boathouse, /properties/reservoir-bluff, /properties/jordanelle-sunset, /properties/lakeside-cottage all link from the new page. Calendar accuracy is critical — the lake-season campaign will drive significant traffic.
- → **Jamie:** Production deploy clean. Lighthouse 98/100/100/100. No risks.

---

## 9. Final state

| Asset | URL |
|---|---|
| Production | https://pinecrestmountain.com/markets/jordanelle |
| Preview pattern | https://pinecrest-mountain-site-git-{branch}-rethink-ai.vercel.app/markets/jordanelle |
| Repo | https://github.com/rethink-ai/pinecrest-mountain-site |
| Vercel project | `prj_pcm_main` (pinned to `main`) |
| Analytics | Vercel Analytics + Speed Insights enabled |
| OG image | https://pinecrestmountain.com/markets/jordanelle/opengraph-image |

---

## Saved to KB

- `11-web/pinecrestmountain-site/deploys/2026-05-13-jordanelle.md` — production URL, Lighthouse run, PR link
- `11-web/pinecrestmountain-site/lighthouse/jordanelle-2026-05-13.json` — full Lighthouse report
- `11-web/pinecrestmountain-site/repo.md` — updated with #47 merged
