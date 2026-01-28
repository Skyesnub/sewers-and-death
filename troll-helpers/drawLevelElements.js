import { state } from "./state.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

export function drawLevelElements() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Background
  if (state.backgroundImage) ctx.drawImage(state.backgroundImage, 0, 0, canvas.width, canvas.height);



  // --- Draw Decorations ---
  for (const d of state.deco) {
    if (d.variant === 1) {
      if (state.levelPhase === 'heaven') {
        ctx.drawImage(state.heavenDecoBlockTexture, d.x, d.y, 50, 50)
      }
      if (state.levelPhase === 'sewer') {
        ctx.drawImage(state.decoBlockTexture, d.x, d.y, 50, 50)
      }
    }
    if (d.variant === 2) {
      if (state.levelPhase === 'sewer') {
        ctx.drawImage(state.decoBlockTexture2, d.x, d.y, 50, 50)
      }
      if (state.levelPhase === 'heaven') {
        ctx.drawImage(state.heavenDecoBlockTexture2, d.x, d.y, 50, 50)
      }
    }
  }

 

  // --- Draw spikes ---

  console.log(state.levelPhase)
  if (state.levelPhase === 'sewer') {
    for (const spike of state.spikes) {
      switch(spike.orientation) {
        case 1: ctx.drawImage(state.spike1, spike.x, spike.y, 50, 50); break;
        case 2: ctx.drawImage(state.spike2, spike.x, spike.y, 50, 50); break;
        case 3: ctx.drawImage(state.spike3, spike.x, spike.y, 50, 50); break;
        case 4: ctx.drawImage(state.spike4, spike.x, spike.y, 50, 50); break;
      }
    }
  }
  if (state.levelPhase === 'heaven') {
    for (const spike of state.spikes) {
      switch(spike.orientation) {
        case 1: ctx.drawImage(state.heavenspike1, spike.x, spike.y, 50, 50); break;
        case 2: ctx.drawImage(state.heavenspike2, spike.x, spike.y, 50, 50); break;
        case 3: ctx.drawImage(state.heavenspike3, spike.x, spike.y, 50, 50); break;
        case 4: ctx.drawImage(state.heavenspike4, spike.x, spike.y, 50, 50); break;
      }
    }
  }

  // --- Draw blocks ---
  for (const block of state.blocks) {
 
    if (block.material === 'block') { 
      if (state.levelPhase === 'sewer') {
       {ctx.drawImage(state.blockTexture, block.x, block.y, 50, 50);}
      }
      if (state.levelPhase === 'heaven') {
       {ctx.drawImage(state.heavenBlockTexture, block.x, block.y, 50, 50);}
      }
    }
    if (block.material === 'ice') {ctx.drawImage(state.iceBlockTexture, block.x, block.y, 50, 50);}
  }

  //drawing clouds (moved outside of main loop because of layring issue)

  for (const block of state.blocks) {
    if (block.material === 'cloud') {
      if (block.variant === 1) {ctx.drawImage(state.cloud1Texture, block.x - 10, block.y - 35, 60, 85)}
      if (block.variant === 2) {ctx.drawImage(state.cloud2Texture, block.x, block.y - 35, 50, 85)}
      if (block.variant === 3) {ctx.drawImage(state.cloud3Texture, block.x, block.y - 35, 60, 85)}
    }
  }

 // --- Draw ziplines ---
  for (const zipline of state.ziplines) {
    if (state.levelPhase === 'sewer') {ctx.strokeStyle = '#7d7d7dff'}
    if (state.levelPhase === 'heaven') {ctx.strokeStyle = '#3754b4ff'}

    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(zipline.pt1X, zipline.pt1Y);
    ctx.lineTo(zipline.pt2X, zipline.pt2Y);
    ctx.stroke();
  }
  if (state.hitboxTrailOn) {
    state.hitboxTrail.push({
      x: state.playerX,
      y: state.playerY
    });    
  state.hitboxTrail.forEach(pos => {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      pos.x + state.playerHitbox.offsetX,
      pos.y + state.playerHitbox.offsetY,
      state.playerHitbox.width,
      state.playerHitbox.height
    );
  });
  }
  if (state.hitboxes) {
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      state.playerX + state.playerHitbox.offsetX,
      state.playerY + state.playerHitbox.offsetY,
      state.playerHitbox.width,
      state.playerHitbox.height
    );
    // --- Draw spike hitboxes ---
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    state.spikes.forEach(spike => {
      ctx.strokeRect(
        spike.x + state.spikeLeniency,
        spike.y + state.spikeLeniency,
        spike.size - state.spikeLeniency * 2,
        spike.size - state.spikeLeniency * 2
      );
    });
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    state.blocks.forEach(block => {
      if (block.material === 'cloud') {
        if (block.variant === 1) {ctx.strokeRect (block.x + 10, block.y + 25, 40, 20)}
        if (block.variant === 2) {ctx.strokeRect (block.x, block.y + 25, 50, 20)}
        if (block.variant === 3) {ctx.strokeRect (block.x, block.y + 25, 40, 20)}
      }
      else {
        ctx.strokeRect (block.x, block.y, 50, 50)
      }
    });
  }


}