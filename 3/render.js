
(function () {
  var G = window.GW, B = window.GW_BASE, H = window.GW_HOME, F = window.GW_FACILITIES || [];
  var esc = G.esc;
  var A = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h13M12.5 6l6 6-6 6"/></svg>';
  var COLORS = {
    '모빌리티': ['#9183D8', '#B1A8E3'], '수소·에너지': ['#E88A2D', '#F1B981'], '반도체': ['#96B7DF', '#B3CBE8'],
    '디지털헬스·의료기기': ['#5AB3B3', '#9CD1D1'], 'ICT·데이터': ['#FFD964', '#FFE491'], '정보보호': ['#9183D8', '#B1A8E3'],
    '바이오': ['#85CB85', '#B6DFB6'], '전 분야': ['#96B7DF', '#B3CBE8']
  };
  function mainSector(n) { var s = (n.sectors || []).filter(function (x) { return x !== '전 분야'; }); return s[0] || '전 분야'; }

  var selR = document.getElementById('fR'), selS = document.getElementById('fS'), selT = document.getElementById('fT');
  function opts(sel, list) { list.forEach(function (v) { var o = document.createElement('option'); o.value = v; o.textContent = v; sel.appendChild(o); }); }
  opts(selR, B.regions.concat(['강원 밖'])); opts(selS, B.sectors); opts(selT, B.types);
  function query() { return { r: selR.value, s: selS.value, t: selT.value ? [selT.value] : [] }; }

  var SHOW = 9, expanded = false;
  function card(n) {
    var st = G.status(n), d = G.dday(n), sec = mainSector(n), c = COLORS[sec] || COLORS['전 분야'];
    var big, cls = 'dd', when;
    if (st === 'open') { big = d === 0 ? '오늘 마감' : 'D-' + d; if (d <= 7) cls += ' urgent'; when = G.fmtShort(n.apply_end) + '(' + G.weekday(n.apply_end) + ')' + (n.apply_end_time ? ' ' + n.apply_end_time : '') + ' 마감'; }
    else if (st === 'always') { big = '상시 모집'; cls += ' soft'; when = '연중 접수'; }
    else { big = '공고문 확인'; cls += ' soft'; when = ''; }
    var tel = G.tel(n.contact), benefit = (n.amount ? n.amount + ' · ' : '') + (n.benefit || '');
    return '<article class="card" data-idx="' + esc(n.idx) + '" style="--bar:' + c[0] + ';--tint:' + c[1] + '">' +
      '<div class="due"><span class="' + cls + '">' + esc(big) + '</span>' + (when ? '<span class="when">' + esc(when) + '</span>' : '') + '<span class="sec-tag">' + esc(sec) + '</span></div>' +
      '<h3><a href="' + esc(n.url) + '" target="_blank" rel="noopener">' + esc(n.short || n.title) + '</a></h3>' +
      '<dl><dt>대상</dt><dd title="' + esc(n.target) + '">' + esc(n.target || '공고문 참조') + '</dd><dt>지원</dt><dd title="' + esc(benefit) + '">' + esc(benefit || '공고문 참조') + '</dd></dl>' +
      '<div class="foot"><a class="circ" href="' + esc(n.url) + '" target="_blank" rel="noopener" aria-label="공고 원문 보기">' + A + '</a>' +
      '<div class="who"><b>' + esc(n.dept) + '</b>' + (tel ? '<a href="tel:' + tel + '">' + tel + '</a>' : '<a href="tel:' + B.phone + '">대표 ' + B.phone + '</a>') + '</div></div>' +
      '</article>';
  }
  var listEl = document.getElementById('noticeCards'), cntEl = document.getElementById('noticeCnt'), condEl = document.getElementById('noticeCond'), moreEl = document.getElementById('noticeMore'), goN = document.getElementById('goN');
  function condText(q) {
    var parts = [q.r || '지역 전체', q.s || '분야 전체', (q.t[0] || '지원 종류 전체')];
    var on = q.r || q.s || q.t.length;
    return '<b>' + esc(parts.join(' · ')) + '</b> · 마감 가까운 순' + (on ? '<button type="button" data-reset>조건 지우기</button>' : '');
  }
  function renderNotices() {
    var q = query(), res = G.find(q), hit = res.hit;
    goN.textContent = '공고 ' + hit.length + '건 보기';
    cntEl.textContent = hit.length + '건';
    condEl.innerHTML = condText(q);
    if (!hit.length) {
      var near = res.near.slice(0, 6);
      listEl.innerHTML = '<div class="empty" style="grid-column:1/-1"><b>조건에 맞는 접수 중 공고가 없습니다</b>' +
        (near.length ? '조건을 하나 풀면 신청할 수 있는 공고 ' + res.near.length + '건을 아래에 보여드립니다.' : '조건을 바꿔 보세요. 마감된 같은 조건 공고는 공고안내 게시판에서 볼 수 있습니다.') + '</div>' +
        near.map(card).join('');
      moreEl.innerHTML = '<a href="' + B.listUrl + '" target="_blank" rel="noopener">공고안내 게시판 전체 보기 ' + A + '</a>';
      return;
    }
    var shown = expanded ? hit : hit.slice(0, SHOW);
    listEl.innerHTML = shown.map(card).join('');
    moreEl.innerHTML = (hit.length > SHOW ? '<button type="button" data-more>' + (expanded ? '9건만 보기' : '나머지 ' + (hit.length - SHOW) + '건 더 보기') + '</button>' : '') +
      '<a href="' + B.listUrl + '" target="_blank" rel="noopener">공고안내 게시판 전체 보기 ' + A + '</a>';
  }
  [selR, selS, selT].forEach(function (s) { s.addEventListener('change', function () { expanded = false; renderNotices(); document.dispatchEvent(new CustomEvent('gw:filter')); }); });
  document.addEventListener('click', function (e) {
    var t = e.target.closest('[data-reset],[data-more],[data-sector]');
    if (!t) return;
    if (t.hasAttribute('data-reset')) { selR.value = selS.value = selT.value = ''; expanded = false; renderNotices(); document.dispatchEvent(new CustomEvent('gw:filter')); }
    else if (t.hasAttribute('data-more')) { expanded = !expanded; renderNotices(); document.dispatchEvent(new CustomEvent('gw:more')); }
    else if (t.hasAttribute('data-sector')) { e.preventDefault(); selS.value = t.getAttribute('data-sector'); selR.value = ''; selT.value = ''; expanded = false; renderNotices(); document.dispatchEvent(new CustomEvent('gw:filter')); document.getElementById('notices').scrollIntoView({ block: 'start' }); }
  });

  var GROUPS = [['모빌리티'], ['수소·에너지'], ['반도체'], ['디지털헬스·의료기기'], ['ICT·데이터', '정보보호'], ['바이오']];
  var all = G.detailed().concat(G.all.filter(function (n) { return n.list_only; }));
  document.getElementById('bizCards').innerHTML = GROUPS.map(function (g) {
    var mine = G.all.filter(function (n) { return (n.sectors || []).some(function (s) { return g.indexOf(s) > -1; }); }).sort(G.byPosted);
    var depts = {}; mine.forEach(function (n) { if (n.dept) depts[n.dept] = (depts[n.dept] || 0) + 1; });
    var top = Object.keys(depts).sort(function (a, b) { return depts[b] - depts[a]; }).slice(0, 2);
    var n = G.find({ s: g[0] }).hit.length, own = mine.filter(function (x) { return g.indexOf(mainSector(x)) > -1; }), latest = own[0] || mine[0];
    return '<article class="fcard"><h3><a href="#notices" data-sector="' + esc(g[0]) + '">' + esc(g.join('·')) + '</a></h3>' +
      '<p><b>담당</b> ' + esc(top.join(', ') || '공고문 참조') + '</p>' +
      (latest ? '<p><b>최근 공고</b> ' + esc(latest.short || latest.title) + '</p>' : '') +
      '<a class="foot" href="#notices" data-sector="' + esc(g[0]) + '"><span class="dot">' + A + '</span>지금 접수 중 ' + n + '건 보기</a></article>';
  }).join('');

  var cities = ['춘천시', '원주시', '강릉시', '삼척시', '태백시', '홍천군'], rec = G.recruitingPlaces();
  var tabsEl = document.getElementById('facTabs'), facEl = document.getElementById('facCards');
  tabsEl.innerHTML = cities.map(function (c, i) {
    var k = F.filter(function (p) { return p.city === c; }).length;
    return '<button type="button" data-city="' + c + '" aria-pressed="' + (i === 0) + '">' + c + ' ' + k + '</button>';
  }).join('');
  function recFor(p) { for (var k in rec) if (k.indexOf(p.name) > -1 || p.name.indexOf(k) > -1) return rec[k]; return null; }
  function facCard(p) {
    var r = recFor(p);
    return '<article class="ncard" data-fac="' + esc(p.name) + '">' + (p.img ? '<div class="ph"><img src="../assets-shared/img/' + p.img + '.jpg" alt="' + esc(p.name) + ' 건물 사진"></div>' : '') +
      '<div class="bd">' + (r ? '<a class="rec" href="' + esc(r.url) + '" target="_blank" rel="noopener">입주기업 모집 중</a>' : '') +
      '<h3><a href="https://mybiz.gwtp.or.kr/" target="_blank" rel="noopener">' + esc(p.name) + '</a></h3>' +
      '<dl class="spec"><dt>주소</dt><dd>' + esc(p.addr) + '</dd><dt>면적</dt><dd>' + esc(p.area) + '</dd>' + (p.scale ? '<dt>규모</dt><dd>' + esc(p.scale) + '</dd>' : '') + '<dt>용도</dt><dd>' + esc(p.use) + '</dd></dl>' +
      '<a class="foot" href="https://mybiz.gwtp.or.kr/" target="_blank" rel="noopener"><span class="dot">' + A + '</span>입주기업 종합지원</a></div></article>';
  }
  function renderFac(city) {
    facEl.innerHTML = F.filter(function (p) { return p.city === city; }).map(facCard).join('');
    [].forEach.call(tabsEl.children, function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-city') === city); });
  }
  tabsEl.addEventListener('click', function (e) { var b = e.target.closest('[data-city]'); if (!b) return; renderFac(b.getAttribute('data-city')); document.dispatchEvent(new CustomEvent('gw:city')); });
  renderFac(cities[0]);

  function dot(s) { return s ? s.replace(/-/g, '.') : ''; }
  document.getElementById('newsCards').innerHTML = B.news.slice(0, 3).map(function (n, i) {
    return '<article class="ncard"><div class="ph"><img src="../assets-shared/photo/news-' + (i + 1) + '.jpg" alt=""></div><div class="bd">' +
      '<span class="date">' + dot(n.date) + ' 보도자료</span><h3><a href="' + B.newsUrl + '" target="_blank" rel="noopener">' + esc(n.title) + '</a></h3>' +
      '<a class="foot" href="' + B.newsUrl + '" target="_blank" rel="noopener"><span class="dot">' + A + '</span>기사 보기</a></div></article>';
  }).join('');
  function lcard(title, items, url) {
    return '<section class="lcard"><h3>' + title + '<a href="' + url + '" target="_blank" rel="noopener">전체</a></h3><ul>' +
      items.slice(0, 4).map(function (x) { return '<li><a href="' + esc(x.url) + '" target="_blank" rel="noopener" title="' + esc(x.title) + '">' + esc(x.title) + '</a><span>' + dot(x.date).slice(5) + '</span></li>'; }).join('') + '</ul></section>';
  }
  document.getElementById('boardLists').innerHTML = lcard('공지사항', H.notice, H.boards.notice) + lcard('입찰공고', H.bid, H.boards.bid) + lcard('채용공고', H.jobs, H.boards.jobs);

  renderNotices();
  window.GW3 = { renderNotices: renderNotices, renderFac: renderFac, query: query };
})();
