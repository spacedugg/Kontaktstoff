export function campaignReviewSource(c){return c.meta.designId&&!c.meta.builder?{kind:'designs',id:c.meta.designId}:{kind:'campaigns',id:c.id};}
export function campaignReview(c,reviews){const source=campaignReviewSource(c);return reviews.find(r=>r.sourceKind===source.kind&&r.sourceId===source.id)||null;}
