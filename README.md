# learning-oc

Opencode port of [amosblomqvist/learn](https://github.com/amosblomqvist/learn) — a personal AI learning system from the video [How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU).

Run `opencode` in this directory to learn anything with the `teach` skill.

## What's in it (opencode mapping)

Original was a `.pi` directory. This is the opencode equivalent:

| pi original | opencode port | Notes |
|---|---|---|
| `skills/teach/` | `.opencode/skills/teach/` | Philosophy + process. `quiz`/`ask_user_question` → built-in `question` tool (graded manually). `researcher` via `task`. |
| `skills/visualize/` | `.opencode/skills/visualize/` | Brief a maker subagent via `task`, embed returned PNG filename. |
| `agents/researcher`, `svg-maker`, `mermaid-maker` | `.opencode/agents/*.md` | `mode: subagent`. Invoke via `task` or `@mention`. No pinned model (inherits session model). |
| `extensions/visual-tools/` | `.opencode/tools/write_mermaid.ts`, `edit_mermaid.ts`, `render_mermaid.ts`, `write_svg.ts`, `edit_svg.ts`, `render_svg.ts` + `.opencode/lib/viz-common.ts` | Same tool names. Render returns a path — maker must `read` the PNG to inspect (opencode has no inline-image tool result). Publishes to `viz/`. |
| `extensions/quiz` + `extensions/ask-user-question` | Built-in `question` tool + conventions in `teach` skill | No custom TUI popup. Graded = `question` with options, then agent grades ✓/✗ + correct + explanation in the next message. Ungraded = `question` with custom answer allowed. See `PORT_NOTES.md`. |
| `extensions/md-log` (`/md-log`, `/md-unlog`) | `.opencode/tools/learn_log.ts`, `learn_unlog.ts`, `learn_status.ts`, `learn_append.ts` + `.opencode/commands/md-log.md`, `md-unlog.md` | Agent-driven (not event-automatic). Agent appends lesson blocks via `learn_append` after each turn when a log is linked. Same Obsidian callout format. |

## Requirements

- [opencode](https://opencode.ai) (any recent version with `skill`, `question`, `task` tools)
- `bun` (opencode runs `bun install` in `.opencode/` at startup for `visual-tools` deps)
- Diagrams: Chrome or Chromium (for Mermaid via `mmdc`), `rsvg-convert` (preferred) or ImageMagick `magick` (for SVG). On macOS: `brew install librsvg` is enough for SVG; Chrome for Mermaid.
- The lesson log (`lessons/` or any `.md`) is meant to be viewed rendered, e.g. in Obsidian (LaTeX + `![[viz-...png|500]]` embeds + mermaid blocks). Keep `viz/` inside the vault so embeds resolve by filename.

## Quick start

```bash
cd ~/learning-oc
bun install --cwd .opencode   # optional; opencode does this at startup
opencode
```

Then in opencode:

```
/learn
```

Or just ask to learn something — the `teach` skill triggers on any teaching/explaining.

Link a lesson log (file must already exist):

```
/md-log lessons/2026-10-03-example.md
```

Unlink:

```
/md-unlog
```

Check link:

```
# agent runs learn_status tool
```

## How a session runs

1. `/learn <topic>` (or any "teach me X") → loads `teach` skill → **probe** (level via `question`, goal via `question`) → **plan** (researcher via `task`, dependency map as small mermaid graph, wait for go-ahead) → **teach loop** (motivate → establish → connect → quiz-check per node).
2. When a picture earns its place → loads `visualize` skill → briefs `mermaid-maker` (relationships) or `svg-maker` (geometry) via `task` → embeds `![[viz-...png|500]]`.
3. If a log is linked, every teaching message + Q&A is appended via `learn_append` in Obsidian callout format.

See `AGENTS.md` (project instructions) and `PORT_NOTES.md` (pi → opencode deltas).

## Acknowledgements

Teaching philosophy, skills, agents, and visual-tools design by Amos Blomqvist. This port only adapts the wiring to opencode conventions.
