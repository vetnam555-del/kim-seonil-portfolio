import type { Metadata, Viewport } from "next";
import Link from "next/link";
import BrandWall from "@/components/BrandWall";
import CreativeHistory from "@/components/CreativeHistory";
import OtherResults from "@/components/OtherResults";
import { BuiltByMe, Credits, HowIWork, MyStory, SkillsStack, WhatsNext } from "@/components/sections";
import { Container } from "@/components/ui";
import { EDITION } from "@/data/edition";

/*
 * 이야기와 역량 (2026.09.24 공용판 개편).
 *
 * 홈을 레퍼런스 수준의 입구로 줄이면서, 홈에 있던 깊은 층을 이 페이지로 옮겼다.
 * 지운 것이 아니라 자리만 바꿨다 — 컴포넌트와 문구는 옛 홈과 같다(일하는 방식 · 자동화 전체 ·
 * 기획·운영 범위 · 광고주 · 이야기 · 창업 기록 · 다음 역할 · 경력과 수상 · 편집 원칙).
 * 다른 판은 홈에 그대로 실려 있으므로 이 페이지를 쓰지 않는다.
 */
export const metadata: Metadata = {
  title: "일하는 방식과 경력",
  description: "일하는 방식, 추가 운영 성과, 운영한 광고주, 업무 자동화 전체, 기획·운영 범위, 걸어온 이야기와 창업 기록, 경력·수상.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

/*
 * 순서 (2026.09.24 재배치): 이야기 → 창업 기록 → 일하는 방식 → 추가 운영 성과 → 광고주 → 자동화 → 역량 → 다음 역할 → 경력.
 * 상단 메뉴 이름이 "이야기·경력"인데 이야기가 7화면째(모바일 14화면째)에 있었고, 앞 여섯 화면은
 * 홈에서 이미 본 자동화·역량의 확장판이었다. 이 페이지에만 있는 것을 앞에 둔다.
 */
/*
 * 순서를 다시 바꿨다 (2026.09.25 경력직 개편): 일하는 방식 → 추가 운영 성과 → 광고주 → 자동화 → 역량 → 이야기 → 창업 기록 → 다음 역할 → 경력.
 * 위 09.24 재배치는 "이 페이지에만 있는 것을 앞에" 라는 이유로 이야기를 맨 앞에 뒀는데, 그러면 경력직 서류의
 * 두 번째 페이지가 고등학교 동아리로 열렸다(사용자 지적 "신입이면 이해하는데 경력직하고는 안 맞는다").
 * 이 페이지에만 있는 것 가운데 일에 관한 것(방식·추가 성과·광고주)을 앞에, 출발점 이야기는 뒤로 둔다.
 */
const JUMPS = [
  { href: "#method", label: "일하는 방식" },
  { href: "#more-results", label: "추가 운영 성과" },
  { href: "#brands", label: "운영한 광고주" },
  { href: "#automation", label: "업무 자동화" },
  { href: "#skills", label: "기획·운영 범위" },
  { href: "#story", label: "이야기" },
  { href: "#creative-roots", label: "창업·기획 기록" },
  { href: "#career", label: "경력과 수상" },
];

export default function AboutPage() {
  if (EDITION !== "general") {
    return (
      <section className="pt-[144px] pb-24">
        <Container>
          <p className="text-body">
            이 판에서는 홈에 모두 실려 있습니다. <Link href="/" className="underline">홈으로 가기</Link>
          </p>
        </Container>
      </section>
    );
  }
  return (
    <div className="about-light">
      <section className="folio-about-head">
        <div className="folio-wrap">
          <Link href="/" className="folio-link-quiet">← 홈으로</Link>
          <h1 className="folio-h2">일하는 방식과 경력</h1>
          <p className="folio-lead">일하는 방식과 홈에 싣지 못한 운영 성과, 자동화 전체, 경력과 수상, 그리고 여기까지 온 이야기를 모았습니다.</p>
          <nav aria-label="이 페이지 바로가기" className="folio-jumps">
            {JUMPS.map((j) => (
              <a key={j.href} href={j.href}>{j.label}</a>
            ))}
          </nav>
        </div>
      </section>
      <HowIWork />
      <OtherResults />
      <BrandWall />
      <BuiltByMe />
      <SkillsStack />
      <MyStory />
      <CreativeHistory />
      <WhatsNext />
      <Credits />
    </div>
  );
}
