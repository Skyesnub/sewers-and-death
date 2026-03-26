const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

import { state } from './state.js';
import { death } from './spike-death.js';
import { paused } from './paused.js';

function drawLaser(startX, startY, endX, endY) {

    const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    gradient.addColorStop(0, "rgba(255, 80, 80, 0.3)");
    gradient.addColorStop(0.5, "rgba(255, 0, 0, 1)");
    gradient.addColorStop(1, "rgba(255, 80, 80, 0.3)");

    ctx.save();

    ctx.globalCompositeOperation = "lighter"; // blending better

    // Outer glow
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 18;
    ctx.shadowBlur = 30;
    ctx.shadowColor = "red";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // White hot core
    ctx.strokeStyle = "rgba(255,255,255,0.9)";
    ctx.lineWidth = 6;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "white";

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.restore();
}

class Laser {
    constructor(startX, startY, endX, endY, turnOnTime, turnOffTime, fadeDuration = 20) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;

        this.turnOnTime = turnOnTime;   // frame/time to turn on
        this.turnOffTime = turnOffTime; // frame/time to turn off
        this.active = false;

        this.fadeDuration = fadeDuration; // frames to fade in/out
        this.alpha = 0; // current alpha for rendering
    }

    update(bossTimer, player) {
        // Determine if laser is active (including fade in/out)
        if (bossTimer < this.turnOnTime - this.fadeDuration || bossTimer > this.turnOffTime + this.fadeDuration) {
            this.active = false;
            this.alpha = 0;
            return;
        }


        // Fade in
        if (bossTimer >= this.turnOnTime - this.fadeDuration && bossTimer < this.turnOnTime) {
            this.alpha = (bossTimer - (this.turnOnTime - this.fadeDuration)) / this.fadeDuration;
            this.active = false;
        }
        // Fade out
        else if (bossTimer > this.turnOffTime && bossTimer <= this.turnOffTime + this.fadeDuration) {
            this.alpha = 1 - (bossTimer - this.turnOffTime) / this.fadeDuration;
            this.active = false;
        }
        // Fully on
        else {
            this.alpha = 1;
            this.active = true;

        }

        // Check collision with player
        if (this.hitsPlayer(player) && !state.adminMode) {
            death(1);
        }
    }

    hitsPlayer() {
        if (!this.active) return false;

        const { startX, startY, endX, endY } = this;
        const px = state.playerX + state.playerHitbox.offsetX;
        const py = state.playerY + state.playerHitbox.offsetY;
        const w = state.playerHitbox.width;
        const h = state.playerHitbox.height;

        const cx = px + w/2;
        const cy = py + h/2;

        const lx = endX - startX;
        const ly = endY - startY;

        const t = ((cx - startX) * lx + (cy - startY) * ly) / (lx*lx + ly*ly);
        const clampedT = Math.max(0, Math.min(1, t));

        const closestX = startX + clampedT * lx;
        const closestY = startY + clampedT * ly;

        const dx = closestX - cx;
        const dy = closestY - cy;
        const dist = Math.sqrt(dx*dx + dy*dy);

        const laserRadius = 1; //for now cause im to lazy to actually win ever ytime
        const playerRadius = Math.sqrt((w/2)**2 + (h/2)**2);

        return dist < laserRadius + playerRadius;
    }

    draw() {
        if (this.alpha <= 0) return; // skip fully invisible

        ctx.save();
        ctx.globalAlpha = this.alpha;
        drawLaser(this.startX, this.startY, this.endX, this.endY);
        ctx.restore();
    }

}

import { bossLasersData } from '../temporary-laser-file.js';

const bossLasers = bossLasersData.map(data =>
    new Laser(...data)
);

let animPlayerX = 1325;
let animPlayerY = 50;

let impulseX = 10;
let impulseY = 11;

let speedY = impulseY;

let bossMaxY = 350
let bossMinY = 340
let dirUp = false;
let bossY = 345
let bossX = 600

let whitefade = 0;

state.bossAnimTimer = 1400

export function handleBossAnim() {
    state.bossAnimTimer ++

    if (state.bossMusic.paused) {
        state.bossMusic.play();
    }

    if (state.bossAnimTimer < 1801) {state.jumpAnimStarted = false;}
    if (state.bossAnimTimer > 1800) {state.playerY = -5000; state.jumpAnimStarted = true;}

    if (state.bossAnimTimer > 1800 && state.bossAnimTimer < 1900) {ctx.drawImage(state.player_glow, animPlayerX, animPlayerY, state.playerIMGSize, state.playerIMGSize)}
    if (state.bossAnimTimer > 1800 && state.bossAnimTimer < 1820) {ctx.drawImage(state.PLeftImg1, animPlayerX, animPlayerY, state.playerIMGSize, state.playerIMGSize)}
    if (state.bossAnimTimer > 1819 && state.bossAnimTimer < 1840) { ctx.drawImage(state.jumpFrame1, animPlayerX, animPlayerY, state.playerIMGSize, state.playerIMGSize)}
    if (state.bossAnimTimer > 1839 && state.bossAnimTimer < 1860) {ctx.drawImage(state.jumpFrame2, animPlayerX, animPlayerY, state.playerIMGSize, state.playerIMGSize)}
    if (state.bossAnimTimer > 1859 && state.bossAnimTimer < 1900) {ctx.drawImage(state.jumpFrame1, animPlayerX, animPlayerY, state.playerIMGSize, state.playerIMGSize)}

    if (state.bossAnimTimer > 1815) {
        animPlayerX -= impulseX;
        animPlayerY -= speedY;

        speedY = speedY - 0.6
    }


    
    if (dirUp) {bossY -= 0.1}
    else {bossY += 0.1}

    if (bossY > bossMaxY) {dirUp = true}
    if (bossY < bossMinY) {dirUp = false}

    ctx.fillStyle = 'blue';
    ctx.drawImage(state.godOnThrone, bossX, bossY, 200, 200)

    if (state.bossAnimTimer > 1870 && state.bossAnimTimer < 1880) {
        ctx.drawImage(state.explosion1, 550, 275, 400, 400)
    }
    if (state.bossAnimTimer > 1879 && state.bossAnimTimer < 1900) {
        ctx.drawImage(state.explosion2, 550, 275, 400, 400)
    }

    if (state.bossAnimTimer > 1880 && state.bossAnimTimer < 1960) {
        ctx.fillStyle = 'white'
        ctx.globalAlpha = whitefade
        whitefade = (Math.min(whitefade + 0.025, 1))
        ctx.fillRect(0,0,canvas.width,canvas.height)

        ctx.globalAlpha = 1
    }
    if (state.bossAnimTimer > 1959) {

        ctx.fillStyle = "black";
        ctx.globalAlpha = 0.3;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.globalAlpha = 1;

        bossX = -1000
        ctx.fillStyle = 'white'
        ctx.globalAlpha = whitefade
        whitefade = (Math.max(whitefade - 0.025, 0))
        ctx.fillRect(0,0,canvas.width,canvas.height)

        ctx.globalAlpha = 1
    }



    for (const laser of bossLasers) {

        if (state.bossAnimTimer >= laser.turnOnTime - laser.fadeDuration &&
            state.bossAnimTimer <= laser.turnOffTime + laser.fadeDuration) {

            laser.update(state.bossAnimTimer);
            laser.draw();
        }
}


}