import { state } from "./state.js"

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

export function chooseImgToDraw() {
  const drawOffsetX = 0;
  const drawOffsetY = 0;

  // Glow
  if (!state.heavenAnimStarted) {
    ctx.drawImage(state.player_glow, state.playerX - drawOffsetX - 3, state.playerY - drawOffsetY, state.playerIMGSize, state.playerIMGSize);
  }
  
  // Alive animation
  state.player_switchIMG_timerAlive -= 1;
  if (state.player_switchIMG_timerAlive < 0) {
    state.Img1_2Alive = state.Img1_2Alive === 1 ? 2 : 1;
    state.player_switchIMG_timerAlive = state.player_switchIMG_constAlive;
  }

  let img;
  if (!state.dead) {
    state.playerIMGSize = 60;
    if (state.inputRight && !state.inputLeft) img = state.Img1_2Alive === 1 ? state.PRightImg1 : state.PRightImg2;
    else if (state.inputLeft && !state.inputRight) img = state.Img1_2Alive === 1 ? state.PLeftImg1 : state.PLeftImg2;
    else img = state.PstandStill;
  } else {
    state.player_switchIMG_timerDead -= 1;
    if (state.player_switchIMG_timerDead < 0) {
      if (state.Img1_2_3Dead === 1) state.Img1_2_3Dead = 2;
      else if (state.Img1_2_3Dead === 2) state.Img1_2_3Dead = 3;
      else if (state.Img1_2_3Dead === 3) state.Img1_2_3Dead = 4;
      else if (state.Img1_2_3Dead === 4) resetAfterDeath();
      state.player_switchIMG_timerDead = state.player_switchIMG_constDead;
    }

    if (state.deadDirection === null) {
      state.deadDirection = state.inputRight && !state.inputLeft ? 1 :
                            state.inputLeft && !state.inputRight ? 2 : 1;
    }

    img = state.deadDirection === 1
          ? (state.Img1_2_3Dead === 1 ? state.PDeathR1 :
             state.Img1_2_3Dead === 2 ? state.PDeathR2 : 
             state.Img1_2_3Dead === 3 ? state.PDeathR3 : state.PDeathR4)
          : (state.Img1_2_3Dead === 1 ? state.PDeathL1 :
             state.Img1_2_3Dead === 2 ? state.PDeathL2 : 
             state.Img1_2_3Dead === 3 ? state.PDeathL3: state.PDeathL4);



  }
  if (!state.heavenAnimStarted) {
    ctx.drawImage(img, state.playerX - drawOffsetX, state.playerY - drawOffsetY, state.playerIMGSize, state.playerIMGSize);
  }
}

function resetAfterDeath() {
  state.dead = false;
  state.deadDirection = null;
  state.playerX = state.startX;
  state.playerY = state.startY;
  state.velo = 0;
  state.onZipline = false;
  state.currentZipline = null;
  state.keyCollected = false;
  state.keySize = 100;
  state.keyX = state.keyStartX;
  state.keyY = state.keyStartY;
  state.levelTransitioning = false;
  state.hitboxTrail = [];
  state.speedrunTimer = 0;
  state.speedrunStarted = false;
  state.momentum = 0;
  state.playerIMGSize = 60;

  state.ziplines.forEach(zip => {
    zip.justJumpedOff = false;
    zip.jumpOffTimer = 0;
    zip.cooldown = 0;
  });

  state.blocks.forEach(block => {
    block.trolledYet = false;
    block.doneMoving = false;

    if (block.material === 'cloud') {
      block.momentum = 0;
      block.x = block.originalX
      block.y = block.originalY
    }
  });
}