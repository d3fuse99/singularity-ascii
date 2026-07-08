let particles = [];
let stars = [];
let dustClouds = [];
let projectedParticles = [];
const numParticles = 4500;

let pitch = 0.35;
let yaw = 0;
let targetPitch = 0.35;
let targetYaw = 0;
let basePitch = 0.35;

let blow = 1.0;
let blowTarget = 1.0;
let glitchActive = false;
let glitchTimer = 0;

let currentStyle = 0;
let nextStyle = 0;
let transitionProgress = 1.0;
let transitionCooldown = 0;
let modeTimer = 0;

let minRadius;
let maxRadius;
let RE;
let R_shadow;

let cols, rows;
const cellSize = 8;
let grid = [];

let rippleDist = 0;
let rippleActive = false;

let flares = [];
const numFlares = 3;

let autoPulse = 1.0;
let activeThemeIndex = 0;
let autoCycle = true;