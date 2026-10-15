import Link from "next/link";
import { Container } from "@/components/ui";

export default function NotFound() {
  return (
    <section className="flex min-h-[calc(100vh-72px)] items-center bg-bg-alt pt-[72px]">
      <Container>
        <div className="max-w-[38rem] border-t-2 border-accent py-12 sm:py-16">
          <p className="tnum text-caption font-semibold text-accent">404</p>
          <h1 className="mt-4 text-[2rem] leading-[1.25] font-bold tracking-normal sm:text-h1">
            요청한 페이지를 찾을 수 없습니다.
          </h1>
          <p className="mt-4 text-small text-ink-2 sm:text-body">
            <span className="block">주소가 바뀌었거나 삭제된 페이지입니다.</span>
            <span className="block">포트폴리오의 대표 사례 목록에서 다시 확인해 주세요.</span>
          </p>
          <Link
            href="/#projects"
            className="mt-8 inline-flex min-h-[52px] items-center justify-center rounded-card bg-accent px-6 text-small font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            대표 사례로 돌아가기
          </Link>
        </div>
      </Container>
    </section>
  );
}
