// Leonida Legend — a gta6-trophy-guide-01 entry (Node 22, standard library only).
//
// The guide itself is this directory's app/ folder: plain static files a browser
// opens at app/index.html (ES modules, CSS, one JSON data file, no build step),
// fully offline — it loads nothing over the network, and its trophy list, guides,
// roadmap and missable flags all live in app/data/trophies.json and the app code.
//
// This program hands the guide in: it copies app/ and screenshots/ from beside
// this file to /output and writes /output/dossier.json, the summary the judge
// reads (the screenshots, the first load's files and bytes, and the source),
// using the vendored make.fun library. Leave vendor/makefun-frontend.ts as it
// is: the scorer requires dossier.json to be byte for byte what its own copy
// writes from the same app/ and screenshots/.
//
// Serve the guide locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// Authored for this entry: the guide's identity, kept beside the hand-in code
// so the program that submits "Leonida Legend" says so in its own source.
const ENTRY_TITLE = 'Leonida Legend — GTA VI Trophy Guide & Tracker';
const EXPECTED_TROPHY_COUNT = 55;
const EXPECTED_GRADE_MIX = '1 platinum, 2 gold, 6 silver, 46 bronze';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in app/
// or 48 MiB of app files — app/ counts beside /output's own 1000-entry cap,
// its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);

console.log(`${ENTRY_TITLE}: handed in the guide for ${EXPECTED_TROPHY_COUNT} trophies (${EXPECTED_GRADE_MIX}) to ${out}`);
