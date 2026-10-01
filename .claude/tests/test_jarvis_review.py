"""Offline protocol tests. All GitHub operations are fake or mocked."""
import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import unittest
from unittest.mock import patch

MODULE = Path(__file__).resolve().parents[1] / "scripts" / "jarvis_review.py"
spec = importlib.util.spec_from_file_location("jarvis_review", MODULE)
b = importlib.util.module_from_spec(spec)
spec.loader.exec_module(b)
HEAD = "a" * 40
NEW_HEAD = "b" * 40
ID = "2d4a4450-5a08-44df-8b73-b56cc5b6ca41"
OTHER_ID = "d1f7e035-dc3b-4286-8bdf-8c3341aee84c"


def payload(request_id=ID, head=HEAD, mode="review"):
    return dict(request_id=request_id, head_sha=head, mode=mode, scope=b.SCOPE)


def comment(body, number=100, actor=b.OWNER):
    return {"id": number, "body": body, "user": {"login": actor}}


def request(p=None, number=100):
    return comment(b.encode_request(p or payload()), number)


def response(request_id=ID, head=HEAD, status="complete", text="실제 외부 검토\n- Keep this line\n", number=101, actor=b.OWNER):
    data = dict(request_id=request_id, head_sha=head, status=status)
    body = b.RESPONSE + "\n```json\n" + json.dumps(data, indent=2) + "\n```\n" + text
    return comment(body, number, actor)


class Fake:
    def __init__(self, comments=None):
        self.items = list(comments or [])
        self.posts = []
        self.head = HEAD
        self.pr_calls = 0
        self.head_sequence = []
        self.repo_data = dict(full_name=b.REPO, private=False, visibility="public")
        self.pr_data = dict(state="open", title=b.PREFIX + " portfolio", user={"login": b.OWNER},
                            head={"sha": HEAD, "repo": {"full_name": b.REPO}}, base={"repo": {"full_name": b.REPO}})
        self.actor_name = b.OWNER
        self.fail_post = False

    def repo(self):
        return self.repo_data

    def actor(self):
        return {"login": self.actor_name}

    def pr(self, _):
        self.pr_calls += 1
        data = copy.deepcopy(self.pr_data)
        data["head"]["sha"] = self.head_sequence.pop(0) if self.head_sequence else self.head
        return data

    def comments(self, _):
        return list(self.items)

    def post(self, _, body):
        self.posts.append(body)
        item = comment(body, 200)
        self.items.append(item)
        if self.fail_post:
            raise b.BridgeError("simulated uncertain write")
        return item


class ProtocolTests(unittest.TestCase):
    def test_new_request_posts_once_and_resume_never_posts(self):
        client = Fake()
        out = b.run(client, 7, wait_seconds=0)
        self.assertEqual(out["status"], "pending")
        self.assertEqual(len(client.posts), 1)
        again = b.run(client, 7, request_id=out["request_id"], wait_seconds=0)
        self.assertEqual(again, out)
        self.assertEqual(len(client.posts), 1)

    def test_reuses_oldest_same_head_mode_even_completed(self):
        client = Fake([request(), request(payload(OTHER_ID), 102), response()])
        out = b.run(client, 7, wait_seconds=0)
        self.assertEqual(out["request_id"], ID)
        self.assertEqual(out["status"], "complete")
        self.assertFalse(client.posts)

    def test_response_verbatim_and_canonical_permalink(self):
        reply = response()
        client = Fake([request(), reply])
        out = b.run(client, 7, wait_seconds=0)
        self.assertEqual(out["response_body"], reply["body"])
        self.assertEqual(out["review_text"], "실제 외부 검토\n- Keep this line\n")
        self.assertEqual(out["response_url"], "https://github.com/" + b.REPO + "/pull/7#issuecomment-101")

    def test_null_or_malformed_comment_authors_do_not_block_valid_reply(self):
        invalid = [dict(id=n, body="ordinary", user=user)
                   for n, user in enumerate([None, {}, [], {"login": None}, "wrong"], 1)]
        client = Fake(invalid + [request(), response()])
        self.assertEqual(b.run(client, 7, wait_seconds=0)["status"], "complete")
        client.pr_data["user"] = None
        with self.assertRaises(b.BridgeError):
            b.run(client, 7, wait_seconds=0)

    def test_wrong_author_uuid_sha_and_earlier_response_ignored(self):
        client = Fake([request(), response(actor="outsider"), response(request_id=OTHER_ID), response(head=NEW_HEAD), response(number=99)])
        self.assertEqual(b.run(client, 7, wait_seconds=0)["status"], "pending")

    def test_stale_resume_does_not_post(self):
        client = Fake([request(), response()])
        client.head = NEW_HEAD
        out = b.run(client, 7, request_id=ID, wait_seconds=0)
        self.assertEqual(out["status"], "stale")
        self.assertNotIn("review_text", out)
        self.assertFalse(client.posts)

    def test_head_changed_after_response_is_stale(self):
        client = Fake([request(), response()])
        client.head_sequence = [HEAD, HEAD, NEW_HEAD]
        self.assertEqual(b.run(client, 7, wait_seconds=0)["status"], "stale")

    def test_conflicting_responses_rejected_identical_deduped(self):
        client = Fake([request(), response(), response(number=102)])
        self.assertEqual(b.run(client, 7, wait_seconds=0)["status"], "complete")
        client.items.append(response(text="different", number=103))
        with self.assertRaisesRegex(b.BridgeError, "Conflicting responses"):
            b.run(client, 7, wait_seconds=0)

    def test_resume_missing_and_conflicting_ids_rejected(self):
        client = Fake()
        with self.assertRaisesRegex(b.BridgeError, "not found"):
            b.run(client, 7, request_id=ID, wait_seconds=0)
        client.items = [request(), request(payload(head=NEW_HEAD), 101)]
        with self.assertRaisesRegex(b.BridgeError, "Conflicting duplicate"):
            b.run(client, 7, request_id=ID, wait_seconds=0)
        self.assertFalse(client.posts)

    def test_handshake_separate_mode_and_clear_notice(self):
        client = Fake([request(), request(payload(OTHER_ID, mode="handshake"), 102), response(request_id=OTHER_ID, number=103)])
        out = b.run(client, 7, mode="handshake", wait_seconds=0)
        self.assertEqual(out["request_id"], OTHER_ID)
        self.assertIn("포트폴리오 내용 검토 아님", out["notice"])
        with self.assertRaisesRegex(b.BridgeError, "mode mismatch"):
            b.run(client, 7, mode="review", request_id=OTHER_ID, wait_seconds=0)

    def test_blocked_never_upgraded(self):
        self.assertEqual(b.run(Fake([request(), response(status="blocked")]), 7, wait_seconds=0)["status"], "blocked")

    def test_scope_identity_and_eligibility_fail_closed(self):
        mutations = [lambda c: c.repo_data.update(private=True),
                     lambda c: c.repo_data.update(visibility="private"),
                     lambda c: c.repo_data.update(full_name="someone/else"),
                     lambda c: setattr(c, "actor_name", "outsider"),
                     lambda c: c.pr_data.update(state="closed"),
                     lambda c: c.pr_data.update(title="wrong prefix"),
                     lambda c: c.pr_data.update(user={"login": "outsider"}),
                     lambda c: c.pr_data["head"].update(repo={"full_name": "fork/repo"}),
                     lambda c: c.pr_data["base"].update(repo={"full_name": "other/repo"}),
                     lambda c: setattr(c, "head", "short")]
        for mutate in mutations:
            client = Fake()
            mutate(client)
            with self.assertRaises(b.BridgeError):
                b.run(client, 7, wait_seconds=0)
            self.assertFalse(client.posts)

    def test_visibility_rechecked_before_write(self):
        client = Fake()
        calls = [0]
        def repo():
            calls[0] += 1
            return dict(full_name=b.REPO, private=calls[0] > 1,
                        visibility="private" if calls[0] > 1 else "public")
        client.repo = repo
        with self.assertRaises(b.BridgeError):
            b.run(client, 7, wait_seconds=0)
        self.assertFalse(client.posts)

    def test_uncertain_write_no_retry_discloses_recoverable_uuid(self):
        client = Fake()
        client.fail_post = True
        with self.assertRaisesRegex(b.BridgeError, "creation uncertain for UUID") as error:
            b.run(client, 7, wait_seconds=0)
        self.assertEqual(len(client.posts), 1)
        posted = b.parse(client.posts[0], b.REQUEST)[0]
        self.assertIn(posted["request_id"], str(error.exception))
        self.assertEqual(b.run(client, 7, request_id=posted["request_id"], wait_seconds=0)["status"], "pending")
        self.assertEqual(len(client.posts), 1)

    def test_bounded_poll_interval_and_late_response(self):
        client = Fake([request()])
        now = [0]
        sleeps = []
        def sleep(seconds):
            sleeps.append(seconds)
            now[0] += seconds
            if now[0] == 40:
                client.items.append(response())
        out = b.run(client, 7, clock=lambda: now[0], sleep=sleep)
        self.assertEqual(out["status"], "complete")
        self.assertEqual(sleeps, [20, 20])
        self.assertFalse(client.posts)

    def test_pending_after_bounded_wait(self):
        now = [0]
        def sleep(seconds):
            now[0] += seconds
        out = b.run(Fake([request()]), 7, clock=lambda: now[0], sleep=sleep)
        self.assertEqual(out["status"], "pending")
        self.assertEqual(now[0], 120)

    def test_protocol_rejects_extra_keys_duplicates_bad_uuid_and_markers(self):
        good = b.encode_request(payload())
        invalid = ["prose\n" + good, good + "\nprivate material", good.replace(ID, "bad-uuid"),
                   good.replace('"mode":"review"', '"mode":"review","extra":"secret"'),
                   good.replace('"mode":"review"', '"mode":"review","mode":"review"'),
                   good.replace(b.SCOPE, "private-data")]
        for body in invalid:
            self.assertIsNone(b.parse(body, b.REQUEST))
        self.assertIsNone(b.parse(response(text="")["body"], b.RESPONSE))

    def test_pagination_reads_response_beyond_first_page(self):
        pages = [[request()] + [comment("ordinary", n, "someone") for n in range(101, 200)], [response(number=201)]]
        result = subprocess.CompletedProcess([], 0, stdout=json.dumps(pages))
        with patch.object(b.subprocess, "run", return_value=result) as mocked:
            comments = b.GitHub().comments(7)
        self.assertEqual(len(comments), 101)
        command = mocked.call_args.args[0]
        self.assertIn("--paginate", command)
        self.assertIn("--slurp", command)
        self.assertEqual(b.run(Fake(comments), 7, wait_seconds=0)["status"], "complete")

    def test_post_uses_structured_stdin_no_shell(self):
        result = subprocess.CompletedProcess([], 0, stdout=json.dumps(request()))
        with patch.object(b.subprocess, "run", return_value=result) as mocked:
            b.GitHub().post(7, b.encode_request(payload()))
        self.assertNotIn("shell", mocked.call_args.kwargs)
        self.assertEqual(json.loads(mocked.call_args.kwargs["input"])["body"], b.encode_request(payload()))
        self.assertIn("github.com", mocked.call_args.args[0])

    def test_invalid_input_never_reaches_github(self):
        for kwargs in [dict(number=0), dict(number=True), dict(number=7, request_id="not-uuid"), dict(number=7, wait_seconds=121)]:
            with self.assertRaises(b.BridgeError):
                b.run(object(), **kwargs)


class AliasConfigurationTests(unittest.TestCase):
    """Static configuration checks, not a live Claude invocation test."""

    def test_project_alias_points_to_existing_courier(self):
        root = Path(__file__).resolve().parents[2]
        instructions = (root / ".claude/CLAUDE.md").read_text(encoding="utf-8")
        self.assertIn("`@자비스`", instructions)
        self.assertIn("registered `jarvis`", instructions)
        self.assertIn("`.claude/skills/jarvis-review/SKILL.md`", instructions)
        self.assertTrue((root / ".claude/agents/jarvis.md").is_file())
        self.assertTrue((root / ".claude/skills/jarvis-review/SKILL.md").is_file())

    def test_native_agent_and_skill_names_are_unchanged(self):
        root = Path(__file__).resolve().parents[1]
        agent = (root / "agents/jarvis.md").read_text(encoding="utf-8")
        skill = (root / "skills/jarvis-review/SKILL.md").read_text(encoding="utf-8")
        self.assertTrue(agent.startswith("---\nname: jarvis\n"))
        self.assertTrue(skill.startswith("---\nname: jarvis-review\n"))
        self.assertIn("disable-model-invocation: true", skill.split("---", 2)[1])

    def test_alias_setup_is_documented_as_instruction_based(self):
        root = Path(__file__).resolve().parents[1]
        readme = (root / "README-jarvis.md").read_text(encoding="utf-8")
        self.assertIn("`.claude/CLAUDE.md`", readme)
        self.assertIn("`@자비스 이 PR 검토해줘: <PR URL>`", readme)
        self.assertIn("does not register a Korean picker entry", readme)
        self.assertIn("No live Claude-session invocation has been verified", readme)


if __name__ == "__main__":
    unittest.main()
