# V10: fixed NFC print template

The central HOLY hero defines the visual reference: portrait3:5; target centre50% card width and78% card height; outer target width44% of card width (26.4% height). Every card uses one identical field, lettering and hand/phone glyph; only print colours vary.

Built-in imagegen removed previous targets. Exact prompts and sources: imagegen-a.json, imagegen-b.json, imagegen-core.json. Clean sources are stored outside public assets.

project-tap.py projects one shared vector template with a homography from the four corners in card-planes.json. Text uses DejaVu Sans Bold outlines.12 images contain15 card planes including the phone thumbnail. Inferred corners are noted in imagegen reports. This is illustration geometry, not a verified manufacturing dieline.

Run project-tap.py with Python, numpy, Pillow and fontTools; then render-assets.cjs with Node and sharp. Intermediate SVGs are ignored. PNG embedding supports SVG renderers; the source photo is losslessly re-encoded before vector rendering. Browser-ready WebP files preserve True Nature alpha. Gallery and comparison use the same asset.

The edge-on paper image has no visible tap face and stays unchanged. Original V7 HOLY macro with leaf, droplets and paper edge is restored for Gestochen scharf.

Logo: black rounded square plus translucent square layers133.333% and166.667% of core size, proportional radii and more spacing. Applied to header, footer, portal, favicon.

Validation: all12 images visually inspected;29page build and DOM/link/interaction checks. Browser layout QA unavailable. Current site audience was already public when V10 began; preserved without an access change. Main and Kontaktstoff live branch are untouched.
