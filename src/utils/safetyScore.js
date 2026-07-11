/**
 * Produces a heuristic 0-100 "safety score" from whatever normalized fields
 * a product/chemical/drug object has available. This is intentionally
 * transparent and simple (not a medical claim) — it exists to give users a
 * quick, explainable signal, with the underlying source data always shown
 * alongside it so they can judge for themselves.
 */
export function computeSafetyScore(item) {
  let score = 80; // optimistic baseline
  const notes = [];

  if (item.category === 'food') {
    const additiveCount = item.additives?.length || 0;
    score -= Math.min(additiveCount * 4, 40);
    if (additiveCount > 0) notes.push(`${additiveCount} additive(s) detected`);

    if (item.novaGroup >= 4) {
      score -= 15;
      notes.push('Ultra-processed (NOVA group 4)');
    }
    if (item.nutriScore) {
      const nutriPenalty = { a: 0, b: 5, c: 10, d: 18, e: 25 };
      score -= nutriPenalty[item.nutriScore] ?? 0;
    }
    if (item.allergens?.length) notes.push(`${item.allergens.length} allergen(s) listed`);
  }

  if (item.category === 'medicine') {
    const warningCount = item.warnings?.length || 0;
    const sideEffectCount = item.sideEffects?.length || 0;
    score -= Math.min(warningCount * 6, 30);
    score -= Math.min(sideEffectCount * 3, 20);
    if (warningCount > 0) notes.push('Contains labeled warnings');
  }

  if (item.category === 'chemical') {
    const hazardCount = item.hazards?.length || 0;
    const toxicityCount = item.toxicity?.length || 0;
    score -= Math.min(hazardCount * 8, 35);
    score -= Math.min(toxicityCount * 5, 25);
    if (hazardCount > 0) notes.push('GHS hazard statements present');
  }

  score = Math.max(5, Math.min(100, Math.round(score)));

  let level = 'high';
  if (score < 40) level = 'low';
  else if (score < 70) level = 'moderate';

  return { score, level, notes };
}

export function safetyBadgeVariant(level) {
  switch (level) {
    case 'high':
      return 'success';
    case 'moderate':
      return 'warning';
    case 'low':
      return 'danger';
    default:
      return 'secondary';
  }
}
