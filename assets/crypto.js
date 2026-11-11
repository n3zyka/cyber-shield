/* Демо: шифр Цезаря та лавинний ефект SHA-256 */

const UA = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
const EN = "abcdefghijklmnopqrstuvwxyz";
const $ = id => document.getElementById(id);

function shiftChar(ch, k) {
  for (const abc of [UA, EN]) {
    const lower = ch.toLowerCase();
    const i = abc.indexOf(lower);
    if (i === -1) continue;
    const n = abc.length;
    const out = abc[(((i + k) % n) + n) % n];
    return ch === lower ? out : out.toUpperCase();
  }
  return ch;
}
const caesar = (text, k) => [...text].map(c => shiftChar(c, k)).join("");

let decryptMode = false;

function updateCaesar() {
  const k = +$("cShift").value;
  $("cShiftVal").textContent = k;
  $("cOut").textContent = caesar($("cText").value, decryptMode ? -k : k);
  $("cOutLabel").textContent = decryptMode ? "Результат розшифрування" : "Результат шифрування";
  $("cBruteOut").style.display = "none";
}

$("cText").addEventListener("input", updateCaesar);
$("cShift").addEventListener("input", updateCaesar);
$("cSwap").addEventListener("click", () => {
  // Переносимо результат у поле вводу й перемикаємо режим
  $("cText").value = $("cOut").textContent;
  decryptMode = !decryptMode;
  $("cSwap").textContent = decryptMode ? "⇅ Зашифрувати знову" : "⇅ Розшифрувати результат";
  updateCaesar();
});
$("cBrute").addEventListener("click", () => {
  // Перебираємо всі ключі для шифротексту
  const enc = decryptMode ? $("cText").value : $("cOut").textContent;
  const k = +$("cShift").value;
  const box = $("cBruteOut");
  box.style.display = "block";
  box.innerHTML = Array.from({ length: 32 }, (_, i) => {
    const key = i + 1;
    const line = caesar(enc, -key).replace(/</g, "&lt;");
    const hit = key === k;
    return `<div style="color:${hit ? "var(--heading)" : "var(--muted)"};${hit ? "background:rgba(52,211,153,.15);border-radius:4px" : ""}">` +
      `<span style="color:var(--cyan)">ключ ${String(key).padStart(2, "0")}:</span> ${line}${hit ? "  ← знайдено!" : ""}</div>`;
  }).join("");
});
updateCaesar();

/* ---------- SHA-256 ---------- */
async function sha256(text) {
  if (!window.crypto || !crypto.subtle) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function updateHash() {
  const [a, b] = await Promise.all([sha256($("h1").value), sha256($("h2").value)]);
  if (!a) {
    $("h1o").textContent = $("h2o").textContent = "Браузер не підтримує crypto.subtle (відкрий сайт через https або localhost).";
    return;
  }
  let diff = 0, outB = "";
  for (let i = 0; i < b.length; i++) {
    if (a[i] !== b[i]) { diff++; outB += `<span class="diff">${b[i]}</span>`; }
    else outB += b[i];
  }
  $("h1o").textContent = a;
  $("h2o").innerHTML = outB;
  $("hStat").textContent = a === b
    ? "Тексти однакові — хеші теж однакові."
    : `Відрізняється ${diff} з 64 символів хешу (${Math.round(diff / 64 * 100)}%).`;
}
$("h1").addEventListener("input", updateHash);
$("h2").addEventListener("input", updateHash);
updateHash();
