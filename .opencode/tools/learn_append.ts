/**
 * learn_append — append one block to the linked lesson log.
 *
 * Agent-driven replacement for pi md-log's automatic mirroring. The teach
 * skill calls this after every teaching message and Q&A round. Formatting
 * (Obsidian callouts) is the caller's job — this only appends verbatim with
 * a blank-line separator. Never used when no log is linked.
 */
import { tool } from "@opencode-ai/plugin";
import * as fs from "node:fs";
import { getLinkedFile } from "../lib/learn-log-state.ts";

export default tool({
  description:
    "Append a markdown block to the linked lesson log (replaces pi md-log auto-mirror). Only works when a log is linked via learn_log. Pass fully formatted Obsidian callout markdown; it is appended verbatim with blank-line separation.",
  args: {
    text: tool.schema
      .string()
      .describe(
        "Fully formatted markdown block to append (e.g. `> [!abstract] PI\\n\\n...`, `> [!question] Quiz\\n...`). Appended verbatim.",
      ),
  },
  async execute(args, context) {
    const projectDir = context.directory || process.cwd();
    const linked = getLinkedFile(projectDir);
    if (!linked) return "No lesson log linked — skipping log write (teaching continues normally).";
    const text = (args.text ?? "").trim();
    if (!text) throw new Error("learn_append requires non-empty `text`.");
    if (!fs.existsSync(linked)) {
      throw new Error(
        `Linked log no longer exists: ${linked}. Re-link with learn_log or stop logging with learn_unlog.`,
      );
    }
    const current = fs.readFileSync(linked, "utf8");
    const prefix = current.trim().length > 0 ? "\n\n" : "";
    fs.writeFileSync(linked, current + prefix + text + "\n", "utf8");
    return `Appended ${text.length} chars to lesson log.`;
  },
});
