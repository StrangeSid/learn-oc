/**
 * viz-common — shared helpers for the learning-oc visual tools.
 *
 * Port of pi learn `extensions/visual-tools/tools/_common.ts` to opencode
 * custom tools. Key adaptation: no module-level session state (opencode loads
 * tools once per process for all sessions). Staging is derived per call from
 * `sessionID` in tool context, so parallel makers never share a source file.
 *
 * Transient previews live under os.tmpdir()/opencode-visual-tools (NOT the
 * vault). Only PUBLISHED PNGs land in <project>/viz (inside the Obsidian
 * vault) with unique `viz-<slug>-<timestamp>.png` names.
 */

import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";

// rsvg-convert lives under MacPorts (/opt/local/bin); magick under
// /usr/local/bin; Homebrew under /opt/homebrew/bin. Augment PATH so the child
// process (which may have inherited a thin PATH) still resolves them.
export const EXTRA_PATH = ["/opt/local/bin", "/usr/local/bin", "/opt/homebrew/bin"];

export const STAGING_ROOT = join(tmpdir(), "opencode-visual-tools");
export const FILES_DIRNAME = "viz";

export const CHROME_CANDIDATES = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
];

export function findChrome(): string | undefined {
  for (const c of CHROME_CANDIDATES) if (existsSync(c)) return c;
  return undefined;
}

export interface RunResult {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

export function run(
  cmd: string,
  args: string[],
  opts: { cwd: string; timeoutMs: number; env?: Record<string, string> },
): Promise<RunResult> {
  return new Promise((resolveRun) => {
    const augmentedPath = [...EXTRA_PATH, process.env.PATH ?? ""].join(":");
    const child = spawn(cmd, args, {
      cwd: opts.cwd,
      env: { ...process.env, ...(opts.env ?? {}), PATH: augmentedPath },
    });
    let stdout = "";
    let stderr = "";
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      child.kill("SIGKILL");
    }, opts.timeoutMs);
    child.stdout.on("data", (d) => (stdout += d.toString()));
    child.stderr.on("data", (d) => (stderr += d.toString()));
    child.on("error", (err) => {
      clearTimeout(timer);
      resolveRun({ code: null, stdout, stderr: stderr + String(err), timedOut });
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      resolveRun({ code, stdout, stderr, timedOut });
    });
  });
}

/** Sanitize session / group into a safe directory segment. */
export function safeSegment(s: string): string {
  return s.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 64) || "session";
}

/** Per-call staging dir under the OS temp dir, keyed by group + session. */
export function sessionDir(group: string, sessionID?: string): string {
  const seg = safeSegment(sessionID || `pid-${process.pid}`);
  return join(STAGING_ROOT, `${group}-${seg}`);
}

export interface Session {
  workDir: string;
  bodyPath: string;
}

/** Write the full source to the session's managed file, creating dirs. */
export function writeBody(
  group: string,
  bodyFileName: string,
  source: string,
  sessionID?: string,
): Session {
  const workDir = sessionDir(group, sessionID);
  mkdirSync(workDir, { recursive: true });
  const bodyPath = join(workDir, bodyFileName);
  writeFileSync(bodyPath, source, "utf8");
  return { workDir, bodyPath };
}

/** Resolve the session's managed file without writing. */
export function sessionFile(
  group: string,
  bodyFileName: string,
  sessionID?: string,
): Session {
  const workDir = sessionDir(group, sessionID);
  return { workDir, bodyPath: join(workDir, bodyFileName) };
}

/**
 * Exact-match single replacement, matching pi-edit semantics:
 * old_text must appear exactly once. Returns updated content + match offset,
 * or throws a precise error.
 */
export function applyEdit(
  current: string,
  oldText: string,
  newText: string,
): { updated: string; index: number } {
  if (oldText === "") throw new Error("`old_text` must be non-empty.");
  if (oldText === newText) throw new Error("`old_text` and `new_text` are identical.");
  const first = current.indexOf(oldText);
  if (first === -1) {
    throw new Error("`old_text` not found in the current source — match it exactly.");
  }
  const second = current.indexOf(oldText, first + 1);
  if (second !== -1) {
    let n = 0;
    let i = current.indexOf(oldText);
    while (i !== -1) {
      n++;
      i = current.indexOf(oldText, i + oldText.length);
    }
    throw new Error(
      `\`old_text\` appears ${n} times — add surrounding context to make it unique.`,
    );
  }
  const updated = current.slice(0, first) + newText + current.slice(first + oldText.length);
  return { updated, index: first };
}

/** A small numbered window of `content` around char offset `index`. */
export function snippetAround(content: string, index: number, contextLines = 3): string {
  const before = content.slice(0, index);
  const hitLine = before.split("\n").length - 1;
  const lines = content.split("\n");
  const start = Math.max(0, hitLine - contextLines);
  const end = Math.min(lines.length - 1, hitLine + contextLines);
  const width = String(end + 1).length;
  const out: string[] = [];
  for (let i = start; i <= end; i++) out.push(`${String(i + 1).padStart(width)}  ${lines[i]}`);
  return out.join("\n");
}

/** Copy a rendered PNG into <projectDir>/viz with a unique, slugified name. */
export function publish(
  pngPath: string,
  slug: string,
  projectDir: string,
): { filename: string; path: string } {
  const filesDir = join(projectDir, FILES_DIRNAME);
  mkdirSync(filesDir, { recursive: true });
  const clean =
    slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "viz";
  const filename = `viz-${clean}-${Date.now()}.png`;
  const dest = join(filesDir, filename);
  copyFileSync(pngPath, dest);
  return { filename, path: dest };
}

export { basename, dirname, join, existsSync, mkdirSync, readFileSync, writeFileSync };
