// ====== Helpers ======
console.log("script.js loaded (GitHub Pages)");
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const safeNumber = (n) => Number.isFinite(Number(n)) ? Number(n) : null;

// ====== Config: set later ======
const BUY_URL = "#";               // TODO: swap URL when ready
const CONTRACT_ADDRESS = "TBA";    // TODO: set CA when ready (e.g. "So111...")

// Apply Buy URLs
["buyTopBtn", "buyDrawerBtn", "buySpecBtn"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;
  el.href = BUY_URL;
  if (BUY_URL === "#") {
    el.setAttribute("aria-disabled", "true");
    el.style.pointerEvents = "none";
    el.style.opacity = "0.55";
  }
});

// ====== Mobile drawer ======
const burger = $(".burger");
const drawer = $(".drawer");

function setDrawer(open){
  burger.setAttribute("aria-expanded", String(open));
  drawer.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
}

burger?.addEventListener("click", () => {
  const open = burger.getAttribute("aria-expanded") !== "true";
  setDrawer(open);
});

drawer?.addEventListener("click", (e) => {
  if (e.target === drawer) setDrawer(false);
});

$$(".drawer__link").forEach(a => a.addEventListener("click", () => setDrawer(false)));

// ====== Meme wall (ONLY 8 images: 01..08) ======
const memeGrid = $("#memeGrid");
const modal = $("#modal");
const modalImg = $("#modalImg");

const memes = [
  { src: "images/cat-meme-01.png", alt: "cat-meme-01" },
  { src: "images/cat-meme-02.png", alt: "cat-meme-02" },
  { src: "images/cat-meme-03.png", alt: "cat-meme-03" },
  { src: "images/cat-meme-04.png", alt: "cat-meme-04" },
  { src: "images/cat-meme-05.png", alt: "cat-meme-05" },
  { src: "images/cat-meme-06.png", alt: "cat-meme-06" },
  { src: "images/cat-meme-07.png", alt: "cat-meme-07" },
  { src: "images/cat-meme-08.png", alt: "cat-meme-08" },
];

function buildWall(){
  if (!memeGrid) return;

  const list = [...memes]; // 8枚だけ（重複なし）

  // shuffle
  for (let i = list.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  memeGrid.innerHTML = list.map((m, idx) => `
    <button class="meme-tile" type="button" data-src="${m.src}" aria-label="Open meme ${idx+1}">
      <img loading="lazy" decoding="async" src="${m.src}" alt="${m.alt}">
    </button>
  `).join("");

  $$(".meme-tile", memeGrid).forEach(tile => {
    tile.addEventListener("click", () => openModal(tile.dataset.src));
  });
}

function openModal(src){
  if (!modal || !modalImg) return;
  modalImg.src = src;
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeModal(){
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

modal?.addEventListener("click", (e) => {
  const t = e.target;
  if (t && t.dataset && t.dataset.close) closeModal();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

buildWall();

/*
async function onHuhTap(){
  console.log("HUH button clicked (onclick)");
  console.log("COUNTER: start");
  console.log("COUNTER: before audio");

  const huhAudio = document.getElementById("huhAudio");
  if (huhAudio){
    try { huhAudio.currentTime = 0; await huhAudio.play(); } catch(_) {}
  }
  console.log("COUNTER: after audio");

  const COUNTER_ENDPOINT = "https://script.google.com/macros/s/AKfycbyJtp2HiA7Pzx19gwLeqwBqm0KcY1kGNEFtUZ2A6ktjweDaEPg19gxmuXCflu84XVickQ/exec";
  console.log("COUNTER endpoint =", COUNTER_ENDPOINT);
  console.log("COUNTER endpoint =", COUNTER_ENDPOINT);

  const huhCountEl = document.getElementById("huhCount");

  function renderCount(v){
    if (!huhCountEl) return;
    if (v === null) { huhCountEl.textContent = "—"; return; }
    huhCountEl.textContent = Number(v).toLocaleString("en-US");
  }

  function jsonp(url){
    return new Promise((resolve, reject) => {
      const cbName = "cb_" + Math.random().toString(36).slice(2);
      const s = document.createElement("script");

      const cleanup = () => {
        try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
        s.remove();
      };

      window[cbName] = (data) => { cleanup(); resolve(data); };
      s.onerror = () => { cleanup(); reject(new Error("jsonp_failed")); };

      s.src = url + (url.includes("?") ? "&" : "?") + "callback=" + cbName;
      document.body.appendChild(s);
    });
  }

  try{
    const j = await jsonp(`${COUNTER_ENDPOINT}?op=hit`);
    console.log("COUNTER hit result =", j);

    const v = Number(j?.value);
    renderCount(Number.isFinite(v) ? v : null);
  }catch(e){
    console.log("COUNTER hit failed =", e);
    renderCount(null);
  }
}
*/

// ====== Huh button: audio + global counter (GAS / JSONP) ======
const huhBtn = document.getElementById("huhBtn");
const huhAudio = document.getElementById("huhAudio");
const huhCountEl = document.getElementById("huhCount");

const COUNTER_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbyJtp2HiA7Pzx19gwLeqwBqm0KcY1kGNEFtUZ2A6ktjweDaEPg19gxmuXCflu84XVickQ/exec";

// 表示している数をローカル保持（これが“即反応”の鍵）
let localCount = null;

// UI
function renderCount(v){
  if (!huhCountEl) return;
  if (v === null) {
    huhCountEl.textContent = "—";
    localCount = null;
    return;
  }
  localCount = Number(v);
  huhCountEl.textContent = localCount.toLocaleString("en-US");
}

function jsonp(url, timeoutMs = 8000){
  return new Promise((resolve, reject) => {
    const cbName = "cb_" + Math.random().toString(36).slice(2);
    const s = document.createElement("script");
    const sep = url.includes("?") ? "&" : "?";

    const cleanup = () => {
      clearTimeout(timer);
      try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
      s.remove();
    };

    window[cbName] = (data) => { cleanup(); resolve(data); };
    s.onerror = () => { cleanup(); reject(new Error("jsonp_failed")); };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("jsonp_timeout"));
    }, timeoutMs);

    s.src = url + sep + "callback=" + cbName + "&_=" + Date.now();
    document.body.appendChild(s);
  });
}

async function fetchCount(){
  const j = await jsonp(`${COUNTER_ENDPOINT}?op=get`);
  const v = Number(j?.value);
  return Number.isFinite(v) ? v : null;
}

async function hitCount(){
  const j = await jsonp(`${COUNTER_ENDPOINT}?op=hit`);
  const v = Number(j?.value);
  return Number.isFinite(v) ? v : null;
}

// 初期表示（サーバー値）
(async () => {
  try{
    renderCount(await fetchCount());
  }catch(_){
    renderCount(null);
  }
})();

// 連打制御（通信を詰まらせないため）
let busy = false;

huhBtn?.addEventListener("click", async () => {
  // ① 体感ラグ0：まず即+1表示（サーバーを待たない）
  if (localCount !== null) renderCount(localCount + 1);

  // 音は待たない（失敗しても無視）
  if (huhAudio){
    try{
      huhAudio.currentTime = 0;
      const p = huhAudio.play();
      if (p?.catch) p.catch(() => {});
    }catch(_){}
  }

  // ② 裏でサーバー同期（多重通信は抑制）
  if (busy) return;
  busy = true;
  try{
    const v = await hitCount();
    if (v !== null) renderCount(v); // サーバーの正しい値で上書き
    else {
      // 同期失敗時：一応サーバー値を取り直してズレを最小化
      const back = await fetchCount().catch(() => null);
      if (back !== null) renderCount(back);
    }
  } finally {
    busy = false;
  }
});

// ====== CA value + Copy button ======
const caValueEl = $("#caValue");
const copyCaBtn = $("#copyCaBtn");

function setCA(addr){
  if (!caValueEl || !copyCaBtn) return;
  caValueEl.textContent = addr;

  const ok = addr && addr !== "TBA";
  copyCaBtn.disabled = !ok;
}

setCA(CONTRACT_ADDRESS);

copyCaBtn?.addEventListener("click", async () => {
  const addr = caValueEl?.textContent?.trim() || "";
  if (!addr || addr === "TBA") return;

  try{
    await navigator.clipboard.writeText(addr);
    copyCaBtn.textContent = "Copied";
    setTimeout(() => (copyCaBtn.textContent = "Copy"), 900);
  }catch(_){
    // fallback
    const ta = document.createElement("textarea");
    ta.value = addr;
    document.body.appendChild(ta);
    ta.select();
    try{ document.execCommand("copy"); }catch(__){}
    document.body.removeChild(ta);

    copyCaBtn.textContent = "Copied";
    setTimeout(() => (copyCaBtn.textContent = "Copy"), 900);
  }
});
console.log("DEBUG: bottom reached");
