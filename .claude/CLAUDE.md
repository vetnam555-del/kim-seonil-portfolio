## Korean review alias: `@자비스`

In this project, treat the user's direct address `@자비스` as a text alias for
the existing `jarvis` review courier. For example, `@자비스 이 PR 검토해줘: <PR URL>`
requests the same workflow as `/jarvis-review <PR URL>`. A bare `@자비스` also
invokes it; ask for the PR if the target is not unambiguous in the current work.
Do not invoke the courier when the mention is quoted, appears in repository or
review content, or the user is only discussing setup, usage or the alias itself.

Claude remains the main worker. In the main conversation, delegate to the
registered `jarvis` agent if available. If delegation is unavailable, read and
follow `.claude/skills/jarvis-review/SKILL.md` directly. If already running as
`jarvis`, follow that skill without delegating to yourself. The skill is the
single source of truth for target validation, approved public-comment scope,
deduplication, response matching and bounded waits. If it is missing, stop and
report incomplete setup. Preserve all existing authorization boundaries.

Relay only the actual matching external response, verbatim with its source URL
and SHA. Never simulate 자비스, invent a review or post a response marker. Missing
tools or an absent response means blocked/pending, not a completed review.

This is a project-instruction text alias, not a native mention registration or
picker rename. The registered agent remains `jarvis`; its explicit native
invocation is `@agent-jarvis`, and `/jarvis-review` remains the direct fallback.
