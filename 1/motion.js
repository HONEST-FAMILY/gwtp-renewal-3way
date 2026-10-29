
(function () {
  var root = document.documentElement, body = document.body;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return [].slice.call((el || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5"/></svg>';
  body.classList.add('mo');
  var vh = window.innerHeight, vw = window.innerWidth;

  var h1 = $('.hero h1');
  if (h1) {
    var parts = h1.innerHTML.split(/(<br[^>]*>)/);
    h1.innerHTML = parts.map(function (p) {
      if (/^<br/.test(p)) return p;
      var lead = p.match(/^\s*/)[0], txt = p.trim();
      return txt ? lead + '<span class="ln"><i>' + txt + '</i></span>' : p;
    }).join('');
  }
  var heroEl = $('.hero'), heroBg = $('.hero-bg');
  var shade = document.createElement('div'); shade.className = 'hero-shade'; heroEl && heroEl.appendChild(shade);
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('is-in'); }); });

  var tip = $('#hdTip');
  if (tip) {
    var x = tip.querySelector('svg'); var btn = document.createElement('button'); btn.setAttribute('aria-label', '안내 닫기');
    x.parentNode.replaceChild(btn, x); btn.appendChild(x);
    btn.addEventListener('click', function () { tip.classList.add('is-off'); });
  }

  var hd = $('#hd'), lastY = window.scrollY;
  function header(y) {
    if (!hd) return;
    if (y < 10) { hd.classList.remove('is-hide', 'is-solid'); }
    else if (y > lastY + 4 && y > 120) { hd.classList.add('is-hide'); }
    else if (y < lastY - 4) { hd.classList.remove('is-hide'); hd.classList.add('is-solid'); }
    lastY = y;
  }

  function once(els, fn, margin) {
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); fn(e.target); } });
    }, { rootMargin: margin || '0px 0px -12% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function wrapNums(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      if (!/\d/.test(n.nodeValue)) return;
      var span = document.createElement('span');
      span.innerHTML = n.nodeValue.replace(/\d[\d,]*/g, function (m) { return '<span class="num" data-n="' + m.replace(/,/g, '') + '">' + m + '</span>'; });
      n.parentNode.replaceChild(span, n);
    });
  }
  function roll(el) {
    $$('.num', el).forEach(function (s) {
      var to = +s.getAttribute('data-n'), t0 = performance.now(), dur = 1200, fmt = function (v) { return v.toLocaleString('ko-KR'); };
      if (RM) return;
      s.style.minWidth = s.offsetWidth + 'px'; s.style.display = 'inline-block'; s.style.textAlign = 'right';
      (function step(t) { var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3); s.textContent = fmt(Math.round(to * e)); if (p < 1) requestAnimationFrame(step); else { s.textContent = fmt(to); s.style.minWidth = ''; s.style.display = ''; } })(t0);
    });
  }
  $$('.bn-t').forEach(wrapNums);
  once($$('.bn-t'), roll);

  function cardsIn() {
    var cs = $$('.card');
    cs.forEach(function (c) { var r = c.getBoundingClientRect(); if (r.top > vh * 0.92) c.classList.add('pre'); });
    once(cs.filter(function (c) { return c.classList.contains('pre'); }), function (c) {
      var i = [].indexOf.call(c.parentNode.children, c); setTimeout(function () { c.classList.remove('pre'); }, i * 110);
    });
  }
  cardsIn();

  var tiles = $('.tiles');
  var tileLinks = [
    [['반도체 소모품 실증', '반도체 소모품'], ['세라믹신소재지원센터', null], ['반도체부재공장', null]],
    [['의료기기 반도체 실증', '의료기기 반도체'], ['디지털트윈 컨설팅', '디지털트윈'], ['중화항체치료제개발지원센터', null]],
    [['삼척 입주기업 모집', '입주기업 모집공고(삼척)'], ['LNG 냉열산업 협의체', 'LNG 냉열'], ['에너지방재지원센터', null]],
    [['미래모빌리티 기업지원', '미래모빌리티'], ['디지털 품질 테스트', '디지털 품질'], ['ICT 정보보호 지원', '정보보호']]
  ];
  var FAC = 'https://www.gwtp.or.kr/gwtp/pageview.php?url=sub04c&keyvalue=sub04';
  if (tiles) {
    $$('.tile', tiles).forEach(function (t, i) {
      var box = document.createElement('div'); box.className = 'tile-links';
      box.innerHTML = (tileLinks[i] || []).map(function (l) {
        var url = FAC;
        if (l[1] && window.GW) { var n = window.GW.all.filter(function (n) { return n.title.indexOf(l[1]) > -1; })[0]; url = n && n.url ? n.url : window.GW_BASE.listUrl; }
        return '<a href="' + url + '" target="_blank" rel="noopener">' + l[0] + ' ' + arrow + '</a>';
      }).join('');
      $('.tile-t', t).appendChild(box);
      var on = function () { if (!window.matchMedia('(min-width:1024px) and (hover:hover)').matches) return; tiles.classList.add('has-on'); $$('.tile', tiles).forEach(function (o) { o.classList.toggle('is-on', o === t); }); };
      t.addEventListener('mouseenter', on); t.addEventListener('focusin', on);
    });
    var off = function () { tiles.classList.remove('has-on'); $$('.tile', tiles).forEach(function (o) { o.classList.remove('is-on'); }); };
    tiles.addEventListener('mouseleave', off);
    tiles.addEventListener('focusout', function (e) { if (!tiles.contains(e.relatedTarget)) off(); });
    if (tiles.getBoundingClientRect().top > vh * 0.9) {
      tiles.classList.add('pre');
      once([tiles], function () {
        $$('.tile img', tiles).forEach(function (im, i) { im.style.transitionDelay = (i * 0.12) + 's'; });
        tiles.classList.remove('pre');
        setTimeout(function () { $$('.tile img', tiles).forEach(function (im) { im.style.transitionDelay = ''; }); }, 1800);
      }, '0px 0px -20% 0px');
    }
  }

  var stage = $('#stage'), say = $('.place-say'), C = window.GW1 && window.GW1.CITIES;
  var run, step = 0, top0 = 0, cur = 0, bar;
  if (say) {
    var lines = say.innerHTML.split(/<br[^>]*>/);
    say.innerHTML = lines.map(function (l) { return '<span class="ln">' + l + '</span>'; }).join('');
    wrapNums(say);
    if (say.getBoundingClientRect().top > vh * 0.9) {
      say.classList.add('pre');
      once([say], function () { $$('.ln', say).forEach(function (l, i) { l.style.transitionDelay = (i * 0.12) + 's'; }); say.classList.remove('pre'); roll(say); }, '0px 0px -25% 0px');
    }
  }
  if (stage && C) {
    run = document.createElement('div'); run.className = 'stage-run';
    stage.parentNode.insertBefore(run, stage); run.appendChild(stage);
    var imgBox = $('#stageImg'), first = imgBox.querySelector('img'); first.classList.add('on');
    C.forEach(function (c, i) { if (!i) return; var im = new Image(); im.src = '../assets-shared/photo/' + c.img; im.alt = c.name + ' 단지 항공사진'; im.decoding = 'async'; imgBox.appendChild(im); });
    bar = document.createElement('div'); bar.className = 'stage-bar'; bar.innerHTML = '<i></i>'; stage.appendChild(bar);
    var btns = $$('#stageList button');
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        window.scrollTo({ top: cityY(i), behavior: RM ? 'auto' : 'smooth' });
        setCity(i);
      });
      b.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!k) return; e.preventDefault(); var n = clamp(i + k, 0, btns.length - 1); btns[n].focus(); btns[n].click();
      });
    });
  }
  var mode = 'sticky';
  function sizeRun() {
    if (!run) return;
    vh = window.innerHeight; vw = window.innerWidth;
    stage.style.height = '';
    var sh = stage.offsetHeight;
    mode = sh >= vh * 0.6 ? 'sticky' : 'pass';
    run.classList.toggle('is-pass', mode === 'pass');
    if (mode === 'pass') { step = 0; top0 = 0; stage.style.top = ''; run.style.height = ''; return; }
    stage.style.height = vh + 'px'; sh = vh;
    step = Math.round(vh * (vw < 768 ? 0.55 : 0.7));
    top0 = 0;
    stage.style.top = '0px';
    run.style.height = (sh + step * (C.length - 1)) + 'px';
  }
  function cityY(i) {
    var r = run.getBoundingClientRect(), base = r.top + window.scrollY;
    if (mode === 'pass') { var sh = stage.offsetHeight, f = i / (C.length - 1); return base + sh / 2 - (0.72 - f * 0.44) * vh + 2; }
    return base - top0 + i * step + 2;
  }
  function setCity(i) {
    if (i === cur || !stage) return; cur = i;
    $$('#stageImg img').forEach(function (im, k) { im.classList.toggle('on', k === i); });
    $$('#stageList button').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i); });
    var cap = $('#stageCap'); cap.classList.add('swap');
    setTimeout(function () { cap.innerHTML = window.GW1.placeCap(i); cap.classList.remove('swap'); }, 200);
  }
  function stageTick() {
    if (!run) return;
    var r = run.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) return;
    var p, idx;
    if (mode === 'pass') {
      var c = r.top + stage.offsetHeight / 2;
      p = clamp((0.72 * vh - c) / (0.44 * vh), 0, 1);
      idx = Math.round(p * (C.length - 1));
    } else {
      var d = top0 - r.top;
      p = clamp(d / (step * (C.length - 1)), 0, 1);
      idx = clamp(Math.floor(d / step + 0.5), 0, C.length - 1);
    }
    if (bar) bar.firstChild.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    setCity(idx);
  }

  var ap = $('#aboutPhoto'), at = $('.about-t');
  if (at && ap && ap.getBoundingClientRect().top > vh) at.classList.add('pre');
  function aboutTick() {
    if (!ap || RM) return;
    var r = ap.getBoundingClientRect(); if (r.top > vh || r.bottom < 0) return;
    var p = clamp(1 - r.top / (vh * 0.85), 0, 1), e = 1 - Math.pow(1 - p, 2);
    var ix = (vw < 768 ? 8 : 20) * (1 - e), iy = (vw < 768 ? 10 : 20) * (1 - e);
    ap.style.clipPath = 'inset(' + iy.toFixed(2) + '% ' + ix.toFixed(2) + '%)';
    if (p > 0.82 && at.classList.contains('pre')) at.classList.remove('pre');
  }

  function heroTick(y) {
    if (!heroEl || RM) return;
    var h = heroEl.offsetHeight; if (y > h) return;
    var p = clamp(y / h, 0, 1);
    heroBg.style.transform = 'translate3d(0,' + (y * 0.3).toFixed(1) + 'px,0)';
    shade.style.opacity = (p * 0.55).toFixed(3);
  }

  var secs = [['top', 'hero', '강원TP'], ['quick', 'quick', '바로가기'], ['notice', 'notice', '공고안내'], ['biz', 'biz', '주요 사업'], ['place', 'place', '입주 시설'], ['news', 'news', 'TP NOW'], ['about', 'about', 'TP소개']];
  var sideA = $$('.side a'), mbar = $('#mbar'), mtxt = $('#mbarTxt'), mlist;
  if (mbar) {
    mlist = document.createElement('nav'); mlist.className = 'mbar-list'; mlist.setAttribute('aria-label', '섹션 이동');
    mlist.innerHTML = secs.map(function (s, i) { return '<a href="#' + s[0] + '"' + (i ? '' : ' class="on"') + '>' + s[2] + '</a>'; }).join('');
    body.appendChild(mlist);
    mbar.setAttribute('role', 'button'); mbar.setAttribute('tabindex', '0'); mbar.setAttribute('aria-expanded', 'false');
    var tog = function () { var o = !mlist.classList.contains('is-open'); mlist.classList.toggle('is-open', o); mbar.classList.toggle('is-open', o); mbar.setAttribute('aria-expanded', o); };
    mbar.addEventListener('click', tog); mbar.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tog(); } });
    mlist.addEventListener('click', function (e) { if (e.target.closest('a')) tog(); });
  }
  var secEls = secs.map(function (s) { return document.getElementById(s[1]); });
  var activeSec = 0, quietT;
  function secTick() {
    var mid = vh * 0.45, idx = 0;
    secEls.forEach(function (el, i) { if (el && el.getBoundingClientRect().top <= mid) idx = i; });
    if (idx === activeSec) return; activeSec = idx;
    sideA.forEach(function (a, i) { a.classList.toggle('on', i === idx); a.classList.remove('quiet'); });
    clearTimeout(quietT);
    if (idx > 0 && sideA[idx]) quietT = setTimeout(function () { sideA[idx].classList.add('quiet'); }, 1600);
    if (mtxt) mtxt.textContent = secs[idx][2];
    if (mlist) $$('a', mlist).forEach(function (a, i) { a.classList.toggle('on', i === idx); });
  }
  $$('.side a, .ft-top, .mbar-list a').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1), el = document.getElementById(id); if (!el) return;
      e.preventDefault(); window.scrollTo({ top: id === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY, behavior: RM ? 'auto' : 'smooth' });
    });
  });

  var menu = document.createElement('div'); menu.className = 'menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', '전체 메뉴');
  var cols = $('.ft-cols');
  menu.innerHTML = '<div class="wrap"><div class="menu-top"><img src="../assets-shared/img/logo-navy.png" alt="강원테크노파크"><button aria-label="메뉴 닫기"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="m5 5 14 14M19 5 5 19"/></svg></button></div><div class="menu-cols">' + (cols ? cols.innerHTML : '') + '</div></div>';
  body.appendChild(menu);
  var opener = null;
  function openMenu(btn) { opener = btn; menu.classList.add('is-open'); root.style.overflow = 'hidden'; setTimeout(function () { $('.menu-top button', menu).focus(); }, 50); }
  function closeMenu() { menu.classList.remove('is-open'); root.style.overflow = ''; if (opener) opener.focus(); }
  $$('.hd-ic[aria-label="전체 메뉴"], .hd-ham').forEach(function (b) { b.addEventListener('click', function () { openMenu(b); }); });
  $('.menu-top button', menu).addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (menu.classList.contains('is-open')) closeMenu(); if (mlist && mlist.classList.contains('is-open')) mbar.click(); } });
  var sb = $('.hd-ic[aria-label="검색"]');
  if (sb) sb.addEventListener('click', function () { window.open(window.GW_BASE ? window.GW_BASE.listUrl : 'https://www.gwtp.or.kr/', '_blank', 'noopener'); });

  var ticking = false;
  function frame() {
    ticking = false;
    var y = window.scrollY;
    header(y); heroTick(y); stageTick(); aboutTick(); secTick();
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  window.addEventListener('scroll', req, { passive: true });
  var rt, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(rt); rt = setTimeout(function () {
      if (window.innerWidth === lastW && Math.abs(window.innerHeight - vh) < 120) return;
      lastW = window.innerWidth; sizeRun(); req();
    }, 200);
  });
  sizeRun(); frame();
})();
