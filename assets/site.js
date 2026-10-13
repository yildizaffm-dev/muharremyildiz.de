/* muharremyildiz.de — Bewegung. Alles hängt an einem Fortschrittswert pro Szene. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;
  var narrow = window.matchMedia("(max-width: 860px)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasGsap = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) { history.scrollRestoration = "manual"; }
  if (!location.hash) { window.scrollTo(0, 0); }

  function splitWords(el) {
    if (!el || el.dataset.split) return $$(".w", el);
    var words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w"; s.textContent = w; el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.split = "1";
    return $$(".w", el);
  }

  /* ---------- Weicher Scroll ---------- */
  var lenis = null;
  if (!reduce && hasGsap && typeof Lenis !== "undefined") {
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    $$("a[href^='#']").forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (id.length < 2) return;
        var target = $(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -40, duration: 1.4 });
      });
    });
  }

  /* ---------- Kopfleiste ---------- */
  var top = $(".top");
  if (top) {
    if (hasGsap && !reduce) {
      ScrollTrigger.create({ start: "top -80", onUpdate: function (s) { top.classList.toggle("is-solid", s.progress > 0 || window.scrollY > 80); } });
    }
    window.addEventListener("scroll", function () { top.classList.toggle("is-solid", window.scrollY > 80); }, { passive: true });
  }

  /* ---------- Lichtfeld (Canvas) ---------- */
  var heroProgress = 0;
  function lightField(canvas) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1, motes = [], t = 0, last = performance.now(), running = true;
    for (var i = 0; i < 120; i++) {
      motes.push({ a: Math.random() * Math.PI * 2, r: 0.35 + Math.random() * 0.75, s: 0.00004 + Math.random() * 0.00006, z: 0.6 + Math.random() * 1.6, o: Math.random() * 6.28, dir: Math.random() < 0.5 ? -1 : 1 });
    }
    function size() {
      var W = canvas.clientWidth, H = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      if (W !== w || H !== h) { w = W; h = H; canvas.width = w * dpr; canvas.height = h * dpr; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function frame(now) {
      var dt = Math.min(50, now - last); last = now; t += dt;
      size(); ctx.clearRect(0, 0, w, h);
      var p = heroProgress;                 // 0 = Ruhe, 1 = alles dem Licht zugewandt
      var cx = w * (0.62 - 0.12 * p), cy = h * (0.42 + 0.08 * p);
      var R = Math.max(w, h);
      // drei schräge, warme Lichtbahnen von oben rechts
      ctx.save(); ctx.translate(w * 0.82, -h * 0.1);
      for (var i = 0; i < 3; i++) {
        var ang = 0.5 + i * 0.11 + Math.sin(t * 0.00008 + i) * 0.035;
        ctx.save(); ctx.rotate(ang);
        var g = ctx.createLinearGradient(0, 0, 0, h * 1.9);
        var k = (0.07 + 0.04 * Math.sin(t * 0.00025 + i * 1.7)) * (1 - 0.5 * p);
        g.addColorStop(0, "rgba(226,186,104,0)"); g.addColorStop(0.25, "rgba(226,186,104," + k + ")"); g.addColorStop(1, "rgba(226,186,104,0)");
        ctx.fillStyle = g; var bw = w * (0.045 + 0.02 * i); ctx.fillRect(-bw / 2, 0, bw, h * 1.9); ctx.restore();
      }
      ctx.restore();
      // Lichtkern
      var core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.08 + 0.42 * p));
      core.addColorStop(0, "rgba(255,246,214," + (0.35 + 0.5 * p) + ")");
      core.addColorStop(0.45, "rgba(242,223,168," + (0.16 + 0.3 * p) + ")");
      core.addColorStop(1, "rgba(242,223,168,0)");
      ctx.fillStyle = core; ctx.fillRect(0, 0, w, h);
      // Körner: driften, mit wachsendem p zum Kern hin
      for (var m = 0; m < motes.length; m++) {
        var q = motes[m];
        q.a += q.s * dt * q.dir * (1 + 2.5 * p);
        var pull = 1 - 0.78 * p;
        var rr = q.r * pull * R * 0.5;
        var x = cx + Math.cos(q.a) * rr * (1 + 0.08 * Math.sin(t * 0.0004 + q.o));
        var y = cy + Math.sin(q.a) * rr * 0.72;
        var alpha = (0.18 + 0.22 * (0.5 + 0.5 * Math.sin(t * 0.0018 + q.o))) * (0.9 + 0.6 * p);
        ctx.fillStyle = "rgba(214,164,70," + Math.min(alpha, 0.85) + ")";
        ctx.beginPath(); ctx.arc(x, y, q.z * (1 + 0.6 * p), 0, Math.PI * 2); ctx.fill();
      }
      // der Diamant: erscheint, wenn sich alles zuwendet
      if (p > 0.25) {
        var d = Math.min(1, (p - 0.25) / 0.45);
        var s = 18 + 60 * d;
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Math.PI / 4 + t * 0.00012);
        ctx.strokeStyle = "rgba(118,90,38," + (0.55 * d) + ")"; ctx.lineWidth = 1.2;
        ctx.strokeRect(-s / 2, -s / 2, s, s);
        ctx.strokeStyle = "rgba(118,90,38," + (0.28 * d) + ")"; ctx.strokeRect(-s * 0.68, -s * 0.68, s * 1.36, s * 1.36);
        ctx.restore();
      }
      if (running && !reduce) requestAnimationFrame(frame);
    }
    if (reduce) { heroProgress = 0.15; frame(performance.now()); return; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { var was = running; running = e.isIntersecting; if (running && !was) { last = performance.now(); requestAnimationFrame(frame); } });
      }, { threshold: 0 }).observe(canvas);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- Hero / Vorraum ---------- */
  var heroWrap = $(".hero-wrap");
  if (heroWrap) {
    var hero = $(".hero", heroWrap);
    var canvas = $("canvas", hero);
    var lines = $$("h1 .l span", hero);
    var frage = $(".frage p", hero);
    var words = splitWords(frage);
    if (canvas) lightField(canvas);
    if (reduce || !hasGsap) {
      heroWrap.classList.add("is-static");
    } else {
      if (window.scrollY < 40) {
        gsap.set(lines, { yPercent: 110 });
        gsap.to(lines, { yPercent: 0, duration: 1.3, ease: "power4.out", stagger: 0.12, delay: 0.15 });
        gsap.from($(".portrait", hero), { y: 70, opacity: 0, duration: 1.5, ease: "power3.out", delay: 0.35 });
        gsap.from($$(".kicker, .lead, .hint", hero), { opacity: 0, y: 12, duration: 0.9, stagger: 0.12, delay: 0.7 });
      }
      var tl = gsap.timeline({
        scrollTrigger: { trigger: heroWrap, start: "top top", end: "bottom bottom", scrub: 0.7, pin: hero, pinSpacing: false, onUpdate: function (s) { heroProgress = s.progress; } }
      });
      tl.to($(".hint", hero), { opacity: 0, duration: 0.06 }, 0)
        .to($$(".kicker, .lead", hero), { opacity: 0, y: -24, duration: 0.16 }, 0.02)
        .to(lines, { yPercent: -125, duration: 0.3, stagger: 0.05, ease: "power2.in" }, 0.06)
        .to($(".portrait", hero), { yPercent: -14, scale: 0.7, opacity: 0, transformOrigin: "50% 100%", duration: 0.36, ease: "power2.in" }, 0.1)
        .to($(".disc", hero), { scale: 10, duration: 0.42, ease: "power2.inOut" }, 0.24)
        .to($(".frage", hero), { opacity: 1, duration: 0.08 }, 0.5)
        .to(words, { opacity: 1, duration: 0.3, stagger: { each: 0.035 }, ease: "none" }, 0.54)
        .to($(".disc", hero), { opacity: 0, duration: 0.12, ease: "power1.inOut" }, 0.9)
        .to({}, { duration: 0.02 });
    }
  }

  /* ---------- Kurz gesagt: Wort für Wort ---------- */
  $$(".lines p, .echo").forEach(function (p) {
    var ws = splitWords(p);
    if (reduce || !hasGsap) { ws.forEach(function (w) { w.style.opacity = 1; w.style.transform = "none"; }); return; }
    gsap.to(ws, { opacity: 1, y: 0, ease: "none", stagger: 0.05, scrollTrigger: { trigger: p, start: "top 88%", end: "top 45%", scrub: true } });
  });

  /* ---------- Reise ---------- */
  var journey = $(".journey");
  if (journey) {
    var vp = $(".viewport", journey), track = $(".track", journey), stations = $$(".station", journey), svg = $("svg.path", journey), count = $(".count", journey);
    if (reduce || !hasGsap || narrow) {
      journey.classList.add("is-static");
    } else {
      stations.forEach(function (s, i) { gsap.set(s, { y: i % 2 ? 40 : -40, opacity: 0.22 }); });
      var path = $("path", svg), dot = $("circle", svg), L = 0;
      function buildPath() {
        var tw = track.scrollWidth, th = vp.clientHeight;
        svg.setAttribute("width", tw); svg.setAttribute("height", th); svg.setAttribute("viewBox", "0 0 " + tw + " " + th);
        var pts = stations.map(function (s, i) { return { x: s.offsetLeft + s.offsetWidth / 2, y: th / 2 + (i % 2 ? 40 : -40) + (i % 2 ? -s.offsetHeight * 0.74 : s.offsetHeight * 0.74) }; });
        var d = "M 0 " + (th / 2);
        var prev = { x: 0, y: th / 2 };
        pts.forEach(function (p) { var mx = (prev.x + p.x) / 2; d += " C " + mx + " " + prev.y + " " + mx + " " + p.y + " " + p.x + " " + p.y; prev = p; });
        d += " C " + (prev.x + 200) + " " + prev.y + " " + (tw - 100) + " " + (th / 2) + " " + tw + " " + (th / 2);
        path.setAttribute("d", d); L = path.getTotalLength();
        path.style.strokeDasharray = L; path.style.strokeDashoffset = L;
      }
      buildPath();
      var dist = function () { return track.scrollWidth - vp.clientWidth; };
      var tween = gsap.to(track, {
        x: function () { return -dist(); }, ease: "none",
        scrollTrigger: {
          trigger: vp, start: "top top", end: function () { return "+=" + (dist() + window.innerHeight * 0.5); }, scrub: 0.8, pin: true, anticipatePin: 1, invalidateOnRefresh: true,
          onRefreshInit: buildPath,
          onUpdate: function (s) {
            var p = s.progress; var len = L * Math.min(1, p * 1.08);
            path.style.strokeDashoffset = L - len;
            var pt = path.getPointAtLength(len); dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
            if (count) { var idx = Math.min(stations.length, Math.max(1, Math.round(p * stations.length + 0.4))); count.textContent = idx + " / " + stations.length; }
          }
        }
      });
      stations.forEach(function (s) {
        gsap.to(s, { opacity: 1, ease: "none", scrollTrigger: { trigger: s, containerAnimation: tween, start: "left 92%", end: "left 58%", scrub: true } });
      });
    }
  }

  /* ---------- Bänder ---------- */
  $$(".band").forEach(function (band, i) {
    var inner = band.innerHTML; band.innerHTML = inner + inner + inner;
    if (reduce || !hasGsap) return;
    var dir = i % 2 ? 1 : -1;
    var loop = gsap.fromTo(band, { xPercent: dir > 0 ? -33.333 : 0 }, { xPercent: dir > 0 ? 0 : -33.333, duration: 38, ease: "none", repeat: -1 });
    var speed = 1, target = 1;
    ScrollTrigger.create({ trigger: band, start: "top bottom", end: "bottom top", onUpdate: function (s) { target = 1 + Math.min(6, Math.abs(s.getVelocity()) / 350); } });
    gsap.ticker.add(function () { target += (1 - target) * 0.04; speed += (target - speed) * 0.1; loop.timeScale(speed); });
  });

  /* ---------- Haltung: Ringe und Einträge ---------- */
  var stance = $(".stance");
  if (stance && hasGsap && !reduce) {
    $$(".rings g", stance).forEach(function (g, i) {
      gsap.to(g, { rotation: (i % 2 ? -1 : 1) * (40 + i * 18), transformOrigin: "50% 50%", ease: "none", scrollTrigger: { trigger: stance, start: "top bottom", end: "bottom top", scrub: true } });
    });
    $$(".item", stance).forEach(function (it, i) {
      gsap.to(it, { clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: it, start: "top 86%", once: true } });
    });
  } else if (stance) { $$(".item", stance).forEach(function (it) { it.style.clipPath = "none"; }); }

  /* ---------- Orte: lebende Uhren ---------- */
  function clocks() {
    $$(".place").forEach(function (pl) {
      var tz = pl.dataset.tz, time = $("time", pl), sky = $(".sky", pl);
      if (!tz || !time) return;
      try {
        var f = new Intl.DateTimeFormat("de-DE", { timeZone: tz, hour: "2-digit", minute: "2-digit" });
        time.textContent = f.format(new Date()) + " Uhr";
        var hf = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "numeric", minute: "numeric", hour12: false }).formatToParts(new Date());
        var hh = 0, mm = 0; hf.forEach(function (p) { if (p.type === "hour") hh = +p.value; if (p.type === "minute") mm = +p.value; });
        var hour = (hh % 24) + mm / 60;
        var day = hour >= 6 && hour < 19.5;
        sky.classList.toggle("night", !day);
        var f1 = day ? (hour - 6) / 13.5 : ((hour + 24 - 19.5) % 24) / 10.5;
        sky.style.setProperty("--sx", f1.toFixed(3));
        sky.style.setProperty("--sy", (1 - Math.sin(Math.PI * f1) * 0.75).toFixed(3));
      } catch (e) { time.textContent = ""; }
    });
  }
  if ($(".place")) { clocks(); setInterval(clocks, 30000); }

  /* ---------- Cursorlicht ---------- */
  var glow = $(".glow");
  if (glow && finePointer && !reduce && hasGsap) {
    var qx = gsap.quickTo(glow, "x", { duration: 0.6, ease: "power3" }), qy = gsap.quickTo(glow, "y", { duration: 0.6, ease: "power3" });
    window.addEventListener("pointermove", function (e) { qx(e.clientX); qy(e.clientY); glow.style.opacity = 1; }, { passive: true });
    document.addEventListener("pointerleave", function () { glow.style.opacity = 0; });
  }

  if (hasGsap) { window.addEventListener("load", function () { ScrollTrigger.refresh(); }); }
})();
