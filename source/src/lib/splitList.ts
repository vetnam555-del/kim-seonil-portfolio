/**
 * "A · B(C · D) · E" 처럼 가운뎃점으로 이어 쓴 목록을 한 줄에 하나씩 나눈다(2026.11.21).
 * 괄호 안의 구분자에서는 나누지 않는다 — "(채널 전체 구독자 2,000 → 107,600 · 팀 성과)" 같은 단서가
 * 따로 떨어지면 그 단서가 어느 값의 것인지 읽히지 않는다.
 * 구분자는 데이터가 쓰는 '줄바꿈 없는 공백 + 가운뎃점 + 공백' 하나뿐이다. 낱말 안의 '·'(은상·동상)는 건드리지 않는다.
 */
export function splitList(text: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === "(") depth++;
    if (ch === ")") depth = Math.max(0, depth - 1);
    if (depth === 0 && text.startsWith(" · ", i)) {
      out.push(cur);
      cur = "";
      i += 2;
      continue;
    }
    cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim()).filter(Boolean);
}
