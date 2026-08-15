/**
 * Free placeholder TTS via the browser's Web Speech API.
 * NOTE: speechSynthesis quality (especially for Japanese, in Phase 2) is rough.
 * Swap this module for a proper multilingual TTS API later without touching callers —
 * everything else just calls TTS.speak(text, langCode).
 */
const TTS = (() => {
  let voicesCache = [];
  let enabled = true;

  if ('speechSynthesis' in window) {
    const loadVoices = () => { voicesCache = speechSynthesis.getVoices(); };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
  } else {
    enabled = false;
  }

  function pickVoice(bcp47) {
    if (!voicesCache.length) return null;
    return voicesCache.find(v => v.lang === bcp47)
      || voicesCache.find(v => v.lang.startsWith(bcp47.split('-')[0]))
      || null;
  }

  function speak(text, bcp47) {
    if (!enabled || !text) return;
    try {
      speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = bcp47;
      const voice = pickVoice(bcp47);
      if (voice) utter.voice = voice;
      utter.rate = 0.95;
      speechSynthesis.speak(utter);
    } catch (e) {
      console.warn('TTS failed', e);
    }
  }

  function stop() {
    if (enabled) speechSynthesis.cancel();
  }

  return { speak, stop, get enabled() { return enabled; } };
})();
