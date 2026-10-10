"""Project one vector NFC print template onto each photographed card plane.

Imagegen removes the old fields; this script never changes raster pixels.
It embeds the clean photograph in a self-contained SVG and projects vector
outlines using a homography. Text is outlined for consistent browser rendering.
Run from this folder with Python, numpy and fontTools installed.
"""
import base64
import json
import math
from io import BytesIO
from pathlib import Path
import numpy as np
from PIL import Image
from fontTools.pens.basePen import BasePen
from fontTools.svgLib.path import parse_path
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent
PUBLIC = ROOT.parent.parent / 'web/public'
FONT = TTFont('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
GLYPHS = FONT.getGlyphSet()
CMAP = FONT.getBestCmap()
UNITS = FONT['head'].unitsPerEm
CARD = (600, 1000)
FIELD = (168, 648, 264, 264)


class Outline(BasePen):
    def __init__(self, glyphs=None):
        super().__init__(glyphs)
        self.parts = []
        self.points = []

    def _moveTo(self, p):
        if self.points:
            self._endPath()
        self.points = [p]

    def _lineTo(self, p):
        self.points.append(p)

    def _curveToOne(self, a, b, c):
        p = self.points[-1]
        for t in np.linspace(0, 1, 13)[1:]:
            self.points.append(tuple((1-t)**3*p[i]+3*(1-t)**2*t*a[i]+3*(1-t)*t*t*b[i]+t**3*c[i] for i in (0,1)))

    def _qCurveToOne(self, a, b):
        p = self.points[-1]
        for t in np.linspace(0, 1, 11)[1:]:
            self.points.append(tuple((1-t)**2*p[i]+2*(1-t)*t*a[i]+t*t*b[i] for i in (0,1)))

    def _closePath(self):
        self.parts.append((self.points, True))
        self.points = []

    def _endPath(self):
        if self.points:
            self.parts.append((self.points, False))
        self.points = []


def path_parts(d):
    pen = Outline()
    parse_path(d, pen)
    pen._endPath()
    return pen.parts


def rounded(x, y, w, h, r):
    return path_parts(f'M{x+r},{y}H{x+w-r}Q{x+w},{y} {x+w},{y+r}V{y+h-r}Q{x+w},{y+h} {x+w-r},{y+h}H{x+r}Q{x},{y+h} {x},{y+h-r}V{y+r}Q{x},{y} {x+r},{y}Z')


def homography(quad):
    src = [(0,0),(600,0),(600,1000),(0,1000)]
    a, b = [], []
    for (x,y),(u,v) in zip(src,quad):
        a += [[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-v*x,-v*y]]
        b += [u,v]
    return np.append(np.linalg.solve(a,b),1).reshape(3,3)


def project(h, x, y):
    p = h @ np.array([x,y,1])
    return p[0]/p[2], p[1]/p[2]


def path_svg(parts, h, offset=(168,648)):
    out = []
    for points, closed in parts:
        pts = [project(h,x+offset[0],y+offset[1]) for x,y in points]
        out.append('M'+'L'.join(f'{x:.2f},{y:.2f}' for x,y in pts)+('Z' if closed else ''))
    return ''.join(out)


def text_parts(text='Handy hier halten', size=18.5, baseline=61):
    scale = size/UNITS
    width = sum(GLYPHS[CMAP[ord(c)]].width for c in text)*scale
    cursor = (264-width)/2
    result = []
    for c in text:
        glyph = GLYPHS[CMAP[ord(c)]]
        pen = Outline(GLYPHS)
        glyph.draw(pen)
        for points, closed in pen.parts:
            result.append(([(cursor+x*scale,baseline-y*scale) for x,y in points],closed))
        cursor += glyph.width*scale
    return result


# One shared hand/phone glyph and NFC waves: no per-brand variants.
ICON = [
    'M100 184L94 100Q94 93 102 93H147Q153 93 153 101L160 192Q160 199 153 199H111',
    'M112 103H135',
    'M101 147L83 138Q74 135 72 142Q69 150 78 154L97 162',
    'M96 163L79 155Q71 152 68 160Q66 168 74 171L96 179',
    'M96 180L79 172Q71 169 69 178Q68 184 77 188L100 196',
    'M100 197L86 191Q78 188 76 196Q75 204 86 208L111 218Q125 225 145 220L164 235',
    'M148 155L145 133Q144 124 151 121Q159 119 164 133L171 153Q175 173 188 186L213 211',
    'M81 108Q68 121 81 135',
    'M69 98Q48 121 68 145',
    'M58 87Q27 121 56 155',
    'M172 108Q185 121 172 135',
    'M184 98Q205 121 185 145',
    'M195 87Q226 121 197 155',
]


def field_svg(card, index):
    h = homography(card['corners'])
    ink, panel = card.get('ink','#161b12'), card.get('panel','#eceb19')
    ring = card.get('ring',ink)
    a, b = project(h,300,780), project(h,310,780)
    scale = math.dist(a,b)/10
    pieces = []
    if card.get('occlusion'):
        polygons = ''.join('<polygon points="'+' '.join(f'{x},{y}' for x,y in points)+'" fill="black"/>' for points in card['occlusion'])
        pieces.append(f'<defs><mask id="visible-{index}" maskUnits="userSpaceOnUse" x="0" y="0" width="1536" height="1024"><rect width="1536" height="1024" fill="white"/>{polygons}</mask></defs>')
    mask = f' mask="url(#visible-{index})"' if card.get('occlusion') else ''
    pieces.append(f'<g{mask} data-template="holy-tap-v1" data-center="0.5,0.78">')
    # Flat translucent printed surface. Only the printed rings imply depth.
    pieces.append(f'<path d="{path_svg(rounded(0,0,264,264,55),h)}" fill="{panel}" fill-opacity="1"/>')
    for inset,opacity,width in [(8,.42,3),(19,.65,3),(30,.95,2.4)]:
        d=path_svg(rounded(inset,inset,264-2*inset,264-2*inset,55-inset*.7),h)
        pieces.append(f'<path d="{d}" fill="none" stroke="{ring}" stroke-opacity="{opacity}" stroke-width="{width*scale:.2f}"/>')
    pieces.append(f'<path d="{path_svg(text_parts(),h)}" fill="{ink}"/>')
    for d in ICON:
        pieces.append(f'<path d="{path_svg(path_parts(d),h)}" fill="none" stroke="{ink}" stroke-width="{5*scale:.2f}" stroke-linecap="round" stroke-linejoin="round"/>')
    pieces.append('</g>')
    return ''.join(pieces)


def build(spec):
    source = ROOT / spec['source']
    # SVG renderers universally support PNG; re-encoding preserves source pixels.
    buffer = BytesIO()
    Image.open(source).save(buffer, format='PNG')
    data = base64.b64encode(buffer.getvalue()).decode()
    width, height = spec.get('size',[1536,1024])
    photo = f'<image width="{width}" height="{height}" xlink:href="data:image/png;base64,{data}"/>'
    fields = ''.join(field_svg(card,i) for i,card in enumerate(spec['cards']))
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 {width} {height}" width="{width}" height="{height}"><title>Impulse campaign card with fixed NFC print template</title>{photo}{fields}</svg>\n'
    destination = ROOT / 'generated' / (Path(spec['output']).stem+'.svg')
    destination.parent.mkdir(exist_ok=True)
    destination.write_text(svg)
    return destination.name


if __name__ == '__main__':
    specs = json.loads((ROOT/'card-planes.json').read_text())
    for spec in specs:
        print(build(spec))
