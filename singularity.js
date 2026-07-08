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
  
  if (rippleActive) {
    rippleDist += 12;
    if (rippleDist > Math.max(width, height) * 0.9) {
      rippleActive = false;
    }
  }
  
  if (transitionCooldown > 0) {
    transitionCooldown--;
  }
  
  if (autoCycle) {
    modeTimer++;
    if (modeTimer > 180) { 
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
  
  for (let i = 0; i < numFlares; i++) {
    let f = flares[i];
    let timeDilation = Math.sqrt(Math.max(0.05, 1.0 - (minRadius * 0.95) / f.r));
    f.angle += f.speed * timeDilation;
    f.life--;
    if (f.life <= 0) {
      resetFlare(i);
    }
  }
  
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
  
  for (let s of stars) {
    let r1 = rotX(s.x, s.y, s.z, pitch * s.parallax);
    let r2 = rotY(r1.x, r1.y, r1.z, yaw * s.parallax);
    let sx = r2.x; let sy = r2.y; let sz = r2.z;
    
    if (sz <= 0) continue;
    
    let dist2D = Math.sqrt(sx * sx + sy * sy);
    if (dist2D > 0) {
      let lensedDist = (dist2D + Math.sqrt(dist2D * dist2D + 4 * RE * RE)) / 2;
      
      let finalX = (sx / dist2D) * lensedDist + width / 2;
      let finalY = (sy / dist2D) * lensedDist + height / 2;
      
      if (lensedDist < R_shadow) {
        continue;
      }
      
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
  
  if (drawSmooth) {
    drawSpacetimeGrid();
  }
  
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
    
    let rippleHeat = 0;
    if (rippleActive) {
      let d_from_singularity = p.r * blow;
      let dist_to_wave = Math.abs(d_from_singularity - rippleDist);
      if (dist_to_wave < 60) {
        let waveFactor = Math.sin((d_from_singularity - rippleDist) * 0.12);
        let fade = map(rippleDist, 0, Math.max(width, height) * 0.8, 1.0, 0.0, true);
        
        currentR += waveFactor * 16 * fade;
        
        if (waveFactor > 0) {
          rippleHeat = waveFactor * fade * 0.85;
        }
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
      
      let rv1 = rotX(-Math.sin(p.angle), 0, Math.cos(p.angle), pitch);
      let rv2 = rotY(rv1.x, rv1.y, rv1.z, yaw);
      let vz_rotated = rv2.z;
      
      let dopplerShift = -vz_rotated * 0.45;
      intensity += dopplerShift;
      
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
      
      intensity += rippleHeat;
      
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
      
      intensity = constrain(intensity, 0.05, 1.8);
      
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
          let val = constrain(cell.brightness * 0.45, 0, 1.8);
          
          let redshift = map(dFromCenter, R_shadow, R_shadow * 1.45, 1.0, 0.0, true);
          
          let col = getThemeColor(val, activeThemeIndex);
          
          if (redshift > 0) {
            let redshiftCol = color(50, 4, 6);
            col = lerpColor(col, redshiftCol, redshift * 0.85);
            val = lerp(val, val * 0.2, redshift);
          }
          
          if (val > 1.0) {
            let shockwaveCol = color(255, 245, 220);
            col = lerpColor(col, shockwaveCol, map(constrain(val, 1.0, 1.8), 1.0, 1.8, 0, 1));
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

  push();
  fill(255, 255, 255, 60);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(11);
  text("[SPACE] AUTO CYCLE: " + (autoCycle ? "ON" : "OFF"), 20, 20);
  pop();
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

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    rippleActive = true;
    rippleDist = 0;
  }
}

function keyPressed() {
  if (key === ' ') {
    autoCycle = !autoCycle;
  } else if (keyCode === RIGHT_ARROW) {
    let next = (currentStyle + 1) % 4;
    triggerTransition(next);
    modeTimer = 0;
  } else if (keyCode === LEFT_ARROW) {
    let next = (currentStyle - 1 + 4) % 4;
    triggerTransition(next);
    modeTimer = 0;
  }
}