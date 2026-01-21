import { state } from "./state.js";

export let paused = false;

const pauseMenu = document.getElementById("pauseMenu");
const resumeBtn = document.getElementById("resumeBtn");
const settingsMenuEl = document.getElementById("settingsMenu");

export function isPaused() {
  return paused;
}

export function pauseGame() {
  paused = true;
  pauseMenu.classList.remove("hidden");
}

export function resumeGame() {
  paused = false;
  pauseMenu.classList.add("hidden");
  if (state.settingsMenuOpen) {toggleSettingsMenu()}
}

resumeBtn.onclick = resumeGame;

export function toggleSettingsMenu() {
  state.settingsMenuOpen = !state.settingsMenuOpen;
  settingsMenuEl.classList.toggle("hidden", !state.settingsMenuOpen);
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    paused ? resumeGame() : pauseGame();
  }
});
