# PORT_NOTES — pi `learn` → opencode `learning-oc`

Source: https://github.com/amosblomqvist/learn (a `.pi` directory: skills + pi extensions + pi agents).
This project is the opencode equivalent. Philosophy and pedagogy are unchanged; only the wiring differs.

## 1. Skills — same content, new tool names

- `teach` and `visualize` SKILL.md bodies are ~95% verbatim from pi. Only the tooling sections changed.
- Pi's `subagent(agent="...", task="...")` → opencode `task` (with `subagent_type="..."`) or `@mention`. Briefs must be self-contained in both (makers/researcher run isolated).
- Pi's `safe_bash`/`web_search`/`web_fetch` → opencode `bash`/`websearch`/`webfetch`. The `researcher` agent is now read-only + web (bash denied; it never needed shell).
- No pinned models. Pi pinned `researcher` to `openrouter/z-ai/glm-5.3` and makers to `anthropic/claude-sonnet-5`. Opencode agents here inherit the session model so the project works with any provider. If you want pinned models, add `model:` to `.opencode/agents/*.md`.

## 2. `quiz` + `ask_user_question` → built-in `question` + conventions (no code)

Pi shipped two TUI-popup extensions with automatic grading (`quiz`: ✓/✗ + correct + explanation, shuffle, "I don't know", note field, shared UI lock). Opencode already has a built-in `question` tool, so there is nothing to install — but there is also no automatic grader.

Convention (enforced by the `teach` skill, not by code):

| pi | opencode |
|---|---|
| Graded `quiz` (options + `correctAnswer` + `explanation`, shuffled, auto-graded) | `question` with options. Agent keeps correct answer + explanation private, then grades in the NEXT message: `✓ Correct!` / `✗ Incorrect.` + correct answer + explanation. Distractor-hygiene rules (bare claims, mutate-from-correct, no asymmetric bolding) apply unchanged. "I don't know" arrives as a custom answer — treat as a genuine gap, never as wrong. |
| Ungraded `ask_user_question` (preferences, goal, direction) | `question` with no right answer. Never graded. |

Practical consequences: option order is whatever you write (shuffle manually if you care — put the correct answer in different positions across questions); quiz history lives in the visible transcript + your own floor/ceiling notes (pi logged structured `details` — here you track strands yourself).

## 3. `md-log` → `learn_*` tools (agent-driven, not event-automatic)

Pi's `md-log` hooked `message_end`/`tool_call`/`tool_result` events and mirrored automatically (including backfill and post-shuffle quiz order). Opencode plugins expose different hooks, so this port makes logging explicit:

- `learn_log <existing-file>` / `learn_unlog` / `learn_status` / `learn_append <markdown-block>` in `.opencode/tools/`, plus `/md-log` and `/md-unlog` commands (same names as pi for muscle memory).
- The `teach` skill instructs the agent to call `learn_status` at session start and `learn_append` after every teaching message + Q&A when linked. Same Obsidian callout format (`> [!abstract] PI`, `> [!quote] YOU`, `> [!question]`, `> [!success]/[!failure]`, `![[viz-...|500]]` embeds).
- No automatic backfill: linking mid-session only captures what happens after linking. Link at the start (`/learn` reminds you).

## 4. `visual-tools` → same tool names, path-based inspection

- Tool names are identical: `write_mermaid` / `edit_mermaid` / `render_mermaid`, `write_svg` / `edit_svg` / `render_svg`. Staging is per-session (keyed by opencode `sessionID`, not pid), publishing to `viz/` as `viz-<slug>-<timestamp>.png` is identical.
- One real difference: pi returned the rendered PNG **inline** in the tool result; opencode custom tools return text (+ a file attachment when available). So `render_*` returns a **PATH** and the maker **must `read` the PNG** to look at it before iterating/publishing. Agent prompts (`mermaid-maker.md`, `svg-maker.md`) encode this.
- Deps: `.opencode/package.json` (`@mermaid-js/mermaid-cli`, `@opencode-ai/plugin`). Opencode runs `bun install` there at startup. System binaries unchanged: Chrome/Chromium for mermaid, `rsvg-convert` (or `magick`) for SVG.
- Shared code moved from `extensions/visual-tools/tools/_common.ts` to `.opencode/lib/viz-common.ts` (kept out of `tools/` so it isn't loaded as a tool). Lesson-log state helper lives at `.opencode/lib/learn-log-state.ts`.

## 5. Layout map

```
.pi/skills/teach/SKILL.md            → .opencode/skills/teach/SKILL.md
.pi/skills/visualize/SKILL.md        → .opencode/skills/visualize/SKILL.md
.pi/agents/{researcher,svg-maker,mermaid-maker}.md → .opencode/agents/*.md (mode: subagent)
.pi/extensions/visual-tools/         → .opencode/tools/write_mermaid.ts … render_svg.ts + .opencode/lib/viz-common.ts
.pi/extensions/quiz.ts               → built-in `question` + teach-skill grading convention
.pi/extensions/ask-user-question.ts  → built-in `question` (ungraded)
.pi/extensions/md-log.ts            → .opencode/tools/learn_{log,unlog,status,append}.ts + commands md-log/md-unlog
```

## 6. Known limitations

- No shared-UI-lock popups: concurrent `question` calls serialize naturally in opencode's turn loop; avoid firing two `question`s in one block.
- No `RESULT`-inline images: makers depend on `read` for PNG inspection — image quality of `read` matches what the learner gets (same file).
- Quiz shuffle/anti-position-bias is manual. Vary correct-answer positions yourself.
- Log file must live where Obsidian sees it. `viz/` embeds resolve by filename only if `viz/` is inside the vault — keep this project (or at least `viz/` + linked log) in the vault, same as pi.
