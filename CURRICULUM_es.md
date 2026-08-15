# CURRICULUM_es — Spanish v1

Template for the other four languages' curriculum docs. Source of truth for
the actual data is `data/es/vocab.json` and `data/es/dialogue.json` — this
doc explains the pedagogical *ordering and reasoning* behind them.

## Why Spanish first

Spanish is the richest existing browser TTS coverage of the five (clean
`es-ES` voices in most `speechSynthesis` implementations), has the most
cognate overlap with English of the five for fast early wins, and its
grammar (SVO, grammatical gender, regular present-tense conjugation) is
close enough to the other three Romance languages that validating the
Subtitle Fade pedagogy here de-risks templating it onto Italian, French,
and Portuguese later. Japanese is excluded from that template entirely —
see ROADMAP.md.

## Vocabulary — 60 items across 2 themes

Level 1 = introduced through direct context (an NPC uses it while doing
the corresponding action, or an object triggers it). Level 2 = introduced
through combination/extension of Level 1 items, expects the player has
already met the base vocab.

### Theme: Market (`el mercado`) — 30 items

**Level 1 — core nouns & first verbs**
| Spanish | English | Introduced by |
|---|---|---|
| la manzana | the apple | Mamá's request; apple stand object |
| el pan | the bread | Mamá's request; bread stand object |
| la leche | the milk | café theme, reused here for grammar carry-over |
| el queso | the queso | Mamá's request; cheese stand object |
| los huevos | the eggs | market ambient vocab |
| el tomate | the tomato | market ambient vocab |
| la naranja | the orange | market ambient vocab |
| el pescado | the fish | market ambient vocab |
| el arroz | the rice | market ambient vocab |
| la fruta | the fruit | Doña Rosa "fresh and cheap" line |
| la verdura | the vegetable | market ambient vocab |
| el mercado | the market | Mamá sends player here |
| la lista | the list | Mamá hands player the quest item |
| el dinero | the money | Mamá hands player the quest item |
| comprar | to buy | market framing verb |
| buscar | to look for | Doña Rosa's opening line |
| necesitar | to need | Mamá's request |
| tener | to have | Doña Rosa's stock |
| aquí tiene | here you go | Doña Rosa hands over goods |
| gracias / de nada | thank you / you're welcome | universal politeness pair |
| la vendedora | the saleswoman | NPC role noun |
| el puesto | the stall | Doña Rosa's location |
| la bolsa | the bag | goods handoff |
| tres | three | quest item count |

**Level 2 — modifiers & transactional phrases**
| Spanish | English | Introduced by |
|---|---|---|
| encontrar | to find | quest completion framing |
| ¿Cuánto cuesta? | How much does it cost? | fill-in-blank + shop framing |
| barato / caro | cheap / expensive | Doña Rosa's pitch |
| fresco | fresh | repeated across Mamá + Doña Rosa (deliberate reuse for SRS) |

### Theme: Café (`el café`) — 30 items

**Level 1 — core nouns & ordering verbs**
| Spanish | English | Introduced by |
|---|---|---|
| el café / el té / el agua | coffee / tea / water | Diego's opening question |
| el azúcar | the sugar | tea-order branch |
| la taza / la mesa / la silla | cup / table / chair | café ambient vocab |
| el menú | the menu | café framing |
| el camarero | the waiter | Diego's role |
| el pastel | the cake | Diego's upsell |
| querer / tomar / beber | to want / to take-drink / to drink | Diego's opening question |
| con leche | with milk | coffee-order branch |
| por favor / hola / buenos días / adiós / bienvenido | politeness set | greetings, reused from market for retention |
| dos | two | number pair with "tres" from market theme |

**Level 2 — ordering grammar & descriptive language**
| Spanish | English | Introduced by |
|---|---|---|
| pedir | to order/ask for | contrasted with "querer" (want vs. order) |
| traer | to bring | waiter service framing |
| quisiera | I would like | polite conditional register, taught as a fixed phrase before the grammar is named |
| para aquí / para llevar | for here / to go | Diego's second question |
| sin azúcar | without sugar | tea-order branch |
| caliente / frío | hot / cold | temperature adjectives |
| delicioso | delicious | Diego's cake pitch |
| la cuenta | the bill | end-of-transaction vocab |

## Grammar sequencing

Grammar is never front-loaded as a lecture — it's encountered in context
across multiple NPCs first, per the inductive-teaching principle in
`DESIGN.md`. v1's Spanish path surfaces these patterns implicitly (no
"teacher's note" popup is built yet — that's a Phase 2 addition once
there's enough dialogue volume for a pattern to feel earned rather than
arbitrary):

1. **Gendered articles (el/la, los/las)** — present from the very first
   line, never explained. The player absorbs "la manzana" vs. "el pan" by
   repeated pairing with the object, the same way a child does.
2. **Present-tense regular conjugation, 1st/2nd person** — `necesito`,
   `busco`, `quisiera`, `¿puedes?` all appear in the first two
   conversations (Mamá, Doña Rosa) before any minigame tests them.
3. **Direct object placement / simple imperative-adjacent requests** —
   "Necesito manzanas, pan y queso" models listing objects after a verb;
   the fill-in-blank minigame (`fb_4`) retests this exact structure.
4. **Polite conditional as fixed phrase (`quisiera`)** — introduced at
   Diego's café before the player has any explicit conditional-tense
   grammar. This is intentional: `quisiera` is taught as vocabulary
   ("this is how you politely ask for something"), not grammar, matching
   how phrasebooks and immersion classrooms teach it before naming the
   conditional mood.
5. **Contrast pairs taught side by side** — `querer` vs. `pedir` (want vs.
   order), `barato` vs. `caro`, `caliente` vs. `frío`. Placing opposites
   in the same conversation is a comprehensible-input trick: the second
   term's meaning is disambiguated by contrast with the first, no
   translation needed.

## Cultural notes woven into quest writing

- The Mamá → market → home loop mirrors the daily-market shopping habit
  still common across Spain and Latin America, versus a single weekly
  supermarket trip — worth calling out explicitly if a "teacher's note"
  popup system gets built in Phase 2.
- Doña Rosa's price banter ("con tu lista, es gratis para ti hoy") is a
  light nod to market-stall rapport/haggling culture without actually
  requiring the player to negotiate numbers in v1.
- Diego's `para aquí / para llevar` question reflects real café ordering
  norms (dine-in vs. to-go is a standard first question, not an
  Americanism grafted on).

## Extending this curriculum

When adding vocab: pick a **theme**, write the item's introduction context
*before* writing the word (who says it, doing what, why the meaning is
unambiguous from the scene) — don't add a word to `vocab.json` that
doesn't have a planned exposure in `dialogue.json`, `fillblank.json`, or
`world.json`'s `objects[]`. An orphaned vocab entry breaks the "no raw
flashcard deck" promise.
