/**
 * edit_svg — opencode port of pi learn visual-tools `edit_svg`.
 */
import { tool } from "@opencode-ai/plugin";
import {
  applyEdit,
  existsSync,
  readFileSync,
  sessionFile,
  snippetAround,
  writeFileSync,
} from "../lib/viz-common.ts";

const GROUP = "svg";
const BODY_FILE = "diagram.svg";

export default tool({
  description:
    "Make a single exact-match replacement in this session's SVG source (same contract as edit, locked to the one managed file). `old_text` must appear EXACTLY ONCE (include surrounding context for uniqueness); on 0 or >1 matches the call fails and nothing changes. Call write_svg first. Editing does NOT render.",
  args: {
    old_text: tool.schema
      .string()
      .describe("Exact substring of the current source to replace (must match once)."),
    new_text: tool.schema.string().describe("Replacement text for `old_text`."),
  },
  async execute(args, context) {
    const { bodyPath } = sessionFile(GROUP, BODY_FILE, context.sessionID);
    if (!existsSync(bodyPath)) {
      throw new Error("edit_svg: no source yet — call write_svg first.");
    }
    const current = readFileSync(bodyPath, "utf8");
    const { updated, index } = applyEdit(
      current,
      String(args.old_text ?? ""),
      String(args.new_text ?? ""),
    );
    writeFileSync(bodyPath, updated, "utf8");
    return `Applied edit. Updated region:\n\`\`\`\n${snippetAround(updated, index)}\n\`\`\`\nCall render_svg to see it (then read the PNG).`;
  },
});
