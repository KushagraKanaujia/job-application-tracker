#!/bin/bash

# Helper script to open Chrome extensions page

echo "=========================================="
echo "Job Application Tracker - Extension Setup"
echo "=========================================="
echo ""
echo "Opening Chrome extensions page..."
echo ""

# Open Chrome extensions page
open -a "Google Chrome" "chrome://extensions/"

sleep 2

echo "✓ Chrome extensions page opened"
echo ""
echo "Next steps:"
echo "1. Enable 'Developer mode' (toggle in top-right)"
echo "2. Click 'Load unpacked'"
echo "3. Select folder: $HOME/job-application-tracker/chrome-extension/"
echo "4. Click 'Select' to install"
echo ""
echo "Extension location:"
echo "  $HOME/job-application-tracker/chrome-extension/"
echo ""
echo "Full guide: See EXTENSION_INSTALL.md or QUICK_START.md"
echo ""

# Try to open the folder in Finder for easy access
open "$HOME/job-application-tracker/chrome-extension/"

echo "✓ Extension folder opened in Finder"
echo ""
echo "Ready to install! 🚀"
