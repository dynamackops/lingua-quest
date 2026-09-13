# Lingua Quest — 3D direction

## Agreed experience

Cozy, freely explorable third-person 3D worlds: Valdeluz, inspired by Spain, and Hinata, inspired by a small Japanese town. Begin either language as a beginner. Create one character — shared everywhere you go — and edit it later. The worlds share the engine, interface and quest shape but never share a save, quest progress or curriculum; only the character (name, look, wardrobe) is common between them.

## The Crossing: hub and doors

The welcome screen no longer offers a card per language. Instead, "Create your character" / "Continue your story" both lead into **The Crossing**, a small, deliberately plain plaza (`js/v2/hub.js`) — no language flavor, so it doesn't pre-bias the choice. A guide NPC there (role `guide`, distinct from a chapter's `host`) gives a short one-time welcome the first time you talk to her, then a brief reminder on any later visit. Two archways lead out: walking up to one and confirming (the same one-line-then-choose pattern as an existing home/cafe door) calls `enterWorld(code)`, which is just `selectWorld(code)` — the exact function the old welcome-screen cards used to call — followed by `start()`. Nothing about *entering* a language world changed; only *how you get there* did. The brand logo in the header now means "go up one level": from a language world it returns to the hub (`returnToHub()`), and only from the hub itself does it fully exit to the welcome screen (`leave()`).

The hub is implemented as its own minimal chapter (`data/hub.json`, `language:'en'`) satisfying the same schema every real chapter does — same `ui`/`people`/`lines` shape, `quest.items` just empty — so `app.js`'s dialogue/interact machinery needs almost no hub-specific branching. The two exceptions: `updateHud()`/`start()` check `chapter.questSteps` before touching quest-HUD elements (the hub has none, so quest-hud stays hidden there), and `showLine()`'s "helped" calculation checks `L!=='en'` so a chapter whose target language *is* English never shows a redundant duplicate "translation" of itself.

Aya's one-time welcome (six lines) covers the whole basic loop before you ever pick a door: no forced translations once you're in a world, movement (WASD/click/drag/scroll/E), the journal (J) and wardrobe, and that coins can be earned and spent at a shop. Any later visit gets a short one-line reminder instead (`guideRepeat`).

## Coins and the wardrobe shop

Every language world tracks two numbers: `state.xp`, a pure non-spendable progress metric, and `state.coins`, a per-world spendable currency (`js/v2/learning.js`'s `freshState`/`loadState`, validated the same way `xp` is). Coins are awarded alongside XP at every existing quest milestone — meeting the host, collecting an item, and finishing the chapter — plus a smaller amount for a correct in-conversation answer, so a full playthrough earns more than replaying comprehension checks. Each chapter names its own currency in `ui.coinName` (`monedas`, `えん`, generic `coins` in the hub) for display in the journal and shop.

Valdeluz's plaza has one shopkeeper, Marta (`role:'shopkeeper'` in `data/es/chapter.json`, placed like any other NPC in `js/v2/valdeluz.js`), who sells hat cosmetics named in Spanish (`chapter.shop.items`: la boina, la corona de flores, el sombrero) at set coin prices. Talking to her opens a sheet (`shop()` in `js/v2/app.js`) listing each hat with a *Buy · price* button if unowned, or *Wear*/*Worn* once it's been bought — buying never re-charges a hat you already own. Hat ownership (`character.hats`, an id list starting at `['none']`) and the currently worn hat (`character.hat`) live on the *shared* character record, so a hat bought in Valdeluz shows up in Hinata's wardrobe too, exactly like the rest of the shared look — while the coins spent on it are deducted only from that world's own `state.coins`. Hats render in `js/v2/parts.js`'s `makeAvatar()` as a small set of named options (`beret`, `flowercrown`, `sombrero`, plus `none`); the character-editor wardrobe (`js/v2/app.js`'s `openCreator`) only ever lists hats the shared character actually owns.

Hinata templates the exact same loop: Sora (`role:'shopkeeper'`) sells the same three hats named in kana (`ベレーぼうし`, `はなの かんむり`, `ソンブレロ`) for `えん`. Nothing in `shop()` or the shopkeeper branch of `interact()` is Spanish-specific — any chapter with a `shopkeeper` person and a `shop` block gets the same sheet, buy/wear buttons and shared-wardrobe writeback for free.

## Earning coins outside the main quest

Coins shouldn't only come from a one-time playthrough. Each town's fountain (Valdeluz) or pond (Hinata) doubles as a small, repeatable vocabulary check for whichever item is placed there (`agua`/`mizu`) — `fountainActivity()` in `js/v2/app.js` reuses the same spaced-repetition `due()` gate as neighbour reviews, so it's available immediately the first time (a word becomes "due" the moment it's exposed) but then only again once that word's own review interval comes up (1 minute, 10 minutes, 1 day, 3 days, 7 days…). A correct answer runs through the same `check()` path as any other vocabulary check, so it earns the same modest credited coin bonus — naturally rate-limited by the SRS timing rather than by any special-cased economy rule, so it can't be farmed back to back, but is always there as *something* to do for coins between quest milestones. Talking to any neighbour a second time after their item is already collected does the same thing (`pickup()` falls through to `review()`), so this is really one repeatable-earning mechanism reused at every landmark and NPC, not a separate system bolted onto the fountain alone.

## The hub as a circle, with entrances that mirror

The Crossing's two archways now sit on opposite sides of its circular plaza (west for Valdeluz, east for Hinata) instead of side by side — reads more like paths radiating outward from a real crossing, and leaves room on the ring for more doors later. `archway()` (the pillars-lintel-sign structure) moved from `hub.js` into `parts.js` so it's a shared primitive: both Valdeluz and Hinata build one of their own, in the hub's same neutral colour and "THE CROSSING" label, near the edge of their own plaza. Walking up to it and confirming (`door_hub` → `leaveToHub()`, the mirror image of `enterWorld()`) is a second, diegetic way back to the hub alongside the header's ↩ button — so leaving a world never depends on noticing a UI element, the way arriving in one doesn't either.

## Playable slice

Valdeluz is a small sunlit square with cream plaster houses, terracotta roofs, a bakery, market, café and player home. Movement is camera-relative, supports keyboard and click-to-walk, and respects building and outdoor furniture collision bounds. Labels and the journal offer walk-to destinations, using a bounded grid path search. The camera orbits and follows the visible animated player. Building bodies limit camera placement to reduce clipping.

Home and café have separate small interiors. The character editor offers name, six skin colours, six hair styles, hair and shirt colours, body width, eye colour, glasses and scarf, plus any hat already bought at a shop. Saving an edit rebuilds the character while preserving quest state and position.

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

## Voice: premium clips over browser TTS, without shipping a secret

The game is a static site with no backend, so an ElevenLabs API key can never be embedded in the shipped JS without becoming effectively public (readable in dev tools, billable to whoever finds it). Since every spoken line already lives in fixed chapter JSON rather than being generated live, the fix is pre-generation rather than a live proxy: `scripts/generate-tts.mjs` walks a chapter with the same "any value under the key matching `chapter.language`" rule the content tests use, hashes each unique line's text, and calls ElevenLabs once per line to save an `.mp3` under `audio/<lang>/` plus an entry in `audio/manifest.json` (`{lang: {text: hash}}`). The API key only ever exists on the machine running that script, for the duration of the run — never in the repo, the client bundle, or a live server. Re-running is incremental: a line already cached under its hash is skipped, so adding one new line to a chapter costs one new request, not a full regeneration.

At runtime, `app.js`'s `speak(text)` looks up `ttsManifest[lang][text]` first; if a clip exists it plays that `Audio` element, otherwise it falls back to the exact `speechSynthesis` path that existed before. The manifest is fetched once in `init()`, wrapped in its own try/catch outside the main one — a missing `audio/manifest.json` (nobody has run the script yet, or a specific line's clip was never generated) is an expected, silent case, not a fatal error. `stopVoice()` now also pauses and drops any playing premium clip alongside its existing `speechSynthesis.cancel()`, so switching lines never overlaps audio. Nothing about this is Spanish/Japanese-specific — any future chapter gets premium voice for free the moment someone runs the script against it with a key.

## Placeholder doors: a plaza with visible room to grow

Two more archways at The Crossing — ITALIA and FRANCE — sit in the ring's back quadrants, painted a muted grey rather than a language's own colour to read as "not open yet" without needing separate UI. They're built with the exact same shared `archway()` helper as the real doors, just registered under `door_it`/`door_fr` entity ids. `interact()`'s switch routes those ids to a small `comingSoon(name)` helper instead of `enterWorld()` — it shows one line (`hub.json`'s `lines.comingSoon`, with `{lang}` filled in) and returns to the hub with nothing else changed, rather than touching `chapters{}`/`selectWorld()` at all. Adding a real language later is exactly the work of the four-phase plan the first two doors went through, not a rework of these — the placeholder is functionally inert on purpose.

## Accounts: progress is the reason to have one

Guests play the whole game; what they don't get is a save. That is a deliberate product line rather than a technical limit — an account has to be worth making, and "your town is still here tomorrow" is the honest version of that. So the prompt appears once, after a chapter is finished, when the player has something they'd mind losing. Nothing gates The Crossing or either world.

The implementation leans on a seam that already existed. `learning.js` never touched `localStorage` directly: every save goes through a `storage` argument with `getItem`/`setItem`. `js/v2/cloud.js` supplies a different object behind that seam and nothing else changes — not the save format, not the per-language validation, not the tests that pin them. A guest's store is an in-memory `Map` that is never written anywhere, which is what "guests don't get saves" means literally. A signed-in player's store is the same `Map`, hydrated from Postgres on sign-in and flushed back on a 1.2s debounce plus a `keepalive` write on tab close. Keeping the `Map` as the working copy is what lets the synchronous `getItem`/`setItem` contract survive an asynchronous backend.

Two rules protect real progress. Signing in adopts exactly one story, never a blend: an account with no saves takes the guest run the player is signing in to keep, while an account that already has saves wins outright and the guest run is discarded, because overwriting progress made on another device is the one unrecoverable mistake available here. And `leave()` grew a `save=false` path used only after that second case, since its usual closing `persist()` would otherwise write the abandoned guest run straight over the story just loaded.

Email confirmation is on, so that a forgotten password can be reset — but it means `signUp()` returns a user and no session, and the run the player just finished would evaporate while they check their inbox. `linguaquest_pending_save` carries that single run across the gap and is consumed the moment a session opens. It is scoped to a sign-up already in progress and expires after a day; it is not a back door to guest saves.

Row-level security, not the key in `config.js`, is what protects saves: the publishable key is meant to be public, and every policy compares `auth.uid()` to the row's `user_id`. Verified by acting as two separate users against the live policies — each sees only their own row, and an insert on another player's behalf is rejected.

Supabase being unreachable is a playable state, not an error. Auth resolution is awaited during boot but bounded, and a blocked-network run boots in about 1.3 seconds straight to a guest session with no console errors.

The original design is retained in DESIGN_2D.md for history. README.md describes the actual current scope.
