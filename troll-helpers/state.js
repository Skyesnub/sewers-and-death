// state.js
import {
  leMeow, vineBoom, leScream, restart, adminModeSound,
  PRightImg1, PRightImg2, PLeftImg1, PLeftImg2,
  PstandStill, player_glow,
  PDeathL1, PDeathL2, PDeathL3,
  PDeathR1, PDeathR2, PDeathR3,
  blockTexture, decoBlockTexture,
  spike1, spike2, spike3, spike4,
  heavenspike1, heavenspike2, heavenspike3, heavenspike4,
  glowingKey,
  decoBlockTexture2, iceBlockTexture,
  finishLevelSound,
  jumpSound,
  cloud1Texture,
  cloud2Texture,
  cloud3Texture,
  heavenBlockTexture,
  heavenDecoBlockTexture,
  heavenDecoBlockTexture2
} from './assets.js';

export const state = {
  // player movement
  playerX: 100,
  playerY: 600,
  velo: 0,
  inputLeft: false,
  inputRight: false,
  goingUpAdmin: false,
  goingDownAdmin: false,
  adminMode: false,
  justJumped: false,
  justJumpedTimer: 0,
  coyoteChecker: 5,
  isonGround: false,

  levelLoading: false,
  completedLevel: null,
  pendingLevelChange: null,

  cloudMoveUpSpeed: 3,
  playerOnCloud: false,

  xAcceleration: 0.25,
  initAnimSpeed: 1,
  maxAnimSpeed: 10,
  curAnimSpeed: 10,
  slipping: false,
  momentum: 0,

  speedrunTimerExists: false,
  levelPhase: 'sewer',

  // ziplines
  onZipline: false,
  currentZipline: null,
  ziplineProgress: 0,

  // player animation
  dead: false,
  deadDirection: null,
  Img1_2Alive: 1,
  Img1_2_3Dead: 1,
  player_switchIMG_timerAlive: 10,
  player_switchIMG_timerDead: 13,
  player_switchIMG_constAlive: 10,
  player_switchIMG_constDead: 13,

  // blocks / spikes
  blocks: [],
  spikes: [],
  ziplines: [],
  deco: [],
  hitboxes: false,
  hitboxTrail: [],
  hitboxTrailOn: false,

  //menus
  settingsMenuOpen: false,
  currentVolume: 100,

  // images & sounds (imported from assets.js)
  player_glow,
  PRightImg1,
  PRightImg2,
  PLeftImg1,
  PLeftImg2,
  PstandStill,
  PDeathL1,
  PDeathL2,
  PDeathL3,
  PDeathR1,
  PDeathR2,
  PDeathR3,

  blockTexture,
  iceBlockTexture,
  decoBlockTexture,
  decoBlockTexture2,
  spike1,
  spike2,
  spike3,
  spike4,
  heavenspike1,
  heavenspike2,
  heavenspike3,
  heavenspike4,
  heavenBlockTexture,
  heavenDecoBlockTexture,
  heavenDecoBlockTexture2,

  cloud1Texture,
  cloud2Texture,
  cloud3Texture,

  leMeow,
  vineBoom,
  leScream,
  restart,
  adminModeSound,
  finishLevelSound,
  jumpSound,

  glowingKey,

  // level state
  minilevelStr: 'lvl1',
  startX: 100,
  startY: 600,
  defaultStartX: 100,
  defaultStartY: 600,
  playerWidth: 40,
  playerSize: 50,
  playerIMGSize: 60,
  playerAnimSpeed: 10,
  gravity: 2,
  termVelo: 30,
  jumpVelo: 22,
  justJumpedConst: 10,
  coyoteTime: 5,
  zipLineJumpConst: 15,
  spikeLeniency: 15,

  //key
  keyMovingUp: true,
  keyMovingDown: false,
  keySpeed: 0.25,
  keyMaxDist: 10,
  keyDefaultX: 1350,
  keyDefaultY: 100,
  keyStartX: 1350,
  keyStartY: 100,
  keyX: 1350,
  keyY: 100,
  keyCollected: false,
  keySize: 100,
  keyAnimationFinished: false,
  keySnapped: false,
  keyFallVelocity: 0,
  keyFallGravity: 2,
  keyHopVelocity: -24,
  keyFallStarted: false,
  finishSoundPlayed: false,

  levelTransitioning: false,

  speedrunStarted: false,
  speedrunTimer: 0,

  // admin
  adminPassword: 'admin',
  attemptedAdminPWD: '',

  playerHitbox : {
    offsetX: 18,      // padding from left/right edges
    offsetY: 10,      // padding from top/bottom edges
    width: 20,   // width minus padding
    height: 40    // height minus padding
  }
};

window.state = state;

