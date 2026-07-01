# Owner Portal Spec — pinecrestmountain.com/owner-portal

> **Sample output from the `vibe-coder` skill** — produced from the request:
> *"Spec out the owner portal v2. Hannah needs owners to see their numbers and submit blackout dates without emailing us. Marcus wants the trust ledger view. Owners want their statements downloadable. Ship it for the August quarterly cycle."*

---

## Stack

- **Auth:** Auth.js v5 (Magic Link via Resend) — no passwords
- **Framework:** Next.js 15 App Router (existing)
- **Database:** Postgres (Vercel Postgres — first time we're adding a DB to the site; pull from Hostaway + KB on read)
- **Hosting:** Vercel — same project (`prj_pcm_main`), gated route `/owner-portal/*`
- **Read-side data:** Hostaway API + KB markdown + statements PDFs from `04-owners/{slug}/statements/`
- **Write-side data:** owner blackout dates, owner FAQ requests — stored in Postgres + synced to Hostaway

---

## Why now

Currently owners email Hannah for:
- "How much did I make in April?" (75% of inbound owner email = statement-related)
- "Block my property May 28-30 for personal use." (15%)
- "Do you have updates on the work order?" (5%)
- "How do my taxes work for this property?" (5%)

The portal v1 (read-only) shipped in March handled the first 75%. **Portal v2 ships the rest** — blackout-date submission + work-order acknowledgment + tax FAQ self-serve. Expected to reduce owner-email volume by 50% and free Hannah for the strategic conversations (renewal pitches, churn-risk).

---

## Pages & Features

### `/owner-portal` (login)

Magic-link only. Owner enters email → Resend sends signed link → click → 30-min session.

```typescript
// src/app/owner-portal/login/page.tsx
import { signIn } from "@/auth";

export default function Login() {
  return (
    <form action={async (formData) => {
      "use server";
      await signIn("resend", { email: formData.get("email") });
    }}>
      <input name="email" placeholder="hello@yourdomain.com" />
      <button type="submit">Send me a link</button>
    </form>
  );
}
```

Allowlist of owner emails maintained in `04-owners/_owner-emails.md` and synced to Postgres on each owner sign/leave.

---

### `/owner-portal` (dashboard, post-login)

Per-owner home view, dynamically rendered. For Westridge LLC (5 properties), we show 5 cards; for Sandra Park (2), we show 2; for single-property owners, just 1.

**Top of page:**
- Header: "Hi, Sandra." + last-login date
- KPI strip: this-month payout (live), occupancy pacing next 90 days, open work orders (across her properties), upcoming blackout dates

**Middle:**
- Property cards (one per property): photo, name, beds/baths, last-30-day occupancy, last-30-day revenue, "View details" link

**Bottom:**
- Latest 3 statements (PDF download)
- Recent comms from Pinecrest (last 5 messages)

```typescript
// src/app/owner-portal/page.tsx
import { auth } from "@/auth";
import { getOwnerData } from "@/lib/owners";

export default async function OwnerDashboard() {
  const session = await auth();
  if (!session) redirect("/owner-portal/login");
  
  const ownerData = await getOwnerData(session.user.email);
  return (
    <main>
      <Header name={ownerData.name} lastLogin={ownerData.lastLogin} />
      <KPIStrip kpis={ownerData.kpis} />
      <PropertyCards properties={ownerData.properties} />
      <RecentStatements statements={ownerData.statements} />
      <RecentMessages messages={ownerData.messages} />
    </main>
  );
}
```

---

### `/owner-portal/properties/[slug]` (per-property detail)

Deep-dive on one property. Includes:

- Photo gallery (12 hero photos)
- Live calendar (Hostaway pull, color-coded: green = booked, yellow = blackout, gray = available)
- Booking table (last 30 + next 60 days): guest first name, dates, channel, gross revenue, owner net
- Work orders panel: open, scheduled, recent
- Reviews from this property (last 6, 5-star + summary scores)
- Performance vs. comp set (RevPAR vs. portfolio avg + segment avg)
- Property settings: amenities, house rules, channels active

---

### `/owner-portal/payouts` (statements)

Sortable table:

| Period | Gross revenue | Channel fees | Pinecrest fee | Taxes | Work orders | Net to me | PDF |
|---|---:|---:|---:|---:|---:|---:|---|
| Apr 2026 | $21,160 | -$2,083 | -$4,232 | -$2,296 | -$72 | $11,847 | [Download] |
| Mar 2026 | $24,840 | -$2,484 | -$4,968 | -$2,694 | $0 | $14,694 | [Download] |
| (etc.) | | | | | | | |

Every PDF is fetched from `04-owners/{owner-slug}/statements/{period}.pdf`.

---

### `/owner-portal/calendar` (NEW in v2 — blackout-date submission)

The most-requested feature.

```typescript
// src/app/owner-portal/calendar/page.tsx
import { CalendarView } from "./_components/CalendarView";

export default async function CalendarPage() {
  const ownerData = await getOwnerData(session.user.email);
  return (
    <main>
      <h1>Your calendar</h1>
      <p>Submit blackout dates for personal use, family stays, or property maintenance. We'll confirm within 24 hours.</p>
      <CalendarView ownerProperties={ownerData.properties} />
      <BlackoutSubmissionForm />
    </main>
  );
}
```

**Form workflow:**
1. Owner picks property (dropdown of their properties)
2. Selects date range (interactive calendar)
3. Picks reason (personal use / family / maintenance / owner-direct booking)
4. Adds optional note
5. Submits → POST `/api/owner-portal/blackout`

**Backend:**
- Saves to Postgres `owner_blackout_requests` table with status = 'pending'
- Sends Slack DM to Hannah ("Sandra Park requested blackout PC-01 May 28-30 for family use")
- Sends auto-confirmation email to owner: "Got it. We'll confirm within 24 hours."
- Hannah reviews → approves → POST to Hostaway API to block the dates → status = 'confirmed'
- Owner gets email: "Confirmed: PC-01 blocked May 28-30."

**Constraints:**
- Cannot block dates with existing confirmed bookings (system rejects with explanation)
- Cannot block dates within 7 days (system rejects, suggests asking the GM directly)
- Maximum 14 blackout days per quarter without GM approval (per contract)

---

### `/owner-portal/work-orders` (work-order log + acknowledgment)

Read + light-write. Owner sees:

- All work orders for their property in the last 12 months
- Status (open / in-progress / closed)
- Severity, vendor, owner-charge amount
- Photo evidence
- An ACKNOWLEDGE button on closed work orders that they should sign-off on

When owner acknowledges:
- Status moves to "acknowledged"
- Diego gets notified — billing can close in QuickBooks
- Owner's monthly statement reflects the acknowledged status

This eliminates Hannah's quarterly "remind owners to sign off on the deck stain quote" emails.

---

### `/owner-portal/messages` (comms inbox)

A simple inbox showing comms from Pinecrest (Hannah, Mia escalations, Diego escalations, GM comms).

- Read-only for v2 (no reply from this UI — they reply via email or text)
- Threads are pulled from AgentMail's `owners@pinecrestmountain.com` and Slack escalation logs
- Notification badge if unread

---

### `/owner-portal/faq` (self-serve answers)

Top 30 owner questions with rich answers. Marcus owns the content. Search-as-you-type. Examples:

- "How is my management fee calculated?"
- "When do I get paid?"
- "Why was my March payout lower than expected?"
- "Can I bring my own cleaner?"
- "Do I have to pay tax on my owner payouts?"
- "How does the cleaning fee work?"
- "What if my property has a 1-star review?"

If a question isn't answered: form to submit it. Hannah reviews and adds to the FAQ if it's been asked twice.

---

## Data Model (Postgres)

```sql
-- Owner identities
CREATE TABLE owners (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  legal_entity TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Per-owner property assignments (denormalized from KB)
CREATE TABLE owner_properties (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES owners(id),
  property_slug TEXT NOT NULL,
  property_name TEXT NOT NULL,
  hostaway_id INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Blackout date requests
CREATE TABLE owner_blackout_requests (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES owners(id),
  property_slug TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  note TEXT,
  status TEXT DEFAULT 'pending', -- pending / confirmed / rejected
  hostaway_block_id TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- Work-order acknowledgments
CREATE TABLE owner_wo_acknowledgments (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES owners(id),
  work_order_id TEXT NOT NULL,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMP,
  note TEXT
);

-- Sessions (Auth.js v5)
CREATE TABLE sessions (...);
```

---

## Permissions

| Path | Anon | Owner | Pinecrest staff |
|---|---|---|---|
| `/owner-portal/login` | YES | YES | YES |
| `/owner-portal/*` | NO (redirect to login) | YES — only sees own properties | YES (via impersonation flag) |
| `/api/owner-portal/blackout` | NO | POST own properties only | n/a |
| `/api/owner-portal/wo-ack` | NO | POST own work orders only | n/a |

Pinecrest staff (Hannah, Marcus, Jamie) can impersonate any owner account via a `?impersonate=sandra-park` query param + a dev-tools cookie. Logged in audit log.

---

## Security & Compliance

- Magic-link auth only — no password leak surface
- Auth.js handles session expiry (30-min default, refresh on activity)
- Rate-limit `/api/owner-portal/blackout` to 10/min per session (via Vercel Edge Config)
- All financial data read from KB / Postgres — no direct bank account exposure
- PDF statements are signed-URL fetched from S3 (15-min expiry per fetch)
- Audit log: every login, every blackout request, every WO acknowledgment

---

## Lighthouse Targets

Same standards as the rest of the site: 95+ on all 4 metrics, even on data-heavy `/owner-portal/properties/[slug]` page (Hostaway data lazy-loaded after first paint).

---

## Rollout Plan

| Date | Step |
|---|---|
| May 20 | Spec sign-off (Hannah, Marcus, Jamie) |
| May 27 | Postgres schema + Auth.js + magic-link working in dev |
| Jun 8 | `/owner-portal/calendar` (blackout submission) live in preview |
| Jun 15 | `/owner-portal/work-orders` (acknowledgment) live in preview |
| Jun 22 | Internal testing (Hannah + Sandra Park as a friendly tester) |
| Jul 1 | Beta with 5 owners (Westridge LLC + Sandra + 2 single-property) |
| Jul 22 | Beta feedback iterated |
| Aug 1 | **Production launch — all 18 owners** |
| Aug 15 | Quarterly review tie-in (Q3 quarterly reviews use the portal as the data source) |

---

## Hand-offs

- → **Owner Relations (Hannah):** sign-off on workflow + email copy for blackout submission. You'll get a Slack DM for every blackout request — please respond within 24 hours.
- → **Finance (Marcus):** sign-off on data model + PDF-statement signing. The view of trust account balance is per-property only — no all-portfolio aggregate visible to any single owner.
- → **GM (Jamie):** sign-off on the 14-day blackout cap and the impersonation flag for staff.
- → **All:** Aug 1 launch is the goal. Lake-season-2 quarterly reviews on Aug 15 will be the first real-world test.

---

## v2.5 Backlog (post-launch)

| Item | Owner |
|---|---|
| Owner messaging UI (write — not just read) | Theo |
| Owner-side work-order request submission | Theo + Diego |
| Per-property comp-set RevPAR widget | Theo + Priya |
| Annual P&L summary download (PDF) | Theo + Marcus |
| Owner-side referral-program self-serve (refer a friend → 1% off your fee) | Theo + Hannah |

---

*Saved to KB: `11-web/pinecrestmountain-site/owner-portal-v2-spec.md`. Reviewed by Hannah May 19. Final approval pending Marcus sign-off on data model May 20.*
