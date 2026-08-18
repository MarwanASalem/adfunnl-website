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

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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

const CHECKABLE = /\.(astro|md|mdx|ts|tsx|js|mjs|json|html|css)$/;

function inScope(rel) {
  return /\/(src|docs)\//.test(rel) || /\/CLAUDE\.md$/.test(rel);
}

// `--all` sweeps every copy file in the repo, for the times the per-edit hook
// is not enough: `npm run copy:check`. The hook only sees files it was called
// on, so a rule added today never gets applied to yesterday's pages otherwise.
function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry === ".git") continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (CHECKABLE.test(p)) out.push(p);
  }
  return out;
}

let targets = [];

if (process.argv.includes("--all")) {
  targets = walk(process.cwd()).filter((p) => inScope(p.replace(/\\/g, "/")));
} else {
  let payload = {};
  try {
    payload = JSON.parse(readStdin());
  } catch {
    process.exit(0); // Not a hook payload we understand. Never block on that.
  }
  const filePath = payload?.tool_input?.file_path;
  if (!filePath) process.exit(0);
  const rel = filePath.replace(/\\/g, "/");
  if (!inScope(rel) || !CHECKABLE.test(rel)) process.exit(0);
  targets = [filePath];
}

const problems = [];

for (const target of targets) {
  let text;
  try {
    text = readFileSync(target, "utf8");
  } catch {
    continue; // File moved or deleted. Not our problem to report.
  }
  if (text.includes("copy-check: ignore")) continue;

  const label = targets.length > 1 ? target.replace(process.cwd(), "").replace(/\\/g, "/").replace(/^\//, "") + ":" : "";
  checkText(text, label);
}

function checkText(text, label) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const n = `${label}${i + 1}`;

  if (line.includes(EM)) {
    problems.push(`${n}: em dash. Use a comma, a colon, or two sentences.\n    ${line.trim()}`);
  }
  if (line.includes(EN)) {
    problems.push(`${n}: en dash. Use "to" for ranges, or a plain hyphen.\n    ${line.trim()}`);
  }

  // The bare term is only ever correct with "media" in front of it, spaced or
  // hyphenated. Two known limits: this is line-based, so wrapping the term
  // across two lines trips it (keep the term on one line), and prose that needs
  // to quote the bare form has to paraphrase instead.
  for (const m of line.matchAll(/\bbuyers?\b/gi)) {
    const before = line.slice(0, m.index).toLowerCase();
    if (!/\bmedia[\s-]+$/.test(before)) {
      problems.push(`${n}: "${m[0]}" without "media". The audience is media buyers.\n    ${line.trim()}`);
    }
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
}

if (problems.length === 0) {
  if (targets.length > 1) console.log(`Copy guard: ${targets.length} files clean.`);
  process.exit(0);
}

process.stderr.write(
  `Copy guard blocked ${targets.length > 1 ? `${problems.length} issue(s)` : targets[0]}\n\n` +
    problems.map((p) => `  ${p}`).join("\n") +
    `\n\nFix these in the file now. Do not disable the hook, and do not ` +
    `substitute a different banned word. Rules live in CLAUDE.md and ` +
    `docs/voice.md.\n`
);
process.exit(2);
