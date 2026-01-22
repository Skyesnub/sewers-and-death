import { state } from "./state.js"

// --- Level Loading ---
export async function loadLevel() {
  const levelPath = `../levels/${state.minilevelStr}.js?cacheBust=${Date.now()}`;
  const module = await import(levelPath);
  const levelCustom = module.levelCustom;

  loadBackgroundImage(levelCustom.backgroundImage);

  state.blocks = (levelCustom.blocks ?? []).map(b => ({
    ...b,
    material: b.material ?? "block"
  }));
  state.spikes   = JSON.parse(JSON.stringify(levelCustom.spikes));
  state.ziplines = JSON.parse(JSON.stringify(levelCustom.ziplines));
  state.deco = (levelCustom.decorations ?? []).map(d => ({
    ...d,
    variant: d.variant ?? 1
  }));

  // Initialize cooldown per zipline
  state.ziplines.forEach(zip => zip.cooldown = 0);

  if (levelCustom.spawn) {
    state.startX = levelCustom.spawn.x ?? state.defaultStartX;
    state.startY = levelCustom.spawn.y ?? state.defaultStartY;
  } else {
    state.startX = state.defaultStartX;
    state.startY = state.defaultStartY;
  }
  if (levelCustom.key) {
    state.keyStartX = levelCustom.key.x ?? state.keyDefaultX;
    state.keyStartY = levelCustom.key.y ?? state.keyDefaultY;
  } else {
    state.keyStartX = state.keyDefaultX;
    state.keyStartY = state.keyDefaultY;
  }

  state.keyX = state.keyStartX;
  state.keyY = state.keyStartY;

  state.keyCollected = false;
  state.keySize = 100;
  state.keyX = state.keyStartX
  state.keyY = state.keyStartY

  state.playerX = state.startX;
  state.playerY = state.startY;
  state.velo = 0;
  state.onZipline = false;
  state.currentZipline = null;

  state.levelTransitioning = false;
  state.keyCollected = false;
  state.keyAnimationFinished = false;
  state.keySnapped = false;
  state.keyHopDone = false;
  state.keyFallSpeed = 0;
  state.keyRotation = 0;

  state.inputLeft = false;
  state.inputRight = false;

  state.keyRotation = 0;
  state.hitboxTrail = [];

  state.speedrunStarted = false;
  state.speedrunTimer = 0;
}

export function loadBackgroundImage(name) {
  if (!name) {
    state.backgroundImage = null;
    state.backgroundImageName = null;
    return;
  }
  state.backgroundImageName = name;
  state.backgroundImage = new Image();
  state.backgroundImage.src = `./trollgame_bg_images/${name}`;
}