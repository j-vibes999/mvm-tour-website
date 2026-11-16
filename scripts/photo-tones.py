#!/usr/bin/env python3
"""Regenerate dist/photo-tones.js from the local photographs.

Each photo gets its average colour, slightly deepened, which the site paints behind the image
while it loads. Run from the project folder after adding photos:

    python3 scripts/photo-tones.py

Needs Pillow (pip install Pillow). The site works without a tone; it falls back to forest green.
"""
import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, 'dist')

try:
    from PIL import Image
except ImportError:  # pragma: no cover - guidance for the person running it
    sys.exit('Pillow is required: pip install Pillow')

LIST_FILES = """
import('./dist/complete-media.js').then(async M => {
  const C = await import('./dist/content.js');
  const out = { photos: {}, images: {} };
  for (const [key, value] of Object.entries(M.localPhotos)) out.photos[key] = value.srcset.split(',')[0].trim().split(' ')[0];
  for (const key of Object.keys(C.images)) out.images[key] = `assets/images/${key}-160.webp`;
  process.stdout.write(JSON.stringify(out));
});
"""


def tone(path):
    image = Image.open(path).convert('RGB').resize((1, 1), Image.Resampling.BOX)
    r, g, b = image.getpixel((0, 0))
    deepen = 0.82
    return '#%02x%02x%02x' % (int(r * deepen), int(g * deepen), int(b * deepen))


def block(values):
    items = [f"'{key}':'{value}'" for key, value in sorted(values.items())]
    lines, line = [], '  '
    for item in items:
        if len(line) + len(item) + 1 > 118:
            lines.append(line.rstrip())
            line = '  '
        line += item + ','
    lines.append(line.rstrip())
    return '\n'.join(lines)


def main():
    listing = json.loads(subprocess.check_output(['node', '-e', LIST_FILES], cwd=ROOT))
    result = {}
    for group, files in listing.items():
        result[group] = {}
        for key, relative in files.items():
            path = os.path.join(DIST, relative)
            if os.path.exists(path):
                result[group][key] = tone(path)
            else:
                print(f'skip {key}: {relative} not found')
    source = (
        "// Average colour of each local photograph (slightly deepened). It fills the frame while a photo loads,\n"
        "// so slow connections see calm colour instead of an empty box. A missing key falls back to forest green.\n"
        "// Regenerate after adding photos: python3 scripts/photo-tones.py (needs Pillow).\n"
        f"export const photoTones = {{\n{block(result['photos'])}\n}};\n\n"
        f"export const imageTones = {{\n{block(result['images'])}\n}};\n"
    )
    with open(os.path.join(DIST, 'photo-tones.js'), 'w', encoding='utf-8') as handle:
        handle.write(source)
    print(f"Wrote {len(result['photos'])} photo tones and {len(result['images'])} image tones")


if __name__ == '__main__':
    main()
