/**
 * 포트폴리오 PDF(일반판 29쪽 덱)에서 사례가 실린 쪽 (2026.10.24 레퍼런스 비교).
 *
 * 사례 상세에서 같은 사례의 PDF 쪽으로 바로 간다 — 웹에서 읽다가 전달·인쇄용으로 PDF 를 찾는 사람이
 * 29쪽을 넘겨 찾지 않게 한다. 쪽 번호는 덱 책갈피와 같다. 덱을 다시 구워 쪽이 밀리면 이 표가 틀린 쪽을
 * 가리키므로, `scripts/check_deck_pages.py` 가 쪽마다 keyword 가 있는지 PDF 글자로 대조한다
 * (`validate_export.mjs` 가 일반판 빌드마다 부른다).
 *
 * 다른 판은 덱이 다르다(쪽 번호도 다르다) — 일반판에서만 쓴다.
 */
import deckPagesJson from "./deck-pages.json";

export type DeckRange = { from: number; to: number; keyword: string };

export const deckPages: Record<string, DeckRange> = deckPagesJson;
