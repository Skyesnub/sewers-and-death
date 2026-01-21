import { state } from "./state.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");



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
      state.playerY = canvas.height - state.playerSize;
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
    const blockBox = { left: block.x, right: block.x + 50, top: block.y, bottom: block.y + 50 };
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
    const blockBox = { left: block.x, right: block.x + 50, top: block.y, bottom: block.y + 50 };
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

