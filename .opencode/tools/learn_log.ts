/**
 * learn_log — link a markdown lesson log (opencode port of pi `/md-log`).
 *
 * The file must already exist (never created here — avoids scattering files
 * from a typo'd path). After linking, the teach skill mirrors every teaching
 * message + Q&A via `learn_append`. Unlike pi md-log this is agent-driven,
 * not event-automatic — see PORT_NOTES.md.
 */
import { tool } from "@opencode-ai/plugin";
import * as fs from "node:fs";
import { getLinkedFile, resolveInProject, setLinkedFile } from "../lib/learn-log-state.ts";

export default tool({
  description:
    "Link a markdown lesson log file for this learning project (replaces pi /md-log). The file must already exist. After linking, mirror every teaching message and Q&A via learn_append. Returns the linked path.",
  args: {
    filepath: tool.schema
      .string()
      .describe(
        "Path to an EXISTING markdown file to log into (absolute or relative to project root). It is never created — create it first with write.",
      ),
  },
  async execute(args, context) {
    const projectDir = context.directory || process.cwd();
    const fp = (args.filepath ?? "").trim();
    if (!fp) throw new Error("Usage: learn_log with a filepath to an existing markdown file.");
    const resolved = resolveInProject(projectDir, fp);
    if (!fs.existsSync(resolved)) {
      throw new Error(`File does not exist: ${resolved}. Create it first, then link it.`);
    }
    if (!fs.statSync(resolved).isFile()) {
      throw new Error(`Not a file: ${resolved}`);
    }
    const prev = getLinkedFile(projectDir);
    setLinkedFile(projectDir, resolved);
    const note =
      prev && prev !== resolved ? `\nPreviously linked: ${prev} (replaced).` : "";
    return `Linked lesson log: ${resolved}${note}\nFrom now on, after EVERY teaching message and every Q&A round, call learn_append with the Obsidian callout block(s). Never write/edit this file directly.`;
  },
});
