/**
 * Dialogue tree runner + the Subtitle Fade system (the core pedagogical mechanic).
 *
 * Tier 1: full target text + full English subtitle, always visible.
 * Tier 2: target text only; known words are tap-for-gloss, new words are highlighted.
 * Tier 3: no subtitle by default; hold H to reveal for ~2s (costs a hint charge).
 * Tier 4: no subtitle, no hints. Comprehension is proven by picking the right option.
 *
 * Player response is rendered through renderOptions() as its own step so a future
 * "speak your answer" input mode (Phase 3, speech recognition) can replace the
 * button list without touching the tree-walking logic below.
 */
const DialogueEngine = (() => {
  let vocabIndex = null;   // id -> vocab item
  let els = {};
  let current = null;      // { npcId, tree, node, gameState, callbacks }
  let hintTimer = null;
  let hintCooldownUntil = 0;
  let glossTimer = null;

  function init(vocabItems) {
    vocabIndex = {};
    for (const item of vocabItems) vocabIndex[item.id] = item;

    els = {
      overlay: document.getElementById('dialogue-overlay'),
      speaker: document.getElementById('dialogue-speaker'),
      line: document.getElementById('dialogue-line'),
      sub: document.getElementById('dialogue-sub'),
      options: document.getElementById('dialogue-options'),
      hintCharges: document.getElementById('hint-charges'),
    };

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'h') onHintKeyDown();
    });
    window.addEventListener('keyup', (e) => {
      if (e.key.toLowerCase() === 'h') onHintKeyUp();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && current && !current.activityLocked) {
        const cb = current.callbacks;
        close();
        if (cb.onEnd) cb.onEnd();
      }
    });
  }

  function open(npcId, npcTree, npcLabel, gameState, callbacks) {
    const startNode = gameState.seenNpcs[npcId] && npcTree.nodes[gameState.seenNpcs[npcId]]
      ? gameState.seenNpcs[npcId]
      : npcTree.start;

    current = { npcId, tree: npcTree, nodeId: startNode, gameState, callbacks };
    els.overlay.classList.remove('hidden');
    els.speaker.textContent = npcTree.name || npcLabel;
    renderNode();
  }

  function close() {
    els.overlay.classList.add('hidden');
    clearHintUI();
    current = null;
  }

  function renderNode() {
    if (!current) return;
    const node = current.tree.nodes[current.nodeId];
    const tier = current.gameState.tier;

    // Expose + reward vocab the moment the line is spoken, before rendering (so
    // "known" highlighting reflects mastery going INTO this line, not after).
    const preMastery = {};
    for (const vid of (node.vocab || [])) {
      preMastery[vid] = SRS.isKnown(current.gameState.srs, vid);
      SRS.recordExposure(current.gameState.srs, vid);
    }

    TTS.speak(node.es, current.gameState.ttsLang || 'es-ES');

    els.line.innerHTML = tokenize(node.es, node.vocab || [], preMastery, tier);
    els.line.querySelectorAll('.word.known, .word.new').forEach(span => {
      span.addEventListener('click', () => showGloss(span.dataset.vocab));
    });

    renderSubtitle(node, tier);
    renderOptions(node, tier);
    updateHintChargesUI(tier);

    if (node.quest && current.callbacks.onQuestEvent) current.callbacks.onQuestEvent('start', node.quest);
    if (node.questComplete && current.callbacks.onQuestEvent) current.callbacks.onQuestEvent('complete', node.questComplete);

    current.gameState.seenNpcs[current.npcId] = current.nodeId;

    if (node.activity) {
      current.activityLocked = true;
      els.options.innerHTML = '';
      const btn = document.createElement('button');
      btn.textContent = 'Continuar';
      btn.className = 'dialogue-end-btn';
      els.options.appendChild(btn);
      btn.addEventListener('click', () => {
        current.callbacks.onActivity(node.activity, () => {
          current.activityLocked = false;
          current.nodeId = node.activityNext;
          renderNode();
        });
      }, { once: true });
      return;
    }

    if (node.end || (node.options || []).length === 0) {
      const btn = document.createElement('button');
      btn.textContent = 'End conversation';
      btn.className = 'dialogue-end-btn';
      els.options.innerHTML = '';
      els.options.appendChild(btn);
      btn.addEventListener('click', () => {
        if (current.callbacks.onEnd) current.callbacks.onEnd();
        close();
      });
    }
  }

  function tokenize(text, vocabIds, preMastery, tier) {
    // Wrap known vocab phrases so they can be tapped (tier 2) or just styled.
    const matches = vocabIds
      .map(id => vocabIndex[id])
      .filter(Boolean)
      .sort((a, b) => b.es.length - a.es.length);

    let result = escapeHtml(text);
    for (const item of matches) {
      const phrase = escapeHtml(item.es).replace(/^(el|la|los|las)\s+/i, ''); // match bare noun too
      const pattern = new RegExp('(' + escapeRegex(phrase) + ')', 'i');
      if (pattern.test(result)) {
        const cls = preMastery[item.id] ? 'known' : 'new';
        result = result.replace(pattern, `<span class="word ${cls}" data-vocab="${item.id}">$1</span>`);
      }
    }
    return result;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function renderSubtitle(node, tier) {
    clearGlossTimer();
    if (tier === 1) {
      els.sub.textContent = node.en;
      els.sub.classList.remove('gloss-tip');
    } else if (tier === 2) {
      els.sub.textContent = 'Tap a highlighted word for its meaning.';
      els.sub.classList.remove('gloss-tip');
    } else if (tier === 3) {
      els.sub.textContent = '';
      els.sub.dataset.fullEn = node.en;
    } else {
      els.sub.textContent = '';
    }
  }

  function showGloss(vocabId) {
    const item = vocabIndex[vocabId];
    if (!item || !current) return;
    clearGlossTimer();
    els.sub.textContent = item.en;
    els.sub.classList.add('gloss-tip');
    glossTimer = setTimeout(() => {
      const node = current.tree.nodes[current.nodeId];
      renderSubtitle(node, current.gameState.tier);
    }, 2200);
  }

  function clearGlossTimer() {
    if (glossTimer) { clearTimeout(glossTimer); glossTimer = null; }
  }

  function onHintKeyDown() {
    if (!current || current.activityLocked || els.overlay.classList.contains('hidden')) return;
    const tier = current.gameState.tier;
    if (tier !== 3) return; // tier 4 has no hint fallback; tier 1-2 don't need it
    if (hintTimer) return; // already showing
    if (Date.now() < hintCooldownUntil) return;
    const hints = current.gameState.hints;
    if (hints.charges <= 0) return;

    hints.charges -= 1;
    const node = current.tree.nodes[current.nodeId];
    els.sub.textContent = node.en;
    els.sub.classList.add('gloss-tip');
    updateHintChargesUI(tier);

    hintTimer = setTimeout(() => {
      els.sub.textContent = '';
      els.sub.classList.remove('gloss-tip');
      hintTimer = null;
      hintCooldownUntil = Date.now() + 1500;
    }, 2000);
  }

  function onHintKeyUp() {
    // Hint auto-clears on its own timer; key release doesn't need to do anything extra.
  }

  function clearHintUI() {
    if (hintTimer) { clearTimeout(hintTimer); hintTimer = null; }
    clearGlossTimer();
  }

  function updateHintChargesUI(tier) {
    if (tier === 3 && current) {
      els.hintCharges.classList.remove('hidden');
      els.hintCharges.textContent = `Hint charges: ${current.gameState.hints.charges} (hold H)`;
    } else {
      els.hintCharges.classList.add('hidden');
    }
  }

  function renderOptions(node, tier) {
    els.options.innerHTML = '';
    const options = node.options || [];
    if (options.length === 0) return;

    const hasCheck = options.some(o => o.correct === true);

    for (const opt of options) {
      const btn = document.createElement('button');
      let label = opt.es;
      if (tier === 1) label += `  —  ${opt.en}`;
      btn.textContent = label;
      btn.addEventListener('click', () => choose(opt, node, hasCheck));
      els.options.appendChild(btn);
    }
  }

  function choose(opt, node, hasCheck) {
    if (hasCheck) {
      const isCorrect = opt.correct === true;
      for (const vid of (node.vocab || [])) {
        SRS.recordAnswer(current.gameState.srs, vid, isCorrect);
      }
      if (current.callbacks.onAnswer) current.callbacks.onAnswer(isCorrect);
    }
    current.nodeId = opt.next;
    renderNode();
  }

  return { init, open, close };
})();
