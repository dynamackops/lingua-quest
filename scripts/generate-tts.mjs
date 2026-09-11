#!/usr/bin/env node
// Pre-generates premium ElevenLabs speech for every dialogue line in a chapter, so
// the game can play a static audio clip instead of the browser's speechSynthesis
// voice. This is a one-time (or occasional) local build step, not something the
// game calls at runtime: the API key only ever lives on your machine while this
// script runs, never in the repo, the shipped JS, or a live server.
//
// Usage:
//   ELEVENLABS_API_KEY=sk_... node scripts/generate-tts.mjs        # both languages
//   ELEVENLABS_API_KEY=sk_... node scripts/generate-tts.mjs es     # just Spanish
//
// Optional:
//   ELEVENLABS_VOICE_ES=<voiceId>   # defaults below; pick your own from elevenlabs.io
//   ELEVENLABS_VOICE_JA=<voiceId>
//   DRY_RUN=1                       # print what would be generated (and its total
//                                   # character count, ElevenLabs' billing unit)
//                                   # without calling the API or spending anything
//
// Re-running is cheap and safe: each line is cached by a hash of its text under
// audio/<lang>/, so only new or changed lines are ever sent to the API again.
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const apiKey = process.env.ELEVENLABS_API_KEY;
const dryRun = process.env.DRY_RUN === '1';
if (!apiKey && !dryRun) {
  console.error('Set ELEVENLABS_API_KEY (or DRY_RUN=1 to preview without one) before running this script.');
  process.exit(1);
}

// Pick premium multilingual voices you like from https://elevenlabs.io/app/voice-library
// and override these via env vars — these defaults are just ElevenLabs' stock voices.
const VOICES = {
  es: process.env.ELEVENLABS_VOICE_ES || '21m00Tcm4TlvDq8ikWAM',
  ja: process.env.ELEVENLABS_VOICE_JA || '21m00Tcm4TlvDq8ikWAM',
};
const MODEL_ID = 'eleven_multilingual_v2';

// Every chapter line ever spoken is a value stored under the key matching that
// chapter's own language code (chapter.language) — the same shape the content
// tests already validate, so this walk is exactly "every line the game can speak".
function collectLines(chapter) {
  const lang = chapter.language, lines = new Set();
  const visit = v => {
    if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') {
      if (typeof v[lang] === 'string' && v[lang].trim()) lines.add(v[lang]);
      Object.values(v).forEach(visit);
    }
  };
  visit(chapter);
  return [...lines];
}

const hashFor = text => crypto.createHash('sha1').update(text).digest('hex').slice(0, 16);
const exists = async p => fs.access(p).then(() => true, () => false);

async function synth(text, voiceId) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', accept: 'audio/mpeg' },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: { stability: 0.4, similarity_boost: 0.75 } }),
  });
  if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

async function run(langs) {
  const manifestPath = path.join(root, 'audio', 'manifest.json');
  let manifest = {};
  try { manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8')); } catch {}

  for (const lang of langs) {
    const chapter = JSON.parse(await fs.readFile(path.join(root, 'data', lang, 'chapter.json'), 'utf8'));
    const lines = collectLines(chapter);
    const outDir = path.join(root, 'audio', lang);
    if (!dryRun) await fs.mkdir(outDir, { recursive: true });
    manifest[lang] ||= {};

    let generated = 0, skipped = 0, chars = 0;
    for (const text of lines) {
      const id = hashFor(text);
      const file = path.join(outDir, `${id}.mp3`);
      if (!dryRun && (await exists(file))) { manifest[lang][text] = id; skipped++; continue; }
      chars += text.length;
      if (dryRun) { console.log(`[${lang}] would generate (${text.length} chars): ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`); continue; }
      console.log(`[${lang}] generating: ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`);
      const audio = await synth(text, VOICES[lang]);
      await fs.writeFile(file, audio);
      manifest[lang][text] = id;
      generated++;
      await new Promise(r => setTimeout(r, 350)); // be polite to the API
    }
    if (dryRun) console.log(`[${lang}] dry run — ${lines.length} lines, ${chars} characters would be billed.`);
    else console.log(`[${lang}] done — ${generated} generated, ${skipped} already cached (${lines.length} total lines).`);
  }
  if (!dryRun) await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 1));
}

const requested = process.argv.slice(2).filter(a => ['es', 'ja'].includes(a));
run(requested.length ? requested : ['es', 'ja']).catch(e => { console.error(e); process.exit(1); });
