/**
 * write_mermaid — opencode port of pi learn visual-tools `write_mermaid`.
 *
 * Writes the FULL Mermaid source to this session's managed staging file.
 * State is keyed by tool-context sessionID (no module-level session), so
 * parallel makers never collide.
 */
import { tool } from "@opencode-ai/plugin";
import { writeBody } from "../lib/viz-common.ts";

const GROUP = "mermaid";
const BODY_FILE = "diagram.mmd";

export default tool({
  description:
    "Write the FULL Mermaid source to this session's managed file (first draft or complete rewrite). edit_mermaid and render_mermaid act on the same file. `source` is a complete Mermaid diagram (graph TD/LR, sequenceDiagram, stateDiagram-v2, erDiagram, classDiagram, mindmap, timeline). Writing does NOT render — call render_mermaid when ready. For small fixes prefer edit_mermaid.",
  args: {
    source: tool.schema
      .string()
      .describe(
        "The complete Mermaid diagram source (starts with the diagram type, e.g. `graph TD`).",
      ),
  },
  async execute(args, context) {
    const source = (args.source ?? "").trim();
    if (!source) throw new Error("`write_mermaid` requires a non-empty `source`.");
    const session = writeBody(GROUP, BODY_FILE, source, context.sessionID);
    const lines = source.split("\n").length;
    return `Wrote ${lines}-line Mermaid source to session staging.\nCall render_mermaid to render it (then read the returned PNG to inspect), or edit_mermaid to tweak it.`;
  },
});
