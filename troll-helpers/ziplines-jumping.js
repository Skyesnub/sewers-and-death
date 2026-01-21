import { state } from "./state.js";

// --- Distance Helper ---
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1;
  const C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = lenSq !== 0 ? dot / lenSq : 0;
  param = Math.max(0, Math.min(1, param));
  const xx = x1 + param * C;
  const yy = y1 + param * D;
  return { dist: Math.sqrt((px-xx)**2 + (py-yy)**2), t: param, closestX: xx, closestY: yy };
}

export function detachFromZipline() {
  if (!state.currentZipline) return;

  state.onZipline = false;

  const zip = state.currentZipline;
  zip.justJumpedOff = true;
  zip.jumpOffTimer = state.zipLineJumpConst; // frames to block reattachment
  zip.cooldown = 15; // extra buffer frames after jump-off

  state.currentZipline = null;
}

export function checkZiplineAttachment() {
  // Use hitbox center
  const cx = state.playerX + state.playerHitbox.offsetX + state.playerHitbox.width / 2;
  const cy = state.playerY + state.playerHitbox.offsetY + state.playerHitbox.height / 2;

  for (const zipline of state.ziplines) {
    const res = distanceToSegment(cx, cy, zipline.pt1X, zipline.pt1Y, zipline.pt2X, zipline.pt2Y);
    if (res.dist < 20 && !zipline.justJumpedOff && zipline.cooldown === 0) {
      state.onZipline = true;
      state.currentZipline = zipline;
      state.ziplineProgress = res.t;
      state.velo = 0;
      // Move player so that the hitbox center aligns with closest point
      state.playerX = res.closestX - (state.playerHitbox.offsetX + state.playerHitbox.width / 2);
      state.playerY = res.closestY - (state.playerHitbox.offsetY + state.playerHitbox.height / 2);
      break;
    }
  }
}

export function moveAlongZipline() {
  if (!state.dead) {
    const zip = state.currentZipline;
    const dx = zip.pt2X - zip.pt1X;
    const dy = zip.pt2Y - zip.pt1Y;
    const segLen = Math.sqrt(dx*dx + dy*dy) || 1;
    const speed = 5 / segLen;

    state.ziplineProgress += speed;

    const hitboxCenterX = state.playerHitbox.offsetX + state.playerHitbox.width / 2;
    const hitboxCenterY = state.playerHitbox.offsetY + state.playerHitbox.height / 2;

    if (state.ziplineProgress >= 1) {
      state.ziplineProgress = 1;
      detachFromZipline();
      state.playerX = zip.pt2X - hitboxCenterX;
      state.playerY = zip.pt2Y - hitboxCenterY;
      state.velo = 0;
    } else {
      state.playerX = zip.pt1X + dx * state.ziplineProgress - hitboxCenterX;
      state.playerY = zip.pt1Y + dy * state.ziplineProgress - hitboxCenterY;
    }
  }
}

