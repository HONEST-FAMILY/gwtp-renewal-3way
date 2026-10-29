
(function () {
  var G = window.GW, B = window.GW_BASE, esc = G.esc;
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2,.7,.2,1)';
  var list = document.getElementById('noticeCards'), cntEl = document.getElementById('noticeCnt'), goN = document.getElementById('goN');
  var facEl = document.getElementById('facCards');

  var snap = null, nums = null, facH = null;
  function pageRects() { var m = {}; [].forEach.call(list.querySelectorAll('.card'), function (c) { var r = c.getBoundingClientRect(); m[c.dataset.idx] = { x: r.left + scrollX, y: r.top + scrollY }; }); return m; }
  function readNums() { return { cnt: parseInt(cntEl.textContent, 10) || 0, go: parseInt((goN.textContent.match(/\d+/) || [0])[0], 10) || 0 }; }
  function before() { snap = pageRects(); nums = readNums(); }
  document.addEventListener('change', function (e) { if (e.target.closest('.finder')) before(); }, true);
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-reset],[data-more],[data-sector]')) before();
    if (e.target.closest('[data-city]')) facH = facEl.getBoundingClientRect().height;
  }, true);
  function roll(el, from, to, fmt) {
    if (RM || from === to) return;
    var t0 = performance.now(), d = 480;
    el.textContent = fmt(from);
    requestAnimationFrame(function f(t) { var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(from + (to - from) * e)); if (k < 1) requestAnimationFrame(f); });
  }
  function after() {
    var old = snap; snap = null;
    if (!old) return;
    var now = readNums();
    roll(cntEl, nums.cnt, now.cnt, function (v) { return v + '건'; });
    roll(goN, nums.go, now.go, function (v) { return '공고 ' + v + '건 보기'; });
    if (RM) { decorate(); return; }
    var i = 0;
    [].forEach.call(list.querySelectorAll('.card'), function (c) {
      var r = c.getBoundingClientRect(), o = old[c.dataset.idx];
      if (o) {
        var dx = o.x - (r.left + scrollX), dy = o.y - (r.top + scrollY);
        if (Math.abs(dx) + Math.abs(dy) > 1) c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: 460, easing: EASE });
      } else {
        c.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: 45 * Math.min(i++, 8), easing: EASE, fill: 'backwards' });
      }
    });
    decorate();
  }
  document.addEventListener('gw:filter', after);
  document.addEventListener('gw:more', after);

  function endAt(n) { if (!n.apply_end) return null; var p = n.apply_end.split('-'), t = (n.apply_end_time || '23:59').split(':'); return new Date(+p[0], +p[1] - 1, +p[2], +t[0], +t[1]); }
  function left(n) {
    var e = endAt(n); if (!e) return '';
    var ms = e - new Date(); if (ms <= 0) return '접수 마감됨';
    var h = Math.floor(ms / 36e5), m = Math.floor(ms % 36e5 / 6e4);
    return '마감까지 ' + (h >= 24 ? Math.floor(h / 24) + '일 ' + (h % 24) + '시간' : h + '시간 ' + m + '분');
  }
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (en) {
      if (!en.isIntersecting) return; io.unobserve(en.target);
      if (!RM) en.target.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.14)' }, { transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 1100, easing: 'ease-out' });
    });
  }, { threshold: 0.9 }) : null;
  function decorate() {
    [].forEach.call(list.querySelectorAll('.card'), function (c) {
      c.tabIndex = 0; c.setAttribute('aria-expanded', c.classList.contains('open'));
      var dd = c.querySelector('.dd.urgent');
      if (dd) { dd.style.transformOrigin = 'left center'; dd.style.display = 'inline-block'; if (io) io.observe(dd); }
    });
  }
  var timer = null;
  function showLeft(c) {
    var n = G.byId(c.dataset.idx), w = c.querySelector('.when');
    if (!n || !w || !c.querySelector('.dd.urgent')) return;
    if (!w.dataset.orig) w.dataset.orig = w.textContent;
    var tick = function () { w.textContent = left(n); };
    tick(); clearInterval(timer); timer = setInterval(tick, 30000);
    w.style.color = 'var(--red)'; w.style.fontWeight = '600';
  }
  function hideLeft(c) { var w = c.querySelector('.when'); clearInterval(timer); if (w && w.dataset.orig) { w.textContent = w.dataset.orig; w.style.color = ''; w.style.fontWeight = ''; } }
  list.addEventListener('mouseover', function (e) { var c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) showLeft(c); });
  list.addEventListener('mouseout', function (e) { var c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) hideLeft(c); });
  list.addEventListener('focusin', function (e) { var c = e.target.closest('.card'); if (c) showLeft(c); });
  list.addEventListener('focusout', function (e) { var c = e.target.closest('.card'); if (c && !c.contains(e.relatedTarget)) hideLeft(c); });

  function toast(msg) {
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t);
    if (!RM) t.animate([{ opacity: 0, transform: 'translate(-50%,8px)' }, { opacity: 1, transform: 'translate(-50%,0)' }], { duration: 200, easing: EASE });
    setTimeout(function () { t.remove(); }, 2600);
  }
  function xtra(n) {
    var docs = (n.docs || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('');
    return '<div class="xtra"><dl>' +
      (n.how ? '<dt>신청</dt><dd>' + esc(n.how) + '</dd>' : '') +
      (docs ? '<dt>서류</dt><dd><ul>' + docs + '</ul></dd>' : '') +
      (n.contact ? '<dt>문의</dt><dd>' + esc(n.contact) + '</dd>' : '') +
      '</dl><div class="acts">' + (n.apply_end ? '<button type="button" data-ics>마감 일정 받기</button>' : '') +
      '<a href="' + esc(n.url) + '" target="_blank" rel="noopener">공고 원문</a></div></div>';
  }
  function toggle(c) {
    var n = G.byId(c.dataset.idx); if (!n) return;
    var h0 = c.getBoundingClientRect().height, open = !c.classList.contains('open');
    var x = c.querySelector('.xtra');
    if (open) { c.classList.add('open'); if (!x) c.querySelector('dl').insertAdjacentHTML('afterend', xtra(n)); }
    else { c.classList.remove('open'); if (x) x.remove(); }
    c.setAttribute('aria-expanded', open);
    var h1 = c.getBoundingClientRect().height;
    if (!RM && Math.abs(h1 - h0) > 1) c.animate([{ height: h0 + 'px', overflow: 'hidden' }, { height: h1 + 'px', overflow: 'hidden' }], { duration: 320, easing: EASE });
  }
  list.addEventListener('click', function (e) {
    var ics = e.target.closest('[data-ics]');
    if (ics) { var n = G.byId(ics.closest('.card').dataset.idx); G.icsDownload(n, toast); return; }
    if (e.target.closest('a,button')) return;
    var c = e.target.closest('.card'); if (c) toggle(c);
  });
  list.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('card')) { e.preventDefault(); toggle(e.target); }
  });

  document.addEventListener('gw:city', function () {
    if (RM || facH == null) return;
    var h1 = facEl.getBoundingClientRect().height;
    facEl.animate([{ height: facH + 'px', overflow: 'hidden' }, { height: h1 + 'px', overflow: 'hidden' }], { duration: 320, easing: EASE });
    [].forEach.call(facEl.children, function (c, i) { c.animate([{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 340, delay: 60 * i, easing: EASE, fill: 'backwards' }); });
    facH = null;
  });

  decorate();
})();
