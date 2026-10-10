# V9 visual asset audit and prompts

All 14 base illustrations were audited against the central HOLY card in the existing hero. Visual reference: portrait 3:5, tap centre at x50% / y78%, outer target width44% of the card. These are illustration targets, not verified manufacturing dimensions. Generated perspective renders retain small differences and must not be used as production templates.

Ten new WebP files replace nine base illustrations and the comparison cutout. Arrival, connect, experience, HOLY and the edge-on paper image remain unchanged after inspection. All rendering paths use src/data/assets.ts, including dashboard choices and subpages. True Nature and comparison share identical corrected transparent artwork.

QR code is deterministic SVG, generated using the preinstalled qrcode-terminal QRCode implementation, error correction M, 37 modules plus a four-module quiet zone. Encoded destination: https://kontaktstoff-nfc-colorway.temoa-3702.chatgpt.site/produkt/

Image edits used the built-in image generation tool. WebP conversion only encoded the generated pixels; no manual pixel changes. Exact source paths and prompts follow.

## core

```json
[
  {
    "name": "hero",
    "status": "edited",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/hero.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/hero.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-73a90596-ded6-421f-9458-769f9b1fbc76.png",
    "prompts": [
      "Precise-object-edit. Image1 is the source HERO photograph. Make a very narrow correction to ONLY the printed NFC target on the LEFT blue NordVPN card and RIGHT coral PrepMyMeal card. The CENTER HOLY yellow card is the exact canonical reference: PRESERVE CENTER CARD COMPLETELY UNCHANGED, including its existing tap target. Preserve photograph composition, card outlines/proportions, camera, branding, all headlines/artwork, material and light. On both side cards, shift target slightly UP and scale to the same physical size and normalized position as center HOLY, accounting for the existing perspective: card is portrait3:5. On the unprojected card plane, outer rounded-square target WIDTH44% of card WIDTH, physical square (HEIGHT26.4% of card HEIGHT), target CENTER at x50% and y78% down from top; thus bottom gap about8.8% of card height. This is a visual alignment brief not printed text. All three must visibly have equal target size and equal bottom margin relative to their respective card boundaries. Keep the layered printed bevel contour style of the center card, adapt colors only blue/white on NordVPN and coral/white on PrepMyMeal. Exact text 'Handy hier halten' ABOVE the hand-holding-phone glyph on each target, as center HOLY. Whole hand icon must stay inside the outer target boundary. No new content, no QR. Printed optical-depth only, physical card remains flat. Correct old too-low positions, reconstruct underlying original art where old lower target area vacated. DO NOT change the central HOLY card, brand logos, headlines, meal/globe art, or any other part. Landscape1536x1024."
    ],
    "check": "Side targets raised and adjusted toward center HOLY normalization. Top text preserved on all. Center HOLY visually preserved. Nominal geometry judged visually, no exact physical dimensions claimed.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Built-in image_gen edits, visually inspected; WebP encoding only, quality88",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 239548
  },
  {
    "name": "arrival",
    "status": "pass",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/arrival.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/arrival.webp",
    "check": "Single HOLY 3:5-style portrait card. Target centered in lower half, approximately canonical relative scale and bottom breathing room under perspective. Text above hand-phone glyph. Retained to avoid regeneration drift.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Existing image visually inspected, unchanged.",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 123958
  },
  {
    "name": "connect",
    "status": "pass",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/connect.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/connect.webp",
    "check": "Single HOLY portrait card under strong oblique perspective. Target lower-center at approximately canonical size and location, text above hand-phone. Signal arcs and phone preserved.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Existing image visually inspected, unchanged.",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 168352
  },
  {
    "name": "experience",
    "status": "pass",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/experience.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/experience.webp",
    "check": "HOLY card target lower-center, approximately canonical size and margins with readable instruction above glyph. Portrait shape and AR composition already consistent; retained.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Existing image visually inspected, unchanged.",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 241668
  },
  {
    "name": "paper",
    "status": "pass",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/paper.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/paper.webp",
    "check": "Extreme edge-on NordVPN paper: target geometry not legible due to intended foreshortening. Uniform flat substrate, no visible inconsistent target. Not edited.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Existing image visually inspected, unchanged.",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 24282
  },
  {
    "name": "finish",
    "status": "edited",
    "input": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/finish.webp",
    "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/finish.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-e7254c4e-4ba0-4be8-ad5c-bea6cef5fc17.png",
    "prompts": [
      "Precise-object-edit. Image1 is a premium macro photograph of a coral PrepMyMeal mailing. Change ONLY its printed NFC target to match the canonical yellow CENTER HOLY card target in reference image2. Keep ALL other elements identical: card brand/headline/food artwork, thin flat paper, white tabletop, fingertip, macro perspective/light/crop. Replace old target which has text BELOW icon with canonical arrangement: exact 'Handy hier halten' ABOVE the clear hand-holding-phone line icon, all within three nested rounded-square printed optical-depth contours. Use pale coral/white ink to suit PrepMyMeal. Standard geometry on the actual unprojected portrait3:5 card plane: target CENTER x50% cardwidth and y78% down from cardTOP; outer target WIDTH44% of cardWIDTH, HEIGHT26.4% of cardHEIGHT (a physical square), bottommargin8.8% cardHEIGHT. Account carefully for perspective in this close-up. Make target more compact than old target, positioned a little UP away from bottomedge with visibly matching normalized bottom margin to the center HOLY target in image2. Target must be same size relative to card as center HOLY. Text at TOP inside square, icon underneath, fully contained. Preserve underlying coral design, no filledwhiteblock, no raisedpad/embossing. Only printed opticaldepth on flat paper. Erase oldtarget cleanly and reconstruct the coral print behind it. No changes to card itself or other photograph areas. No QR, no new claims, no labels. Output landscape1536x1024.",
      "Precise-object-edit. Preserve image1 absolutely except the printed NFC target. The text arrangement is now correct. One geometric correction: SCALE THE ENTIRE TARGET (outer nested contours, text and hand-phone icon as a single unit) DOWN to 82% of its CURRENT WIDTH AND HEIGHT. Then MOVE this scaled complete target UP along the card plane slightly, by about one quarter of its current height. Keep it horizontally centered on the physical card. This must create substantially more breathing room between bottomedge of target and bottomedge of paper, approximately one third of the target's physical height. Do not change its perspective angle. Fill the vacated old target area with seamless matching coral printed texture. Keep all text 'Handy hier halten' ABOVE icon. The target has three printed concentric contour rounded squares, remains FLAT ink with no raised pad. No other change: preserve photograph cardcorners, PrepMyMeal branding and all food imagery, fingertip, tabletop, focus and lighting. Landscape1536x1024."
    ],
    "check": "Original oversized near-edge target corrected to smaller centered target farther from bottom edge. Instruction moved above hand-phone glyph. One follow-up needed because first generation corrected text but scarcely reduced geometry. Final approximate canonical geometry verified visually in perspective.",
    "canonical": "v7/hero.webp center HOLY card",
    "nominalCardAspect": "3:5 portrait",
    "nominalTarget": {
      "centerX": 0.5,
      "centerY": 0.78,
      "widthOfCard": 0.44,
      "heightOfCard": 0.264,
      "bottomMargin": 0.088
    },
    "validationMethod": "Visual comparison accounting for perspective; approximate illustration consistency, not pixel-perfect fabrication geometry.",
    "method": "Built-in image_gen edits, visually inspected; WebP encoding only, quality88",
    "dimensions": [
      1536,
      1024
    ],
    "bytes": 172262
  }
]
```

## brand-a

```json
[
  {
    "name": "holy",
    "status": "pass",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/holy.webp",
    "evidence": "Visual audit against center HOLY hero: portrait flat straight-corner mailer; target centered in lower region, instruction above handphoneglyph. Approximately44-46% cardwidth; center around78% cardheight. Existing asset retained.",
    "prompts": []
  },
  {
    "name": "nordvpn",
    "status": "edited",
    "reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/nordvpn.webp",
    "canonical_reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/hero.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-5e52fc8e-7f56-4117-83ae-72ca524560d5.png",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/nordvpn.webp",
    "prompts": [
      "Use case: precise-object-edit. Fix ONLY the printed mailing card's standardized factory proportions and tap area in image1. Keep ALL branding, printedcampaignartwork, productdesign, iphoneand3Dscene, lighting, framing, background unchanged. CANONICAL PRINT GEOMETRY measured in the card's own plane: card is portrait width:height3:5, straight squarecutcorners and thinflatpaper. Tap target outer rounded-square width44% of CARDwidth, height26.4% of CARDheight. Outer target CENTER at exactly x50% and y78% down from TOP (targettop64.8%,targetbottom91.2%, bottommargin8.8%). Thus samephysical square and fixedfactorylocation acrossbrands. Text 'Handy hier halten' ABOVE the handholdingphone glyph inside the square. Layered printed bevelcontours suggestdepth butpaperflat. These proportions binding; don't infer screen-space values fromtiltedperspective. Image2 CENTER HOLYmailing establishes visualmaster; use its targetlayout, notsidecards. Existing target too low and too narrow. Move targetUP so center78%cardheight and enlarge to44%cardwidth. Move 'Handy hier halten' frombelowglyph toABOVEglyph. Keepbrandblue. Onlyoneprintedmailer andonephone asimage1, neveraddthreecards fromreference. Taparea is PRINTEDoptical3D, noactualbulge, no whitebackplate, no QRfront. Do NOTaddmeasurements orconstructionguides. Polished1536x1024finalphoto.",
      "Use case: precise-object-edit. The target square in this generatedimage is now TOO BIG. Keep entireimage pixelcomposition, all card/phone/text/productartwork unchanged EXCEPT scale and position ofthe entireprintedtap assembly. Required final1536x1024coordinates: center pixel(544,746), OUTERprinted border approx250pixels wide x230pixels tall. These include ALL outerbevelcontours. Shrinkexistingcomplete tapassembly includingglyphtextcontours around18% and place atthiscenter. Printedart underneath shouldremainnatural. Text 'Handy hier halten' stays ABOVEhandholdingphoneglyph. DoNOTshrinkcard orphone, donotchangecardedges orformat, ONLYscaleandpositiontapassembly. No measurementsprinted. Factoryspec44%cardwidthtarget, centered78%downcardheight. Keeporiginalwhitebackground."
    ],
    "evidence": "Target moved upward; instruction now above glyph. Estimated outerwidth42-44% cardwidth, centeraround77-78%cardheight. Original brand/phone scene retained.",
    "method": "built-in image_gen precise-object-edit; WebP encoding only",
    "limitation": "Visual specification in perspective illustration, not exact production dieline geometry.",
    "size": [
      1536,
      1024
    ],
    "bytes": 160428
  },
  {
    "name": "prepmymeal",
    "status": "edited",
    "reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/prepmymeal.webp",
    "canonical_reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/hero.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-90e7cdc9-7051-4eb1-bfd4-283562147d25.png",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/prepmymeal.webp",
    "prompts": [
      "Use case: precise-object-edit. Fix ONLY the printed mailing card's standardized factory proportions and tap area in image1. Keep ALL branding, printedcampaignartwork, productdesign, iphoneand3Dscene, lighting, framing, background unchanged. CANONICAL PRINT GEOMETRY measured in the card's own plane: card is portrait width:height3:5, straight squarecutcorners and thinflatpaper. Tap target outer rounded-square width44% of CARDwidth, height26.4% of CARDheight. Outer target CENTER at exactly x50% and y78% down from TOP (targettop64.8%,targetbottom91.2%, bottommargin8.8%). Thus samephysical square and fixedfactorylocation acrossbrands. Text 'Handy hier halten' ABOVE the handholdingphone glyph inside the square. Layered printed bevelcontours suggestdepth butpaperflat. These proportions binding; don't infer screen-space values fromtiltedperspective. Image2 CENTER HOLYmailing establishes visualmaster; use its targetlayout, notsidecards. Existing target too low; moveUP tocenter78%cardheight and makeouterwidth44%cardwidth. Move 'Handy hier halten' frombelowglyph toABOVEglyph. Keepcoral. Onlyoneprintedmailer andonephone asimage1, neveraddthreecards fromreference. Taparea is PRINTEDoptical3D, noactualbulge, no whitebackplate, no QRfront. Do NOTaddmeasurements orconstructionguides. Polished1536x1024finalphoto.",
      "Use case: precise-object-edit. The target square in this generatedimage is now TOO BIG. Keep entireimage pixelcomposition, all card/phone/text/productartwork unchanged EXCEPT scale and position ofthe entireprintedtap assembly. Required final1536x1024coordinates: center pixel(474,758), OUTERprinted border approx225pixels wide x235pixels tall. These include ALL outerbevelcontours. Shrinkexistingcomplete tapassembly includingglyphtextcontours around18% and place atthiscenter. Printedart underneath shouldremainnatural. Text 'Handy hier halten' stays ABOVEhandholdingphoneglyph. DoNOTshrinkcard orphone, donotchangecardedges orformat, ONLYscaleandpositiontapassembly. No measurementsprinted. Factoryspec44%cardwidthtarget, centered78%downcardheight. Keeporiginalwhitebackground."
    ],
    "evidence": "Target moved upward; instruction now above glyph. Estimated outerwidth42-44% cardwidth, centeraround78%cardheight. Coralbrand/food/phone retained.",
    "method": "built-in image_gen precise-object-edit; WebP encoding only",
    "limitation": "Visual specification in perspective illustration, not exact production dieline geometry.",
    "size": [
      1536,
      1024
    ],
    "bytes": 219480
  },
  {
    "name": "revolut",
    "status": "edited",
    "reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/revolut.webp",
    "canonical_reference": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/hero.webp",
    "source": "/workspace/scratch/314596fa5f8b/generated_images/exec-f14d211c-db56-4e76-9550-ab722009d715.png",
    "output": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/revolut.webp",
    "prompts": [
      "Use case: precise-object-edit. Fix ONLY the printed mailing card's standardized factory proportions and tap area in image1. Keep ALL branding, printedcampaignartwork, productdesign, iphoneand3Dscene, lighting, framing, background unchanged. CANONICAL PRINT GEOMETRY measured in the card's own plane: card is portrait width:height3:5, straight squarecutcorners and thinflatpaper. Tap target outer rounded-square width44% of CARDwidth, height26.4% of CARDheight. Outer target CENTER at exactly x50% and y78% down from TOP (targettop64.8%,targetbottom91.2%, bottommargin8.8%). Thus samephysical square and fixedfactorylocation acrossbrands. Text 'Handy hier halten' ABOVE the handholdingphone glyph inside the square. Layered printed bevelcontours suggestdepth butpaperflat. These proportions binding; don't infer screen-space values fromtiltedperspective. Image2 CENTER HOLYmailing establishes visualmaster; use its targetlayout, notsidecards. Existing mailer looks too narrow. Match3:5card shape and makeoutertap44%cardwidth centeredx50%,y78%; retain instructionaboveglyph. Keeppurple/silver. Onlyoneprintedmailer andonephone asimage1, neveraddthreecards fromreference. Taparea is PRINTEDoptical3D, noactualbulge, no whitebackplate, no QRfront. Do NOTaddmeasurements orconstructionguides. Polished1536x1024finalphoto.",
      "Use case: precise-object-edit. The target square in this generatedimage is now TOO BIG. Keep entireimage pixelcomposition, all card/phone/text/productartwork unchanged EXCEPT scale and position ofthe entireprintedtap assembly. Required final1536x1024coordinates: center pixel(465,734), OUTERprinted border approx217pixels wide x229pixels tall. These include ALL outerbevelcontours. Shrinkexistingcomplete tapassembly includingglyphtextcontours around18% and place atthiscenter. Printedart underneath shouldremainnatural. Text 'Handy hier halten' stays ABOVEhandholdingphoneglyph. DoNOTshrinkcard orphone, donotchangecardedges orformat, ONLYscaleandpositiontapassembly. No measurementsprinted. Factoryspec44%cardwidthtarget, centered78%downcardheight. Keeporiginalwhitebackground.",
      "Use case: precise-object-edit. Change ONLY printedtapbadge on left Revolutmailer. Enlarge its complete assembly (allthreepurpleoutercontours+handphoneicon+instruction) by exactly14% relative to currentimage, keepingtheentirecard/phone/3Dartwork unchanged. Move badge center8pixelsleft and16pixelsup on1536x1024canvas. Finalouterbadge bounds approximately x356..574,y620..849 (217wide229high). Instructionaboveglyph. Thismodest14%enlargement corrects undersizing. Do NOT changecardedges orphoneorcomposition. No measurementsprinted."
    ],
    "evidence": "Outer target resized and raised; instruction above glyph. Estimated outerwidth44%cardwidth, centeraround78-79%cardheight. Purple/silver brand and phone retained.",
    "method": "built-in image_gen precise-object-edit; WebP encoding only",
    "limitation": "Visual specification in perspective illustration, not exact production dieline geometry.",
    "size": [
      1536,
      1024
    ],
    "bytes": 83580
  }
]
```

## brand-b

```json
{
  "method": "built-in image_gen, inspected inputs and outputs; Pillow only format encoding and alpha/full-decode validation",
  "reference": "public/images/v7/hero.webp center HOLY card",
  "requestedGeometry": {
    "cardWidthHeight": "3:5",
    "tapCenter": [
      0.5,
      0.78
    ],
    "tapSize": [
      0.44,
      0.264
    ],
    "bottomClearance": 0.088
  },
  "audit": {
    "temoa": {
      "status": "edited",
      "before": "target too low, too small",
      "after": "target moved upward, enlarged; portrait card unchanged; text above glyph; Temoa and SKOTTI example preserved",
      "note": "Perspective visual check; output approximate, not fabrication-exact coordinates"
    },
    "aoste": {
      "status": "edited",
      "before": "target high relative to reference",
      "after": "target lowered; portrait card with square corners; product and phone preserved",
      "note": "Perspective visual check; target slightly larger than specified"
    },
    "116media": {
      "status": "edited",
      "before": "target low relative to reference",
      "after": "target moved upward, text above glyph; thin squarecornercard preserved",
      "note": "Perspective visual check; target slightly larger than specified"
    },
    "truenature": {
      "status": "edited",
      "before": "target verylow, copy below glyph",
      "after": "card widened after initial narrow result; target raised and text moved aboveglyph; green product retained. Shared finalimagewithcomparison.",
      "note": "Perspective visual approximation, not productiontemplate"
    }
  },
  "assets": [
    {
      "name": "temoa",
      "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/temoa.webp",
      "prompt": "Use case: precise-object-edit. Image1 edit target. Image2 geometric reference only. Change ONLY the printed card proportions and the printed tap target position/scale. Card is thin flat rectangular paper with square corners, physical width:height EXACTLY 3:5. Use card-local coordinates before perspective: tap target OUTERMOST rounded-square border extends x=28%..72% of card width and y=64.8%..91.2% of card height, center x50%, y78%. Thus target is a physical square, width44% cardwidth, height26.4% cardheight, bottomclearance8.8%. It is printed illusion of layered embossed depth, not real raised hardware. Inside target text 'Handy hier halten' ABOVE the hand-holding-phone outline glyph with NFC waves. Match the geometry of the center yellow HOLY card in reference image2. Preserve the existing card's branding colors, logo, headline, product image, phone and 3D experience, shadows, studio white background, image dimensions1536x1024. Reflow nearby printed product art minimally to keep new target clear; do not add any new copy, claims, symbols, QR or cards. The target's position is factory fixed and cannot vary by brand. Keep Temoa logo and SKOTTI grill/orange bag, seven listing photos and 'Erstgespräch buchen' phone CTA unchanged. Current target is too low and too small: move it upward and enlarge to exact geometry.",
      "generated": "/workspace/scratch/314596fa5f8b/generated_images/exec-3640c236-e007-4900-9e37-0b4baa6627f0.png",
      "final": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/temoa.webp",
      "additionalPrompts": [
        "Precisely edit only the tap target placement in this existing image. The rectangular Temoa card goes from about y20 to y966. Move its ENTIRE lime rounded-square target UP by 80 pixels, so the target center is at image (535,735), and its outer bounding rectangle is approximately x411..659, y611..859. Remove former target cleanly, preserving white card paper. Small grill overlap behind upper target is fine; minimally shorten grill drawing if needed. Do NOT change the card dimensions, copy, Temoa logo, SKOTTI product, phone, layout or lighting. Target text 'Handy hier halten' stays above the handphone glyph. Target is printed flat, with depth illusion. Output1536x1024."
      ],
      "validation": {
        "size": [
          1536,
          1024
        ],
        "mode": "RGB",
        "bytes": 106670
      }
    },
    {
      "name": "aoste",
      "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/aoste.webp",
      "prompt": "Use case: precise-object-edit. Image1 edit target. Image2 geometric reference only. Change ONLY the printed card proportions and the printed tap target position/scale. Card is thin flat rectangular paper with square corners, physical width:height EXACTLY 3:5. Use card-local coordinates before perspective: tap target OUTERMOST rounded-square border extends x=28%..72% of card width and y=64.8%..91.2% of card height, center x50%, y78%. Thus target is a physical square, width44% cardwidth, height26.4% cardheight, bottomclearance8.8%. It is printed illusion of layered embossed depth, not real raised hardware. Inside target text 'Handy hier halten' ABOVE the hand-holding-phone outline glyph with NFC waves. Match the geometry of the center yellow HOLY card in reference image2. Preserve the existing card's branding colors, logo, headline, product image, phone and 3D experience, shadows, studio white background, image dimensions1536x1024. Reflow nearby printed product art minimally to keep new target clear; do not add any new copy, claims, symbols, QR or cards. The target's position is factory fixed and cannot vary by brand. Keep Aoste Stickado pack, headline and phone AR snack unchanged. Current target is too high: move it downward to exact geometry.",
      "generated": "/workspace/scratch/314596fa5f8b/generated_images/exec-0a2f71e0-6ff6-4261-90af-6b86eb34ca71.png",
      "final": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/aoste.webp",
      "additionalPrompts": [],
      "validation": {
        "size": [
          1536,
          1024
        ],
        "mode": "RGB",
        "bytes": 275696
      }
    },
    {
      "name": "116media",
      "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v7/116media.webp",
      "prompt": "Use case: precise-object-edit. Image1 edit target. Image2 geometric reference only. Change ONLY the printed card proportions and the printed tap target position/scale. Card is thin flat rectangular paper with square corners, physical width:height EXACTLY 3:5. Use card-local coordinates before perspective: tap target OUTERMOST rounded-square border extends x=28%..72% of card width and y=64.8%..91.2% of card height, center x50%, y78%. Thus target is a physical square, width44% cardwidth, height26.4% cardheight, bottomclearance8.8%. It is printed illusion of layered embossed depth, not real raised hardware. Inside target text 'Handy hier halten' ABOVE the hand-holding-phone outline glyph with NFC waves. Match the geometry of the center yellow HOLY card in reference image2. Preserve the existing card's branding colors, logo, headline, product image, phone and 3D experience, shadows, studio white background, image dimensions1536x1024. Reflow nearby printed product art minimally to keep new target clear; do not add any new copy, claims, symbols, QR or cards. The target's position is factory fixed and cannot vary by brand. Keep 116 MEDIA red branding, exploded motor, hand and envelope, phone project CTA unchanged. Current target is too low: move it upward to exact geometry.",
      "generated": "/workspace/scratch/314596fa5f8b/generated_images/exec-46a32609-61bc-46cf-9f1d-3e8bcf64055d.png",
      "final": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/116media.webp",
      "additionalPrompts": [],
      "validation": {
        "size": [
          1536,
          1024
        ],
        "mode": "RGB",
        "bytes": 191232
      }
    },
    {
      "name": "truenature",
      "path": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v8/truenature.webp",
      "prompt": "Use case: precise-object-edit. Image1 edit target. Image2 geometric reference only. Change ONLY the printed card proportions and the printed tap target position/scale. Card is thin flat rectangular paper with square corners, physical width:height EXACTLY 3:5. Use card-local coordinates before perspective: tap target OUTERMOST rounded-square border extends x=28%..72% of card width and y=64.8%..91.2% of card height, center x50%, y78%. Thus target is a physical square, width44% cardwidth, height26.4% cardheight, bottomclearance8.8%. It is printed illusion of layered embossed depth, not real raised hardware. Inside target text 'Handy hier halten' ABOVE the hand-holding-phone outline glyph with NFC waves. Match the geometry of the center yellow HOLY card in reference image2. Preserve the existing card's branding colors, logo, headline, product image, phone and 3D experience, shadows, studio white background, image dimensions1536x1024. Reflow nearby printed product art minimally to keep new target clear; do not add any new copy, claims, symbols, QR or cards. The target's position is factory fixed and cannot vary by brand. Keep green TRUE NATURE APFELPEKTIN product and phone AR unchanged. Current target is too low: move it upward, enlarge to exact geometry, and put 'Handy hier halten' ABOVE the glyph (currently below). Preserve product label exactly, do not add health claims.",
      "generated": "/workspace/scratch/314596fa5f8b/generated_images/exec-6a90739e-ad99-406d-8f91-f093d4829f72.png",
      "final": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/truenature.webp",
      "additionalPrompts": [
        "Correct card shape and tap position ONLY. Existing image card is too narrow. Keep height about890px, widen its actual card surface from about425px to535px, keeping leftcard separated from phone and preserving its physical square corners, with paper-thin edge. Card local ratio exactly3wide:5high. The complete printed green rounded-square target must be centered horizontally at50% cardwidth and vertically78% cardheight, width44% cardwidth and height26.4%cardheight. Lower edge of target must be 8.8%cardheight ABOVE lower cardedge. Text 'Handy hier halten' above handphone glyph. Preserve green TrueNature label Apfelpektin, cardheadline, phone and its floatingproduct exactly; no newcopy. Target is flat printed illusion only. Output1536x1024."
      ],
      "validation": {
        "size": [
          1536,
          1024
        ],
        "mode": "RGBA",
        "bytes": 264424,
        "alpha": {
          "range": [
            0,
            254
          ],
          "transparent": 573186,
          "partial": 999678,
          "opaque": 0
        }
      }
    },
    {
      "name": "comparison",
      "generated": "/workspace/scratch/314596fa5f8b/generated_images/exec-6a90739e-ad99-406d-8f91-f093d4829f72.png",
      "final": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/comparison.webp",
      "prompt": "Use case: background-extraction plus precise-object-edit. This final True Nature card-and-iPhone scene is the edit target. Produce the SAME complete card, SAME green APFELPEKTIN product emerging in3D from SAME iPhone, same leaves, same phone screen, same proportions/perspective, same copy and glow. Remove ONLY white studio backdrop and floor to REAL RGBA TRANSPARENT background, preserve delicate soft neutral drop shadows underneath on transparent pixels, preserve translucent glow. No white tile, no white outline, no baked checkerboard. One last precise correction: move entire card's outlined tap target vertically UP by30pixels, from current center(543,762) to center(543,732), preserving target scale, text ABOVE glyph, glyph and printed layerstyle. Card itself stays flat and EXACTLYcurrentwidth,height. Preserve everything else. Keep all objects fully visible with breathing space.1536x1024.",
      "source": "/workspace/scratch/314596fa5f8b/kontaktstoff-prototype/interactive-paper/web/public/images/v9/truenature.webp",
      "validation": {
        "size": [
          1536,
          1024
        ],
        "mode": "RGBA",
        "bytes": 264424,
        "alpha": {
          "range": [
            0,
            254
          ],
          "transparent": 573186,
          "partial": 999678,
          "opaque": 0
        }
      }
    }
  ]
}
```
