/* SKILLS — universal-agent-skills landing page interactions */
(function () {
  "use strict";

  /* ---------- Toast ---------- */
  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1600);
  }

  /* ---------- Copy to clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var text = btn.getAttribute("data-copy-text") || "";
    copyText(text).then(
      function () {
        var label = btn.querySelector("svg") ? null : btn.textContent;
        if (label !== null) btn.textContent = "Copied";
        btn.classList.add("is-copied");
        showToast("Copied to clipboard");
        setTimeout(function () {
          if (label !== null) btn.textContent = label;
          btn.classList.remove("is-copied");
        }, 1400);
      },
      function () {
        showToast("Copy failed — select manually");
      }
    );
  });

  /* ---------- Framework code tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  var panels = document.querySelectorAll(".code-panel[data-panel]");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-tab");
      tabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === target);
      });
    });
  });

  /* ---------- Leaderboard: search + category filter ---------- */
  var search = document.getElementById("search");
  var rows = Array.prototype.slice.call(document.querySelectorAll(".lb-row"));
  var empty = document.getElementById("lb-empty");
  var lbTabs = document.querySelectorAll(".lb-tab");
  var activeCat = "all";

  function applyFilter() {
    var q = (search ? search.value : "").trim().toLowerCase();
    var visible = 0;
    rows.forEach(function (row) {
      var matchCat = activeCat === "all" || row.getAttribute("data-cat") === activeCat;
      var hay = (row.getAttribute("data-search") || "").toLowerCase();
      var matchText = q === "" || hay.indexOf(q) !== -1;
      var show = matchCat && matchText;
      row.style.display = show ? "" : "none";
      if (show) visible++;
    });
    if (empty) empty.hidden = visible !== 0;
  }

  if (search) {
    search.addEventListener("input", applyFilter);
  }
  lbTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activeCat = tab.getAttribute("data-cat");
      lbTabs.forEach(function (t) { t.classList.remove("is-active"); });
      tab.classList.add("is-active");
      applyFilter();
    });
  });

  /* ---------- "/" focuses search, Esc clears ---------- */
  document.addEventListener("keydown", function (e) {
    var typing = /^(input|textarea)$/i.test((e.target.tagName || ""));
    if (e.key === "/" && !typing && search) {
      e.preventDefault();
      search.focus();
    } else if (e.key === "Escape" && document.activeElement === search) {
      search.value = "";
      applyFilter();
      search.blur();
    }
  });
})();

/* ============================================================
   GSAP STORM — sky smoke + cursor parallax + lightning/thunder
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  if (!gsap || reduce) return;

  var rnd = gsap.utils.random;
  var smokes = gsap.utils.toArray(".smoke");
  var glow = document.querySelector(".cursor-glow");
  var flash = document.querySelector(".fx-flash");
  var svg = document.querySelector(".fx-bolts");
  var bolt = svg ? svg.querySelector(".bolt:not(.bolt--branch)") : null;
  var branch = svg ? svg.querySelector(".bolt--branch") : null;
  var page = document.querySelector(".page");
  if (!smokes.length || !glow || !flash || !svg || !bolt) return;

  var W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2;
  function sizeSVG() {
    W = window.innerWidth; H = window.innerHeight; cx = W / 2; cy = H / 2;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  }
  sizeSVG();
  window.addEventListener("resize", sizeSVG);

  /* living smoke: scale / rotation / opacity loops */
  smokes.forEach(function (s) {
    gsap.to(s, { scale: rnd(1.15, 1.7), rotation: rnd(-22, 22), duration: rnd(12, 20), repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(s, { opacity: rnd(0.22, 0.5), duration: rnd(5, 9), repeat: -1, yoyo: true, ease: "sine.inOut" });
  });

  /* cursor parallax (per-layer depth) + glow follow */
  var layers = smokes.map(function (s) {
    return {
      x: gsap.quickTo(s, "x", { duration: 1.6, ease: "power3" }),
      y: gsap.quickTo(s, "y", { duration: 1.6, ease: "power3" }),
      d: parseFloat(s.dataset.depth) || 0.05
    };
  });
  gsap.set(glow, { xPercent: -50, yPercent: -50 });
  var gX = gsap.quickTo(glow, "x", { duration: 0.5, ease: "power3" });
  var gY = gsap.quickTo(glow, "y", { duration: 0.5, ease: "power3" });

  window.addEventListener("pointermove", function (e) {
    var dx = e.clientX - cx, dy = e.clientY - cy;
    layers.forEach(function (o) { o.x(-dx * o.d); o.y(-dy * o.d); });
    gX(e.clientX); gY(e.clientY);
    gsap.to(glow, { opacity: 1, duration: 0.4, overwrite: "auto" });
  }, { passive: true });
  document.addEventListener("mouseleave", function () { gsap.to(glow, { opacity: 0, duration: 0.6 }); });

  /* jagged lightning path */
  function jagged(x, y0, y1, spread) {
    var seg = 16, dy = (y1 - y0) / seg, d = "M " + x.toFixed(1) + " " + y0.toFixed(1);
    for (var i = 1; i <= seg; i++) {
      var t = i / seg;
      var nx = x + rnd(-spread, spread) * (1 - t * 0.4);
      var ny = y0 + dy * i + rnd(-dy * 0.3, dy * 0.3);
      d += " L " + nx.toFixed(1) + " " + ny.toFixed(1);
    }
    return d;
  }
  function flickerEl(el) {
    gsap.killTweensOf(el);
    gsap.timeline()
      .set(el, { opacity: 1 })
      .to(el, { opacity: 0.15, duration: 0.06 })
      .to(el, { opacity: 0.9, duration: 0.05 })
      .to(el, { opacity: 0, duration: 0.5, ease: "power2.in" });
  }

  var lastStrike = 0;
  function strike(x, y, big) {
    bolt.setAttribute("d", jagged(x, -10, y, big ? 60 : 42));
    flickerEl(bolt);
    if (branch) {
      branch.setAttribute("d", jagged(x + rnd(-30, 30), y * rnd(0.4, 0.7), y + rnd(20, 80), 50));
      flickerEl(branch);
    }
    gsap.killTweensOf(flash);
    gsap.timeline()
      .set(flash, { opacity: 0 })
      .to(flash, { opacity: big ? 0.6 : 0.2, duration: 0.05 })
      .to(flash, { opacity: big ? 0.25 : 0.08, duration: 0.06 })
      .to(flash, { opacity: 0, duration: 0.5, ease: "power2.in" });

    if (big && page) {
      gsap.delayedCall(0.12, function () {
        var a = 5;
        gsap.timeline({ onComplete: function () { gsap.set(page, { clearProps: "transform" }); } })
          .to(page, { x: a, y: -a * 0.7, duration: 0.05 })
          .to(page, { x: -a * 0.8, y: a * 0.6, duration: 0.05 })
          .to(page, { x: a * 0.5, y: a * 0.5, duration: 0.05 })
          .to(page, { x: -a * 0.4, y: -a * 0.3, duration: 0.05 })
          .to(page, { x: 0, y: 0, duration: 0.1, ease: "power2.out" });
      });
    }
  }

  /* ---- synthesized thunder (Web Audio) ---- */
  var actx = null, noiseBuf = null;
  function getCtx() {
    if (actx) return actx;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    try { actx = new AC(); } catch (e) { return null; }
    return actx;
  }
  function getNoise(ctx) {
    if (noiseBuf) return noiseBuf;
    var dur = 3, len = Math.floor(dur * ctx.sampleRate);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = noiseBuf.getChannelData(0), last = 0;
    for (var i = 0; i < len; i++) {
      var white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02; // brown noise
      data[i] = last * 3.5;
    }
    return noiseBuf;
  }
  function playThunder() {
    var ctx = getCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    var t = ctx.currentTime, buf = getNoise(ctx);
    var peak = 0.42;

    var master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(peak, t + 0.06);
    master.gain.exponentialRampToValueAtTime(peak * 0.5, t + 0.5);
    master.gain.exponentialRampToValueAtTime(peak * 0.62, t + 0.95); // rolling bump
    master.gain.exponentialRampToValueAtTime(0.0001, t + 2.4);
    master.connect(ctx.destination);

    /* deep rumble: brown noise through a downward-sweeping lowpass */
    var src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = 0.8 + Math.random() * 0.3;
    var lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(440, t);
    lp.frequency.exponentialRampToValueAtTime(90, t + 1.8);
    lp.Q.value = 0.8;
    src.connect(lp); lp.connect(master);

    /* rolling tremolo on the rumble */
    var lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
    lfo.frequency.value = 6 + Math.random() * 4;
    lfoGain.gain.value = 0.12;
    lfo.connect(lfoGain); lfoGain.connect(master.gain);
    lfo.start(t); lfo.stop(t + 2.3);

    /* bright initial crack */
    var crack = ctx.createBufferSource();
    crack.buffer = buf;
    crack.playbackRate.value = 1.4;
    var bp = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1700; bp.Q.value = 0.7;
    var crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.0001, t);
    crackGain.gain.exponentialRampToValueAtTime(0.5, t + 0.012);
    crackGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
    crack.connect(bp); bp.connect(crackGain); crackGain.connect(ctx.destination);

    src.start(t); src.stop(t + 2.6);
    crack.start(t); crack.stop(t + 0.3);
    src.onended = function () { try { master.disconnect(); } catch (e) {} };
  }

  /* thunder on click / tap */
  window.addEventListener("pointerdown", function (e) {
    var now = Date.now();
    if (now - lastStrike < 180) return;
    lastStrike = now;
    strike(e.clientX, e.clientY, true);
    playThunder();
  });

  /* ambient distant storm */
  function ambient() {
    if (Math.random() < 0.5) {
      gsap.timeline().set(flash, { opacity: 0 }).to(flash, { opacity: 0.07, duration: 0.12 }).to(flash, { opacity: 0, duration: 0.7 });
    } else {
      strike(rnd(W * 0.1, W * 0.9), rnd(H * 0.4, H * 0.85), false);
    }
    gsap.delayedCall(rnd(7, 15), ambient);
  }
  gsap.delayedCall(rnd(4, 8), ambient);
})();
