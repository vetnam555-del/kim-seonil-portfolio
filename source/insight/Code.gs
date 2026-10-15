/**
 * 포트폴리오 방문 계측 — 수집기.
 *
 * 비콘이 보낸 이벤트를 원본 시트에 한 줄씩 쌓는다. 여기서 집계하지 않는다.
 * 집계는 summary.gs 가 원본을 다시 읽어서 만든다 — 나중에 다른 질문이
 * 생겼을 때 원본이 남아 있어야 답할 수 있기 때문이다.
 *
 * 받지 않는 것: IP(Apps Script 가 애초에 넘겨주지 않는다), 쿠키, 이름.
 * 세션 식별자는 방문자 브라우저에서 만들어진 임의 문자열이고 탭을 닫으면 사라진다.
 *
 * '수신처' 는 내가 링크에 붙여 보낸 코드(?r=xxxx)다. 방문자에게서 알아낸 것이 아니라
 * 내가 어디로 보냈는지의 기록이다. 그래서 IP 추정과 달리 헛짚지 않는다.
 */
var SHEET = 'events';
var MAP = '수신처';
var HEAD = ['수신시각', '수신처', '세션', '순번', '이벤트', '경로', '섹션', '깊이%', '초',
            '클릭종류', '클릭대상', '문구', '유입경로', '화면폭', '화면높이', 'DPR', '언어', 'UTC오프셋', '판'];

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var rows = [];
    var now = new Date();
    (body.v || []).forEach(function (v) {
      rows.push([
        now, String(body.r || ''), String(body.sid || ''), Number(v.i || 0), String(v.e || ''),
        String(v.p || ''), v.e === 'out' ? '' : String(v.k || ''),
        v.d === undefined ? '' : Number(v.d),
        v.sec === undefined ? '' : Number(v.sec),
        v.e === 'out' ? String(v.k || '') : '',
        String(v.u || ''), String(v.x || ''), String(v.r || ''),
        v.w === undefined ? '' : Number(v.w),
        v.h === undefined ? '' : Number(v.h),
        v.dpr === undefined ? '' : Number(v.dpr),
        String(v.l || ''),
        body.tz === undefined ? '' : Number(body.tz),
        String(body.s || ''),
      ]);
    });
    if (rows.length) {
      var s = sheet_();
      s.getRange(s.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows);
    }
    return out_({ ok: true, n: rows.length });
  } catch (err) {
    // 수집이 실패해도 방문자 화면에는 아무 일도 없어야 한다. 조용히 기록만 남긴다.
    try { sheet_('errors').appendRow([new Date(), String(err), (e && e.postData && e.postData.contents || '').slice(0, 500)]); } catch (x) {}
    return out_({ ok: false });
  }
}

/** 붙였는지 확인용. 브라우저로 웹앱 주소를 그냥 열면 이게 보인다. */
function doGet() {
  var s = sheet_();
  return out_({ ok: true, rows: Math.max(0, s.getLastRow() - 1), updated: new Date() });
}

/**
 * 보낼 링크를 만든다.
 *
 * '수신처' 시트에 지원처 이름만 적고 메뉴 [계측] → [보낼 링크 만들기] 를 누르면
 * 코드와 완성된 주소가 채워진다. 코드는 짐작할 수 없는 4글자로 만든다 —
 * ?r=ably 처럼 읽히면 받는 쪽이 바로 알아본다.
 */
function makeLinks() {
  var ss = SpreadsheetApp.getActive();
  var s = ss.getSheetByName(MAP);
  if (!s) {
    s = ss.insertSheet(MAP);
    s.getRange(1, 1, 1, 6).setValues([['지원처', '직무', '보낸 날짜', '메모', '코드', '보낼 주소']])
      .setFontWeight('bold');
    s.setFrozenRows(1);
    s.setColumnWidth(1, 140); s.setColumnWidth(6, 380);
    s.getRange(2, 1, 1, 2).setValues([['에이블리', '마케터']]);
  }
  var base = PropertiesService.getScriptProperties().getProperty('BASE_URL')
    || 'https://vetnam555-del.github.io/kim-seonil-portfolio/';
  var last = s.getLastRow();
  if (last < 2) return;
  var v = s.getRange(2, 1, last - 1, 6).getValues();
  var used = {};
  v.forEach(function (r) { if (r[4]) used[String(r[4])] = 1; });
  var out = v.map(function (r) {
    if (!r[0]) return [r[4], r[5]];               // 지원처가 비면 건너뛴다
    var code = String(r[4] || '');
    if (!code) {
      do { code = randCode_(); } while (used[code]);
      used[code] = 1;
    }
    return [code, base + '?r=' + code];
  });
  s.getRange(2, 5, out.length, 2).setValues(out);
  SpreadsheetApp.getActive().toast('링크를 만들었습니다. F열 주소를 지원처에 보내세요.');
}

function randCode_() {
  // 헷갈리는 글자(0/O, 1/l/I)는 뺀다. 손으로 옮겨 적을 일이 생긴다.
  var a = 'abcdefghjkmnpqrstuvwxyz23456789', s = '';
  for (var i = 0; i < 4; i++) s += a.charAt(Math.floor(Math.random() * a.length));
  return s;
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActive();
  var n = name || SHEET;
  var s = ss.getSheetByName(n);
  if (!s) {
    s = ss.insertSheet(n);
    if (n === SHEET) {
      s.getRange(1, 1, 1, HEAD.length).setValues([HEAD]).setFontWeight('bold');
      s.setFrozenRows(1);
    }
  }
  return s;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
