const screens = document.querySelectorAll(".screen");
const navButtons = document.querySelectorAll(".bottom-nav button");
const earnButtons = document.querySelectorAll(".earn-btn");
const redeemButtons = document.querySelectorAll(".redeem-btn");
const chips = document.querySelectorAll(".chip");
const progressBars = document.querySelectorAll(".progress-bar");
const celebration = document.getElementById("celebration");
const rewardText = document.getElementById("reward-text");

function showScreen(targetId) {
  screens.forEach((screen) => {
    screen.classList.toggle("active-screen", screen.id === targetId);
  });
}

function showCelebration(message) {
  rewardText.textContent = message;
  celebration.classList.remove("hidden");
  celebration.classList.add("show");
  setTimeout(() => {
    celebration.classList.add("hidden");
    celebration.classList.remove("show");
  }, 1400);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => showScreen(button.dataset.target));
});

earnButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCelebration(`You earned +${button.dataset.coins} coins!`);
  });
});

redeemButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showCelebration("Reward redeemed! Ask a parent to confirm ✅");
  });
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    chip.classList.toggle("selected");
  });
});

progressBars.forEach((bar) => {
  const complete = Number(bar.dataset.complete || 0);
  const total = Number(bar.dataset.total || 1);
  const width = total > 0 ? (complete / total) * 100 : 0;
  bar.style.width = `${Math.max(0, Math.min(100, width))}%`;
});
