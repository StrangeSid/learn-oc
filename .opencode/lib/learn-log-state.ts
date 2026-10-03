/**
 * learn-log state helper — shared by learn_log / learn_unlog / learn_status /
 * learn_append. Persists the linked lesson file in
 * <project>/.opencode/.learn-log.json (gitignored, per working directory).
 */
import * as fs from "node:fs";
import * as path from "node:path";

export const STATE_FILE = ".learn-log.json";

export function statePath(projectDir: string): string {
  return path.join(projectDir, ".opencode", STATE_FILE);
}

export function getLinkedFile(projectDir: string): string | null {
  try {
    const p = statePath(projectDir);
    if (!fs.existsSync(p)) return null;
    const raw = fs.readFileSync(p, "utf8");
    const data = JSON.parse(raw) as { file?: string | null };
    return data.file ?? null;
  } catch {
    return null;
  }
}

export function setLinkedFile(projectDir: string, file: string | null): void {
  const p = statePath(projectDir);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify({ file }, null, 2) + "\n", "utf8");
}

export function resolveInProject(projectDir: string, filepath: string): string {
  return path.isAbsolute(filepath) ? filepath : path.resolve(projectDir, filepath);
}
