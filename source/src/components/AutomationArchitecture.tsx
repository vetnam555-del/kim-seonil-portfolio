/**
 * 자동화 6종의 실행 구조도.
 *
 * 이 케이스에는 증빙 이미지가 둘 있는데 둘 다 "결과"다 — 재고 점검이 끝난 로그와
 * 소재 요청 시트. 무엇을 만들었는지가 아니라 무엇이 나왔는지를 보여준다.
 * 그래서 6종이 어떻게 물려 돌아가는지는 본문 3,400자를 읽어야 알 수 있었다.
 * 채용 공고 135건 중 자동화를 요구한 것이 25%인데, 그 강점이 가장 늦게 읽혔다.
 *
 * 그림 하나로 대신한다. 광고주 데이터는 한 글자도 넣지 않는다 — 구조만 그린다.
 * 이미지가 아니라 인라인 SVG 인 이유: 글자가 폰트 서브셋에 잡히고(스크립트가
 * out 의 html 에서 태그 밖 텍스트를 긁는다), 확대해도 깨지지 않으며,
 * 배경·글자색이 사이트 토큰을 그대로 따라간다.
 *
 * 폭을 720 으로 잡은 이유: 본문 칼럼이 640 언저리라 880 으로 그리면 0.73 배로 줄어들어
 * 11px 글자가 8px 로 찍힌다. 6종을 3열로 두면 폭이 더 필요해서 2열로 내렸다.
 *
 * 본문 칼럼이 600px 에 못 미치면(휴대폰 · 옆 목차가 붙는 768~1023px 태블릿) 같은 내용을 세로로 다시 그린다(2026.11.17).
 * 화면 폭이 아니라 칸 폭으로 가른다(컨테이너 쿼리) — 768px 에서는 칼럼이 488px 로 오히려 좁아진다.
 * 그전에는 600px 짜리 그림을 칸 안에서 가로로 밀게 했는데, 밀 수 있다는 표시가 없어 03 · 04 단계와 6종의 오른쪽 열이 잘린 채로 읽혔다.
 * 세로 판은 SVG 가 아니라 목록이다 — 글이 폭에 맞춰 스스로 줄을 바꾸고, 화면 낭독기는 순서 있는 목록으로 읽는다.
 */
const W = 720;

/* 영문판(2026.09.25)은 같은 그림에 글자만 바꾼다. 수치는 두 언어가 같다 */
const TXT = {
  ko: {
    steps: [
      { no: "01", label: "수집", note: "매체 API\u00a0· 최대 900개" },
      { no: "02", label: "검수", note: "정상 여부 먼저 확인" },
      { no: "03", label: "실행", note: "광고 중단\u00a0· 재시작" },
      { no: "04", label: "기록", note: "로그\u00a0· 인수인계 문서" },
    ],
    systems: [
      "재고 자동 운영\u00a0· 회당 최대 900개",
      "리포트 엔진\u00a0· 매체 별칭 38종 매핑",
      "이상 징후 모니터링 3건",
      "광고비 정산\u00a0· 월 최대 84건",
      "월간 리포트 PDF 자동 발송",
      "업무 지식봇 2종\u00a0· 854개 파일",
    ],
    caption: "실행 구조 — 수집이 온전했는지 먼저 확인하고 확인되지 않으면 광고 설정을 바꾸지 않습니다",
    aria: "자동화 실행 구조도. 스케줄러가 정해진 주기로 수집·검수·실행·기록 네 단계를 돌리고, 검수에서 기준 파일 부재·표본 0건·재고 미상 비율 초과·수집 실패율 초과 중 하나라도 감지되면 광고 설정을 바꾸지 않고 멈춘 뒤 담당자에게 알립니다. 이 구조로 시스템 여섯 종이 돌아갑니다.",
    oneRun: "한 번의 실행",
    scheduler: "스케줄러",
    schedulerNote: "정해진 주기로 실행",
    anomaly: "이상 감지",
    stopTitle: "광고 설정을 바꾸지 않고 멈춘 뒤 담당자에게 알립니다",
    /* 조건 하나는 한 줄에 둔다(휴대폰 세로 판에서 "수집 / 실패율 초과" 로 갈라졌다) — 줄은 가운뎃점 뒤에서만 바뀐다 */
    stopConditions: "기준\u00a0파일\u00a0부재\u00a0· 표본\u00a00건\u00a0· 재고\u00a0미상\u00a0비율\u00a0초과\u00a0· 수집\u00a0실패율\u00a0초과",
    stopW: 465,
    systemsTitle: "이 구조로 돌아가는 시스템 6종",
    notes: ["구조만 옮긴 그림입니다.", "광고주 데이터와 계정 정보는 들어 있지 않습니다."],
  },
  en: {
    steps: [
      { no: "01", label: "Collect", note: "Media API\u00a0· up to 900" },
      { no: "02", label: "Check", note: "Validate data first" },
      { no: "03", label: "Execute", note: "Pause\u00a0· restart ads" },
      { no: "04", label: "Log", note: "Logs\u00a0· handover docs" },
    ],
    systems: [
      "Inventory auto-ops\u00a0· up to 900 per run",
      "Report engine\u00a0· 38 media aliases mapped",
      "Anomaly monitoring\u00a0· 3 checks",
      "Ad-spend settlement\u00a0· up to 84 a month",
      "Monthly report PDF\u00a0· auto-sent",
      "Work knowledge bots ×2\u00a0· 854 files",
    ],
    caption: "How one run works: it checks that the collection was complete first, and leaves the ads untouched if it can't confirm that",
    aria: "Automation run diagram. A scheduler runs four steps on a fixed cycle: collect, check, execute, log. If the check finds a missing baseline file, zero samples, too many unknown stock values or too many failed fetches, it stops without changing ad settings and alerts the owner. Six systems run on this structure.",
    oneRun: "ONE RUN",
    scheduler: "Scheduler",
    schedulerNote: "Runs on a fixed cycle",
    anomaly: "Anomaly found",
    stopTitle: "Stop without changing ad settings, then alert the owner",
    stopConditions: "No baseline file\u00a0· 0 samples\u00a0· unknown-stock ratio or fetch failures over limit",
    stopW: 560,
    systemsTitle: "SIX SYSTEMS ON THIS STRUCTURE",
    notes: ["This diagram shows the structure only.", "It contains no advertiser data or account details.", "I can show the real scheduler settings and run logs in an interview."],
  },
} as const;

const BOX_W = 150;
const BOX_H = 54;
const GAP = 40;
const ROW_Y = 76;
const x = (i: number) => i * (BOX_W + GAP);
const CHECK_CX = x(1) + BOX_W / 2;

/* 세로 판(좁은 화면)의 연결선 — 칸 왼쪽 21px 에 회색 선을 내리고 칸 끝에 화살촉을 단다. 선이 시작하는 높이(before:top-…)는 쓰는 곳에서 준다 */
const RAIL =
  "relative before:absolute before:bottom-[8px] before:left-[21px] before:w-[1.5px] before:bg-ink-3 before:content-[''] " +
  "after:absolute after:bottom-[2px] after:left-[17.75px] after:border-x-[4px] after:border-t-[7px] after:border-x-transparent after:border-t-ink-3 after:content-['']";

export default function AutomationArchitecture({ lang = "ko" }: { lang?: "ko" | "en" }) {
  const T = TXT[lang];
  const STEPS = T.steps;
  const SYSTEMS = T.systems;
  return (
    <figure className="@container mt-9 border-t border-line-2 pt-8">
      <figcaption className="text-caption font-semibold text-ink-3">
        {T.caption}
      </figcaption>

      {/* 좁은 화면 — 위에서 아래로. 회색 선은 정상 경로, 붉은 선은 검수에서 갈라지는 정지 경로다 */}
      <div className="mt-5 @[600px]:hidden">
        <p className="text-[12px] font-bold tracking-[0.09em] text-ink-3">{T.oneRun}</p>
        <div className={`${RAIL} mt-3 pb-[26px] before:top-[32px]`}>
          <div className="flex items-center gap-[11px]">
            <span className="inline-flex h-7 items-center rounded-full border border-line bg-bg-alt px-4 text-[13px] font-semibold text-ink">
              {T.scheduler}
            </span>
            <span className="text-[12px] text-ink-3">{T.schedulerNote}</span>
          </div>
        </div>
        <ol>
          {STEPS.map((s, i) => {
            const guard = s.no === "02";
            const last = i === STEPS.length - 1;
            return (
              <li key={s.no} className={last ? undefined : `${RAIL} pb-[26px] before:top-[58px]`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-[54px] w-[150px] shrink-0 flex-col justify-center rounded-[10px] bg-bg px-[14px] ${
                      guard ? "border-[1.6px] border-accent" : "border border-line"
                    }`}
                  >
                    <span className="text-[11px] font-semibold leading-none tracking-[0.06em] text-ink-3">{s.no}</span>
                    <span className="mt-[7px] text-[16px] font-bold leading-none text-ink">{s.label}</span>
                  </div>
                  <span className="text-[12px] leading-[1.5] text-ink-3">{s.note}</span>
                </div>
                {guard ? (
                  <div className="relative mt-[4px] pl-[44px] pt-[30px]">
                    <span aria-hidden="true" className="absolute left-[74px] top-0 h-[23px] w-[1.6px] bg-accent" />
                    <span
                      aria-hidden="true"
                      className="absolute left-[70.8px] top-[21px] border-x-[4px] border-t-[7px] border-x-transparent border-t-accent"
                    />
                    <span className="absolute left-[86px] top-[3px] text-[12px] font-semibold text-accent">{T.anomaly}</span>
                    <div className="rounded-[10px] border border-accent bg-accent-soft px-4 py-3">
                      <p className="text-[14px] font-bold leading-[1.45] text-accent">{T.stopTitle}</p>
                      <p className="mt-1.5 text-[12px] leading-[1.6] text-ink-2">{T.stopConditions}</p>
                    </div>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
        <p className="mt-8 border-t border-line-2 pt-5 text-[12px] font-bold tracking-[0.09em] text-ink-3">{T.systemsTitle}</p>
        <ul className="mt-3 grid gap-2 @[480px]:grid-cols-2">
          {SYSTEMS.map((name) => (
            <li key={name} className="rounded-[8px] border border-line-2 bg-bg-alt px-[14px] py-[7px] text-[12px] leading-[1.5] text-ink-2">
              {name}
            </li>
          ))}
        </ul>
      </div>

      {/*
        칸이 600px 을 채우면 가로 그림(그보다 좁으면 11~12px 글자가 10px 아래로 내려간다).
        컨테이너 쿼리를 모르는 옛 브라우저는 세로 판만 본다. min-w 와 가로 스크롤은 안전망으로 남긴다.
      */}
      <div className="mt-5 hidden overflow-x-auto @[600px]:block">
        <svg
          viewBox={`0 0 ${W} 462`}
          className="h-auto w-full min-w-[600px]"
          role="img"
          aria-label={T.aria}
        >
          <defs>
            <marker id="aa-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-ink-3)" />
            </marker>
            <marker id="aa-stop" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill="var(--color-accent)" />
            </marker>
          </defs>

          <text x="1" y="12" fontSize="12" fontWeight="700" letterSpacing="0.09em" fill="var(--color-ink-3)">
            {T.oneRun}
          </text>

          {/* 방아쇠 */}
          <rect x="0" y="24" width="88" height="28" rx="14" fill="var(--color-bg-alt)" stroke="var(--color-line)" />
          <text x="44" y="43" fontSize="13" fontWeight="600" textAnchor="middle" fill="var(--color-ink)">
            {T.scheduler}
          </text>
          <text x="99" y="43" fontSize="12" fill="var(--color-ink-3)">
            {T.schedulerNote}
          </text>
          <line x1="44" y1="52" x2="44" y2="70" stroke="var(--color-ink-3)" strokeWidth="1.5" markerEnd="url(#aa-arrow)" />

          {/* 네 단계 */}
          {STEPS.map((s, i) => {
            const guard = s.no === "02";
            return (
              <g key={s.no}>
                <rect
                  x={x(i)}
                  y={ROW_Y}
                  width={BOX_W}
                  height={BOX_H}
                  rx="10"
                  fill="var(--color-bg)"
                  stroke={guard ? "var(--color-accent)" : "var(--color-line)"}
                  strokeWidth={guard ? 1.6 : 1}
                />
                <text x={x(i) + 14} y={ROW_Y + 21} fontSize="11" fontWeight="600" letterSpacing="0.06em" fill="var(--color-ink-3)">
                  {s.no}
                </text>
                <text x={x(i) + 14} y={ROW_Y + 42} fontSize="16" fontWeight="700" fill="var(--color-ink)">
                  {s.label}
                </text>
                <text x={x(i)} y={ROW_Y + BOX_H + 21} fontSize="12" fill="var(--color-ink-3)">
                  {s.note}
                </text>
                {i < STEPS.length - 1 ? (
                  <line
                    x1={x(i) + BOX_W + 6}
                    y1={ROW_Y + BOX_H / 2}
                    x2={x(i + 1) - 6}
                    y2={ROW_Y + BOX_H / 2}
                    stroke="var(--color-ink-3)"
                    strokeWidth="1.5"
                    markerEnd="url(#aa-arrow)"
                  />
                ) : null}
              </g>
            );
          })}

          {/* 검수에서 갈라지는 정지 경로 — 이 케이스의 핵심이라 색을 준다 */}
          <line
            x1={CHECK_CX}
            y1={ROW_Y + BOX_H + 32}
            x2={CHECK_CX}
            y2="192"
            stroke="var(--color-accent)"
            strokeWidth="1.6"
            markerEnd="url(#aa-stop)"
          />
          <text x={CHECK_CX + 11} y="180" fontSize="12" fontWeight="600" fill="var(--color-accent)">
            {T.anomaly}
          </text>

          <rect x="105" y="198" width={T.stopW} height="70" rx="10" fill="var(--color-accent-soft)" stroke="var(--color-accent)" />
          <text x="125" y="226" fontSize="14" fontWeight="700" fill="var(--color-accent)">
            {T.stopTitle}
          </text>
          <text x="125" y="250" fontSize="12" fill="var(--color-ink-2)">
            {T.stopConditions}
          </text>

          {/* 이 구조를 공유하는 6종 */}
          <line x1="0" y1="304" x2={W} y2="304" stroke="var(--color-line-2)" strokeWidth="1" />
          <text x="1" y="328" fontSize="12" fontWeight="700" letterSpacing="0.09em" fill="var(--color-ink-3)">
            {T.systemsTitle}
          </text>
          {SYSTEMS.map((name, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            const cx = col * 370;
            const cy = 344 + row * 40;
            return (
              <g key={name}>
                <rect x={cx} y={cy} width="350" height="32" rx="8" fill="var(--color-bg-alt)" stroke="var(--color-line-2)" />
                <text x={cx + 14} y={cy + 21} fontSize="12" fill="var(--color-ink-2)">
                  {name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-4 text-caption text-ink-3">
        {T.notes.map((line) => (
          <span key={line} className="block">{line}</span>
        ))}
      </p>
    </figure>
  );
}
