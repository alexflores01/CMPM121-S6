const app = document.querySelector<HTMLElement>("#app")!;

// Game state: unchanged from step 2.
let cobblestoneCount = 0;

// Page layout: counter label at the top of the contained layout.
const counterLabel = document.createElement("p");
counterLabel.className = "counter";
counterLabel.textContent = `Cobblestone: ${cobblestoneCount}`;

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
  counterLabel.textContent = `Cobblestone: ${cobblestoneCount}`;
  playBreak(mineBlock);
});

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

// Reserved room below the scene box for the upgrade list coming later.
const upgrades = document.createElement("div");
upgrades.className = "upgrades";

app.append(counterLabel, scene, upgrades);
