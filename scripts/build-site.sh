#!/usr/bin/env bash
# Builds the static site that is deployed to Netlify:
#   dist/site/            landing page (site/)
#   dist/site/app/        live dashboard demo (same code the extension ships)
#   dist/site/download/   extension zip
set -euo pipefail
cd "$(dirname "$0")/.."
bash scripts/package-extension.sh
rm -rf dist/site
mkdir -p dist/site/app dist/site/download
cp -R site/. dist/site/
cp -R chrome-extension/dashboard/. dist/site/app/
cp dist/job-application-tracker-extension-v*.zip dist/site/download/job-application-tracker-extension.zip
mkdir -p dist/site/screenshots
cp docs/screenshots/*.png dist/site/screenshots/
echo "Site ready in dist/site"
