# learning-agent

amosblomqvist's Learning System

[![video](assets/thumbnail.png)](https://www.youtube.com/watch?v=kzcI5F4tGiU)

This is a fork of [https://github.com/amosblomqvist/learn](https://github.com/amosblomqvist/learn) that works with any coding harness — adapted from the personal AI learning system featured in the video [How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU).

Works seamlessly with **any AI coding agent harness**:
- **[OpenCode](https://opencode.ai)** (`opencode`)
- **[Pi](https://github.com/earendil-works/pi)** (`pi`)
- **[Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code)** (`claude`)
- **Cursor / Codex / Windsurf / Aider / Any CLI Agent**

---

## What's in it

- **`skills/teach/`**: The core teaching philosophy (unconditional truths first, "how could I have discovered this?", Socratic edge-probing, calibrated checks).
- **`skills/visualize/`**: Minimal, verified diagrams (Mermaid for structure/relationships, SVG for spatial/geometry).
- **`agents/`**: Specialist subagents (`researcher`, `mermaid-maker`, `svg-maker`).
- **`scripts/`**: Harness-agnostic CLI utilities:
  - `node scripts/viz.js doctor` — check diagram renderers.
  - `node scripts/viz.js render mermaid|svg ...` — render and publish visuals.
  - `node scripts/learn-log.js link|status|append|unlink` — mirror sessions to Obsidian.
- **Obsidian Integration**: Renders LaTeX math natively (`$f(x)$`), resolves visual embeds (`![[viz-...png|500]]`), and formats lesson history using clean Obsidian callouts.

---

## Quick Start by Harness

### 1. OpenCode (`opencode`)

```bash
cd learning-agent
bun install --cwd .opencode   # optional; opencode does this at startup
opencode
```
Inside OpenCode:
```text
/learn <topic>
```
To link an Obsidian lesson log:
```text
/md-log lessons/my-lesson.md
```

---

### 2. Pi (`pi`)

You can either run `pi` directly in this repo or clone it as your project's `.pi` directory:

**Option A: Run inside this directory**
```bash
cd learning-agent
pi
```
Pi automatically discovers `.pi/` (which links to the extensions, agents, and skills) or `.agents/skills/`.

**Option B: Clone as `.pi` in an existing vault/project**
```bash
cd "/path/to/Obsidian Vault/MyProject"
git clone https://github.com/StrangeSid/learn-oc .pi
pi
```

Inside Pi:
```text
/skill:teach
```
Or start learning any topic directly.

---

### 3. Claude Code (`claude`)

```bash
cd learning-agent
claude
```
Inside Claude Code:
```text
/learn <topic>
```
To link an Obsidian lesson log:
```text
/md-log lessons/my-lesson.md
```
Claude Code automatically reads `CLAUDE.md`, discovers slash commands from `.claude/commands/`, and uses `scripts/viz.js` and `scripts/learn-log.js` for rendering and log mirroring.

---

### 4. Cursor / Codex / Windsurf / Generic Agents

Open this directory in your agent or editor. The harness will automatically pick up `AGENTS.md` and `.agents/skills/teach/SKILL.md`.

Ask:
```text
Teach me <topic>
```

---

## Requirements for Diagrams & LaTeX

- **SVG Diagrams**: `rsvg-convert` (preferred) or ImageMagick `magick`.  
  On macOS: `brew install librsvg`
- **Mermaid Diagrams**: `@mermaid-js/mermaid-cli` (`mmdc`) + Google Chrome or Chromium.  
  Run `node scripts/viz.js doctor` anytime to check your setup:
  ```bash
  node scripts/viz.js doctor
  ```
- **Obsidian**: The lesson log (`lessons/` or any markdown file in your vault) renders best in Obsidian, where LaTeX math and `![[viz-...png|500]]` wikilink embeds display inline. Keep `viz/` inside your vault so embeds resolve automatically.

---

## How a Session Runs

1. **Probe**: Fast calibrated checks bracket the learner's frontier on every foundation supporting the goal. Graded immediately.
2. **Plan**: Verify facts, build a topological dependency map (roots = unconditional truths, sink = goal), present a small Mermaid diagram, and get the learner's go-ahead.
3. **Teach Loop**: For each node:
   - **Motivate** (why was this necessary?)
   - **Establish** (clear, caveat-free truth)
   - **Connect** (link explicitly to previous nodes)
   - **Quiz-check** (confirm it landed before building on it)
4. **Visualize**: When an idea genuinely needs a picture, the system authors it, renders it, visually inspects the PNG for errors, and embeds the verified image.
5. **Log**: When linked, every teaching turn is cleanly preserved in Obsidian callout format.

---

## Acknowledgements

Teaching philosophy, pedagogy, skills, agents, and visual-tools architecture originally created by [Amos Blomqvist](https://github.com/amosblomqvist/learn).
