import { edithReels } from "@/data/reels";

/**
 * EDIT H 사례의 AI 영상 릴스 세 편 (2026.11.17 주인 "EDIT H 는 릴스 영상 만들어 놓은 것도 반영해 줘").
 *
 * 그전에는 결과 칸의 한 줄("11월부터 AI 영상 릴스 · 웹툰도 게시")뿐이라 무엇을 올리는지 볼 수 없었다.
 * 사례 지면의 다른 영상 증빙과 같은 규칙을 따른다 — 스스로 재생하지 않고, 표지가 깔려 있다가 누르면 소리와 함께 재생한다
 * (preload="none" 이라 누르기 전에는 영상을 받지 않는다). 세로 9:16 세 편을 한 줄에 둔다.
 * 칸이 480px 보다 좁으면(휴대폰) 옆으로 넘기는 줄로 바꾼다 — 두 칸 + 한 칸으로 접으면 셋째 편이 혼자 남고 칸도 작아
 * 영상 속 자막이 안 읽혔다. 한 편은 크게(칸의 60%), 다음 편은 걸쳐 보여 넘길 수 있음을 알린다. 화면 폭이 아니라 칸 폭으로 나눈다
 * (본문 칸은 768 – 1023px 화면에서 488 – 540px 로 줄어든다).
 * 발행 주기는 적지 않는다 — 11.13 – 11.17 은 평일마다였고 11.18 부터는 주 1회(월요일)로 바뀌어, "매일"로 읽히는 말은 틀린다.
 * 설명은 공개 아카이브의 문서에 있는 것만 적는다: automation/RUNBOOK_REEL.md(20초 + 끝 화면 · 첫 장면 '숫자 + 나 질문' ·
 * 영상 · 목소리 AI 생성)와 automation/pilots/ai_reel/qa.py(숫자 대조 · 받아쓰기 발음 · 자막 싱크 · 검은 화면 — 하나라도 걸리면 올리지 않는다 ·
 * 캡션의 'AI로 만들' 표기 · 실제 인물 · 회사 로고 금지).
 * 영문 사례 쪽은 없다(EDIT H 는 국문 상세만 있다).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function EdithReels() {
  return (
    <figure id="edith-reels" className="mt-9 scroll-mt-28 border-t border-line-2 pt-8">
      <h4 className="text-[1.125rem] font-bold leading-[1.5] text-ink">AI 영상 릴스 '오늘 아침 5가지'</h4>
      <p className="mt-2 text-small text-ink-2">
        담당 범위: 형식 기획{" "}· 제작 규칙{" "}· 검수 항목 / 영상·목소리는 AI 생성, 제작은 AI 루틴
      </p>
      <div className="@container">
        <ul className="no-scrollbar -mx-5 mt-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 @[480px]:mx-0 @[480px]:grid @[480px]:max-w-[40rem] @[480px]:grid-cols-3 @[480px]:gap-4 @[480px]:overflow-visible @[480px]:px-0">
          {edithReels.map((reel) => (
            <li key={reel.id} className="w-[60%] max-w-[240px] shrink-0 snap-start @[480px]:w-auto @[480px]:max-w-none">
              <video
                src={`${basePath}/evidence/edith-reel-${reel.id}.mp4`}
                poster={`${basePath}/evidence/edith-reel-${reel.id}-poster.webp`}
                width={540}
                height={960}
                controls
                playsInline
                preload="none"
                aria-label={`EDIT H ${reel.date}호 릴스 — ${reel.title}`}
                className="block aspect-[9/16] h-auto w-full rounded-card border border-line bg-bg-alt object-cover"
              />
              <p className="tnum mt-2 text-caption text-ink-3">
                {reel.date}{" "}· VOL.{reel.vol}
              </p>
            </li>
          ))}
        </ul>
      </div>
      <figcaption className="mt-4 max-w-[46rem] text-small leading-[1.75] text-ink-2">
        <p>
          11월에 그날의 메인 5가지를 20초 영상 한 편으로 묶는 릴스를 시작했습니다. 캐릭터 H가 소식을 몸으로 보여 주고, 첫 장면에는 그날의
          핵심 숫자 하나와 보는 사람에게 닿는 질문 하나를 둡니다. 영상과 목소리는 AI로 만들었고 게시물에도 그렇게 적습니다. 올리기 전 검수가
          화면의 숫자를 그날 원고와 대조하고 받아쓰기로 발음과 자막 싱크를 확인하며, 하나라도 걸리면 올리지 않습니다.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 marker:text-accent">
          <li>위 세 편은 2026.11.13{" "}· 11.16{" "}· 11.17호 — 누르면 소리와 함께 재생</li>
          <li>장면마다 출처를 적고 숫자는 기사 두 곳에서 확인한 값만 사용</li>
          <li>실제 인물과 회사 로고는 넣지 않음</li>
        </ul>
      </figcaption>
    </figure>
  );
}
