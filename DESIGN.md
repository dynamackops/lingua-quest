# Lingua Quest — Design Doc

This is the doc to hand to a future Claude Code session before building Phase 2
(Japanese, Italian, French, Portuguese) or Phase 3 (speech input). It explains
*why* the systems work the way they do, not just what the code does.

## The pitch, one paragraph

A browser RPG where picking a language means living inside it. Character
creation is the last screen in English; from the moment you spawn in the
hub village, every sign, every NPC line, every quest and minigame is 100%
target-language. The one thing standing between "immersive" and
"incomprehensible" is the Subtitle Fade — a crutch that's there when you
need it and quietly gets out of the way as you stop needing it.

## Core loop

```
Explore (walk the hub) → Approach NPC/object → Comprehensible input
  (line spoken + tiered subtitle) → Player responds (multiple choice,
  itself a comprehension check) → SRS records exposure/correctness →
  Mastery updates → Tier recalculated → XP/quest progress → repeat
```

Minigames (Match, Fill-in-the-blank) are optional, on-demand detours that
force retrieval of the same vocab pool through a different channel — not a
separate "study mode" bolted onto the side of the game.

## The Subtitle Fade — how it actually works

Implemented in `js/dialogue.js`. Tier is a property of `gameState.tier`,
recomputed after every exposure/answer by `SRS.computeTier()`
(`js/srs.js`), never by a playtime clock.

| Tier | Target text | Subtitle | Comprehension check |
|---|---|---|---|
| 1 | shown | full English, always visible | none (options show EN too) |
| 2 | shown, vocab spans tagged known/new | hidden; tap a word for a 2.2s gloss | none |
| 3 | shown | hidden; hold **H** for 2s (costs a hint charge, capped, daily refill) | none |
| 4 | shown | never | player must pick the right dialogue option |

Tier thresholds (`SRS.computeTier`) look at **known-word count** (mastery
≥ 0.5) and **average mastery across exposed words**, not raw XP or time
played:

```
Tier 4: knownCount >= 45 && avgMastery >= 0.70
Tier 3: knownCount >= 30 && avgMastery >= 0.60
Tier 2: knownCount >= 14 && avgMastery >= 0.45
Tier 1: default
```

These numbers are scaled to the v1 Spanish vocab pool (~60 items) so a
committed player can realistically reach Tier 2–3 in one long session and
see the system move. When Phase 2 languages ship with ~500-word curricula
(per `CURRICULUM_es.md`'s template), these thresholds should scale up
roughly proportionally — don't copy the raw numbers, copy the *shape*
(two-signal gate: breadth of known words + quality of retention).

A player who's actually retaining words moves through tiers faster than
one who's guessing, because guessing produces exposures without correct
answers, which caps `mastery` at ~0.35 (see below) — it literally cannot
cross the "known" threshold from exposure alone.

### Why two knobs (known count *and* average mastery) instead of one

Known-count alone would let a player camp on 14 easy words forever and
"graduate" without breadth. Average-mastery alone would let a player who's
only seen 3 words but nailed them all skip ahead unrealistically. Gating
on both means the player has to have *both* range and retention — the same
thing a human teacher is implicitly checking before they stop translating
for a student.

## SRS / mastery model (the "SRS-lite" from the scope doc)

`js/srs.js`. Each vocab item gets:

```js
{ exposures, correct, wrong, lastSeen, mastery }
```

`mastery` recomputes on every exposure/answer:

```
attempts = correct + wrong
accuracy = attempts > 0 ? correct/attempts : 0
exposureFactor = min(1, exposures / 6)
mastery = attempts > 0
  ? accuracy * 0.7 + exposureFactor * 0.3
  : exposureFactor * 0.35   // pure exposure, never tested yet
```

This is deliberately **not** SM-2 — it's the "naive seen-count +
last-seen" placeholder the scope doc explicitly allows for v1. The pieces
that would need to change for a real SM-2/Leitner upgrade:

- Add an `interval`/`easeFactor` per item and a `dueDate`.
- Replace `dueForReview()`'s staleness-times-inverse-mastery heuristic
  with actual interval scheduling.
- Feed `dueForReview()` results into dialogue/quest selection so the
  *world* — not a separate review screen — is what resurfaces the word
  (e.g., an NPC who's due to reuse a word gets picked preferentially next
  time the player wanders near them). This hook doesn't exist yet in v1;
  right now vocab resurfaces because the curriculum is written to reuse
  words across NPCs/objects/minigames by hand, not algorithmically. That's
  the biggest structural gap to close before Phase 2 — see ROADMAP.md.

## Mistakes are informative, not punishing

There is no fail state anywhere in the game. Two mechanisms carry this:

1. **Dialogue data does the correcting.** A "wrong" option in a
   comprehension-check node doesn't show an error — it routes to a
   rephrase node written by hand (see `rosa_2_wrong` in
   `data/es/dialogue.json`: picking "I'm looking for a cake" doesn't fail,
   Doña Rosa just says "I don't sell cakes here, but I have apples, bread,
   cheese — are you looking for those?" and loops back into the correct
   flow). This is why dialogue trees are hand-authored per NPC rather than
   generated: the correction has to be as intentional as the lesson.
2. **Minigames show the right answer immediately, gently.** Fill-in-blank
   never blocks progress on a wrong pick — it flags the button, states the
   right answer and its translation, and auto-advances. SRS still records
   the miss (so the SRS "weights toward what they struggle with" promise
   holds), but the player never sees a fail/retry wall.

## Data-driven content

Every piece of Spanish content lives in `data/es/*.json`:
`vocab.json`, `dialogue.json`, `quests.json`, `fillblank.json`,
`world.json`. None of `js/*.js` hardcodes Spanish strings — `main.js`
loads `data/{code}/*.json` by language code. Adding a new language is
"write five new JSON files that satisfy the same schema," not "modify the
engine." See `ROADMAP.md` for what's genuinely reusable vs. what Japanese
specifically breaks.

## Save model

`js/save.js`. One `localStorage` key per language: `linguaquest_<code>`.
Loading Spanish never touches `linguaquest_ja`. This is intentional
friction, not a technical shortcut — a player learning two languages is
visibly building two different characters in two different worlds, which
is the honest reflection of how little transfers between (say) Spanish
and Japanese vocabulary/grammar at the beginner stage.

## Player-response abstraction (for Phase 3 speech input)

`DialogueEngine.renderOptions()` is the single place that turns a node's
`options[]` into player-facing UI. It currently renders buttons. Phase 3
("player speaks their answer") should be a second implementation of the
same contract — given a node's options (each with `es`/`en`/`next`/
optional `correct`), resolve to a chosen option — swapped in behind a
settings flag, not a rewrite of `renderNode()`/`choose()`. Don't hardcode
button-clicking assumptions elsewhere in the dialogue engine; there
currently aren't any, keep it that way.

## What's stubbed in v1 (intentionally)

- **Tier 3/4 are implemented but under-tested** — the Spanish vocab pool
  (~60 words) makes Tier 3 reachable but Tier 4 (45 known words at 70%+
  avg mastery) is a stretch goal for a single sitting. The mechanics are
  real; treat a first playtest that never reaches Tier 4 as expected, not
  broken.
- **Timed Sorting and Listening Race minigames** are not built — the scope
  doc calls for 2 of the 3–4 minigames for v1. Match and Fill-in-the-blank
  are complete and reskin-ready (swap the data file, not the code).
- **Speech input** is Phase 3, not started — see the abstraction note
  above for how it should slot in.
- **Origin selection** (food vs. travel) currently only stores a flavor
  flag on the character; it doesn't yet reorder quest/vocab presentation.
  Wiring it up is a good small Phase 2 task once there's a second theme
  worth reordering around.
