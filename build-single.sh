#!/usr/bin/env bash
# Builds out/assemble-26.html: the whole site in one self-contained file.
set -e
cd "$(dirname "$0")"
cp index.html .index.orig.html
python3 - <<'PY'
import base64
svg=open('public/emblem.svg').read()
uri='data:image/svg+xml;base64,'+base64.b64encode(svg.encode()).decode()
s=open('index.html').read().replace('src="/emblem.svg"',f'src="{uri}"').replace('href="/emblem.svg"',f'href="{uri}"')
open('index.html','w').write(s)
PY
npx vite build -c vite.single.config.js >/dev/null || { mv .index.orig.html index.html; exit 1; }
mv .index.orig.html index.html
mkdir -p out
python3 - <<'PY'
import re
s=open('dist-single/index.html').read()
s=re.sub(r',\s*url\(data:font/woff;base64,[A-Za-z0-9+/=]+\)\s*format\(["\']woff["\']\)','',s)
for b in re.findall(r'@font-face\{[^}]*\}',s):
    m=re.search(r'unicode-range:([^;}]*)',b); r=m.group(1) if m else ''
    if not ((not r) or 'U+0000-00FF' in r or ('Anton' in b and '20AD' in r)): s=s.replace(b,'')
open('out/assemble-26.html','w').write(s)
print('single file:', len(s)//1024, 'KB')
PY
