#!/bin/bash
# Setup Google Calendar integration for Claude Code
# Used by: General Manager, Bookings & Reservations, Owner Relations, Housekeeping & Maintenance
echo "Setting up Google Calendar integration..."
echo ""
echo "This will open a browser for Google OAuth authorization."
echo ""
claude mcp add google-calendar --transport http https://mcp.google.com/calendar
echo ""
echo "Done! Google Calendar is now available in Claude Code."
echo "Test it by asking Claude: 'Show my upcoming calendar events'"
