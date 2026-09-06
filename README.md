# Lingua Quest — Valdeluz and Hinata

A playable, cozy third-person 3D language-learning prototype with two worlds. Pick Spanish and explore Valdeluz, a fictional Spanish town, or pick Japanese and explore Hinata, a small Japanese town with a pond and a tea house. Create and edit a character in each world, meet neighbours, and help prepare a shared dinner.

## Play locally

Python 3 is the only runtime needed to serve the game. From this folder:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open http://127.0.0.1:8766 in a browser with WebGL enabled. On macOS, `Start Lingua Quest.command` starts the same server. Keep its terminal open while playing; Ctrl+C stops it. If the port is in use, close the previous server or choose another port (a different port uses a separate browser save).

Do not open index.html directly as a file: the chapter JSON needs a local server. All graphics and engine assets are bundled locally; no npm install, API key, backend, or remote CDN is required. Speech quality and offline voice availability depend on your browser's installed Spanish and Japanese voices.

## Controls

- WASD / arrow keys: walk relative to the camera.
- Drag on the world: rotate camera. Scroll: zoom.
- Click the ground: walk there. Click a neighbour's label: walk over and talk.
- E or the on-screen interaction button: interact nearby.
- J: journal, basket and routes to destinations.
- Escape: close the current panel.
- Character button or the wardrobe at home: edit appearance.
- Touch devices also get directional buttons.
- Japanese only: the あ / ア button in a conversation switches the line between hiragana and katakana.

## Choosing a world

The welcome screen shows a card for each world. Each world has its own character, save and progress, and the town behind the welcome screen changes with your choice. Spanish and Japanese are independent: nothing carries over, by design.

## Spanish chapter: Una mesa para todos

Meet Lucía by the fountain. Get bread from Mateo at the bakery, tomatoes from Inés at the market, and olive oil from Diego inside the café. Bring the basket to the dinner table near the bakery and follow Lucía's instructions. The table gains food when the chapter is complete. Visit neighbours again for due vocabulary reviews.

English introduces the story and new words. Short object-choice requests invite unaided understanding, with a free English-help button. Independent, spaced recall in multiple contexts gradually hides English on lines tagged with familiar focus words. Mistakes restore support. This is an experimental vocabulary model, not an assessment of overall fluency.

## Japanese chapter: みんなで おにぎり

Meet Aoi by the pond. Get rice (ごはん) from Kenji at the rice shop, salmon (さけ) from Yui at the fish stall, and green tea (おちゃ) from Haruto inside the Kaede tea house. Bring the basket to the low table near the rice shop and follow Aoi's instructions. Onigiri and tea appear on the table when the chapter is complete.

Lines are hiragana with spaces between words; loanwords such as テーブル keep their katakana. Romaji is always shown underneath so you can sound everything out, and can be hidden in Help. English fades exactly as in the Spanish world. Neighbours use the polite です / ます form. See `CURRICULUM_ja.md` for the reasoning.

## Saves

The Spanish world uses `linguaquest_v2_es` and the Japanese world uses `linguaquest_v2_ja` in browser localStorage; the last chosen world is remembered under `linguaquest_world`. Neither replaces the earlier `linguaquest_es` save. Saves are local to this browser and origin; clearing site data removes them. There is no cloud account or cross-device sync.

`legacy.html` preserves the original 2D game, its content, and its old save key.

## Files and scope

- `js/v2/world.js`: the shared Three.js engine: movement, camera, path search, labels and interiors, rebuilt from a themed builder.
- `js/v2/valdeluz.js` and `js/v2/hinata.js`: procedural geometry for the Spanish and Japanese towns and their interiors.
- `js/v2/parts.js`: primitive helpers, painted signs (with a kana-capable font stack) and the character.
- `js/v2/app.js`: world picker, screen flow, dialogue, quest and inventory, editor, speech and saves. All story and interface text comes from the chapter files.
- `js/v2/learning.js`: per-language save validation, conservative focus-word learning evidence and the kana conversion.
- `data/es/chapter.json` and `data/ja/chapter.json`: each chapter's dialogue, romaji (Japanese), translations, word references and interface strings.
- `css/town.css`: responsive game interface.
- `vendor/`: Three.js 0.169.0 and its MIT license.
- `tests/`: learning, save isolation and chapter validation tests. Run `npm test` or `node --test tests/*.test.js` with Node.js.

Each world is one complete starter quest and two small interiors, using eight focus vocabulary entries (three are exercised throughout the main quest). The older 60-item Spanish curriculum remains in the legacy prototype; it is not all integrated into the 3D chapter yet. Additional chapters, rich relationships, broader curricula, kana onboarding activities, speech input and advanced character sculpting are future work. The characters and architecture are procedural stylized geometry, not imported production art.
