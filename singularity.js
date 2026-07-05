let particles = [];
let stars = [];
let dustClouds = [];
let projectedParticles = [];
const numParticles = 4500;

// Углы поворота и сглаживание
let pitch = 0.35;
let yaw = 0;
let targetPitch = 0.35;
let targetYaw = 0;
let basePitch = 0.35; // Сохраняет последний заданный пользователем наклон камеры

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

// Глобальные переменные для плазменных вспышек в диске
let flares = [];
const numFlares = 3; // Количество одновременно существующих бурь

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector('.canvas-container'));
  textFont('monospace');
  
  recalculateSizes();
  generateStars();
  generateDust();
  
  // Инициализация блуждающих вспышек плазмы
  for (let i = 0; i < numFlares; i++) {
    resetFlare(i);
  }
  
  for (let i = 0; i < numParticles; i++) {
    projectedParticles.push({
      sx: 0, sy: 0, sz: 0,
      psx: 0, psy: 0, psz: 0,
      dFromCenter: 0,
      intensity: 0,
      active: false
    });
  }
  
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
  let starColors = [
    color(175, 200, 255), // Голубоватые звезды
    color(255, 255, 255), // Чисто белые
    color(255, 240, 210), // Слегка желтые
    color(255, 215, 175)  // Золотистые
  ];
  
  for (let i = 0; i < 150; i++) {
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(Math.random() * 2 - 1);
    
    // Распределение звезд на 3 слоя дальности для параллакса
    let layer = Math.floor(Math.random() * 3);
    let rSky, parallaxFactor, baseSize;
    
    if (layer === 0) { // Далекий фоновый слой
      rSky = Math.min(width, height) * 0.95;
      parallaxFactor = 0.75; // Движутся медленнее
      baseSize = Math.random() * 0.8 + 0.3;
    } else if (layer === 1) { // Средний слой
      rSky = Math.min(width, height) * 0.75;
      parallaxFactor = 1.0;
      baseSize = Math.random() * 1.2 + 0.5;
    } else { // Ближний передний слой
      rSky = Math.min(width, height) * 0.55;
      parallaxFactor = 1.35; // Движутся заметно быстрее
      baseSize = Math.random() * 1.8 + 0.8;
    }
    
    stars.push({
      x: rSky * Math.sin(phi) * Math.cos(theta),
      y: rSky * Math.sin(phi) * Math.sin(theta),
      z: rSky * Math.cos(phi),
      size: baseSize,
      brightness: Math.random() * 120 + 60,
      col: random(starColors),
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      parallax: parallaxFactor
    });
  }
}

function generateDust() {
  dustClouds = [];
  let rSky = Math.min(width, height) * 0.70;
  
  let dustColors = [
    color(12, 15, 55, 7),
    color(8, 25, 75, 6),
    color(30, 12, 60, 5),
    color(5, 10, 45, 8),
    color(18, 12, 48, 6)
  ];
  
  let baseSize = Math.min(width, height) * 0.35;
  for (let i = 0; i < 45; i++) {
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(Math.random() * 2 - 1);
    let col = random(dustColors);
    dustClouds.push({
      x: rSky * Math.sin(phi) * Math.cos(theta),
      y: rSky * Math.sin(phi) * Math.sin(theta),
      z: rSky * Math.cos(phi),
      size: Math.random() * baseSize + baseSize * 0.4,
      col: col,
      pulseSpeed: Math.random() * 0.008 + 0.003,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }
}

// Сброс и создание новой вспышки на случайном радиусе диска
function resetFlare(i) {
  flares[i] = {
    r: minRadius * 1.25 + Math.random() * (maxRadius - minRadius * 1.6),
    angle: Math.random() * Math.PI * 2,
    speed: 0.10 / Math.sqrt(minRadius * 1.5),
    life: Math.random() * 200 + 150
  };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateSizes();
  generateStars();
  generateDust();
  for (let p of particles) {
    p.r = minRadius + Math.pow(Math.random(), 1.6) * (maxRadius - minRadius);
    p.y = (Math.random() - 0.5) * (p.r * 0.02 + 0.8);
  }
}

class Particle {
  constructor(r, angle) {
    this.r = r;
    this.angle = angle;
    this.prevAngle = angle;
    this.speed = 0.08 / Math.sqrt(r);
    this.y = (Math.random() - 0.5) * (r * 0.02 + 0.8);
  }
  
  update() {
    this.prevAngle = this.angle;
    let timeDilation = Math.sqrt(Math.max(0.05, 1.0 - (minRadius * 0.95) / this.r));
    let vortexBoost = Math.pow(minRadius / this.r, 2.0) * 0.04;
    this.angle += this.speed * timeDilation + vortexBoost;
  }
}

// Отрисовка трехмерной координатной сетки гравитационной воронки (funnel)
function drawSpacetimeGrid() {
  let numCircles = 6;
  let numRadialLines = 12;
  let rStart = minRadius * 1.05;
  let rEnd = maxRadius * 1.4;
  
  stroke(30, 95, 130, 20); // Тонкий неоново-бирюзовый цвет сетки с низкой альфой
  strokeWeight(0.85);
  noFill();
  
  // 1. Отрисовка концентрических колец сетки, прогибающихся вниз в 3D
  for (let i = 0; i < numCircles; i++) {
    let R = lerp(rStart, rEnd, i / (numCircles - 1));
    
    // Формула прогиба сетки по оси Y (чем ближе к сингулярности, тем глубже воронка)
    let y = -minRadius * 1.5 * Math.pow(minRadius / R, 1.4);
    
    let numSegments = 40;
    let prevX = null;
    let prevY = null;
    
    for (let j = 0; j <= numSegments; j++) {
      let theta = (j / numSegments) * Math.PI * 2;
      let x = R * Math.cos(theta);
      let z = R * Math.sin(theta);
      
      let r1 = rotX(x, y, z, pitch);
      let r2 = rotY(r1.x, r1.y, r1.z, yaw);
      
      let dist2D = Math.sqrt(r2.x * r2.x + r2.y * r2.y);
      let lensedDist = dist2D;
      if (r2.z > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(r2.z, 0, 400, 0, 1, true);
        lensedDist = lerp(dist2D, lensedDist1, k);
      }
      
      let finalX = (r2.x / dist2D) * lensedDist + width / 2;
      let finalY = (r2.y / dist2D) * lensedDist + height / 2;
      
      // Скрываем участки сетки, уходящие за горизонт событий
      if (r2.z > 0 && lensedDist < R_shadow) {
        prevX = null;
        prevY = null;
        continue;
      }
      
      if (prevX !== null && prevY !== null) {
        line(prevX, prevY, finalX, finalY);
      }
      
      prevX = finalX;
      prevY = finalY;
    }
  }
  
  // 2. Отрисовка радиальных лучей воронки (сэмплируем по точкам для плавной кривизны)
  let numSamples = 10;
  for (let i = 0; i < numRadialLines; i++) {
    let phi = (i / numRadialLines) * Math.PI * 2;
    let prevX = null;
    let prevY = null;
    
    for (let j = 0; j < numSamples; j++) {
      let R = lerp(rStart, rEnd, j / (numSamples - 1));
      let y = -minRadius * 1.5 * Math.pow(minRadius / R, 1.4);
      
      let x = R * Math.cos(phi);
      let z = R * Math.sin(phi);
      
      let r1 = rotX(x, y, z, pitch);
      let r2 = rotY(r1.x, r1.y, r1.z, yaw);
      
      let dist2D = Math.sqrt(r2.x * r2.x + r2.y * r2.y);
      let lensedDist = dist2D;
      if (r2.z > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(r2.z, 0, 400, 0, 1, true);
        lensedDist = lerp(dist2D, lensedDist1, k);
      }
      
      let finalX = (r2.x / dist2D) * lensedDist + width / 2;
      let finalY = (r2.y / dist2D) * lensedDist + height / 2;
      
      if (r2.z > 0 && lensedDist < R_shadow) {
        prevX = null;
        prevY = null;
        continue;
      }
      
      if (prevX !== null && prevY !== null) {
        line(prevX, prevY, finalX, finalY);
      }
      
      prevX = finalX;
      prevY = finalY;
    }
  }
}

function draw() {
  background(0, 0, 0);
  
  let isInside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  
  if (isInside && mouseIsPressed) {
    let sensitivity = 0.009;
    targetYaw += (mouseX - pmouseX) * sensitivity;
    
    // Сохраняем последний заданный пользователем наклон в basePitch
    basePitch += (mouseY - pmouseY) * sensitivity;
    basePitch = constrain(basePitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    targetPitch = basePitch;
    
    blowTarget = 1.6;
  } else {
    targetYaw += 0.002;
    // Камера дрейфует относительно того угла (basePitch), который задал пользователь
    targetPitch = basePitch + Math.sin(frameCount * 0.0015) * 0.06;
    targetPitch = constrain(targetPitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
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
      let next = (currentStyle + 1) % 4;
      triggerTransition(next);
      modeTimer = 0;
    }
  }
  
  modeTimer++;
  if (modeTimer > 180) { 
    let next = (currentStyle + 1) % 4;
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
  
  // Обновление физики плазменных вспышек
  for (let i = 0; i < numFlares; i++) {
    let f = flares[i];
    let timeDilation = Math.sqrt(Math.max(0.05, 1.0 - (minRadius * 0.95) / f.r));
    f.angle += f.speed * timeDilation;
    f.life--;
    if (f.life <= 0) {
      resetFlare(i);
    }
  }
  
  // Рисуем туманности на заднем плане
  for (let d of dustClouds) {
    let r1 = rotX(d.x, d.y, d.z, pitch);
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
      
      let currentSize = d.size * (1 + Math.sin(frameCount * d.pulseSpeed + d.pulsePhase) * 0.15);
      
      if (finalX >= -currentSize && finalX < width + currentSize && 
          finalY >= -currentSize && finalY < height + currentSize) {
        
        noStroke();
        let steps = 4;
        for (let step = steps; step > 0; step--) {
          let stepSize = currentSize * (step / steps);
          let alphaFactor = 1 - (step / (steps + 1));
          let c = d.col;
          fill(red(c), green(c), blue(c), alpha(c) * alphaFactor);
          ellipse(finalX, finalY, stepSize, stepSize);
        }
      }
    }
  }
  
  // Рисуем звезды с эффектом деформации в дуги Эйнштейна и 3D-параллаксом
  for (let s of stars) {
    // Вращение с учетом индивидуального коэффициента сдвига (параллакса)
    let r1 = rotX(s.x, s.y, s.z, pitch * s.parallax);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw * s.parallax);
    let sx = r2.x; let sy = r2.y; let sz = r2.z;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    if (dist2D > 0) {
      let lensedDist = dist2D;
      let lensedDist1 = dist2D;
      if (sz > 0) {
        lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(sz, 0, 400, 0, 1, true);
        lensedDist = lerp(dist2D, lensedDist1, k);
      }
      
      let finalX = (sx / dist2D) * lensedDist + width / 2;
      let finalY = (sy / dist2D) * lensedDist + height / 2;
      
      if (sz > 0 && lensedDist < R_shadow) {
        continue;
      }
      
      if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) {
        let stretchRatio = lensedDist / dist2D;
        
        // Индивидуальная пульсация яркости (мерцание) звезды
        let currentBrightness = s.brightness + Math.sin(frameCount * s.twinkleSpeed) * 35;
        let c = s.col;
        
        // Если звезда линзируется, она тангенциально растягивается в световую дугу
        if (sz > 0 && stretchRatio > 1.05) {
          let angle = Math.atan2(finalY - height / 2, finalX - width / 2);
          let arcLength = s.size * constrain(stretchRatio * 1.5, 1.0, 16.0);
          
          // Вычисляем вектор касательной, перпендикулярный радиальному радиусу
          let dx = -Math.sin(angle) * (arcLength / 2);
          let dy = Math.cos(angle) * (arcLength / 2);
          
          stroke(red(c), green(c), blue(c), currentBrightness);
          strokeWeight(s.size);
          line(finalX - dx, finalY - dy, finalX + dx, finalY + dy);
        } else {
          // Обычная звезда без линзирования на отдалении
          fill(red(c), green(c), blue(c), currentBrightness);
          noStroke();
          ellipse(finalX, finalY, s.size, s.size);
        }
      }
    }
  }
  
  // Отрисовываем 3D сетку пространства
  drawSpacetimeGrid();
  
  let pulse = 1.0 + Math.sin(frameCount * 0.015) * 0.03;
  let activeCount = numParticles;
  if (currentStyle === 3 && nextStyle === 3) {
    activeCount = 2500; 
  }
  
  let pIdx = 0;
  let storm1 = (frameCount * 0.015) % (Math.PI * 2);
  let storm2 = (-frameCount * 0.009 + 2.0) % (Math.PI * 2);
  
  for (let i = 0; i < activeCount; i++) {
    let p = particles[i];
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
    
    let renderAngle = p.angle + (p.r * 0.008);
    let prevAngle = p.prevAngle + (p.r * 0.008);
    
    let x3d = currentR * Math.cos(renderAngle);
    let z3d = currentR * Math.sin(renderAngle);
    
    let r1 = rotX(x3d, y3d, z3d, pitch);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw);
    
    let sx = r2.x;
    let sy = r2.y;
    let sz = r2.z;
    
    let prevX3d = currentR * Math.cos(prevAngle);
    let prevZ3d = currentR * Math.sin(prevAngle);
    
    let pr1 = rotX(prevX3d, y3d, prevZ3d, pitch);
    let pr2 = rotY(pr1.x, pr1.y, pr1.z, yaw);
    
    let psx = pr2.x;
    let psy = pr2.y;
    let psz = pr2.z;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    let dist2D_prev = Math.sqrt(psx * psx + psy * psy);
    
    if (dist2D > 0 && dist2D_prev > 0) {
      let intensity = map(p.r, minRadius, maxRadius, 1.0, 0.12);
      
      // Релятивистский эффект Доплера
      let rv1 = rotX(-Math.sin(p.angle), 0, Math.cos(p.angle), pitch);
      let rv2 = rotY(rv1.x, rv1.y, rv1.z, yaw);
      let vz_rotated = rv2.z;
      
      let dopplerShift = -vz_rotated * 0.45;
      intensity += dopplerShift;
      
      // Локальные плазменные вспышки (создают блуждающие яркие очаги газа в диске)
      let intensityBoost = 0;
      for (let f of flares) {
        let angleDiff = Math.abs((p.angle % (Math.PI * 2)) - (f.angle % (Math.PI * 2)));
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        
        let distR = Math.abs(p.r - f.r);
        if (angleDiff < 0.28 && distR < 25) {
          let factor = (1.0 - angleDiff / 0.28) * (1.0 - distR / 25);
          intensityBoost += factor * 0.65;
        }
      }
      intensity += intensityBoost;
      
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
      let fadeStart = maxRenderRadius * 0.75;
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
      let finalDistPrev = dist2D_prev;
      
      let cosPitchFactor = Math.abs(Math.cos(pitch));
      
      if (sz > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        let k = map(sz, 0, 30, 0, 1, true) * cosPitchFactor; 
        finalDist1 = lerp(dist2D, lensedDist1, k);
      }
      
      if (psz > 0) {
        let lensedDistPrev = (dist2D_prev + Math.sqrt(dist2D_prev * dist2D_prev + 4 * RE * RE)) / 2;
        let kPrev = map(psz, 0, 30, 0, 1, true) * cosPitchFactor;
        finalDistPrev = lerp(dist2D_prev, lensedDistPrev, kPrev);
      }
      
      let sx1 = (sx / dist2D) * finalDist1;
      let sy1 = (sy / dist2D) * finalDist1;
      let dFromCenter1 = Math.sqrt(sx1 * sx1 + sy1 * sy1);
      
      let psx1 = (psx / dist2D_prev) * finalDistPrev;
      let psy1 = (psy / dist2D_prev) * finalDistPrev;
      
      if (dFromCenter1 > fadeStart) {
        boundaryFade = map(dFromCenter1, fadeStart, maxRenderRadius, 1.0, 0.0);
        boundaryFade = constrain(boundaryFade, 0, 1);
      }
      
      let pp = projectedParticles[pIdx];
      pp.sx = sx1;
      pp.sy = sy1;
      pp.sz = sz;
      pp.psx = psx1;
      pp.psy = psy1;
      pp.psz = psz;
      pp.dFromCenter = dFromCenter1;
      pp.intensity = intensity * boundaryFade;
      pp.active = true;
      pIdx++;
    }
  }
  
  for (let i = pIdx; i < numParticles; i++) {
    projectedParticles[i].active = false;
  }
  
  let drawGrid = currentStyle !== 3 || nextStyle !== 3;
  let drawSmooth = currentStyle === 3 || nextStyle === 3;
  
  let gridOpacity = 255;
  let smoothOpacity = 255;
  
  if (transitionProgress < 1.0) {
    if (currentStyle === 3) {
      smoothOpacity = (1.0 - transitionProgress) * 255;
      gridOpacity = transitionProgress * 255;
    } else if (nextStyle === 3) {
      smoothOpacity = transitionProgress * 255;
      gridOpacity = (1.0 - transitionProgress) * 255;
    }
  }
  
  if (drawGrid) {
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
    
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active) {
        if (!(pp.sz > 0 && pp.dFromCenter < R_shadow)) {
          addToGrid(pp.sx, pp.sy, pp.intensity, pp.sz);
        }
      }
    }
    
    let offset = 0;
    if (transitionProgress < 1.0 && currentStyle !== 3 && nextStyle !== 3) {
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
        
        if (cell.count > 0) {
          let val = constrain(cell.brightness * 0.45, 0, 1.25);
          
          let redshift = map(dFromCenter, R_shadow, R_shadow * 1.45, 1.0, 0.0, true);
          
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
          
          // Физическое гравитационное красное смещение цвета (redshift) у горизонта событий
          if (redshift > 0) {
            let redshiftCol = color(95, 8, 12);
            col = lerpColor(col, redshiftCol, redshift * 0.85);
            val = lerp(val, val * 0.2, redshift);
          }
          
          let activeStyleToDraw = currentStyle === 3 ? nextStyle : currentStyle;
          
          if (offset > 0.5) {
            let rCol = color(red(col), 0, 0, gridOpacity);
            let cColDirect = color(0, green(col), blue(col), gridOpacity);
            drawCellContent(activeStyleToDraw, c, r, centerX - offset, centerY, rCol, val, cell);
            drawCellContent(activeStyleToDraw, c, r, centerX + offset, centerY, cColDirect, val, cell);
          } else {
            col.setAlpha(gridOpacity);
            drawCellContent(activeStyleToDraw, c, r, centerX, centerY, col, val, cell);
          }
        }
      }
    }
  }
  
  if (drawSmooth) {
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active && pp.sz > 0 && pp.dFromCenter >= R_shadow) {
        drawSmoothParticle(pp.sx, pp.sy, pp.psx, pp.psy, pp.intensity, smoothOpacity);
      }
    }
    
    fill(0, 0, 0);
    noStroke();
    ellipse(width / 2, height / 2, R_shadow * 2, R_shadow * 2);
    
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active && pp.sz <= 0) {
        drawSmoothParticle(pp.sx, pp.sy, pp.psx, pp.psy, pp.intensity, smoothOpacity);
      }
    }
  }
}

function drawSmoothParticle(sx, sy, psx, psy, val, opacity) {
  let dFromCenter = Math.sqrt(sx * sx + sy * sy);
  let redshift = map(dFromCenter, R_shadow, R_shadow * 1.45, 1.0, 0.0, true);
  let localVal = val;
  
  let col;
  if (localVal < 0.25) {
    col = lerpColor(color(90, 8, 12), color(220, 45, 10), map(localVal, 0.12, 0.25, 0, 1));
  } else if (localVal < 0.55) {
    col = lerpColor(color(220, 45, 10), color(255, 130, 0), map(localVal, 0.25, 0.55, 0, 1));
  } else if (localVal < 0.85) {
    col = lerpColor(color(255, 130, 0), color(255, 230, 100), map(localVal, 0.55, 0.85, 0, 1));
  } else {
    col = lerpColor(color(255, 230, 100), color(255, 255, 255), map(constrain(localVal, 0.85, 1.25), 0.85, 1.25, 0, 1));
  }
  
  // Применяем гравитационное красное смещение
  if (redshift > 0) {
    let redshiftCol = color(95, 8, 12);
    col = lerpColor(col, redshiftCol, redshift * 0.85);
    localVal = lerp(localVal, localVal * 0.2, redshift);
  }
  
  let weight = map(localVal, 0, 1, 1.0, 2.5);
  stroke(red(col), green(col), blue(col), opacity);
  strokeWeight(weight);
  
  line(psx + width / 2, psy + height / 2, sx + width / 2, sy + height / 2);
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
    let matrixChars = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
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

// Поворот по оси Y
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
    
    let next = (currentStyle + 1) % 4;
    triggerTransition(next);
    modeTimer = 0;
  }
}