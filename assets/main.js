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

const LOGO_SVG = `<svg viewBox="0 0 32 32" fill="none" stroke="#22d3ee" stroke-width="2" stroke-linejoin="round">
  <path d="M16 3 5 7v8c0 7 4.7 12.2 11 14 6.3-1.8 11-7 11-14V7L16 3Z"/>
  <path d="M11.5 16.5 14.5 19.5 20.5 12.5" stroke="#34d399"/></svg>`;

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
      <div class="copy"><span>© ${new Date().getFullYear()} КіберЩит</span><span>// stay safe, think before you click</span></div>
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

buildChrome();
initReveal();
initToc();
initCardGlow();
initCounters();
initMatrix();
initTyped();
