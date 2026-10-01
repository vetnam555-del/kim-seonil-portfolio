import fs from "node:fs";
const f="scripts/render_og_cases.mjs";
let s=fs.readFileSync(f,"utf8");
const a=`  general: {
    deck: "월 10억 규모 매체를 운영하고, 그 돈이 매출로 이어졌는지 같은 기준으로 다시 확인합니다",`;
const b=`  general: {
    /* 사이트 첫 문장과 같아야 한다. 링크 미리보기와 실제 첫 화면이 다른 말을 하면
       공유받은 사람이 두 번 읽는다. generalProfile.title 을 바꾸면 여기도 바꾼다. */
    deck: "문제를 다시 정의하고, 성과로 검증하고, 다시 쓸 수 있는 구조로 남깁니다",`;
if(!s.includes(a)){console.error("MISS og");process.exit(1);}
fs.writeFileSync(f, s.replace(a,b));
console.log("  ✓ 일반판 OG 문장을 히어로와 일치");
