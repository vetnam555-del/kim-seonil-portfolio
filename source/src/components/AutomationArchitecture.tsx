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
 */
const W = 720;

/* 영문판(2026.09.25)은 같은 그림에 글자만 바꾼다. 수치는 두 언어가 같다 */
const TXT = {
  ko: {
    steps: [
      { no: "01", label: "수집", note: "매체 API · 최대 900개" },
      { no: "02", label: "검수", note: "정상 여부 먼저 확인" },
      { no: "03", label: "실행", note: "광고 중단 · 재시작" },
      { no: "04", label: "기록", note: "로그 · 인수인계 문서" },
    ],
    systems: [
      "재고 자동 운영 · 회당 최대 900개",
      "리포트 엔진 · 매체 별칭 38종 매핑",
      "이상 징후 모니터링 3건",
      "광고비 정산 · 월 최대 84건",
      "월간 리포트 PDF 자동 발송",
      "업무 지식봇 2종 · 854개 파일",
    ],
    caption: "실행 구조 — 수집이 온전했는지 먼저 확인하고, 확인되지 않으면 광고를 건드리지 않습니다",
    aria: "자동화 실행 구조도. 스케줄러가 정해진 주기로 수집·검수·실행·기록 네 단계를 돌리고, 검수에서 기준 파일 부재·표본 0건·재고 미상 비율 초과·수집 실패율 초과 중 하나라도 감지되면 광고를 건드리지 않고 멈춘 뒤 담당자에게 알립니다. 이 구조로 시스템 여섯 종이 돌아갑니다.",
    oneRun: "한 번의 실행",
    scheduler: "스케줄러",
    schedulerNote: "정해진 주기로 실행",
    anomaly: "이상 감지",
    stopTitle: "광고를 건드리지 않고 멈춘 뒤 담당자에게 알립니다",
    stopConditions: "기준 파일 부재 · 표본 0건 · 재고 미상 비율 초과 · 수집 실패율 초과",
    stopW: 465,
    systemsTitle: "이 구조로 돌아가는 시스템 6종",
    notes: ["구조만 옮긴 그림입니다.", "광고주 데이터와 계정 정보는 들어 있지 않습니다.", "실제 스케줄러 설정과 실행 로그는 인터뷰 시 함께 보여드릴 수 있습니다."],
  },
  en: {
    steps: [
      { no: "01", label: "Collect", note: "Media API · up to 900" },
      { no: "02", label: "Check", note: "Validate data first" },
      { no: "03", label: "Execute", note: "Pause · restart ads" },
      { no: "04", label: "Log", note: "Logs · handover docs" },
    ],
    systems: [
      "Inventory auto-ops · up to 900 per run",
      "Report engine · 38 media aliases mapped",
      "Anomaly monitoring · 3 checks",
      "Ad-spend settlement · up to 84 a month",
      "Monthly report PDF · auto-sent",
      "Work knowledge bots ×2 · 854 files",
    ],
    caption: "How one run works — it checks the collection was complete first, and leaves the ads untouched if it can't confirm that",
    aria: "Automation run diagram. A scheduler runs four steps on a fixed cycle: collect, check, execute, log. If the check finds a missing baseline file, zero samples, too many unknown stock values or too many failed fetches, it stops without touching the ads and alerts the owner. Six systems run on this structure.",
    oneRun: "ONE RUN",
    scheduler: "Scheduler",
    schedulerNote: "Runs on a fixed cycle",
    anomaly: "Anomaly found",
    stopTitle: "Stop without touching the ads, then alert the owner",
    stopConditions: "No baseline file · 0 samples · unknown-stock ratio or fetch failures over limit",
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

export default function AutomationArchitecture({ lang = "ko" }: { lang?: "ko" | "en" }) {
  const T = TXT[lang];
  const STEPS = T.steps;
  const SYSTEMS = T.systems;
  return (
    <figure className="mt-9 border-t border-line-2 pt-8">
      <figcaption className="text-caption font-semibold text-ink-3">
        {T.caption}
      </figcaption>

      {/*
        좁은 화면에서는 그림을 더 줄이지 않고 칸 안에서 가로로 민다.
        글자를 줄이면 360px 에서 읽을 수가 없다. 배치 검수는 스스로 스크롤하는
        칸 안의 넘침은 세지 않는다(qa_layout).
      */}
      <div className="mt-5 overflow-x-auto">
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
