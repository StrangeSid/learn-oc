# PORT_NOTES — Multi-Harness AI Learning System

Original: [amosblomqvist/learn](https://github.com/amosblomqvist/learn) (designed originally for Pi).  
This repository has been adapted into a **universal multi-harness system** that works identically with:
- **Pi** (interactive or standard)
- **OpenCode** (native tools & agents)
- **Claude Code** (`CLAUDE.md`, slash commands, and CLI scripts)
- **Codex / Cursor / Windsurf / Generic CLI Agents** (`AGENTS.md`, `.agents/skills`, standard CLI tools)

The core teaching philosophy, pedagogy, and visual verification workflow are preserved across all harnesses.

---

## 1. Universal Layout Map

```text
├── .agents/skills/            # Standard Agent Skills spec (Pi, Codex, and others)
│   ├── teach/SKILL.md
│   └── visualize/SKILL.md
├── skills/                    # Universal skill files (referenced by Pi and harnesses)
│   ├── teach/SKILL.md
│   └── visualize/SKILL.md
├── agents/                    # Subagent definitions for Pi / standard harnesses
│   ├── researcher.md
│   ├── mermaid-maker.md
│   └── svg-maker.md
├── .opencode/                 # OpenCode configuration
│   ├── agents/*.md            # OpenCode mode: subagent + permission controls
│   ├── tools/*.ts             # Custom OpenCode tools (learn_*, write_*, render_*)
│   ├── commands/*.md          # Slash commands (/learn, /md-log, /md-unlog)
│   └── skills/                # Mirrored / synchronized with universal skills
├── .claude/                   # Claude Code configuration
│   └── commands/*.md          # Slash commands (/learn, /md-log, /md-unlog)
├── .pi/                       # Pi project directory symlinks
│   ├── skills -> ../skills
│   ├── agents -> ../agents
│   └── extensions -> ../extensions
├── extensions/                # Native Pi extensions (quiz, ask-user-question, md-log, visual-tools)
├── scripts/                   # CLI helpers for harnesses without custom extension tools
│   ├── viz.js                 # Standalone Mermaid / SVG renderer & publisher
│   └── learn-log.js           # Standalone Obsidian lesson log manager
├── AGENTS.md                  # Unified agent instructions for all harnesses
├── CLAUDE.md                  # Project instructions for Claude Code
└── viz/                       # Published lesson visual artifacts
```

---

## 2. Capability Mapping Across Harnesses

| Feature | Pi Original | OpenCode | Claude Code & Generic CLI |
|---|---|---|---|
| **Teaching Skill** | Native `skills/teach` | `.opencode/skills/teach` or `/learn` | `skills/teach/SKILL.md` or `/learn` |
| **Visualizing Skill** | Native `skills/visualize` | `.opencode/skills/visualize` | `skills/visualize/SKILL.md` |
| **Graded Checks (Quiz)** | TUI popup (`quiz` tool), auto-graded | `question` tool with options, agent grades next turn | Options in chat, agent grades next turn |
| **Ungraded Forks (Preferences)**| `ask_user_question` tool | `question` tool (no correct answer) | Chat question without grading |
| **Fact Verification** | `subagent("researcher", ...)` | `task(subagent_type="researcher", ...)` | Direct web search before stating uncertain claims |
| **Diagram Generation** | `mermaid-maker` & `svg-maker` | `task` maker subagents with `render_*` | Maker subagents or `node scripts/viz.js render` |
| **Diagram Verification** | Inline result in tool output | Path returned, agent uses `read` | Agent inspects rendered PNG with view tool |
| **Lesson Log Mirroring** | Event-automatic via `extensions/md-log.ts` | Agent-driven via `learn_append` tool | `node scripts/learn-log.js append` or direct file append |

---

## 3. Visual Verification Architecture

Visual diagrams must always be **visually inspected before publishing**:
1. **Source authoring**: Minimal Mermaid or SVG source focused on ONE core concept.
2. **Rendering**:
   - In Pi / OpenCode: via custom tools `render_mermaid` / `render_svg`.
   - In Claude Code / CLI: via `node scripts/viz.js render mermaid|svg "<source>"`.
3. **Inspection**:
   - The agent reads / views the generated PNG to confirm no overlapping labels, correct geometry, and alignment with the brief.
4. **Publishing**:
   - The PNG is published into `viz/` as `viz-<slug>-<timestamp>.png`.
   - Embedded in the response as `![[viz-<slug>-<timestamp>.png|500]]` for native Obsidian display.

---

## 4. Shared State Across Harnesses

- The lesson log state is tracked in both `.opencode/.learn-log.json` and `.learn-log.json`.
- Running `/md-log` in OpenCode or `node scripts/learn-log.js link` in Claude Code / CLI updates both paths so switching between harnesses maintains continuity.
