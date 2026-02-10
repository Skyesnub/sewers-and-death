import { state } from "./state.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
import { death } from './spike-death.js';


export function applyPhysics() {
  if(!state.dead) {
    const prevX = state.playerX, prevY = state.playerY;

    // Gravity
    state.velo = Math.min(state.velo + state.gravity, state.termVelo);
    if (!state.slipping) {
      if (state.momentum > 0) {state.momentum -= state.xAcceleration}
      if (state.momentum < 0) {state.momentum += state.xAcceleration}
      
      state.playerAnimSpeed = 10
    }
    if (state.slipping && state.isonGround) {
      if (state.inputLeft) {state.momentum -= state.xAcceleration}
      if (state.inputRight) {state.momentum += state.xAcceleration}
      state.playerAnimSpeed = 5
    }
    if (!state.isonGround) {
      if (state.momentum > 0) {state.momentum -= state.xAcceleration}
      if (state.momentum < 0) {state.momentum += state.xAcceleration}
      state.playerAnimSpeed = 10
    }
    if (state.collisionLeft || state.collisionRight) {state.momentum = 0}

    // Calculate intended movement
    let dx = (state.inputRight ? state.playerAnimSpeed + state.momentum : state.momentum) - (state.inputLeft ? state.playerAnimSpeed - state.momentum : -state.momentum);
    let dy = state.velo;

    // Try to move and handle collisions
    const newPos = handleCollisions(prevX, prevY, dx, dy);
    state.playerX = newPos.x;
    state.playerY = newPos.y;
    state.velo = newPos.velo;
    state.isonGround = newPos.onGround;

    // Floor
    if (state.playerY + state.playerSize >= canvas.height) {
      //so during heaven anim player can fall through floor
      if (!state.heavenAnimStarted) {
        state.playerY = canvas.height - state.playerSize;
      }
      state.velo = 0;
      state.isonGround = true;
    }

    // Coyote time
    state.coyoteChecker = state.isonGround ? state.coyoteTime : Math.max(0, state.coyoteChecker - 1);
  }
}

function handleCollisions(startX, startY, dx, dy) {
  let newX = startX;
  let newY = startY;
  let newVelo = state.velo;
  let onGround = false;

  state.collisionLeft = state.collisionRight = false;

  const playerHitbox = () => ({
    left: newX + state.playerHitbox.offsetX,
    right: newX + state.playerHitbox.offsetX + state.playerHitbox.width,
    top: newY + state.playerHitbox.offsetY,
    bottom: newY + state.playerHitbox.offsetY + state.playerHitbox.height
  });

  // --- Horizontal movement ---
  newX += dx;
  for (const block of state.blocks) {
    let blockBox = { left: block.x, right: block.x + 50, top: block.y, bottom: block.y + 50 };
    if (block.material === 'cloud') {
      if (block.variant === 1) {blockBox = {left: block.x + 10, right: block.x + 50, top: block.y + 25, bottom: block.y + 45 };}
      else if (block.variant === 2) {blockBox = {left: block.x, right: block.x + 50, top: block.y + 25, bottom: block.y + 45 };}
      else if (block.variant === 3) {blockBox = {left: block.x, right: block.x + 40, top: block.y + 25, bottom: block.y + 45 };}
    }
    const hb = playerHitbox();

    

    if (hb.right > blockBox.left && hb.left < blockBox.right && hb.bottom > blockBox.top && hb.top < blockBox.bottom) {
      if (dx > 0) { // moving right
        newX = blockBox.left - state.playerHitbox.offsetX - state.playerHitbox.width;
        state.collisionRight = true;
      } else if (dx < 0) { // moving left
        newX = blockBox.right - state.playerHitbox.offsetX;
        state.collisionLeft = true;
      }
    }

  }

  // --- Vertical movement ---
  newY += dy;
  for (const block of state.blocks) {
    let blockBox = { left: block.x, right: block.x + 50, top: block.y, bottom: block.y + 50 };
    if (block.material === 'cloud') {
      if (block.variant === 1) {blockBox = {left: block.x + 10, right: block.x + 50, top: block.y + 25, bottom: block.y + 45 };}
      else if (block.variant === 2) {blockBox = {left: block.x, right: block.x + 50, top: block.y + 25, bottom: block.y + 45 };}
      else if (block.variant === 3) {blockBox = {left: block.x, right: block.x + 40, top: block.y + 25, bottom: block.y + 45 };}
    }
    const hb = playerHitbox();

    if (hb.right > blockBox.left && hb.left < blockBox.right && hb.bottom > blockBox.top && hb.top < blockBox.bottom) {
      if (dy > 0) { // falling
        newY = blockBox.top - state.playerHitbox.offsetY - state.playerHitbox.height;
        newVelo = 0;
        onGround = true;
      } else if (dy < 0) { // jumping
        newY = blockBox.bottom - state.playerHitbox.offsetY;
        newVelo = 0;
      }
    }
  }
  const hb = playerHitbox();

  if (hb.left < 0) {
    newX = -state.playerHitbox.offsetX;
    state.collisionLeft = true;
  }

  if (hb.right > canvas.width) {
    newX = canvas.width - state.playerHitbox.offsetX - state.playerHitbox.width;
    state.collisionRight = true;
  }

  if (hb.top < 0) {
      newY = 0 - state.playerHitbox.offsetY;  
      newVelo = 0;                          
  }

  return { x: newX, y: newY, velo: newVelo, onGround };
  
}

export function updateClouds() {
  const groups = new Map();

  // --- Build cloud groups ---
  for (const b of state.blocks) {
    if (b.material !== 'cloud') continue;

    if (!groups.has(b.cloudGroupId)) {
      groups.set(b.cloudGroupId, []);
    }
    groups.get(b.cloudGroupId).push(b);

    // Ensure each cloud has originalY and momentum
    b.originalY ??= b.y;
    b.momentum ??= 0;
  }

  // --- Player hitbox ---
  const hb = {
    left: state.playerX + state.playerHitbox.offsetX,
    right: state.playerX + state.playerHitbox.offsetX + state.playerHitbox.width,
    top: state.playerY + state.playerHitbox.offsetY,
    bottom: state.playerY + state.playerHitbox.offsetY + state.playerHitbox.height
  };

  // --- Process each cloud group ---
  for (const clouds of groups.values()) {
    const prevY = clouds[0].y;
    let groupMomentum = clouds[0].momentum;

    clouds[0].wasPlayerOnTop ??= false;
    let playerOnTopNow = false;

    // --- Collision / standing detection ---
    for (const c of clouds) {
      let horizontalOverlap = hb.right > c.x + 10 && hb.left < c.x + 40;
      if (c.variant == 1 || c.variant == 2) {horizontalOverlap = hb.right > c.x + 10 && hb.left < c.x + 50;}

      
      //ctx.fillStyle = 'blue';
      //if (c.variant == 1 || c.variant == 2) {ctx.fillRect(c.x + 10, 100, 50, 200)}
      //else {ctx.fillRect(c.x + 10, 100, 30, 200)}
      // This stuff that is commented out was for hitbox purposes
    
     
      const standingOn =
        hb.bottom >= c.y + 0 &&
        hb.bottom <= c.y + 40; // 40 ~ cloud height DO NOT CHANGE THIS IT CAN COMPLETELY BREAK STANDINGON

      //hitbox visualization for top of clouds
      if (state.hitboxes) {
        ctx.strokeStyle = 'orange'
        ctx.strokeRect(c.x, c.y, 50, 35)
      }



      if (horizontalOverlap && standingOn) {
        playerOnTopNow = true;
        break;
      }

    }

    // --- Apply landing impulse once ---
    if (playerOnTopNow && !clouds[0].wasPlayerOnTop) {
      let impulse = Math.min(state.velo, 30) * 0.5;
      if (state.velo < 0) {impulse = 0}
      groupMomentum += impulse;
    }

    clouds[0].wasPlayerOnTop = playerOnTopNow;

    // --- Apply damping ---
    groupMomentum *= 0.925;
    if (Math.abs(groupMomentum) < 0.05) groupMomentum = 0;

    // --- Move clouds ---
    if (groupMomentum !== 0) {
      for (const c of clouds) {
        c.y += groupMomentum;
      }
    } else {
      // Return to original position slowly
      for (const c of clouds) {
        c.y = Math.max(c.y - state.cloudMoveUpSpeed, c.originalY);
      }
    }

    // --- Sync momentum ---
    for (const c of clouds) {
      c.momentum = groupMomentum;
    }

    // --- Move player along with the cloud ---
    let deltaY = clouds[0].y - prevY;
    if (deltaY > 0) {deltaY -= 0.5}
    if (playerOnTopNow && deltaY !== 0) {
      state.playerY += deltaY;
      console.log("moved player by deltaY", deltaY)
    }

    // kill player via squashing
    for (const b of state.blocks) {
      const playerLeft = state.playerX + state.playerHitbox.offsetX
      const playerRight = state.playerX + state.playerHitbox.offsetX + state.playerHitbox.width;
      const playerTop = state.playerY + state.playerHitbox.offsetY;
      const playerBottom = state.playerY + state.playerHitbox.offsetY + state.playerHitbox.height;

      let hbLeft = b.x + 1
      let hbRight = b.x + 49
      let hbTop = b.y + 45
      let hbBottom = b.y + 50

      if (playerOnTopNow) {
        if (playerRight > hbLeft &&
            playerLeft < hbRight &&
            playerTop < hbBottom &&
            playerBottom > hbTop
        ) { death(1) }
      }
    }
  }
}
