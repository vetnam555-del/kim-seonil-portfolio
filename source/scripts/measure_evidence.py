"""Measure original assets so lazy-loaded evidence reserves its final space."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parent.parent
sizes = {}
for path in sorted((root / "public/evidence").iterdir()):
    if path.suffix.lower() not in {".png", ".webp", ".jpg", ".jpeg", ".avif"}:
        continue
    with Image.open(path) as picture:
        sizes[path.name] = {"width": picture.width, "height": picture.height}
output = root / "src/data/evidence-sizes.json"
output.write_text(json.dumps(sizes, indent=2) + "\n", encoding="utf-8")
print(f"Evidence dimensions: {len(sizes)} assets")
