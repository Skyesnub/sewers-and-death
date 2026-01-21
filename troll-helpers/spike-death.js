import { state } from "./state.js"

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

export function checkSpikeCollision() {
  const playerLeft = state.playerX + state.playerHitbox.offsetX;
  const playerRight = playerLeft + state.playerHitbox.width;
  const playerTop = state.playerY + state.playerHitbox.offsetY;
  const playerBottom = playerTop + state.playerHitbox.height;

  for (const spike of state.spikes) {
    const sLeft = spike.x + state.spikeLeniency;
    const sRight = spike.x + spike.size - state.spikeLeniency;
    const sTop = spike.y + state.spikeLeniency;
    const sBottom = spike.y + spike.size - state.spikeLeniency;

    if (playerRight > sLeft && playerLeft < sRight && playerBottom > sTop && playerTop < sBottom && !state.levelTransitioning) {
      death(1);
      break;
    }
  }
}

export function iceDetection() {
  const playerLeft = state.playerX + state.playerHitbox.offsetX;
  const playerRight = playerLeft + state.playerHitbox.width;
  const playerTop = state.playerY + state.playerHitbox.offsetY;
  const playerBottom = playerTop + state.playerHitbox.height;

  for (const block of state.blocks) {
    const hitboxLeft = block.x
    const hitboxRight = block.x + 50
    const hitboxTop = block.y - 5
    const hitboxBottom = block.y
    if (playerRight > hitboxLeft && playerLeft < hitboxRight && playerBottom > hitboxTop && playerTop < hitboxBottom) {
      if (block.material === "ice") {
        state.slipping = true;
      }
      if (block.material === "block") {
        state.slipping = false;
      }
    }

  }
  if (playerBottom > canvas.height - 10) {state.slipping = false;}
}

// --- Death Helper ---
export function death(makeSound) {
  if (state.dead) {
    state.inputLeft = state.inputRight = false;
    return;
  }

  const randomSound = Math.floor(Math.random() * 3) + 1;
  state.dead = true;
  state.deadDirection = null;
  state.Img1_2_3Dead = 1;
  state.player_switchIMG_timerDead = state.player_switchIMG_constDead;
  if (makeSound === 1) {
    if (randomSound === 2) {state.vineBoom.currentTime = 0; state.vineBoom.play();}
    else if (randomSound === 3) {state.leScream.currentTime = 0; state.leScream.play();}
    else {state.leMeow.currentTime = 0; state.leMeow.play();}
  }
}