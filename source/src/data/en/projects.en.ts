/**
 * 영문판 사례 데이터 (2026.09.25).
 *
 * 한국어 projects 를 그대로 복제한 뒤, projects.en.json 의 "경로 → 영문" 표로 문장만 바꾼다.
 * 숫자·파일·구조는 한국어 원본에서 온다 — 영문판에서 값이 따로 놀 수 없게 하기 위해서다.
 * 경로가 원본에 없으면 빌드에서 멈춘다(오타로 번역이 조용히 빠지는 것을 막는다).
 * 숫자 대조와 한글 잔존 검사는 scripts/check_en.mjs 가 맡는다.
 */
import { projects, type Project } from "@/data/projects";
import { EN_SLUGS } from "./meta";
import translations from "./projects.en.json";

export { EN_SLUGS };

type PathMap = Record<string, string>;

function setPath(root: unknown, path: string, value: string, slug: string) {
  const keys = path.match(/[^.[\]]+/g) ?? [];
  let node = root as Record<string, unknown>;
  keys.forEach((key, index) => {
    const last = index === keys.length - 1;
    const container = node as Record<string, unknown>;
    if (!(key in container)) throw new Error(`[projects.en] ${slug}: 원본에 없는 경로 "${path}"`);
    if (last) {
      if (typeof container[key] !== "string") throw new Error(`[projects.en] ${slug}: 문자열이 아닌 경로 "${path}"`);
      container[key] = value;
    } else {
      node = container[key] as Record<string, unknown>;
    }
  });
}

function translate(project: Project, map: PathMap): Project {
  const copy = structuredClone(project);
  for (const [path, value] of Object.entries(map)) setPath(copy, path, value, project.slug);
  return copy;
}

const table = translations as Record<string, PathMap>;

export const projectsEn: Project[] = EN_SLUGS.map((slug) => {
  const ko = projects.find((p) => p.slug === slug);
  if (!ko) throw new Error(`[projects.en] 한국어 원본 없음: ${slug}`);
  return translate(ko, table[slug] ?? {});
});

export function getProjectEn(slug: string): Project | undefined {
  return projectsEn.find((p) => p.slug === slug);
}

export function getNextProjectEn(p: Project): Project {
  const i = projectsEn.findIndex((x) => x.slug === p.slug);
  return projectsEn[(i + 1) % projectsEn.length];
}
