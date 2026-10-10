# Impulse V13

- Shared sticky header on all pages, with top offset, anchor clearance and a scrollable mobile menu for short viewports.
- Homepage order: Interaktive Postwerbung → Flaches Papier. Tiefe Wirkung. → Eine Kampagne. Alles im Blick.
- Eight original editorial sketch illustrations replace campaign imagery in the journal overview and all eight articles. Charcoal linework with lime and blue accents; 1536 × 1024 WebP assets under `web/public/images/blog-v13/`.
- Descriptive image alt text shared between each thumbnail and its article. Generation prompts are in `image-prompts.md`.

Validation: Astro static build produced 29 pages. Static link/image/ID/ARIA checks passed. DOM checks verified exact section order, all eight unique image assignments, blog search/filter and menu open/link/Escape behaviour. Sticky positioning and anchor clearance checked in CSS. Browser layout/scroll verification was unavailable because the supported control-browser tool is absent.

All edits remain within `interactive-paper/` on the existing prototype branch. No main/live branch changes.
