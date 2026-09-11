# Lingua Quest — Valdeluz and Hinata

A playable, cozy third-person 3D language-learning prototype with two worlds. Create one character at The Crossing, a small neutral hub, then step through an archway into Valdeluz for Spanish or Hinata for Japanese — meet neighbours, and help prepare a shared dinner in whichever you choose.

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
- ↩ button in the header (shown inside a language world, hidden at The Crossing): return to the hub. The brand logo does the same, plus goes one level further to the welcome screen from the hub itself.
- Touch devices also get directional buttons.
- Japanese only: the あ / ア button in a conversation switches the line between hiragana and katakana.

## The Crossing

"Create your character" leads into The Crossing, a plain plaza with a guide who explains the game and two archways — one to Valdeluz, one to Hinata. Walk up to a door and confirm to step through. Your character (name and look) is the same everywhere; each world still keeps its own save and progress, independent of the others, by design. The brand logo in the header takes you back to The Crossing from inside a world, and back to the welcome screen from The Crossing itself.

## Spanish chapter: Una mesa para todos

Meet Lucía by the fountain. Get bread from Mateo at the bakery, tomatoes from Inés at the market, and olive oil from Diego inside the café. Bring the basket to the dinner table near the bakery and follow Lucía's instructions. The table gains food when the chapter is complete. Visit neighbours again for due vocabulary reviews.

English introduces the story and new words. Short object-choice requests invite unaided understanding, with a free English-help button. Independent, spaced recall in multiple contexts gradually hides English on lines tagged with familiar focus words. Mistakes restore support. This is an experimental vocabulary model, not an assessment of overall fluency.

## Japanese chapter: みんなで おにぎり

Meet Aoi by the pond. Get rice (ごはん) from Kenji at the rice shop, salmon (さけ) from Yui at the fish stall, and green tea (おちゃ) from Haruto inside the Kaede tea house. Bring the basket to the low table near the rice shop and follow Aoi's instructions. Onigiri and tea appear on the table when the chapter is complete.

Lines are hiragana with spaces between words; loanwords such as テーブル keep their katakana. Romaji is always shown underneath so you can sound everything out, and can be hidden in Help. English fades exactly as in the Spanish world. Neighbours use the polite です / ます form. See `CURRICULUM_ja.md` for the reasoning.

## Saves

The Spanish world uses `linguaquest_v2_es`, Japanese uses `linguaquest_v2_ja`, and The Crossing itself uses `linguaquest_v2_hub`, all in browser localStorage; the last chosen world is remembered under `linguaquest_world`. Your character (name and appearance) lives in a separate shared key, `linguaquest_v2_character`, so it's the same wherever you go — a returning player's existing per-world look is adopted into it automatically the first time. None of these replace the earlier `linguaquest_es` save. Saves are local to this browser and origin; clearing site data removes them. There is no cloud account or cross-device sync.

`legacy.html` preserves the original 2D game, its content, and its old save key.

## Files and scope

- `js/v2/world.js`: the shared Three.js engine: movement, camera, path search, labels and interiors, rebuilt from a themed builder.
- `js/v2/valdeluz.js` and `js/v2/hinata.js`: procedural geometry for the Spanish and Japanese towns and their interiors.
- `js/v2/hub.js`: procedural geometry for The Crossing — a plain neutral plaza with two archways, built as just another themed builder.
- `js/v2/parts.js`: primitive helpers, painted signs (with a kana-capable font stack) and the character.
- `js/v2/app.js`: hub/world flow, dialogue, quest and inventory, editor, speech and saves. All story and interface text comes from the chapter files, the hub included.
- `js/v2/learning.js`: per-language save validation, the shared character record, conservative focus-word learning evidence and the kana conversion.
- `data/es/chapter.json`, `data/ja/chapter.json` and `data/hub.json`: each chapter's dialogue, romaji (Japanese), translations, word references and interface strings — the hub's chapter has no quest, just a guide and two doors.
- `css/town.css`: responsive game interface.
- `vendor/`: Three.js 0.169.0 and its MIT license.
- `tests/`: learning, save isolation and chapter validation tests. Run `npm test` or `node --test tests/*.test.js` with Node.js.

Each world is one complete starter quest and two small interiors, using eight focus vocabulary entries (three are exercised throughout the main quest). The older 60-item Spanish curriculum remains in the legacy prototype; it is not all integrated into the 3D chapter yet. Additional chapters, rich relationships, broader curricula, kana onboarding activities, speech input and advanced character sculpting are future work. The characters and architecture are procedural stylized geometry, not imported production art.
