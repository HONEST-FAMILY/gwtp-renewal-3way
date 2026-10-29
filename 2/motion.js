(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && matchMedia('(hover: none)').matches;

  var net = document.getElementById('net');
  if (net) {
    var lines = [].slice.call(net.querySelectorAll('line'));
    var dots = [].slice.call(net.querySelectorAll('.dot'));
    var nodes = [].slice.call(net.querySelectorAll('.node'));
    var current = null;
    function keys(el) { return (el.getAttribute('data-k') || '').split(' '); }
    function activate(node) {
      if (current === node) return;
      current = node;
      if (!node) {
        net.classList.remove('act');
        lines.concat(dots, nodes).forEach(function (el) { el.classList.remove('on', 'near'); });
        return;
      }
      var k = node.getAttribute('data-k'), near = {};
      lines.forEach(function (l) {
        var ks = keys(l), hit = ks.indexOf(k) > -1;
        l.classList.toggle('on', hit);
        if (hit) ks.forEach(function (x) { near[x] = 1; });
      });
      dots.forEach(function (d) { d.classList.toggle('on', keys(d).indexOf(k) > -1); });
      nodes.forEach(function (n) {
        var nk = n.getAttribute('data-k');
        n.classList.toggle('on', n === node);
        n.classList.toggle('near', n !== node && !!near[nk]);
      });
      net.classList.add('act');
    }
    nodes.forEach(function (n) {
      n.addEventListener('mouseenter', function () { if (!coarse) activate(n); });
      n.addEventListener('focus', function () { activate(n); });
      n.addEventListener('blur', function () { if (current === n) activate(null); });
      n.addEventListener('click', function (e) {
        if (coarse && current !== n) { e.preventDefault(); activate(n); }
      });
    });
    net.addEventListener('mouseleave', function () { if (!coarse) activate(null); });
    document.addEventListener('click', function (e) { if (coarse && current && !e.target.closest('.node')) activate(null); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) { var c = current; activate(null); c.blur(); } });
  }

  var ml = document.getElementById('mList');
  if (ml) {
    ml.addEventListener('click', function (e) {
      var row = e.target.closest('.mi');
      if (!row || innerWidth > 767) return;
      if (!row.classList.contains('is-open')) {
        e.preventDefault();
        ml.querySelectorAll('.mi.is-open').forEach(function (r) { r.classList.remove('is-open'); });
        row.classList.add('is-open');
      }
    });
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
  function glide(el, to) {
    var from = el.scrollLeft, d = to - from;
    if (Math.abs(d) < 1) return;
    if (reduce) { el.scrollLeft = to; return; }
    var t0 = performance.now(), snap = el.style.scrollSnapType;
    el.style.scrollSnapType = 'none';
    el.__gliding = true;
    (function step(now) {
      var p = Math.min(1, (now - t0) / 1000);
      el.scrollLeft = from + d * easeOutCubic(p);
      if (p < 1) requestAnimationFrame(step); else { el.style.scrollSnapType = snap; el.__gliding = false; el.dispatchEvent(new Event('scroll')); }
    })(t0);
  }
  var track = document.getElementById('storyTrack');
  var arrows = document.querySelector('.story .arrows');
  if (track && arrows) {
    var prev = arrows.querySelector('.prev'), next = arrows.querySelector('.next');
    function stepW() { var c = track.children[0]; if (!c) return 0; return c.getBoundingClientRect().width + (parseFloat(getComputedStyle(track).columnGap) || 0); }
    function idx() { var s = stepW(); return s ? Math.round(track.scrollLeft / s) : 0; }
    function maxI() { var s = stepW(); return s ? Math.round((track.scrollWidth - track.clientWidth) / s) : 0; }
    prev.addEventListener('click', function () { var i = idx(); glide(track, (i <= 0 ? maxI() : i - 1) * stepW()); });
    next.addEventListener('click', function () { var i = idx(); glide(track, (i >= maxI() ? 0 : i + 1) * stepW()); });
    var sx = 0, sl = 0, down = false, moved = false;
    track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse' || e.button !== 0) return; down = true; moved = false; sx = e.clientX; sl = track.scrollLeft; });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (!moved && Math.abs(dx) > 6) { moved = true; track.classList.add('drag'); track.style.scrollSnapType = 'none'; }
      if (moved) track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function () {
      if (!down) return;
      down = false;
      if (moved) {
        track.classList.remove('drag');
        track.style.scrollSnapType = '';
        var s = stepW();
        glide(track, Math.max(0, Math.min(maxI(), Math.round(track.scrollLeft / s))) * s);
        setTimeout(function () { moved = false; }, 0);
      }
    });
    track.addEventListener('click', function (e) { if (moved) e.preventDefault(); }, true);
    track.addEventListener('dragstart', function (e) { e.preventDefault(); });
  }

  var ham = document.querySelector('.ham');
  if (ham) {
    var menu = document.createElement('nav');
    menu.className = 'mnav';
    menu.id = 'mnav';
    menu.setAttribute('aria-label', '전체 메뉴');
    menu.hidden = true;
    menu.innerHTML = [].slice.call(document.querySelectorAll('.gnb a')).map(function (a) { return '<a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>'; }).join('') +
      '<div class="mu">' + [].slice.call(document.querySelectorAll('.util a')).map(function (a) { return '<a href="' + a.getAttribute('href') + '">' + a.textContent + '</a>'; }).join('') + '</div>';
    document.body.appendChild(menu);
    ham.setAttribute('aria-controls', 'mnav');
    ham.setAttribute('aria-expanded', 'false');
    var bars = ham.innerHTML, cross = '<svg viewBox="0 0 35 35" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M9 9l17 17M26 9 9 26"/></svg>';
    function setMenu(open) {
      menu.hidden = !open;
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      ham.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      ham.innerHTML = open ? cross : bars;
      document.body.classList.toggle('menu-open', open);
      menu.style.top = Math.max(0, document.querySelector('.hd').getBoundingClientRect().bottom) + 'px';
    }
    ham.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); ham.focus(); } });
    window.addEventListener('resize', function () { if (innerWidth > 899 && !menu.hidden) setMenu(false); });
  }
})();
