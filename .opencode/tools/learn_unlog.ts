/**
 * learn_unlog — unlink the lesson log (opencode port of pi `/md-unlog`).
 */
import { tool } from "@opencode-ai/plugin";
import * as path from "node:path";
import { getLinkedFile, setLinkedFile } from "../lib/learn-log-state.ts";

export default tool({
  description: "Stop mirroring the session to the lesson log (replaces pi /md-unlog).",
  args: {},
  async execute(_args, context) {
    const projectDir = context.directory || process.cwd();
    const prev = getLinkedFile(projectDir);
    if (!prev) return "No lesson log linked — nothing to do.";
    setLinkedFile(projectDir, null);
    return `Unlinked lesson log: ${path.basename(prev)}. Teaching continues without logging.`;
  },
});
