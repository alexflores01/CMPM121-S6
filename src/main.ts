const app = document.querySelector<HTMLElement>("#app")!;

// Game state: unchanged from step 2.
let cobblestoneCount = 0;

// Pickaxe upgrades as data, one entry per type. "rate" is cobblestone
// gained per second by each owned pickaxe; counts start at 0.
interface Pickaxe {
  name: string;
  cost: number;
  rate: number;
  count: number;
}

const pickaxes: Pickaxe[] = [
  { name: "Wooden", cost: 10, rate: 1, count: 0 },
  { name: "Stone", cost: 50, rate: 5, count: 0 },
  { name: "Iron", cost: 250, rate: 20, count: 0 },
  { name: "Diamond", cost: 1000, rate: 100, count: 0 },
];

// Total cobblestone per second: summed owned x rate of every pickaxe.
function totalRate(): number {
  return pickaxes.reduce((sum, pickaxe) => sum + pickaxe.count * pickaxe.rate, 0);
}

// Page layout: counter and per-second rate side by side at the top.
const counterRow = document.createElement("div");
counterRow.className = "counter-row";

const counterLabel = document.createElement("p");
counterLabel.className = "counter";
counterLabel.textContent = `Cobblestone: ${cobblestoneCount}`;

const rateLabel = document.createElement("span");
rateLabel.className = "rate-label";
rateLabel.textContent = `Per second: ${totalRate()}`;

counterRow.append(counterLabel, rateLabel);

function updateDisplay() {
  counterLabel.textContent = `Cobblestone: ${cobblestoneCount}`;
  rateLabel.textContent = `Per second: ${totalRate()}`;
  for (const refresh of refreshUpgrades) refresh();
}

// A single rounded scene box; overflow is hidden so particles stay clipped.
const scene = document.createElement("div");
scene.className = "scene";

// Landscape, drawn with CSS only: sun, blocky clouds, grass and dirt.
const sun = document.createElement("div");
sun.className = "sun";
scene.append(sun);

for (const variant of ["cloud-a", "cloud-b", "cloud-c"]) {
  const cloud = document.createElement("div");
  cloud.className = `cloud ${variant}`;
  scene.append(cloud);
}

const grass = document.createElement("div");
grass.className = "grass";
scene.append(grass);

const dirt = document.createElement("div");
dirt.className = "dirt";
scene.append(dirt);

// Wrapper that centers the cobblestone block inside the scene box.
const blockWrap = document.createElement("div");
blockWrap.className = "block-wrap";
scene.append(blockWrap);

// The mine button becomes the cobblestone block itself; the id is kept.
const mineBlock = document.createElement("button");
mineBlock.id = "mine-button";
mineBlock.className = "cobblestone";
mineBlock.type = "button";
mineBlock.setAttribute("aria-label", "Mine cobblestone");
blockWrap.append(mineBlock);

mineBlock.addEventListener("click", () => {
  cobblestoneCount += 1;
  updateDisplay();
  playBreak(mineBlock);
});

// Per-second income: one tick per second adds the total rate.
setInterval(() => {
  cobblestoneCount += totalRate();
  updateDisplay();
}, 1000);

// On click: shake + shrink the block, fling gray square particles outward.
function playBreak(block: HTMLElement) {
  block.classList.remove("breaking");
  void block.offsetWidth; // force reflow so rapid clicks restart the animation
  block.classList.add("breaking");

  for (let i = 0; i < 10; i++) {
    const particle = document.createElement("span");
    particle.className = "particle";
    const angle = Math.random() * Math.PI * 2;
    const distance = 56 + Math.random() * 48;
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.animationDelay = `${Math.random() * 60}ms`;
    blockWrap.append(particle);
    particle.addEventListener("animationend", () => particle.remove());
  }
}

// Upgrades list below the scene box: one button per pickaxe type, built
// from the data array. Each keeps a refresh callback for labels + affordability.
const upgrades = document.createElement("div");
upgrades.className = "upgrades";

const refreshUpgrades: (() => void)[] = [];

for (const pickaxe of pickaxes) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "upgrade";

  function refresh() {
    button.textContent =
      `${pickaxe.name} - ${pickaxe.cost} - x${pickaxe.count} - +${pickaxe.rate}/sec`;
    button.disabled = cobblestoneCount < pickaxe.cost;
  }

  button.addEventListener("click", () => {
    if (cobblestoneCount < pickaxe.cost) return; // cannot afford
    cobblestoneCount -= pickaxe.cost;
    pickaxe.count += 1;
    updateDisplay();
  });

  refreshUpgrades.push(refresh);
  upgrades.append(button);
}

updateDisplay();

app.append(counterRow, scene, upgrades);
