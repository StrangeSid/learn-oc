---
name: visualize
description: "Add a correct, minimal visual to a lesson — a diagram or geometric picture — that renders inline in the Obsidian log. Use when an idea is genuinely clearer as a picture: a dependency graph, system/flow, sequence, state machine, tree, comparison, or a spatial/geometric thing (coordinate geometry, number line, vectors, a plot, a physical layout). Outsources authoring+rendering to a maker subagent or scripts/viz.js that verifies the image by looking at it, then you embed the returned file."
---

# Visualize

A picture earns its place only when it shows something words can't — shape, structure, direction, relationship, geometry. This skill produces ONE such picture, guarantees it is **correct** (rendered and visually inspected before returning), and drops it into the lesson so it renders inline in the Obsidian log.

You are the **creative director**. You decide the exact idea and distill it to its fewest carrying elements. The authoring, rendering, visual verification, and saving are performed by a maker (or the `scripts/viz.js` tool), which returns a filename. You embed that filename in your reply.

## When to visualize (and when not to)

This teaching system builds a **dependency graph in the learner's head** — axioms at the root, derived facts hanging off them. A visual is powerful exactly when it makes that structure (or a geometry) visible. Reach for one when:

- The idea is a **structure or relationship**: dependencies, a system with parts and arrows, a flow/pipeline, a sequence of exchanges, a state machine, a tree/hierarchy, a comparison, a containment (what's inside vs outside).
- The idea is **spatial or geometric**: coordinate geometry, a number line, vectors, a function's shape, a physical arrangement.

Do NOT visualize when prose or a single equation already carries it. A decorative diagram that just restates the sentence next to it adds noise and a chance to be wrong. When in doubt, don't — a missing visual is cheaper than a false one.

## Choose the maker / format

- **`mermaid-maker`** (Mermaid) — structural/relational visuals: dependency graphs, flowcharts, sequence/state/ER/class diagrams, trees, mindmaps, timelines. This is the default and fits the dependency-graph pedagogy directly.
- **`svg-maker`** (Hand-authored SVG) — spatial/geometric visuals Mermaid can't lay out: exact coordinates, geometry figures, number lines, vectors, plots, custom shapes.

Rule of thumb: if it's *nodes-and-edges / relationships*, use Mermaid. If it's *positions-and-shapes / geometry*, use SVG.

## Brief well: one idea, fewest elements

The most common failure is **cramming** — every extra label makes the picture harder to read AND harder to lay out correctly. Before briefing, prune to the fewest elements that carry the idea, and for each ask: *"if I delete this, is the idea still clear?"* If yes, delete it.

Give the concept AND the concrete elements you want — not a vague topic, and not a long checklist.

- BAD: "make a diagram about how TCP works"
- GOOD: "graph TD: a node 'packet' at the top; arrows down to 'ordering' and 'retransmit on loss'; both arrows down into 'reliable stream'. No title. Show that reliability is built FROM packets, not alongside them."

Keep the idea intact; if your brief lists more than ~5–7 elements, cut it first.

## Invocation across harnesses

### 1. Harnesses with Subagent Support (Pi, OpenCode)
Dispatch the maker subagent:
- **Pi**: `subagent(agent="mermaid-maker", task="<brief>")` or `subagent(agent="svg-maker", task="<brief>")`
- **OpenCode**: `task(subagent_type="mermaid-maker", prompt="<brief>")` or `task(subagent_type="svg-maker", prompt="<brief>")`

The maker creates the diagram, renders it, inspects it visually, saves it into `viz/`, and returns:
```
RESULT:
filename: viz-<slug>-<timestamp>.png
path: <cwd>/viz/viz-<slug>-<timestamp>.png
```

### 2. Single-Agent / CLI Harnesses (Claude Code, Codex, Aider)
If running in a harness without maker subagents, the agent executes the render loop directly:
1. Write the minimal source (`diagram.mmd` or `diagram.svg`).
2. Render preview:
   ```bash
   node scripts/viz.js render mermaid "<source>"
   # or
   node scripts/viz.js render svg "<source>"
   ```
3. Inspect the returned preview image using the agent's file viewing/reading tool (`read`, `view`, etc.).
4. If correct, publish with a slug:
   ```bash
   node scripts/viz.js render mermaid "<source>" --save-as <slug>
   ```
5. Embed the returned filename in your reply.

## Embed it in the lesson

Put the embed directly in your teaching reply, using Obsidian's wikilink embed with the returned **filename** (not the full path) and a display width:

```
![[viz-<slug>-<timestamp>.png|500]]
```

Obsidian resolves the embed by filename anywhere in the vault (saved into the project's `viz/` folder) — so it renders inline in the lesson automatically. Width `|500` is a good default; use larger for dense diagrams. Introduce the visual in a sentence, then let it carry the idea — don't narrate every element back in prose.

## Why this is reliable

- The maker never returns a picture it hasn't **looked at**, so "renders fine but says something false" is caught before it reaches the learner.
- PNG embed means **what was verified is pixel-identical to what the learner sees** — no re-render drift.
- Unique filenames keep Obsidian's by-filename embed resolution unambiguous.
