# Lingua Quest — 3D direction

## Agreed experience

Cozy, freely explorable third-person 3D worlds: Valdeluz, inspired by Spain, and Hinata, inspired by a small Japanese town. Begin either language as a beginner. Create one character — shared everywhere you go — and edit it later. The worlds share the engine, interface and quest shape but never share a save, quest progress or curriculum; only the character (name, look, wardrobe) is common between them.

## The Crossing: hub and doors

The welcome screen no longer offers a card per language. Instead, "Create your character" / "Continue your story" both lead into **The Crossing**, a small, deliberately plain plaza (`js/v2/hub.js`) — no language flavor, so it doesn't pre-bias the choice. A guide NPC there (role `guide`, distinct from a chapter's `host`) gives a short one-time welcome the first time you talk to her, then a brief reminder on any later visit. Two archways lead out: walking up to one and confirming (the same one-line-then-choose pattern as an existing home/cafe door) calls `enterWorld(code)`, which is just `selectWorld(code)` — the exact function the old welcome-screen cards used to call — followed by `start()`. Nothing about *entering* a language world changed; only *how you get there* did. The brand logo in the header now means "go up one level": from a language world it returns to the hub (`returnToHub()`), and only from the hub itself does it fully exit to the welcome screen (`leave()`).

The hub is implemented as its own minimal chapter (`data/hub.json`, `language:'en'`) satisfying the same schema every real chapter does — same `ui`/`people`/`lines` shape, `quest.items` just empty — so `app.js`'s dialogue/interact machinery needs almost no hub-specific branching. The two exceptions: `updateHud()`/`start()` check `chapter.questSteps` before touching quest-HUD elements (the hub has none, so quest-hud stays hidden there), and `showLine()`'s "helped" calculation checks `L!=='en'` so a chapter whose target language *is* English never shows a redundant duplicate "translation" of itself.

## Playable slice

Valdeluz is a small sunlit square with cream plaster houses, terracotta roofs, a bakery, market, café and player home. Movement is camera-relative, supports keyboard and click-to-walk, and respects building and outdoor furniture collision bounds. Labels and the journal offer walk-to destinations, using a bounded grid path search. The camera orbits and follows the visible animated player. Building bodies limit camera placement to reduce clipping.

Home and café have separate small interiors. The character editor offers name, six skin colours, six hair styles, hair and shirt colours, body width, eye colour, glasses and scarf. Saving an edit rebuilds the character while preserving quest state and position.

The first quest is a shared dinner: greeting → contextual ingredient introductions → choosing the requested object → carrying three inventory items → placing them at the table → a completed dinner. Completion is persisted, and resumed delivery skips already-delivered items. Neighbours can offer short review requests after collection or completion.

Hinata uses the same footprint with its own geometry: timber-framed houses with dark tiled hip roofs and shoji doors, a koi pond with a bamboo spout in place of the fountain, a fish stall under a blue and white awning, a rice shop and a tea house with noren, stone lanterns, pines, maples, a bamboo grove, paper lanterns strung across the courtyard, a torii and shrine at the end of the east path, a tatami home with a tansu wardrobe, and a tea house interior. The dinner is onigiri, salmon and tea at a low table with cushions.

## Japanese reading support

Japanese lines are hiragana with spaces between words, katakana for loanwords and no kanji. Romaji is always shown under lines, choices and illustrations and can be hidden in Help. A toggle converts a line to katakana as a reading drill. Romaji is a reading aid rather than a translation, so it never marks an attempt as assisted; English support fades under the same rules as Spanish. Neighbours use the polite です / ます register.

## Learning evidence and English support

`learning.js` is independent of the renderer and UI. Each focus word tracks exposures, attempts, errors, independent successes, contexts, last qualifying recall, due time and lapse status.

Exposures never establish familiarity. An assisted or corrected answer advances the quest but not independent-success count. Immediate repeats less than 60 seconds apart do not increase that count. At least three qualifying successes and two distinct contexts are needed for familiarity. Reviews use intervals of 1 minute, 10 minutes, 1 day, 3 days and 7 days. A wrong answer restores support; a very overdue item also receives support.

Ordinary dialogue shows English when any tagged focus word is unfamiliar. During short comprehension requests, translation starts hidden in Adaptive mode; a free help button reveals it and marks that attempt assisted. “Always show English” is available. No hint charges, speed pressure or loss of story progress.

The tags represent focus vocabulary, not every grammatical feature in a sentence. This prototype does not assess whole-language proficiency, and its thresholds are design parameters requiring user playtesting. Reading and listening are not yet measured separately. Browser TTS is replaceable; there is no microphone input.

## Data and migration

Chapters live in `data/es/chapter.json`, `data/ja/chapter.json` and `data/hub.json`, including interface strings, engine lines and quest item lists; legacy Spanish content remains intact. Persistence keys: `linguaquest_v2_es`, `linguaquest_v2_ja` and `linguaquest_v2_hub`, schema 2, validated per language against that chapter's item ids. No automatic mastery migration from the older, less reliable model. The old save and original entry point remain accessible through legacy.html.

The character is a fourth, separate record: `linguaquest_v2_character` (`learning.js`'s `loadCharacter`/`saveCharacter`), deliberately kept apart from `loadState`/`saveState` rather than folded into them — every existing per-language save still round-trips its own `state.character` field exactly as before (protected by tests), so nothing about the old schema changed. `app.js` simply overwrites `state.character` with the shared record after loading any world's state, and writes both the shared record and (unchanged) the per-language one whenever the creator saves. A player with an existing pre-hub save has no shared record yet; `loadCharacter()` falls back to scanning `es`/`ja` saves for one and `init()` commits that fallback back to the shared key immediately, so migration happens once, not on every load, and existing quest/inventory/XP progress in that language is completely untouched.

The original design is retained in DESIGN_2D.md for history. README.md describes the actual current scope.
