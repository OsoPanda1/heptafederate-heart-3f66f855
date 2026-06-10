#!/usr/bin/env bash
set -euo pipefail

# Full pipeline:
#   discover → fetch → extract → from-nextgen → normalize → classify → relate → redact → publish
npm run discover
npm run fetch
npm run extract
npm run from-nextgen
npm run normalize
npm run classify
npm run relate
npm run redact
npm run publish