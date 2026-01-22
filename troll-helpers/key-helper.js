import { finishLevelSound } from "./assets.js";
import { state } from "./state.js";

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");



export function moveAndDrawKey() {
    // --- Handle floating before collection ---
    if (!state.keyCollected) {
        if (state.keyMovingUp) {
            if (state.keyY <= state.keyStartY - state.keyMaxDist) {
                state.keyMovingUp = false;
                state.keyMovingDown = true;
            }
            state.keyY -= state.keySpeed;
        } else if (state.keyMovingDown) {
            if (state.keyY >= state.keyStartY + state.keyMaxDist) {
                state.keyMovingUp = true;
                state.keyMovingDown = false;
            }
            state.keyY += state.keySpeed;
        }
    }

    // --- Player collision check ---
    const playerLeft = state.playerX + state.playerHitbox.offsetX;
    const playerRight = state.playerX + state.playerHitbox.offsetX + state.playerHitbox.width;
    const playerTop = state.playerY + state.playerHitbox.offsetY;
    const playerBottom = state.playerY + state.playerHitbox.offsetY + state.playerHitbox.height;

    const keyLeft = state.keyX + 30;
    const keyRight = state.keyX + 70;
    const keyTop = state.keyY + 30;
    const keyBottom = state.keyY + 70;

    //draw key hitbox
    if (state.hitboxes) {
        ctx.fillStyle = 'blue';
        ctx.strokeRect(keyLeft, keyTop, keyRight - keyLeft, keyBottom - keyTop)
    }

    if (playerRight >= keyLeft && playerLeft <= keyRight && playerBottom >= keyTop && playerTop <= keyBottom && !state.levelTransitioning) {
        state.keyCollected = true;
        state.levelTransitioning = true;
        // Initialize animation flags
        state.keySnapped = false;
        state.keyHopDone = false;
        state.keyRotation = 0;
        state.keyFallSpeed = 0;
        state.finishSoundPlayed = false;
    }

    // --- Collection animation ---
    if (state.keyCollected && !state.keyAnimationFinished) {
        keyAnimation();
    }

    // --- Drawing with rotation ---
    ctx.save();
    const keyCenterX = state.keyX + state.keySize / 2;
    const keyCenterY = state.keyY + state.keySize / 2;
    ctx.translate(keyCenterX, keyCenterY);
    ctx.rotate(state.keyRotation || 0);
    ctx.drawImage(state.glowingKey, -state.keySize / 2, -state.keySize / 2, state.keySize, state.keySize);
    ctx.restore();
}


function keyAnimation() {
    const centerX = canvas.width / 2 - state.keySize / 2;
    const centerY = canvas.height / 2 - state.keySize / 2;

    // Move to center first
    if (!state.keySnapped) {
        state.speedrunStarted = false;

        const dx = (centerX - state.keyX) * 0.1;
        const dy = (centerY - state.keyY) * 0.1;
        state.keyX += dx;
        state.keyY += dy;

        const distance = Math.hypot(centerX - state.keyX, centerY - state.keyY);
        if (distance < 1) {
            state.keyX = centerX;
            state.keyY = centerY;
            state.keySnapped = true;
            if (!state.finishSoundPlayed) {
                state.finishLevelSound.currentTime = 0;
                state.finishLevelSound.play();
                state.finishSoundPlayed = true;
            }
        }
        return;
    }

    // Hop and fall
    const HOP_HEIGHT = 80;
    const FALL_ACCEL = 0.5;
    state.keyRotation += 0.2; // rotation per frame

    if (!state.keyHopDone) {
        state.keyY -= 6;
        if (state.keyY <= centerY - HOP_HEIGHT) state.keyHopDone = true;
    } else {
        state.keyFallSpeed = (state.keyFallSpeed || 0) + FALL_ACCEL;
        state.keyY += state.keyFallSpeed;

        if (state.keyY > canvas.height + 100) {
            state.keyAnimationFinished = true;
            
            // Latch for main loop
            if (!state.pendingLevelChange) {
                state.pendingLevelChange = state.minilevelStr;
                console.log("Latch set! minilevelStr =", state.minilevelStr);
            }
        }
    }

    // small horizontal drift
    state.keyX += 1;
}
