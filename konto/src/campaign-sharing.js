export function campaignReviewSource(c){return c.meta.designId&&!c.meta.builder?{kind:'designs',id:c.meta.designId}:{kind:'campaigns',id:c.id};}
// Campaign proofs take precedence. Imported campaigns still share the customer
// link belonging to their explicitly linked design, even after opening the builder.
export function campaignReview(c,reviews){return reviews.find(r=>r.sourceKind==='campaigns'&&r.sourceId===c.id)||reviews.find(r=>r.sourceKind==='designs'&&r.sourceId===c.meta.designId)||null;}
