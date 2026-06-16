#!/bin/bash
# Setup Apollo.io integration for Claude Code
# Used by: Marketing & Distribution, Owner Relations (owner/lead prospecting, contact enrichment, outreach).
#          Complements Twenty CRM — Apollo *fills* the pipeline, Twenty *manages* it.
echo "Setting up Apollo.io integration..."
echo ""
echo "Apollo.io is the prospecting engine for Marketing & Distribution and Owner Relations:"
echo "  - Search companies and property owners by industry, size, geography, technographics"
echo "  - Find decision-maker contacts (property owners, asset managers, HOA leads, etc.)"
echo "  - Enrich existing contact records"
echo "  - Trigger outreach sequences from confirmed prospects"
echo ""
echo "Connect via Claude.ai (recommended):"
echo "  1. Go to https://claude.ai/settings/connectors"
echo "  2. Find 'Apollo.io' and click Connect"
echo "  3. Authorize with your Apollo account (OAuth)"
echo "  4. Apollo will be available in Claude Code automatically"
echo ""
echo "Or add it directly to Claude Code:"
echo "  claude mcp add apollo --transport http https://mcp.apollo.io"
echo ""
echo "After connecting, test it by asking Claude:"
echo "  'Find 30 short-term-rental property owners in the Smoky Mountains with 5+ properties'"
