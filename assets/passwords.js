/* Перевірка надійності пароля та генератор */

const COMMON = ["123456","123456789","12345678","password","qwerty","qwerty123","12345","1234567","111111","123123",
  "1234567890","000000","abc123","password1","iloveyou","1q2w3e4r","1q2w3e","qwertyuiop","123321","654321",
  "666666","121212","admin","welcome","monkey","dragon","football","letmein","sunshine","princess","master",
  "zaq12wsx","asdfgh","asdfghjkl","qazwsx","passw0rd","p@ssw0rd","p@ssword","pa$$word","superman","batman",
  "michael","shadow","killer","pokemon","minecraft","starwars","freedom","whatever","trustno1","azerty",
  "112233","7777777","987654321","1111","0000","1234","4321","love","ukraine","україна","slava","kyiv","natasha"];

const SEQS = ["abcdefghijklmnopqrstuvwxyz", "0123456789", "qwertyuiop", "asdfghjkl", "zxcvbnm", "йцукенгшщзхї", "фівапролджє", "ячсмитьбю"];

const $ = id => document.getElementById(id);

function analyze(pw) {
  const low = pw.toLowerCase();
  const checks = {
    len: pw.length >= 12,
    lower: /[a-zа-яіїєґ]/.test(pw),
    upper: /[A-ZА-ЯІЇЄҐ]/.test(pw),
    digit: /\d/.test(pw),
    sym: /[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(pw),
    common: true,
  };

  // Розмір алфавіту
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[а-яіїєґ]/.test(pw)) pool += 33;
  if (/[А-ЯІЇЄҐ]/.test(pw)) pool += 33;
  if (checks.digit) pool += 10;
  if (/[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(pw)) pool += 33;

  let bits = pw.length * Math.log2(pool || 1);
  const warns = [];

  // Популярні паролі (з урахуванням «leet»-замін)
  const deleet = low.replace(/@/g, "a").replace(/0/g, "o").replace(/1/g, "i").replace(/\$/g, "s").replace(/3/g, "e");
  const stripped = low.replace(/[\d!@#$%^&*._-]+$/, "");
  if (COMMON.includes(low) || COMMON.includes(deleet) || (stripped.length >= 4 && COMMON.includes(stripped))) {
    checks.common = false;
    bits = Math.min(bits, 10);
    warns.push("Цей пароль (або його основа) є в списках найпопулярніших — його підберуть першим.");
  }

  // Повтори символів (ааааа, 121212)
  if (/(.)\1{2,}/.test(pw)) { bits *= 0.7; warns.push("Повтор одного символу кілька разів поспіль."); }
  if (/^(.{1,3})\1+$/.test(pw) && pw.length > 3) { bits = Math.min(bits, 20); warns.push("Пароль складається з шаблону, що повторюється."); }

  // Послідовності (abcd, 1234, qwerty)
  for (const s of SEQS) {
    for (let i = 0; i + 4 <= s.length; i++) {
      const sub = s.slice(i, i + 4);
      if (low.includes(sub) || low.includes([...sub].reverse().join(""))) {
        bits *= 0.75; warns.push(`Містить послідовність «${sub}» — словникові атаки перевіряють такі в першу чергу.`); break;
      }
    }
  }

  // Роки
  if (/(19|20)\d{2}/.test(pw)) { bits -= 6; warns.push("Схоже на рік — дати народження легко вгадати."); }

  bits = Math.max(0, bits);
  return { checks, bits, warns: [...new Set(warns)].slice(0, 2) };
}

function formatTime(sec) {
  if (sec < 1) return "миттєво";
  const units = [["століть", 3.156e9], ["років", 3.156e7], ["днів", 86400], ["годин", 3600], ["хвилин", 60], ["секунд", 1]];
  if (sec > 3.156e9 * 1e6) return "мільярди років";
  for (const [name, s] of units) {
    if (sec >= s) {
      const v = sec / s;
      if (v >= 1e6) return (v / 1e6).toFixed(1).replace(".", ",") + " млн " + name;
      if (v >= 1e3) return (v / 1e3).toFixed(1).replace(".", ",") + " тис. " + name;
      return Math.round(v) + " " + name;
    }
  }
}

const LEVELS = [
  [28, "Дуже слабкий", "var(--red)"],
  [40, "Слабкий", "#fb7d55"],
  [60, "Середній", "var(--amber)"],
  [80, "Надійний", "var(--green)"],
  [Infinity, "Дуже надійний", "var(--cyan)"],
];

function update() {
  const pw = $("pw").value;
  const bar = $("meterBar");
  if (!pw) {
    bar.style.width = "0"; $("pwLabel").textContent = "—"; $("pwEntropy").textContent = "0 біт";
    $("pwTime").textContent = "—"; $("pwWarn").textContent = "";
    document.querySelectorAll("#pwChecks li").forEach(li => li.classList.remove("pass"));
    return;
  }
  const { checks, bits, warns } = analyze(pw);
  const [, label, color] = LEVELS.find(l => bits < l[0]);
  bar.style.width = Math.min(100, Math.max(5, bits)) + "%";
  bar.style.background = color;
  $("pwLabel").textContent = label;
  $("pwLabel").style.color = color;
  $("pwEntropy").textContent = Math.round(bits) + " біт";
  // Середній час = половина простору перебору / швидкість
  $("pwTime").textContent = formatTime(Math.pow(2, bits) / 2 / 1e10);
  document.querySelectorAll("#pwChecks li").forEach(li => li.classList.toggle("pass", checks[li.dataset.k]));
  $("pwWarn").textContent = warns.length ? "⚠ " + warns.join(" ") : "";
}

$("pw").addEventListener("input", update);
$("eye").addEventListener("click", () => {
  const i = $("pw");
  i.type = i.type === "password" ? "text" : "password";
});

/* ---------- Генератор ---------- */
const WORDS = ["kavun","tramvai","pinhvin","hitara","sonce","borshch","dzherelo","vyshnia","kolobok","maiak",
  "khmara","olivets","kompas","rakieta","lisovyk","pryvyd","zirka","bdzhola","chervone","yizhak","korabel",
  "tsybulia","yantar","vulkan","sokil","drakon","kalyna","zhyto","lastivka","hvylia","krokus","bandura",
  "metelyk","palianytsia","sharf","shokolad","vodospad","kraplia","tyhr","tetris","robot","kvantovyi",
  "lymon","marshrut","nebozhyt","pidkova","sviatyi","teplyi","fortetsia","shkatulka"];

function rand(n) {
  const a = new Uint32Array(1);
  const lim = Math.floor(0xffffffff / n) * n;
  do crypto.getRandomValues(a); while (a[0] >= lim);
  return a[0] % n;
}

function genPassword() {
  let set = "abcdefghijkmnopqrstuvwxyz";
  if ($("gUpper").checked) set += "ABCDEFGHJKLMNPQRSTUVWXYZ";
  if ($("gDigit").checked) set += "23456789";
  if ($("gSym").checked) set += "!@#$%^&*-_=+?";
  const len = +$("genLen").value;
  let out = "";
  for (let i = 0; i < len; i++) out += set[rand(set.length)];
  show(out);
}

function genPhrase() {
  const w = [];
  for (let i = 0; i < 4; i++) w.push(WORDS[rand(WORDS.length)]);
  show(w.join("-") + "-" + (10 + rand(90)));
}

let firstRun = true;
function show(v) {
  $("genOut").textContent = v;
  if (firstRun) { firstRun = false; return; } // при завантаженні не чіпаємо поле перевірки
  $("pw").value = v;
  update();
}

$("genLen").addEventListener("input", e => { $("genLenVal").textContent = e.target.value; });
$("genBtn").addEventListener("click", genPassword);
$("phraseBtn").addEventListener("click", genPhrase);
$("copyBtn").addEventListener("click", async () => {
  const t = $("genOut").textContent;
  if (t === "—") return;
  try { await navigator.clipboard.writeText(t); $("copyBtn").textContent = "Скопійовано ✓"; }
  catch { $("copyBtn").textContent = "Не вдалося"; }
  setTimeout(() => ($("copyBtn").textContent = "Копіювати"), 1500);
});
genPassword();
