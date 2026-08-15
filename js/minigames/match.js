/**
 * Match minigame: click a Spanish card, then its English pair. Data-driven off
 * vocab.json — reskinning for another language only means swapping that file.
 */
const MatchGame = (() => {
  let root, gameState, vocabPool, onComplete;
  let cards = [];
  let firstPick = null;
  let matchedCount = 0;
  let totalPairs = 0;
  let locked = false;

  function open(vocabItems, state, doneCb) {
    root = document.getElementById('minigame-root');
    gameState = state;
    onComplete = doneCb;
    vocabPool = vocabItems;
    matchedCount = 0;
    firstPick = null;
    locked = false;

    const chosen = shuffle([...vocabPool]).slice(0, 6);
    totalPairs = chosen.length;

    cards = [];
    chosen.forEach(item => {
      cards.push({ id: item.id, side: 'es', text: item.es, matched: false });
      cards.push({ id: item.id, side: 'en', text: item.en, matched: false });
    });
    cards = shuffle(cards);

    document.getElementById('minigame-overlay').classList.remove('hidden');
    render();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function render() {
    root.innerHTML = `
      <div class="mg-header">
        <h2>Empareja las Palabras <span style="color:var(--text-dim); font-size:0.7em;">(Match the Words)</span></h2>
        <span class="mg-timer">${matchedCount}/${totalPairs} pairs</span>
      </div>
      <div class="mg-grid" id="mg-grid"></div>
      <div class="mg-feedback" id="mg-feedback"></div>
    `;
    const grid = document.getElementById('mg-grid');
    cards.forEach((card, idx) => {
      const el = document.createElement('div');
      el.className = 'mg-card' + (card.matched ? ' matched' : '');
      el.textContent = card.text;
      if (!card.matched) {
        el.addEventListener('click', () => pick(idx));
      }
      grid.appendChild(el);
    });
  }

  function pick(idx) {
    if (locked) return;
    const card = cards[idx];
    if (card.matched) return;
    if (card.side === 'es' && TTS.enabled) TTS.speak(card.text, gameState.ttsLang || 'es-ES');

    if (!firstPick) {
      firstPick = idx;
      highlightCard(idx, 'selected');
      return;
    }
    if (firstPick === idx) return;

    const first = cards[firstPick];
    locked = true;

    if (first.id === card.id && first.side !== card.side) {
      first.matched = true;
      card.matched = true;
      matchedCount++;
      SRS.recordAnswer(gameState.srs, card.id, true);
      feedback('¡Correcto! Nice.', false);
      setTimeout(() => { firstPick = null; locked = false; render(); checkDone(); }, 400);
    } else {
      highlightCard(idx, 'wrong');
      highlightCard(firstPick, 'wrong');
      feedback('Not quite — try again.', true);
      setTimeout(() => { firstPick = null; locked = false; render(); }, 700);
    }
  }

  function highlightCard(idx, cls) {
    const el = document.getElementById('mg-grid').children[idx];
    if (el) el.classList.add(cls);
  }

  function feedback(text, isWrong) {
    const el = document.getElementById('mg-feedback');
    el.textContent = text;
    el.style.color = isWrong ? 'var(--danger)' : 'var(--good)';
  }

  function checkDone() {
    if (matchedCount >= totalPairs) {
      const xp = totalPairs * 8;
      root.innerHTML = `
        <div class="mg-result">
          <h2>¡Excelente!</h2>
          <div class="score">+${xp} XP</div>
          <p style="color:var(--text-dim)">All ${totalPairs} pairs matched.</p>
          <div class="actions" style="justify-content:center;">
            <button class="btn primary" id="mg-close">Continue</button>
          </div>
        </div>`;
      document.getElementById('mg-close').addEventListener('click', () => {
        document.getElementById('minigame-overlay').classList.add('hidden');
        onComplete(xp);
      });
    }
  }

  return { open };
})();
