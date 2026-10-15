import ProjectsSection from "@/components/ProjectsSection";
import CreativeHistory from "@/components/CreativeHistory";
import ShinsegaeFit from "@/components/ShinsegaeFit";
import AblyFit from "@/components/AblyFit";
import {
  BuiltByMe,
  Cover,
  Credits,
  HowIWork,
  MyStory,
  SkillsStack,
  WhatsNext,
  WhyLead,
  WhyLululala,
} from "@/components/sections";
import HomeNew from "@/components/HomeNew";
import HomeFolio from "@/components/HomeFolio";
import type { Metadata } from "next";
import { EDITION, edition, isNew } from "@/data/edition";
import { langAlternates } from "@/data/en/alternates";

/* 영문 홈과 짝 주소 — 공용판만 (2026.09.25) */
export const metadata: Metadata = { alternates: langAlternates("", "en/") };

/**
 * 잡지 한 권의 순서로 읽힌다.
 * 표지(검증 수치) → 특집 → [hll: 지원 이유] → 다룰 수 있는 것 → 직접 만든 것
 * → 판단 방식 → [일반: 초기 기획·제작 증빙] → 그 방식이 어디서 왔는가
 * → [일반: 다음 역할] → 판권면.
 *
 * ── 지원 이유의 위치를 판마다 다르게 두는 이유
 * hll 판은 특정 팀에 내는 서류다. 읽는 쪽이 가장 먼저 답을 원하는 질문은
 * "왜 우리 팀인가 / 오면 무엇을 하는가"인데, 이게 8개 섹션 중 7번째에 있었다.
 * 중간에서 읽기를 멈춘 사람은 성과·데이터·자동화만 보고 지원 동기는 못 본 채 닫는다.
 * 그래서 특집 바로 뒤로 올린다 — 근거를 먼저 보여주고 곧바로 지원 논거로 잇는다.
 *
 * 일반판은 읽는 쪽이 정해져 있지 않아 지원 논거 자체가 없다. WhatsNext 는
 * "다음에 어떤 문제를 맡고 싶은가"라는 닫는 말이므로 그대로 마지막에 둔다.
 * CreativeHistory 는 대표 경력 사례보다 앞세우지 않는다. 공모전·펀딩·인턴 작업은
 * 현재 역량의 출발점을 증명하지만, 채용 판단의 첫 근거는 최근 실무 성과여야 한다.
 *
 * ── SkillsStack 을 BuiltByMe 앞으로 옮긴 이유
 * 지면 색이 ink → white → paper 로 교대해야 스크롤 리듬이 유지되는데,
 * why-studio(paper)를 앞으로 올리면 automation(paper)과 붙어 두 지면이 한 덩어리로 읽힌다.
 * 순서를 바꾸면 색이 다시 교대하고, "다룰 수 있는 것 → 그걸로 직접 만든 것"이라는
 * 읽는 순서도 오히려 자연스러워진다.
 *   hll  : paper → white → paper → ink → white → ink
 *   일반 : white → paper → ink → white → paper → ink
 */
export default function Home() {
  /*
   * 홈만 갈아 끼운다. 케이스 상세·이력서는 그대로 쓴다 — 그쪽이 이 사이트의 깊이다.
   *
   * 새 홈은 개편판(nw)에서만 쓴다. 2026-09-10 에 일반판까지 넘겼다가 되돌렸다 —
   * 개편은 `_new` 주소에서 하기로 한 것이었는데 이미 지원처에 나간 공용판을 갈아엎었다.
   * 공용판 주소는 에이블리 지원서와 리멤버 프로필이 가리키는 곳이다. 여기는 요청 없이
   * 바꾸지 않는다.
   */
  if (isNew) return <HomeNew />;
  /* 공용판은 2026.09.24 부터 입구형 홈 — 깊은 층은 /about/ 과 사례 상세로 옮겼다 */
  if (EDITION === "general") return <HomeFolio />;
  return (
    <>
      <Cover />
      {/* 특집이 6.6화면이라 지원 논거가 51% 지점에서야 닿았다 — 요약만 앞으로 뺀다 */}
      {edition.showWhyStudio ? <WhyLead /> : null}
      {edition.showWhyShinsegae ? <ShinsegaeFit /> : null}
      {edition.showWhyAbly ? <AblyFit /> : null}
      <ProjectsSection />
      {/*
        업종별 광고주 표(BrandWall)는 공용판 전용이었다 — 2026.09.24 부터 공용판은 위에서
        HomeFolio 로 갈라지고 광고주 표는 /about/ 에 있다. 여기 남은 판들은 지원처에 나간 화면 그대로다.
      */}
      {edition.showWhyStudio ? <CreativeHistory /> : null}
      {edition.showWhyStudio ? <WhyLululala /> : null}
      <SkillsStack />
      <BuiltByMe />
      <HowIWork />
      {edition.showWhyStudio ? null : <CreativeHistory />}
      <MyStory />
      {edition.showWhyStudio || edition.showWhyShinsegae || edition.showWhyAbly ? null : <WhatsNext />}
      <Credits />
    </>
  );
}
