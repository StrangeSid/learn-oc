---
description: Start a learning session on a topic (probe → plan → teach)
---

Load the `teach` skill from `skills/teach/SKILL.md` and start a learning session on: $ARGUMENTS

If no topic was given, ask what to learn first.

Follow the teaching process strictly:
1. First check if a lesson log is linked: run `node scripts/learn-log.js status`. If linked, mirror every teaching message and Q&A to the log using `node scripts/learn-log.js append`.
2. Phase 1 Probe — fast calibrated checks with multiple-choice options to bracket his edge on every goal-relevant strand (grade explicitly in your next message: ✓/✗ + correct answer + explanation), then clarify the concrete goal.
3. Phase 2 Plan — verify facts if unsure, present approach and a small mermaid dependency map, and STOP for his go-ahead.
4. Phase 3 Teach loop — motivate → establish → connect → quiz-check per node, grading immediately.
5. When a picture earns its place, load `skills/visualize/SKILL.md` and render using `node scripts/viz.js render mermaid|svg ... --save-as <slug>`. Inspect the preview before publishing!
