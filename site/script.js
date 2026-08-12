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
   AMBIENT BACKDROP — soft brand-tinted blobs + cursor glow.
   (Calm parallax only — the storm/lightning/thunder effects were
   dropped as part of the Pokecut-style restyle.)
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var gsap = window.gsap;
  if (!gsap || reduce) return;

  var rnd = gsap.utils.random;
  var smokes = gsap.utils.toArray(".smoke");
  var glow = document.querySelector(".cursor-glow");
  if (!smokes.length || !glow) return;

  var W = window.innerWidth, H = window.innerHeight, cx = W / 2, cy = H / 2;
  function sizeStage() {
    W = window.innerWidth; H = window.innerHeight; cx = W / 2; cy = H / 2;
  }
  sizeStage();
  window.addEventListener("resize", sizeStage);

  /* living blobs: slow scale / rotation / opacity loops */
  smokes.forEach(function (s) {
    gsap.to(s, { scale: rnd(1.1, 1.4), rotation: rnd(-16, 16), duration: rnd(16, 26), repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(s, { opacity: rnd(0.35, 0.6), duration: rnd(6, 11), repeat: -1, yoyo: true, ease: "sine.inOut" });
  });

  /* cursor parallax (per-layer depth) + glow follow */
  var layers = smokes.map(function (s) {
    return {
      x: gsap.quickTo(s, "x", { duration: 1.8, ease: "power3" }),
      y: gsap.quickTo(s, "y", { duration: 1.8, ease: "power3" }),
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
})();
