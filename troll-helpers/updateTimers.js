import { state } from "./state.js";

export function updateTimers() {
  // Update jump & zipline timers
  if (state.justJumped) { 
    state.justJumpedTimer--; 
    if (state.justJumpedTimer <= 0) state.justJumped = false; 
  }

  state.ziplines.forEach(zip => {
    if (zip.justJumpedOff) {
      zip.jumpOffTimer--;
      if (zip.jumpOffTimer <= 0) {
        zip.justJumpedOff = false;
        zip.cooldown = 15; // extra buffer before reattachment
      }
    }
    if (zip.cooldown > 0) zip.cooldown--;
  });

  if (state.speedrunStarted) {
    state.speedrunTimer += 0.016666666
  }
}