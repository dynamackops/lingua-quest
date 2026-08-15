/**
 * Per-language save slots. Each language gets its own isolated save —
 * character, position, XP, quest state, and SRS mastery data never cross over.
 */
const Save = (() => {
  const PREFIX = 'linguaquest_';

  function key(langCode) {
    return PREFIX + langCode;
  }

  function defaultState(langCode) {
    return {
      language: langCode,
      character: { name: '', appearance: 'a', origin: 'food' },
      createdAt: Date.now(),
      xp: 0,
      level: 1,
      position: null, // filled in from world spawn on first load
      srs: {},         // vocabId -> {exposures, correct, wrong, lastSeen, mastery}
      quests: {},       // questId -> { started: bool, complete: bool, stepsDone: [bool,...] }
      seenNpcs: {},      // npcId -> last completed node id (for resuming dialogue after 'end')
      hints: { charges: 3, lastRefill: Date.now() },
      streak: { count: 0, lastPlayed: null },
      tierOverride: null // for manual testing/QA; null = computed from SRS
    };
  }

  function load(langCode) {
    const raw = localStorage.getItem(key(langCode));
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      // merge with defaults in case of schema growth
      return Object.assign(defaultState(langCode), parsed);
    } catch (e) {
      console.warn('Save corrupted, starting fresh for', langCode, e);
      return null;
    }
  }

  function save(langCode, state) {
    localStorage.setItem(key(langCode), JSON.stringify(state));
  }

  function hasSave(langCode) {
    return !!localStorage.getItem(key(langCode));
  }

  function clear(langCode) {
    localStorage.removeItem(key(langCode));
  }

  function updateStreak(state) {
    const today = new Date().toDateString();
    const last = state.streak.lastPlayed;
    if (last === today) return;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    state.streak.count = (last === yesterday) ? state.streak.count + 1 : 1;
    state.streak.lastPlayed = today;
  }

  return { defaultState, load, save, hasSave, clear, updateStreak };
})();
