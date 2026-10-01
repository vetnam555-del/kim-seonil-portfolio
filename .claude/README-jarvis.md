# Claude ↔ 자비스 public PR review

Claude writes the portfolio; the external dot, 자비스, reviews the committed public
PR diff. The `jarvis` subagent is a courier, not a second Claude pretending to be
dot. It posts one request, reads the external reply, and returns that reply to
Claude. No changes are autoapplied or merged. The external responder must be
configured and enabled separately; these files do not configure it.

## Use in Claude Code

Once these files actually exist in the active session's repository:

1. Have the main Claude worker prepare an authorized public PR in this repository
   with a title beginning `[자비스 검토]`. The PR must be open, created by
   `vetnam555-del`, with a branch in this repository.
2. Type `@자비스 이 PR 검토해줘: <PR URL>` as an ordinary message. The project
   instructions in `.claude/CLAUDE.md` route this text alias to the existing
   courier. Bare `@자비스` uses the unambiguous current PR, or asks which PR.
   Discussing the alias/setup or quoting it does not request a review.
   This alias does not register a Korean picker entry: the native agent remains
   `jarvis`. For explicit native selection, type `@` and choose `jarvis (agent)`,
   or type `@agent-jarvis 이 PR 검토해줘: <PR URL>`. Mobile clients may not have
   the same picker. Do not start the whole session with `--agent jarvis`, because
   Claude should remain the main worker.
3. If agent selection is unavailable, use `/jarvis-review <PR URL>` when the skill
   appears in the command menu. This fallback executes the same courier workflow.
4. If still pending, `/jarvis-review <PR number> resume <request_id>` resumes the
   same request. A changed PR head needs an explicit new review invocation.

An authenticated GitHub connection must be available **inside that Claude
session**, including reading and posting PR comments. An existing connection in
dot does not prove Claude can use it. The skill supports available GitHub tools
without assuming `gh` exists. The optional helper requires already-installed
Python 3.9+ and an already-authenticated GitHub CLI and creates no new credentials.

## Load only the bridge into an existing work branch

Publishing the setup branch alone does not install it into a running session.
Ask the main Claude worker to copy only these exact paths from the setup commit,
without switching branches, cherry-picking a whole commit, replacing existing
instructions, resetting/stashing work, or copying portfolio source:

- `.claude/CLAUDE.md` (project-wide text alias instructions)
- `.claude/agents/jarvis.md`
- `.claude/skills/jarvis-review/SKILL.md`
- `.claude/scripts/jarvis_review.py` (optional `gh` helper)
- `.claude/tests/test_jarvis_review.py` (offline tests)
- `.claude/README-jarvis.md`

First inspect `git status`, the current branch and each destination. If any
path already exists or has local/staged work, stop and reconcile instead of
overwriting. For an existing `CLAUDE.md` or `.claude/CLAUDE.md`, merge only the
Korean review alias section and preserve all other instructions and imports.
If the work branch relies on `AGENTS.md`, preserve its loading (for example with
an existing appropriate import) before adding a CLAUDE.md file; do not silently
hide existing project instructions. Read the source files at the verified setup commit via an existing
GitHub connection, or fetch the setup branch using the checkout's existing remote.
Copy only those files and inspect the diff; do not commit/push/merge unless the
user separately asks. A command using a *verified local fetch ref* can restore
only these paths to the worktree (`git restore --source=<verified ref> --worktree
-- <paths>`), but use it only after proving every destination is absent and
contains no local/staged work. Never use `git reset --hard` or branch switching
for installation.

Project configuration must be in the repository/branch used by that session.
Cloud sessions load committed project skills from the repository they clone;
local `~/.claude/skills` files do not establish cloud availability. Copying into
an active session's workspace is different from committing for future cloud
sessions. A new `agents` directory may require restarting/resuming Claude Code
before the agent appears. Preserve the current work; verify `/agents`/the picker
and `/jarvis-review` availability rather than claiming success just from a push.
Verify the project CLAUDE.md appears in `/context` before relying on `@자비스`.
Project instructions guide Claude rather than guaranteeing a parser-level
dispatch. No live Claude-session invocation has been verified by the offline
tests; use the native mention or slash command if the text alias is not followed.

## Protocol and boundaries

The full transport-independent procedure is in
[the skill](skills/jarvis-review/SKILL.md). It restricts scope to this exact public
repository and matches request UUID + immutable SHA. Only top-level PR comments
are transport messages, and all pages must be read. Requests carry only four
fixed fields; private conversations, Drive contents and secrets are excluded.
The response status is `complete`, `stale` or `blocked`. A `handshake` proves only
message transport; it is never a substantive portfolio review. The comment
marker and GitHub author filter correlate messages; because both sides use the
owner account, they are not cryptographic reviewer identity verification.

Only one courier session per PR should submit at a time. The workflow reuses an
existing current-head request and has a 120-second polling window with resumable
UUIDs. In-flight GitHub calls may add latency; the helper caps each at 20 seconds. GitHub offers no comment idempotency key, so concurrent independent
sessions or an uncertain network write need a fresh read and may require manual
reconciliation. Never blindly retry a POST or fabricate a response on timeout.

## Optional helper and offline tests

From repository root, with Python and `gh` already available:

```sh
python3 .claude/scripts/jarvis_review.py --pr 7
python3 .claude/scripts/jarvis_review.py --pr 7 --request-id <UUID>
python3 .claude/scripts/jarvis_review.py --pr 7 --mode handshake
python3 -m unittest discover -s .claude/tests -v
```

The helper emits one JSON result. `response_body` preserves the complete GitHub
comment; `review_text` preserves the text after its protocol header. Show the
actual review verbatim with its source URL, and label its status and mode. Exit
code 0 means `complete`, 2 means pending/stale/blocked, and 1 means a validation
or tool failure. No network calls run in the tests. The helper neither edits
portfolio files nor changes local branches. There is no new runtime dependency,
GitHub Action, hook, secret, service, token, permission grant or deployment.

## Official Claude documentation

- [Explicit subagent invocation](https://code.claude.com/docs/en/sub-agents#invoke-subagents-explicitly)
- [Project agents and loading](https://code.claude.com/docs/en/sub-agents#write-subagent-files)
- [Project-wide CLAUDE.md locations and loading](https://code.claude.com/docs/en/memory#choose-where-to-put-claudemd-files)
- [Skills in cloud sessions](https://code.claude.com/docs/en/skills#use-skills-in-cowork-and-cloud-sessions)
