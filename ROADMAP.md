# ROADMAP

## Phase 1 — done (this build)

Spanish v1 prototype: welcome → character creation → hub world (Casa / El
Mercado / El Café), 3 NPCs with branching/comprehension-check dialogue,
1 quest, 60 vocab items across 2 themes, Subtitle Fade Tiers 1–4 (1–2
fully realized in normal play, 3–4 implemented and reachable but
under-tested at this vocab volume), naive SRS mastery tracking, Match +
Fill-in-the-blank minigames, per-language localStorage saves, XP/leveling.

## Phase 2 — the other four languages

Goal: prove the engine genuinely is language-agnostic by templating it,
not by writing four more copies of `js/*.js`.

### Straightforward templating (Italian, French, Portuguese)

These three share Spanish's grammar shape closely enough (SVO, gendered
nouns, regular-ish present tense, heavy English cognate overlap) that the
work is mostly content, not engine changes:

1. Write `data/{it,fr,pt}/{vocab,dialogue,quests,fillblank,world}.json`
   against the exact same schemas Spanish uses — don't invent new fields
   without updating `DESIGN.md` and all three other languages to match.
2. Write `CURRICULUM_{it,fr,pt}.md` following `CURRICULUM_es.md`'s
   structure: theme tables with an "introduced by" column, then a grammar
   sequencing section, then cultural notes.
3. **French needs one real deviation**: pronunciation/liaison is a bigger
   early stumbling block for English speakers than for the other two
   Romance languages. Consider surfacing liaison explicitly in early
   dialogue pacing (e.g., an NPC line that repeats a liaison-heavy phrase
   twice) rather than treating French as a pure Spanish reskin. Don't
   solve this by adding French-specific engine code — solve it in how the
   dialogue data is written (slower vocab introduction rate, more repeat
   exposures per liaison-prone word).
4. Verify `speechSynthesis` voice coverage for `it-IT`, `fr-FR`, `pt-PT`
   (and decide `pt-PT` vs `pt-BR`) in target browsers before assuming TTS
   "just works" — coverage is inconsistent across browsers/OSes.

### Japanese — do not template, write from scratch

The pitch doc is explicit about this and it's correct: Japanese breaks
enough assumptions baked into the Spanish content (not the engine) that
copying the Romance template would produce broken pedagogy. Specifically:

- **No grammatical gender** — the article-highlighting pattern in
  `CURRICULUM_es.md` ("la manzana" pairing) doesn't exist; word
  boundaries and particle usage (は/を/に/で) need their own inductive
  sequencing.
- **SOV word order** — dialogue can't just be translated Spanish
  sentences; sentence-final verbs change what "hearing the pattern in
  context multiple times" looks like structurally.
- **Politeness registers** (です/ます vs. plain form, and beyond) are a
  core early-curriculum decision Spanish doesn't have an equivalent of —
  decide up front whether NPCs speak polite-form only in v1 (recommended:
  simpler, matches how a stranger would actually address the player) and
  document that choice in `CURRICULUM_ja.md`.
- **Kana before kanji** — vocab items likely need a `kana` field
  (hiragana/katakana reading) alongside the target-script form, and early
  dialogue should stay kana-only (or kana + very high-frequency kanji)
  before introducing kanji at all. This *is* a schema change —
  `vocab.json`'s shape may need `{ ja: "...", kana: "...", en: "..." }`
  instead of Spanish's flat `{ es, en }`. Decide this schema before
  writing Japanese content, and confirm it doesn't break the tokenizer in
  `js/dialogue.js` (`tokenize()` currently assumes space-delimited-ish
  Latin-script substring matching — Japanese has no spaces between words,
  so the known/new word-highlighting approach needs rethinking, not just
  reuse).
- **TTS quality risk is highest here.** The scope doc already flags this:
  `speechSynthesis` Japanese voices are the roughest of the five in most
  browsers. This is the language where swapping in a real multilingual
  TTS API (flagged as a TODO in `js/tts.js`) matters most, potentially
  before shipping Japanese at all rather than as a later polish pass.

Treat Japanese as its own curriculum-design project that happens to reuse
the world-rendering and save/SRS engine, not a data-file swap.

### Engine work Phase 2 will likely surface

- `js/dialogue.js`'s `tokenize()` needs a real word-boundary strategy once
  it's not just matching Spanish substrings (Japanese, but also French
  elisions like `l'eau`).
- `js/save.js` and `main.js`'s `LANGUAGES` array need the `ready` flags
  flipped on as each language ships — no other change required there.
- Consider whether `SRS.computeTier()`'s thresholds should scale with
  each language's actual vocab pool size (a 500-word curriculum vs. v1's
  60) rather than sharing one hardcoded set of numbers — see the note in
  `DESIGN.md`.

## Phase 3 — speech input

1. Build a second `renderOptions()`-shaped module behind the same
   contract described in `DESIGN.md`'s "Player-response abstraction"
   section: given a node's `options[]`, resolve to a chosen option.
2. Use the Web Speech API's `SpeechRecognition` for capture, matched
   leniently against each option's target-language text (fuzzy match, not
   exact — pronunciation grading should be encouraging, matching the
   "mistakes are informative, not punishing" principle already in the
   dialogue-correction design).
3. Gate it behind a settings toggle so keyboard/click play still works —
   don't replace the existing input path, add a second one.
4. Japanese speech recognition accuracy is a known hard problem; expect
   this to ship for the Romance languages first and Japanese later, same
   ordering logic as Phase 2.

## Explicitly out of scope for now

- Timed Sorting and Listening Race minigames (mentioned in the original
  pitch as 2 of 3–4 candidates; only 2 were required for v1 and Match +
  Fill-in-the-blank cover the required pair). Worth adding once a second
  language's content exists, so both minigames' reskinning story gets
  validated against more than one dataset.
- A backend / account system — v1 and Phase 2 both stay `localStorage`-only
  per the original scope constraint (solo hobby project, no server).
- Full branching narrative — dialogue branches stay small/local (a wrong
  guess reroutes to a correction node, not a diverging story), same as v1.
