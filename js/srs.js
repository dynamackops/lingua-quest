/**
 * SRS-lite mastery tracker.
 * Each vocab item gets {exposures, correct, wrong, lastSeen, mastery}.
 * Mastery is a naive 0..1 score derived from exposure + correctness —
 * a placeholder for a real SM-2/Leitner scheduler (see DESIGN.md).
 */
const SRS = (() => {

  function ensure(srsData, id) {
    if (!srsData[id]) {
      srsData[id] = { exposures: 0, correct: 0, wrong: 0, lastSeen: 0, mastery: 0 };
    }
    return srsData[id];
  }

  function recordExposure(srsData, id) {
    const rec = ensure(srsData, id);
    rec.exposures += 1;
    rec.lastSeen = Date.now();
    recompute(rec);
    return rec;
  }

  function recordAnswer(srsData, id, isCorrect) {
    const rec = ensure(srsData, id);
    rec.exposures += 1;
    rec.lastSeen = Date.now();
    if (isCorrect) rec.correct += 1; else rec.wrong += 1;
    recompute(rec);
    return rec;
  }

  function recompute(rec) {
    // More exposures + higher correct ratio -> higher mastery. Wrong answers pull it down harder.
    const attempts = rec.correct + rec.wrong;
    const accuracy = attempts > 0 ? rec.correct / attempts : 0;
    const exposureFactor = Math.min(1, rec.exposures / 6);
    let mastery = attempts > 0
      ? (accuracy * 0.7 + exposureFactor * 0.3)
      : exposureFactor * 0.35; // pure exposure with no test yet = partial credit
    rec.mastery = Math.max(0, Math.min(1, mastery));
  }

  function isKnown(srsData, id, threshold = 0.5) {
    const rec = srsData[id];
    return !!rec && rec.mastery >= threshold;
  }

  function getMastery(srsData, id) {
    return srsData[id] ? srsData[id].mastery : 0;
  }

  // Words due for review, oldest lastSeen first, weighted toward low mastery (error-pattern focus).
  function dueForReview(srsData, allIds, limit = 5) {
    const scored = allIds.map(id => {
      const rec = srsData[id];
      if (!rec) return { id, score: 0 };
      const staleness = (Date.now() - rec.lastSeen) / (1000 * 60 * 60); // hours
      const score = staleness * (1 - rec.mastery + 0.1);
      return { id, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(s => s.id);
  }

  /**
   * Subtitle Fade tier, driven by mastery data rather than raw playtime.
   * knownCount = vocab items at/above mastery threshold.
   * avgMastery = mean mastery across all *exposed* items (signal of retention quality, not just guessing volume).
   */
  function computeTier(srsData, allVocabIds) {
    const exposedIds = allVocabIds.filter(id => srsData[id] && srsData[id].exposures > 0);
    const knownCount = exposedIds.filter(id => isKnown(srsData, id)).length;
    const avgMastery = exposedIds.length
      ? exposedIds.reduce((sum, id) => sum + srsData[id].mastery, 0) / exposedIds.length
      : 0;

    if (knownCount >= 45 && avgMastery >= 0.7) return 4;
    if (knownCount >= 30 && avgMastery >= 0.6) return 3;
    if (knownCount >= 14 && avgMastery >= 0.45) return 2;
    return 1;
  }

  return { ensure, recordExposure, recordAnswer, isKnown, getMastery, dueForReview, computeTier };
})();
