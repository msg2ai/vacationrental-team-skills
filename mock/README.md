# Mock Portfolio — Pinecrest Mountain Rentals

**Pinecrest Mountain Rentals** is a fictional 24-property short-term-rental management company in Park City, UT used to showcase what each of the 8 vacation-rental skills produces. The leadership personas in `property-portfolio.md` carry across every output — Jamie Castellanos (GM), Riley Okafor (Reservations), Mia Tanaka (Guest Experience), Diego Alvarez (Housekeeping), Hannah Brookes (Owner Relations), Priya Shah (Marketing), Marcus Friedman (Finance), and Theo Nakamura (Web).

The portfolio: 8 ski-in/ski-out condos at Canyons Village, 12 mountain-modern cabins in Old Town & Deer Valley, 4 lakefront properties at Jordanelle Reservoir. Founded 2019. $3.4M ARR. 68% direct / 24% Airbnb / 8% VRBO.

The "now" is **late spring 2026** — ski season just wrapped (Apr 19), Memorial Day is four weeks out, summer pace is running ahead of plan.

## What's in here

```
mock/
├── property-portfolio.md                       ← The fake company + portfolio definition (units, owners, KPIs, current focus)
├── README.md                                   ← You are here
└── outputs/                                    ← 3 sample artifacts per skill
    ├── general-manager/
    │   ├── 01-weekly-ops-review.md             ← Monday 1-pager: traffic-light per workstream
    │   ├── 02-risk-register.md                 ← Live risks (regulatory, operational, financial, reputational)
    │   └── 03-investor-briefing.md             ← Q1 monthly briefing for the May 15 board
    ├── bookings-reservations/
    │   ├── 01-inquiry-triage.md                ← 3 OTA inquiries, scored & responded to
    │   ├── 02-gap-night-plan.md                ← May–June gap nights with recovery plan
    │   └── 03-min-stay-pricing-rules.md        ← Summer min-stay & instant-book rules per segment
    ├── guest-experience/
    │   ├── 01-pre-arrival-sequence.md          ← T-7 / T-3 / T-1 / T-0 sequence (lakefront family)
    │   ├── 02-ai-ambassador-config.md          ← Per-property AI Ambassador setup for Hawkfeather Cabin
    │   └── 03-monthly-nps-report.md            ← April NPS, themes, save-rate, repeat-booking funnel
    ├── housekeeping-maintenance/
    │   ├── 01-daily-turnover-sheet.md          ← May 12 turnovers across 24 units, route-optimized
    │   ├── 02-work-order-tracker.md            ← Open work orders, severity, vendor, owner-charge status
    │   └── 03-pre-summer-pm-schedule.md        ← Preventive maintenance plan, May–June, by property
    ├── owner-relations/
    │   ├── 01-monthly-statement.md             ← April statement: Sandra Park, 2 ski-in/out condos
    │   ├── 02-renewal-pitch.md                 ← Sandra Park renewal pitch (anniversary July 1)
    │   └── 03-churn-risk-list.md               ← Q2 churn-risk owners with retention actions
    ├── marketing-distribution/
    │   ├── 01-listing-rewrite.md               ← Hawkfeather Cabin: rewritten Airbnb + VRBO listings
    │   ├── 02-summer-campaign-calendar.md      ← Direct-booking content + email plan, May–Sep
    │   └── 03-comp-set-analysis.md             ← Canyons Village comp-set: pricing & positioning gaps
    ├── finance-trust/
    │   ├── 01-trust-reconciliation.md          ← Week-of-May-11 3-way trust account reconciliation
    │   ├── 02-q1-tax-filings.md                ← Wasatch County, Park City, Utah State filings due
    │   └── 03-per-property-pnl.md              ← Q1 P&L for the 8 ski-in/out condos
    └── vibe-coder/
        ├── 01-direct-booking-site-brief.md     ← Next.js scaffold + content map for pinecrestmountain.com
        ├── 02-vercel-deploy-log.md             ← Vercel + GitHub deploy walk-through (markets/jordanelle)
        └── 03-owner-portal-spec.md             ← Magic-link owner-portal feature spec + data model
```

## Knowledge Base Layout

In a real run, this is what the team's shared Knowledge Base looks like for Pinecrest (Google Drive):

```
Pinecrest Mountain Rentals/                ← shared root
├── 01-portfolio-brief/                    ← who, markets, brand (Jamie)
├── 02-brand-and-voice/                    ← logo, colors, tone (Priya)
├── 03-properties/                         ← per-unit folders (PC-01 ... PC-24)
├── 04-owners/                             ← contracts, statements, comms log (Hannah)
├── 05-channels/                           ← Airbnb / VRBO / Hostaway exports (Riley)
├── 06-housekeeping-maintenance/           ← SOPs, vendors, work orders (Diego)
├── 07-finance-trust/                      ← trust ledger, payouts, taxes (Marcus)
├── 08-guests/                             ← FAQ, helpdesk, reviews, NPS (Mia)
├── 09-meeting-notes/                      ← weekly ops, decisions, owner reviews (Jamie)
└── 11-web/                                ← repo URLs, deploys, screenshots (Theo)
```

The KB was bootstrapped by **Firecrawl** scraping `https://pinecrestmountain.com` (the existing direct-booking site) and the company's Airbnb host profile in March 2026 — 45 minutes of crawling produced `01-portfolio-brief/from-website.md` and 24 per-property scaffolds at `03-properties/{slug}/listing-from-channels.md`, saving the team a week of typing.

## How the skills connect

```
                              GM (Jamie Castellanos)
                              ↑   ↑   ↑   ↑   ↑   ↑   ↑
            ┌────────┬────────┴───┴───┴───┴───┴───┴───┴────────┬────────┐
            │        │             │              │             │        │
       Reservations  Guest XP  Housekeeping  Owner Relations  Marketing  Finance   Web
        (Riley)    (Mia)    (Diego)      (Hannah)        (Priya)   (Marcus) (Theo)
            │        │             │              │             │        │
            └────────┴─────────────┴── shared Knowledge Base ────┴────────┘
```

| From Skill | To Skill | What's handed off |
|---|---|---|
| Reservations → Housekeeping | Tonight's check-ins/check-outs and same-day-flip risk |
| Reservations → Marketing | Gap-night list for flash-discount campaigns |
| Reservations → Finance | Per-booking gross revenue + channel fees |
| Housekeeping → Reservations | Same-day-flip readiness; PM blackout windows |
| Housekeeping → Owner Relations | Work-order owner-charges (with photos) |
| Housekeeping → Finance | Cleaner-pay batch from turnover schedule |
| Owner Relations → Reservations | Owner-imposed blackout dates |
| Owner Relations → Finance | Owner contract fee structure for monthly payouts |
| Marketing → Reservations | Per-property rates, discount rules, min-stay |
| Marketing → Owner Relations | Comp-set RevPAR for renewal pitches |
| Marketing → Web | Brand assets, listing copy, campaign briefs |
| Finance → Owner Relations | Owner net payout numbers for monthly statements |
| Finance → GM | STR-permit-expiring list + per-property P&Ls |
| Guest Experience → Owner Relations | Damage / disturbance escalations |
| Guest Experience → Housekeeping | In-stay issue alerts (broken / leak / dirty) with severity |
| Guest Experience → Marketing | Negative review themes for listing-copy edits |
| Web → All skills | Production URL + preview URLs; lead-form submissions to Owner Relations |
| All skills → GM | Status updates for the weekly ops review and monthly briefing |

## Using this as a template

To plan a real management portfolio with these skills:

1. Copy `property-portfolio.md` and replace with your portfolio details
2. Set up your shared Knowledge Base in Google Drive (or Dropbox / Notion) — the GM skill creates the 11-folder structure for you
3. Bootstrap from your existing direct-booking site, Airbnb host profile, or VRBO landlord page with Firecrawl (one prompt: *"Bootstrap the knowledge base from https://yourcompany.com and our Airbnb host profile using Firecrawl"*)
4. Open Claude Code and use the skills naturally:
   ```
   "Run the weekly ops review for the week of May 11"
   "Score these 3 Airbnb inquiries and draft replies"
   "Generate Sandra Park's April owner statement"
   "Push the new summer rates to PriceLabs"
   "Ship the /markets/jordanelle landing page to Vercel"
   ```
5. Each skill produces outputs like the ones in `outputs/` — ready to send, present, or post.
