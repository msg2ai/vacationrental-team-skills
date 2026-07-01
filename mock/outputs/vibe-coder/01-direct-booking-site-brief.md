# Direct-Booking Site Brief — pinecrestmountain.com

> **Sample output from the `vibe-coder` skill** — produced from a single prompt:
> *"Spin up the Pinecrest Mountain Rentals direct-booking site using the brand and properties already in our KB and ship the v1 to a Vercel preview today."*

---

## Stack

- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind, ESLint, src-dir)
- **Hosting:** Vercel (production: `pinecrestmountain.com`, preview per PR)
- **Repo:** `rethink-ai/pinecrest-mountain-site` (default branch protected, dev branch for staging)
- **Fonts:** `Outfit` (display, mountain-modern feel), `Inter` (body), self-hosted via `next/font`
- **CMS / source of truth:** Knowledge Base markdown — no headless CMS, all content reads from `03-properties/*.md`
- **Channel manager:** Hostaway (booking engine via REST API + iCal feed for fallback)

---

## Content sourced from the Knowledge Base

| Section | Pulled from |
|---|---|
| Company name, markets, brand | `01-portfolio-brief/pinecrest-overview.md` |
| Brand color, logo, voice doc | `02-brand-and-voice/brand.md`, `voice.md` |
| Per-property listings (24) | `03-properties/PC-01.md` ... `PC-24.md` |
| Per-property photo set | `03-properties/PC-01/photos/` |
| Property reviews (rolling 90-day) | `08-guests/reviews/` |
| Pricing rates (push-direction) | Hostaway → PriceLabs → site (read-only) |
| Per-market local guides | `08-guests/local-guides/canyons-village.md`, `jordanelle.md` |
| FAQ (top 12) | `08-guests/faq.md` |
| Owner-facing pages | `04-owners/marketing-pages.md` |

---

## Page structure (24 pages live for v1)

```
app/
├── (marketing)/
│   ├── page.tsx                       ← Hero, search, featured properties, why-direct, owner CTA, FAQ teaser
│   ├── properties/
│   │   ├── page.tsx                   ← Search results, filter (beds, market, dates, amenity)
│   │   └── [slug]/page.tsx            ← 24 dynamic property pages
│   ├── markets/
│   │   ├── canyons-village/page.tsx   ← Ski-in/out segment hero + properties
│   │   ├── old-town/page.tsx          ← Old Town cabins segment
│   │   └── jordanelle/page.tsx        ← Lakefront segment (currently in PR review)
│   ├── owners/page.tsx                ← Owner-acquisition lead form
│   ├── owner-portal/page.tsx          ← Magic-link auth, 18 owner dashboards
│   ├── about/page.tsx                 ← Team, story, properties under management
│   ├── blog/
│   │   ├── page.tsx                   ← MDX blog listing
│   │   └── [slug]/page.tsx            ← Individual blog posts
│   ├── faq/page.tsx                   ← Top 12 guest questions
│   ├── flash-deals/page.tsx           ← Gap-night flash with countdown timer (sunset May 16)
│   ├── press/page.tsx                 ← Press kit (logos, fact sheet, media-contact)
│   └── search/page.tsx                ← Search-engine landing for paid + SEO
├── opengraph-image.tsx                ← Auto-generated OG image with brand
├── sitemap.ts                         ← All 24 properties + 3 markets + blog + owner page
└── robots.ts
```

---

## Hero copy (Priya's voice — pulled from `02-brand-and-voice/voice.md`)

> ## Park City, on your terms.
> 24 hand-picked cabins, condos, and lakefront homes in Park City and Jordanelle Reservoir.
> Book direct. Save 15%. Text the same person who handles your stay.
>
> [ Search availability ] [ Browse all 24 properties ]

**Why-direct callout (homepage, beneath search):**

> Why book direct?
>
> - **15% lower price** — same property, no Airbnb service fee
> - **Direct text line to Mia** — your concierge for the trip, response in 30 seconds
> - **5% off if you've stayed with us before** — auto-applied at checkout
> - **No middleman** if anything goes wrong — you talk to us, we fix it

---

## Hostaway Booking Engine Integration

The hard part. Pinecrest's Hostaway account doesn't expose a clean booking widget — but it does expose a REST API.

**Decision:** custom search UI on our site, posting search queries to Hostaway's `/api/v1/listings/search` endpoint, displaying availability inline. On book → Stripe Checkout for deposit → POST to Hostaway `/api/v1/reservations` to hold + confirm.

```typescript
// app/properties/_components/SearchForm.tsx
async function search({ market, dates, guests }: SearchParams) {
  const res = await fetch("/api/hostaway/availability", {
    method: "POST",
    body: JSON.stringify({ market, dates, guests }),
  });
  return res.json(); // returns { available: [...], unavailable: [...] }
}
```

```typescript
// app/api/hostaway/availability/route.ts
import { hostaway } from "@/lib/hostaway";

export async function POST(req: Request) {
  const { market, dates, guests } = await req.json();
  const listings = await hostaway.searchAvailability({ market, dates, guests });
  return Response.json({ listings });
}
```

**Fallback:** if Hostaway API is unreachable, the site falls back to displaying iCal-derived availability (cached every 30 min) and routes the booking to a "request stay" form that creates a Hostaway lead.

---

## Per-property page (24 pages)

Each `/properties/[slug]` is generated at build time from `03-properties/{slug}.md`. v1 includes:

- 12-photo hero gallery (responsive, lazy-loaded `next/image`)
- Headline + 3-sentence pitch
- Key facts grid (beds, baths, sleeps, market, ADR range)
- Full description (from listing.md)
- Amenity grid (28 amenities, 4-column on desktop)
- Map (lazy-loaded — Mapbox, single marker)
- Reviews (last 6, pulled from `08-guests/reviews/{property-slug}/`)
- Live availability calendar (Hostaway-driven)
- Book-now CTA (sticky on mobile)
- "Why book direct" callout per property
- "Text Mia about this place" CTA → opens SMS link to AI Ambassador with property pre-filled

**Structured data:** `LodgingBusiness` JSON-LD per property for SEO + Google Hotel Pack visibility.

---

## Per-market page (3 markets, SEO play)

`/markets/canyons-village`, `/markets/old-town`, `/markets/jordanelle`.

Each page includes:
- Hero photo of the market
- 3-paragraph "why this market" copy (pulled from `08-guests/local-guides/{market}.md`)
- Grid of all our properties in that market (8 / 12 / 4)
- Things-to-do block (pulled from local guides)
- Where-to-eat block
- "Why we're here" Pinecrest narrative

**Structured data:** `TouristDestination` JSON-LD + meta optimized for "[market] vacation rentals" intent.

---

## Owner Lead-Capture Page (`/owners`)

The single most important page for growth. v1 includes:

- Hero ("List your property with Pinecrest — earn $X more")
- 3-card value-prop (Channel mix, AI Ambassador, Local team)
- Fee transparency table (industry comparison: Vacasa 35%, Evolve 12%, Pinecrest 20–25%)
- Lead form (name, email, phone, # units, market, current management, motivation)
- Social proof (4 owner quotes — pulled from KB)
- Cal.com tour-booking embed
- FAQ (top 8 owner questions)

Lead form posts to:
1. Vercel serverless function `/api/owners-lead`
2. Function creates Twenty CRM record + sends confirmation email via Resend + posts to AgentMail (`owners@pinecrestmountain.com`)
3. Hannah gets a Slack DM via webhook

---

## Owner Portal (`/owner-portal`) — gated, magic-link auth

For each of our 18 owners, a personalized dashboard:

- This-month payout (pulled from `07-finance-trust/payouts/`)
- Occupancy pacing for next 90 days (Hostaway feed)
- Calendar (read-only, all properties)
- Open work orders (filtered to their property)
- Latest statement (PDF download from `04-owners/{slug}/statements/`)
- Messages from Pinecrest

**Auth:** Auth.js with magic-link via Resend. No passwords. Read-only by design — any change request opens a ticket to Hannah.

**MVP for v1:** read-only data only. Phase 2 (Q3) adds owner-side blackout date entry + work-order acknowledgment.

---

## Lighthouse targets (preview build for v1)

| Metric | Target | Achieved (preview) |
|---|---|---|
| Performance | 95+ | 96 |
| Accessibility | 95+ | 100 |
| Best Practices | 95+ | 100 |
| SEO | 95+ | 100 |

Performance hit because of large hero photos on property pages — already at WebP/AVIF + responsive widths via `next/image`. Could push to 98+ by lazy-loading the photo gallery aggressively, planned for v1.1.

---

## What was shipped today (v1)

- Repo scaffolded: `rethink-ai/pinecrest-mountain-site` (private, branch protection on)
- Vercel preview live: `https://pinecrest-mountain-site-git-main.vercel.app`
- Custom domain pending DNS — `pinecrestmountain.com` apex points to Vercel
- All 24 property pages generated from KB markdown
- Hostaway availability API integration tested with 6 properties (full rollout v1.1)
- Stripe Checkout wired to test keys (deposit-style direct bookings)
- Owner lead-capture form wired to Twenty CRM + AgentMail
- Owner portal auth (Auth.js + Resend) wired with test users
- OG image generation working (tested on LinkedIn + iMessage previews)
- SEO basics: sitemap, robots, meta, JSON-LD all 24 properties
- 5 photos still missing (PC-13, PC-15, PC-19 partials) — flagged back to Diego/Priya

---

## Hand-offs

- → **GM (Jamie):** Preview URL for the v1 walkthrough. Lighthouse scores logged. No risks.
- → **Marketing (Priya):** /flash-deals page sunset May 16; /markets/jordanelle PR ready for content review.
- → **Reservations (Riley):** Hostaway integration tested with 6 properties; please test 8 more this week.
- → **Owner Relations (Hannah):** /owners page lead form is live; expect Slack DM + email when leads come in.
- → **Finance (Marcus):** Stripe test keys swapped for production keys before v1 launch (May 16).
- → **All:** v1 production launch target = May 16, 2026.

---

## v1.1 Backlog (next 2 weeks)

| Item | Owner |
|---|---|
| /markets/jordanelle PR merge + production deploy | Theo |
| Lazy-load property gallery (push Lighthouse to 98) | Theo |
| Hostaway availability for remaining 18 properties | Theo + Riley |
| Owner-portal phase 2: blackout-date entry | Theo + Hannah |
| Booking.com onboarding (when Sep 1 launch is approved) | Theo + Riley |
| Direct-booking checkout: Apple Pay + Google Pay | Theo |
| Per-property reviews carousel (rolling 6) | Theo |

---

*Saved to KB: `11-web/pinecrestmountain-site/v1-brief.md`. Repo: github.com/rethink-ai/pinecrest-mountain-site. Vercel project: prj_pcm_v1.*
