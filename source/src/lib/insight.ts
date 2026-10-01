/**
 * 방문 계측 비콘.
 *
 * 왜 GA4 가 아닌가: 이 사이트의 방문자는 수십 명 규모다. GA4 는 그 규모에서
 * 데이터 임계값으로 보고서를 가려 정작 아무것도 안 보인다. 무료 서드파티는
 * 방문자·조회는 잡지만 스크롤과 섹션 퍼널을 못 잡는다.
 *
 * 왜 인라인 스크립트인가: 정적 배포라 서버가 없고, React 컴포넌트로 만들면
 * 클라이언트 번들에 실린다. 여기서는 1.6KB 인라인이 더 싸고, 무엇보다
 * `edition`·`site` 객체를 건드리지 않아 판별 카피가 브라우저로 새지 않는다.
 *
 * 개인정보:
 *  - 쿠키를 쓰지 않는다. 세션 식별자는 sessionStorage 에만 있고 탭을 닫으면 사라진다.
 *  - Apps Script 웹앱은 요청자 IP 를 스크립트에 넘기지 않는다. 즉 IP 를 받을 수가 없다.
 *  - 지문(fingerprint) 을 만들지 않는다. 화면 폭·언어는 조판 확인용으로만 보낸다.
 *  - Global Privacy Control 을 켠 방문자는 아예 수집하지 않는다.
 *
 * 끄는 방법: 환경변수 NEXT_PUBLIC_INSIGHT_URL 을 비우면 이 스크립트가 아예
 * 나가지 않는다. 붙이기 전 배포본과 산출물이 같아야 하므로 기본값은 '없음' 이다.
 */
export const INSIGHT_URL = process.env.NEXT_PUBLIC_INSIGHT_URL ?? "";

/** 스크롤 깊이·체류 시간을 어느 지점에서 기록할지. 촘촘히 잡을 이유가 없다. */
const DEPTHS = [25, 50, 75, 100];
const DWELLS = [10, 30, 60, 180];

export function insightScript(url: string, site: string): string {
  if (!url) return "";
  return `(function(){
var U=${JSON.stringify(url)},S=${JSON.stringify(site)};
try{if(navigator.globalPrivacyControl===true)return}catch(e){}
var q=[],sid,seq=0,maxD=0,t0=Date.now(),sect="",dd={},wd={};
try{sid=sessionStorage.getItem("_ins");if(!sid){sid=Date.now().toString(36)+Math.random().toString(36).slice(2,8);sessionStorage.setItem("_ins",sid)}}
catch(e){sid="x"+Math.random().toString(36).slice(2,8)}
/* 수신처 코드. 지원처마다 다른 주소(?r=xxxx)를 보내므로, 열린 코드가 곧 누가 봤는지다.
   IP 로 회사를 추정하는 방법과 달리 헛짚지 않는다 — 그 주소를 받은 곳은 한 곳뿐이기 때문이다.
   첫 페이지에서만 주소에 붙어 있으므로 sessionStorage 에 넣어 방문 내내 들고 다닌다. */
var R="";
try{var m=location.search.match(/[?&]r=([A-Za-z0-9_-]{1,24})/);
if(m){R=m[1];sessionStorage.setItem("_ins_r",R)}else{R=sessionStorage.getItem("_ins_r")||""}}catch(e){}
function send(){if(!q.length)return;var b=JSON.stringify({s:S,sid:sid,r:R,tz:-new Date().getTimezoneOffset(),v:q});q=[];
try{if(navigator.sendBeacon&&navigator.sendBeacon(U,new Blob([b],{type:"text/plain;charset=UTF-8"})))return}catch(e){}
try{fetch(U,{method:"POST",body:b,mode:"no-cors",keepalive:true,headers:{"Content-Type":"text/plain;charset=UTF-8"}})}catch(e){}}
function ev(n,d){var o={e:n,t:Date.now()-t0,p:location.pathname,i:++seq};for(var k in d)o[k]=d[k];q.push(o);if(q.length>=14)send()}
/* 화면 크기는 innerWidth 만 믿으면 안 된다 — 스크립트가 도는 순간 0 이 잡히는 창이 있다.
   실측에서 w:0,h:0 으로 들어왔다. clientWidth 를 함께 보고 큰 값을 쓴다. */
var W=0,H2=0;
function vw(){var v=Math.max(innerWidth||0,(document.documentElement||{}).clientWidth||0);if(v>W)W=v;return v}
function vh(){var v=Math.max(innerHeight||0,(document.documentElement||{}).clientHeight||0);if(v>H2)H2=v;return v}
ev("view",{r:(document.referrer||"").slice(0,180),w:vw(),h:vh(),dpr:devicePixelRatio||1,l:(navigator.language||"").slice(0,8)});
/* 진입은 바로 보낸다. 묶음이 찰 때까지 기다리면, 열자마자 닫은 방문이 통째로 사라진다.
   그 방문이야말로 알아야 하는 것이다. 이후 20초마다 한 번씩 비운다 — 탭이 강제 종료돼도
   마지막 20초분만 잃는다. pagehide 하나에만 기대면 모바일에서 통째로 날아간다. */
send();
setInterval(send,20000);
/* 스크롤 깊이. rAF 를 쓰지 않는다 — 그려지지 않는 창에서는 아예 돌지 않는다. */
var tick=0;
function depth(){var n=Date.now();if(n-tick<180)return;tick=n;
var H=document.documentElement.scrollHeight,V=vh(),d=H>V?Math.min(100,Math.round((scrollY+V)/H*100)):100;
if(d>maxD)maxD=d;
${JSON.stringify(DEPTHS)}.forEach(function(m){if(maxD>=m&&!dd[m]){dd[m]=1;ev("depth",{d:m})}})}
addEventListener("scroll",depth,{passive:true});addEventListener("resize",depth,{passive:true});depth();
/* 체류. 탭이 숨으면 시간을 세지 않는다 — 열어만 두고 안 본 시간을 읽은 시간으로 세면 안 된다. */
var vis=Date.now(),acc=0;
function seen(){return Math.round((acc+(document.hidden?0:Date.now()-vis))/1000)}
setInterval(function(){var s=seen();${JSON.stringify(DWELLS)}.forEach(function(m){if(s>=m&&!wd[m]){wd[m]=1;ev("dwell",{d:m})}})},2000);
addEventListener("visibilitychange",function(){if(document.hidden){acc+=Date.now()-vis;send()}else{vis=Date.now()}});
/* 섹션 도달. 본문에서 실제로 높이가 있는 칸만 본다 — 각주·마퀴 앵커를 세면 퍼널이 더러워진다. */
try{var io=new IntersectionObserver(function(es){es.forEach(function(x){
if(x.isIntersecting&&!x.target.__s){x.target.__s=1;sect=x.target.id;ev("sect",{k:x.target.id})}})},{threshold:0.4});
[].forEach.call(document.querySelectorAll("main [id]"),function(el){
if(el.getBoundingClientRect().height>=240)io.observe(el)})}catch(e){}
/* 링크 클릭. 어디로 나갔는지가 이 사이트의 전환이다. */
addEventListener("click",function(e){var a=e.target&&e.target.closest&&e.target.closest("a[href]");if(!a)return;
var h=a.getAttribute("href")||"",g=h.toLowerCase(),k="link",F=function(x){return g.indexOf(x)>-1};
/* 정규식을 쓰지 않는다. 이 문자열은 템플릿 리터럴 안에 있어서 역슬래시가 한 겹 벗겨지고,
   그러면 /\/resume/ 이 //resume/ 로 나가 스크립트 전체가 SyntaxError 로 죽는다. 실제로 죽었다. */
if(g.indexOf("mailto:")===0)k="mail";else if(F(".pdf"))k="pdf";else if(F("/evidence/"))k="evidence";
else if(F("/resume"))k="resume";else if(F("/projects/"))k="case";
else if((g.indexOf("http://")===0||g.indexOf("https://")===0)&&h.indexOf(location.host)<0)k="external";
ev("out",{k:k,u:h.slice(0,140),x:(a.textContent||"").trim().slice(0,40)});if(k!=="case")send()},true);
/* 이탈. 마지막 깊이·읽은 시간·마지막으로 본 칸을 함께 남긴다. */
/* pagehide 와 beforeunload 가 둘 다 발화해서 end 가 두 번 들어왔다. 한 번만 남긴다. */
var done=0;
/* 화면 크기를 여기서도 보낸다. 진입 순간에는 아직 0 인 창이 있어서 view 만으로는 못 믿는다. */
function bye(){if(done)return;done=1;vw();vh();ev("end",{d:maxD,sec:seen(),k:sect,w:W,h:H2});send()}
addEventListener("pagehide",bye);
addEventListener("beforeunload",bye);
})();`;
}
