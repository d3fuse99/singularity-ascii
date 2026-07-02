let particles = [];
let stars = [];
let numParticles = 4500;

let pitch = 0.35;
let yaw = 0;
let targetPitch = 0.35;
let targetYaw = 0;

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

let eggActive = false;
let eggC = -1;
let eggR = -1;
let eggTimer = 0;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector('.canvas-container'));
  textFont('monospace');
  
  recalculateSizes();
  generateStars();
  
  for (let i = 0; i < numParticles; i++) {
    let r = minRadius + Math.pow(Math.random(), 1.6) * (maxRadius - minRadius);
    let angle = Math.random() * Math.PI * 2;
    particles.push(new Particle(r, angle));
  }
}

function recalculateSizes() {
  cols = Math.floor(width / cellSize);
  rows = Math.floor(height / cellSize);
  
  let referenceSize = Math.min(width, height);
  minRadius = referenceSize * 0.1;
  maxRadius = referenceSize * 0.42;
  
  RE = referenceSize * 0.15;
  R_shadow = referenceSize * 0.09;
}

function generateStars() {
  stars = [];
  let rSky = Math.min(width, height) * 0.75;
  for (let i = 0; i < 150; i++) {
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(Math.random() * 2 - 1);
    stars.push({
      x: rSky * Math.sin(phi) * Math.cos(theta),
      y: rSky * Math.sin(phi) * Math.sin(theta),
      z: rSky * Math.cos(phi),
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random() * 120 + 60
    });
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateSizes();
  generateStars();
  for (let p of particles) {
    p.r = minRadius + Math.pow(Math.random(), 1.6) * (maxRadius - minRadius);
    p.y = (Math.random() - 0.5) * (p.r * 0.02 + 0.8);
  }
}

class Particle {
  constructor(r, angle) {
    this.r = r;
    this.angle = angle;
    this.speed = 0.08 / Math.sqrt(r);
    this.y = (Math.random() - 0.5) * (r * 0.02 + 0.8);
  }
  
  update() {
    this.angle += this.speed;
  }
}

function draw() {
  background(0, 0, 0);
  
  let isInside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  
  if (isInside && mouseIsPressed) {
    let sensitivity = 0.009;
    targetYaw += (mouseX - pmouseX) * sensitivity;
    targetPitch += (mouseY - pmouseY) * sensitivity;
    targetPitch = constrain(targetPitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    
    blowTarget = 1.6;
  } else {
    targetYaw += 0.002;
    blowTarget = 1.0;
  }
  
  pitch = lerp(pitch, targetPitch, 0.08);
  yaw = lerp(yaw, targetYaw, 0.08);
  blow = lerp(blow, blowTarget, 0.08);
  
  if (rippleActive) {
    rippleDist += 12;
    if (rippleDist > Math.max(width, height) * 0.9) {
      rippleActive = false;
    }
  }
  
  if (transitionCooldown > 0) {
    transitionCooldown--;
  }
  
  if (isInside && transitionCooldown === 0) {
    let mouseSpeed = dist(mouseX, mouseY, pmouseX, pmouseY);
    if (mouseSpeed > 45 && transitionProgress >= 1.0) {
      let next = (currentStyle + 1) % 3;
      triggerTransition(next);
      modeTimer = 0;
    }
  }
  
  modeTimer++;
  if (modeTimer > 160) { 
    let next = (currentStyle + 1) % 3;
    triggerTransition(next);
    modeTimer = 0;
  }
  
  if (transitionProgress < 1.0) {
    transitionProgress += 0.05;
    if (transitionProgress >= 1.0) {
      currentStyle = nextStyle;
      transitionProgress = 1.0;
    }
  }
  
  let pulse = 1.0 + Math.sin(frameCount * 0.015) * 0.03;
  
  for (let s of stars) {
    let r1 = rotX(s.x, s.y, s.z, pitch);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw);
    let sx = r2.x; let sy = r2.y; let sz = r2.z;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    if (dist2D > 0) {
      let lensedDist = dist2D;
      if (sz > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(sz, 0, 400, 0, 1, true);
        lensedDist = lerp(dist2D, lensedDist1, k);
      }
      
      let finalX = (sx / dist2D) * lensedDist + width / 2;
      let finalY = (sy / dist2D) * lensedDist + height / 2;
      
      if (sz > 0 && lensedDist < R_shadow) {
        continue;
      }
      
      if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) {
        fill(s.brightness, s.brightness, s.brightness + 15, 180);
        noStroke();
        ellipse(finalX, finalY, s.size, s.size);
      }
    }
  }
  
  grid = [];
  for (let c = 0; c < cols; c++) {
    grid[c] = [];
    for (let r = 0; r < rows; r++) {
      grid[c][r] = {
        brightness: 0,
        sumDepth: 0,
        count: 0,
        maxIntensity: 0
      };
    }
  }
  
  let storm1 = (frameCount * 0.015) % (Math.PI * 2);
  let storm2 = (-frameCount * 0.009 + 2.0) % (Math.PI * 2);
  
  for (let p of particles) {
    p.update();
    
    let currentR = p.r * blow * pulse;
    
    if (rippleActive) {
      let d_from_singularity = p.r * blow;
      let dist_to_wave = Math.abs(d_from_singularity - rippleDist);
      if (dist_to_wave < 60) {
        let waveFactor = Math.sin((d_from_singularity - rippleDist) * 0.12) * 16;
        let fade = map(rippleDist, 0, Math.max(width, height) * 0.8, 1.0, 0.0, true);
        currentR += waveFactor * fade;
      }
    }
    
    let nRadius = noise(p.r * 0.02, p.angle + frameCount * 0.005);
    currentR += map(nRadius, 0, 1, -6, 6);
    
    let nHeight = noise(p.r * 0.05, p.angle * 3 - frameCount * 0.01);
    let y3d = p.y + map(nHeight, 0, 1, -1.5, 1.5);
    
    let x3d = currentR * Math.cos(p.angle);
    let z3d = currentR * Math.sin(p.angle);
    
    let r1 = rotX(x3d, y3d, z3d, pitch);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw);
    
    let sx = r2.x;
    let sy = r2.y;
    let sz = r2.z;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    if (dist2D > 0) {
      let intensity = map(p.r, minRadius, maxRadius, 1.0, 0.12);
      
      let rv1 = rotX(-Math.sin(p.angle), 0, Math.cos(p.angle), pitch);
      let rv2 = rotY(rv1.x, rv1.y, rv1.z, yaw);
      let vz_rotated = rv2.z;
      
      let dopplerShift = -vz_rotated * 0.45;
      intensity += dopplerShift;
      
      let diff1 = Math.abs((p.angle % (Math.PI * 2)) - storm1);
      if (diff1 > Math.PI) diff1 = Math.PI * 2 - diff1;
      if (diff1 < 0.5) {
        intensity += map(diff1, 0, 0.5, 0.4, 0);
      }
      
      let diff2 = Math.abs((p.angle % (Math.PI * 2)) - storm2);
      if (diff2 > Math.PI) diff2 = Math.PI * 2 - diff2;
      if (diff2 < 0.6) {
        intensity += map(diff2, 0, 0.6, 0.3, 0);
      }
      
      intensity = constrain(intensity, 0.05, 1.0);
      
      let maxRenderRadius = Math.min(width, height) * 0.5;
      let boundaryFade = 1.0;
      let pad = 20;
      let fadeWidth = 80;
      
      let screenX_approx = sx + width / 2;
      let screenY_approx = sy + height / 2;
      
      let fadeX = 1.0;
      if (screenX_approx < fadeWidth + pad) {
        fadeX = map(screenX_approx, pad, fadeWidth + pad, 0, 1, true);
      } else if (screenX_approx > width - fadeWidth - pad) {
        fadeX = map(screenX_approx, width - pad, width - fadeWidth - pad, 0, 1, true);
      }
      
      let fadeY = 1.0;
      if (screenY_approx < fadeWidth + pad) {
        fadeY = map(screenY_approx, pad, fadeWidth + pad, 0, 1, true);
      } else if (screenY_approx > height - fadeWidth - pad) {
        fadeY = map(screenY_approx, height - pad, height - fadeWidth - pad, 0, 1, true);
      }
      boundaryFade = fadeX * fadeY;
      
      let finalDist1 = dist2D;
      if (sz > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(sz, 0, 30, 0, 1, true); 
        finalDist1 = lerp(dist2D, lensedDist1, k);
      }
      
      let sx1 = (sx / dist2D) * finalDist1;
      let sy1 = (sy / dist2D) * finalDist1;
      let dFromCenter1 = Math.sqrt(sx1 * sx1 + sy1 * sy1);
      
      if (!(sz > 0 && dFromCenter1 < R_shadow)) {
        addToGrid(sx1, sy1, intensity * boundaryFade, sz);
      }
    }
  }
  
  if (eggTimer > 0) {
    eggTimer--;
    if (eggTimer <= 0) {
      eggActive = false;
    }
  } else if (Math.random() < 0.0004) {
    let possibleCells = [];
    for (let c = 10; c < cols - 10; c++) {
      for (let r = 10; r < rows - 10; r++) {
        let cell = grid[c][r];
        let sx = c * cellSize + cellSize / 2 - width / 2;
        let sy = r * cellSize + cellSize / 2 - height / 2;
        let dFromCenter = Math.sqrt(sx * sx + sy * sy);
        if (cell.count > 0 && dFromCenter > R_shadow * 1.5 && dFromCenter < maxRadius * 0.8) {
          possibleCells.push({c: c, r: r});
        }
      }
    }
    if (possibleCells.length > 0) {
      let chosen = possibleCells[Math.floor(Math.random() * possibleCells.length)];
      eggC = chosen.c;
      eggR = chosen.r;
      eggActive = true;
      eggTimer = 150;
    }
  }
  
  let offset = 0;
  if (transitionProgress < 1.0) {
    offset = (1.0 - transitionProgress) * 1.8;
  }
  if (glitchActive) {
    offset += random(0.6, 1.4);
  }
  
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      let cell = grid[c][r];
      
      let centerX = c * cellSize + cellSize / 2;
      let centerY = r * cellSize + cellSize / 2;
      
      let sx = centerX - width / 2;
      let sy = centerY - height / 2;
      let dFromCenter = Math.sqrt(sx * sx + sy * sy);
      
      let avgDepth = cell.count > 0 ? (cell.sumDepth / cell.count) : 0;
      
      if (dFromCenter < R_shadow) {
        if (cell.count === 0 || avgDepth > -4) {
          fill(0, 0, 0);
          noStroke();
          rect(c * cellSize, r * cellSize, cellSize, cellSize);
          continue;
        }
      }
      
      let isEggCell = false;
      let eggChar = '';
      if (eggActive && r === eggR) {
        if (c === eggC) {
          isEggCell = true;
          eggChar = 'х';
        } else if (c === eggC + 1) {
          isEggCell = true;
          eggChar = 'у';
        } else if (c === eggC + 2) {
          isEggCell = true;
          eggChar = 'й';
        }
      }
      
      if (isEggCell) {
        let opacity = 255;
        if (eggTimer < 20) opacity = map(eggTimer, 0, 20, 0, 255);
        fill(255, 220, 60, opacity);
        textAlign(CENTER, CENTER);
        textSize(cellSize * 1.45);
        text(eggChar, centerX, centerY);
        continue;
      }
      
      if (cell.count > 0) {
        let val = constrain(cell.brightness * 0.45, 0, 1.25);
        
        let redshift = map(dFromCenter, R_shadow, R_shadow * 1.35, 1.0, 0.0, true);
        val = lerp(val, val * 0.15, redshift);
        
        let col;
        if (val < 0.25) {
          col = lerpColor(color(90, 8, 12), color(220, 45, 10), map(val, 0.12, 0.25, 0, 1));
        } else if (val < 0.55) {
          col = lerpColor(color(220, 45, 10), color(255, 130, 0), map(val, 0.25, 0.55, 0, 1));
        } else if (val < 0.85) {
          col = lerpColor(color(255, 130, 0), color(255, 230, 100), map(val, 0.55, 0.85, 0, 1));
        } else {
          col = lerpColor(color(255, 230, 100), color(255, 255, 255), map(constrain(val, 0.85, 1.25), 0.85, 1.25, 0, 1));
        }
        
        if (offset > 0.5) {
          let rCol = color(red(col), 0, 0, 255);
          drawCellContent(currentStyle, c, r, centerX - offset, centerY, rCol, val, cell);
          
          let cCol = color(0, green(col), blue(col), 255);
          drawCellContent(currentStyle, c, r, centerX + offset, centerY, cCol, val, cell);
        } else {
          drawCellContent(currentStyle, c, r, centerX, centerY, col, val, cell);
        }
      }
    }
  }
}

function addToGrid(sx, sy, intensity, sz) {
  if (intensity <= 0) return;
  let screenX = sx + width / 2;
  let screenY = sy + height / 2;
  
  let cCoord = Math.floor(screenX / cellSize);
  let rCoord = Math.floor(screenY / cellSize);
  
  if (cCoord >= 0 && cCoord < cols && rCoord >= 0 && rCoord < rows) {
    let cell = grid[cCoord][rCoord];
    cell.brightness += intensity;
    cell.sumDepth += sz;
    cell.count++;
    if (intensity > cell.maxIntensity) {
      cell.maxIntensity = intensity;
    }
  }
}

function drawCellContent(style, c, r, centerX, centerY, col, val, cell) {
  fill(col);
  if (style === 0) {
    noStroke();
    let rSize = map(constrain(cell.brightness, 0, 2.5), 0, 2.5, 1.5, cellSize * 1.15);
    ellipse(centerX, centerY, rSize, rSize);
    
  } else if (style === 1) {
    let asciiStr = "$@B%8&WMX*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
    let charIdx = Math.floor(map(constrain(val, 0, 1), 0, 1, asciiStr.length - 1, 0));
    let ch = asciiStr.charAt(charIdx);
    
    textAlign(CENTER, CENTER);
    textSize(cellSize * 1.35);
    text(ch, centerX, centerY);
    
  } else if (style === 2) {
    let matrixChars = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ@&$*?!+";
    let ch = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
    
    textAlign(CENTER, CENTER);
    textSize(cellSize * 1.25);
    text(ch, centerX, centerY);
  }
}

function rotX(x, y, z, angle) {
  let cosA = Math.cos(angle);
  let sinA = Math.sin(angle);
  return { x: x, y: y * cosA - z * sinA, z: y * sinA + z * cosA };
}

function rotY(x, y, z, angle) {
  let cosA = Math.cos(angle);
  let sinA = Math.sin(angle);
  return { x: x * cosA + z * sinA, y: y, z: -x * sinA + z * cosA };
}

window.triggerTransition = function(newStyle) {
  if (newStyle === currentStyle || transitionCooldown > 0) return;
  nextStyle = newStyle;
  transitionProgress = 0.0;
  transitionCooldown = 90;
};

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    rippleActive = true;
    rippleDist = 0;
    
    let next = (currentStyle + 1) % 3;
    triggerTransition(next);
    modeTimer = 0;
  }
}