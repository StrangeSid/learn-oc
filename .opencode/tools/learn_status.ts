/**
 * learn_status — report the currently linked lesson log, if any.
 */
import { tool } from "@opencode-ai/plugin";
import { getLinkedFile } from "../lib/learn-log-state.ts";

export default tool({
  description:
    "Show which markdown lesson log is currently linked (if any). Call at session start before teaching.",
  args: {},
  async execute(_args, context) {
    const projectDir = context.directory || process.cwd();
    const f = getLinkedFile(projectDir);
    return f ? `Lesson log linked: ${f}` : "No lesson log linked.";
  },
});
