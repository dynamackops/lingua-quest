# Lingua Quest roadmap

## Playable now
- The Crossing: a neutral hub plaza with a guide NPC and two archways, in place of the old welcome-screen world-picker cards. One character is created there and shared everywhere; each world still keeps its own save, quest and progress independently.
- Two worlds reached through hub doors: the Spanish town Valdeluz and the Japanese town Hinata, each procedural 3D, each with its own save key and interiors.
- One complete dinner quest per world with item collection, delivery and visible completion.
- Focus-word English fade, free hints, independent-recall evidence, due review requests, local saves.
- Japanese reading support: kana lines with romaji always visible, a hiragana / katakana toggle, English fading as in Spanish.

## The Crossing: next steps
The hub currently only ships the plaza, the guide, and the two doors. Next, per the current design direction:
1. A clothing store inside each language world's town (not the hub itself), selling in that world's language so shopping doubles as a vocabulary lesson. Purchases land in one wardrobe shared across every world's house closet.
2. A world currency, separate from story XP, earned generously through quests and in smaller amounts from repeatable activities — so grinding is a slower fallback, never the efficient path.
3. More doors as more languages ship — the hub was deliberately built as "just another themed builder" (`js/v2/hub.js`) specifically so adding a door is additive, not a rework.
4. Consider whether the hub should ever have its own light content (a notice board, a small task from Aya) versus staying purely a pass-through lobby.

## Next Spanish playtests and chapters
1. Observe whether movement, camera, object choices and first conversations feel comfortable for a beginner. Tune speed, text length, translation timing and art proportions from playtesting.
2. Add daily routines, café orders and directions quests. Integrate the legacy 60-word set intentionally, then expand toward a reviewed core curriculum. Track phrase/grammar comprehension and listening separately before fading broad sentence support.
3. Add richer authored animations, interiors, resident schedules, relationship scenes, clothing variety, inventory objects held by the player and environmental sound.
4. Add save export/import and optional multiple player profiles. Test Safari, touch devices and lower-power hardware beyond the current desktop browser checks.

## Japanese world: next steps
Hinata ships with its own save key, character, curriculum and content (not translated from Spain). Next: kana onboarding activities for players who cannot read hiragana yet, a katakana-heavy shopping scene, particle contrasts, casual speech after polite forms are familiar, and a native-speaker review of every line. Transitional text has been moved out of app.js into the chapter files, so both worlds are localized from data.

## Later
Optional microphone responses, carefully evaluated recognition and lenient pronunciation feedback. Broader story arcs and voice assets. Cloud sync only if explicitly wanted; local solo play remains the baseline.
