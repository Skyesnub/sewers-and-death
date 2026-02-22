const canvas = document.getElementById("editorCanvas");
const ctx = canvas.getContext("2d");

console.log("Are you there?")
const FPS = 60;


const frameInput = document.getElementById("frameInput");
const goToFrameBtn = document.getElementById("goToFrameBtn");


let lasers = [];
let selectedLaser = null;
let clickBuffer = [];

let audio = new Audio();
let playing = false;
let rToggleState = 0; // 0 = next press sets turnOn, 1 = sets turnOff

let isDragging = false;
let dragMode = null; // "start", "end", "move"
let dragOffset = { x: 0, y: 0 };

const frameDisplay = document.getElementById("frameDisplay");

// ===== MUSIC =====

goToFrameBtn.onclick = () => {
    const frame = parseInt(frameInput.value);
    if (isNaN(frame)) return;

    audio.currentTime = frame / FPS;
};

document.getElementById("musicInput").onchange = e => {
    const file = e.target.files[0];
    if (file) {
        audio.src = URL.createObjectURL(file);
    }
};

let audioStarted = false;

document.getElementById("playBtn").onclick = async () => {
    if (!audio.src) return;

    if (audio.paused) {
        await audio.play(); // wait until playback actually starts
        audioStarted = true;
        playing = true;
    } else {
        audio.pause();
        audioStarted = false;
        playing = false;
    }
};

window.addEventListener("keydown", e => {

    // ===== DELETE =====
    if ((e.key === "d") && selectedLaser) {
        console.log("delete pressed");

        lasers = lasers.filter(l => l !== selectedLaser);
        selectedLaser = null;
        updateInputs();
        return;
    }

    // ===== R KEY =====
    if (e.key.toLowerCase() === "r" && selectedLaser) {

        const frame = getCurrentFrame();

        if (rToggleState === 0) {
            selectedLaser.turnOn = frame;
            rToggleState = 1;
        } else {
            selectedLaser.turnOff = frame;
            rToggleState = 0;
        }

        updateInputs();
    }
});

const audioSlider = document.getElementById("audioSlider");

// Update slider max when metadata loads
audio.onloadedmetadata = () => {
    audioSlider.max = audio.duration;
};

// Move slider while audio plays
audio.ontimeupdate = () => {
    audioSlider.value = audio.currentTime;
};

// Scrub when user drags slider
audioSlider.oninput = e => {
    audio.currentTime = parseFloat(e.target.value);
};

// ===== LASER CLASS =====

class Laser {
    constructor(x1, y1, x2, y2, on=0, off=60, fade=20) {
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;

        this.turnOn = on;
        this.turnOff = off;
        this.fade = fade;
    }

    getAlpha(currentFrame) {
        if (currentFrame < this.turnOn - this.fade ||
            currentFrame > this.turnOff + this.fade) {
            return 0;
        }

        if (currentFrame < this.turnOn) {
            return (currentFrame - (this.turnOn - this.fade)) / this.fade;
        }

        if (currentFrame > this.turnOff) {
            return 1 - (currentFrame - this.turnOff) / this.fade;
        }

        return 1;
    }

    getEndpointAt(px, py) {
        const distStart = Math.hypot(px - this.x1, py - this.y1);
        const distEnd = Math.hypot(px - this.x2, py - this.y2);

        if (distStart < 10) return "start";
        if (distEnd < 10) return "end";
        return null;
    }

    draw(currentFrame) {
        const alpha = this.getAlpha(currentFrame);
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = alpha;

        ctx.strokeStyle = alpha === 1 ? "red" : "rgba(255,0,0,0.4)";
        ctx.lineWidth = selectedLaser === this ? 8 : 4;

        ctx.beginPath();
        ctx.moveTo(this.x1, this.y1);
        ctx.lineTo(this.x2, this.y2);
        ctx.stroke();

        ctx.restore();
    }

    containsPoint(px, py) {
        const dx = this.x2 - this.x1;
        const dy = this.y2 - this.y1;
        const lenSq = dx*dx + dy*dy;

        const t = ((px - this.x1) * dx + (py - this.y1) * dy) / lenSq;
        const clamped = Math.max(0, Math.min(1, t));

        const cx = this.x1 + clamped * dx;
        const cy = this.y1 + clamped * dy;

        return Math.hypot(px - cx, py - cy) < 10;
    }
}

// ===== CLICK HANDLING =====

canvas.addEventListener("mousedown", e => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const frame = getCurrentFrame(); // current frame

    // Check for selection or drag
    for (let laser of lasers) {
        if (laser.getAlpha(frame) <= 0) continue; // skip invisible lasers

        const endpoint = laser.getEndpointAt(x, y);
        if (endpoint) {
            selectedLaser = laser;
            updateInputs();
            isDragging = true;
            dragMode = endpoint;
            return;
        }

        if (laser.containsPoint(x, y)) {
            selectedLaser = laser;
            updateInputs();
            isDragging = true;
            dragMode = "move";

            dragOffset.x = x;
            dragOffset.y = y;
            return;
        }
    }

    // If nothing selected → create new laser
    selectedLaser = null;
    clickBuffer.push({ x, y });

    if (clickBuffer.length === 2) {
        const currentFrame = getCurrentFrame();
        const l = new Laser(
            clickBuffer[0].x,
            clickBuffer[0].y,
            clickBuffer[1].x,
            clickBuffer[1].y,
            currentFrame,           // turnOn = current frame
            currentFrame + 60,      // turnOff = current + 60
            20                      // fade default
        );
        lasers.push(l);
        selectedLaser = l;
        clickBuffer = [];
    }
});

canvas.addEventListener("mousemove", e => {
    if (!isDragging || !selectedLaser) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (dragMode === "start") {
        selectedLaser.x1 = x;
        selectedLaser.y1 = y;
    } 
    else if (dragMode === "end") {
        selectedLaser.x2 = x;
        selectedLaser.y2 = y;
    } 
    else if (dragMode === "move") {
        const dx = x - dragOffset.x;
        const dy = y - dragOffset.y;

        selectedLaser.x1 += dx;
        selectedLaser.y1 += dy;
        selectedLaser.x2 += dx;
        selectedLaser.y2 += dy;

        dragOffset.x = x;
        dragOffset.y = y;
    }
});

canvas.addEventListener("mouseup", () => {
    isDragging = false;
    dragMode = null;
});

// ===== FRAME CONVERSION =====

function getCurrentFrame() {
    return Math.floor(audio.currentTime * FPS);
}

// ===== INPUT CONTROLS =====

function updateInputs() {
    if (!selectedLaser) return;

    document.getElementById("onFrame").value = selectedLaser.turnOn;
    document.getElementById("offFrame").value = selectedLaser.turnOff;
    document.getElementById("fadeFrame").value = selectedLaser.fade;
}

document.getElementById("setOnNow").onclick = () => {
    if (!selectedLaser) return;
    selectedLaser.turnOn = getCurrentFrame();
    updateInputs();
};

document.getElementById("setOffNow").onclick = () => {
    if (!selectedLaser) return;
    selectedLaser.turnOff = getCurrentFrame();
    updateInputs();
};

document.getElementById("onFrame").oninput = e => {
    if (selectedLaser) selectedLaser.turnOn = parseInt(e.target.value);
};

document.getElementById("offFrame").oninput = e => {
    if (selectedLaser) selectedLaser.turnOff = parseInt(e.target.value);
};

document.getElementById("fadeFrame").oninput = e => {
    if (selectedLaser) selectedLaser.fade = parseInt(e.target.value);
};

// ===== EXPORT / IMPORT =====

document.getElementById("exportBtn").onclick = () => {

    const listFormat = lasers.map(l => [
        l.x1,
        l.y1,
        l.x2,
        l.y2,
        l.turnOn,
        l.turnOff,
        l.fade
    ]);

    const data = JSON.stringify(listFormat, null, 2);
    document.getElementById("ioBox").value = data;
};

document.getElementById("importBtn").onclick = () => {
    try {
        const parsed = JSON.parse(document.getElementById("ioBox").value);

        lasers = parsed.map(l => {
            if (Array.isArray(l)) {
                // List format: [x1, y1, x2, y2, turnOn, turnOff, fade]
                return new Laser(l[0], l[1], l[2], l[3], l[4], l[5], l[6]);
            } else {
                // Object format: {x1, y1, x2, y2, turnOn, turnOff, fade}
                return new Laser(l.x1, l.y1, l.x2, l.y2, l.turnOn, l.turnOff, l.fade);
            }
        });
    } catch {
        alert("Invalid JSON");
    }
};

import { levelCustom } from "./levels/lvl21.js";
// ===== LEVEL RENDER HOOK =====

// Replace this with your actual level render function
function renderLevelPreview() {
    ctx.clearRect(0,0, canvas.width, canvas.height)

    for (const block of levelCustom.blocks) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(block.x, block.y, 50, 50);
    }
    for (const spike of levelCustom.spikes) {
        ctx.fillStyle = 'red';
        ctx.fillRect(spike.x, spike.y, 50, 50);
    }
}

// ===== MAIN LOOP =====

function loop() {
    requestAnimationFrame(loop);
    renderLevelPreview();


    const frame = getCurrentFrame();
    frameDisplay.textContent = frame;


    for (let laser of lasers) {
        laser.draw(frame);
    }
}

loop();