# CURRICULUM_ja — Japanese starter chapter (Hinata)

Source of truth for the content is `data/ja/chapter.json`. This document explains the pedagogical choices behind it. Nothing here is translated from the Spanish chapter; Hinata shares only the engine, the quest shape and the learning model.

## Script policy

- Lines are written in **hiragana with spaces between words** (分かち書き), the convention of beginner kana-only readers. Loanwords such as テーブル keep their native **katakana** so the learner meets both scripts naturally.
- **Romaji (Hepburn, with macrons) is always shown** under every line, choice and illustration, so nothing depends on being able to read kana yet. It can be hidden from the Help panel once reading feels comfortable.
- A **hiragana / katakana toggle** (the あ / ア button in conversations, or the Help panel) converts the whole line to katakana as a reading drill. Conversion is a fixed code-point offset in `learning.js`, so it never alters romaji, punctuation or English.
- **No kanji** in this chapter. A content test enforces this.
- **English is what fades.** Exactly as in Valdeluz, English support disappears only for lines whose tagged focus words have three spaced, independent recalls in at least two contexts. Romaji is a reading aid, not a translation, so it does not count as help and never marks an attempt as assisted.

## Register and grammar exposure

Neighbours speak in the polite **です / ます** form, which is the standard beginner register and safe to reuse with strangers. The player’s replies are short and polite too (ありがとうございます, いってきます, いただきます).

Grammar is met through use, not explanation: the topic marker は, the object marker を, direction に / へ, the connector と, the request forms **〜てください** and **〜てくれますか**, existence with **あります / います**, and SOV word order in every sentence. No grammar mastery is tracked yet.

Names take **さん** (けんじさん), including the player’s own name in the status line, so honorifics are modelled from the first minute.

## Vocabulary — 8 focus entries

| Kana | Romaji | English | Role |
|---|---|---|---|
| こんにちは | konnichiwa | hello | greeting, tagged in intro and shop greetings |
| テーブル | tēburu | table | quest destination; the one katakana loanword |
| ごはん | gohan | rice | quest item 1 (rice shop, けんじ) |
| さけ | sake | salmon | quest item 2 (fish stall, ゆい) |
| おちゃ | ocha | green tea | quest item 3 (tea house, はると) |
| みず | mizu | water | pond line and review distractor |
| りんご | ringo | apple | visual distractor |
| たまご | tamago | egg | visual distractor |

ごはん means both cooked rice and a meal; the chapter uses it only for rice to keep the first meaning stable. さけ is written in kana and taught with a salmon picture, so the homograph with 酒 does not arise in this build.

## Culture

The story is a welcome dinner where everyone makes onigiri together. It introduces いらっしゃいませ at the shop door, tea served with rice, the phrase いただきます before eating, and a small town with a pond, stone lanterns, a torii on the east path and a tea house with a noren.

## Kana onboarding

Players who cannot yet read hiragana meet the letters *before* the dinner task. Aoi’s first conversation walks through tonight’s focus words as large glyph cards with **romaji under every letter**, then one simple check: pick ごはん from ごはん / さけ / みず (still with romaji). Only after that does the existing dinner intro start. Romaji is forced on for this lesson. The letters taught are exactly the ones in the eight focus entries — not the full 46-kana chart.

こんにちは is shown as こ・ん・に・ち・は, with は labelled *wa*. おちゃ treats ちゃ as one mora. テーブル is named as katakana so the loanword at the table is not a surprise.

## Backlog for later chapters

Counters, a katakana-heavy shopping scene (コンビニ), particles に and で contrasted in directions, and casual speech with a friend once the polite forms are familiar.
