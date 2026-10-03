/**
 * write_svg — opencode port of pi learn visual-tools `write_svg`.
 */
import { tool } from "@opencode-ai/plugin";
import { writeBody } from "../lib/viz-common.ts";

const GROUP = "svg";
const BODY_FILE = "diagram.svg";

export default tool({
  description:
    "Write the FULL SVG source to this session's managed file (first draft or complete rewrite). edit_svg and render_svg act on the same file. `source` is a complete `<svg ...>…</svg>` document with explicit width/height (or viewBox), readable font sizes, light or transparent background. Writing does NOT render — call render_svg when ready. For small fixes prefer edit_svg.",
  args: {
    source: tool.schema
      .string()
      .describe("The complete SVG document, from `<svg` to `</svg>`."),
  },
  async execute(args, context) {
    const source = (args.source ?? "").trim();
    if (!source) throw new Error("`write_svg` requires a non-empty `source`.");
    if (!source.includes("<svg"))
      throw new Error("`write_svg`: source must be a complete <svg>…</svg> document.");
    const session = writeBody(GROUP, BODY_FILE, source, context.sessionID);
    const lines = source.split("\n").length;
    return `Wrote ${lines}-line SVG source to session staging.\nCall render_svg to render it (then read the returned PNG to inspect), or edit_svg to tweak it.`;
  },
});
