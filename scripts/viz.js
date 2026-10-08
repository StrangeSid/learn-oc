#!/usr/bin/env node

/**
 * scripts/viz.js — Harness-agnostic diagram renderer & publisher.
 *
 * Can be called by ANY agent harness (Claude Code, Pi, OpenCode, Codex, Aider,
 * or humans in a shell) to render Mermaid / SVG source to PNG and publish into viz/.
 *
 * Usage:
 *   node scripts/viz.js doctor
 *   node scripts/viz.js render mermaid <input.mmd | "diagram-source"> [--save-as <slug>]
 *   node scripts/viz.js render svg <input.svg | "svg-source"> [--save-as <slug>]
 */

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");
const VIZ_DIR = join(PROJECT_ROOT, "viz");

const EXTRA_PATH = [
  "/opt/local/bin",
  "/usr/local/bin",
  "/opt/homebrew/bin",
  "/usr/bin",
  "/bin",
];

function runCommand(cmd, args, opts = {}) {
  return new Promise((resolveRun) => {
    const augmentedPath = [...EXTRA_PATH, process.env.PATH || ""].join(":");
    const child = spawn(cmd, args, {
      cwd: opts.cwd || PROJECT_ROOT,
      env: { ...process.env, ...(opts.env || {}), PATH: augmentedPath },
    });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = opts.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          child.kill("SIGKILL");
        }, opts.timeoutMs)
      : null;

    child.stdout?.on("data", (d) => {
      stdout += d.toString("utf8");
    });
    child.stderr?.on("data", (d) => {
      stderr += d.toString("utf8");
    });

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      resolveRun({ code: -1, stdout, stderr: stderr + "\n" + err.message, timedOut });
    });

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolveRun({ code, stdout, stderr, timedOut });
    });
  });
}

function findChrome() {
  const envBrowser = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (envBrowser && existsSync(envBrowser)) return envBrowser;

  const candidates = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return null;
}

function findMmdc() {
  const candidates = [
    join(PROJECT_ROOT, ".opencode", "node_modules", ".bin", "mmdc"),
    join(PROJECT_ROOT, "node_modules", ".bin", "mmdc"),
    join(PROJECT_ROOT, "extensions", "visual-tools", "node_modules", ".bin", "mmdc"),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return "mmdc"; // fall back to PATH
}

async function checkRendererSvg() {
  const rsvg = await runCommand("which", ["rsvg-convert"]);
  if (rsvg.code === 0) return { ok: true, engine: "rsvg-convert", path: rsvg.stdout.trim() };

  const magick = await runCommand("which", ["magick"]);
  if (magick.code === 0) return { ok: true, engine: "ImageMagick magick", path: magick.stdout.trim() };

  return { ok: false, error: "Neither `rsvg-convert` nor `magick` found. Install with: brew install librsvg" };
}

async function checkRendererMermaid() {
  const mmdc = findMmdc();
  const mmdcCheck = await runCommand(mmdc, ["--version"]);
  const chrome = findChrome();

  if (mmdcCheck.code !== 0) {
    return { ok: false, error: "Mermaid CLI (`mmdc`) not found. Run `bun install` or `npm install` in `.opencode/`." };
  }
  if (!chrome) {
    return { ok: false, error: "Chrome / Chromium executable not found for Puppeteer rendering." };
  }
  return { ok: true, mmdc, chrome, version: mmdcCheck.stdout.trim() };
}

function slugify(text) {
  const s = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "diagram";
}

function publishPng(srcPath, slug) {
  mkdirSync(VIZ_DIR, { recursive: true });
  const filename = `viz-${slugify(slug)}-${Date.now()}.png`;
  const destPath = join(VIZ_DIR, filename);
  copyFileSync(srcPath, destPath);
  return { filename, path: destPath };
}

async function renderSvg(source, saveAsSlug) {
  const svgCheck = await checkRendererSvg();
  if (!svgCheck.ok) {
    console.error(`ERROR: ${svgCheck.error}`);
    process.exit(1);
  }

  const workDir = join(tmpdir(), "learn-visual-tools", "svg");
  mkdirSync(workDir, { recursive: true });
  const srcFile = join(workDir, "diagram.svg");
  const outFile = join(workDir, `render-${Date.now()}.png`);

  writeFileSync(srcFile, source, "utf8");

  let res;
  if (svgCheck.engine === "rsvg-convert") {
    res = await runCommand("rsvg-convert", ["-o", outFile, srcFile]);
  } else {
    res = await runCommand("magick", ["convert", "-background", "none", srcFile, outFile]);
  }

  if (res.code !== 0 || !existsSync(outFile)) {
    console.error(`Render failed (exit code ${res.code}):\n${res.stderr || res.stdout}`);
    process.exit(1);
  }

  if (saveAsSlug) {
    const pub = publishPng(outFile, saveAsSlug);
    console.log(`PUBLISHED:`);
    console.log(`filename: ${pub.filename}`);
    console.log(`path: ${pub.path}`);
    console.log(`embed: ![[${pub.filename}|500]]`);
  } else {
    console.log(`PREVIEW:`);
    console.log(`path: ${outFile}`);
  }
}

async function renderMermaid(source, saveAsSlug) {
  const mmdcCheck = await checkRendererMermaid();
  if (!mmdcCheck.ok) {
    console.error(`ERROR: ${mmdcCheck.error}`);
    process.exit(1);
  }

  const workDir = join(tmpdir(), "learn-visual-tools", "mermaid");
  mkdirSync(workDir, { recursive: true });
  const srcFile = join(workDir, "diagram.mmd");
  const outFile = join(workDir, `render-${Date.now()}.png`);
  const puppeteerConfigFile = join(workDir, "puppeteer-config.json");

  writeFileSync(srcFile, source, "utf8");
  writeFileSync(
    puppeteerConfigFile,
    JSON.stringify({
      executablePath: mmdcCheck.chrome,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
    }),
    "utf8"
  );

  const res = await runCommand(
    mmdcCheck.mmdc,
    [
      "-i", srcFile,
      "-o", outFile,
      "-p", puppeteerConfigFile,
      "-b", "transparent",
      "-s", "2",
    ],
    { timeoutMs: 120_000 }
  );

  if (res.code !== 0 || !existsSync(outFile)) {
    console.error(`Render failed (exit code ${res.code}):\n${res.stderr || res.stdout}`);
    process.exit(1);
  }

  if (saveAsSlug) {
    const pub = publishPng(outFile, saveAsSlug);
    console.log(`PUBLISHED:`);
    console.log(`filename: ${pub.filename}`);
    console.log(`path: ${pub.path}`);
    console.log(`embed: ![[${pub.filename}|500]]`);
  } else {
    console.log(`PREVIEW:`);
    console.log(`path: ${outFile}`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    console.log(`Usage:
  node scripts/viz.js doctor
  node scripts/viz.js render mermaid <file-or-string> [--save-as <slug>]
  node scripts/viz.js render svg <file-or-string> [--save-as <slug>]
`);
    process.exit(0);
  }

  if (command === "doctor" || command === "check") {
    console.log("Checking diagram rendering requirements...\n");
    const svg = await checkRendererSvg();
    if (svg.ok) {
      console.log(`✓ SVG Renderer: ${svg.engine} (${svg.path})`);
    } else {
      console.log(`✗ SVG Renderer: ${svg.error}`);
    }

    const mermaid = await checkRendererMermaid();
    if (mermaid.ok) {
      console.log(`✓ Mermaid CLI: ${mermaid.mmdc} (${mermaid.version})`);
      console.log(`✓ Chrome Executable: ${mermaid.chrome}`);
    } else {
      console.log(`✗ Mermaid: ${mermaid.error}`);
    }
    return;
  }

  if (command === "render") {
    const type = args[1]; // "mermaid" or "svg"
    let input = args[2];
    let saveAs = null;

    const saveAsIdx = args.indexOf("--save-as");
    if (saveAsIdx !== -1 && args[saveAsIdx + 1]) {
      saveAs = args[saveAsIdx + 1];
    }

    if (!type || !["mermaid", "svg"].includes(type)) {
      console.error("Please specify diagram type: 'mermaid' or 'svg'");
      process.exit(1);
    }

    if (!input) {
      console.error("Please provide input file or source string.");
      process.exit(1);
    }

    let source = input;
    if (existsSync(input)) {
      source = readFileSync(input, "utf8");
    }

    if (type === "mermaid") {
      await renderMermaid(source, saveAs);
    } else {
      await renderSvg(source, saveAs);
    }
    return;
  }

  console.error(`Unknown command: ${command}`);
  process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
