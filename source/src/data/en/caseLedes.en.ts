/**
 * 영문판 사례 단마다 요지 한 줄 (2026.09.25) — caseLedes.ts 의 같은 자리 문장을 옮긴 것이다.
 * 새 사실을 더하지 않고, 수치와 기준은 한국어 문장과 같다.
 */
export const caseLedesEn: Record<string, { problem?: string; analysis?: string; strategy?: string; results?: string; learning?: string }> = {
  jestina: {
    problem: "Revenue was concentrated in search, and the display ads (DA) meant to bring in new customers ran separately at each agency.",
    analysis: "Looking at repeat and new customers separately, search was mostly bringing back people who already knew the brand.",
    strategy: "I gave each stage — awareness, consideration, conversion — its own channels and KPIs.",
    results: "In the same closing report, GA4 ROAS rose from 352% in May to 583% in July.",
    learning: "Ranked by channel efficiency alone, the budget kept going to customers who already knew the brand.",
  },
  newbalance: {
    problem: "When stock changed, nothing told the ad side.",
    analysis: "While stock-outs went unnoticed, ad spend kept going out.",
    strategy: "I put inventory into ad decisions, and made sure ads are left untouched when the data looks wrong.",
    results: "Measured as an internal daily average, inventory and ops checks fell from about 2 hours to under 5 minutes.",
    learning: "There was a ROAS of 13,846%, but it had no cost behind it, so I didn't use it as a reason to raise budget.",
  },
  daekyo: {
    problem: "The 'performance dropped' report had a creative that spent only about KRW 9,000 mixed into its comparison.",
    analysis: "Measured again on the same sample, the click-through rate dipped slightly but the conversion rate more than tripled.",
    strategy: "Instead of overhauling creatives, I started with where people dropped out of the consultation form.",
    results: "Recalculated on the same sample without the low-spend creative, CVR went from 0.66% to 2.24%.",
    learning: "When form fields are cut, consultation connection rate has to be read alongside CVR.",
  },
  dyson: {
    problem: "More budget was going to display (DP) ads, which were performing worse.",
    analysis: "On the same basis, video had a higher CTR and a lower CPC than DP.",
    strategy: "I set separate success measures for subscriptions, live and content, and compared ad formats on the same yardstick.",
    results: "Video ad CTR rose from 2.16% in February 2024 to 3.14% in March.",
    learning: "Put subscription and sales campaigns in one ranking, and both get misread.",
  },
  gangwon: {
    problem: "Each report counted a different scope, so the same account showed different numbers.",
    analysis: "Shopping search drove the growth; brand search kept its impressions and clicks while only conversions fell.",
    strategy: "I added Instagram group-buys beyond search and shopping ads, and bid Shopping Search by product myself.",
    results: "July 2026 store sales rose 397.3% over the same period last year, and H1 ROAS on ad-attributed revenue alone rose from 201% to 238%.",
    learning: "When reports disagreed, I waited for the approved closing figures.",
  },
  automation: {
    problem: "It started as a way to cut one-by-one manual checks and make time for decisions.",
    analysis: "Even data from a half-finished collection could switch off ads all at once.",
    strategy: "Ads change only when the data passes every soundness condition.",
    results: "Six tasks moved into systems, and each one's effect is recorded separately.",
    learning: "Because stop conditions came first, I never had to undo a bad run while operating it.",
  },
};
