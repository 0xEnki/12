(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  // Loader
  window.addEventListener("load", () => setTimeout(() => $("#loader").classList.add("is-done"), 900));

  // Seamless marquee: duplicate content once
  const track = $("#marquee");
  track.innerHTML += track.innerHTML;

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
    btn.setAttribute("aria-expanded", String(open));
  };
  btn.addEventListener("click", () => setMenu(btn.getAttribute("aria-expanded") !== "true"));
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

  // Gallery: drag-to-scroll
  const track = $(".gallery__track");
  let down = false, startX = 0, startL = 0, moved = 0;
  track.addEventListener("pointerdown", (e) => { down = true; moved = 0; startX = e.clientX; startL = track.scrollLeft; });
  addEventListener("pointermove", (e) => {
    if (!down) return;
    moved = Math.abs(e.clientX - startX);
    if (moved > 5) { track.classList.add("is-drag"); track.scrollLeft = startL - (e.clientX - startX); }
  });
  addEventListener("pointerup", () => { down = false; track.classList.remove("is-drag"); });

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
  giant.innerHTML = [...giant.textContent].map((l, i) => `<span style="--i:${i}">${l}</span>`).join("");
  obs.observe(giant);

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
      if (!a || id.length < 2 || !$(id)) return;
      e.preventDefault();
      const opts = { duration: 550, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" };
      await curtain.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], opts).finished;
      $(id).scrollIntoView({ behavior: "instant" });
      history.replaceState(null, "", id);
      await curtain.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], opts).finished;
      curtain.getAnimations().forEach((x) => x.cancel());
    });
  }

  // 3D tilt + magnetic hover (fine pointers)
  if (fine && !reduce) {
    const photo = $(".profile__photo");
    photo.addEventListener("pointermove", (e) => {
      const r = photo.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      photo.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    photo.addEventListener("pointerleave", () => (photo.style.transform = ""));
    $$(".socials a, .gallery__btns button, .logo").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px, ${(e.clientY - r.top - r.height / 2) * .25}px)`;
      });
      el.addEventListener("pointerleave", () => (el.style.transform = ""));
    });
  }

  // Gallery controls + progress
  const track = $(".gallery__track"), ui = $(".gallery__ui");
  const upd = () => {
    const max = track.scrollWidth - track.clientWidth;
    ui.style.setProperty("--g", max > 0 ? Math.max(.12, track.scrollLeft / max) : 1);
  };
  const step = () => (track.firstElementChild?.offsetWidth || 300) + 24;
  $("#galPrev").addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
  $("#galNext").addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
  track.addEventListener("scroll", upd, { passive: true });
  addEventListener("resize", upd);
  upd();
})();

/* ================= v4 — Sessions overlay, admin mode, persistence ================= */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Config ---------- */
  const STORAGE_KEY = "lumine_studio_sessions";
  const LEGACY_KEY = "lumine_sessions_data"; // earlier version of this site
  const ADMIN_KEY = "isSiteAdmin";
  // NOTE: this is client-side only. It hides the UI, it is not real security
  // (anyone can read this file). See the notes that came with this code.
  const ADMIN_PASSWORD = "Lumine2026"; // change this to your own password
  const MAX_SIDE = 900; // uploads are downscaled so they fit in localStorage

  // No built-in placeholder photos: each session starts empty and shows only
  // the images you add in Admin mode. (To ship fixed photos with the site,
  // put objects like { id, src, title, note } inside the arrays below.)
  const SEED = {
    models: [],
    locations: [],
    lighting: [],
    cyc: []
  };

  /* ---------- Storage (all access guarded: private mode / quota) ---------- */
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
  const itemsFor = (id) => {
    const added = loadAdded()[id];
    const custom = Array.isArray(added)
      ? added.filter((i) => i && typeof i.src === "string" && i.src.startsWith("data:image/"))
        .map((i) => ({ ...i, custom: true }))
      : [];
    return [...(SEED[id] || []), ...custom];
  };

  /* ---------- Elements ---------- */
  const overlay = $("#session"), grid = $("#sessionGrid"), tools = $("#sessionTools");
  const formSlot = $("#sessionForm"), empty = $("#sessionEmpty"), back = $("#sessionBack");
  const main = $("#main"), header = $(".site-header"), curtain = $("#curtain");
  const adminBtn = $("#adminToggle"), dlg = $("#loginDlg"), loginForm = $("#loginForm");
  const pw = $("#loginPw"), loginMsg = $("#loginMsg");

  const h = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text; // never innerHTML for stored data
    return n;
  };

  let current = null; // { id, trigger, tag, title, sub }
  let busy = false;
  let admin = (() => { try { return localStorage.getItem(ADMIN_KEY) === "true"; } catch { return false; } })();

  /* ---------- Rendering ---------- */
  const card = (it, i) => {
    const fig = h("figure", "scard");
    fig.style.setProperty("--i", i);
    const float = h("div", "scard__float");
    const frame = h("div", "scard__frame");

    const img = new Image();
    img.alt = it.title || `صورة ${i + 1}`;
    img.decoding = "async";
    img.src = it.src;
    img.addEventListener("error", () => frame.classList.add("is-broken"));
    frame.append(img);

    if (admin && it.custom) {
      const del = h("button", "scard__del", "×");
      del.type = "button";
      del.setAttribute("aria-label", `حذف ${it.title || "العنصر"}`);
      del.addEventListener("click", () => removeItem(it.id));
      frame.append(del);
    }

    const cap = h("figcaption", "scard__cap");
    cap.append(h("span", "scard__no", `رقم ${String(i + 1).padStart(2, "0")}`));
    const tagLang = (el, t) => { if (/[\u0600-\u06FF]/.test(t)) el.lang = "ar"; el.dir = "auto"; return el; };
    if (it.title) cap.append(tagLang(h("strong", "scard__title", it.title), it.title));
    if (it.note) cap.append(tagLang(h("span", "scard__note", it.note), it.note));

    float.append(frame, cap);
    fig.append(float);
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
    const items = itemsFor(current.id);
    grid.replaceChildren(...items.map(card));
    empty.hidden = items.length > 0;
    renderTools();
  };

  /* ---------- Admin upload ---------- */
  const compress = async (file) => {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = rej;
        i.src = url;
      });
      const k = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
      const c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k);
      c.height = Math.round(img.naturalHeight * k);
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#1F1F1F";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      let out = c.toDataURL("image/webp", .82);
      if (!out.startsWith("data:image/webp")) out = c.toDataURL("image/jpeg", .82); // Safari
      return out;
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
      const file = f.elements.file.files[0];
      if (!file || !file.type.startsWith("image/")) { msg.textContent = "اختر ملف صورة من فضلك."; return; }
      save.disabled = true;
      msg.textContent = "جارٍ المعالجة…";
      try {
        const src = await compress(file);
        const data = loadAdded();
        (data[current.id] ||= []).push({
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
          src,
          title: f.elements.title.value.trim() || file.name.replace(/\.[^.]+$/, ""),
          note: f.elements.note.value.trim(),
          created: Date.now()
        });
        if (!saveAdded(data)) {
          msg.textContent = "مساحة التخزين ممتلئة أو غير متاحة. احذف بعض العناصر وحاول مجدداً.";
          save.disabled = false;
          return;
        }
        render(); // also closes the form
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
    $("input", formSlot).focus();
  };

  const removeItem = (id) => {
    if (!admin || !current || !confirm("هل تريد حذف هذا العنصر نهائياً؟")) return;
    const data = loadAdded();
    data[current.id] = (data[current.id] || []).filter((i) => i.id !== id);
    saveAdded(data);
    render();
  };

  /* ---------- Open / close with the existing curtain ---------- */
  const curtainSwap = async (mid) => {
    if (reduce || !curtain) return mid();
    const o = { duration: 550, easing: "cubic-bezier(.76,0,.24,1)", fill: "forwards" };
    await curtain.animate([{ transform: "translateY(101%)" }, { transform: "translateY(0)" }], o).finished;
    mid();
    await curtain.animate([{ transform: "translateY(0)" }, { transform: "translateY(-101%)" }], o).finished;
    curtain.getAnimations().forEach((a) => a.cancel());
  };

  const openSession = async (btn) => {
    if (busy || current) return;
    busy = true;
    const li = btn.closest("li");
    current = {
      id: btn.dataset.session,
      trigger: btn,
      tag: $(".idx", li).textContent,
      title: btn.textContent.trim(),
      sub: $("p", li).textContent.trim()
    };
    try {
      await curtainSwap(() => {
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
    if (busy || !current) return;
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
        current = null;
        trigger.focus({ preventScroll: true });
      });
    } finally { busy = false; }
  };

  $(".rows").addEventListener("click", (e) => {
    const b = e.target.closest(".row__open");
    if (b) openSession(b);
  });
  back.addEventListener("click", closeSession);
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && current && !dlg.open) closeSession();
  });

  /* ---------- Admin login ---------- */
  const syncAdminUI = () => {
    adminBtn.textContent = admin ? "خروج المشرف" : "دخول المشرف";
    adminBtn.dataset.on = String(admin);
    document.body.classList.toggle("is-admin", admin);
    if (current) render();
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
  $("[data-cancel]", loginForm).addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  syncAdminUI();
})();