# V11: True Nature alpha cleanup

Both reported placements shared the same V10 True Nature asset, whose alpha contained blocky background haze and nonzero canvas edges. Built-in imagegen extracted the card and phone with clean transparency; a second edit restored the phone CTA removed during extraction. Exact prompts are in imagegen-prompts.json. Accepted source: exec-b7714144-906e-47df-8f9e-a943afbf8735.png, encoded here as truenature-clean.webp.

The existing V10 card-plane corners and shared NFC template were reapplied without geometry changes. card-planes.json references this clean source and writes images/v11/truenature.webp. The central asset map updates both comparison and gallery with one cache-busted path. Other images and layout remain unchanged.

Validated transparent image boundaries and open gap, plus the final composited image on white, grey and lime backgrounds. Build and both page references checked. Browser layout QA is not available in this environment. Existing public Site audience preserved; prototype branch only.
