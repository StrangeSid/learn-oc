---
description: Start a learning session on a topic (probe → plan → teach)
---

Load the `teach` skill and start a learning session on: $ARGUMENTS

If no topic was given, ask what to learn with the `question` tool first.

Follow the skill exactly:
1. First run `learn_status` — if a lesson log is linked, you will mirror every teaching message + Q&A via `learn_append`.
2. Phase 1 Probe — graded `question` calls to bracket his edge on every goal-relevant strand (grade ✓/✗ + correct + explanation after each), then one ungraded `question` to pin the concrete goal.
3. Phase 2 Plan — scope with a `researcher` subagent via `task`, present approach + small mermaid dependency map, and STOP for his go-ahead.
4. Phase 3 Teach loop — motivate → establish → connect → quiz-check per node, grading every check immediately.
5. When a picture earns its place, load the `visualize` skill and brief a maker via `task`.
