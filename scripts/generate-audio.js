#!/usr/bin/env node
/**
 * Regenerates all word audio files using Azure Cognitive Services TTS.
 * Voice: sw-KE-ZuriNeural (Kenyan Swahili, neural quality)
 *
 * Usage:
 *   AZURE_SPEECH_KEY=<key> AZURE_SPEECH_REGION=<region> node scripts/generate-audio.js
 *
 * Optional: regenerate only specific files:
 *   ... node scripts/generate-audio.js w001 w010 w050
 *
 * Azure free tier: 500,000 chars/month free (Neural voices).
 * All 400 words total ~3,000 chars — well within the free tier.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

if (!SPEECH_KEY || !SPEECH_REGION) {
  console.error('Error: Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION environment variables.');
  console.error('  export AZURE_SPEECH_KEY="your-key"');
  console.error('  export AZURE_SPEECH_REGION="eastus"  # or your region');
  process.exit(1);
}

const AUDIO_DIR = path.join(__dirname, '..', 'assets', 'audio');
const VOICE = 'sw-KE-ZuriNeural';
// Slightly slower rate helps learners; 0 = normal speed
const RATE = '-5%';

// ── Word list extracted from all unit files ────────────────────────────────
// Each entry: { file: 'w001.mp3', word: 'Habari' }
const WORDS = [];

const unitDir = path.join(__dirname, '..', 'src', 'content', 'words');
const unitFiles = fs.readdirSync(unitDir).filter(f => f.endsWith('.ts'));

for (const unitFile of unitFiles) {
  const content = fs.readFileSync(path.join(unitDir, unitFile), 'utf8');
  const matches = [...content.matchAll(/swahili:\s*'([^']+)'.*?audio_file:\s*'([^']+)'/gs)];
  for (const [, word, audioFile] of matches) {
    WORDS.push({ file: audioFile, word });
  }
}

WORDS.sort((a, b) => a.file.localeCompare(b.file));
console.log(`Found ${WORDS.length} words to process.`);

// ── Filter to specific files if args given ────────────────────────────────
const filter = process.argv.slice(2).map(a => (a.endsWith('.mp3') ? a : `${a}.mp3`));
const targets = filter.length > 0 ? WORDS.filter(w => filter.includes(w.file)) : WORDS;
console.log(`Generating ${targets.length} file(s)...\n`);

// ── Azure TTS request ──────────────────────────────────────────────────────
function buildSSML(word) {
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="sw-KE">
  <voice name="${VOICE}">
    <prosody rate="${RATE}">${escapeXml(word)}</prosody>
  </voice>
</speak>`;
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function synthesize(word) {
  return new Promise((resolve, reject) => {
    const ssml = buildSSML(word);
    const options = {
      hostname: `${SPEECH_REGION}.tts.speech.microsoft.com`,
      path: '/cognitiveservices/v1',
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': SPEECH_KEY,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-48khz-192kbitrate-mono-mp3',
        'User-Agent': 'swahili-learn-tts',
      },
    };

    const chunks = [];
    const req = https.request(options, res => {
      if (res.statusCode !== 200) {
        let body = '';
        res.on('data', d => (body += d));
        res.on('end', () => reject(new Error(`HTTP ${res.statusCode}: ${body}`)));
        return;
      }
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.write(ssml);
    req.end();
  });
}

// ── Main loop (sequential to avoid rate limits) ───────────────────────────
async function main() {
  let ok = 0;
  let failed = 0;

  for (const { file, word } of targets) {
    const outPath = path.join(AUDIO_DIR, file);
    process.stdout.write(`  ${file}  "${word}" ... `);
    try {
      const audio = await synthesize(word);
      fs.writeFileSync(outPath, audio);
      console.log(`OK (${audio.length} bytes)`);
      ok++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }
    // Small delay to be polite to the API
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\nDone: ${ok} succeeded, ${failed} failed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
