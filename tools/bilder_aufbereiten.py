#!/usr/bin/env python3
"""Bereitet Titelbilder für Ratgeber- und Branchenseiten auf.

Aufruf:  python3 tools/bilder_aufbereiten.py <ordner-mit-quellbildern>
Erwartet Dateien <slug>.png oder <slug>.jpg und erzeugt in assets/artikel/:
  <slug>.webp      1600 px breit, 16:9 (Titelbild)
  <slug>-640.webp  640 px breit, 16:9 (Karten)
  <slug>-og.jpg    1200 × 630 (Social-Media-Vorschau)
Die Dateien werden neu kodiert und ohne Metadaten gespeichert.
"""
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ZIEL = ROOT / 'assets' / 'artikel'


def zuschneiden(img, verhaeltnis):
    b, h = img.size
    if b / h > verhaeltnis:
        neu_b = round(h * verhaeltnis)
        links = (b - neu_b) // 2
        return img.crop((links, 0, links + neu_b, h))
    neu_h = round(b / verhaeltnis)
    oben = (h - neu_h) // 2
    return img.crop((0, oben, b, oben + neu_h))


def main():
    quelle = Path(sys.argv[1])
    ZIEL.mkdir(parents=True, exist_ok=True)
    for datei in sorted(list(quelle.glob('*.png')) + list(quelle.glob('*.jpg'))):
        slug = datei.stem
        img = Image.open(datei).convert('RGB')
        breit = zuschneiden(img, 16 / 9)
        breit.resize((1600, 900), Image.LANCZOS).save(ZIEL / f'{slug}.webp', quality=80, method=6)
        breit.resize((640, 360), Image.LANCZOS).save(ZIEL / f'{slug}-640.webp', quality=78, method=6)
        zuschneiden(img, 1200 / 630).resize((1200, 630), Image.LANCZOS).save(ZIEL / f'{slug}-og.jpg', quality=84, optimize=True, progressive=True)
        print(slug, 'ok')


if __name__ == '__main__':
    main()
