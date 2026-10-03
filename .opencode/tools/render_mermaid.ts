/**
 * render_mermaid — opencode port of pi learn visual-tools `render_mermaid`.
 *
 * Renders the session's Mermaid source to PNG via the project-local `mmdc`
 * (@mermaid-js/mermaid-cli) + installed Chrome. Returns a PATH (opencode
 * custom tools return text, not inline images) — the maker MUST `read` the
 * PNG to inspect it. With `save_as`, also publishes into <project>/viz with
 * a unique filename and returns an image attachment for direct viewing.
 */
import { tool } from "@opencode-ai/plugin";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { dirname } from "node:path";
import {
  existsSync,
  findChrome,
  join,
  mkdirSync,
  publish,
  readFileSync,
  run,
  sessionFile,
  writeFileSync,
} from "../lib/viz-common.ts";

const GROUP = "mermaid";
const BODY_FILE = "diagram.mmd";
const RENDER_TIMEOUT_MS = 120_000;

function mmdcCandidates(toolDir: string, projectDir: string): string[] {
  return [
    join(projectDir, ".opencode", "node_modules", ".bin", "mmdc"),
    join(toolDir, "..", "node_modules", ".bin", "mmdc"),
    join(toolDir, "..", "..", "node_modules", ".bin", "mmdc"),
    "mmdc",
  ];
}

export default tool({
  description:
    "Render the CURRENT session Mermaid source to a PNG. Returns a file PATH — use `read` on it to SEE the diagram and iterate (opencode has no inline-image tool result). Iterate freely with no `save_as` (preview only). When correct and clean, call once more with `save_as` set to a short kebab-case topic slug: publishes the PNG into viz/ as viz-<slug>-<timestamp>.png and returns the filename to embed. Call write_mermaid first. On render error returns the error text — fix with edit_mermaid and re-render.",
  args: {
    save_as: tool.schema
      .string()
      .optional()
      .describe(
        "Short kebab-case topic slug (e.g. 'internet-packets'). When set, the rendered PNG is published to viz/ as viz-<slug>-<timestamp>.png and the filename is returned. Omit for a preview-only render.",
      ),
  },
  async execute(args, context) {
    const projectDir = context.directory || process.cwd();
    const { workDir, bodyPath } = sessionFile(GROUP, BODY_FILE, context.sessionID);
    if (!existsSync(bodyPath)) {
      throw new Error("render_mermaid: no source yet — call write_mermaid first.");
    }
    mkdirSync(workDir, { recursive: true });

    const chrome = findChrome();
    const cfgPath = join(workDir, "puppeteer.json");
    writeFileSync(
      cfgPath,
      JSON.stringify(
        chrome ? { executablePath: chrome, args: ["--no-sandbox"] } : { args: ["--no-sandbox"] },
      ),
      "utf8",
    );

    const toolDir = dirname(fileURLToPath(import.meta.url));
    const outPath = join(workDir, `render-${Date.now()}.png`);
    let lastErr = "";
    let rendered = false;
    for (const mmdc of mmdcCandidates(toolDir, projectDir)) {
      if (mmdc !== "mmdc" && !existsSync(mmdc)) continue;
      const res = await run(
        mmdc,
        ["-i", bodyPath, "-o", outPath, "-p", cfgPath, "-s", "2", "-b", "white"],
        { cwd: workDir, timeoutMs: RENDER_TIMEOUT_MS, env: { PUPPETEER_SKIP_DOWNLOAD: "1" } },
      );
      if (res.code === 0 && existsSync(outPath)) {
        rendered = true;
        break;
      }
      lastErr = (res.stderr || res.stdout || "unknown error").split("\n").slice(-30).join("\n");
      if (res.timedOut) lastErr = "mmdc timed out.\n\n" + lastErr;
      if (mmdc === "mmdc" && res.code === null) break;
    }

    if (!rendered) {
      if (!lastErr) {
        lastErr =
          "mmdc not found. Run `bun install --cwd .opencode` in the project root (installs @mermaid-js/mermaid-cli), then retry.";
      }
      return `Mermaid render FAILED — no image produced. Fix the source with edit_mermaid and call render_mermaid again.\n\nError:\n${lastErr}`;
    }

    if (args.save_as) {
      const { filename, path: dest } = publish(outPath, String(args.save_as), projectDir);
      return {
        output: `Published to viz/.\nfilename: ${filename}\npath: ${dest}\n\nREAD this PNG with the read tool to confirm it is correct before returning it.`,
        attachments: [
          { type: "file" as const, mime: "image/png", url: `file://${dest}`, filename },
        ],
      };
    }

    return {
      output: `Preview render (not yet saved) at:\n${outPath}\nREAD it with the read tool: are arrows/relationships correct, labels right, nothing cramped? Fix with edit_mermaid, or re-render with \`save_as\` to publish.`,
      attachments: [
        { type: "file" as const, mime: "image/png", url: `file://${outPath}` },
      ],
    };
  },
});
