/**
 * render_svg — opencode port of pi learn visual-tools `render_svg`.
 *
 * Renders the session's SVG source to PNG via `rsvg-convert` (preferred,
 * good system-font handling), falling back to ImageMagick `magick`. Returns
 * a PATH — the maker MUST `read` the PNG to inspect it. With `save_as`,
 * publishes into <project>/viz with a unique filename.
 */
import { tool } from "@opencode-ai/plugin";
import {
  existsSync,
  join,
  mkdirSync,
  publish,
  readFileSync,
  run,
  sessionFile,
} from "../lib/viz-common.ts";

const GROUP = "svg";
const BODY_FILE = "diagram.svg";
const RENDER_TIMEOUT_MS = 60_000;

async function renderSvg(svgPath: string, outPath: string, workDir: string) {
  // rsvg-convert renders at the SVG's intrinsic size; -z 2 doubles it for crispness.
  let res = await run("rsvg-convert", ["-z", "2", svgPath, "-o", outPath], {
    cwd: workDir,
    timeoutMs: RENDER_TIMEOUT_MS,
  });
  if (res.code === 0 && existsSync(outPath)) return { ok: true as const, res };
  // Fallback: ImageMagick. -density 192 (~2x of 96dpi) for a crisp raster.
  const magick = await run(
    "magick",
    ["-density", "192", "-background", "white", svgPath, outPath],
    { cwd: workDir, timeoutMs: RENDER_TIMEOUT_MS },
  );
  if (magick.code === 0 && existsSync(outPath)) return { ok: true as const, res: magick };
  return { ok: false as const, res: res.code !== null ? res : magick };
}

export default tool({
  description:
    "Render the CURRENT session SVG source to a PNG. Returns a file PATH — use `read` on it to SEE the picture and iterate (opencode has no inline-image tool result). Iterate freely with no `save_as` (preview only). When correct and clean, call once more with `save_as` set to a short kebab-case topic slug: publishes the PNG into viz/ as viz-<slug>-<timestamp>.png and returns the filename to embed. Call write_svg first. On render error returns the error text — fix with edit_svg and re-render.",
  args: {
    save_as: tool.schema
      .string()
      .optional()
      .describe(
        "Short kebab-case topic slug (e.g. 'number-line'). When set, the rendered PNG is published to viz/ as viz-<slug>-<timestamp>.png and the filename is returned. Omit for a preview-only render.",
      ),
  },
  async execute(args, context) {
    const projectDir = context.directory || process.cwd();
    const { workDir, bodyPath } = sessionFile(GROUP, BODY_FILE, context.sessionID);
    if (!existsSync(bodyPath)) {
      throw new Error("render_svg: no source yet — call write_svg first.");
    }
    mkdirSync(workDir, { recursive: true });

    const outPath = join(workDir, `render-${Date.now()}.png`);
    const { ok, res } = await renderSvg(bodyPath, outPath, workDir);

    if (!ok) {
      const detail = (res.stderr || res.stdout || "unknown error").split("\n").slice(-30).join("\n");
      const note = res.timedOut ? "SVG render timed out.\n\n" : "";
      return `${note}SVG render FAILED — no image produced (tried rsvg-convert then magick). Fix the source with edit_svg and call render_svg again.\n\nError:\n${detail}`;
    }

    // Touch readFileSync to fail fast if the PNG is unreadable.
    readFileSync(outPath);

    if (args.save_as) {
      const { filename, path: dest } = publish(outPath, String(args.save_as), projectDir);
      return {
        output: `Published to viz/.\nfilename: ${filename}\npath: ${dest}\n\nREAD this PNG with the read tool to confirm the geometry is correct before returning it.`,
        attachments: [
          { type: "file" as const, mime: "image/png", url: `file://${dest}`, filename },
        ],
      };
    }

    return {
      output: `Preview render (not yet saved) at:\n${outPath}\nREAD it with the read tool: are coordinates, angles, directions, proportions correct? Labels clear and unclipped? Fix with edit_svg, or re-render with \`save_as\` to publish.`,
      attachments: [
        { type: "file" as const, mime: "image/png", url: `file://${outPath}` },
      ],
    };
  },
});
