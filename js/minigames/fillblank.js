/**
 * Fill-in-the-blank minigame: complete an NPC-style sentence to test grammar/vocab
 * in context. Wrong answers get a gentle in-character correction, never a fail state.
 */
const FillBlankGame = (() => {
  let root, gameState, onComplete;
  let prompts = [];
  let idx = 0;
  let score = 0;
  let answered = false;

  function open(promptPool, state, doneCb) {
    root = document.getElementById('minigame-root');
    gameState = state;
    onComplete = doneCb;
    prompts = shuffle([...promptPool]).slice(0, 5);
    idx = 0;
    score = 0;
    answered = false;
    document.getElementById('minigame-overlay').classList.remove('hidden');
    renderPrompt();
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function renderPrompt() {
    answered = false;
    const p = prompts[idx];
    const parts = p.sentence.split('___');
    root.innerHTML = `
      <div class="mg-header">
        <h2>Completa la Frase <span style="color:var(--text-dim); font-size:0.7em;">(Complete the Sentence)</span></h2>
        <span class="mg-timer">${idx + 1}/${prompts.length}</span>
      </div>
      <div class="fb-sentence">${parts[0]}<span style="color:var(--accent); font-weight:700;">____</span>${parts[1] || ''}</div>
      <div class="fb-en">${p.en}</div>
      <div class="fb-options" id="fb-options"></div>
      <div class="mg-feedback" id="mg-feedback"></div>
    `;
    const optsEl = document.getElementById('fb-options');
    const options = shuffle([...p.options]);
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => choose(opt, btn));
      optsEl.appendChild(btn);
    });
  }

  function choose(opt, btn) {
    if (answered) return;
    answered = true;
    const p = prompts[idx];
    const isCorrect = opt === p.answer;

    if (p.vocab) SRS.recordAnswer(gameState.srs, p.vocab, isCorrect);

    const buttons = document.querySelectorAll('#fb-options button');
    buttons.forEach(b => {
      if (b.textContent === p.answer) b.classList.add('correct');
      else if (b === btn) b.classList.add('wrong');
    });

    const fb = document.getElementById('mg-feedback');
    if (isCorrect) {
      score++;
      fb.textContent = '¡Perfecto! That\'s right.';
      fb.style.color = 'var(--good)';
      TTS.speak(p.sentence.replace('___', p.answer), gameState.ttsLang || 'es-ES');
    } else {
      fb.textContent = `Close! The word is "${p.answer}" — ${p.en}`;
      fb.style.color = 'var(--accent-2)';
    }

    setTimeout(next, 1600);
  }

  function next() {
    idx++;
    if (idx >= prompts.length) {
      finish();
    } else {
      renderPrompt();
    }
  }

  function finish() {
    const xp = score * 10;
    root.innerHTML = `
      <div class="mg-result">
        <h2>¡Bien hecho!</h2>
        <div class="score">${score}/${prompts.length} correct</div>
        <p style="color:var(--text-dim)">+${xp} XP</p>
        <div class="actions" style="justify-content:center;">
          <button class="btn primary" id="mg-close">Continue</button>
        </div>
      </div>`;
    document.getElementById('mg-close').addEventListener('click', () => {
      document.getElementById('minigame-overlay').classList.add('hidden');
      onComplete(xp);
    });
  }

  return { open };
})();
