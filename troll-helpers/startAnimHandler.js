const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

import { lightningImage } from "./assets.js";
import { state } from "./state.js"

let finalGradiantOpacity = 0;
let lightningOpacity = 1;
let playerRotationStart = 0;

export function handleStartAnim() {
    ctx.drawImage(state.startAnimBG, 0, 0, canvas.width, canvas.height)

    state.startAnimTimer++

    const size = state.playerIMGSize;
    const cx = state.startAnimPlayerX + size / 2;
    const cy = state.startAnimPlayerY + size / 2;

    ctx.save();

    ctx.translate(cx, cy);
    ctx.rotate(state.startFallRotation);

    ctx.drawImage(state.player_glow, -size/2 - 2, -size/2, size, size);
    ctx.drawImage(state.PstandStill, -size/2, -size/2, size, size);

    ctx.restore();

    //not using vars here because it is not moving
    ctx.drawImage(state.godOnThrone, 900, 100, 200, 200)

    //platform!
    ctx.drawImage(state.startPlatform, 750, 260, 750, 32)


    // === MAIN EVENTS =====

    if (state.startAnimTimer > 1390) {
        ctx.globalAlpha = lightningOpacity;

        lightningOpacity -= 0.05
        if (lightningOpacity < 0) lightningOpacity = 0;

        //not using variables here because not moving
        ctx.drawImage(lightningImage, 680, -230, 250, 500);
        ctx.globalAlpha = 1;
    }

    if (state.startAnimTimer > 1390 && !state.startFallTriggered) {
        state.startFallTriggered = true;

        state.startFallVelX = -8;      // leftward impulse
        state.startFallVelY = -5;      // slight upward kick before fall
        state.startFallAngularVel = 0.2; // radians per frame
    }

    if (state.startFallTriggered) {

        const gravity = 1;

        state.startFallVelY += gravity;

        state.startAnimPlayerX += state.startFallVelX;
        state.startAnimPlayerY += state.startFallVelY;

        state.startFallRotation += state.startFallAngularVel;
    }
    

    if (state.startAnimTimer > 1555) {
        state.startAnimStarted = false;
        state.startAnimFinished = true;
    }

    // === WORDS =====

    //bottom bar
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 625, canvas.width, 75)
    ctx.fillStyle = '#303030'
    ctx.fillRect(0, 620, canvas.width, 5)

    ctx.fillStyle = '#ffff5aff'
    ctx.font = "bold 30px Verdana"; 

    
    if (state.startAnimTimer > 0 && state.startAnimTimer <= 475) {
        ctx.fillText("[lore #1]", 25, 675, 10010101100, 104010010)
    }
    else if (state.startAnimTimer > 475 && state.startAnimTimer <= 930) {
        ctx.fillText("[lore #2]", 25, 675, 10010101100, 104010010)
    }
    else if (state.startAnimTimer > 930) {
        ctx.fillText("[lore #3]", 25, 675, 10010101100, 104010010)
    }

    // ====== GRADIANT ======

    if (state.startAnimTimer > 1400) {
        ctx.globalAlpha = finalGradiantOpacity;
        finalGradiantOpacity += 0.01
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, canvas.width, canvas.height)
        ctx.globalAlpha = 1;
    }
}