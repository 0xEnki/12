/* =====================================================================
   Supabase configuration — fill in these two values (Project Settings → API)
   The anon key is public by design; your data is protected by the
   Row Level Security policies in supabase-setup.sql, not by hiding it.
   ===================================================================== */
const SUPABASE_URL = "https://wwtnxvushnawzqxbrozk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_OusFS6Iy9z3sqktnzIecBA_N4aeGlCs";
const SUPABASE_BUCKET = "lumine-media"; // public Storage bucket
// ESM builds of @supabase/supabase-js (pinned). The second URL is only a fallback.
const SUPABASE_JS_URLS = [
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm",
  "https://esm.sh/@supabase/supabase-js@2.45.4"
];

(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Loader
  window.addEventListener("load", () => setTimeout(() => $("#loader")?.classList.add("is-done"), 900));

  // Seamless marquee: duplicate content once
  const marqueeTrack = $("#marquee");
  if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); } });
  }, { threshold: .15 });
  $$(".reveal").forEach((el) => io.observe(el));

  // Active nav link
  const links = $$(".site-nav a");
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      links.forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === `#${e.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));
})();

/* ================= v2 — Pro layer ================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  // Stagger index for hero letters
  $$(".hero__name span").forEach((el, i) => el.style.setProperty("--i", i));

  // Scroll progress + hero parallax (single rAF-throttled handler)
  const hero = $(".hero__portrait");
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const max = root.scrollHeight - innerHeight;
      root.style.setProperty("--p", max > 0 ? (scrollY / max).toFixed(4) : 0);
      if (!reduce && hero && scrollY < innerHeight) hero.style.setProperty("--py", `${scrollY * 0.12}px`);
      ticking = false;
    });
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Mobile menu
  const btn = $("#menuBtn");
  const setMenu = (open) => {
    document.body.classList.toggle("menu-open", open);
    btn?.setAttribute("aria-expanded", String(open));
  };
  btn?.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  // Custom cursor
  if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduce) {
    const c = document.createElement("div");
    c.className = "cursor";
    document.body.append(c);
    let x = 0, y = 0, tx = 0, ty = 0;
    addEventListener("pointermove", (e) => { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      c.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      requestAnimationFrame(loop);
    })();
    document.addEventListener("pointerover", (e) => c.classList.toggle("is-hover", !!e.target.closest("a, button, .rows li")));
  }

})();

/* ================= v3 — Motion ================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  const obs = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); }
  }), { threshold: .2 });

  // Word-mask headlines
  const splitWords = (el) => {
    let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const f = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((w) => {
          if (!w) return;
          if (!w.trim()) return f.append(" ");
          const o = document.createElement("span"), s = document.createElement("span");
          o.className = "w"; s.className = "w__i"; s.textContent = w; s.style.setProperty("--wi", i++);
          o.append(s); f.append(o);
        });
        n.replaceWith(f);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(el);
    el.classList.add("is-split");
  };
  $$(".section__title, .profile h2, .contact h2, .quote blockquote").forEach((el) => { splitWords(el); obs.observe(el); });

  // Giant footer letters
  const giant = $(".giant");
  if (giant) {
    giant.innerHTML = [...giant.textContent].map((l, i) => `<span style="--i:${i}">${l}</span>`).join("");
    obs.observe(giant);
  }

  // Stagger groups
  const stagger = (sel) => $$(sel).forEach((el, i) => {
    el.style.setProperty("--d", i);
    if (!el.classList.contains("reveal")) { el.classList.add("reveal"); obs.observe(el); }
  });
  ["#profil .facts div", ".rows li", ".socials a", ".gallery__track figure"].forEach(stagger);
  $$(".gallery__track figure").forEach((f) => f.style.setProperty("--d", 0));
  $$(".gallery__track .ph").forEach((p, i) => p.style.setProperty("--d", 0));

  // Marquee speeds up with scroll velocity
  const anim = $("#marquee")?.getAnimations()[0];
  if (anim && !reduce) {
    let last = scrollY, rate = 1;
    (function tick() {
      const v = Math.abs(scrollY - last); last = scrollY;
      rate += ((1 + Math.min(v * .5, 10)) - rate) * .1;
      anim.playbackRate = rate;
      requestAnimationFrame(tick);
    })();
  }

  // Page curtain transition for in-page links
  const curtain = $("#curtain");
  if (!reduce) {
    document.addEventListener("click", async (e) => {
      const a = e.target.closest('a[href^="#"]');
      const id = a?.getAttribute("href");
      if (!a || !id || id.length < 2) return;
      let target = null;
      try { target = $(id); } catch { /* invalid selector */ }
      if (!target) return;
      e.preventDefault();
      const opts = { duration: 550, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" };
      await curtain.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], opts).finished;
      target.scrollIntoView({ behavior: "instant" });
      history.replaceState(null, "", id);
      await curtain.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], opts).finished;
      curtain.getAnimations().forEach((x) => x.cancel());
    });
  }

  // 3D tilt + magnetic hover (fine pointers)
  if (fine && !reduce) {
    const photo = $(".profile__photo"); // may be commented out in the HTML
    if (photo) {
      photo.addEventListener("pointermove", (e) => {
        const r = photo.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        photo.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
      });
      photo.addEventListener("pointerleave", () => (photo.style.transform = ""));
    }
    $$(".socials a, .logo").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  // Gallery: ONE 3D carousel (buttons, drag/swipe, keyboard) — no scrollLeft logic
  const track = $(".gallery__track");
  if (track) {
    const cards = $$("figure", track);
    const ui = $(".gallery__ui");
    const prev = $("#galPrev"), next = $("#galNext");
    const F = document.documentElement.dir === "rtl" ? -1 : 1; // mirrors the carousel in RTL
    let cur = Math.floor(cards.length / 2);
    let sx = 0, down = false, moved = false;

    const render = () => {
      cards.forEach((c, i) => {
        const d = i - cur, a = Math.abs(d), sign = Math.sign(d);
        c.style.setProperty("--x", `${F * sign * (a ? 150 + (a - 1) * 55 : 0)}px`);
        c.style.setProperty("--z", `${-a * 60}px`);
        c.style.setProperty("--ry", `${-F * sign * Math.min(a, 1) * 8}deg`);
        c.style.setProperty("--s", `${1 - Math.min(a, 4) * .08}`);
        c.style.setProperty("--o", a > 4 ? 0 : 1 - a * .12);
        c.style.setProperty("--b", 1 - Math.min(a, 4) * .15);
        c.style.setProperty("--zi", 100 - a);
        c.classList.toggle("is-active", a === 0);
      });
      if (prev) prev.disabled = cur === 0;
      if (next) next.disabled = cur === cards.length - 1;
      if (ui) ui.style.setProperty("--g", cards.length > 1 ? Math.max(.12, (cur + 1) / cards.length) : 1);
    };
    const go = (i) => { cur = Math.max(0, Math.min(cards.length - 1, i)); render(); };

    prev?.addEventListener("click", () => go(cur - 1));
    next?.addEventListener("click", () => go(cur + 1));
    cards.forEach((c, i) => c.addEventListener("click", () => { if (!moved) go(i); }));

    track.addEventListener("pointerdown", (e) => { down = true; moved = false; sx = e.clientX; });
    addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - sx;
      if (Math.abs(dx) > 50) { go(cur + (dx * F < 0 ? 1 : -1)); sx = e.clientX; moved = true; track.classList.add("is-drag"); }
    });
    const end = () => { down = false; track.classList.remove("is-drag"); setTimeout(() => { moved = false; }, 0); };
    addEventListener("pointerup", end);
    addEventListener("pointercancel", end);

    // Arrow keys: only while the gallery is on screen, no overlay is open and nobody is typing
    addEventListener("keydown", (e) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (document.body.classList.contains("session-open") || document.querySelector("dialog[open]")) return;
      const t = e.target;
      if (t instanceof HTMLElement && t.closest("input, textarea, select, video, [contenteditable]")) return;
      const r = track.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      go(cur + (e.key === "ArrowLeft" ? -F : F));
    });

    render();
  }
})();

/* ================= v4 — Sessions overlay, detail view, admin mode (Supabase) ================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config ---------- */
  const BUCKET = SUPABASE_BUCKET;
  const MAX_SIDE = 900; // card images are downscaled before upload
  const GALLERY_SIDE = 1600; // strip photos are downscaled before upload
  const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // Supabase free plan limit per file; raise on a paid plan
  const MAX_DETAILS = 5000;
  const CONFIGURED = /^https?:\/\//.test(SUPABASE_URL) && SUPABASE_ANON_KEY.length > 20 &&
    !/YOUR/i.test(SUPABASE_URL + SUPABASE_ANON_KEY);
  const STORAGE_MARK = `/storage/v1/object/public/${BUCKET}/`;

  /* ---------- Supabase client (loaded as an ES module via dynamic import) ---------- */
  let sbProblem = CONFIGURED ? null : "config"; // "config" | "cdn" | null
  const sbReady = (async () => {
    if (!CONFIGURED) return null;
    for (const url of SUPABASE_JS_URLS) {
      try {
        const mod = await import(url);
        return mod.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
        });
      } catch { /* try the next CDN */ }
    }
    sbProblem = "cdn";
    return null;
  })();
  const needClient = async () => {
    const sb = await sbReady;
    if (!sb) throw new Error("Supabase unavailable");
    return sb;
  };
  const unavailableText = () => sbProblem === "cdn"
    ? "تعذّر تحميل مكتبة Supabase. تحقق من اتصال الإنترنت."
    : "لم يتم إعداد Supabase بعد. أضف SUPABASE_URL و SUPABASE_ANON_KEY في أعلى ملف main.js.";

  // Turns any Supabase / network error into a clear Arabic sentence
  const explain = (e, fallback) => {
    const m = String((e && (e.message || e.error_description)) || e || "").toLowerCase();
    const code = String((e && (e.code || e.statusCode || e.status)) || "");
    if (/supabase unavailable/.test(m)) return unavailableText();
    if (/failed to fetch|networkerror|load failed|network request failed/.test(m)) return "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً.";
    if (/jwt expired/.test(m)) return "انتهت الجلسة. سجّل الدخول مجدداً.";
    if (/row-level security|violates row|not authorized|permission denied|unauthorized/.test(m) || code === "PGRST116" || code === "401" || code === "403")
      return "ليست لديك صلاحية لتنفيذ هذا الإجراء. سجّل الدخول كمشرف.";
    if (/maximum allowed size|payload too large|too large/.test(m) || code === "413") return "حجم الملف أكبر من الحد المسموح به في Supabase.";
    if (/bucket not found/.test(m)) return "حاوية التخزين lumine-media غير موجودة. أنشئها أولاً.";
    if (/could not find the table|does not exist|schema cache/.test(m)) return "جداول قاعدة البيانات غير موجودة بعد. شغّل ملف supabase-setup.sql.";
    return fallback;
  };

  /* ---------- Elements (bail out quietly if the markup is missing) ---------- */
  const overlay = $("#session"), grid = $("#sessionGrid"), tools = $("#sessionTools");
  const formSlot = $("#sessionForm"), empty = $("#sessionEmpty"), back = $("#sessionBack");
  const main = $("#main"), header = $(".site-header"), curtain = $("#curtain");
  const adminBtn = $("#adminToggle"), dlg = $("#loginDlg"), loginForm = $("#loginForm");
  const emailIn = $("#loginEmail"), pw = $("#loginPw"), loginMsg = $("#loginMsg");
  const goBtn = $(".login__go", loginForm || document);
  const dOv = $("#itemDetail"), dBack = $("#detailBack"), dBadge = $("#detailBadge");
  const dVideo = $("#detailVideo"), dTag = $("#detailTag"), dTitle = $("#detailTitle");
  const dNote = $("#detailNote"), dNotes = $("#detailNotes"), dTools = $("#detailTools");
  const dGalTools = $("#detailGalleryTools"), dStrip = $("#detailPhotoStrip");
  const rows = $(".rows");
  if (![overlay, grid, tools, formSlot, empty, back, main, header, adminBtn, dlg, loginForm, emailIn, pw, loginMsg, goBtn,
    dOv, dBack, dBadge, dVideo, dTag, dTitle, dNote, dNotes, dTools, dGalTools, dStrip, rows].every(Boolean)) return;

  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text; // never innerHTML for stored data
    return n;
  };
  const tagLang = (el, t) => { if (/[\u0600-\u06FF]/.test(t)) el.lang = "ar"; el.dir = "auto"; return el; };
  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  const imgExt = (type) => (type === "image/webp" ? "webp" : type === "image/png" ? "png" : "jpg");
  const videoExt = (file) => {
    const byType = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm", "video/x-m4v": "m4v" }[file.type];
    if (byType) return byType;
    const m = /\.([a-z0-9]{1,5})$/i.exec(file.name || "");
    return m ? m[1].toLowerCase() : "mp4";
  };

  let current = null; // { id, trigger, tag, title, sub }
  let detail = null; // { sid, id, tag, trigger }
  let busy = false; // curtain transitions
  let admin = false; // true only while Supabase reports an authenticated session
  let flashEl = null; // status line inside the session toolbar (admin only)
  let photos = []; // photo rows of the item currently open in the detail view
  let renderedSig = null;
  try { localStorage.removeItem("isSiteAdmin"); } catch { /* old client-side flag, no longer used */ }

  // One lock per operation: prevents double submissions / double clicks
  const locks = new Set();
  const take = (k) => (locks.has(k) ? false : (locks.add(k), true));
  const free = (k) => locks.delete(k);

  /* ---------- Data layer: items per session ---------- */
  const sessions = {}; // sid → { status: idle|loading|ready|error|unavailable, items, token, error }
  const stateOf = (sid) => sessions[sid] || (sessions[sid] = { status: "idle", items: [], token: 0, error: null });
  const itemsFor = (sid) => stateOf(sid).items;
  const findItem = (sid, id) => itemsFor(sid).find((i) => i.id === id) || null;
  const sig = (s) => s.status + "§" + s.items.map((i) => [i.id, i.title, i.note, i.image_url].join("|")).join("§");
  const replaceItem = (sid, row) => {
    const s = stateOf(sid);
    s.token++; // a load that started earlier must not overwrite this newer local state
    s.items = s.items.map((x) => (x.id === row.id ? row : x));
  };

  const loadSession = async (sid) => {
    const s = stateOf(sid);
    const token = ++s.token;
    if (s.status !== "ready") s.status = "loading"; // keep showing old items while refreshing
    let status = "ready", items = s.items, error = null;
    try {
      const sb = await sbReady;
      if (!sb) status = "unavailable";
      else {
        const { data, error: err } = await sb.from("session_items").select("*")
          .eq("session_id", sid).order("created_at", { ascending: true });
        if (err) throw err;
        items = Array.isArray(data) ? data : [];
      }
    } catch (e) {
      if (s.status === "ready") status = "ready"; // refresh failed, keep what we already have
      else { status = "error"; error = e; }
    }
    if (token !== s.token) return; // superseded by a newer load or a local change
    s.status = status;
    s.error = error;
    if (status === "ready") s.items = items;
  };

  const needsRender = () => !!current && !overlay.hidden && sig(stateOf(current.id)) !== renderedSig;
  const refreshSession = async (sid) => {
    const p = loadSession(sid); // flips status to "loading" synchronously when nothing is cached yet
    if (current && current.id === sid && needsRender()) render();
    await p;
    if (current && current.id === sid && needsRender()) render();
  };

  /* ---------- Storage helpers ---------- */
  const uploadFile = async (sb, path, file, contentType) => {
    const { error } = await sb.storage.from(BUCKET).upload(path, file, { contentType, cacheControl: "31536000", upsert: false });
    if (error) throw error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  };
  const pathFromUrl = (url) => {
    if (typeof url !== "string") return null;
    const i = url.indexOf(STORAGE_MARK);
    if (i < 0) return null;
    try { return decodeURIComponent(url.slice(i + STORAGE_MARK.length).split("?")[0]); } catch { return null; }
  };
  // Best-effort cleanup. Returns true only if every requested file was really removed.
  const removeFiles = async (urls) => {
    const paths = urls.map(pathFromUrl).filter(Boolean);
    if (!paths.length) return true;
    try {
      const sb = await needClient();
      const { data, error } = await sb.storage.from(BUCKET).remove(paths);
      return !error && Array.isArray(data) && data.length >= paths.length;
    } catch { return false; }
  };

  const flash = (t) => { if (flashEl && flashEl.isConnected) flashEl.textContent = t; };

  /* ---------- Session cards ---------- */
  const card = (it, i) => {
    const fig = h("figure", "scard");
    fig.style.setProperty("--i", i);
    fig.dataset.id = it.id;
    const float = h("div", "scard__float");
    const frame = h("div", "scard__frame");
    frame.tabIndex = 0;
    frame.setAttribute("role", "button");
    frame.setAttribute("aria-haspopup", "dialog");
    frame.setAttribute("aria-label", `عرض تفاصيل ${it.title || `الصورة ${i + 1}`}`);

    const img = new Image();
    img.alt = it.title || `صورة ${i + 1}`;
    img.decoding = "async";
    img.draggable = false;
    img.addEventListener("error", () => frame.classList.add("is-broken"));
    if (it.image_url) img.src = it.image_url;
    else frame.classList.add("is-broken");
    frame.append(img);

    const open = () => openItemDetail(it, frame);
    fig.addEventListener("click", (e) => { if (!e.target.closest(".scard__del")) open(); });
    frame.addEventListener("keydown", (e) => {
      if (e.target !== frame) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    float.append(frame);

    if (admin) {
      const del = h("button", "scard__del", "×");
      del.type = "button";
      del.setAttribute("aria-label", `حذف ${it.title || "العنصر"}`);
      del.addEventListener("click", (e) => { e.stopPropagation(); removeItem(it, del); });
      float.append(del); // sibling of the frame: never nested inside the clickable area
    }

    const cap = h("figcaption", "scard__cap");
    cap.append(h("span", "scard__no", `رقم ${String(i + 1).padStart(2, "0")}`));
    if (it.title) cap.append(tagLang(h("strong", "scard__title", it.title), it.title));
    if (it.note) cap.append(tagLang(h("span", "scard__note", it.note), it.note));

    fig.append(float, cap);
    return fig;
  };

  const renderTools = () => {
    tools.replaceChildren();
    formSlot.replaceChildren();
    flashEl = null;
    if (!admin) return; // the button is not even created for visitors
    const add = h("button", "session__add", "+ إضافة عنصر");
    add.type = "button";
    add.setAttribute("aria-expanded", "false");
    add.disabled = !current || stateOf(current.id).status !== "ready"; // only once the list has loaded
    add.addEventListener("click", () => toggleForm(add));
    flashEl = h("p", "aform__msg");
    flashEl.setAttribute("role", "status");
    tools.append(h("span", "session__badge", "وضع المشرف"), add, flashEl);
  };

  // Loading / error / empty message under the session header
  const setStatus = (s) => {
    empty.replaceChildren();
    let text = "", retry = false;
    if (s.status === "idle" || s.status === "loading") text = "جارٍ تحميل المحتوى…";
    else if (s.status === "unavailable") text = unavailableText();
    else if (s.status === "error") { text = explain(s.error, "تعذّر تحميل المحتوى. حاول مجدداً."); retry = true; }
    else if (!s.items.length) text = "لا توجد صور في هذه الجلسة بعد.";
    empty.hidden = !text;
    if (!text) return;
    empty.append(document.createTextNode(text));
    if (retry) {
      const b = h("button", "detail__ghost", "إعادة المحاولة");
      b.type = "button";
      b.addEventListener("click", () => {
        if (!current) return;
        const sid = current.id, st = stateOf(sid);
        st.status = "loading";
        render();
        refreshSession(sid);
      });
      empty.append(b);
    }
  };

  const render = () => {
    if (!current) return;
    $("#sessionTag").textContent = current.tag;
    $("#sessionTitle").textContent = current.title;
    $("#sessionSub").textContent = current.sub;
    // session-specific shape hook (models → circles, locations → squares)
    overlay.dataset.session = current.id;
    grid.dataset.session = current.id;
    const s = stateOf(current.id);
    renderedSig = sig(s);
    const items = s.status === "ready" ? s.items : [];
    grid.replaceChildren(...items.map(card));
    setStatus(s);
    renderTools();
  };

  /* ---------- Admin: add item ---------- */
  const compress = async (file, maxSide = MAX_SIDE) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#1F1F1F";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      const toBlob = (type) => new Promise((res) => c.toBlob(res, type, .82));
      let blob = await toBlob("image/webp");
      if (!blob || blob.type !== "image/webp") blob = await toBlob("image/jpeg"); // Safari
      if (!blob) throw new Error("encode failed");
      return blob;
    } finally { URL.revokeObjectURL(url); }
  };

  const buildForm = (toggleBtn) => {
    const f = h("form", "aform");
    f.noValidate = true;
    f.innerHTML = `
      <label><span>الصورة</span><input type="file" name="file" accept="image/*" required></label>
      <label><span>العنوان</span><input type="text" name="title" maxlength="60" placeholder="مثال: جلسة الساعة الذهبية"></label>
      <label><span>ملاحظة</span><input type="text" name="note" maxlength="120"></label>
      <div class="aform__row">
        <button type="submit" class="aform__save">حفظ العنصر</button>
        <button type="button" class="aform__cancel">إلغاء</button>
      </div>
      <p class="aform__msg" role="status"></p>`; // static markup only — no user data goes through innerHTML
    const msg = $(".aform__msg", f), save = $(".aform__save", f);

    $(".aform__cancel", f).addEventListener("click", () => toggleForm(toggleBtn));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!admin || !current) return;
      const file = f.elements.file.files[0];
      if (!file || !file.type.startsWith("image/")) { msg.textContent = "اختر ملف صورة من فضلك."; return; }
      const sid = current.id;
      const key = `add:${sid}`;
      if (!take(key)) return; // already saving
      save.disabled = true;
      let uploadedUrl = null;
      try {
        const sb = await needClient();
        msg.textContent = "جارٍ تجهيز الصورة…";
        const blob = await compress(file);
        msg.textContent = "جارٍ رفع الصورة…";
        uploadedUrl = await uploadFile(sb, `items/${uid()}.${imgExt(blob.type)}`, blob, blob.type);
        msg.textContent = "جارٍ حفظ البيانات…";
        const { data, error } = await sb.from("session_items").insert({
          session_id: sid,
          title: f.elements.title.value.trim() || file.name.replace(/\.[^.]+$/, ""),
          note: f.elements.note.value.trim(),
          image_url: uploadedUrl
        }).select().single();
        if (error) throw error;
        const s = stateOf(sid);
        s.token++;
        s.items = [...s.items, data];
        uploadedUrl = null; // saved: nothing to roll back
        if (current && current.id === sid) render(); // also closes the form
      } catch (err) {
        if (uploadedUrl) removeFiles([uploadedUrl]); // roll back the orphaned upload
        msg.textContent = explain(err, "تعذّر حفظ العنصر. جرّب صورة JPG أو PNG أو WebP.");
        save.disabled = false;
      } finally { free(key); }
    });
    return f;
  };

  const toggleForm = (btn) => {
    if (formSlot.firstElementChild) {
      formSlot.replaceChildren();
      btn.setAttribute("aria-expanded", "false");
      return;
    }
    formSlot.append(buildForm(btn));
    btn.setAttribute("aria-expanded", "true");
    $("input", formSlot)?.focus();
  };

  const removeItem = async (it, btn) => {
    if (!admin || !current) return;
    const key = `del:${it.id}`;
    if (locks.has(key) || !confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
    take(key);
    const sid = current.id;
    btn.disabled = true;
    flash("جارٍ حذف العنصر…");
    try {
      const sb = await needClient();
      const ph = await sb.from("session_item_photos").select("image_url").eq("item_id", it.id);
      if (ph.error) throw ph.error;
      const urls = [it.image_url, it.video_url, ...(ph.data || []).map((p) => p.image_url)];
      const del = await sb.from("session_items").delete().eq("id", it.id).select("id"); // photo rows cascade
      if (del.error) throw del.error;
      if (!del.data || !del.data.length) throw new Error("row-level security: nothing was deleted");
      const s = stateOf(sid);
      s.token++;
      s.items = s.items.filter((x) => x.id !== it.id);
      if (current && current.id === sid) render();
      flash("جارٍ حذف الملفات المرتبطة…");
      const cleaned = await removeFiles(urls);
      flash(cleaned ? "تم حذف العنصر." : "تم حذف العنصر، لكن تعذّر حذف بعض ملفاته من التخزين.");
    } catch (err) {
      flash(explain(err, "تعذّر حذف العنصر. حاول مجدداً."));
      btn.disabled = false;
    } finally { free(key); }
  };

  /* ---------- Curtain transition (shared with in-page links) ---------- */
  const curtainSwap = async (mid) => {
    if (reduce || !curtain) return mid();
    const o = { duration: 550, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" };
    await curtain.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], o).finished;
    mid();
    await curtain.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], o).finished;
    curtain.getAnimations().forEach((a) => a.cancel());
  };

  /* ---------- Detail overlay (everyone can view; admin can edit) ---------- */
  let detailGen = 0;
  const canEdit = (it) => admin && !!it;

  const buildNotesEditor = (it) => {
    const f = h("form", "detail__editor");
    f.noValidate = true;
    const label = h("label");
    label.append(h("span", null, "الملاحظات التفصيلية"));
    const ta = h("textarea");
    ta.name = "details";
    ta.rows = 9;
    ta.maxLength = MAX_DETAILS;
    ta.value = it.details || "";
    ta.placeholder = "اكتب التفاصيل والملاحظات الخاصة بهذا العنصر…";
    ta.dir = "auto";
    label.append(ta);
    const row = h("div", "aform__row");
    const save = h("button", "aform__save", "حفظ الملاحظات");
    save.type = "submit";
    const cancel = h("button", "aform__cancel", "إلغاء");
    cancel.type = "button";
    row.append(save, cancel);
    const msg = h("p", "aform__msg");
    msg.setAttribute("role", "status");
    f.append(label, row, msg);

    cancel.addEventListener("click", () => renderDetail(true));
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { e.stopPropagation(); renderDetail(true); } // cancel the editor, keep the overlay
    });
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!detail || !canEdit(findItem(detail.sid, detail.id))) return;
      const { sid, id } = detail;
      const key = `notes:${id}`;
      if (!take(key)) return;
      save.disabled = true;
      cancel.disabled = true;
      msg.textContent = "جارٍ حفظ الملاحظات…";
      try {
        const sb = await needClient();
        const { data, error } = await sb.from("session_items").update({ details: ta.value.trim() }).eq("id", id).select().single();
        if (error) throw error;
        replaceItem(sid, data);
        if (detail && detail.id === id) renderDetail(true);
      } catch (err) {
        msg.textContent = explain(err, "تعذّر حفظ الملاحظات. حاول مجدداً.");
        save.disabled = false;
        cancel.disabled = false;
      } finally { free(key); }
    });
    return f;
  };

  const renderVideoPanel = (it) => {
    dVideo.replaceChildren();
    if (it.video_url) {
      const v = h("video", "detail__player");
      v.controls = true;
      v.playsInline = true;
      v.loop = true;
      v.preload = "metadata";
      v.setAttribute("aria-label", it.title || "فيديو");
      v.addEventListener("error", () => v.replaceWith(h("p", "detail__vempty", "تعذّر تشغيل هذا الفيديو.")));
      v.src = it.video_url;
      dVideo.append(v);
    } else {
      const ph = h("div", "detail__vempty");
      const glyph = h("span", "detail__glyph cune", "𒀭");
      glyph.lang = "sux";
      glyph.setAttribute("aria-hidden", "true");
      ph.append(glyph, h("p", null, "لا يوجد فيديو لهذا العنصر بعد."));
      dVideo.append(ph);
    }

    if (!canEdit(it)) return;
    const bar = h("div", "detail__vtools");
    const input = h("input");
    input.type = "file";
    input.accept = "video/*";
    input.hidden = true;
    const add = h("button", "session__add", it.video_url ? "استبدال الفيديو الطولي" : "إضافة فيديو طولي");
    add.type = "button";
    add.addEventListener("click", () => input.click());
    bar.append(input, add);
    let del = null;
    if (it.video_url) {
      del = h("button", "detail__ghost", "حذف الفيديو");
      del.type = "button";
      bar.append(del);
    }
    const msg = h("p", "aform__msg");
    msg.setAttribute("role", "status");
    bar.append(msg);
    const setBusy = (on) => { add.disabled = on; if (del) del.disabled = on; };

    if (del) del.addEventListener("click", async () => {
      if (!detail || locks.has(`video:${it.id}`) || !confirm("هل تريد حذف الفيديو؟")) return;
      const { sid, id } = detail;
      const key = `video:${id}`;
      take(key);
      setBusy(true);
      msg.textContent = "جارٍ حذف الفيديو…";
      try {
        const sb = await needClient();
        const { data, error } = await sb.from("session_items").update({ video_url: null }).eq("id", id).select().single();
        if (error) throw error;
        replaceItem(sid, data);
        removeFiles([it.video_url]); // best effort; the row no longer points at it
        if (detail && detail.id === id) renderDetail();
      } catch (err) {
        msg.textContent = explain(err, "تعذّر حذف الفيديو. حاول مجدداً.");
        setBusy(false);
      } finally { free(key); }
    });

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.value = "";
      if (!file || !detail) return;
      if (!file.type.startsWith("video/")) { msg.textContent = "اختر ملف فيديو من فضلك."; return; }
      if (file.size > MAX_VIDEO_BYTES) {
        msg.textContent = `حجم الفيديو كبير جداً (الحد الأقصى ${Math.round(MAX_VIDEO_BYTES / 1048576)} ميغابايت).`;
        return;
      }
      const { sid, id } = detail;
      const key = `video:${id}`;
      if (!take(key)) return;
      setBusy(true);
      msg.textContent = "جارٍ رفع الفيديو… قد يستغرق ذلك بعض الوقت، لا تغلق الصفحة.";
      let newUrl = null;
      try {
        const sb = await needClient();
        newUrl = await uploadFile(sb, `videos/${id}/${uid()}.${videoExt(file)}`, file, file.type || "video/mp4");
        msg.textContent = "جارٍ حفظ البيانات…";
        const old = (findItem(sid, id) || it).video_url;
        const { data, error } = await sb.from("session_items").update({ video_url: newUrl }).eq("id", id).select().single();
        if (error) throw error;
        replaceItem(sid, data);
        const saved = newUrl;
        newUrl = null; // saved: nothing to roll back
        if (old && old !== saved) removeFiles([old]); // replaced video is deleted from storage
        if (detail && detail.id === id) renderDetail();
      } catch (err) {
        if (newUrl) removeFiles([newUrl]);
        msg.textContent = explain(err, "تعذّر رفع الفيديو. حاول مجدداً.");
        setBusy(false);
      } finally { free(key); }
    });
    dVideo.append(bar);
  };

  /* ---------- Detail: horizontal photo strip (session_item_photos) ---------- */
  const fetchPhotos = async (itemId) => {
    const sb = await needClient();
    const { data, error } = await sb.from("session_item_photos").select("*")
      .eq("item_id", itemId).order("created_at", { ascending: true });
    if (error) throw error;
    return data || [];
  };

  const galleryMsg = (t) => { const m = $(".aform__msg", dGalTools); if (m) m.textContent = t; };

  const paintStrip = (it) => {
    if (!photos.length) {
      dStrip.replaceChildren(h("p", "detail__gempty", "لا توجد صور في هذا المعرض بعد."));
      return;
    }
    dStrip.replaceChildren(...photos.map((p, n) => {
      const box = h("figure", "detail__photo");
      box.dataset.id = p.id;
      const img = new Image();
      img.alt = `${it.title || "صورة"} — ${n + 1}`;
      img.decoding = "async";
      img.loading = "lazy";
      img.draggable = false;
      img.addEventListener("error", () => box.classList.add("is-broken"));
      img.src = p.image_url;
      box.append(img);
      if (canEdit(it)) {
        const del = h("button", "scard__del", "×");
        del.type = "button";
        del.setAttribute("aria-label", `حذف الصورة ${n + 1}`);
        del.addEventListener("click", async (e) => {
          e.stopPropagation();
          const key = `pdel:${p.id}`;
          if (locks.has(key) || !confirm("هل تريد حذف هذه الصورة؟")) return;
          take(key);
          del.disabled = true;
          galleryMsg("جارٍ حذف الصورة…");
          try {
            const sb = await needClient();
            const { data, error } = await sb.from("session_item_photos").delete().eq("id", p.id).select("id");
            if (error) throw error;
            if (!data || !data.length) throw new Error("row-level security: nothing was deleted");
            removeFiles([p.image_url]);
            if (detail && detail.id === it.id) { photos = photos.filter((x) => x.id !== p.id); paintStrip(it); }
            galleryMsg("تم حذف الصورة.");
          } catch (err) {
            galleryMsg(explain(err, "تعذّر حذف الصورة. حاول مجدداً."));
            del.disabled = false;
          } finally { free(key); }
        });
        box.append(del);
      }
      return box;
    }));
  };

  const renderGalleryTools = (it) => {
    dGalTools.replaceChildren();
    if (!canEdit(it)) return;
    const input = h("input");
    input.type = "file";
    input.accept = "image/*";
    input.multiple = true;
    input.hidden = true;
    const add = h("button", "session__add", "إضافة مجموعة صور");
    add.type = "button";
    add.addEventListener("click", () => input.click());
    const msg = h("p", "aform__msg");
    msg.setAttribute("role", "status");
    dGalTools.append(input, add, msg);

    input.addEventListener("change", async () => {
      const files = [...(input.files || [])].filter((f) => f.type.startsWith("image/"));
      input.value = "";
      if (!files.length || !detail || detail.id !== it.id) return;
      const key = `photos:${it.id}`;
      if (!take(key)) return;
      add.disabled = true;
      const total = files.length;
      const urls = new Array(total).fill(null);
      let done = 0, added = 0, lastErr = null;
      const progress = () => { msg.textContent = `جارٍ رفع الصور… ${done} / ${total}`; };
      progress();
      try {
        const sb = await needClient();
        const one = async (idx) => {
          try {
            const blob = await compress(files[idx], GALLERY_SIDE);
            urls[idx] = await uploadFile(sb, `gallery/${it.id}/${uid()}.${imgExt(blob.type)}`, blob, blob.type);
          } catch (err) { urls[idx] = null; lastErr = err; }
          done++;
          progress();
        };
        for (let i = 0; i < total; i += 3) { // 3 uploads at a time
          await Promise.all([0, 1, 2].map((k) => i + k).filter((x) => x < total).map(one));
        }
        const good = urls.filter(Boolean);
        if (good.length) {
          msg.textContent = "جارٍ حفظ البيانات…";
          // Explicit, increasing timestamps keep the selection order (a batch insert would share one now())
          const base = Date.now();
          const rowsToAdd = good.map((url, n) => ({ item_id: it.id, image_url: url, created_at: new Date(base + n).toISOString() }));
          const { error } = await sb.from("session_item_photos").insert(rowsToAdd);
          if (error) { removeFiles(good); lastErr = error; } else added = good.length;
        }
        if (added && detail && detail.id === it.id) {
          try { photos = await fetchPhotos(it.id); if (detail && detail.id === it.id) paintStrip(it); } catch { /* strip refreshes on next open */ }
        }
        const failed = total - added;
        msg.textContent = !failed ? `تمت إضافة ${added} صورة.`
          : added ? `تمت إضافة ${added} صورة، وتعذّر رفع ${failed}.`
            : explain(lastErr, "تعذّر رفع الصور. جرّب JPG أو PNG أو WebP.");
      } catch (err) {
        msg.textContent = explain(err, "تعذّر رفع الصور. حاول مجدداً.");
      } finally {
        add.disabled = false;
        free(key);
      }
    });
  };

  const loadGallery = async (it, gen) => {
    photos = [];
    renderGalleryTools(it);
    dStrip.replaceChildren(h("p", "detail__gempty", "جارٍ تحميل الصور…"));
    try {
      const list = await fetchPhotos(it.id);
      if (gen !== detailGen || !detail) return;
      photos = list;
      paintStrip(it);
    } catch (err) {
      if (gen !== detailGen || !detail) return;
      const p = h("p", "detail__gempty", explain(err, "تعذّر تحميل الصور."));
      const b = h("button", "detail__ghost", "إعادة المحاولة");
      b.type = "button";
      b.addEventListener("click", () => { if (detail && detail.id === it.id) loadGallery(it, detailGen); });
      p.append(b);
      dStrip.replaceChildren(p);
    }
  };

  const renderDetail = async (focusTools = false) => {
    if (!detail) return;
    const gen = ++detailGen;
    try {
      const it = findItem(detail.sid, detail.id);
      if (!it) { hideDetail(); return; }

      dBadge.hidden = !admin;
      dTag.textContent = detail.tag;
      dTitle.textContent = it.title || "بدون عنوان";
      tagLang(dTitle, dTitle.textContent);
      dNote.textContent = it.note || "";
      dNote.hidden = !it.note;
      if (it.note) tagLang(dNote, it.note);

      if (it.details) { dNotes.textContent = it.details; dNotes.classList.remove("is-empty"); tagLang(dNotes, it.details); }
      else { dNotes.textContent = "لا توجد ملاحظات تفصيلية لهذا العنصر بعد."; dNotes.classList.add("is-empty"); }

      dTools.replaceChildren();
      if (canEdit(it)) {
        const btn = h("button", "session__add", it.details ? "تعديل الملاحظات" : "إضافة ملاحظات");
        btn.type = "button";
        btn.addEventListener("click", () => {
          dTools.replaceChildren(buildNotesEditor(it));
          $("textarea", dTools)?.focus();
        });
        dTools.append(btn);
        if (focusTools) btn.focus({ preventScroll: true });
      }

      renderVideoPanel(it);
      loadGallery(it, gen);
    } catch { /* keep the overlay usable even if media fails */ }
  };

  const hideDetail = () => {
    const d = detail;
    detailGen++;
    detail = null;
    photos = [];
    dOv.hidden = true;
    dVideo.replaceChildren(); // also stops playback
    dTools.replaceChildren();
    dStrip.replaceChildren();
    dGalTools.replaceChildren();
    overlay.inert = false;
    if (d) {
      const f = [...grid.querySelectorAll("figure")].find((n) => n.dataset.id === d.id)?.querySelector(".scard__frame");
      (f || back).focus({ preventScroll: true });
    }
  };

  async function openItemDetail(it, trigger) {
    if (busy || detail || !current) return;
    busy = true;
    detail = { sid: current.id, id: it.id, tag: `${current.tag} — ${current.title}`, trigger: trigger || null };
    try {
      await curtainSwap(() => {
        dOv.hidden = false;
        dOv.scrollTop = 0;
        overlay.inert = true;
        renderDetail();
        dBack.focus({ preventScroll: true });
      });
    } finally { busy = false; }
  }

  const closeDetail = async () => {
    if (busy || !detail) return;
    busy = true;
    try { await curtainSwap(hideDetail); } finally { busy = false; }
  };
  dBack.addEventListener("click", closeDetail);

  /* ---------- Open / close a session ---------- */
  const openSession = async (btn) => {
    if (busy || current) return;
    busy = true;
    const li = btn.closest("li");
    current = {
      id: btn.dataset.session,
      trigger: btn,
      tag: $(".idx", li)?.textContent.trim() ?? "",
      title: btn.textContent.trim(),
      sub: $("p", li)?.textContent.trim() ?? ""
    };
    renderedSig = null;
    refreshSession(current.id); // fetch from Supabase while the curtain is closing
    try {
      await curtainSwap(() => {
        overlay.dataset.session = current.id;
        grid.dataset.session = current.id;
        overlay.hidden = false;
        render();
        overlay.scrollTop = 0;
        document.body.classList.add("session-open");
        main.inert = true;
        header.inert = true;
        back.focus({ preventScroll: true });
      });
    } finally { busy = false; }
  };

  const closeSession = async () => {
    if (busy || !current || detail) return;
    busy = true;
    const trigger = current.trigger;
    try {
      await curtainSwap(() => {
        overlay.hidden = true;
        document.body.classList.remove("session-open");
        main.inert = false;
        header.inert = false;
        grid.replaceChildren();
        formSlot.replaceChildren();
        flashEl = null;
        renderedSig = null;
        delete overlay.dataset.session;
        delete grid.dataset.session;
        current = null;
        trigger.focus({ preventScroll: true });
      });
    } finally { busy = false; }
  };

  rows.addEventListener("click", (e) => {
    const b = e.target.closest(".row__open");
    if (b) openSession(b);
  });
  back.addEventListener("click", closeSession);

  // One Escape handler: detail first, then session (the login dialog handles its own Escape)
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape" || dlg.open) return;
    if (detail) closeDetail();
    else if (current) closeSession();
  });

  /* ---------- Admin auth (Supabase email + password) ---------- */
  const syncAdminUI = () => {
    adminBtn.textContent = admin ? "خروج المشرف" : "دخول المشرف";
    adminBtn.dataset.on = String(admin);
    document.body.classList.toggle("is-admin", admin);
    if (current) render();
    if (detail) renderDetail();
  };

  const setAdmin = (on) => {
    if (admin === on) return; // token refreshes etc. must not redraw the page
    admin = on;
    syncAdminUI();
  };

  // Restore a persisted session and follow later sign-ins / sign-outs (also from other tabs)
  sbReady.then((sb) => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setAdmin(!!(data && data.session))).catch(() => { });
    sb.auth.onAuthStateChange((_event, session) => setAdmin(!!session));
  });

  adminBtn.addEventListener("click", async () => {
    if (admin) {
      if (!take("signout")) return;
      adminBtn.disabled = true;
      try {
        const sb = await needClient();
        const { error } = await sb.auth.signOut();
        if (error) await sb.auth.signOut({ scope: "local" }); // server unreachable: still end this browser's session
        setAdmin(false);
      } catch { /* stay signed in; the button comes back */ }
      finally { adminBtn.disabled = false; free("signout"); }
      return;
    }
    loginMsg.textContent = "";
    pw.value = "";
    dlg.showModal();
    (emailIn.value ? pw : emailIn).focus();
  });

  let fails = 0, lockedUntil = 0, signingIn = false;
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (signingIn) return;
    const wait = Math.ceil((lockedUntil - Date.now()) / 1000);
    if (wait > 0) { loginMsg.textContent = `محاولات كثيرة. حاول بعد ${wait} ثانية.`; return; }
    const email = emailIn.value.trim(), password = pw.value;
    if (!email || !password) { loginMsg.textContent = "أدخل البريد الإلكتروني وكلمة المرور."; return; }
    signingIn = true;
    goBtn.disabled = true;
    loginMsg.textContent = "جارٍ تسجيل الدخول…";
    try {
      const sb = await sbReady;
      if (!sb) { loginMsg.textContent = unavailableText(); return; }
      const { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      fails = 0;
      pw.value = "";
      loginMsg.textContent = "";
      dlg.close();
      setAdmin(!!(data && data.session));
    } catch (err) {
      const m = String((err && err.message) || "");
      if (/invalid login credentials/i.test(m) || (err && err.code === "invalid_credentials")) {
        if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 30000; }
        loginMsg.textContent = lockedUntil > Date.now() ? "محاولات كثيرة. تم القفل لمدة 30 ثانية." : "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
      } else if ((err && err.status === 429) || /rate limit/i.test(m)) {
        loginMsg.textContent = "محاولات كثيرة. حاول بعد قليل.";
      } else {
        loginMsg.textContent = explain(err, "تعذّر تسجيل الدخول. حاول مجدداً.");
      }
      pw.value = "";
      pw.focus();
    } finally {
      signingIn = false;
      goBtn.disabled = false;
    }
  });
  $("[data-cancel]", loginForm)?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  syncAdminUI();
})();
