# Lingua Quest — Valdeluz

A playable, cozy third-person 3D Spanish-learning prototype. Explore a fictional Spanish town, create and edit your character, meet neighbours, and help prepare a shared dinner.

## Play locally

Python 3 is the only runtime needed to serve the game. From this folder:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open http://127.0.0.1:8766 in a browser with WebGL enabled. On macOS, `Start Lingua Quest.command` starts the same server. Keep its terminal open while playing; Ctrl+C stops it. If the port is in use, close the previous server or choose another port (a different port uses a separate browser save).

Do not open index.html directly as a file: the chapter JSON needs a local server. All graphics and engine assets are bundled locally; no npm install, API key, backend, or remote CDN is required. Speech quality and offline voice availability depend on your browser's installed Spanish voices.

## Controls

- WASD / arrow keys: walk relative to the camera.
- Drag on the world: rotate camera. Scroll: zoom.
- Click the ground: walk there. Click a neighbour's label: walk over and talk.
- E or the on-screen interaction button: interact nearby.
- J: journal, basket and routes to destinations.
- Escape: close the current panel.
- Character button or the wardrobe at home: edit appearance.
- Touch devices also get directional buttons.

## First chapter

Meet Lucía by the fountain. Get bread from Mateo at the bakery, tomatoes from Inés at the market, and olive oil from Diego inside the café. Bring the basket to the dinner table near the bakery and follow Lucía's instructions. The table gains food when the chapter is complete. Visit neighbours again for due vocabulary reviews.

English introduces the story and new words. Short object-choice requests invite unaided understanding, with a free English-help button. Independent, spaced recall in multiple contexts gradually hides English on lines tagged with familiar focus words. Mistakes restore support. This is an experimental vocabulary model, not an assessment of overall Spanish fluency.

## Saves

The new game uses `linguaquest_v2_es` in browser localStorage. It never replaces the earlier `linguaquest_es` save. Saves are local to this browser and origin; clearing site data removes them. There is no cloud account or cross-device sync. Japanese remains planned and has no playable world in this build.

`legacy.html` preserves the original 2D game, its content, and its old save key.

## Files and scope

- `js/v2/world.js`: procedural Three.js town, interiors, character geometry, movement and camera.
- `js/v2/app.js`: screen flow, dialogue, quest and inventory, editor, speech and saves.
- `js/v2/learning.js`: isolated-save validation and conservative focus-word learning evidence.
- `data/es/chapter.json`: the new chapter's Spanish dialogue, translations and word references.
- `css/town.css`: responsive game interface.
- `vendor/`: Three.js 0.169.0 and its MIT license.
- `tests/`: learning, save isolation and chapter validation tests. Run `npm test` or `node --test tests/*.test.js` with Node.js.

This is one complete starter quest and two small interiors, using eight focus vocabulary entries (three are exercised throughout the main quest). The older 60-item curriculum remains in the legacy prototype; it is not all integrated into the 3D chapter yet. Additional chapters, rich relationships, broader curriculum, speech input, advanced character sculpting and a Japanese world are future work. The characters and architecture are procedural stylized geometry, not imported production art.
