#!/usr/bin/env node
/**
 * Copy guard. Runs as a PostToolUse hook on Write|Edit.
 *
 * Enforces the mechanical rules in CLAUDE.md and docs/voice.md, the ones a
 * regex can actually decide. Style and voice are not checkable here and stay
 * the writer's job.
 *
 * Exit 0 = clean, exit 2 = violations reported back to Claude for fixing.
 * A file containing the marker "copy-check: ignore" is skipped.
 *
 * To add a banned word: append to BANNED below, and record the reason in
 * docs/voice.md section 2. The list and the guide should never drift apart.
 */

import { readFileSync } from "node:fs";

// Written as escapes so this file never contains the characters it bans.
const EM = String.fromCharCode(0x2014);
const EN = String.fromCharCode(0x2013);

const BANNED = [
  "seamlessly",
  "seamless",
  "effortlessly",
  "effortless",
  "unlock",
  "elevate",
  "leverage",
  "robust",
  "cutting-edge",
  "game-changer",
  "game changer",
  "supercharge",
  "harness",
  "empower",
  "streamline",
  "revolutionise",
  "revolutionize",
  "delve",
  "in today's fast-paced",
  "take it to the next level",
  "say goodbye to",
  "the future of",
];

function readStdin() {
  try {
    return readFileSync(0, "utf8");
  } catch {
    return "";
  }
}

const raw = readStdin();
let payload = {};
try {
  payload = JSON.parse(raw);
} catch {
  process.exit(0); // Not a hook payload we understand. Never block on that.
}

const filePath = payload?.tool_input?.file_path;
if (!filePath) process.exit(0);

const rel = filePath.replace(/\\/g, "/");
const inScope = /\/(src|docs)\//.test(rel) || /\/CLAUDE\.md$/.test(rel);
const checkable = /\.(astro|md|mdx|ts|tsx|js|mjs|json|html|css)$/.test(rel);
if (!inScope || !checkable) process.exit(0);

let text;
try {
  text = readFileSync(filePath, "utf8");
} catch {
  process.exit(0); // File moved or deleted. Not our problem to report.
}

if (text.includes("copy-check: ignore")) process.exit(0);

const problems = [];
const lines = text.split(/\r?\n/);

lines.forEach((line, i) => {
  const n = i + 1;

  if (line.includes(EM)) {
    problems.push(`${n}: em dash. Use a comma, a colon, or two sentences.\n    ${line.trim()}`);
  }
  if (line.includes(EN)) {
    problems.push(`${n}: en dash. Use "to" for ranges, or a plain hyphen.\n    ${line.trim()}`);
  }

  for (const word of BANNED) {
    // Word-boundary match for single words, plain substring for phrases.
    const pattern = /\s/.test(word)
      ? new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
      : new RegExp(`\\b${word}\\b`, "i");
    if (pattern.test(line)) {
      problems.push(`${n}: banned word "${word}". See docs/voice.md section 2.\n    ${line.trim()}`);
    }
  }
});

if (problems.length === 0) process.exit(0);

process.stderr.write(
  `Copy guard blocked ${rel}\n\n` +
    problems.map((p) => `  ${p}`).join("\n") +
    `\n\nFix these in the file now. Do not disable the hook, and do not ` +
    `substitute a different banned word. Rules live in CLAUDE.md and ` +
    `docs/voice.md.\n`
);
process.exit(2);
