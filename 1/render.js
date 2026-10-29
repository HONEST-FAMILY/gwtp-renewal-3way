
(function () {
  var GW = window.GW, B = window.GW_BASE, F = window.GW_FACILITIES || [];
  var P = '../assets-shared/photo/';
  var arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9 9 3M4 3h5v5"/></svg>';

  var bySector = { '모빌리티': 'news-5.jpg', '정보보호': 'hqsign.jpg', 'ICT·데이터': 'hqsign.jpg', '수소·에너지': 'aerial3b.jpg', '바이오': 'lab2.jpg', '반도체': 'fab.jpg', '디지털헬스·의료기기': 'lab2.jpg' };
  var spare = ['gn-bldg.jpg', 'aerial3b.jpg', 'mine.jpg'];

  function noticeCards() {
    var box = document.getElementById('noticeCards'); if (!box || !GW) return;
    var list = GW.live().slice().sort(GW.byDeadline).slice(0, 3), used = {};
    box.innerHTML = list.map(function (n) {
      var b = GW.badge(n), img = null;
      (n.sectors || []).some(function (s) { var p = bySector[s]; if (p && !used[p]) { img = p; return true; } return false; });
      if (!img) img = spare.filter(function (p) { return !used[p]; })[0];
      used[img] = 1;
      var tags = [].concat((n.sectors || []).filter(function (s) { return s !== '전 분야'; }).slice(0, 1), (n.types || []).slice(0, 1), (n.regions || []).slice(0, 1));
      var d = GW.deadlineText(n);
      return '<a class="card" href="' + GW.esc(n.url || B.listUrl) + '" target="_blank" rel="noopener">' +
        '<div class="card-img"><img src="' + P + img + '" alt="" loading="lazy"></div>' +
        '<div class="card-body"><div class="card-meta"><span class="card-cat' + (b.cls === 'urgent' ? ' urgent' : '') + '">' + GW.esc(b.text) + '</span><span class="card-date">' + GW.esc(d) + '</span></div>' +
        '<p class="card-tit">' + GW.esc(n.title) + '</p>' +
        '<p class="card-sum">' + GW.esc(n.short || '') + (n.amount ? ' · ' + GW.esc(n.amount) : '') + '</p></div>' +
        '<div class="card-tags">' + tags.map(function (t) { return '<span># ' + GW.esc(t) + '</span>'; }).join('') + '<span># ' + GW.esc(n.dept.split(' ')[0]) + '</span></div>' +
        '</a>';
    }).join('');
  }

  var newsTags = [['청소년 마약 근절', 'NO WEAK 챌린지'], ['미래차 부품', '재제조'], ['바이오', '푸드테크·마이크로바이옴']];
  function newsCards() {
    var box = document.getElementById('newsCards'); if (!box || !B) return;
    box.innerHTML = B.news.slice(0, 3).map(function (n, i) {
      return '<a class="card" href="' + B.newsUrl + '" target="_blank" rel="noopener">' +
        '<div class="card-img"><img src="' + P + 'news-' + (i + 1) + '.jpg" alt="" loading="lazy"></div>' +
        '<div class="card-body"><div class="card-meta"><span class="card-cat">언론보도</span><span class="card-date">' + n.date.replace(/-/g, '.') + '</span></div>' +
        '<p class="card-tit">' + GW.esc(n.title) + '</p></div>' +
        '<div class="card-tags">' + newsTags[i].map(function (t) { return '<span># ' + t + '</span>'; }).join('') + '</div>' +
        '</a>';
    }).join('');
  }

  var CITIES = [
    { key: '춘천시', name: '춘천', img: 'cc-spring.jpg' },
    { key: '원주시', name: '원주', img: 'wj.jpg' },
    { key: '강릉시', name: '강릉', img: 'gn.jpg' },
    { key: '삼척시', name: '삼척', img: 'sc.jpg' }
  ];
  function placeCap(i) {
    var c = CITIES[i], fs = F.filter(function (f) { return f.city === c.key; });
    var addr = fs[0] ? fs[0].addr.replace(/-\d+$/, '').replace(/,.*$/, '') : '';
    var open = GW ? GW.live().filter(function (n) { return (n.types || []).indexOf('입주 공간') > -1 && n.title.indexOf(c.name) > -1; }) : [];
    return '<b>' + c.key + ' · 시설 ' + fs.length + '곳' + (open.length ? '<span class="open">입주기업 모집 중</span>' : '') + '</b>' +
      '<p>' + fs.map(function (f) { return GW.esc(f.name); }).join(' · ') + '</p>' +
      '<p class="addr">' + GW.esc(addr) + ' 일대</p>' +
      '<a class="go" href="https://www.gwtp.or.kr/gwtp/pageview.php?url=sub04c&keyvalue=sub04" target="_blank" rel="noopener">시설현황 보기 ' + arrow + '</a>';
  }
  window.GW1 = { CITIES: CITIES, placeCap: placeCap };

  function place() {
    var cap = document.getElementById('stageCap'); if (cap) cap.innerHTML = placeCap(0);
  }

  noticeCards(); newsCards(); place();
})();
