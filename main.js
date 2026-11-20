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

/* ================= v4 — Sessions overlay, detail view, admin mode, persistence ================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config ---------- */
  const STORAGE_KEY = "lumine_studio_sessions";
  const LEGACY_KEY = "lumine_sessions_data"; // earlier version of this site
  const ADMIN_KEY = "isSiteAdmin";
  // NOTE: client-side only. It hides the UI, it is not real security
  // (anyone can read this file). Change this to your own password.
  const ADMIN_PASSWORD = "Lumine2026";
  const MAX_SIDE = 900; // images are downscaled before saving
  const MAX_VIDEO_BYTES = 300 * 1024 * 1024; // sanity limit for one video
  const MAX_DETAILS = 5000;

  // Built-in items (none by default). Seed items are read-only: they have no
  // video / notes editing because they are not stored in the browser.
  // Shape: { id, src, title, note, details }
  const SEED = {
    models: [],
    locations: []
  };

  /* ---------- Elements (bail out quietly if the markup is missing) ---------- */
  const overlay = $("#session"), grid = $("#sessionGrid"), tools = $("#sessionTools");
  const formSlot = $("#sessionForm"), empty = $("#sessionEmpty"), back = $("#sessionBack");
  const main = $("#main"), header = $(".site-header"), curtain = $("#curtain");
  const adminBtn = $("#adminToggle"), dlg = $("#loginDlg"), loginForm = $("#loginForm");
  const pw = $("#loginPw"), loginMsg = $("#loginMsg");
  const dOv = $("#itemDetail"), dBack = $("#detailBack"), dBadge = $("#detailBadge");
  const dVideo = $("#detailVideo"), dTag = $("#detailTag"), dTitle = $("#detailTitle");
  const dNote = $("#detailNote"), dNotes = $("#detailNotes"), dTools = $("#detailTools");
  const dGalTools = $("#detailGalleryTools"), dStrip = $("#detailPhotoStrip");
  const rows = $(".rows");
  if (![overlay, grid, tools, formSlot, empty, back, main, header, adminBtn, dlg, loginForm, pw, loginMsg,
    dOv, dBack, dBadge, dVideo, dTag, dTitle, dNote, dNotes, dTools, dGalTools, dStrip, rows].every(Boolean)) return;

  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text; // never innerHTML for stored data
    return n;
  };
  const tagLang = (el, t) => { if (/[\u0600-\u06FF]/.test(t)) el.lang = "ar"; el.dir = "auto"; return el; };

  let current = null; // { id, trigger, tag, title, sub }
  let detail = null; // { sid, id, tag, trigger }
  let busy = false;
  let admin = (() => { try { return localStorage.getItem(ADMIN_KEY) === "true"; } catch { return false; } })();

  /* ---------- Metadata storage (localStorage, small text only) ---------- */
  try { // one-time migration from the previous key
    const old = localStorage.getItem(LEGACY_KEY);
    if (old !== null && localStorage.getItem(STORAGE_KEY) === null) localStorage.setItem(STORAGE_KEY, old);
    if (old !== null) localStorage.removeItem(LEGACY_KEY);
  } catch { /* ignore */ }

  const loadAdded = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
    } catch { return {}; }
  };
  const saveAdded = (data) => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch { return false; }
  };
  const validItem = (i) => i && typeof i.id === "string" &&
    ((typeof i.src === "string" && i.src.startsWith("data:image/")) || i.img === true);
  const itemsFor = (id) => {
    const added = loadAdded()[id];
    const custom = Array.isArray(added) ? added.filter(validItem).map((i) => ({ ...i, custom: true })) : [];
    return [...(SEED[id] || []), ...custom];
  };
  const findItem = (sid, id) => itemsFor(sid).find((i) => i.id === id) || null;
  const updateItem = (sid, id, patch) => {
    const data = loadAdded();
    const arr = Array.isArray(data[sid]) ? data[sid] : [];
    const i = arr.findIndex((x) => x && x.id === id);
    if (i < 0) return false;
    arr[i] = { ...arr[i], ...patch };
    data[sid] = arr;
    return saveAdded(data);
  };

  /* ---------- Media storage (IndexedDB: images + videos as Blobs, no 5 MB limit) ---------- */
  const mediaDB = (() => {
    let dbp = null;
    const open = () => {
      if (!dbp) {
        dbp = new Promise((res, rej) => {
          if (!("indexedDB" in window)) return rej(new Error("IndexedDB unavailable"));
          let r;
          try { r = indexedDB.open("lumine_media", 1); } catch (e) { return rej(e); }
          r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains("m")) r.result.createObjectStore("m"); };
          r.onsuccess = () => res(r.result);
          r.onerror = () => rej(r.error);
          r.onblocked = () => rej(new Error("IndexedDB blocked"));
        }).catch((e) => { dbp = null; throw e; });
      }
      return dbp;
    };
    const run = (mode, fn) => open().then((db) => new Promise((res, rej) => {
      const t = db.transaction("m", mode);
      const rq = fn(t.objectStore("m"));
      t.oncomplete = () => res(rq ? rq.result : undefined);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error || new Error("Transaction aborted")); // QuotaExceededError lands here
    }));
    return {
      get: (k) => run("readonly", (st) => st.get(k)).then((v) => v ?? null),
      put: (k, v) => run("readwrite", (st) => st.put(v, k)),
      del: (k) => run("readwrite", (st) => st.delete(k))
    };
  })();

  const blobToDataURL = (blob) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });

  /* ---------- Object-URL bookkeeping (no leaks) ---------- */
  const cardURLs = new Set();
  let renderGen = 0;
  const releaseCardURLs = () => { cardURLs.forEach((u) => URL.revokeObjectURL(u)); cardURLs.clear(); };
  let videoURL = null;
  const releaseVideoURL = () => { if (videoURL) { URL.revokeObjectURL(videoURL); videoURL = null; } };

  /* ---------- Session cards ---------- */
  const card = (it, i) => {
    const gen = renderGen;
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
    if (it.src) img.src = it.src;
    else mediaDB.get(`img:${it.id}`).then((blob) => {
      if (!blob || gen !== renderGen) { if (!blob) frame.classList.add("is-broken"); return; }
      const u = URL.createObjectURL(blob);
      cardURLs.add(u);
      img.src = u;
    }).catch(() => frame.classList.add("is-broken"));
    frame.append(img);

    const open = () => openItemDetail(it, frame);
    fig.addEventListener("click", (e) => { if (!e.target.closest(".scard__del")) open(); });
    frame.addEventListener("keydown", (e) => {
      if (e.target !== frame) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    float.append(frame);

    if (admin && it.custom) {
      const del = h("button", "scard__del", "×");
      del.type = "button";
      del.setAttribute("aria-label", `حذف ${it.title || "العنصر"}`);
      del.addEventListener("click", (e) => { e.stopPropagation(); removeItem(it.id); });
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
    if (!admin) return; // the button is not even created for visitors
    const add = h("button", "session__add", "+ إضافة عنصر");
    add.type = "button";
    add.setAttribute("aria-expanded", "false");
    add.addEventListener("click", () => toggleForm(add));
    tools.append(h("span", "session__badge", "وضع المشرف"), add);
  };

  const render = () => {
    if (!current) return;
    $("#sessionTag").textContent = current.tag;
    $("#sessionTitle").textContent = current.title;
    $("#sessionSub").textContent = current.sub;
    // session-specific shape hook (models → circles, locations → squares)
    overlay.dataset.session = current.id;
    grid.dataset.session = current.id;
    renderGen++;
    releaseCardURLs();
    const items = itemsFor(current.id);
    grid.replaceChildren(...items.map(card));
    empty.hidden = items.length > 0;
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
      <p class="aform__msg" role="status"></p>`;
    const msg = $(".aform__msg", f), save = $(".aform__save", f);

    $(".aform__cancel", f).addEventListener("click", () => toggleForm(toggleBtn));
    f.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!admin || !current) return;
      const file = f.elements.file.files[0];
      if (!file || !file.type.startsWith("image/")) { msg.textContent = "اختر ملف صورة من فضلك."; return; }
      save.disabled = true;
      msg.textContent = "جارٍ المعالجة…";
      const sid = current.id;
      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      let usedIDB = false;
      try {
        const blob = await compress(file);
        const item = {
          id,
          title: f.elements.title.value.trim() || file.name.replace(/\.[^.]+$/, ""),
          note: f.elements.note.value.trim(),
          created: Date.now()
        };
        try { await mediaDB.put(`img:${id}`, blob); item.img = true; usedIDB = true; }
        catch { item.src = await blobToDataURL(blob); } // IndexedDB unavailable → small data-URL fallback
        const data = loadAdded();
        (data[sid] = Array.isArray(data[sid]) ? data[sid] : []).push(item);
        if (!saveAdded(data)) {
          if (usedIDB) mediaDB.del(`img:${id}`).catch(() => { });
          msg.textContent = "مساحة التخزين ممتلئة أو غير متاحة. احذف بعض العناصر وحاول مجدداً.";
          save.disabled = false;
          return;
        }
        if (current && current.id === sid) render(); // also closes the form
      } catch {
        msg.textContent = "تعذّرت قراءة الصورة. جرّب JPG أو PNG أو WebP.";
        save.disabled = false;
      }
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

  const removeItem = (id) => {
    if (!admin || !current || !confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
    const data = loadAdded();
    const old = (Array.isArray(data[current.id]) ? data[current.id] : []).find((i) => i && i.id === id);
    data[current.id] = (Array.isArray(data[current.id]) ? data[current.id] : []).filter((i) => i && i.id !== id);
    saveAdded(data);
    (old && Array.isArray(old.gallery) ? old.gallery : []).forEach((g) => mediaDB.del(`gal:${id}:${g}`).catch(() => { }));
    mediaDB.del(`img:${id}`).catch(() => { });
    mediaDB.del(`vid:${id}`).catch(() => { });
    render();
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
  const canEdit = (it) => admin && !!it && it.custom === true;

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
    f.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!detail || !canEdit(findItem(detail.sid, detail.id))) return;
      if (!updateItem(detail.sid, detail.id, { details: ta.value.trim() })) {
        msg.textContent = "تعذّر الحفظ: مساحة التخزين ممتلئة أو غير متاحة.";
        return;
      }
      renderDetail(true);
    });
    return f;
  };

  const renderVideoPanel = async (it, gen) => {
    releaseVideoURL();
    dVideo.replaceChildren();
    let blob = null;
    if (it.video) { try { blob = await mediaDB.get(`vid:${it.id}`); } catch { blob = null; } }
    if (gen !== detailGen || !detail) return; // a newer render / close happened meanwhile

    if (blob) {
      videoURL = URL.createObjectURL(blob);
      const v = h("video", "detail__player");
      v.controls = true;
      v.playsInline = true;
      v.loop = true;
      v.preload = "metadata";
      v.setAttribute("aria-label", it.title || "فيديو");
      v.src = videoURL;
      v.addEventListener("error", () => v.replaceWith(h("p", "detail__vempty", "تعذّر تشغيل هذا الفيديو.")));
      dVideo.append(v);
    } else {
      const ph = h("div", "detail__vempty");
      ph.append(h("span", "detail__glyph cune", "𒀭"), h("p", null, "لا يوجد فيديو لهذا العنصر بعد."));
      ph.querySelector(".detail__glyph").lang = "sux";
      ph.querySelector(".detail__glyph").setAttribute("aria-hidden", "true");
      dVideo.append(ph);
    }

    if (!canEdit(it)) return;
    const bar = h("div", "detail__vtools");
    const input = h("input");
    input.type = "file";
    input.accept = "video/*";
    input.hidden = true;
    const add = h("button", "session__add", blob ? "استبدال الفيديو الطولي" : "إضافة فيديو طولي");
    add.type = "button";
    add.addEventListener("click", () => input.click());
    bar.append(input, add);
    if (blob) {
      const del = h("button", "detail__ghost", "حذف الفيديو");
      del.type = "button";
      del.addEventListener("click", async () => {
        if (!confirm("هل تريد حذف الفيديو؟")) return;
        try { await mediaDB.del(`vid:${it.id}`); } catch { /* nothing stored */ }
        if (detail) updateItem(detail.sid, it.id, { video: false });
        renderDetail();
      });
      bar.append(del);
    }
    const msg = h("p", "aform__msg");
    msg.setAttribute("role", "status");
    bar.append(msg);

    input.addEventListener("change", async () => {
      const file = input.files && input.files[0];
      input.value = "";
      if (!file || !detail) return;
      if (!file.type.startsWith("video/")) { msg.textContent = "اختر ملف فيديو من فضلك."; return; }
      if (file.size > MAX_VIDEO_BYTES) { msg.textContent = "حجم الفيديو كبير جداً (الحد الأقصى 300 ميغابايت)."; return; }
      const sid = detail.sid;
      add.disabled = true;
      msg.textContent = "جارٍ حفظ الفيديو…";
      try {
        await mediaDB.put(`vid:${it.id}`, file);
        if (!updateItem(sid, it.id, { video: true })) {
          mediaDB.del(`vid:${it.id}`).catch(() => { });
          throw new Error("meta");
        }
        if (detail && detail.id === it.id) renderDetail();
      } catch {
        msg.textContent = "تعذّر حفظ الفيديو: التخزين غير متاح أو ممتلئ.";
        add.disabled = false;
      }
    });
    dVideo.append(bar);
  };


  /* ---------- Detail: unlimited horizontal photo strip (IndexedDB) ---------- */
  const galURLs = new Set();
  const releaseGalURLs = () => { galURLs.forEach((u) => URL.revokeObjectURL(u)); galURLs.clear(); };

  const renderGallery = async (it, gen) => {
    releaseGalURLs();
    dStrip.replaceChildren();
    dGalTools.replaceChildren();
    const ids = Array.isArray(it.gallery) ? it.gallery.filter((g) => typeof g === "string") : [];
    const sid = detail ? detail.sid : null;

    if (canEdit(it)) {
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
        add.disabled = true;
        const added = [];
        let failed = 0;
        for (let n = 0; n < files.length; n++) {
          msg.textContent = `جارٍ الحفظ… ${n + 1} / ${files.length}`;
          const gid = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
          try {
            await mediaDB.put(`gal:${it.id}:${gid}`, await compress(files[n], 1600));
            added.push(gid);
          } catch { failed++; }
        }
        const cur = findItem(sid, it.id);
        const ok = added.length && cur && updateItem(sid, it.id, { gallery: [...(Array.isArray(cur.gallery) ? cur.gallery : []), ...added] });
        if (added.length && !ok) {
          added.forEach((g) => mediaDB.del(`gal:${it.id}:${g}`).catch(() => { }));
          failed += added.length;
          added.length = 0;
        }
        if (detail && detail.id === it.id) {
          const fresh = findItem(sid, it.id);
          if (fresh) await renderGallery(fresh, ++detailGen);
          const m = $(".aform__msg", dGalTools);
          if (m) m.textContent = failed ? `تعذّر حفظ ${failed} صورة (التخزين غير متاح أو الملف غير صالح).` : (added.length ? `تمت إضافة ${added.length} صورة.` : "");
          dGalTools.querySelector("button")?.focus({ preventScroll: true });
        }
      });
    }

    if (!ids.length) {
      dStrip.append(h("p", "detail__gempty", "لا توجد صور في هذا المعرض بعد."));
      return;
    }
    const figs = ids.map((gid, n) => {
      const box = h("figure", "detail__photo");
      box.dataset.gid = gid;
      const img = new Image();
      img.alt = `${it.title || "صورة"} — ${n + 1}`;
      img.decoding = "async";
      img.draggable = false;
      box.append(img);
      if (canEdit(it)) {
        const del = h("button", "scard__del", "×");
        del.type = "button";
        del.setAttribute("aria-label", `حذف الصورة ${n + 1}`);
        del.addEventListener("click", async (e) => {
          e.stopPropagation();
          if (!confirm("هل تريد حذف هذه الصورة؟")) return;
          const cur = findItem(sid, it.id);
          if (!cur) return;
          updateItem(sid, it.id, { gallery: (cur.gallery || []).filter((g) => g !== gid) });
          mediaDB.del(`gal:${it.id}:${gid}`).catch(() => { });
          const fresh = findItem(sid, it.id);
          if (fresh && detail && detail.id === it.id) renderGallery(fresh, ++detailGen);
        });
        box.append(del);
      }
      return { box, img, gid };
    });
    dStrip.replaceChildren(...figs.map((f) => f.box));
    figs.forEach(({ box, img, gid }) => {
      mediaDB.get(`gal:${it.id}:${gid}`).then((blob) => {
        if (gen !== detailGen || !detail) return;
        if (!blob) { box.classList.add("is-broken"); return; }
        const u = URL.createObjectURL(blob);
        galURLs.add(u);
        img.src = u;
      }).catch(() => box.classList.add("is-broken"));
    });
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

      renderGallery(it, gen);
      await renderVideoPanel(it, gen);
    } catch { /* keep the overlay usable even if media fails */ }
  };

  const hideDetail = () => {
    const d = detail;
    detailGen++;
    detail = null;
    dOv.hidden = true;
    releaseVideoURL();
    releaseGalURLs();
    dVideo.replaceChildren();
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
    try {
      await curtainSwap(() => {
        overlay.dataset.session = current.id;
        grid.dataset.session = current.id;
        render();
        overlay.hidden = false;
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
        renderGen++;
        releaseCardURLs();
        grid.replaceChildren();
        formSlot.replaceChildren();
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

  /* ---------- Admin login ---------- */
  const syncAdminUI = () => {
    adminBtn.textContent = admin ? "خروج المشرف" : "دخول المشرف";
    adminBtn.dataset.on = String(admin);
    document.body.classList.toggle("is-admin", admin);
    if (current) render();
    if (detail) renderDetail();
  };

  const setAdmin = (on) => {
    admin = on;
    try { on ? localStorage.setItem(ADMIN_KEY, "true") : localStorage.removeItem(ADMIN_KEY); } catch { /* ignore */ }
    syncAdminUI();
  };

  adminBtn.addEventListener("click", () => {
    if (admin) { setAdmin(false); return; }
    loginMsg.textContent = "";
    pw.value = "";
    dlg.showModal();
    pw.focus();
  });

  let fails = 0, lockedUntil = 0;
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const wait = Math.ceil((lockedUntil - Date.now()) / 1000);
    if (wait > 0) { loginMsg.textContent = `محاولات كثيرة. حاول بعد ${wait} ثانية.`; return; }
    if (pw.value === ADMIN_PASSWORD) {
      fails = 0;
      dlg.close();
      setAdmin(true);
    } else {
      if (++fails >= 5) { fails = 0; lockedUntil = Date.now() + 30000; }
      loginMsg.textContent = lockedUntil > Date.now() ? "محاولات كثيرة. تم القفل لمدة 30 ثانية." : "كلمة المرور خاطئة.";
      pw.value = "";
      pw.focus();
    }
  });
  $("[data-cancel]", loginForm)?.addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  syncAdminUI();
})();