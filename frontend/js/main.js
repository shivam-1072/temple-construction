// Site boot: config, content, animations, gallery lightbox, team modal, forms.
(function () {
  const S = window.SITE || {};
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const stagger = (els, step) => els.forEach((el, i) => el.style.setProperty("--d", (i * (step || 0.08)) + "s"));

  // ---- brand / contact injection ----
  $$("[data-cfg]").forEach(el => { const k = el.dataset.cfg; if (S[k] != null) el.textContent = S[k]; });
  $$("[data-tel]").forEach(a => a.href = "tel:" + String(S.phone || "").replace(/[^+\d]/g, ""));
  $$("[data-wa]").forEach(a => {
    const msg = encodeURIComponent(a.dataset.waMsg || ("Namaste, I want to discuss a temple project. (via " + (S.brand || "website") + ")"));
    a.href = "https://wa.me/" + S.whatsapp + "?text=" + msg;
  });
  $$("[data-mail]").forEach(a => a.href = "mailto:" + S.email);
  const map = $("#mapFrame"); if (map && S.mapEmbed) map.src = S.mapEmbed;
  const yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  // ---- animated mobile menu ----
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  function closeMenu() {
    navLinks.classList.remove("open"); menuBtn.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
    if ($("#lightbox").hidden && $("#teamModal").hidden) document.body.style.overflow = "";
  }
  window.closeMenu = closeMenu;
  if (menuBtn) menuBtn.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    document.body.style.overflow = open ? "hidden" : "";
  });
  $("#menuClose") && $("#menuClose").addEventListener("click", closeMenu);
  window.addEventListener("hashchange", closeMenu);
  $$("#navLinks a").forEach(a => a.addEventListener("click", closeMenu));

  // ---- sticky nav ----
  const nav = $("#nav");
  addEventListener("scroll", () => nav && nav.classList.toggle("scrolled", scrollY > 24), { passive: true });

  // ---- reveal on scroll ----
  const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add("in")), { threshold: 0.12 });
  const watch = () => $$(".reveal:not(.in)").forEach(el => io.observe(el));
  new MutationObserver(watch).observe(document.body, { childList: true, subtree: true });

  // ---- content ----
  let C = null, PROJECTS = [];
  fetch("./js/content.json").then(r => r.json()).then(json => {
    C = json; PROJECTS = C.projects || [];
    renderAll(); watch();
  }).catch(e => console.warn("content.json missing", e));

  function grid(id, arr, fn, step) {
    const el = document.getElementById(id); if (!el) return;
    el.innerHTML = arr.map(fn).join("");
    stagger([...el.children], step || 0.08);
  }

  function renderAll() {
    grid("servicesGrid", C.services, s =>
      `<article class="svc reveal"><div class="svc-n">${s.n}</div><h3>${s.t}</h3><p>${s.d}</p></article>`);
    grid("processTrack", C.process, (p, i) =>
      `<div class="step reveal"><div class="step-i">${i + 1}</div><h3>${p.t}</h3><p>${p.d}</p></div>`, 0.12);
    grid("workGrid", PROJECTS, (p, i) =>
      `<figure class="work reveal" data-idx="${i}" data-style="${p.style}" data-stone="${p.stone}" tabindex="0" role="button" aria-label="Open photos of ${p.title}">
        <div class="work-img" data-motif="${p.title}"><img loading="lazy" src="./assets/img/${p.img}" alt="${p.title}" onerror="window.__imgFallback(this)"></div>
        <figcaption><strong>${p.title}</strong><span>${p.place} · ${p.style} · ${p.stone}</span><span class="zoom-hint">Click to see more photos →</span></figcaption>
      </figure>`);
    grid("teamGrid", C.team || [], (t, i) =>
      `<article class="team-card reveal" data-idx="${i}" tabindex="0" role="button" aria-label="About ${t.name}">
        <div class="team-photo"><b>${initials(t.name)}</b><img loading="lazy" src="./assets/img/${t.img}" alt="${t.name}" onerror="this.remove()"></div>
        <h3>${t.name}</h3><p class="role">${t.role}</p><p>${t.short}</p><span class="more">Know more →</span>
      </article>`, 0.12);
    grid("stoneGrid", C.stones, s =>
      `<article class="stone reveal"><div class="sw" style="background:${s.sw}"></div><h3>${s.t}</h3><p>${s.d}</p></article>`);
    grid("quoteTrack", C.testimonials, t =>
      `<blockquote class="quote reveal">“${t.q}”<cite>— ${t.w}</cite></blockquote>`);
    grid("faqList", C.faqs, f =>
      `<div class="faq reveal"><button aria-expanded="false">${f.q}<span>⌄</span></button><div class="faq-a"><p>${f.a}</p></div></div>`);
    // stat numbers count up
    $$("#statGrid .stat b").forEach((b, i) => {
      const target = (C.stats[i] || {}).value || 0, suf = (C.stats[i] || {}).suffix || "";
      const t0 = performance.now();
      (function tick(t) {
        const k = Math.min(1, (t - t0) / 1300);
        b.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))) + suf;
        if (k < 1) requestAnimationFrame(tick);
      })(t0);
    });
    bindAll();
  }

  function initials(name) {
    return String(name || "?").replace(/^(Shri|Ar|Smt|Mr|Mrs)\.?\s+/i, "").split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
  }

  // ---- SVG motif fallback (also used when a photo file is missing) ----
  window.motifSVG = motifSVG;
  window.__imgFallback = function (img) {
    const d = img.parentElement, seed = d.dataset.motif || "temple";
    img.remove(); d.innerHTML = motifSVG(seed);
  };
  function motifSVG(seed) {
    let h = 0; for (const c of seed) h = (h * 31 + c.charCodeAt(0)) % 997;
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="g${h}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#E8D9BE"/><stop offset="1" stop-color="#C9AE7E"/>
      </linearGradient></defs>
      <rect width="400" height="300" fill="url(#g${h})"/>
      <g fill="none" stroke="#1A1611" stroke-opacity=".55">
        <path d="M200 ${40 + h % 30} L${320 - h % 40} 220 L${80 + h % 40} 220 Z" stroke-width="3"/>
        <path d="M200 110 L270 210 L130 210 Z" stroke-width="1.5"/>
        <circle cx="200" cy="180" r="${18 + h % 20}" stroke-width="1.5"/>
      </g></svg>`;
  }

  function bindAll() {
    bindFilters(); bindFaq(); bindWork(); bindTeam(); bindTimeline(); bindBA();
  }

  // ---- work filters ----
  function bindFilters() {
    $$("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
      $$("[data-filter]").forEach(b => b.classList.remove("on"));
      btn.classList.add("on");
      const [k, v] = btn.dataset.filter.split(":");
      $$("#workGrid .work").forEach(w => {
        const show = v === "all" || w.dataset[k] === v;
        w.style.display = show ? "" : "none";
        if (show) { w.classList.remove("in"); requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add("in"))); }
      });
    }));
  }

  // ---- FAQ ----
  function bindFaq() {
    $$("#faqList .faq button").forEach(b => b.addEventListener("click", () => {
      const item = b.parentElement, open = item.classList.toggle("open");
      b.setAttribute("aria-expanded", open);
    }));
  }

  // ---- process timeline progress bar ----
  function bindTimeline() {
    const bar = $("#tlBar"), track = $("#processTrack");
    if (!bar || !track) return;
    const upd = () => {
      const r = track.getBoundingClientRect(), vh = innerHeight;
      const k = Math.min(1, Math.max(0, (vh * 0.75 - r.top) / (r.height + vh * 0.15)));
      bar.style.width = (k * 100).toFixed(1) + "%";
    };
    addEventListener("scroll", upd, { passive: true }); upd();
  }

  // ---- gallery lightbox: extra photos auto-found by file name ----
  // Drop files next to the cover:  project-1-2.jpg, project-1-3.jpg … (any number, .jpg/.jpeg/.webp/.png)
  const photoCache = {};
  function probePhotos(p) {
    if (photoCache[p.img]) return Promise.resolve(photoCache[p.img]);
    const base = p.img.replace(/\.(jpg|jpeg|webp|png)$/i, "");
    const exts = (p.img.match(/\.(jpg|jpeg|webp|png)$/i) || [".jpg"]);
    const cover = "./assets/img/" + p.img;
    const tries = [];
    for (let i = 2; i <= 14; i++) tries.push("./assets/img/" + base + "-" + i + exts[0]);
    return Promise.all(tries.map(src => new Promise(res => {
      const im = new Image();
      const to = setTimeout(() => res(null), 5000);
      im.onload = () => { clearTimeout(to); res(src); };
      im.onerror = () => { clearTimeout(to); res(null); };
      im.src = src;
    }))).then(found => {
      const list = [cover, ...found.filter(Boolean)];
      photoCache[p.img] = list; return list;
    });
  }

  let lbList = [], lbIdx = 0;
  function bindWork() {
    $$("#workGrid .work").forEach(w => {
      const open = () => openLight(+w.dataset.idx);
      w.addEventListener("click", open);
      w.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
    $("#lbPrev").addEventListener("click", () => showLb((lbIdx - 1 + lbList.length) % lbList.length));
    $("#lbNext").addEventListener("click", () => showLb((lbIdx + 1) % lbList.length));
    document.addEventListener("keydown", lbKeys);
  }
  function openLight(i) {
    const p = PROJECTS[i]; if (!p) return;
    openModal("#lightbox");
    $("#lbTitle").textContent = p.title + " — " + p.place;
    $("#lbImg").src = "./assets/img/" + p.img;
    $("#lbCount").textContent = "loading photos…";
    $("#lbThumbs").innerHTML = "";
    probePhotos(p).then(list => {
      lbList = list; showLb(0);
      $("#lbThumbs").innerHTML = list.map((s, k) =>
        `<img src="${s}" alt="Photo ${k + 1}" data-k="${k}" class="${k === 0 ? "on" : ""}" onerror="this.remove()">`).join("");
      $$("#lbThumbs img").forEach(t => t.addEventListener("click", () => showLb(+t.dataset.k)));
    });
  }
  function showLb(k) {
    lbIdx = k; const img = $("#lbImg");
    img.style.opacity = 0;
    img.onload = () => { img.style.opacity = 1; };
    img.onerror = () => { img.style.opacity = 1; };
    img.src = lbList[k];
    $("#lbCount").textContent = lbList.length > 1 ? ("Photo " + (k + 1) + " of " + lbList.length) : p1single();
    $$("#lbThumbs img").forEach((t, j) => t.classList.toggle("on", j === k));
    function p1single() { return "1 photo — add more as " + "project-N-2.jpg"; }
  }
  function lbKeys(e) {
    if ($("#lightbox").hidden) return;
    if (e.key === "Escape") closeModals();
    if (e.key === "ArrowRight") $("#lbNext").click();
    if (e.key === "ArrowLeft") $("#lbPrev").click();
  }

  // ---- team modal: left photo, right details ----
  function bindTeam() {
    $$("#teamGrid .team-card").forEach(c => {
      const open = () => openTeam(+c.dataset.idx);
      c.addEventListener("click", open);
      c.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }
  function openTeam(i) {
    const t = (C.team || [])[i]; if (!t) return;
    openModal("#teamModal");
    $("#tmRole").textContent = t.role;
    $("#tmName").textContent = t.name;
    $("#tmBio").textContent = t.bio;
    $("#tmPoints").innerHTML = (t.points || []).map(x => "<li>" + x + "</li>").join("");
    $("#tmImg").innerHTML = "<b>" + initials(t.name) + "</b><img src='./assets/img/" + t.img + "' alt='" + t.name + "' onerror='this.remove()'>";
  }

  // ---- shared modal open/close ----
  function openModal(sel) { $(sel).hidden = false; document.body.style.overflow = "hidden"; }
  window.closeModals = closeModals;
  function closeModals() {
    $("#lightbox").hidden = true; $("#teamModal").hidden = true;
    if (!navLinks.classList.contains("open")) document.body.style.overflow = "";
  }
  $$("[data-close]").forEach(b => b.addEventListener("click", closeModals));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModals(); });

  // ---- before / after drag slider ----
  function bindBA() {
    const box = $("#baSlider"); if (!box) return;
    const before = $("#baBefore"), handle = $("#baHandle"), img = before.querySelector("img");
    const size = () => {
      const w = box.clientWidth, h = box.clientHeight;
      img.style.width = w + "px"; img.style.height = h + "px";
      setPct(parseFloat(box.dataset.pct || "50"));
    };
    const setPct = p => {
      p = Math.max(2, Math.min(98, p));
      box.dataset.pct = p;
      before.style.width = p + "%"; handle.style.left = p + "%";
    };
    let drag = false;
    const move = clientX => {
      const r = box.getBoundingClientRect();
      setPct((clientX - r.left) / r.width * 100);
    };
    box.addEventListener("pointerdown", e => { drag = true; box.setPointerCapture(e.pointerId); move(e.clientX); handle.style.animation = "none"; });
    box.addEventListener("pointermove", e => drag && move(e.clientX));
    ["pointerup", "pointercancel", "pointerleave"].forEach(ev => box.addEventListener(ev, () => drag = false));
    addEventListener("resize", size); size();
  }

  // ---- contact form → backend, WhatsApp fallback ----
  async function post(path, body) {
    const r = await fetch((S.API_BASE || "") + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error("bad status " + r.status);
    return r.json();
  }
  $("#contactForm") && $("#contactForm").addEventListener("submit", async e => {
    e.preventDefault();
    const fd = new FormData(e.target), body = Object.fromEntries(fd.entries());
    const note = $("#contactNote");
    try {
      const r = await post("/api/contact", body);
      note.textContent = "Thank you! We got your message. Ref " + r.id; note.className = "form-note ok"; e.target.reset();
    } catch {
      note.textContent = "Net problem — opening WhatsApp instead…"; note.className = "form-note err";
      open("https://wa.me/" + S.whatsapp + "?text=" + encodeURIComponent("Namaste, " + body.name + " (" + body.phone + ") — " + (body.message || "temple work")));
    }
  });
})();
