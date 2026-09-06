# Lingua Quest — 3D direction

## Agreed experience

Cozy, freely explorable third-person 3D worlds: Valdeluz, inspired by Spain, and Hinata, inspired by a small Japanese town. Begin either language as a beginner. Create a character that feels personal in each world and edit it later. The two worlds share the engine, interface and quest shape but never share a character, save or curriculum.

## World picker

The welcome screen shows one card per world and rebuilds the town behind it when the choice changes. The last world played is remembered. Every story and interface string comes from that world's chapter file, so `app.js` contains no language-specific text.

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

Chapters live in `data/es/chapter.json` and `data/ja/chapter.json`, including interface strings, engine lines and quest item lists; legacy Spanish content remains intact. Persistence keys: `linguaquest_v2_es` and `linguaquest_v2_ja`, schema 2, validated per language against that chapter's item ids. No automatic mastery migration from the older, less reliable model. The old save and original entry point remain accessible through legacy.html.

The original design is retained in DESIGN_2D.md for history. README.md describes the actual current scope.
