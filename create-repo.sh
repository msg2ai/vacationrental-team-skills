#!/bin/bash
# ============================================================
# create-vacationrental-skills-repo.sh
# Run this from your terminal to create the GitHub repo
# and push all 8 vacation rental team skills.
#
# Prerequisites:
#   - GitHub CLI installed: https://cli.github.com
#   - Logged in: gh auth login
#   - Or set GITHUB_TOKEN env var with a personal access token
# ============================================================

set -e

REPO_NAME="vacationrental-team-skills"
ORG="msg2ai"
DESCRIPTION="8 free Claude skills — one AI seat for every role in your vacation rental property management office, plus a Vibe Coder to ship the direct-booking site. Built by MSG2AI."
SKILLS_DIR="$(dirname "$0")"

echo "🚀 Creating GitHub repo: $ORG/$REPO_NAME"

# Create the repo under msg2ai org
gh repo create "$ORG/$REPO_NAME" \
  --public \
  --description "$DESCRIPTION" \
  --homepage "https://msg2ai.xyz" \
  --clone=false

echo "✅ Repo created: https://github.com/$ORG/$REPO_NAME"

# Init git in the skills directory if not already
cd "$SKILLS_DIR"

if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Stage everything
git add .
git commit -m "Initial commit: 8 vacation rental team Claude skills

- General Manager (Portfolio P&L, owner reporting, ops review, risk, capex)
- Bookings & Reservations (Inquiry handling, quotes, channel sync, cancellation policy)
- Owner Relations (Onboarding, statements, owner comms, renewal/retention)
- Marketing & Distribution (Channel mix, paid + organic, listings, direct-booking, PR)
- Housekeeping & Maintenance (Turnover scheduling, inspections, maintenance, vendors)
- Finance & Trust (Trust accounting, owner statements, splits, tax, cash flow)
- Guest Experience (Pre-arrival, in-stay, concierge, reviews, NPS)
- Vibe Coder (Direct-booking site, landing pages, owner portal — Vercel)

Each skill reads from a shared Knowledge Base (Drive / Dropbox / Notion)
and bootstraps via Firecrawl from an existing rental/property website.

Built by MSG2AI — https://msg2ai.xyz"

# Set remote and push
git remote add origin "https://github.com/$ORG/$REPO_NAME.git"
git push -u origin main

echo ""
echo "✅ All done!"
echo "🔗 Repo live at: https://github.com/$ORG/$REPO_NAME"
echo ""
echo "Next steps:"
echo "  1. Go to the repo and add topics: claude, ai, vacation-rental, airbnb, claude-skills"
echo "  2. Upload vacationrental-team-skills.zip as a Release asset"
echo "  3. Use this URL in your LinkedIn post CTA:"
echo "     https://github.com/$ORG/$REPO_NAME"
