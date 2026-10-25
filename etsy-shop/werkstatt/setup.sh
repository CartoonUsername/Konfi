#!/bin/bash
# Prepares a fresh machine (e.g. a weekly Claude run) to build templates, Etsy images and pins.
set -e
cd "$(dirname "$0")"
mkdir -p ~/.fonts && cp fonts/*.ttf ~/.fonts/ && (fc-cache -f >/dev/null 2>&1 || true)
python3 -c "import PIL, numpy" 2>/dev/null || pip install -q pillow numpy
[ -d node_modules/pptxgenjs ] || npm install --silent --no-audit --no-fund pptxgenjs@4.0.1
echo "Werkstatt bereit."
