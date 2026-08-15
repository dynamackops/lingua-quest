/**
 * Thin glue layer between world triggers (objects, dialogue nodes) and the
 * existing minigame engines. Resolves an activity id, filters the right
 * vocab/prompt subset, shows an in-character framing card, then hands off
 * to MatchGame/FillBlankGame unchanged. Stateless w.r.t. gameState.quests —
 * all gating (activeWhen etc.) happens in main.js before run() is called.
 */
const ActivityEngine = (() => {
  function run(activityId, activitiesData, langData, gameState, callbacks) {
    const def = activitiesData.activities[activityId];
    if (!def) { callbacks.onDone(0); return; }

    const pool = def.type === 'match'
      ? langData.vocab.items.filter(v => def.vocabIds.includes(v.id))
      : langData.fillblank.prompts.filter(p => def.promptIds.includes(p.id));

    const overlay = document.getElementById('minigame-overlay');
    const root = document.getElementById('minigame-root');
    overlay.classList.remove('hidden');
    root.innerHTML = `
      <div class="mg-result">
        <h2>${def.title} <span style="color:var(--text-dim); font-size:0.6em;">(${def.titleEn})</span></h2>
        <p style="color:var(--text-dim)">${def.intro}</p>
        <div class="actions" style="justify-content:center;">
          <button class="btn primary" id="mg-activity-start">Empezar</button>
        </div>
      </div>`;

    document.getElementById('mg-activity-start').addEventListener('click', () => {
      const engine = def.type === 'match' ? MatchGame : FillBlankGame;
      engine.open(pool, gameState, (xp) => {
        if (def.onComplete && def.onComplete.questEvent && callbacks.onQuestEvent) {
          const qe = def.onComplete.questEvent;
          callbacks.onQuestEvent(qe.kind, qe.questId);
        }
        callbacks.onDone(xp);
      });
    }, { once: true });
  }

  return { run };
})();
