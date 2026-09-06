# Lingua Quest — 3D direction

## Agreed experience

A cozy, freely explorable third-person 3D world inspired by Spain. Begin Spanish as a beginner. Create a character that feels personal and edit it later. A future Japanese world must have a separate character, local save and curriculum. Spanish is the sole active world in this release.

## Playable slice

Valdeluz is a small sunlit square with cream plaster houses, terracotta roofs, a bakery, market, café and player home. Movement is camera-relative, supports keyboard and click-to-walk, and respects building and outdoor furniture collision bounds. Labels and the journal offer walk-to destinations, using a bounded grid path search. The camera orbits and follows the visible animated player. Building bodies limit camera placement to reduce clipping.

Home and café have separate small interiors. The character editor offers name, six skin colours, six hair styles, hair and shirt colours, body width, eye colour, glasses and scarf. Saving an edit rebuilds the character while preserving quest state and position.

The first quest is a shared dinner: greeting → contextual ingredient introductions → choosing the requested object → carrying three inventory items → placing them at the table → a completed dinner. Completion is persisted, and resumed delivery skips already-delivered items. Neighbours can offer short review requests after collection or completion.

## Learning evidence and English support

`learning.js` is independent of the renderer and UI. Each focus word tracks exposures, attempts, errors, independent successes, contexts, last qualifying recall, due time and lapse status.

Exposures never establish familiarity. An assisted or corrected answer advances the quest but not independent-success count. Immediate repeats less than 60 seconds apart do not increase that count. At least three qualifying successes and two distinct contexts are needed for familiarity. Reviews use intervals of 1 minute, 10 minutes, 1 day, 3 days and 7 days. A wrong answer restores support; a very overdue item also receives support.

Ordinary dialogue shows English when any tagged focus word is unfamiliar. During short comprehension requests, translation starts hidden in Adaptive mode; a free help button reveals it and marks that attempt assisted. “Always show English” is available. No hint charges, speed pressure or loss of story progress.

The tags represent focus vocabulary, not every grammatical feature in a sentence. This prototype does not assess whole-language proficiency, and its thresholds are design parameters requiring user playtesting. Reading and listening are not yet measured separately. Browser TTS is replaceable; there is no microphone input.

## Data and migration

The new chapter is in `data/es/chapter.json`; legacy Spanish content remains intact. Engine UI and some reusable short transitional lines are in app.js; migrate these to locale resources before another language ships. New persistence key: `linguaquest_v2_es`, schema 2. No automatic mastery migration from the older, less reliable model. The old save and original entry point remain accessible through legacy.html.

The original design is retained in DESIGN_2D.md for history. README.md describes the actual current scope.
