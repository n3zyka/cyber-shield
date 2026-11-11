/* Вікторина «Фішинг чи ні?» */

const QUESTIONS = [
  {
    type: "sms", from: "EXPRESSPOST",
    body: 'Ваша посилка №20450091 затримана на складі через неповну адресу. Підтвердіть дані та оплатіть повторну доставку (18 грн) протягом 12 год: <a>expresspost-ua.delivery-check.top/pay</a>',
    phish: true,
    why: ["Домен <code>delivery-check.top</code> не має стосунку до служби доставки — «expresspost-ua» лише піддомен.",
          "Тиск часом («протягом 12 год») і невелика сума, щоб людина не замислювалась.",
          "Мета — отримати дані банківської картки на фальшивій сторінці оплати."],
  },
  {
    type: "email", from: "Cloudly Security &lt;no-reply@accounts.cloudly.com&gt;", subject: "Новий вхід до вашого акаунта",
    body: 'Привіт, Олено!\n\nМи помітили новий вхід до вашого акаунта Cloudly з пристрою Windows (Львів, Україна) сьогодні о 14:32.\n\nЯкщо це були ви — нічого робити не потрібно.\nЯкщо ні — перевірте активність у налаштуваннях безпеки: <a>myaccount.cloudly.com/security</a>',
    phish: false,
    why: ["Відправник і посилання ведуть на офіційний домен <code>cloudly.com</code>.",
          "Звертання на ім'я, конкретні деталі входу, немає погроз.",
          "Лист не просить ввести пароль — лише пропонує перевірити, якщо щось не так. Найкраще все одно відкрити налаштування вручну, а не за посиланням."],
  },
  {
    type: "email", from: "Служба безпеки БанкПлюс &lt;security@bankplus-support.net&gt;", subject: "⚠ Ваша картка ЗАБЛОКОВАНА",
    body: 'Шановний клієнте!\n\nЧерез підозрілу активність вашу картку тимчасово заблоковано. Для розблокування необхідно підтвердити дані картки (номер, термін дії, CVV) за посиланням нижче.\n\nЯкщо ви не підтвердите дані протягом 24 годин, рахунок буде закрито назавжди.\n\n<a>bankplus-support.net/unlock</a>',
    phish: true,
    why: ["Банк ніколи не просить CVV-код — це головний червоний прапорець.",
          "Безособове «Шановний клієнте», великі літери, залякування закриттям рахунку.",
          "Домен <code>bankplus-support.net</code> не є офіційним доменом банку."],
  },
  {
    type: "sms", from: "+380 67 *** ** 14 (Максим)",
    body: 'Привіт! Терміново потрібна допомога, я за кордоном і картку заблокували 😩 Можеш скинути 2000 грн на цю картку 4441 **** **** 7310? Завтра поверну, телефон сідає, дзвонити не можу',
    phish: true,
    why: ["Класична схема з «другом у біді»: акаунт або номер знайомого могли зламати.",
          "Терміновість + неможливість зателефонувати = неможливість перевірити.",
          "Правильна дія: зателефонувати Максиму на відомий номер або написати в іншому месенджері."],
  },
  {
    type: "email", from: "Деканат ФІТ &lt;dekanat@fit.univ.edu.ua&gt;", subject: "Розклад сесії, зимовий семестр",
    body: 'Шановні студенти!\n\nРозклад екзаменаційної сесії зимового семестру опубліковано на сайті факультету в розділі «Студенту». Звертаємо увагу на зміну аудиторії для екзамену з дискретної математики (ауд. 314).\n\nЗ повагою,\nдеканат',
    phish: false,
    why: ["Лист від офіційного домену університету, без посилань і вкладень.",
          "Не просить жодних даних, не тисне часом і не погрожує.",
          "Пропонує самостійно зайти на відомий сайт — це правильна практика."],
  },
  {
    type: "email", from: "GameVault Support &lt;support@gamevau1t.com&gt;", subject: "Your account will be suspended",
    body: 'Hello,\n\nWe have received a report that your account was used for trading scam. Your account will be permanently banned in 6 hours.\n\nIf this is a mistake, please log in and confirm ownership:\n<a>gamevau1t.com/login/confirm</a>',
    phish: true,
    why: ["Тайпсквотинг: <code>gamevau1t</code> — цифра «1» замість літери «l» (справжній сервіс — gamevault.com).",
          "Погроза блокування з дуже коротким терміном.",
          "Це поширена схема крадіжки ігрових акаунтів з дорогими предметами."],
  },
  {
    type: "sms", from: "DerzhDopomoga",
    body: 'Вам нараховано одноразову допомогу 6500 грн від держави. Щоб отримати кошти, введіть дані картки на сторінці: <a>derzh-vyplaty.online/form</a>',
    phish: true,
    why: ["Державні сервіси не розсилають посилання на сторонні домени (<code>.online</code>).",
          "«Безкоштовні гроші» — приманка на жадібність.",
          "Для отримання виплати ніколи не потрібні CVV чи коди з SMS. Перевіряй інформацію лише в офіційному застосунку."],
  },
  {
    type: "email", from: "CodeHub &lt;noreply@codehub.com&gt;", subject: "[CodeHub] A third-party OAuth application has been added",
    body: 'Hey student!\n\nA third-party OAuth application (Code Editor) with read:user and repo scopes was recently authorized to access your account.\n\nVisit <a>codehub.com/settings/applications</a> for more information.',
    phish: false,
    why: ["Відправник <code>noreply@codehub.com</code> і посилання ведуть на офіційний домен сервісу.",
          "Інформаційне сповіщення про дію, яку ти, ймовірно, зробив сам (вхід через VS Code).",
          "Лист нічого не вимагає і не тисне. Якщо ти цього не робив — відкликай доступ у налаштуваннях."],
  },
];

const qBody = document.getElementById("qBody");
const qProgress = document.getElementById("qProgress");
let idx = 0, score = 0, results = [];

function renderProgress() {
  qProgress.innerHTML = QUESTIONS.map((_, i) =>
    `<i class="${results[i] === true ? "right" : results[i] === false ? "wrong" : i === idx ? "cur" : ""}"></i>`).join("");
}

function renderQuestion() {
  const q = QUESTIONS[idx];
  renderProgress();
  const head = q.type === "email"
    ? `<b>Від:</b> ${q.from}<br><b>Тема:</b> ${q.subject}`
    : `<b>${q.from}</b>`;
  qBody.innerHTML = `
    <p style="font:13px var(--mono);color:var(--muted);margin-bottom:10px">ПОВІДОМЛЕННЯ ${idx + 1} / ${QUESTIONS.length} · ${q.type === "email" ? "електронний лист" : "SMS / месенджер"}</p>
    <div class="message ${q.type === "sms" ? "sms" : ""}">
      <div class="mhead">${head}</div>
      <div class="mbody">${q.body}</div>
    </div>
    <div class="quiz-actions">
      <button class="btn safe" data-a="0" type="button">✓ Безпечно</button>
      <button class="btn phish" data-a="1" type="button">⚠ Фішинг</button>
    </div>
    <div class="explain" id="qExplain"></div>`;
  qBody.querySelectorAll("[data-a]").forEach(b => b.addEventListener("click", () => answer(b.dataset.a === "1")));
}

function answer(saidPhish) {
  const q = QUESTIONS[idx];
  const ok = saidPhish === q.phish;
  if (ok) score++;
  results[idx] = ok;
  renderProgress();
  qBody.querySelectorAll("[data-a]").forEach(b => (b.disabled = true));
  const ex = document.getElementById("qExplain");
  ex.className = "explain show " + (ok ? "right" : "wrong");
  ex.innerHTML = `<b>${ok ? "Правильно!" : "Неправильно."} Це ${q.phish ? "фішинг" : "безпечне повідомлення"}.</b>
    <ul>${q.why.map(w => `<li>${w}</li>`).join("")}</ul>
    <div class="row"><button class="btn small" id="qNext" type="button">${idx < QUESTIONS.length - 1 ? "Наступне →" : "Результат"}</button></div>`;
  document.getElementById("qNext").addEventListener("click", () => {
    idx++;
    idx < QUESTIONS.length ? renderQuestion() : renderResult();
  });
}

function renderResult() {
  renderProgress();
  const pct = score / QUESTIONS.length;
  const verdict = pct === 1 ? "Ідеально! Шахраям з тобою не пощастить."
    : pct >= 0.75 ? "Добрий результат — ти помічаєш більшість пасток."
    : pct >= 0.5 ? "Непогано, але кілька пасток спрацювали б. Перечитай ознаки фішингу вище."
    : "Варто уважніше вивчити цей розділ — шахраї розраховують саме на неуважність.";
  qBody.innerHTML = `
    <div class="score-big">${score} / ${QUESTIONS.length}</div>
    <p style="text-align:center;font-size:18px;color:var(--heading)">${verdict}</p>
    <div class="row" style="justify-content:center"><button class="btn" id="qRestart" type="button">Пройти ще раз</button></div>`;
  document.getElementById("qRestart").addEventListener("click", () => {
    idx = 0; score = 0; results = []; renderQuestion();
  });
}

renderQuestion();
