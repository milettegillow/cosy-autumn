const CHIPS = [
  { id: "candles", label: "Candles lit", points: 12, slot: "candle" },
  { id: "chocolate", label: "Hot chocolate", points: 12, slot: "mug" },
  { id: "soup", label: "Soup", points: 10, slot: "soup" },
  { id: "bread", label: "Crusty bread", points: 5 },
  { id: "cat", label: "Cat on lap", points: 15, slot: "cat" },
  { id: "socks", label: "Fluffy socks", points: 10, slot: "socks" },
  { id: "blanket", label: "Knitted blanket", points: 12, slot: "blanket" },
  { id: "rain", label: "Rain on the window", points: 10 },
  { id: "book", label: "A good book", points: 8 },
  { id: "fairy", label: "Fairy lights", points: 6 },
  { id: "pyjamas", label: "Pyjamas by 5pm", points: 8 },
  { id: "bath", label: "Just had a bath", points: 8 },
  { id: "oven", label: "Something in the oven", points: 10 },
  { id: "jumper", label: "Woolly jumper", points: 8 },
  { id: "mulled", label: "Mulled wine", points: 10 },
  { id: "dog", label: "Dog asleep on your feet", points: 12 },
  { id: "boardGame", label: "Board game out", points: 6 },
  { id: "xmasFilm", label: "Christmas film in November", points: 5 },
  { id: "hotWaterBottle", label: "Hot water bottle", points: 8 },
  { id: "crumpets", label: "Crumpets", points: 8 },
  { id: "leaves", label: "Leaves crunching outside", points: 4 },
  { id: "nowhere", label: "Nowhere to be tomorrow", points: 15 },

  { id: "bigLight", label: "The big light is on", points: -20 },
  { id: "emails", label: "Work emails open", points: -25 },
  { id: "doorbell", label: "Doorbell just went", points: -15 },
  { id: "jeans", label: "Wearing jeans", points: -12 },
  { id: "phone", label: "Phone on 2%", points: -10 },
  { id: "drilling", label: "Neighbour is drilling", points: -15 },
  { id: "wetSocks", label: "Wet socks", points: -18 },
  { id: "diningChair", label: "Sitting on a dining chair", points: -8 },
  { id: "hike", label: "Group chat is planning a hike", points: -12 },
  { id: "radiator", label: "Radiator stone cold", points: -20 },
  { id: "tax", label: "Tax return due", points: -25 },
  { id: "landlord", label: "Landlord inspection tomorrow", points: -15 },
];

const COMBOS = [
  { when: (on) => on.soup && !on.bread, text: "Soup but no bread", points: -15 },
  { when: (on) => on.cat && on.blanket, text: "Cat has claimed the blanket", points: 10 },
  { when: (on) => on.bigLight && on.candles, text: "The big light cancels the candles", points: -10 },
  { when: (on) => on.chocolate && on.soup, text: "Two hot liquids. Pace yourself", points: -5 },
  { when: (on) => on.socks && on.jeans, text: "Fluffy socks with jeans. Bold", points: -5 },
  { when: (on) => on.cat && on.emails, text: "Cat is sitting on the keyboard", points: 5 },
  { when: (on) => on.dog && on.cat, text: "Dog and cat have reached a truce", points: 10 },
  { when: (on) => on.mulled && on.chocolate, text: "One hot drink in each hand", points: 5 },
  { when: (on) => on.socks && on.wetSocks, text: "Fluffy socks, but wet", points: -10 },
  { when: (on) => on.phone && on.emails, text: "The emails will die with the phone", points: 10 },
  { when: (on) => on.crumpets && on.bread, text: "Carb lock-in achieved", points: 8 },
  { when: (on) => on.xmasFilm && on.nowhere, text: "That's three Christmas films now", points: 6 },
  { when: (on) => on.radiator && on.bigLight, text: "Interrogation room", points: -10 },
  { when: (on) => on.bath && on.pyjamas, text: "Fresh pyjamas after a bath", points: 8 },
  { when: (on) => on.hike && on.nowhere, text: "Not any more you don't", points: -15 },
  { when: (on) => on.tax && on.rain, text: "The rain feels ominous now", points: -5 },
  { when: (on) => on.drilling && on.book, text: "Same paragraph six times", points: -8 },
  { when: (on) => on.dog && on.doorbell, text: "Dog has woken up. Everyone has woken up", points: -15 },
];

const TIERS = [
  [100, "Hygge overlord"],
  [76, "Absolutely toasted"],
  [56, "Hobbit-adjacent"],
  [36, "Mildly snug"],
  [16, "Slightly damp"],
  [0, "Hostile"],
];

// Page-wide effects switched on by particular chips
const AMBIENT = { rain: "rain-on", fairy: "fairy-on", bigLight: "big-light-on" };

const on = {};
const main = document.querySelector("main");
const hearth = document.querySelector(".hearth");
const scoreEl = document.getElementById("score");
const tierEl = document.getElementById("tier");
const chipsEl = document.getElementById("chips");
const combosEl = document.getElementById("combos");

// Hide any mantel slot whose image hasn't been added yet
document.querySelectorAll(".slot img").forEach((img) => {
  const hide = () => { img.closest(".slot").hidden = true; };
  img.addEventListener("error", hide);
  if (img.complete && img.naturalWidth === 0) hide();
});

// Fairy lights: bulbs hung along the same curve as the SVG string
const fairyEl = document.querySelector(".fairy-lights");
const BULBS = 24;
for (let i = 0; i < BULBS; i++) {
  const t = (i + 0.5) / BULBS;
  const bulb = document.createElement("span");
  bulb.className = "bulb";
  bulb.style.left = `${t * 100}%`;
  // quadratic from (0,0) via control (50,20) to (100,0) peaks at 10 of 10 units
  bulb.style.top = `${4 * t * (1 - t) * 100}%`;
  bulb.style.animationDelay = `${(-Math.random() * 2.2).toFixed(2)}s`;
  fairyEl.appendChild(bulb);
}

CHIPS.forEach((chip) => {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `chip ${chip.points > 0 ? "cosy" : "not-cosy"}`;
  btn.textContent = chip.label;
  btn.setAttribute("aria-pressed", "false");
  btn.addEventListener("click", () => {
    on[chip.id] = !on[chip.id];
    btn.setAttribute("aria-pressed", String(on[chip.id]));
    update();
  });
  chipsEl.appendChild(btn);
});

let shownScore = 0;
let countFrame = null;

function countTo(target) {
  cancelAnimationFrame(countFrame);
  const start = shownScore;
  const duration = 600;
  let startTime = null;
  const step = (now) => {
    if (startTime === null) startTime = now;
    const t = Math.max(0, Math.min((now - startTime) / duration, 1));
    const eased = 1 - Math.pow(1 - t, 3);
    shownScore = Math.round(start + (target - start) * eased);
    scoreEl.textContent = shownScore;
    if (t < 1) countFrame = requestAnimationFrame(step);
  };
  countFrame = requestAnimationFrame(step);
}

function flameScale(score) {
  if (score <= 0) return 0;
  if (score >= 100) return 1.75;
  return 0.25 + ((score - 1) / 98) * 0.75;
}

function update() {
  let score = 0;
  CHIPS.forEach((chip) => { if (on[chip.id]) score += chip.points; });

  const activeCombos = COMBOS.filter((combo) => combo.when(on));
  activeCombos.forEach((combo) => { score += combo.points; });
  score = Math.max(0, Math.min(100, score));

  combosEl.replaceChildren(...activeCombos.map((combo) => {
    const li = document.createElement("li");
    const sign = combo.points > 0 ? "+" : "-";
    li.textContent = `${combo.text}: ${sign}${Math.abs(combo.points)}`;
    return li;
  }));

  CHIPS.forEach((chip) => {
    if (!chip.slot) return;
    const slot = document.querySelector(`.slot[data-item="${chip.slot}"]`);
    if (slot) slot.classList.toggle("is-on", !!on[chip.id]);
  });

  Object.entries(AMBIENT).forEach(([id, cls]) => {
    document.body.classList.toggle(cls, !!on[id]);
  });

  hearth.style.setProperty("--flame-scale", flameScale(score));
  hearth.style.setProperty("--flicker", (score / 100).toFixed(2));
  hearth.classList.toggle("lit", score > 0);
  main.classList.toggle("shake", score === 100);

  tierEl.textContent = TIERS.find(([min]) => score >= min)[1];
  currentScore = score;
  countTo(score);
}

// ---------- Sharing ----------

const SITE_URL = "https://cosy-autumn.milettegillow.com";
const shareBtn = document.getElementById("share");
const shareLabel = shareBtn.textContent;
let currentScore = 0;
let copiedTimer = null;

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
}

shareBtn.addEventListener("click", async () => {
  const text = `I'm ${currentScore}% cosy - ${tierEl.textContent}. How cosy are you? ${SITE_URL}`;

  if (navigator.share) {
    try {
      await navigator.share({ text });
      return;
    } catch (err) {
      if (err.name === "AbortError") return;
    }
  }

  try {
    await copyText(text);
    shareBtn.textContent = "Copied";
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => { shareBtn.textContent = shareLabel; }, 2000);
  } catch {
    // Nothing more we can do without clipboard access
  }
});

update();
