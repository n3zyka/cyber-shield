/* ==========================================================
   КіберЩит — спільна логіка для всіх сторінок
   ========================================================== */

const PAGES = [
  { href: "index.html", title: "Головна" },
  { href: "threats.html", title: "Загрози" },
  { href: "passwords.html", title: "Паролі" },
  { href: "phishing.html", title: "Фішинг" },
  { href: "crypto.html", title: "Криптографія" },
  { href: "attacks.html", title: "Відомі атаки" },
  { href: "protection.html", title: "Захист" },
  { href: "sources.html", title: "Джерела" },
];

const LOGO_SVG = `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round">
  <path d="M16 3 5 7v8c0 7 4.7 12.2 11 14 6.3-1.8 11-7 11-14V7L16 3Z"/>
  <path d="M11.5 16.5 14.5 19.5 20.5 12.5" stroke="#b3261e" stroke-width="2.6"/></svg>`;

/* Номер «справи» і штамп у шапці кожної внутрішньої сторінки */
function initDossier() {
  const box = document.querySelector(".page-hero .container");
  if (box) {
    const idx = PAGES.findIndex(p => p.href === current);
    const no = document.createElement("div");
    no.className = "case-no";
    no.textContent = `Справа № ${String(Math.max(idx, 0)).padStart(2, "0")} · Матеріали для навчання`;
    box.prepend(no);
    const stamp = document.createElement("div");
    stamp.className = "stamp";
    stamp.textContent = current === "sources.html" ? "Перевірено" : "Розсекречено";
    if (current === "sources.html") stamp.classList.add("green");
    box.append(stamp);
  }
  // На сенсорних екранах чорні смуги відкриваються дотиком
  document.querySelectorAll(".redact").forEach(r => r.addEventListener("click", () => r.classList.toggle("open")));
}

const current = location.pathname.split("/").pop() || "index.html";

/* ---------- Шапка й підвал ---------- */
function buildChrome() {
  const header = document.createElement("header");
  header.className = "header";
  header.innerHTML = `
    <div class="container">
      <a class="logo" href="index.html">${LOGO_SVG}<span>Кібер<b>Щит</b></span></a>
      <nav class="nav" id="nav">
        ${PAGES.map(p => `<a href="${p.href}"${p.href === current ? ' class="active"' : ""}>${p.title}</a>`).join("")}
      </nav>
      <button class="burger" aria-label="Меню" aria-controls="nav" aria-expanded="false"><span></span></button>
    </div>`;
  document.body.prepend(header);

  const bar = document.createElement("div");
  bar.className = "progress";
  document.body.prepend(bar);

  const footer = document.createElement("footer");
  footer.className = "footer";
  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="logo" href="index.html">${LOGO_SVG}<span>Кібер<b>Щит</b></span></a>
          <p>Освітній сайт про кібербезпеку: як працюють атаки, чому паролі зламують і що робити, щоб захистити себе. Індивідуальне завдання з дисципліни «Вступ до фаху».</p>
          <p class="author">Виконав: студент групи <b>3КН-26Б</b> <b>Клименчук Микола</b><br>Вінницький національний технічний університет (ВНТУ)</p>
        </div>
        <div>
          <h5>Розділи</h5>
          <ul>${PAGES.slice(1, 5).map(p => `<li><a href="${p.href}">${p.title}</a></li>`).join("")}</ul>
        </div>
        <div>
          <h5>Ще</h5>
          <ul>${PAGES.slice(5).map(p => `<li><a href="${p.href}">${p.title}</a></li>`).join("")}
            <li><a href="https://cert.gov.ua/" target="_blank" rel="noopener">CERT-UA ↗</a></li></ul>
        </div>
      </div>
      <div class="copy"><span>© ${new Date().getFullYear()} КіберЩит · Клименчук Микола, 3КН-26Б, ВНТУ</span><span>// кінець справи · думай, перш ніж клікати</span></div>
    </div>`;
  document.body.append(footer);

  const top = document.createElement("button");
  top.className = "to-top";
  top.setAttribute("aria-label", "Нагору");
  top.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 15 6-6 6 6"/></svg>`;
  top.onclick = () => scrollTo({ top: 0 });
  document.body.append(top);

  // Мобільне меню
  const burger = header.querySelector(".burger");
  const nav = header.querySelector(".nav");
  burger.onclick = () => {
    const open = nav.classList.toggle("open");
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
  };

  // Прогрес прокрутки + кнопка вгору
  const onScroll = () => {
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
    top.classList.toggle("show", h.scrollTop > 600);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ---------- Поява елементів при прокрутці ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("visible")); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  els.forEach(e => io.observe(e));
}

/* ---------- Автоматичний зміст статті ---------- */
function initToc() {
  const toc = document.querySelector(".toc");
  const prose = document.querySelector(".prose");
  if (!toc || !prose) return;
  const heads = [...prose.querySelectorAll("h2")];
  heads.forEach((h, i) => { if (!h.id) h.id = "s" + (i + 1); });
  toc.innerHTML = "<h4>Зміст</h4>" + heads.map(h => `<a href="#${h.id}">${h.textContent}</a>`).join("");
  const links = [...toc.querySelectorAll("a")];
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
      }
    });
  }, { rootMargin: "-20% 0px -70% 0px" });
  heads.forEach(h => io.observe(h));
}

/* ---------- Світіння карток за курсором ---------- */
function initCardGlow() {
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
}

/* ---------- Анімовані лічильники ---------- */
function initCounters() {
  const els = document.querySelectorAll("[data-count]");
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
      const t0 = performance.now(), dur = 1600;
      const step = t => {
        const k = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - k, 3));
        el.textContent = v.toFixed(dec).replace(".", ",");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.5 });
  els.forEach(e => io.observe(e));
}

/* ---------- «Матричний дощ» на головній ---------- */
function initMatrix() {
  const c = document.getElementById("matrix");
  if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const ctx = c.getContext("2d");
  const chars = "01アイウエオカキクケコ<>/{}[]#$%&*ABCDEF0123456789";
  const size = 16;
  let cols, drops;
  const resize = () => {
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    cols = Math.ceil(c.width / size);
    drops = Array.from({ length: cols }, () => Math.random() * -50);
  };
  resize();
  addEventListener("resize", resize);
  let last = 0;
  const draw = t => {
    requestAnimationFrame(draw);
    if (t - last < 50) return;
    last = t;
    ctx.fillStyle = "rgba(6,10,19,0.12)";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.font = size + "px JetBrains Mono, monospace";
    drops.forEach((y, i) => {
      ctx.fillStyle = Math.random() > 0.975 ? "#e0fbff" : (i % 7 === 0 ? "#a78bfa" : "#22d3ee");
      ctx.fillText(chars[(Math.random() * chars.length) | 0], i * size, y * size);
      drops[i] = y * size > c.height && Math.random() > 0.975 ? 0 : y + 1;
    });
  };
  requestAnimationFrame(draw);
}

/* ---------- Ефект друку тексту ---------- */
function initTyped() {
  const el = document.querySelector(".typed[data-words]");
  if (!el) return;
  const words = el.dataset.words.split("|");
  let w = 0, i = 0, del = false;
  const tick = () => {
    const word = words[w];
    el.textContent = word.slice(0, i);
    if (!del && i < word.length) i++;
    else if (del && i > 0) i--;
    else if (!del) { del = true; return setTimeout(tick, 1600); }
    else { del = false; w = (w + 1) % words.length; }
    setTimeout(tick, del ? 35 : 75);
  };
  tick();
}

/* ==========================================================
   Додаткові ефекти
   ========================================================== */
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
const FINE_POINTER = matchMedia("(pointer: fine)").matches;

/* Автоматична поява блоків статті під час прокрутки */
function initAutoReveal() {
  document.querySelectorAll(".prose > h2, .prose > h3, .prose > p, .prose > ul, .prose > ol, .prose > blockquote, .prose > pre, .prose > .callout, .prose > .table-wrap, .prose > .grid-2, .prose > .cards")
    .forEach(el => el.classList.add("reveal"));
  document.querySelectorAll(".flow").forEach(flow => {
    flow.classList.add("reveal-flow");
    [...flow.children].forEach((c, i) => c.style.setProperty("--i", i));
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); } });
  }, { threshold: 0.3 });
  document.querySelectorAll(".flow").forEach(f => io.observe(f));
}

/* «Розшифрування» тексту: випадкові символи поступово стають справжніми */
function scramble(el) {
  if (REDUCED || el.dataset.scrambled) return;
  el.dataset.scrambled = "1";
  const target = el.textContent;
  const glyphs = "█▓▒";
  const len = target.length;
  let frame = 0;
  const total = 28;
  const tick = () => {
    const done = Math.floor((frame / total) * len);
    let html = "";
    for (let i = 0; i < len; i++) {
      const ch = target[i];
      if (i < done || ch === " ") html += ch;
      else html += `<span class="scramble-char">${glyphs[(Math.random() * glyphs.length) | 0]}</span>`;
    }
    el.innerHTML = html;
    if (frame++ < total) requestAnimationFrame(() => setTimeout(tick, 24));
    else el.textContent = target;
  };
  tick();
}
function initScramble() {
  const h1 = document.querySelector(".page-hero h1");
  if (h1) setTimeout(() => scramble(h1), 200);
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { scramble(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.6 });
  document.querySelectorAll(".section-title h2").forEach(h => io.observe(h));
}

/* Підсвітка, що йде за курсором */
function initSpotlight() {
  if (REDUCED || !FINE_POINTER) return;
  const s = document.createElement("div");
  s.className = "spotlight";
  document.body.prepend(s);
  addEventListener("mousemove", e => {
    s.style.setProperty("--x", e.clientX + "px");
    s.style.setProperty("--y", e.clientY + "px");
  }, { passive: true });
}

/* 3D-нахил карток за курсором */
function initTilt() {
  if (REDUCED || !FINE_POINTER) return;
  document.querySelectorAll(".card").forEach(card => {
    const lift = card.tagName === "A" ? " translateY(-6px)" : "";
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add("tilting");
      card.style.transform = `perspective(800px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)${lift}`;
    });
    card.addEventListener("mouseleave", () => {
      card.classList.remove("tilting");
      card.style.transform = "";
    });
  });
}

/* Мережа частинок у шапці внутрішніх сторінок */
function initNet() {
  const hero = document.querySelector(".page-hero");
  if (!hero || REDUCED) return;
  const c = document.createElement("canvas");
  c.className = "net";
  hero.prepend(c);
  const ctx = c.getContext("2d");
  let w, h, pts = [];
  const mouse = { x: -999, y: -999 };
  const resize = () => {
    w = c.width = hero.offsetWidth;
    h = c.height = hero.offsetHeight;
    // «Детективна дошка»: шпильки переважно справа, щоб не заважати тексту
    const n = Math.max(8, Math.min(22, Math.floor(w * h / 30000)));
    const minX = w > 800 ? w * 0.45 : 0;
    pts = Array.from({ length: n }, () => ({
      x: minX + Math.random() * (w - minX), y: Math.random() * h, minX,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
    }));
  };
  resize();
  addEventListener("resize", resize);
  hero.addEventListener("mousemove", e => {
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  hero.addEventListener("mouseleave", () => { mouse.x = mouse.y = -999; });
  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(hero);
  const draw = () => {
    requestAnimationFrame(draw);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < p.minX || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      // Частинки трохи відштовхуються від курсора
      const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { p.x += dx / d * 1.2; p.y += dy / d * 1.2; }
    }
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 230) {
          // Червона нитка з легким провисанням
          ctx.strokeStyle = `rgba(179,38,30,${(1 - d / 230) * 0.75})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(a.x, a.y);
          ctx.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + d * 0.08, b.x, b.y);
          ctx.stroke();
        }
      }
    }
    // Шпильки
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.fillStyle = "rgba(0,0,0,.25)";
      ctx.beginPath(); ctx.arc(p.x + 2, p.y + 3, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = i % 4 === 0 ? "#1f4596" : "#b3261e";
      ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,.7)";
      ctx.beginPath(); ctx.arc(p.x - 1.5, p.y - 1.5, 1.6, 0, Math.PI * 2); ctx.fill();
    }
  };
  draw();
}

/* Плавний перехід між сторінками сайту */
function initPageTransitions() {
  if (REDUCED) return;
  document.addEventListener("click", e => {
    const a = e.target.closest("a");
    if (!a || a.target === "_blank" || e.ctrlKey || e.metaKey || e.shiftKey) return;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    e.preventDefault();
    document.body.classList.add("leaving");
    setTimeout(() => (location.href = a.href), 250);
  });
  // Повернення кнопкою «Назад» з кешу браузера
  addEventListener("pageshow", e => { if (e.persisted) document.body.classList.remove("leaving"); });
}

buildChrome();
initDossier();
initAutoReveal();
initReveal();
initToc();
initCardGlow();
initTilt();
initCounters();
initMatrix();
initTyped();
initScramble();
initSpotlight();
initNet();
initPageTransitions();
