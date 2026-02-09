const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

import { state } from "./state.js"
import { loadLevel } from "./loadLevel.js"

export async function handleHeavenAnim() {
  state.heavenAnimTimer++;


  if (state.heavenAnimTimer > 90) {
    state.heavenAnimStarted = false;
    state.heavenAnimFinished = true;
    state.minilevelStr = "lvl11";
    await loadLevel();
    return;
  }

  const size = state.playerIMGSize * 1.5;
  const cx = state.heavenAnimPlayerX + size / 2;
  const cy = state.heavenAnimPlayerY + size / 2;

  ctx.save();

  // move origin to player center
  ctx.translate(cx, cy);

  // rotate
  ctx.rotate(state.playerRotation);

  // draw centered
  ctx.drawImage(state.player_glow, -size / 2, -size / 2, size, size);
  ctx.drawImage(state.PstandStill, -size / 2, -size / 2, size, size);
  //restore
  ctx.restore();

  // update motion
  if (state.heavenAnimTimer > 15) {
    state.playerRotation += 0.2; // radians per frame
    state.heavenAnimPlayerY -= 15;
  }
  //actual player falls through floor
  state.playerY += 5
}



