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

function renderCount(v){
  if (!huhCountEl) return;
  if (v === null) { huhCountEl.textContent = "—"; return; }
  huhCountEl.textContent = Number(v).toLocaleString("en-US");
}

// JSONP (with timeout + cache-bust)
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
  console.log("COUNTER: fetchCount start");
  const j = await jsonp(`${COUNTER_ENDPOINT}?op=get`);
  console.log("COUNTER: fetchCount resolved =", j);
  return safeNumber(j?.value);
}

async function hitCount(){
  console.log("COUNTER: hitCount start");
  const j = await jsonp(`${COUNTER_ENDPOINT}?op=hit`);
  console.log("COUNTER: hitCount resolved =", j);
  return safeNumber(j?.value);
}

// init
(async () => {
  try{
    const initial = await fetchCount();
    renderCount(initial);
  }catch(e){
    console.log("COUNTER: init failed =", e);
    renderCount(null);
  }
})();

let cooldown = false;

huhBtn?.addEventListener("click", async () => {
  console.log("CLICK: start");

  // audio (failure ok)
  if (huhAudio){
    try{ huhAudio.currentTime = 0; await huhAudio.play(); }catch(e){ console.log("AUDIO: play failed =", e); }
  }

  if (cooldown) { console.log("CLICK: cooldown"); return; }
  cooldown = true;
  setTimeout(() => (cooldown = false), 700);

  try{
    const v = await hitCount();
    console.log("CLICK: hit result =", v);
    if (v !== null) renderCount(v);
  }catch(e){
    console.log("CLICK: hit failed =", e);
  }

  console.log("CLICK: end");
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
