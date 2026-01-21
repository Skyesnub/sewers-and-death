import { state } from './troll-helpers/state.js';
import { isPaused, pauseGame, resumeGame, toggleSettingsMenu } from './troll-helpers/paused.js';

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

console.log("Welcome to the console, my friend.")
console.log("These are all the variables you can change. To change them, simply type in state.(variable) = something.")
console.log("Here are the variables that can be changed that give you, the player, an advantage.")
console.log("playerWidth: 40, playerSize: 50, playerAnimSpeed: 10, gravity: 2, termVelo: 30, jumpVelo: 22, coyoteTime: 5, zipLineJumpConst: 15, spikeLeniency: 15")

import { loadLevel } from "./troll-helpers/loadLevel.js";
import { chooseImgToDraw } from './troll-helpers/playerDrawing.js';
import { drawLevelElements } from './troll-helpers/drawLevelElements.js';
import { detachFromZipline, checkZiplineAttachment, moveAlongZipline } from './troll-helpers/ziplines-jumping.js';
import { updateTimers } from './troll-helpers/updateTimers.js';
import { applyPhysics } from './troll-helpers/collisions.js';
import { checkSpikeCollision, death } from './troll-helpers/spike-death.js';
import { moveAndDrawKey } from './troll-helpers/key-helper.js';
import { iceDetection } from './troll-helpers/spike-death.js';
//default level is level 1
advanceLevel("lvl1")
pauseGame();

// --- Input Handlers ---
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp' && !state.dead && !state.levelTransitioning) handleJump();
  if (e.key === 'ArrowLeft' && !state.levelTransitioning) {if (!state.inputLeft) {state.curAnimSpeed = state.initAnimSpeed}; state.inputLeft = true; state.speedrunStarted = true;}
  if (e.key === 'ArrowRight' && !state.levelTransitioning) {if (!state.inputRight) {state.curAnimSpeed = state.initAnimSpeed}; state.inputRight = true; state.speedrunStarted = true;}
  if (e.key === 'ArrowUp' && state.adminMode) {state.goingUpAdmin = true; state.speedrunStarted = true;}
  if (e.key === 'ArrowDown' && state.adminMode) {state.goingDownAdmin = true; state.speedrunStarted = true;}
  if (e.key === 'h') state.hitboxes = !state.hitboxes;
  if (e.key === 'r') { state.restart.currentTime = 0; state.restart.play(); death(0); }
  if (e.key === 'a') toggleAdminMode();
  if (e.key === 't') {state.hitboxTrailOn = !state.hitboxTrailOn; state.hitboxTrail = []}
});




document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft') state.inputLeft = false; 
  if (e.key === 'ArrowRight') state.inputRight = false; 
  if (e.key === 'ArrowUp') state.goingUpAdmin = false;
  if (e.key === 'ArrowDown') state.goingDownAdmin = false;
});

async function advanceLevel(levelName) {
  if (!levelName) { levelName = prompt("Enter level ID:", "levelCustom"); }
  if (levelName) {
    state.minilevelStr = levelName;
    await loadLevel();
  }
}

async function mainLevel(number) {
  state.minilevelStr = "lvl" + String(number)
  await loadLevel();
  resumeGame();
}


//button definitions
const lvl1Btn = document.getElementById("lvl1"), lvl2Btn = document.getElementById("lvl2"), lvl3Btn = document.getElementById("lvl3"), lvl4Btn = document.getElementById("lvl4");
const lvl5Btn = document.getElementById("lvl5"), lvl6Btn = document.getElementById("lvl6"), lvl7Btn = document.getElementById("lvl7"), lvl8Btn = document.getElementById("lvl8");
const lvl9Btn = document.getElementById("lvl9"), lvl10Btn = document.getElementById("lvl10");

const restartBtn = document.getElementById("restartBtn"), changeLevelBtn = document.getElementById("switchLvl"), howToPlayBtn = document.getElementById("playInstructions"), 
quitBtn = document.getElementById("quitBtn"), outStartMenu = document.getElementById("outOfStartMenu"), settingsBtn = document.getElementById("settingsBtnPause")

const currentVolume = document.getElementById("volumeRange");
const checkBoxSpeedrunTimer = document.getElementById("speedrunTimerEnabled")


//button onclicks
lvl1Btn.onclick = () => {mainLevel(1)}; lvl2Btn.onclick = () => {mainLevel(2)}; lvl3Btn.onclick = () => {mainLevel(3)}; lvl4Btn.onclick = () => {mainLevel(4)}; lvl5Btn.onclick = () => {mainLevel(5)};
lvl6Btn.onclick = () => {mainLevel(6)}; lvl7Btn.onclick = () => {mainLevel(7)}; lvl8Btn.onclick = () => {mainLevel(8)}; lvl9Btn.onclick = () => {mainLevel(9)}; lvl10Btn.onclick = () => {mainLevel(10)};

const howtoPlayMenu = document.getElementById("howToPlayMenu")
const startMenu = document.getElementById("startMenu")
let howtoplayDisplayed = false;
let startMenuDisplayed = true;


restartBtn.onclick = () => { state.restart.play(); death(0); resumeGame(); };
changeLevelBtn.onclick = async () => { advanceLevel() };
howToPlayBtn.onclick = () => {
  howtoplayDisplayed = !howtoplayDisplayed;
  howtoPlayMenu.classList.toggle("hidden", !howtoplayDisplayed);
};
quitBtn.onclick = () => {
  startMenuDisplayed = !startMenuDisplayed
  startMenu.classList.toggle("hidden", !startMenuDisplayed);
  advanceLevel("lvl1")
  pauseGame()
}
outStartMenu.onclick = () => {
  startMenuDisplayed = !startMenuDisplayed
  startMenu.classList.toggle("hidden", !startMenuDisplayed);
  resumeGame()
}
settingsBtn.onclick = () => {
  console.log("yes the settings button will do something eventually")
  toggleSettingsMenu()
}




function handleJump() {
  const canJump = (state.isonGround || state.coyoteChecker > 0 || state.playerY + state.playerSize >= canvas.height) && !state.justJumped;
  if (state.onZipline) {
    detachFromZipline();
    state.velo = -state.jumpVelo;
    state.justJumped = true;
    state.justJumpedTimer = state.justJumpedConst;
    state.jumpSound.currentTime = 0;
    state.jumpSound.play();
  } else if (canJump) {
    state.velo = -state.jumpVelo;
    state.justJumped = true;
    state.justJumpedTimer = state.justJumpedConst;
    state.jumpSound.currentTime = 0;
    state.jumpSound.play();
  }
}

function toggleAdminMode() {
  if (!state.adminMode) {
    state.attemptedAdminPWD = prompt("Enter admin password:");
    if (state.attemptedAdminPWD === state.adminPassword) {
      state.adminMode = true;
      state.adminModeSound.currentTime = 0;
      state.adminModeSound.play();
    }
  } else state.adminMode = false;
}

function handleVolumeAndSpeedrun() {
  state.currentVolume = currentVolume.value;

  state.speedrunTimerExists = checkBoxSpeedrunTimer.checked


  //console.log(state.currentVolume)

  state.leMeow.volume = state.currentVolume/100
  state.vineBoom.volume = state.currentVolume/100
  state.leScream.volume = state.currentVolume/100
  state.restart.volume = state.currentVolume/100
  state.adminModeSound.volume = state.currentVolume/100
  state.finishLevelSound.volume = state.currentVolume/100
  state.jumpSound.volume = state.currentVolume/100
}




// --- Main Animation Loop ---
function animate() {
  requestAnimationFrame(animate);

  //Change volume based on slider and all assets based on it
  handleVolumeAndSpeedrun()

  if (isPaused()) return;

  drawLevelElements()

  // Admin Mode movement
  if (state.adminMode) {
    state.velo = -state.gravity;
    if (state.goingDownAdmin) state.playerY += state.playerAnimSpeed;
    if (state.goingUpAdmin) state.playerY -= state.playerAnimSpeed;
  }

  // Timers for jump cooldown and zipline jump off cooldown
  updateTimers()

  // Physics update
  if (!state.onZipline) applyPhysics();

  // Zipline attachment
  if (!state.onZipline && !state.adminMode) checkZiplineAttachment();

  // Zipline movement
  if (state.onZipline && state.currentZipline) moveAlongZipline();

  // Spike collision
  if (!state.adminMode) checkSpikeCollision();

  iceDetection();

  //draw end key
  moveAndDrawKey();

  if (state.levelTransitioning) {state.inputLeft = false; state.inputRight = false;}


  if (state.keyAnimationFinished && !state.levelLoading) {
    state.levelLoading = true;

    let nextLevel = state.minilevelStr;

    if (nextLevel === "lvl1") nextLevel = "lvl2";
    else if (nextLevel === "lvl2") nextLevel = "lvl3";
    else if (nextLevel === "lvl3") nextLevel = "lvl4";
    else if (nextLevel === "lvl4") nextLevel = "lvl5";
    else if (nextLevel === "lvl5") nextLevel = "lvl6";
    else if (nextLevel === "lvl6") nextLevel = "lvl7";
    else if (nextLevel === "lvl7") nextLevel = "lvl8";
    else if (nextLevel === "lvl8") nextLevel = "lvl9";
    else if (nextLevel === "lvl9") nextLevel = "lvl10";

    state.keyAnimationFinished = false;

    advanceLevel(nextLevel).then(() => {
      state.levelLoading = false;
    });
  }




  if (state.speedrunTimerExists) {
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(Math.round(state.speedrunTimer * 100)/100, 1300, 50, 999, 999)
  }


  // Draw player
  chooseImgToDraw();
}

animate();
