# V8 – Bildüberarbeitung nach Screenshots

Vier projektgebundene Motive, erstellt mit dem integrierten Imagegen-Werkzeug. Die Wettbewerber-Papieransicht dient nur als Perspektivreferenz. Ausgaben unter `web/public/images/v8/`. WebP-Konvertierung ohne weitere Bildbearbeitung; Alpha des Freistellers bleibt erhalten.

## core

```json
[
  {
    "name": "paper",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/paper.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-30111de4-acf2-493c-ae8d-c0a5e0d01bea.png",
    "prompt": "Use case: product-mockup. Create landscape1536x1024 premium product photography. IMAGE1 is the exact photographic perspective/composition reference, IMAGE2 supplies ONLY the blue NordVPN printed card artwork. A natural hand comes from RIGHT and holds the right short edge of a single wafer-thin printed paper mailing perfectly horizontally, straight out toward LEFT. Camera is essentially EDGE-ON to the flat card, just 2-3 degrees above its plane, like image1. See only a very narrow foreshortened sliver of blue printed face; the entire razor-thin edge is clearly visible as an uninterrupted straight fine line from lefttip to fingers. Real card proportions when viewed face-on are 120mm wide x200mm tall portrait, now rotated and lying horizontal; its long edge extends leftwards. Absolutely flat uniform paper substrate, NO bumps, NO raised NFC pad, no relief, no warped target, no thick board, no laminated sandwich, no bends. The very small amount of visible upper face shows blue NordVPN art from image2; do NOT try to turn the card face toward the camera for readability. Thinness and side profile are the subject. Clean white seamless backdrop, soft natural studio light, exact realistic hand anatomy. Keep entire card in frame and hand partly cropped at right as in reference1. No smartphone, no HOLY brand, no productprops, no captions, no graphic labels, no dimensions printed, no illustrated cross-section. Photographic not CGI, highly refined, restrained.",
    "dimensions": [
      1536,
      1024
    ],
    "method": "Built-in image_gen; input and output visual inspection; WebP encoding only at quality88",
    "validation": "NordVPN card nearly edge-on with straight uniform wafer-thin profile, hand from right, no measurements or bulge.",
    "bytes": 24282
  },
  {
    "name": "finish",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/finish.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-1323b80e-3bf0-4658-ba53-8d0635a6acab.png",
    "prompt": "Use case: product-mockup. Landscape1536x1024 premium sensorial macro product photograph of a thin printed PrepMyMeal NFC mailing. Input is binding reference for printed card design: coral background, dark-green 'prepm ymeal' wordmark (use exact wordmark as reference 'prepmymeal'), exact headline 'Dein Feierabend. Fertig.', food photography and lowerhalf centered target. Physical card is a 120mm wide x200mm tall portrait rectangle with square corners and uniformly thin flatpaper edge. Place card diagonally on a white table. Photograph close enough to see refined MATTE paper texture and sharp ink transitions, with upper branding visible near far side and lowerhalf integrated printed tap target sharply focused in foreground: three nested rounded-square pale coral contours with printed opticaldepth, white line-art hand holding phone icon, exact 'Handy hier halten'. Target is ONLY ink on the perfectly flat substrate, NO raised pad, no embossing, no puffed contours, no white filledblock. Keep the entire geometric target undistorted in perspective, not bent around food. A natural fingertip gently touches the lower right paper edge to convey tactile feel. Crisp coral color and fine matte grain, subtle food print details, elegant rakinglight, shallow but not excessive depth of field. No real loosefood, no phones, no HOLY or NordVPN branding, no real waterdrops, no foil, no glitter, no thick plastic, no captions or numerical specs. Sophisticated premium print-quality photograph.",
    "dimensions": [
      1536,
      1024
    ],
    "method": "Built-in image_gen; input and output visual inspection; WebP encoding only at quality88",
    "validation": "PrepMyMeal matte print macro with flat integrated outlined hand-phone tap target and coral brand.",
    "bytes": 211212
  }
]
```

## brand

```json
[
  {
    "name": "comparison",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-27e6f9b6-25fc-447f-bcfd-e1d422357bac.png",
    "prompt": "Use case: background-extraction. Edit this exact HOLY NFC card and iPhone3D citrus experience into a precise transparent-background cutout for overlay on a website. Preserve ALL foregroundobjects, card dimensions, phoneframe, text, glyph, tub, liquid splash, fruit, leaf details, composition and colors EXACTLY. Remove all white studio backdrop and white floor entirely to true alpha transparency. No rectangular white tile or opaque backplate whatsoever, including betweenobjects and splashgaps. Preserve only a subtle natural semi-transparent gray soft contactshadow under phone and card. Maintain original1536x1024canvas allobjectsfullyvisible. TrueRGBA alpha, not checkerboard painted intoimage. Transparentbackground.",
    "reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/experience.webp",
    "transparent": true,
    "method": "built-in image_gen background-extraction then WebP RGBA encoding; no pixel edits",
    "note": "Generated RGBA inspected: all four corners and outside-object sample points alpha0; original composition preserved. Semitransparentcontactshadow. Visualtool renders underlying RGB even when alpha0.",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/comparison.webp",
    "size": [
      1536,
      1024
    ],
    "mode": "RGBA",
    "bytes": 356704,
    "alpha_range": [
      0,
      254
    ],
    "transparent_pixels": 539353,
    "semitransparent_pixels": 915948
  },
  {
    "name": "truenature",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-d1788ebf-f850-4357-b138-9ba87b9604e0.png",
    "prompt": "Use case: precise-object-edit. Edit firstimage of NFCmailer+iPhone TRUE NATURE campaign. Keep exact landscape1536x1024composition, portrait3:5 flatthinpaper withstraightcorners, recognizableiPhone, elegantprintedtap-target with handholdingphoneglyph and allotherlayout. REPLACE BLUE MAGNESIUM bottle in all places with ACTUAL GREEN TRUE NATURE APFELPEKTIN product in secondreference. Faithfully copy blackbottle, greencreamlabel, TRUE NATURE logo, exact 'APFELPEKTIN' and '+ CALCIUM & VITAMIN C',300Stück. Don't recolor existingmagnesium: substitute correct referencedproduct. Coordinate wholecampaignwith richbotanicalgreen/cream instead ofblue: greenleaves, greenheadline 'Ihre Routine. Neu entdecken.', subtleemerald3Dorbits, greenbutton 'Produkt entdecken', greenprintedtapfield. Productfromphoneemerges3D beautifully. Whitespaceclean white studiobackground, softshadows. No newhealthclaims orbenefits, no QRfront, no bigwhite tapblock, allobjectsuncropped.",
    "references": [
      "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/truenature.webp",
      "/workspace/scratch/314596fa5f8b/v8-brand-refs/apfelpektin.png"
    ],
    "source_url": "https://www.true-nature.de/cdn/shop/files/APE-KA_DE_300_Mockup_MadeinGermany_1000x.png?v=1753790608",
    "transparent": false,
    "method": "built-in image_gen edit with official packaging reference then WebP encoding",
    "note": "Actual green APFELPEKTIN + CALCIUM & VITAMIN C packaging, coordinatedgreen campaign card+phone+leaves; no inventedhealthclaims.",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/truenature.webp",
    "size": [
      1536,
      1024
    ],
    "mode": "RGB",
    "bytes": 177854
  }
]
```
