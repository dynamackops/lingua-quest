# Lingua Quest — Valdeluz and Hinata

A playable, cozy third-person 3D language-learning prototype with two worlds. Create one character at The Crossing, a small neutral hub, then step through an archway into Valdeluz for Spanish or Hinata for Japanese — meet neighbours, and help prepare a shared dinner in whichever you choose.

## Play locally

Python 3 is the only runtime needed to serve the game. From this folder:

```sh
python3 -m http.server 8766 --bind 127.0.0.1
```

Then open http://127.0.0.1:8766 in a browser with WebGL enabled. On macOS, `Start Lingua Quest.command` starts the same server. Keep its terminal open while playing; Ctrl+C stops it. If the port is in use, close the previous server or choose another port (a different port uses a separate browser save).

Do not open index.html directly as a file: the chapter JSON needs a local server. All graphics and engine assets are bundled locally; no npm install, API key, build step, or remote CDN is required to *play*. Signing in and cloud saves do talk to a Supabase project (see Accounts below) — that is the one piece of the game with a server behind it, and the game stays fully playable as a guest when it is unreachable. Speech uses a premium recorded voice for any line that's been pre-generated (see Voice quality below), and falls back to your browser's installed Spanish/Japanese voices for everything else.

## Voice quality (optional)

By default every line is spoken with your browser's built-in `speechSynthesis` voice, which varies a lot between devices and can sound robotic. Spanish usually fares better here than Japanese. If you have an [ElevenLabs](https://elevenlabs.io) API key, `npm run tts` (or `node scripts/generate-tts.mjs`) pre-generates a premium recorded clip for every line of dialogue in both chapters and saves them as static `.mp3` files under `audio/`, plus a `audio/manifest.json` the game reads at startup. Japanese uses **Morioki**, a Japanese woman's conversational voice, not the English default. This is a one-time local build step, not something the game calls at runtime: your key only ever touches your own machine, never the repo or a live server.

```sh
ELEVENLABS_API_KEY=sk_... npm run tts        # both languages
ELEVENLABS_API_KEY=sk_... node scripts/generate-tts.mjs ja   # Japanese only (Morioki)
DRY_RUN=1 npm run tts                        # preview what would be generated, and its character count (ElevenLabs' billing unit), without calling the API
```

Once `audio/` exists, every player gets the premium voice automatically — nobody else needs a key. Re-run the script (it's cheap: unchanged lines are skipped) whenever chapter text changes. Pick your own voices with `ELEVENLABS_VOICE_ES`/`ELEVENLABS_VOICE_JA` env vars; see the comments at the top of `scripts/generate-tts.mjs`. Without a generated `audio/` folder the game works exactly as before, on browser voices alone.

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

Two more archways, ITALIA and FRANCE, sit greyed out in the plaza's back quadrants — a preview of what's coming, not playable yet. Walking up to one just shows a short "on its way" notice.

Aya, the guide, gives a one-time six-line welcome the first time you talk to her — covering movement, the journal, the wardrobe and coins — then a short reminder on any later visit.

## Coins and hats

Every quest milestone (meeting the host, collecting an item, finishing the chapter) and every correct in-conversation answer earns a little of that world's own currency — `monedas` in Valdeluz, `えん` in Hinata — alongside XP. XP is a pure progress readout; coins are what you spend. Both towns have a shopkeeper — Marta in Valdeluz, Sora in Hinata — who sells the same three hat cosmetics (a beret, a flower crown, a sombrero), named in that world's own language. Buy one and it's added to your shared wardrobe — wearable from any world's character editor, the same as any other look choice — while the coins spent come only from that world's own balance.

Coins aren't only earned by finishing the story once: the fountain in Valdeluz and the pond in Hinata double as a small repeatable check on that world's water vocabulary. It's available the moment you first visit, then only again once that word comes due for review — the same rhythm as revisiting a neighbour whose item you already collected — so there's always a little something to do for coins, just not enough to grind.

## Entrances that go both ways

The Crossing's two archways sit on opposite sides of its circular plaza — Valdeluz to the west, Hinata to the east — rather than side by side. Each world also builds a matching archway of its own, in the same plain style and labelled THE CROSSING, near the edge of its own plaza: walk up and confirm to head home, the same way you walked through a door to arrive. That's in addition to the ↩ button in the header, not instead of it.

## Spanish chapter: Una mesa para todos

Meet Lucía by the fountain. Get bread from Mateo at the bakery, tomatoes from Inés at the market, and olive oil from Diego inside the café. Bring the basket to the dinner table near the bakery and follow Lucía's instructions. The table gains food when the chapter is complete. Visit neighbours again for due vocabulary reviews.

English introduces the story and new words. Short object-choice requests invite unaided understanding, with a free English-help button. Independent, spaced recall in multiple contexts gradually hides English on lines tagged with familiar focus words. Mistakes restore support. This is an experimental vocabulary model, not an assessment of overall fluency.

## Japanese chapter: みんなで おにぎり

Meet Aoi by the pond. She first walks you through the hiragana in tonight’s words — large letter cards with romaji under each one — then a simple “which one is ごはん?” check. After that, get rice (ごはん) from Kenji at the rice shop, salmon (さけ) from Yui at the fish stall, and green tea (おちゃ) from Haruto inside the Kaede tea house. Bring the basket to the low table near the rice shop and follow Aoi's instructions. Onigiri and tea appear on the table when the chapter is complete.

Lines are hiragana with spaces between words; loanwords such as テーブル keep their katakana. Romaji is always shown underneath so you can sound everything out, and can be hidden in Help. English fades exactly as in the Spanish world. Neighbours use the polite です / ます form. See `CURRICULUM_ja.md` for the reasoning.

## Accounts and saved progress

Anyone can play immediately as a guest — the welcome screen, The Crossing and both worlds open with no account. What a guest doesn't get is a save: their progress lives in memory for that tab only, and the footer says so plainly (`PLAYING AS A GUEST · NOT SAVED`). Finishing a chapter is the one moment the game asks for an account, because that's the first thing genuinely worth keeping.

Accounts are email and password, with email confirmation on, so a forgotten password can be reset. Sign in from the ✦ Account button in the header or the link on the welcome screen. Signing in on a device you've played on before brings your story with you: progress is stored per player in Postgres and syncs on a short debounce, so the same account picks up where it left off on a phone, a laptop or a fresh browser.

Because a sign-up can't open a session until the email is confirmed, a run in progress would otherwise be lost while the player checks their inbox. The game holds that one run under `linguaquest_pending_save` and adopts it the moment the confirmation link opens a session. It's a handoff for a sign-up already underway, not a guest save, and it's cleared as soon as it's used (or after 24 hours).

When you sign in, the game never blends two stories. If the account has no saves yet it adopts the run you're signing in to keep; if the account already has saves, those win and the guest run is discarded, because silently overwriting real progress from another device is the one mistake there's no undo for. The game tells you which happened.

## Saves

Signed in, the four records — Spanish, Japanese, The Crossing and your shared character, plus the last world you chose — are rows in the `saves` table, one per player per slot, guarded by row-level security policies that compare `auth.uid()` to the row's `user_id`. A player can only ever read or write their own saves.

The save *format* is unchanged: the same JSON `learning.js` always wrote to localStorage is what's stored, and `learning.js` itself was not modified. The game reads and writes through a `storage` object with localStorage's `getItem`/`setItem` shape; accounts simply swap what's behind it (`js/v2/cloud.js`). Only the auth session itself now uses browser localStorage, under `linguaquest_auth`. The earlier `linguaquest_es` save is still untouched.

`legacy.html` preserves the original 2D game, its content, and its old save key.

## Files and scope

- `js/v2/world.js`: the shared Three.js engine: movement, camera, path search, labels and interiors, rebuilt from a themed builder.
- `js/v2/valdeluz.js` and `js/v2/hinata.js`: procedural geometry for the Spanish and Japanese towns and their interiors.
- `js/v2/hub.js`: procedural geometry for The Crossing — a plain neutral plaza with two archways, built as just another themed builder.
- `js/v2/parts.js`: primitive helpers, painted signs (with a kana-capable font stack) and the character.
- `js/v2/app.js`: hub/world flow, dialogue, quest and inventory, editor, speech and saves. All story and interface text comes from the chapter files, the hub included.
- `js/v2/learning.js`: per-language save validation, the shared character record, conservative focus-word learning evidence and the kana conversion. Unchanged by accounts — it only ever needed something with `getItem`/`setItem`.
- `js/v2/cloud.js`: accounts and cloud saves. A guest's store is an in-memory Map that is never written anywhere; a signed-in player's is the same Map, hydrated from Postgres and flushed back on a debounce.
- `js/v2/config.js`: the Supabase project URL and publishable key. The publishable key is meant to be public — row-level security, not secrecy, is what protects saves. Never put a service-role key here.
- `data/es/chapter.json`, `data/ja/chapter.json` and `data/hub.json`: each chapter's dialogue, romaji (Japanese), translations, word references and interface strings — the hub's chapter has no quest, just a guide and two doors.
- `css/town.css`: responsive game interface.
- `vendor/`: Three.js 0.169.0 and `supabase.module.js` — `@supabase/auth-js` and `@supabase/postgrest-js` bundled to one ESM file (realtime, storage and functions excluded) so the game keeps its no-CDN, no-install property. Both MIT; licenses and regeneration steps are alongside.
- `tests/`: learning, save isolation, cloud-store and chapter validation tests. Run `npm test` or `node --test tests/*.test.js` with Node.js.

Each world is one complete starter quest and two small interiors, using eight focus vocabulary entries (three are exercised throughout the main quest). Hinata’s first conversation is a kana onboarding: the letters of those words, then a simple rice check, then dinner. The older 60-item Spanish curriculum remains in the legacy prototype; it is not all integrated into the 3D chapter yet. Additional chapters, rich relationships, broader curricula, speech input and advanced character sculpting are future work. The characters and architecture are procedural stylized geometry, not imported production art.
