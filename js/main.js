/**
 * Screen flow + game state wiring. Loads per-language data files, drives the
 * SRS-based Subtitle Fade tier, and connects world/dialogue/minigames to the HUD.
 */
(() => {
  const LANGUAGES = [
    { code: 'es', name: 'Spanish', flag: '🇪🇸', ready: true },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵', ready: false },
    { code: 'it', name: 'Italian', flag: '🇮🇹', ready: false },
    { code: 'fr', name: 'French', flag: '🇫🇷', ready: false },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹', ready: false },
  ];
  const APPEARANCES = [
    { id: 'a', emoji: '🙂' }, { id: 'b', emoji: '😎' }, { id: 'c', emoji: '🧑‍🦱' },
    { id: 'd', emoji: '👧' }, { id: 'e', emoji: '🧔' }, { id: 'f', emoji: '👩‍🦳' },
  ];
  // Origin flavors which vocab theme quests foreground first; both share the same
  // world/engine in v1 (per DESIGN.md — deep single world beats shallow branching).
  const ORIGINS = [
    { id: 'food', emoji: '🍲', label: 'I love food', sub: 'Market & kitchen vocab first' },
    { id: 'travel', emoji: '🧳', label: 'I love travel', sub: 'Café & directions vocab first' },
  ];

  let selectedLanguage = null;
  let selectedAppearance = 'a';
  let selectedOrigin = 'food';
  let gameState = null;
  let langData = null; // { vocab, dialogue, quests, fillblank, world }
  let vocabById = {};
  let questById = {};

  const screens = {
    welcome: document.getElementById('screen-welcome'),
    create: document.getElementById('screen-create'),
    howto: document.getElementById('screen-howto'),
    game: document.getElementById('screen-game'),
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
  }

  // ---------- Welcome ----------
  function buildLanguageGrid() {
    const grid = document.getElementById('language-grid');
    grid.innerHTML = '';
    LANGUAGES.forEach(lang => {
      const card = document.createElement('div');
      card.className = 'card' + (lang.ready ? '' : '');
      card.style.opacity = lang.ready ? '1' : '0.55';
      card.innerHTML = `<span class="emoji">${lang.flag}</span><span class="label">${lang.name}</span>` +
        (lang.ready ? '' : '<span class="sub">Phase 2</span>');
      card.addEventListener('click', () => {
        if (!lang.ready) return;
        selectedLanguage = lang.code;
        document.getElementById('create-lang-name').textContent = lang.name;
        showScreen('create');
      });
      grid.appendChild(card);
    });
  }

  function buildCreateScreen() {
    const appGrid = document.getElementById('appearance-grid');
    appGrid.innerHTML = '';
    APPEARANCES.forEach(a => {
      const card = document.createElement('div');
      card.className = 'card' + (a.id === selectedAppearance ? ' selected' : '');
      card.innerHTML = `<span class="emoji">${a.emoji}</span>`;
      card.addEventListener('click', () => {
        selectedAppearance = a.id;
        appGrid.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      appGrid.appendChild(card);
    });

    const originGrid = document.getElementById('origin-grid');
    originGrid.innerHTML = '';
    ORIGINS.forEach(o => {
      const card = document.createElement('div');
      card.className = 'card' + (o.id === selectedOrigin ? ' selected' : '');
      card.innerHTML = `<span class="emoji">${o.emoji}</span><span class="label">${o.label}</span><span class="sub">${o.sub}</span>`;
      card.addEventListener('click', () => {
        selectedOrigin = o.id;
        originGrid.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
      });
      originGrid.appendChild(card);
    });
  }

  document.getElementById('btn-back-welcome').addEventListener('click', () => showScreen('welcome'));

  document.getElementById('btn-start-game').addEventListener('click', async () => {
    const name = document.getElementById('input-name').value.trim() || 'Viajero';
    await loadLanguageData(selectedLanguage);

    gameState = Save.load(selectedLanguage) || Save.defaultState(selectedLanguage);
    gameState.character.name = name;
    gameState.character.appearance = selectedAppearance;
    gameState.character.origin = selectedOrigin;
    gameState.ttsLang = langData.vocab.ttsLang;
    refreshHintCharges();
    Save.updateStreak(gameState);
    recomputeTier();
    Save.save(selectedLanguage, gameState);

    showScreen('howto');
  });

  document.getElementById('btn-howto-close').addEventListener('click', () => {
    showScreen('game');
    startGame();
  });
  document.getElementById('btn-howto-open').addEventListener('click', () => showScreen('howto'));

  // ---------- Data loading ----------
  async function loadLanguageData(code) {
    const [vocab, dialogue, quests, fillblank, world] = await Promise.all([
      fetch(`data/${code}/vocab.json`).then(r => r.json()),
      fetch(`data/${code}/dialogue.json`).then(r => r.json()),
      fetch(`data/${code}/quests.json`).then(r => r.json()),
      fetch(`data/${code}/fillblank.json`).then(r => r.json()),
      fetch(`data/${code}/world.json`).then(r => r.json()),
    ]);
    langData = { vocab, dialogue, quests, fillblank, world };
    vocabById = {};
    vocab.items.forEach(v => vocabById[v.id] = v);
    questById = quests.quests;
    DialogueEngine.init(vocab.items);
  }

  // ---------- Game ----------
  function startGame() {
    const canvas = document.getElementById('game-canvas');
    World.init(canvas, langData.world, {
      spawnPos: gameState.position,
      onInteract: handleInteract,
    });
    World.start();
    updateHud();
  }

  function handleInteract(nearby) {
    if (nearby.kind === 'npc') {
      openNpcDialogue(nearby.entity);
    } else {
      openVocabPopup(nearby.entity);
    }
  }

  function openNpcDialogue(npc) {
    const tree = langData.dialogue.npcs[npc.dialogueId];
    if (!tree) return;
    World.setBlocked(true);
    DialogueEngine.open(npc.id, tree, npc.label, gameState, {
      onQuestEvent: (kind, questId) => {
        if (kind === 'start') startQuest(questId);
        if (kind === 'complete') completeQuest(questId);
      },
      onAnswer: (isCorrect) => {
        addXp(isCorrect ? 8 : 2);
        postUpdate();
      },
      onEnd: () => {
        World.setBlocked(false);
        postUpdate();
      },
    });
  }

  function openVocabPopup(obj) {
    const item = vocabById[obj.vocab];
    if (!item) return;
    World.setBlocked(true);
    SRS.recordExposure(gameState.srs, item.id);
    TTS.speak(item.es, gameState.ttsLang);

    document.getElementById('vocab-icon').textContent = obj.label;
    document.getElementById('vocab-es').textContent = item.es;
    document.getElementById('vocab-en').textContent = gameState.tier === 1 ? item.en : (gameState.tier === 2 ? item.en : '');
    document.getElementById('vocab-popup').classList.remove('hidden');
    addXp(2);
    postUpdate();
  }
  document.getElementById('vocab-close').addEventListener('click', () => {
    document.getElementById('vocab-popup').classList.add('hidden');
    World.setBlocked(false);
  });

  function startQuest(questId) {
    if (!gameState.quests[questId]) gameState.quests[questId] = { started: true, complete: false };
    else gameState.quests[questId].started = true;
  }

  function completeQuest(questId) {
    if (!gameState.quests[questId]) gameState.quests[questId] = { started: true, complete: false };
    if (gameState.quests[questId].complete) return;
    gameState.quests[questId].complete = true;
    const quest = questById[questId];
    if (quest) {
      addXp(quest.xpReward || 30);
      showToast(`Quest complete: ${quest.title} (+${quest.xpReward || 30} XP)`);
    }
  }

  function addXp(amount) {
    gameState.xp += amount;
    const newLevel = Math.floor(gameState.xp / 100) + 1;
    if (newLevel > gameState.level) {
      gameState.level = newLevel;
      showToast(`¡Subiste de nivel! Level ${newLevel}`);
    }
  }

  function recomputeTier() {
    const allIds = langData ? langData.vocab.items.map(v => v.id) : [];
    gameState.tier = allIds.length ? SRS.computeTier(gameState.srs, allIds) : 1;
  }

  function refreshHintCharges() {
    const today = new Date().toDateString();
    const last = new Date(gameState.hints.lastRefill).toDateString();
    if (today !== last) {
      gameState.hints.charges = 3;
      gameState.hints.lastRefill = Date.now();
    }
  }

  function postUpdate() {
    recomputeTier();
    const pos = World.getPosition ? World.getPosition() : null;
    if (pos) gameState.position = pos;
    updateHud();
    Save.save(selectedLanguage, gameState);
  }

  function updateHud() {
    document.getElementById('hud-name').textContent = gameState.character.name;
    document.getElementById('hud-level').textContent = `Lv.${gameState.level}`;
    const xpIntoLevel = gameState.xp % 100;
    document.getElementById('hud-xpfill').style.width = xpIntoLevel + '%';
    document.getElementById('hud-tier').textContent = `Tier ${gameState.tier}`;
  }

  function showToast(msg) {
    const t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.remove('hidden');
    t.style.animation = 'none';
    void t.offsetWidth;
    t.style.animation = '';
    setTimeout(() => t.classList.add('hidden'), 2400);
  }

  // ---------- Quest log ----------
  document.getElementById('btn-quest-log').addEventListener('click', openQuestLog);
  document.getElementById('btn-quest-close').addEventListener('click', () => {
    document.getElementById('quest-overlay').classList.add('hidden');
    World.setBlocked(false);
  });
  window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'q' && screens.game.classList.contains('active')) openQuestLog();
  });

  function openQuestLog() {
    if (!gameState) return;
    World.setBlocked(true);
    const list = document.getElementById('quest-list');
    list.innerHTML = '';
    const ids = Object.keys(gameState.quests);
    if (ids.length === 0) {
      list.innerHTML = '<p style="color:var(--text-dim)">No quests yet — go talk to someone.</p>';
    }
    ids.forEach(id => {
      const q = questById[id];
      const state = gameState.quests[id];
      if (!q) return;
      const card = document.createElement('div');
      card.className = 'quest-card';
      card.innerHTML = `
        <h3>${q.title} <span style="color:var(--text-dim); font-weight:400;">(${q.titleEn})</span></h3>
        <div class="desc">${q.description}</div>
        <div class="status">${state.complete ? 'Complete' : 'In Progress'}</div>
      `;
      list.appendChild(card);
    });
    document.getElementById('quest-overlay').classList.remove('hidden');
  }

  // ---------- Minigames ----------
  document.getElementById('btn-match-game').addEventListener('click', () => {
    World.setBlocked(true);
    MatchGame.open(langData.vocab.items, gameState, (xp) => {
      addXp(xp);
      World.setBlocked(false);
      postUpdate();
    });
  });
  document.getElementById('btn-fillblank-game').addEventListener('click', () => {
    World.setBlocked(true);
    FillBlankGame.open(langData.fillblank.prompts, gameState, (xp) => {
      addXp(xp);
      World.setBlocked(false);
      postUpdate();
    });
  });

  // ---------- Exit ----------
  document.getElementById('btn-exit-game').addEventListener('click', () => {
    if (gameState) Save.save(selectedLanguage, gameState);
    World.stop();
    World.setBlocked(false);
    showScreen('welcome');
  });

  // Autosave periodically
  setInterval(() => {
    if (gameState && screens.game.classList.contains('active')) {
      const pos = World.getPosition ? World.getPosition() : null;
      if (pos) gameState.position = pos;
      Save.save(selectedLanguage, gameState);
    }
  }, 8000);

  // ---------- Init ----------
  buildLanguageGrid();
  buildCreateScreen();
  showScreen('welcome');
})();
