const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

import { lightningImage } from "./assets.js";
import { state } from "./state.js"

let finalGradiantOpacity = 0;
let lightningOpacity = 1;

export function handleStartAnim() {
    // ==== DRAWING =====

    //for camera zoom
    ctx.save();

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(state.cameraZoom1, state.cameraZoom1);
    ctx.translate(-state.cameraZoom1X, -state.cameraZoom1Y);

    ctx.drawImage(state.startAnimBG, 0, 0, canvas.width, canvas.height)
    state.startAnimTimer++

    const size = state.playerIMGSize;
    const cx = state.startAnimPlayerX + size / 2;
    const cy = state.startAnimPlayerY + size / 2;

    //for rotation
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


    // === ZOOMING TIMERS ======

    if (state.startAnimTimer == 1) {
        state.cameraZoom1X = 700;
        state.cameraZoom1Y = 600;
        state.cameraZoom1 = 3;
    }
    if (state.startAnimTimer > 1 && state.startAnimTimer < 250) {
        state.cameraZoom1X += 0.3
        state.cameraZoom1Y += 0.05
    }

    if (state.startAnimTimer == 250) {
        state.cameraZoom1X = 300;
        state.cameraZoom1Y = 200;
    }

    if (state.startAnimTimer > 250 && state.startAnimTimer < 465) {
        state.cameraZoom1X -= 0.2
        state.cameraZoom1Y -= 0.05
    }

    if (state.startAnimTimer == 465) {
        state.cameraZoom1X = 700;
        state.cameraZoom1Y = 300;
    }

    if (state.startAnimTimer > 465 && state.startAnimTimer < 585) {
        state.cameraZoom1X += 0.2
        state.cameraZoom1Y -= 0.05
    } 

    if (state.startAnimTimer == 585) {
        state.cameraZoom1X = 1150;
        state.cameraZoom1Y = 250;
    }

    if (state.startAnimTimer > 585 && state.startAnimTimer < 655) {
        state.cameraZoom1X -= 0.25
        state.cameraZoom1Y += 0.05
    } 

    if (state.startAnimTimer == 655) {
        state.cameraZoom1X = 700;
        state.cameraZoom1Y = 300;
    }

    if (state.startAnimTimer > 655 && state.startAnimTimer < 705) {
        state.cameraZoom1X -= 0.2
        state.cameraZoom1Y -= 0.05
    } 

    if (state.startAnimTimer == 705) {
        state.cameraZoom1X = 1100;
        state.cameraZoom1Y = 200;
    }

    if (state.startAnimTimer > 705 && state.startAnimTimer < 940) {
        state.cameraZoom1X += 0.25
        state.cameraZoom1Y += 0.05
    } 

    if (state.startAnimTimer == 940) {
        state.cameraZoom1X = 700;
        state.cameraZoom1Y = 300;
    }

    if (state.startAnimTimer > 940 && state.startAnimTimer < 1050) {
        state.cameraZoom1X += 0.05
        state.cameraZoom1Y -= 0.15
    } 

    if (state.startAnimTimer == 1050) {
        state.cameraZoom1X = 1100;
        state.cameraZoom1Y = 250;
    }

    if (state.startAnimTimer > 1050 && state.startAnimTimer < 1182) {
        state.cameraZoom1X -= 0.2
        state.cameraZoom1Y -= 0.05
    } 

    if (state.startAnimTimer == 1122) {
        state.cameraZoom1 = 2
        state.cameraZoom1X = 600;
        state.cameraZoom1Y = 250;
    }

    if (state.startAnimTimer == 1182) {
        state.cameraZoom1 = 1;
        state.cameraZoom1X = 725;
        state.cameraZoom1Y = 350;
    }


    // === MAIN LOGIC =====
    if (state.startAnimTimer > 1390) {
        ctx.globalAlpha = lightningOpacity;

        lightningOpacity -= 0.05
        if (lightningOpacity < 0) lightningOpacity = 0;

        //not using variables here because not moving
        ctx.drawImage(lightningImage, 680, -230, 250, 500);
        ctx.globalAlpha = 1;
    }

    ctx.restore();

    

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

    ctx.fillText("Press [k] to skip", 1150, 675, 1930130103013, 10301301030)

    // ====== GRADIANT ======

    if (state.startAnimTimer > 1400) {
        ctx.globalAlpha = finalGradiantOpacity;
        finalGradiantOpacity += 0.01
        ctx.fillStyle = 'black';
        ctx.fillRect(0,0, canvas.width, canvas.height)
        ctx.globalAlpha = 1;
    }
}