import type { Metadata } from "next";
import Link from "next/link";
import HomeFolio from "@/components/HomeFolio";
import { Container } from "@/components/ui";
import { EDITION, OG_VERSION } from "@/data/edition";
import { langAlternates } from "@/data/en/alternates";

/*
 * 영문 홈 (2026.09.25) — 레퍼런스(dainahys)처럼 같은 사이트 안에 언어별 주소를 둔다.
 * 공용판 입구형 홈(HomeFolio)과 같은 구성이고 문장만 영문이다. 다른 판은 영문판이 없다.
 */
/* 2026.09.25 한국어판 경력직 개편(직함 하나 · 결과형 첫 문장)에 맞췄다 — 옛 제목·설명이 영문판에만 남아 있었다 */
const title = "Kim Seonill | Performance Marketer Portfolio";
const description =
  "Find. Test. Improve. I structure problems into hypotheses and improve them through testing — performance marketer portfolio of Kim Seonill, 30+ brands at PlayD and HLL JoongAng.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  alternates: langAlternates("", "en/"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "en/",
    title,
    description,
    images: [{ url: `og-image.png?v=${OG_VERSION}`, width: 1200, height: 630, alt: "Kim Seonill portfolio" }],
  },
  twitter: { card: "summary_large_image", title, description, images: [`og-image.png?v=${OG_VERSION}`] },
};

export default function HomeEn() {
  if (EDITION !== "general") {
    return (
      <section className="pt-[144px] pb-24" lang="en">
        <Container>
          <p className="text-body">
            The English version is part of the general edition. <Link href="/" className="underline">Go to home</Link>
          </p>
        </Container>
      </section>
    );
  }
  return (
    <div lang="en">
      <HomeFolio lang="en" />
    </div>
  );
}
