(function () {
  var GW = window.GW, B = window.GW_BASE, H = window.GW_HOME, F = window.GW_FACILITIES || [];
  var esc = GW.esc;
  var P = '../assets-shared/photo/', I = '../assets-shared/img/';
  var live = GW.live().sort(GW.byDeadline);
  var URL_PLACE = 'https://www.gwtp.or.kr/gwtp/pageview.php?url=sub04a&keyvalue=sub04';
  var URL_BIZ = 'https://www.gwtp.or.kr/gwtp/pageview.php?url=sub02a&keyvalue=sub02';
  var ARROW = '<svg class="ar" viewBox="0 0 33 33" aria-hidden="true"><circle cx="16.5" cy="16.5" r="15.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M14 10.5l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
  function $(id) { return document.getElementById(id); }
  function setAll(sel, v) { document.querySelectorAll(sel).forEach(function (el) { el.textContent = v; }); }
  function short(c) { return c.replace(/(시|군)$/, ''); }

  setAll('.js-live', live.length);
  setAll('.js-fac', F.length);
  setAll('.js-eq', H.eqnet.equipment.toLocaleString('ko-KR'));
  setAll('.js-inst', H.eqnet.institutions);
  var cities = [];
  F.forEach(function (f) { if (cities.indexOf(f.city) < 0) cities.push(f.city); });
  setAll('.js-cities', cities.length);

  var CITY_POS = { '춘천시': [26.9, 15.5], '홍천군': [46.9, 14.4], '강릉시': [71.0, 16.2], '삼척시': [75.9, 39.7], '태백시': [76.2, 69.5], '원주시': [48.8, 87.4] };
  var FAC_POS = {
    '기술혁신지원센터': [34.2, 6.0], '춘천벤처1공장': [19.6, 6.8], '춘천벤처2공장': [37.4, 19.2],
    '세라믹신소재지원센터': [83.2, 7.6], 'SoP지원센터': [88.6, 19.4], '강릉벤처1공장': [63.4, 7.2], '강릉벤처2공장': [84.6, 29.2], '반도체부재공장': [64.2, 27.4],
    '원주벤처공장': [58.6, 76.4], '원주벤처2공장': [61.8, 92.6], '강원혁신지원 OpenLAB센터': [41.2, 76.8],
    '에너지방재지원센터': [88.4, 47.8], '삼척창업보육센터': [83.6, 57.2],
    '원료산업지원센터': [86.8, 79.6],
    '중화항체치료제개발지원센터': [55.4, 6.4]
  };
  var SECTOR_POS = { '반도체': [55.6, 22.0], '바이오': [51.4, 31.7], '수소·에너지': [71.1, 56.2] };

  var facSector = {};
  GW.all.forEach(function (n) {
    (n.places || []).forEach(function (p) {
      (n.sectors || []).forEach(function (s) { if (SECTOR_POS[s]) (facSector[p] = facSector[p] || {})[s] = 1; });
    });
  });
  F.forEach(function (f) {
    Object.keys(SECTOR_POS).forEach(function (s) { if (f.name.indexOf(s) > -1) (facSector[f.name] = facSector[f.name] || {})[s] = 1; });
    if (f.city === '홍천군' && /항체/.test(f.name)) {
      var bio = GW.all.some(function (n) { return (n.regions || []).indexOf('홍천군') > -1 && (n.sectors || []).indexOf('바이오') > -1; });
      if (bio) (facSector[f.name] = facSector[f.name] || {})['바이오'] = 1;
    }
  });

  function cityLive(c) {
    var mine = F.filter(function (f) { return f.city === c; }).map(function (f) { return f.name; });
    return live.filter(function (n) {
      var regs = n.regions || [];
      if (regs.some(function (r) { return r === c || /도내 전체|강원 전체/.test(r); })) return true;
      return (n.places || []).some(function (p) { return mine.indexOf(p) > -1; });
    }).length;
  }
  var net = $('net');
  if (net) {
    var lines = [], dots = [], nodes = [];
    function L(a, b, cls, keys) { lines.push('<line x1="' + a[0] * 14.4 + '" y1="' + a[1] * 7.83 + '" x2="' + b[0] * 14.4 + '" y2="' + b[1] * 7.83 + '" data-k="' + keys + '"' + (cls ? ' class="' + cls + '"' : '') + '/>'); }
    var hq = CITY_POS['춘천시'];
    cities.forEach(function (c) { if (c !== '춘천시') L(hq, CITY_POS[c], 'hq', '춘천시 ' + c); });
    F.forEach(function (f) {
      var p = FAC_POS[f.name]; if (!p) return;
      L(CITY_POS[f.city], p, 'fac', f.city);
      Object.keys(facSector[f.name] || {}).forEach(function (s) { L(SECTOR_POS[s], p, 'sec', f.city + ' ' + s); });
      dots.push('<i class="dot" style="left:' + p[0] + '%;top:' + p[1] + '%" data-k="' + f.city + ' ' + Object.keys(facSector[f.name] || {}).join(' ') + '" title="' + esc(f.name) + '"></i>');
    });
    cities.forEach(function (c) {
      var p = CITY_POS[c], n = F.filter(function (f) { return f.city === c; });
      var cnt = cityLive(c);
      nodes.push('<a class="node big' + (p[1] > 60 ? ' up' : '') + (p[0] > 82 ? ' lf' : '') + '" href="' + URL_PLACE + '" style="left:' + p[0] + '%;top:' + p[1] + '%" data-k="' + c + '" data-fac="' + n.length + '" data-live="' + cnt + '">' +
        '<span class="sq"></span><span class="nm">' + esc(short(c)) + '</span>' +
        '<span class="sub"><b>' + esc(c) + ' 시설 ' + n.length + '곳 · 신청 가능 공고 ' + cnt + '건</b>' + n.map(function (f) { return '<i>' + esc(f.name) + '</i>'; }).join('') + '</span></a>');
    });
    Object.keys(SECTOR_POS).forEach(function (s) {
      var p = SECTOR_POS[s], cnt = live.filter(function (x) { return (x.sectors || []).indexOf(s) > -1; }).length;
      var facs = F.filter(function (f) { return facSector[f.name] && facSector[f.name][s]; });
      nodes.push('<a class="node small' + (p[0] > 82 ? ' lf' : '') + '" href="' + B.listUrl + '" style="left:' + p[0] + '%;top:' + p[1] + '%" data-k="' + s + '" data-fac="' + facs.length + '" data-live="' + cnt + '">' +
        '<span class="sq"></span><span class="nm">' + esc(s) + '</span>' +
        '<span class="sub"><b>' + esc(s) + ' 접수 중 공고 ' + cnt + '건 · 관련 시설 ' + facs.length + '곳</b>' + facs.map(function (f) { return '<i>' + esc(short(f.city) + ' ' + f.name) + '</i>'; }).join('') + '</span></a>');
    });
    net.querySelector('svg').innerHTML = lines.join('');
    net.querySelector('.pts').innerHTML = dots.join('') + nodes.join('');
  }

  var mlist = $('mList');
  if (mlist) {
    mlist.innerHTML = cities.map(function (c) {
      var n = F.filter(function (f) { return f.city === c; });
      var cnt = cityLive(c);
      return '<a class="mi" href="' + URL_PLACE + '" data-k="' + c + '"><span class="nm">' + esc(short(c)) + '</span><span class="sub">' + esc(n[0].name) + (n.length > 1 ? ' 외 ' + (n.length - 1) + '곳' : '') + '</span>' + ARROW +
        '<span class="det"><b>시설 ' + n.length + '곳 · 신청 가능 공고 ' + cnt + '건</b>' + n.map(function (f) { return '<i>' + esc(f.name) + '</i>'; }).join('') + '</span></a>';
    }).join('') + Object.keys(SECTOR_POS).map(function (s) {
      var cnt = live.filter(function (x) { return (x.sectors || []).indexOf(s) > -1; }).length;
      var facs = F.filter(function (f) { return facSector[f.name] && facSector[f.name][s]; });
      return '<a class="mi sm" href="' + B.listUrl + '" data-k="' + s + '"><span class="nm">' + esc(s) + '</span>' + ARROW +
        '<span class="det"><b>접수 중 공고 ' + cnt + '건 · 관련 시설 ' + facs.length + '곳</b>' + facs.map(function (f) { return '<i>' + esc(short(f.city) + ' ' + f.name) + '</i>'; }).join('') + '</span></a>';
    }).join('');
  }

  var track = $('storyTrack');
  if (track) {
    track.innerHTML = B.news.map(function (n, i) {
      return '<article class="sc"><a href="' + B.newsUrl + '"><div class="ph"><img src="' + P + 'news-' + (i + 1) + '.jpg" alt=""></div>' +
        '<h4>' + esc(n.title) + '</h4><p><span>보도자료</span>' + esc(GW.fmtDate(n.date)) + '</p></a></article>';
    }).join('');
  }

  function photoFor(n) {
    var t = (n.short || '') + n.title, s = (n.sectors || [])[0];
    if (/수소/.test(t)) return P + 'tank.jpg';
    if (s === '모빌리티') return P + 'news-5.jpg';
    if (s === '바이오') return P + 'lab.jpg';
    if (s === '반도체') return P + 'fab.jpg';
    if (s === '디지털헬스·의료기기') return P + 'lab2.jpg';
    if (s === '수소·에너지') return P + 'tank.jpg';
    return P + 'hqsign.jpg';
  }
  var open = $('openGrid');
  if (open) {
    var pick = live.filter(function (n) { return GW.status(n) === 'open'; }).slice(0, 3);
    if (pick.length < 3) pick = pick.concat(live.filter(function (n) { return pick.indexOf(n) < 0; }).slice(0, 3 - pick.length));
    open.innerHTML = pick.map(function (n, i) {
      var b = GW.badge(n), st = GW.status(n);
      var big = st === 'open' ? b.text : (st === 'always' ? '상시' : '확인');
      var sec = (n.sectors || []).filter(function (s) { return s !== '전 분야'; }).join(' · ') || '전 분야';
      return '<article class="oc' + (i === 1 ? ' wide' : '') + '"><a href="' + esc(n.url || B.listUrl) + '"><div class="ph"><img src="' + photoFor(n) + '" alt=""><span class="dd' + (b.cls === 'urgent' ? ' urgent' : '') + '">' + esc(big) + '</span></div>' +
        '<h4>' + esc(n.short || n.title) + '</h4><p class="meta">' + esc(sec) + ' · ' + esc(GW.deadlineText(n)) + '</p>' +
        (n.amount ? '<p class="amt">' + esc(n.amount) + '</p>' : '') + '</a></article>';
    }).join('');
  }

  var fac = $('facGrid');
  if (fac) {
    var cols = [
      [['기술혁신지원센터', 'cc-hq', 220], ['반도체부재공장', 'gn-semi', 247]],
      [['세라믹신소재지원센터', 'gn-ceramic', 247], ['강원혁신지원 OpenLAB센터', 'wj-openlab', 370]],
      [['에너지방재지원센터', 'sc-energy', 262], ['중화항체치료제개발지원센터', 'hc-antibody', 247]]
    ];
    fac.innerHTML = cols.map(function (col, ci) {
      return '<div class="fc c' + ci + '">' + col.map(function (it, k) {
        var f = F.filter(function (x) { return x.name === it[0]; })[0];
        var last = ci === 1 && k === 1;
        return '<article class="ft"><a href="' + URL_PLACE + '"><div class="ph" style="aspect-ratio:370/' + it[2] + '"><img src="' + I + it[1] + '.jpg" alt="' + esc(f.city + ' ' + f.name) + '"></div>' +
          '<h3>' + esc(short(f.city)) + ' ' + esc(f.name) + '</h3><p>' + esc(f.use) + '</p>' +
          '<span class="ul">' + (last ? '입주 시설 ' + F.length + '곳 모두 보기' : '시설 안내') + '</span></a></article>';
      }).join('') + '</div>';
    }).join('');
  }

  function dateBlock(d) {
    var p = d.split('-');
    return '<div class="db"><b>' + p[1] + '.' + p[2] + '</b><small>' + p[0] + ' · ' + GW.weekday(d) + '요일</small></div>';
  }
  function list(el, arr, label) {
    el.innerHTML = arr.slice(0, 3).map(function (n) {
      var m = n.title.match(/^\((\d{4}-\d+호)\)\s*(.*)$/);
      var lab = n.badge || (m ? m[1] : label);
      var title = m ? m[2] : n.title;
      return '<li><a href="' + esc(n.url) + '">' + dateBlock(n.date) + '<div class="tx"><time>' + esc(lab) + '</time><strong>' + esc(title) + '</strong></div></a></li>';
    }).join('');
  }
  if ($('listNotice')) list($('listNotice'), H.notice, '공지');
  if ($('listRecruit')) list($('listRecruit'), H.recruit, '사업공고');

  var band = $('bandSys');
  if (band) band.innerHTML = B.systems.map(function (s) { return '<a href="' + esc(s.url) + '">' + esc(s.name) + '</a>'; }).join('<span class="sep">·</span>');

  var fcity = $('footCities');
  if (fcity) fcity.innerHTML = cities.map(function (c) { return '<li><a href="' + URL_PLACE + '">' + esc(c) + ' ' + F.filter(function (f) { return f.city === c; }).length + '곳</a></li>'; }).join('');
})();
