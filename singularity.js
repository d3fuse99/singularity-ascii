function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent(document.querySelector('.canvas-container'));
  textFont('monospace');
  
  recalculateSizes();
  generateStars();
  generateDust();
  
  for (let i = 0; i < numFlares; i++) {
    resetFlare(i);
  }
  
  projectedParticles = [];
  for (let i = 0; i < numParticles; i++) {
    projectedParticles.push({
      sx: 0, sy: 0, sz: 0,
      psx: 0, psy: 0, psz: 0,
      dFromCenter: 0,
      intensity: 0,
      active: false
    });
  }
  
  particles = [];
  for (let i = 0; i < numParticles; i++) {
    let r = minRadius + Math.pow(Math.random(), 1.6) * (maxRadius - minRadius);
    let angle = Math.random() * Math.PI * 2;
    particles.push(new Particle(r, angle));
  }
}

function draw() {
  background(0, 0, 0);
  
  autoPulse = 1.0 + Math.sin(frameCount * 0.012) * 0.12;
  
  let isInside = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  if (isInside && mouseIsPressed) {
    let sensitivity = 0.009;
    targetYaw += (mouseX - pmouseX) * sensitivity;
    basePitch += (mouseY - pmouseY) * sensitivity;
    basePitch = constrain(basePitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    targetPitch = basePitch;
    blowTarget = 1.6;
  } else {
    targetYaw += 0.002;
    targetPitch = basePitch + Math.sin(frameCount * 0.0015) * 0.06;
    targetPitch = constrain(targetPitch, -Math.PI / 2 + 0.1, Math.PI / 2 - 0.1);
    blowTarget = 1.0;
  }
  
  pitch = lerp(pitch, targetPitch, 0.08);
  yaw = lerp(yaw, targetYaw, 0.08);
  blow = lerp(blow, blowTarget, 0.08);
  
  if (glitchActive) {
    glitchTimer--;
    if (glitchTimer <= 0) glitchActive = false;
  }
  
  if (rippleActive) {
    rippleDist += 12;
    if (rippleDist > Math.max(width, height) * 0.9) {
      rippleActive = false;
    }
  }
  
  if (transitionCooldown > 0) transitionCooldown--;
  
  if (autoCycle) {
    modeTimer++;
    if (modeTimer > 240) { 
      let next = (currentStyle + 1) % 4;
      triggerTransition(next);
      modeTimer = 0;
    }
  }
  
  if (transitionProgress < 1.0) {
    transitionProgress += 0.05;
    if (transitionProgress >= 1.0) {
      currentStyle = nextStyle;
      activeThemeIndex = (activeThemeIndex + 1) % 4;
      transitionProgress = 1.0;
    }
  }
  
  // Обновление вспышек
  for (let i = 0; i < numFlares; i++) {
    let f = flares[i];
    let timeDilation = Math.sqrt(Math.max(0.05, 1.0 - (minRadius * 0.95) / f.r));
    f.angle += f.speed * timeDilation;
    f.life--;
    if (f.life <= 0) resetFlare(i);
  }
  
  // Отрисовка пылевых туманностей
  for (let d of dustClouds) {
    let r1 = rotX(d.x, d.y, d.z, pitch);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw);
    let sx = r2.x, sy = r2.y, sz = r2.z;
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
      
      if (sz > 0 && lensedDist < R_shadow) continue;
      
      let currentSize = d.size * (1 + Math.sin(frameCount * d.pulseSpeed + d.pulsePhase) * 0.15);
      if (finalX >= -currentSize && finalX < width + currentSize && 
          finalY >= -currentSize && finalY < height + currentSize) {
        noStroke();
        let steps = 3;
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
  
  // Отрисовка звезд с гравитационными дугами
  for (let s of stars) {
    let r1 = rotX(s.x, s.y, s.z, pitch * s.parallax);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw * s.parallax);
    let sx = r2.x, sy = r2.y, sz = r2.z;
    if (sz <= 0) continue;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    if (dist2D > 0) {
      let lensedDist = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
      let finalX = (sx / dist2D) * lensedDist + width / 2;
      let finalY = (sy / dist2D) * lensedDist + height / 2;
      
      if (lensedDist < R_shadow) continue;
      
      if (finalX >= 0 && finalX < width && finalY >= 0 && finalY < height) {
        let stretchRatio = lensedDist / dist2D;
        let currentBrightness = s.brightness + Math.sin(frameCount * s.twinkleSpeed) * 35;
        let c = s.col;
        
        if (stretchRatio > 1.05) {
          let angle = Math.atan2(finalY - height / 2, finalX - width / 2);
          let arcLength = s.size * constrain(stretchRatio * 1.5, 1.0, 16.0);
          let dx = -Math.sin(angle) * (arcLength / 2);
          let dy = Math.cos(angle) * (arcLength / 2);
          stroke(red(c), green(c), blue(c), currentBrightness);
          strokeWeight(s.size);
          line(finalX - dx, finalY - dy, finalX + dx, finalY + dy);
        } else {
          fill(red(c), green(c), blue(c), currentBrightness);
          noStroke();
          ellipse(finalX, finalY, s.size, s.size);
        }
      }
    }
  }
  
  let drawGrid = currentStyle !== 3 || nextStyle !== 3;
  let drawSmooth = currentStyle === 3 || nextStyle === 3;
  
  if (drawSmooth) drawSpacetimeGrid();
  
  let pulse = 1.0 + Math.sin(frameCount * 0.015) * 0.03;
  let activeCount = (currentStyle === 3 && nextStyle === 3) ? 2500 : numParticles;
  let pIdx = 0;
  
  for (let i = 0; i < activeCount; i++) {
    let p = particles[i];
    p.update();
    
    let currentR = p.r * blow * pulse;
    let rippleHeat = 0;
    
    if (rippleActive) {
      let d_from_singularity = p.r * blow;
      let dist_to_wave = Math.abs(d_from_singularity - rippleDist);
      if (dist_to_wave < 60) {
        let waveFactor = Math.sin((d_from_singularity - rippleDist) * 0.12);
        let fade = map(rippleDist, 0, Math.max(width, height) * 0.8, 1.0, 0.0, true);
        currentR += waveFactor * 16 * fade;
        if (waveFactor > 0) rippleHeat = waveFactor * fade * 0.85;
      }
    }
    
    let nRadius = noise(p.r * 0.02, p.angle + frameCount * 0.005);
    currentR += map(nRadius, 0, 1, -6, 6);
    let nHeight = noise(p.r * 0.05, p.angle * 3 - frameCount * 0.01);
    let y3d = p.y + map(nHeight, 0, 1, -1.5, 1.5);
    
    let renderAngle = p.angle + (p.r * 0.008);
    let prevAngle = p.prevAngle + (p.r * 0.008);
    
    let r1 = rotX(currentR * Math.cos(renderAngle), y3d, currentR * Math.sin(renderAngle), pitch);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw);
    let sx = r2.x, sy = r2.y, sz = r2.z;
    
    let pr1 = rotX(currentR * Math.cos(prevAngle), y3d, currentR * Math.sin(prevAngle), pitch);
    let pr2 = rotY(pr1.x, pr1.y, pr1.z, yaw);
    let psx = pr2.x, psy = pr2.y, psz = pr2.z;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    let dist2D_prev = Math.sqrt(psx * psx + psy * psy);
    
    if (dist2D > 0 && dist2D_prev > 0) {
      let intensity = map(p.r, minRadius, maxRadius, 1.0, 0.12);
      let rv1 = rotX(-Math.sin(p.angle), 0, Math.cos(p.angle), pitch);
      let rv2 = rotY(rv1.x, rv1.y, rv1.z, yaw);
      intensity += -rv2.z * 0.45; // Doppler shift
      
      for (let f of flares) {
        let angleDiff = Math.abs((p.angle % (Math.PI * 2)) - (f.angle % (Math.PI * 2)));
        if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
        let distR = Math.abs(p.r - f.r);
        if (angleDiff < 0.28 && distR < 25) {
          intensity += (1.0 - angleDiff / 0.28) * (1.0 - distR / 25) * 0.65;
        }
      }
      intensity += rippleHeat;
      intensity = constrain(intensity, 0.05, 1.8);
      
      let cosPitchFactor = Math.abs(Math.cos(pitch));
      let finalDist1 = dist2D;
      let finalDistPrev = dist2D_prev;
      
      if (sz > 0) {
        let lensedDist1 = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
        finalDist1 = lerp(dist2D, lensedDist1, map(sz, 0, 30, 0, 1, true) * cosPitchFactor);
      }
      if (psz > 0) {
        let lensedDistPrev = (dist2D_prev + Math.sqrt(dist2D_prev * dist2D_prev + 4 * RE * RE)) / 2;
        finalDistPrev = lerp(dist2D_prev, lensedDistPrev, map(psz, 0, 30, 0, 1, true) * cosPitchFactor);
      }
      
      let sx1 = (sx / dist2D) * finalDist1;
      let sy1 = (sy / dist2D) * finalDist1;
      
      let pp = projectedParticles[pIdx];
      pp.sx = sx1;
      pp.sy = sy1;
      pp.sz = sz;
      pp.psx = (psx / dist2D_prev) * finalDistPrev;
      pp.psy = (psy / dist2D_prev) * finalDistPrev;
      pp.psz = psz;
      pp.dFromCenter = Math.sqrt(sx1 * sx1 + sy1 * sy1);
      pp.intensity = intensity;
      pp.active = true;
      pIdx++;
    }
  }
  
  for (let i = pIdx; i < numParticles; i++) {
    projectedParticles[i].active = false;
  }
  
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
    resetGrid(); // Быстрая очистка без аллокации памяти
    
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active && !(pp.sz > 0 && pp.dFromCenter < R_shadow)) {
        addToGrid(pp.sx, pp.sy, pp.intensity, pp.sz);
      }
    }
    
    let offset = 0;
    if (transitionProgress < 1.0 && currentStyle !== 3 && nextStyle !== 3) {
      offset = (1.0 - transitionProgress) * 1.8;
    }
    if (glitchActive) offset += random(1.0, 3.0);
    
    let activeStyleToDraw = currentStyle === 3 ? nextStyle : currentStyle;
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        let cell = grid[c][r];
        if (cell.count === 0) continue;
        
        let centerX = c * cellSize + cellSize / 2;
        let centerY = r * cellSize + cellSize / 2;
        let sx = centerX - width / 2;
        let sy = centerY - height / 2;
        let dFromCenter = Math.sqrt(sx * sx + sy * sy);
        let avgDepth = cell.sumDepth / cell.count;
        
        if (dFromCenter < R_shadow && avgDepth > -4) {
          fill(0, 0, 0);
          noStroke();
          rect(c * cellSize, r * cellSize, cellSize, cellSize);
          continue;
        }
        
        let val = constrain(cell.brightness * 0.45, 0, 1.8);
        let redshift = map(dFromCenter, R_shadow, R_shadow * 1.45, 1.0, 0.0, true);
        let col = getThemeColor(val, activeThemeIndex);
        
        if (redshift > 0) {
          col = lerpColor(col, color(50, 4, 6), redshift * 0.85);
          val = lerp(val, val * 0.2, redshift);
        }
        
        if (offset > 0.5) {
          drawCellContent(activeStyleToDraw, c, r, centerX - offset, centerY, color(red(col), 0, 0, gridOpacity), val, cell);
          drawCellContent(activeStyleToDraw, c, r, centerX + offset, centerY, color(0, green(col), blue(col), gridOpacity), val, cell);
        } else {
          col.setAlpha(gridOpacity);
          drawCellContent(activeStyleToDraw, c, r, centerX, centerY, col, val, cell);
        }
      }
    }
  }
  
  if (drawSmooth) {
    // 1. Задняя часть диска
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active && pp.sz > 0 && pp.dFromCenter >= R_shadow) {
        drawSmoothParticle(pp.sx, pp.sy, pp.psx, pp.psy, pp.intensity, smoothOpacity);
      }
    }
    
    // 2. Фотонная сфера (эффект свечения края тени)
    noFill();
    stroke(255, 230, 200, smoothOpacity * 0.35);
    strokeWeight(1.5);
    ellipse(width / 2, height / 2, R_shadow * 2.08, R_shadow * 2.08);
    
    // 3. Тень черной дыры (Event Horizon)
    fill(0, 0, 0);
    noStroke();
    ellipse(width / 2, height / 2, R_shadow * 2, R_shadow * 2);
    
    // 4. Передняя часть диска
    for (let i = 0; i < numParticles; i++) {
      let pp = projectedParticles[i];
      if (pp.active && pp.sz <= 0) {
        drawSmoothParticle(pp.sx, pp.sy, pp.psx, pp.psy, pp.intensity, smoothOpacity);
      }
    }
  }

  // HUD
  push();
  fill(255, 255, 255, 90);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  let styles = ["DOT MATRIX", "ASCII TERMINAL", "CYBER MATRIX", "SMOOTH RELATIVISTIC"];
  text(`[SPACE] AUTO CYCLE: ${autoCycle ? "ON" : "OFF"} | [←/→] MODE: ${styles[currentStyle]}`, 20, 20);
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  recalculateSizes();
  generateStars();
  generateDust();
  for (let p of particles) {
    let r = minRadius + Math.pow(Math.random(), 1.6) * (maxRadius - minRadius);
    p.init(r, p.angle);
  }
}

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    rippleActive = true;
    rippleDist = 0;
    glitchActive = true;
    glitchTimer = 6;
  }
}

function keyPressed() {
  if (key === ' ') {
    autoCycle = !autoCycle;
  } else if (keyCode === RIGHT_ARROW) {
    triggerTransition((currentStyle + 1) % 4);
    modeTimer = 0;
  } else if (keyCode === LEFT_ARROW) {
    triggerTransition((currentStyle - 1 + 4) % 4);
    modeTimer = 0;
  }
}