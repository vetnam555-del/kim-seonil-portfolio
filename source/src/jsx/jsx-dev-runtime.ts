/* next dev 용 — jsx-runtime.ts 와 같다(B-06) */
import { Fragment, jsxDEV as reactJsxDEV } from "react/jsx-dev-runtime";
import { withJoinedDots } from "./joinDots";

export { Fragment };
export type { JSX } from "react/jsx-dev-runtime";

export const jsxDEV: typeof reactJsxDEV = (type, props, key, isStatic, source, self) =>
  reactJsxDEV(type, withJoinedDots(type, props), key, isStatic, source, self);
