#!/bin/bash
# usage: ./make.sh products/02-*.js ...   builds pptx, pdf and preview grid
set -e
cd "$(dirname "$0")"
SK=/root/.claude/skills/synced/7d806dbd-5dd6-4667-84c9-72658829b4b7_22d8ece4-65ab-428c-9049-f7d10f055204/pptx
NODE_PATH=$PWD/../node_modules node run.js "$@"
for f in "$@"; do
  slug=$(node -e "console.log(require('./$f').slug)"); file=$(node -e "console.log(require('./$f').file)")
  d=dist/$slug
  python3 $SK/scripts/office/validate.py $d/$file.pptx | tail -1
  (cd $d && python3 $SK/scripts/office/soffice.py --headless --convert-to pdf $file.pptx >/dev/null 2>&1)
  rm -f $d/prev-*.jpg; pdftoppm -jpeg -r 50 $d/$file.pdf $d/prev
  python3 - "$d" <<'PY'
import sys,glob
from PIL import Image
d=sys.argv[1]; fs=sorted(glob.glob(d+'/prev-*.jpg')); ims=[Image.open(f) for f in fs]
h=500; ims=[i.resize((int(i.width*h/i.height),h)) for i in ims]
per=6; rows=[ims[i:i+per] for i in range(0,len(ims),per)]
W=max(sum(i.width+8 for i in r) for r in rows); g=Image.new('RGB',(W,len(rows)*(h+8)),'#777')
for ri,r in enumerate(rows):
  x=0
  for i in r: g.paste(i,(x,ri*(h+8))); x+=i.width+8
g.save(d+'/grid.jpg',quality=85)
PY
done
