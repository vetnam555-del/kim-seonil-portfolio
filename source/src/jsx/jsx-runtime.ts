/*
 * tsconfig "jsxImportSource": "@/jsx" 로 모든 JSX 가 이 런타임을 거친다 — React 런타임을 그대로 쓰고,
 * 글자 children 에만 withJoinedDots(가운뎃점이 줄 맨 앞에 오지 않게)를 적용한다(B-06, 설명은 joinDots.ts).
 * 서버 렌더와 브라우저 하이드레이션이 같은 함수를 거치므로 두 쪽 글자가 같다.
 */
import { Fragment, jsx as reactJsx, jsxs as reactJsxs } from "react/jsx-runtime";
import { withJoinedDots } from "./joinDots";

export { Fragment };
export type { JSX } from "react/jsx-runtime";

export const jsx: typeof reactJsx = (type, props, key) => reactJsx(type, withJoinedDots(type, props), key);
export const jsxs: typeof reactJsxs = (type, props, key) => reactJsxs(type, withJoinedDots(type, props), key);
