#!/usr/bin/env python3
"""Generate local asset manifest for offline service worker (no remote references)."""
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
files=['./'+p.relative_to(root).as_posix() for p in (root/'assets').rglob('*') if p.is_file() and p.suffix.lower() in ('.svg','.png','.ico','.webp')]
(root/'assets-manifest.json').write_text(json.dumps(sorted(files),ensure_ascii=False,indent=2))
print(len(files),'offline visual resources')
