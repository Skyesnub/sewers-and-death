// editor.js
// Simple level editor for your game format
// - supports blocks, spikes, ziplines
// - grid snapping, dragging, export to JS or JSON

const canvas = document.getElementById('editorCanvas');
const ctx = canvas.getContext('2d');

const toolBlock = document.getElementById('toolBlock');
const toolSpike = document.getElementById('toolSpike');
const toolDeco = document.getElementById('toolDeco');
const toolZipEnd = document.getElementById('toolZipEnd');
const toolDeco2 = document.getElementById('toolDeco2');
const toolIce = document.getElementById('toolIce');
const exportJS = document.getElementById('exportJS');
const fileInput = document.getElementById('fileInput');
const bgImageInput = document.getElementById('bgImageInput');
const gridSizeInput = document.getElementById('gridSize');
const spikeOrientation = document.getElementById('spikeOrientation');
const moveSpeedInput = document.getElementById('moveSpeed');
const objectList = document.getElementById('objectList');
const clearBtn = document.getElementById('clearBtn');
const snapToggle = document.getElementById('snapToggle');
const openInGame = document.getElementById('openInGame');
const gameUrl = document.getElementById('gameUrl');

let snapEnabled = true;
let currentTool = 'block';
let pendingZipStart = null;
let dragging = null;

let cameraX = 0;
let cameraY = 0;
const CAMERA_SPEED = 20;
const worldWidth = 1450;
const worldHeight = 700;
const keysDown = {};
let currentDecoVariant = 1;

let backgroundImage = null;
let backgroundImageName = null;
let selection = []; // multiple selection array
let gridSize = Number(gridSizeInput.value) || 50;

let editBlocks = [];
let editSpikes = [];
let editZiplines = [];
let editDecorations = [];

const BLOCK_W = 50;
const BLOCK_H = 50;

// --- Global variables ---
let clipboard = []; // stores copied items

let spawn = {
  x: 0,
  y: 0
};

const spawnXInput = document.getElementById("spawnX");
const spawnYInput = document.getElementById("spawnY");

spawnXInput.value = spawn.x;
spawnYInput.value = spawn.y;

document.getElementById("applySpawn").onclick = () => {
  let x = Number(spawnXInput.value);
  let y = Number(spawnYInput.value);

  if (Number.isNaN(x) || Number.isNaN(y)) return;

  if (snapEnabled) {
    x = snap(x);
    y = snap(y);
  }

  spawn.x = x;
  spawn.y = y;
};

let keyLocation = {
  x: 0,
  y: 0
};

const keyXInput = document.getElementById("keyX");
const keyYInput = document.getElementById("keyY");

keyXInput.value = keyLocation.x;
keyYInput.value = keyLocation.y;

document.getElementById("applyKey").onclick = () => {
  let x = Number(keyXInput.value);
  let y = Number(keyYInput.value);

  if (Number.isNaN(x) || Number.isNaN(y)) return;

  if (snapEnabled) {
    x = snap(x);
    y = snap(y);
  }

  keyLocation.x = x;
  keyLocation.y = y;
};


// --- Keyboard shortcuts for copy/paste ---
window.addEventListener('keydown', (e) => {
  keysDown[e.key] = true;
  updateCameraFromKeys();

  if (e.ctrlKey && e.key.toLowerCase() === 'c') { 
    e.preventDefault(); 
    copySelection();
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'v') { 
    e.preventDefault(); 
    pasteClipboard();
  }
});

window.addEventListener('keyup', (e) => { keysDown[e.key] = false; });

// --- Copy/Paste functions ---
function copySelection() {
  clipboard = selection.map(sel => {
    if(sel.type === 'block') return { type:'block', data: {...editBlocks[sel.index]} };
    if(sel.type === 'spike') return { type:'spike', data: {...editSpikes[sel.index]} };
    if(sel.type.startsWith('zip')) return { type:'zip', data: {...editZiplines[sel.index]} };
  });
  console.log('Copied', clipboard.length, 'items');
}

function pasteClipboard() {
  if(clipboard.length === 0) return;
  clearSelection();
  clipboard.forEach(item => {
    if(item.type === 'block') {
      const newBlock = {...item.data, x: item.data.x + 20, y: item.data.y + 20};
      editBlocks.push(newBlock);
      selection.push({type:'block', index: editBlocks.length-1});
    } else if(item.type === 'spike') {
      const newSpike = {...item.data, x: item.data.x + 20, y: item.data.y + 20};
      editSpikes.push(newSpike);
      selection.push({type:'spike', index: editSpikes.length-1});
    } else if(item.type==='zip') {
      const newZip = {
        ...item.data, 
        pt1X: item.data.pt1X + 20, pt1Y: item.data.pt1Y + 20,
        pt2X: item.data.pt2X + 20, pt2Y: item.data.pt2Y + 20
      };
      editZiplines.push(newZip);
      selection.push({type:'zip', index: editZiplines.length-1});
    }
  });
  updateObjectList();
  console.log('Pasted', clipboard.length, 'items');
}


// --- Camera movement ---
window.addEventListener('keydown', (e) => { keysDown[e.key] = true; updateCameraFromKeys(); });
window.addEventListener('keyup', (e) => { keysDown[e.key] = false; });

function updateCameraFromKeys() {
  if (keysDown['ArrowLeft']) cameraX -= CAMERA_SPEED;
  if (keysDown['ArrowRight']) cameraX += CAMERA_SPEED;
  if (keysDown['ArrowUp']) cameraY -= CAMERA_SPEED;
  if (keysDown['ArrowDown']) cameraY += CAMERA_SPEED;
  cameraX = Math.max(0, Math.min(cameraX, worldWidth - canvas.width));
  cameraY = Math.max(0, Math.min(cameraY, worldHeight - canvas.height));
}

// --- Utility functions ---
function snap(n) { return snapEnabled ? Math.floor(n / gridSize) * gridSize : n; }
function screenToWorld(evt) {
  const rect = canvas.getBoundingClientRect();
  return { x: evt.clientX - rect.left + cameraX, y: evt.clientY - rect.top + cameraY };
}
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const A = px - x1, B = py - y1, C = x2 - x1, D = y2 - y1;
  const dot = A * C + B * D, lenSq = C*C + D*D;
  let param = lenSq !== 0 ? dot / lenSq : 0;
  param = Math.max(0, Math.min(1, param));
  const xx = x1 + param * C, yy = y1 + param * D;
  const dx = px - xx, dy = py - yy;
  return { dist: Math.sqrt(dx*dx + dy*dy), t: param, closestX: xx, closestY: yy };
}

// --- Rendering ---
function drawGrid() {
  ctx.strokeStyle = '#eef2f6'; ctx.lineWidth = 1;
  const startX = Math.floor(cameraX / gridSize) * gridSize, endX = cameraX + canvas.width;
  const startY = Math.floor(cameraY / gridSize) * gridSize, endY = cameraY + canvas.height;

  for (let x = startX; x <= endX; x += gridSize) { ctx.beginPath(); ctx.moveTo(x - cameraX + 0.5, 0); ctx.lineTo(x - cameraX + 0.5, canvas.height); ctx.stroke(); }
  for (let y = startY; y <= endY; y += gridSize) { ctx.beginPath(); ctx.moveTo(0, y - cameraY + 0.5); ctx.lineTo(canvas.width, y - cameraY + 0.5); ctx.stroke(); }
}

function render() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  if (backgroundImage) ctx.drawImage(backgroundImage, -cameraX, -cameraY);
  drawGrid();



  // draw decorations
  for (const d of editDecorations) {
    if (d.variant === 2) {
      ctx.fillStyle = '#6b7280'; // darker / different color
    } else {
      ctx.fillStyle = '#9ca3af';
    }

    ctx.fillRect(d.x - cameraX, d.y - cameraY, d.w, d.h);
  }

  // draw ziplines
  ctx.lineWidth = 4;
  for (const z of editZiplines) {
    ctx.strokeStyle = '#2b6ef6';
    ctx.beginPath(); ctx.moveTo(z.pt1X - cameraX, z.pt1Y - cameraY); ctx.lineTo(z.pt2X - cameraX, z.pt2Y - cameraY); ctx.stroke();
    ctx.fillStyle = '#2b6ef6';
    ctx.fillRect(z.pt1X - cameraX - 4, z.pt1Y - cameraY - 4, 8, 8);
    ctx.fillRect(z.pt2X - cameraX - 4, z.pt2Y - cameraY - 4, 8, 8);
  }

  // draw spikes
  for (const s of editSpikes) {
    ctx.fillStyle = '#ff6b6b';
    if (s.orientation === 1) { ctx.beginPath(); ctx.moveTo(s.x + s.size/2 - cameraX, s.y - cameraY); ctx.lineTo(s.x + s.size - cameraX, s.y + s.size - cameraY); ctx.lineTo(s.x - cameraX, s.y + s.size - cameraY); ctx.closePath(); ctx.fill(); }
    else if (s.orientation === 2) { ctx.beginPath(); ctx.moveTo(s.x + s.size - cameraX, s.y + s.size/2 - cameraY); ctx.lineTo(s.x - cameraX, s.y - cameraY); ctx.lineTo(s.x - cameraX, s.y + s.size - cameraY); ctx.closePath(); ctx.fill(); }
    else if (s.orientation === 3) { ctx.beginPath(); ctx.moveTo(s.x - cameraX, s.y - cameraY); ctx.lineTo(s.x + s.size - cameraX, s.y - cameraY); ctx.lineTo(s.x + s.size/2 - cameraX, s.y + s.size - cameraY); ctx.closePath(); ctx.fill(); }
    else if (s.orientation === 4) { ctx.beginPath(); ctx.moveTo(s.x - cameraX, s.y + s.size/2 - cameraY); ctx.lineTo(s.x - cameraX + s.size, s.y - cameraY); ctx.lineTo(s.x - cameraX + s.size, s.y + s.size - cameraY); ctx.closePath(); ctx.fill(); }
  }

  // draw blocks
  for (const b of editBlocks) {
    if (b.material === 'ice') {
      ctx.fillStyle = '#9ee7ff';
    } else {
      ctx.fillStyle = '#0f5193ff';
    }

    ctx.fillRect(b.x - cameraX, b.y - cameraY, BLOCK_W, BLOCK_H);
  }


  // draw spawn
  ctx.fillStyle = "#55ff55";
  ctx.fillRect(spawn.x - cameraX, spawn.y - cameraY, 10, 10);

  // draw key location
  ctx.fillStyle = "#ff3333";
  ctx.beginPath();
  ctx.arc(
    keyLocation.x - cameraX + 5,
    keyLocation.y - cameraY + 5,
    6,
    0,
    Math.PI * 2
  );
  ctx.fill();



  // Render selection safely
  for (const sel of selection) {
    if(sel.type==='block') { 
      const b = editBlocks[sel.index]; 
      if(!b) continue; // skip if block was deleted
      ctx.strokeStyle='yellow';
      ctx.lineWidth=2;
      ctx.strokeRect(b.x-cameraX, b.y-cameraY, BLOCK_W, BLOCK_H);
    } else if(sel.type==='spike') {
      const s = editSpikes[sel.index];
      if(!s) continue;
      ctx.strokeStyle='yellow';
      ctx.lineWidth=2;
      ctx.strokeRect(s.x-cameraX, s.y-cameraY, s.size, s.size);
    } else if(sel.type.startsWith('zip')) {
      const z = editZiplines[sel.index];
      if(!z) continue;
      ctx.strokeStyle='yellow';
      ctx.lineWidth=2;
      if(sel.type==='zippt1') ctx.strokeRect(z.pt1X-6-cameraX, z.pt1Y-6-cameraY, 12,12);
      else if(sel.type==='zippt2') ctx.strokeRect(z.pt2X-6-cameraX, z.pt2Y-6-cameraY, 12,12);
      else if(sel.type==='zip') {
        ctx.beginPath(); ctx.moveTo(z.pt1X-cameraX,z.pt1Y-cameraY); ctx.lineTo(z.pt2X-cameraX,z.pt2Y-cameraY); ctx.stroke();
        ctx.strokeRect(z.pt1X-6-cameraX,z.pt1Y-6-cameraY,12,12);
        ctx.strokeRect(z.pt2X-6-cameraX,z.pt2Y-6-cameraY,12,12);
      }
    }
  }


  // pending zip start
  if (pendingZipStart) { ctx.fillStyle = '#2b6ef6'; ctx.fillRect(pendingZipStart.x - cameraX - 6, pendingZipStart.y - cameraY - 6, 12, 12); }

  requestAnimationFrame(render);
}

// --- Object list ---
function updateObjectList() {
  objectList.innerHTML = '';
  const addLine = (label, index, type) => {
    const el = document.createElement('div'); el.className = 'item'; el.textContent = `${label} (${type} #${index})`; el.onclick = () => { console.log('selected', type, index); }; objectList.appendChild(el);
  };
  editBlocks.forEach((b,i) => addLine(`Block @${b.x},${b.y}`, i, 'block'));
  editSpikes.forEach((s,i) => addLine(`Spike @${s.x},${s.y} o${s.orientation}`, i, 'spike'));
  editDecorations.forEach((d,i) =>
    addLine(`Deco @${d.x},${d.y}`, i, 'deco')
  );
  editZiplines.forEach((z,i) => addLine(`Zip ${z.pt1X},${z.pt1Y} → ${z.pt2X},${z.pt2Y}`, i, 'zip'));
}

// --- Hit detection ---
function findHit(evt) {
  const p = screenToWorld(evt);
  for (let i = editBlocks.length-1; i>=0; i--) { const b = editBlocks[i]; if (p.x>=b.x && p.x<=b.x+BLOCK_W && p.y>=b.y && p.y<=b.y+BLOCK_H) return {type:'block', index:i}; }
  for (let i = editSpikes.length-1; i>=0; i--) { const s = editSpikes[i]; if (p.x>=s.x && p.x<=s.x+s.size && p.y>=s.y-s.size && p.y<=s.y+s.size) return {type:'spike', index:i}; }
  for (let i = editDecorations.length - 1; i >= 0; i--) {
    const d = editDecorations[i];
    if (
      p.x >= d.x && p.x <= d.x + d.w &&
      p.y >= d.y && p.y <= d.y + d.h
    ) {
      return { type: 'deco', index: i };
    }
  }

  for (let i = editZiplines.length-1; i>=0; i--) {
    const z = editZiplines[i];
    const d1 = Math.hypot(p.x-z.pt1X, p.y-z.pt1Y), d2 = Math.hypot(p.x-z.pt2X, p.y-z.pt2Y);
    if (d1<10) return {type:'zippt1', index:i};
    if (d2<10) return {type:'zippt2', index:i};
    if (distanceToSegment(p.x,p.y,z.pt1X,z.pt1Y,z.pt2X,z.pt2Y).dist < 6) return {type:'zip', index:i};
  }
  return null;
}

canvas.addEventListener('mousedown', (evt) => {
  evt.preventDefault();
  const p = screenToWorld(evt);
  const snappedX = snap(p.x), snappedY = snap(p.y);

  const hit = findHit(evt);

  // Right-click delete
  if (evt.button === 2) {
    if(hit){
      if(hit.type==='block'){
        editBlocks.splice(hit.index,1);
        selection = selection.filter(s => !(s.type==='block' && s.index===hit.index));
        if(dragging) dragging.items = dragging.items.filter(s => !(s.type==='block' && s.index===hit.index));
      } else if(hit.type==='spike'){
        editSpikes.splice(hit.index,1);
        selection = selection.filter(s => !(s.type==='spike' && s.index===hit.index));
        if(dragging) dragging.items = dragging.items.filter(s => !(s.type==='spike' && s.index===hit.index));
      } else if(hit.type==='deco'){
        editDecorations.splice(hit.index,1);
        selection = selection.filter(s => !(s.type==='deco' && s.index===hit.index));
        if(dragging) dragging.items = dragging.items.filter(s => !(s.type==='deco' && s.index===hit.index));
      } else if(hit.type.startsWith('zip')){
        editZiplines.splice(hit.index,1);
        selection = selection.filter(s => s.index!==hit.index || !s.type.startsWith('zip'));
        if(dragging) dragging.items = dragging.items.filter(s => s.index!==hit.index || !s.type.startsWith('zip'));
      }
      updateObjectList();
    }
    return; // Prevent further processing on right-click
  }

  // Left-click: select / drag / place
  if (hit) {
      const alreadySelected = selection.some(s => s.type === hit.type && s.index === hit.index);
      if (!evt.shiftKey && !alreadySelected) {
        selection = [{ type: hit.type, index: hit.index }];
      } else if (evt.shiftKey) {
        const i = selection.findIndex(s => s.type === hit.type && s.index === hit.index);
        if (i >= 0) selection.splice(i, 1);
        else selection.push({ type: hit.type, index: hit.index });
      }

    dragging = { startMouseX:p.x, startMouseY:p.y, items: selection.map(sel=>{
      if(sel.type==='block'){ const b=editBlocks[sel.index]; return {...sel, startX:b.x,startY:b.y}; }
      if(sel.type==='spike'){ const s=editSpikes[sel.index]; return {...sel, startX:s.x,startY:s.y}; }
      if(sel.type==='deco'){
        const d = editDecorations[sel.index];
        return {...sel, startX:d.x, startY:d.y};
      }
      if(sel.type==='zippt2'){ const z=editZiplines[sel.index]; return {...sel, startX:z.pt2X,startY:z.pt2Y}; }
      if(sel.type==='zip'){ const z=editZiplines[sel.index]; return {...sel, startX1:z.pt1X,startY1:z.pt1Y,startX2:z.pt2X,startY2:z.pt2Y}; }
    })};

    return;
  }

  // --- Place new items ---
  if (currentTool === 'block') {
    editBlocks.push({
      x: snappedX,
      y: snappedY,
      material: 'block'
    });
    updateObjectList();
    return;
  }

  if (currentTool === 'ice') {
    editBlocks.push({
      x: snappedX,
      y: snappedY,
      material: 'ice'
    });
    updateObjectList();
    return;
  }
  if(currentTool==='spike'){ 
    editSpikes.push({x:snappedX,y:snappedY,size:50,orientation:Number(spikeOrientation.value)}); 
    updateObjectList(); return; 
  }
  if (currentTool === 'deco') {
    editDecorations.push({
      x: snappedX,
      y: snappedY,
      w: BLOCK_W,
      h: BLOCK_H,
      variant: currentDecoVariant
    });
    updateObjectList();
    return;
  }

  if(currentTool==='zipend'){ 
    if(pendingZipStart){ 
      editZiplines.push({pt1X:pendingZipStart.x,pt1Y:pendingZipStart.y,pt2X:snappedX,pt2Y:snappedY,justJumpedOff:false,jumpOffTimer:0}); 
      pendingZipStart=null; 
      updateObjectList(); 
    } else pendingZipStart={x:snappedX,y:snappedY}; 
    return; 
  }
});


canvas.addEventListener('mousemove', (evt)=>{
  if(!dragging) return;
  const p=screenToWorld(evt), dx=p.x-dragging.startMouseX, dy=p.y-dragging.startMouseY;

  for (const item of dragging.items){
    if(item.type==='block'){ let x=item.startX+dx, y=item.startY+dy; if(snapEnabled){x=snap(x);y=snap(y);} editBlocks[item.index].x=x; editBlocks[item.index].y=y; }
    if(item.type==='spike'){ let x=item.startX+dx, y=item.startY+dy; if(snapEnabled){x=snap(x);y=snap(y);} editSpikes[item.index].x=x; editSpikes[item.index].y=y; }
    if(item.type==='deco'){
      let x=item.startX+dx, y=item.startY+dy;
      if(snapEnabled){x=snap(x);y=snap(y);}
      editDecorations[item.index].x=x;
      editDecorations[item.index].y=y;
    }
    if(item.type==='zippt2'){ let x=item.startX+dx, y=item.startY+dy; if(snapEnabled){x=snap(x);y=snap(y);} editZiplines[item.index].pt2X=x; editZiplines[item.index].pt2Y=y; }
    if(item.type==='zip'){ let x1=item.startX1+dx, y1=item.startY1+dy, x2=item.startX2+dx, y2=item.startY2+dy; if(snapEnabled){x1=snap(x1);y1=snap(y1);x2=snap(x2);y2=snap(y2);} const z=editZiplines[item.index]; z.pt1X=x1; z.pt1Y=y1; z.pt2X=x2; z.pt2Y=y2; }
  }

  updateObjectList();
});

window.addEventListener('mouseup',()=>{dragging=null;});
canvas.addEventListener('contextmenu', e=>e.preventDefault());

// --- Toolbar & helpers ---
toolBlock.onclick=()=>{currentTool='block';highlightTool();};
toolSpike.onclick=()=>{currentTool='spike';highlightTool();};
toolDeco.onclick = () => {
  currentTool = 'deco';
  currentDecoVariant = 1;
  highlightTool();
};

toolDeco2.onclick = () => {
  currentTool = 'deco';
  currentDecoVariant = 2;
  highlightTool();
};
toolIce.onclick = () => {
  currentTool = 'ice';
  highlightTool();
};


toolZipEnd.onclick=()=>{currentTool='zipend';highlightTool();pendingZipStart=null;};

function highlightTool(){
  [toolBlock, toolSpike, toolDeco, toolDeco2, toolZipEnd, toolIce].forEach(
    btn => btn.style.background = ''
  );

  if (currentTool === 'block') toolBlock.style.background = '#dfefff';
  if (currentTool === 'spike') toolSpike.style.background = '#ffdede';
  if (currentTool === 'zipend') toolZipEnd.style.background = '#dfefff';
  if (currentTool === 'ice') toolIce.style.background = '#e0f7ff';

  if (currentTool === 'deco' && currentDecoVariant === 1) toolDeco.style.background = '#eeeeee';
  if (currentTool === 'deco' && currentDecoVariant === 2) toolDeco2.style.background = '#eeeeee';
}


gridSizeInput.onchange=()=>{gridSize=Number(gridSizeInput.value)||50;};
clearBtn.onclick=()=>{editBlocks=[];editSpikes=[];editZiplines=[]; editDecorations=[]; pendingZipStart=null;updateObjectList();};
snapToggle.onclick=()=>{snapEnabled=!snapEnabled;snapToggle.textContent='Snap: '+(snapEnabled?'ON':'OFF');};

// --- Export ---
exportJS.onclick=()=>{
  const output = {
    spawn: { x: spawn.x, y: spawn.y },
    key: { x: keyLocation.x, y: keyLocation.y },
    backgroundImage: backgroundImageName,
    blocks: editBlocks,
    spikes: editSpikes,
    ziplines: editZiplines,
    decorations: editDecorations
  };
  const js='export const levelCustom = '+JSON.stringify(output,null,2)+';';
  downloadFile(js,'levelCustom.js','text/javascript');
};

// --- File input ---
bgImageInput.onchange=(e)=>{
  const file=e.target.files[0]; if(!file) return; backgroundImageName=file.name;
  const img=new Image(); img.onload=()=>{ backgroundImage=img; }; img.src=URL.createObjectURL(file);
};

fileInput.onchange = (e) => {
  const f = e.target.files[0];
  if (!f) return;

  const reader = new FileReader();

  reader.onload = (ev) => {
    const text = ev.target.result;

    const tryParse = (obj) => {
      if (!obj || typeof obj !== "object") return false;

      editBlocks = Array.isArray(obj.blocks) ? obj.blocks : [];
      editSpikes = Array.isArray(obj.spikes) ? obj.spikes : [];
      editZiplines = Array.isArray(obj.ziplines) ? obj.ziplines : [];
      editDecorations = Array.isArray(obj.decorations) ? obj.decorations : [];

      updateObjectList();
      return true;
    };

    // 1) Try pure JSON first
    try {
      const parsed = JSON.parse(text);
      if (tryParse(parsed)) return;
    } catch {}

    // 2) Fallback: extract object from JS file
    const match = text.match(/\{[\s\S]*\}/m);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (tryParse(parsed)) return;
      } catch {}
    }

    alert("File parsing failed: invalid or unsupported level file.");
  };

  reader.readAsText(f);
};


openInGame.onclick=()=>{
  const path=gameUrl.value.trim(); if(!path){alert('Enter your game file path');return;}
  window.open(path,'_blank');
};

// --- Selection helpers ---
function isSelected(type,index){ return selection.some(s=>s.type===type && s.index===index); }
function clearSelection(){ selection.length=0; }
function toggleSelection(type,index){ const i=selection.findIndex(s=>s.type===type && s.index===index); if(i>=0) selection.splice(i,1); else selection.push({type,index}); }

// --- File download ---
function downloadFile(content,filename,mime){ const blob=new Blob([content],{type:mime}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=filename; a.click(); URL.revokeObjectURL(url); }

// --- Initialize ---
updateObjectList();
render();
