/**
 * 포트폴리오 방문 계측 — 요약.
 *
 * 원본(events)을 다시 읽어 '요약' 시트를 새로 쓴다. 원본은 건드리지 않는다.
 * 메뉴 [계측] → [요약 다시 만들기] 로 돌리거나, 트리거로 매일 돌린다.
 *
 * 이 사이트의 퍼널은 상거래 퍼널이 아니다. 평가하러 온 사람이
 * 어디까지 읽고 무엇을 눌렀는지가 전환이다. 그래서 단계를 이렇게 잡았다:
 *
 *   방문 → 히어로 통과(스크롤 시작) → 케이스 목록 도달 → 케이스 상세 진입
 *        → 증빙 원본 열기 → 이력서·PDF 열기 → 메일
 *
 * '히어로 통과' 를 둔 이유: 첫 화면에서 나간 사람과 읽다가 나간 사람은
 * 전혀 다른 신호인데, 방문 수만 보면 구분이 안 된다.
 */

/** events 시트의 열 위치. Code.gs 의 HEAD 와 순서가 같아야 한다. */
var C = { ts: 0, recv: 1, sid: 2, seq: 3, ev: 4, path: 5, sect: 6, depth: 7, sec: 8,
          kind: 9, target: 10, label: 11, ref: 12, w: 13 };

function onOpen() {
  SpreadsheetApp.getUi().createMenu('계측')
    .addItem('요약 다시 만들기', 'buildSummary')
    .addItem('보낼 링크 만들기', 'makeLinks')
    .addToUi();
}

function buildSummary() {
  var ss = SpreadsheetApp.getActive();
  var src = ss.getSheetByName('events');
  if (!src || src.getLastRow() < 2) { SpreadsheetApp.getUi().alert('아직 쌓인 이벤트가 없습니다.'); return; }

  var v = src.getRange(2, 1, src.getLastRow() - 1, 19).getValues();
  var S = {}, pageViews = {}, sectHit = {}, outKind = {}, refs = {};

  v.forEach(function (r) {
    var sid = r[C.sid];
    if (!sid) return;
    var s = S[sid] || (S[sid] = { first: r[C.ts], recv: '', paths: {}, depth: 0, sec: 0,
                                  outs: {}, sects: {}, w: r[C.w] });
    if (r[C.recv]) s.recv = String(r[C.recv]);
    var ev = r[C.ev], path = r[C.path];
    if (path) { s.paths[path] = 1; if (ev === 'view') pageViews[path] = (pageViews[path] || 0) + 1; }
    if (ev === 'depth' && r[C.depth] > s.depth) s.depth = r[C.depth];
    if (ev === 'end') { if (r[C.depth] > s.depth) s.depth = r[C.depth]; if (r[C.sec] > s.sec) s.sec = r[C.sec]; }
    if (ev === 'dwell' && r[C.depth] > s.sec) s.sec = r[C.depth];
    if (ev === 'sect' && r[C.sect]) { s.sects[r[C.sect]] = 1; sectHit[r[C.sect]] = (sectHit[r[C.sect]] || 0) + 1; }
    if (ev === 'out' && r[C.kind]) { s.outs[r[C.kind]] = 1; outKind[r[C.kind]] = (outKind[r[C.kind]] || 0) + 1; }
    if (ev === 'view' && r[C.ref]) refs[shortRef_(r[C.ref])] = (refs[shortRef_(r[C.ref])] || 0) + 1;
  });

  var ids = Object.keys(S), n = ids.length;
  var f = step_(ids, S);
  var depthBuckets = { '0–25': 0, '25–50': 0, '50–75': 0, '75–100': 0 };
  var bounce = 0, secs = [];
  ids.forEach(function (id) {
    var s = S[id];
    if (isBounce_(s)) bounce++;
    var d = s.depth;
    depthBuckets[d < 25 ? '0–25' : d < 50 ? '25–50' : d < 75 ? '50–75' : '75–100']++;
    secs.push(s.sec);
  });

  var out = ss.getSheetByName('요약') || ss.insertSheet('요약');
  out.clear();
  var rows = [];
  rows.push(['포트폴리오 방문 요약', '', '', '갱신 ' + now_()]);
  rows.push([]);

  // ── 누가 봤나 ─────────────────────────────────────────────
  rows.push(['누가 봤나', '방문', '가장 깊이', '읽은 시간', '어디까지', '마지막 방문']);
  var byRecv = {};
  ids.forEach(function (id) {
    var k = S[id].recv || '(코드 없는 방문)';
    (byRecv[k] = byRecv[k] || []).push(S[id]);
  });
  var names = recvNames_(ss);
  Object.keys(byRecv).sort(function (a, b) { return byRecv[b].length - byRecv[a].length; })
    .forEach(function (code) {
      var g = byRecv[code];
      var deep = 0, sec = 0, last = null, far = '';
      g.forEach(function (s) {
        if (s.depth > deep) deep = s.depth;
        if (s.sec > sec) sec = s.sec;
        if (!last || s.first > last) last = s.first;
        var st = farthest_(s); if (st) far = st;
      });
      rows.push([names[code] ? names[code] + ' (' + code + ')' : code,
                 g.length, deep + '%', sec + '초', far,
                 last ? Utilities.formatDate(new Date(last), Session.getScriptTimeZone(), 'MM-dd HH:mm') : '']);
    });
  rows.push([]);

  // ── 퍼널 ─────────────────────────────────────────────────
  rows.push(['퍼널', '세션', '직전 단계 대비', '방문 대비']);
  var steps = stepRows_(f);
  steps.forEach(function (s, i) {
    var prev = i === 0 ? s[1] : steps[i - 1][1];
    rows.push([s[0], s[1], i === 0 ? '' : pct_(s[1], prev), pct_(s[1], f.visit)]);
  });
  rows.push([]);
  rows.push(['이탈', '']);
  rows.push(['첫 화면 이탈 (1쪽·25% 미만·10초 미만)', bounce, pct_(bounce, n) + ' of 방문']);
  rows.push(['읽은 시간 중앙값', median_(secs) + '초']);
  rows.push([]);
  rows.push(['스크롤 도달 분포', '세션']);
  Object.keys(depthBuckets).forEach(function (k) { rows.push([k + '%', depthBuckets[k], pct_(depthBuckets[k], n)]); });
  rows.push([]);
  rows.push(['페이지 조회', '조회']);
  sortKeys_(pageViews).forEach(function (k) { rows.push([k, pageViews[k]]); });
  rows.push([]);
  rows.push(['가장 많이 읽힌 칸', '도달 세션']);
  sortKeys_(sectHit).slice(0, 12).forEach(function (k) { rows.push([k, sectHit[k]]); });
  rows.push([]);
  rows.push(['클릭 종류', '건']);
  sortKeys_(outKind).forEach(function (k) { rows.push([k, outKind[k]]); });
  rows.push([]);
  rows.push(['유입 경로', '방문']);
  sortKeys_(refs).slice(0, 12).forEach(function (k) { rows.push([k || '(직접 입력·북마크)', refs[k]]); });

  var width = 6;
  out.getRange(1, 1, rows.length, width).setValues(rows.map(function (r) {
    while (r.length < width) r.push('');
    return r;
  }));
  out.getRange(1, 1, 1, width).setFontWeight('bold').setFontSize(13);
  rows.forEach(function (r, i) {
    if (['누가 봤나', '퍼널', '이탈', '스크롤 도달 분포', '페이지 조회', '가장 많이 읽힌 칸', '클릭 종류', '유입 경로'].indexOf(r[0]) > -1)
      out.getRange(i + 1, 1, 1, width).setFontWeight('bold');
  });
  out.setColumnWidth(1, 320); out.autoResizeColumns(2, 5);
}

/** 지원처별 퍼널도 보고 싶을 때. 코드 하나를 넣으면 그 수신처만 따진다. */
function step_(ids, S) {
  var f = { visit: ids.length, pastHero: 0, reachedCases: 0, openedCase: 0, evidence: 0, resume: 0, mail: 0 };
  ids.forEach(function (id) {
    var s = S[id];
    if (s.depth >= 25) f.pastHero++;
    if (Object.keys(s.sects).some(function (k) { return /^case-/.test(k); })) f.reachedCases++;
    if (Object.keys(s.paths).some(function (p) { return /\/projects\//.test(p); }) || s.outs['case']) f.openedCase++;
    if (s.outs['evidence']) f.evidence++;
    if (s.outs['resume'] || s.outs['pdf'] || Object.keys(s.paths).some(function (p) { return /\/resume/.test(p); })) f.resume++;
    if (s.outs['mail']) f.mail++;
  });
  return f;
}

function stepRows_(f) {
  return [['① 방문', f.visit], ['② 히어로 통과 (25% 이상 스크롤)', f.pastHero],
          ['③ 케이스 목록 도달', f.reachedCases], ['④ 케이스 상세 진입', f.openedCase],
          ['⑤ 증빙 원본 열기', f.evidence], ['⑥ 이력서·PDF 열기', f.resume], ['⑦ 메일 클릭', f.mail]];
}

/* 이탈: 한 쪽만 보고, 25% 도 못 내려가고, 10초도 안 머문 세션.
   셋을 모두 만족해야 센다 — 30초를 읽고 나갔다면 이탈이 아니라 정독이다. */
function isBounce_(s) {
  return Object.keys(s.paths).length <= 1 && s.depth < 25 && s.sec < 10;
}

/** 이 세션이 도달한 가장 깊은 단계를 사람 말로. */
function farthest_(s) {
  if (s.outs['mail']) return '메일 클릭';
  if (s.outs['resume'] || s.outs['pdf']) return '이력서·PDF';
  if (s.outs['evidence']) return '증빙 원본';
  if (Object.keys(s.paths).some(function (p) { return /\/projects\//.test(p); })) return '케이스 상세';
  if (Object.keys(s.sects).some(function (k) { return /^case-/.test(k); })) return '케이스 목록';
  if (s.depth >= 25) return '히어로 통과';
  return '첫 화면';
}

/** '수신처' 시트에서 코드 → 지원처 이름을 읽어 온다. */
function recvNames_(ss) {
  var m = {}, s = ss.getSheetByName('수신처');
  if (!s || s.getLastRow() < 2) return m;
  s.getRange(2, 1, s.getLastRow() - 1, 5).getValues().forEach(function (r) {
    if (r[4]) m[String(r[4])] = String(r[0]) + (r[1] ? ' · ' + r[1] : '');
  });
  return m;
}

function pct_(a, b) { return b ? Math.round(a / b * 1000) / 10 + '%' : '—'; }
function median_(a) { if (!a.length) return 0; a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2); }
function sortKeys_(o) { return Object.keys(o).sort(function (a, b) { return o[b] - o[a]; }); }
function shortRef_(r) { try { return String(r).replace(/^https?:\/\//, '').split('/')[0]; } catch (e) { return String(r); } }
function now_() { return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm'); }
