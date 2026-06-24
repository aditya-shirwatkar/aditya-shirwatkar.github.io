#!/usr/bin/env bash
# Local dev server - open http://localhost:8080 after running this
# Sections load via fetch(), so a server is needed (file:// won't work).
# Usage: ./serve.sh
cd "$(dirname "$0")"
python3 -m http.server 8080
