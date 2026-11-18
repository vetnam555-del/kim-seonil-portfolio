/**
 * EDIT H 의 AI 영상 릴스 '오늘 아침 5가지' — 홈 릴스 띠와 EDIT H 사례에 싣는 세 편
 * (2026.11.17 주인 "EDIT H 는 릴스 영상 만들어 놓은 것도 반영해 줘 · 메인에도 릴스 영상 몇 개 깔아 두면").
 *
 * 원본은 공개 아카이브 instagram/{날짜}/reel_ai.mp4 다. 사이트용 파일은 scripts/make_reel_assets.sh 로 만든다
 * (사례 쪽은 소리가 있는 전체 영상, 홈은 소리 없이 끝 화면 앞까지 되풀이하는 작은 영상, 표지는 0.8초 프레임).
 * title 은 영상 첫 장면의 자막 그대로다 — 새 문장을 만들지 않는다. 화면에는 날짜와 호수만 글자로 적고 제목은 영상 표지와 대체 글에 둔다.
 * 최신 호를 앞에 둔다. 영상 속 소식은 날짜가 지나면 낡으므로, 바꿀 때는 가장 최근 호 세 편으로 한다.
 * 2026.11.18 11.17호(VOL.146)를 11.12호(VOL.141)로 바꿨다 — 주인 "입싱크가 제대로 안 맞는 영상이 있는데 오류니까 교체해 줘".
 * 세 편 중 캐릭터가 말하는 입 모양으로 오래 움직이는 것은 11.17호뿐이었고(셋째 · 넷째 장면 약 7초) 목소리는 내레이션이라 입과 맞지 않는다.
 * 11.14 · 11.15 호는 아카이브에 릴스가 없어 다음 최근 호인 11.12 를 실었다(말하는 장면 없음). 새로 고를 때도 입이 오래 움직이는 편은 뺀다.
 */
export interface EdithReel {
  /** public/evidence/edith-reel-<id>… */
  id: string;
  date: string;
  vol: number;
  /** 첫 장면 자막 */
  title: string;
  titleEn: string;
}

export const edithReels: EdithReel[] = [
  { id: "1116", date: "2026.11.16", vol: 145, title: "은행 문 9시30분에? 출근 전 은행 일은?", titleEn: "issue of 16 November 2026" },
  { id: "1113", date: "2026.11.13", vol: 142, title: "'사지 마' 했는데 11만 명 몰려 품절", titleEn: "issue of 13 November 2026" },
  { id: "1112", date: "2026.11.12", vol: 141, title: "비만치료제 3개월치 여행 가는 나는?", titleEn: "issue of 12 November 2026" },
];

export const EDITH_ARCHIVE = "https://vetnam555-del.github.io/edit-h-archive/";
