#!/usr/bin/env node

/**
 * scripts/learn-log.js — Harness-agnostic lesson log manager.
 *
 * Can be called by ANY agent harness (Claude Code, Pi, OpenCode, Codex, Aider,
 * or humans in a shell) to link/unlink and append to Obsidian lesson logs.
 *
 * Synchronizes state with `.opencode/.learn-log.json` and `.learn-log.json`.
 *
 * Usage:
 *   node scripts/learn-log.js link <path-to-existing-md>
 *   node scripts/learn-log.js unlink
 *   node scripts/learn-log.js status
 *   node scripts/learn-log.js append "<markdown-block>"
 */

import { existsSync, readFileSync, writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const STATE_FILE_PATHS = [
  join(PROJECT_ROOT, ".learn-log.json"),
  join(PROJECT_ROOT, ".opencode", ".learn-log.json"),
];

function getLinkedFile() {
  for (const p of STATE_FILE_PATHS) {
    if (existsSync(p)) {
      try {
        const raw = readFileSync(p, "utf8");
        const data = JSON.parse(raw);
        if (data && typeof data.file === "string") {
          return data.file;
        }
      } catch {}
    }
  }
  return null;
}

function setLinkedFile(filepath) {
  for (const p of STATE_FILE_PATHS) {
    try {
      if (filepath === null) {
        if (existsSync(p)) unlinkSync(p);
      } else {
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, JSON.stringify({ file: filepath }, null, 2), "utf8");
      }
    } catch (e) {
      // ignore individual directory failures
    }
  }
}

function resolveInProject(fp) {
  return fp.startsWith("/") ? fp : resolve(PROJECT_ROOT, fp);
}

function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    console.log(`Usage:
  node scripts/learn-log.js link <existing-file.md>
  node scripts/learn-log.js unlink
  node scripts/learn-log.js status
  node scripts/learn-log.js append "<markdown-callout-block>"
`);
    process.exit(0);
  }

  if (command === "status") {
    const linked = getLinkedFile();
    if (linked) {
      console.log(`Lesson log linked: ${linked}`);
    } else {
      console.log(`No lesson log linked.`);
    }
    return;
  }

  if (command === "link") {
    const rawPath = args[1];
    if (!rawPath) {
      console.error("Error: Please provide a filepath to link.");
      process.exit(1);
    }
    const fullPath = resolveInProject(rawPath);
    if (!existsSync(fullPath)) {
      console.error(`Error: File does not exist at "${fullPath}". Create it first before linking.`);
      process.exit(1);
    }
    setLinkedFile(fullPath);
    console.log(`Linked lesson log: ${fullPath}`);
    return;
  }

  if (command === "unlink") {
    const prev = getLinkedFile();
    setLinkedFile(null);
    if (prev) {
      console.log(`Unlinked lesson log: ${prev}. Teaching continues without logging.`);
    } else {
      console.log(`No lesson log was linked.`);
    }
    return;
  }

  if (command === "append") {
    let text = args[1];
    if (text === undefined) {
      // Check stdin if not in args
      text = readFileSync(0, "utf8");
    }
    if (!text || !text.trim()) {
      console.error("Error: Nothing to append.");
      process.exit(1);
    }

    const linked = getLinkedFile();
    if (!linked) {
      console.error("Error: No lesson log linked. Link one first with `link <path>`.");
      process.exit(1);
    }
    if (!existsSync(linked)) {
      console.error(`Error: Linked file "${linked}" no longer exists.`);
      process.exit(1);
    }

    const current = readFileSync(linked, "utf8");
    const prefix = current.length > 0 && !current.endsWith("\n\n")
      ? (current.endsWith("\n") ? "\n" : "\n\n")
      : "";
    writeFileSync(linked, current + prefix + text.trim() + "\n", "utf8");
    console.log(`Appended ${text.length} chars to lesson log: ${linked}`);
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

main();
