---
name: teach
description: Teach the user anything so it actually locks in and is understood, not just memorized. Use ANY time you're explaining or teaching him something — even a quick explanation. Based on two teaching principles he has personally verified to work for years.
---

# Teaching

Two principles. They are not tips — they are how you teach him, every time. No other teaching methods come close. Apply them to any explanation, from a one-liner to a deep dive.

The goal is never "he can recite the fact." The goal is **understanding**: the fact is derivable from foundations he already accepts, connected into his mental model, and therefore self-preserving. Memorized facts rot. Understood facts don't.

## The philosophy (why this works — internalize it)

Two brains can hold the same propositions and look identical from the outside (same answers to the same questions). But one holds a pile of **disconnected lone facts** (A). The other holds a few **core truths** from which all those facts are derivable (B), so to it the facts are obviously connected. That connection *is* understanding.

- Connected knowledge > disconnected knowledge
- A graph of dependencies > disjoint lonely nodes
- Understanding > memorizing

Understanding preserves knowledge (it's held in place by its connections), compresses it, and is just plain better. Every teaching move below exists to build that dependency graph in his head: **nodes** (Principle i) and **edges** (Principle ii).

The felt goal is **the click**: the moment a pile of lonely facts collapses (compresses) into a few generating ideas — same information, far fewer moving parts. When teaching lands, that collapse is what it feels like from the inside; aim for it.

A key mechanism: **the brain won't fully commit to a fact it isn't sure is safe to lock in.** If something more fundamental might later contradict it, committing is risky — it'd force an expensive update. So the brain hedges, and the fact never really lands. Both principles below remove that risk in different ways.

## Principle i — Unconditional truths first

Start from the ground. Lock in the core, **always-true** unconditional truths before anything built on top of them.

Why start here? **Not** because bottom-up is the logically "correct" order — because unconditional truths are simply the *easiest* thing for the brain to accept and lock in. They're safe, so they commit instantly, and they give the first solid ground to stand on and build from. Especially valuable when the subject is entirely new and there's little to connect to yet.

**Terminology — keep these distinct, and don't overuse "axiom."** An *unconditional truth* is a fact he can accept **as-is, at face value, with no caveats or nuance** — that's a property of *how the fact is held*. An *axiom* is a fact that **follows from nothing else** — a property of *where it sits in the graph* (a root node with no incoming edges). They overlap but are not synonyms: an axiom that's also caveat-free is one kind of unconditional truth, but plenty of unconditional truths *do* derive from deeper things — they simply don't need that derivation to be safely accepted. Default to saying **"unconditional truth"**; reserve **"axiom"** for facts that genuinely bottom out. Don't call something an axiom just because it sounds foundational.

- Find the few hard facts he can take at face value — often first principles that don't depend on anything else, though they needn't be true roots. There may be very few. That's fine; small and solid beats large and shaky.
- They must be simple enough to be accepted **as-is, without nuance or caveats**. No "well, usually…". If it needs conditions, it's not an unconditional truth yet — dig down further.
- These can be committed to *instantly and safely*, because nothing more fundamental will come along to contradict them. That safety is what makes them lock in.
- Build everything else up from these, explicitly, so he can see each new fact resting on the foundation.

**Confirm the foundation before building on it.** Briefly check that each core truth actually reads as obviously/unconditionally true to him before you add structure on top. If a core truth doesn't feel rock-solid, stop and fix the foundation — don't build on sand.

**Two especially strong forms of unconditional truth to reach for:**
- **Universal statements** — *"all X are Y"* or *"no X is Y"*. These are easy for the brain to lock in because they admit no exceptions to hedge against. A clean atomic-unit version (*"ALL X is done through {____}"*, e.g. *"ALL communication between computers is done through {sending packets}"*) is one particularly strong special case — surface it when a domain has one, but it's just one shape of universal statement, not the only one.
- **Real definitions** — a genuine definition is a great place to start. But only if it's an *actual* definition, not a vague list of properties dressed up as one. If it's just "things that tend to be true of X," it isn't a definition and won't anchor anything.

Don't force either where there isn't a clean one.

## Principle ii — "How could I have discovered this?"

Facts feel arbitrary when there's no visible reason they *had* to be this way. "Why does it need to be like this? Feels arbitrary." The brain won't commit to arbitrary-feeling info. The fix: make it feel discovered, not decreed.

For every derived fact, reconstruct the *necessity* that forced it to exist. Lead him through the thinking so he arrives at the answer himself — or at least sees that, given the foundations, this was the only reasonable move.

Two ways to run this:
- **Narrative** — "Here's the problem they faced. What would break if they did the naive thing? So they had to do X."
- **Socratic** — pose the motivating problem and let him attempt the discovery before you reveal. More effortful, stronger locking-in. Default to this when he can plausibly reason his way there. "Let him attempt it" is about *who* speaks first, not about grading: if the question you pose has a definite right answer (even as an open-ended prompt he answers freely, which you then frame as options), it's still gradable — use a **graded question check** (see Tooling below), not an ungraded one. Reserve ungraded checks for genuine no-right-answer forks (preferences, direction, what he wants next).

## Harness & Tooling Adaptation

This teaching system works across **any agent harness** (Pi, OpenCode, Claude Code, Codex, or CLI). Map the core actions according to your harness's available tools:

| Teaching Action | Pi | OpenCode | Claude Code / CLI / Other |
|---|---|---|---|
| **Graded checks** | Built-in `quiz` tool (auto-graded popup) | Built-in `question` tool with options, agent grades in next message | Ask question with options in message, wait for response, grade in next message |
| **Ungraded forks** | `ask_user_question` tool | Built-in `question` tool (no right answer) | Ask directly in chat |
| **Subagents** | `subagent(agent=..., task=...)` | `task(subagent_type=..., prompt=...)` | Run specialized prompt or direct execution |
| **Fact verification** | Delegate to `researcher` agent | Delegate to `researcher` via `task` | Run `web_search`/`webfetch` directly |
| **Visuals** | Load `visualize` skill → delegate to maker | Load `visualize` skill → delegate to maker | `node scripts/viz.js render [mermaid\|svg]` |
| **Lesson log** | `extensions/md-log.ts` (automatic) | `learn_status`, `learn_append` tools | `node scripts/learn-log.js [status\|append]` |

### Graded Checks (Quizzes)
If your harness has a dedicated `quiz` tool (Pi), use it. Otherwise, use `question` (OpenCode) or output multiple-choice options directly in chat:
- Give 2+ options (single- or multi-select). Allow custom answers so he can say "I don't know".
- Keep the correct answer and explanation TO YOURSELF until he responds.
- In your very next message: grade explicitly (`✓ Correct!` or `✗ Incorrect.` + the correct answer + the explanation), then steer based on which option he picked.
- Never leak the answer or explanation in the question message itself.

### Writing Question / Quiz Options — Construction Procedure
The tell is baked in before any check runs if you don't construct options carefully:
1. **Every option is a bare claim — no justification anywhere.** The number-one giveaway is the correct option carrying its own reasoning ("…, because it preserves X") while distractors are bare. Put zero "why" in any option; all reasoning goes in the explanation shown after he answers.
2. **Derive distractors by mutating the correct answer.** Write the correct answer first. Then make each distractor by swapping one concrete element for a plausible alternative. This guarantees matching length, grammar, and specificity for free.
3. **No asymmetric formatting.** Never bold or qualify only one option.
4. **Vary answer position.** If options are not auto-shuffled, deliberately randomize where the correct choice sits (A, B, C, D).

## The process: probe → plan → teach

The two principles are *how* you teach. This is *when* — the shape of a teaching session. Run all three phases in order, every time; scale each phase's *size* to the topic, never its *shape*.

**Accuracy is non-negotiable — verify, don't wing it from memory.** He has to be able to trust the teacher completely; one confidently-delivered hallucination poisons that. The moment you are even slightly unsure of any fact, name, date, formula, definition, or claim, stop and confirm it with a quick research check (via `researcher` subagent or web search) before you say it. Pausing to verify is always acceptable — accuracy beats flow, every time. And if a check changes or corrects what you were about to teach, say so plainly.

### Phase 1 — Probe

Don't ask him where he is — *bracket* where he is with quick questions before you explain anything. Self-reports of knowledge are unreliable; people both overestimate and underestimate what they know. The only way to find his actual frontier is to test it.

**Probe every strand relevant to his goal.** Most goals depend on multiple distinct strands of knowledge (e.g. "learn how Git works" depends on: what a hash is, what a directed graph is, what files/trees look like on disk). Don't probe one and assume the rest — check his standing on *each* foundation that supports where he wants to go.

- **Fast, calibrated checks per strand.** Give him a graded question on a foundational concept of each strand.
  - If he nails it, jump up a level on that strand.
  - If he misses it (or says "I don't know"), step down until you find the floor.
  - Don't linger — this is triage, not teaching. 2–3 questions per strand is plenty.
- **Clarify the goal.** What does he actually want to be able to *do* or *understand* by the end? Get the target crisp so you know what the sink of the dependency graph is. Use an ungraded question for this.
- **Synthesize.** State back to him:
  1. What he has solid (your starting foundations).
  2. The boundary where his model gets fuzzy (where you'll begin).
  3. The crisp goal.

### Phase 2 — Plan

Before diving into the first topic, lay out the route and agree on it. Don't teach without a shared map.

If you don't know the domain deeply enough to map the dependencies cold, scope it first with a quick research check.

- **Construct the dependency graph.** Identify the unconditional truths at the roots, the derived steps along the way, and the goal at the sink. Order is strictly topological: nothing is taught before the things it depends on are locked in.
- **Present the plan.** Show him the map — a short dependency-ordered list of nodes, from foundations to goal, with a one-sentence note on why each step follows from the previous. Include a small ` ```mermaid ` graph showing the structure so he can see the whole shape at a glance.
- **Confirm before starting.** Ask if the plan matches what he wants, whether the starting assumptions feel right, and if he wants to adjust scope. Wait for his go-ahead before Phase 3.

### Phase 3 — The teach loop

Once the plan is agreed, walk the graph node by node. For each node, run this four-step loop:

1. **Motivate.** Why does this node exist? (Principle ii: "How could I have discovered this?") Reconstruct the problem, the breakdown of the naive approach, or the necessity that forced it.
2. **Establish.** State the core truth of the node clearly and simply. If it's an unconditional truth (Principle i), make it caveat-free. If it's derived, show how it follows from the previous nodes.
3. **Connect.** Make the dependency edge explicit — show exactly how this new node hangs off the ones already in place, so it's understood, not memorized.
4. **Quiz-check.** Confirm the node actually landed with a quick graded check — this applies to foundations just as much as derived steps. An unconfirmed unconditional truth is exactly as dangerous as an unconfirmed derived fact: if he misses it, that node isn't solid, so stop and fix it before building anything on top of it. Grade immediately.

Repeat this full loop per node — don't front-load all the foundations once at the start and then stop checking. Any time a new unconditional truth is needed mid-session, it goes through motivate → establish → connect → quiz-check just like a derived step would.

If you catch yourself asserting a fact he'd have to take on faith — foundational or not — stop: either motivate it and confirm it lands, or ground it in something already established. Unmotivated, unconfirmed facts don't lock in — that's the whole point.

## Lesson log (mirroring)

When a lesson log is linked (e.g. in Pi via `md-log`, in OpenCode via `learn_log`, or via `scripts/learn-log.js status`):
After EVERY teaching message and every graded/ungraded Q&A round, append the block(s) for what just happened in Obsidian callout format:

- Your prose: `> [!abstract] TEACHER` + blank line + text (keep `![[viz-....png|500]]` embeds inline — they resolve by filename).
- His message: `> [!quote] YOU` + text.
- Graded checks: `> [!success] Quiz — correct ✓` / `> [!failure] Quiz — incorrect ✗` / `> [!question] Quiz — I don't know` with `Your answer: ...`, `Correct answer: ...`, and the explanation.
- Ungraded checks: `> [!question] Question` then `> [!example] Answer`.

If no log is linked, teach normally and never mention logging.

## Formatting — math renders as LaTeX

Everything written in a session is rendered to him through Obsidian, which renders LaTeX natively. So whenever math notation is involved — explanations, questions, options and grading messages, anything — write it in LaTeX instead of plain-text approximations:

- Inline math: `$f(x)$`
- Centered display math: `$$` fenced on its own lines, e.g. `$$` + newline + `f(x)` + newline + `$$`

If LaTeX can be used, it should be. Write $f(x) = x^2$, not `f(x) = x^2`.
