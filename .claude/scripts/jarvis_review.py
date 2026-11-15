#!/usr/bin/env python3
"""Optional public-PR courier. Uses an existing gh login; never writes reviews."""
import argparse
import json
import re
import subprocess
import sys
import time
import uuid

REPO = "vetnam555-del/kim-seonil-portfolio"
OWNER = "vetnam555-del"
PREFIX = "[자비스 검토]"
SCOPE = "public-portfolio-diff"
REQUEST = "<!-- jarvis-review-request:v1 -->"
RESPONSE = "<!-- jarvis-review-response:v1 -->"
SHA = re.compile(r"[0-9a-f]{40}\Z")


class BridgeError(Exception):
    pass


def canonical_uuid(value):
    try:
        return isinstance(value, str) and str(uuid.UUID(value)) == value
    except (ValueError, AttributeError):
        return False


def unique_object(pairs):
    value = {}
    for key, item in pairs:
        if key in value:
            raise ValueError("Duplicate JSON key")
        value[key] = item
    return value


def parse(body, marker):
    if not isinstance(body, str):
        return None
    match = re.fullmatch(re.escape(marker) + r"\n```json\n(.*?)\n```(?:\n(.*))?", body, re.S)
    if not match:
        return None
    try:
        payload = json.loads(match.group(1), object_pairs_hook=unique_object)
    except (ValueError, TypeError):
        return None
    if not isinstance(payload, dict) or not canonical_uuid(payload.get("request_id")):
        return None
    if not isinstance(payload.get("head_sha"), str) or not SHA.fullmatch(payload["head_sha"]):
        return None
    text = match.group(2) or ""
    if marker == REQUEST:
        if set(payload) != {"request_id", "head_sha", "mode", "scope"}:
            return None
        if payload["mode"] not in ("review", "handshake") or payload["scope"] != SCOPE or text.strip():
            return None
    else:
        if set(payload) != {"request_id", "head_sha", "status"}:
            return None
        if payload["status"] not in ("complete", "stale", "blocked") or not text.strip():
            return None
    return payload, text


def encode_request(payload):
    return REQUEST + "\n```json\n" + json.dumps(payload, separators=(",", ":")) + "\n```"


class GitHub:
    """Only fixed github.com endpoints and structured stdin; no shell interpolation."""
    def api(self, endpoint, data=None, paginate=False):
        command = ["gh", "api", "--hostname", "github.com", "--method", "POST" if data is not None else "GET", endpoint]
        if paginate:
            command += ["--paginate", "--slurp"]
        if data is not None:
            command += ["--input", "-"]
        try:
            result = subprocess.run(command, input=json.dumps(data) if data is not None else None,
                                    capture_output=True, text=True, check=True, timeout=20)
            value = json.loads(result.stdout)
        except (OSError, subprocess.SubprocessError, ValueError) as exc:
            # Do not dump tool output: it can contain account details or credentials.
            raise BridgeError("GitHub tool failed (%s); use an existing authorized connection. No automatic write retry." % type(exc).__name__) from exc
        if paginate:
            if not isinstance(value, list) or not all(isinstance(page, list) for page in value):
                raise BridgeError("Invalid paginated GitHub response.")
            return [item for page in value for item in page]
        return value

    def repo(self):
        return self.api("repos/" + REPO)

    def actor(self):
        return self.api("user")

    def pr(self, number):
        return self.api("repos/%s/pulls/%d" % (REPO, number))

    def comments(self, number):
        return self.api("repos/%s/issues/%d/comments?per_page=100" % (REPO, number), paginate=True)

    def post(self, number, body):
        return self.api("repos/%s/issues/%d/comments" % (REPO, number), {"body": body})


def login(user):
    value = user.get("login") if isinstance(user, dict) else None
    return value.lower() if isinstance(value, str) else ""


def verify_repo(repo):
    if repo.get("full_name", "").lower() != REPO or repo.get("private") is not False or repo.get("visibility") != "public":
        raise BridgeError("Only the configured public portfolio repository is allowed.")


def verify_pr(pr):
    if pr.get("state") != "open" or login(pr.get("user")) != OWNER:
        raise BridgeError("PR must be open and authored by the configured owner.")
    if not pr.get("title", "").startswith(PREFIX):
        raise BridgeError("PR title must begin with " + PREFIX)
    for side in ("head", "base"):
        if ((pr.get(side) or {}).get("repo") or {}).get("full_name", "").lower() != REPO:
            raise BridgeError("PR base and head must both belong to the configured repository.")
    sha = pr["head"].get("sha", "")
    if not isinstance(sha, str) or not SHA.fullmatch(sha):
        raise BridgeError("Invalid full PR head SHA.")
    return sha


def messages(comments, marker, number):
    if not isinstance(comments, list):
        raise BridgeError("Expected every page of top-level comments.")
    valid = []
    for comment in comments:
        if not isinstance(comment, dict) or login(comment.get("user")) != OWNER:
            continue
        parsed = parse(comment.get("body"), marker)
        comment_id = comment.get("id")
        if parsed and isinstance(comment_id, int) and not isinstance(comment_id, bool) and comment_id > 0:
            # Generate a canonical public permalink rather than trusting a body-provided URL.
            item = dict(comment)
            item["html_url"] = "https://github.com/%s/pull/%d#issuecomment-%d" % (REPO, number, comment_id)
            valid.append((parsed[0], parsed[1], item))
    return sorted(valid, key=lambda item: item[2]["id"])


def select_request(comments, number, head, mode, request_id=None):
    requests = messages(comments, REQUEST, number)
    if request_id:
        matching = [item for item in requests if item[0]["request_id"] == request_id]
        if not matching:
            raise BridgeError("Resume request was not found; resume never posts a new comment.")
        if any(item[0] != matching[0][0] for item in matching):
            raise BridgeError("Conflicting duplicate request ID; reconcile before continuing.")
        if matching[0][0]["mode"] != mode:
            raise BridgeError("Resume mode mismatch; pass the original --mode.")
        return matching[0]
    matching = [item for item in requests if item[0]["head_sha"] == head and item[0]["mode"] == mode]
    if not matching:
        return None
    selected = matching[0]
    if any(item[0] != selected[0] for item in requests if item[0]["request_id"] == selected[0]["request_id"]):
        raise BridgeError("Conflicting duplicate request ID; reconcile before continuing.")
    return selected


def inspect_response(comments, number, request):
    payload, _, source = request
    responses = [item for item in messages(comments, RESPONSE, number)
                 if item[0]["request_id"] == payload["request_id"] and
                 item[0]["head_sha"] == payload["head_sha"] and item[2]["id"] > source["id"]]
    if not responses:
        return None
    if len({(item[0]["status"], item[1]) for item in responses}) != 1:
        raise BridgeError("Conflicting responses; cannot select an authoritative review.")
    return responses[0]


def details(number, request, status):
    payload, _, source = request
    return {"status": status, "mode": payload["mode"], "request_id": payload["request_id"],
            "head_sha": payload["head_sha"], "request_url": source["html_url"],
            "pr_url": "https://github.com/%s/pull/%d" % (REPO, number),
            "resume": "/jarvis-review %d resume %s%s" % (number, payload["request_id"], " handshake" if payload["mode"] == "handshake" else "")}


def run(client, number, mode="review", request_id=None, wait_seconds=120, clock=time.monotonic, sleep=time.sleep):
    if not isinstance(number, int) or isinstance(number, bool) or number <= 0:
        raise BridgeError("PR number must be a positive integer.")
    if mode not in ("review", "handshake") or not 0 <= wait_seconds <= 120:
        raise BridgeError("Invalid mode or wait limit (0–120 seconds).")
    if request_id is not None and not canonical_uuid(request_id):
        raise BridgeError("Resume requires a canonical lowercase UUID.")
    verify_repo(client.repo())
    if login(client.actor()) != OWNER:
        raise BridgeError("The authenticated GitHub account must be " + OWNER)
    head = verify_pr(client.pr(number))
    comments = client.comments(number)
    request = select_request(comments, number, head, mode, request_id)
    if request is None:
        # Refresh both immediately before the only possible write.
        head = verify_pr(client.pr(number))
        comments = client.comments(number)
        request = select_request(comments, number, head, mode)
        if request is None:
            verify_repo(client.repo())
            if verify_pr(client.pr(number)) != head:
                raise BridgeError("PR head changed before posting; no request sent. Re-run for the intended current head.")
            payload = {"request_id": str(uuid.uuid4()), "head_sha": head, "mode": mode, "scope": SCOPE}
            try:
                posted = client.post(number, encode_request(payload))
            except BridgeError as exc:
                raise BridgeError("Request creation uncertain for UUID %s at SHA %s. Re-read this PR's comments and resume that UUID if present; do not blindly resubmit. %s" % (payload["request_id"], head, exc)) from exc
            parsed = messages([posted], REQUEST, number)
            if len(parsed) != 1 or parsed[0][0] != payload:
                raise BridgeError("Unverified write for UUID %s; re-read comments before any retry." % payload["request_id"])
            request = parsed[0]
    deadline = clock() + wait_seconds
    while True:
        verify_repo(client.repo())
        current_head = verify_pr(client.pr(number))
        if current_head != request[0]["head_sha"]:
            result = details(number, request, "stale")
            result["current_head_sha"] = current_head
            return result
        response = inspect_response(client.comments(number), number, request)
        if response:
            verify_repo(client.repo())
            final_head = verify_pr(client.pr(number))
            if final_head != request[0]["head_sha"]:
                result = details(number, request, "stale")
                result["current_head_sha"] = final_head
                return result
            payload, review_text, source = response
            result = details(number, request, payload["status"])
            result.update(response_url=source["html_url"], response_body=source["body"], review_text=review_text)
            if mode == "handshake":
                result["notice"] = "연결 확인만 완료; 포트폴리오 내용 검토 아님" if payload["status"] == "complete" else "연결 확인 미완료; 포트폴리오 내용 검토 아님"
            return result
        remaining = deadline - clock()
        if remaining < 20:
            return details(number, request, "pending")
        sleep(20)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pr", type=int, required=True)
    parser.add_argument("--mode", choices=("review", "handshake"), default="review")
    parser.add_argument("--request-id", help="Resume only; never posts")
    parser.add_argument("--wait-seconds", type=int, default=120, help="0–120; checks at 20-second intervals")
    args = parser.parse_args()
    try:
        result = run(GitHub(), args.pr, args.mode, args.request_id, args.wait_seconds)
    except BridgeError as exc:
        print(json.dumps({"status": "error", "message": str(exc)}, ensure_ascii=False))
        return 1
    print(json.dumps(result, ensure_ascii=False))
    return 0 if result["status"] == "complete" else 2


if __name__ == "__main__":
    sys.exit(main())
