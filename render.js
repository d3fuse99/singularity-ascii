function drawSpacetimeGrid() {
  let numCircles = 6;
  let numRadialLines = 12;
  let rStart = minRadius * 1.05;
  let rEnd = maxRadius * 1.4;
  let numSamples = 12;
  
  stroke(30, 95, 130, 20);
  strokeWeight(0.85);
  noFill();
  
  for (let i = 0; i < numCircles; i++) {
    let R = lerp(rStart, rEnd, i / (numCircles - 1));
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
      
      if (r2.z > 0 && lensedDist < R_shadow) {
        continue;
      }
      
      if (prevX !== null && prevY !== null) {
        line(prevX, prevY, finalX, finalY);
      }
      
      prevX = finalX;
      prevY = finalY;
    }
  }
  
  for (let i = 0; i < numRadialLines; i++) {
    let phi = (i / numRadialLines) * Math.PI * 2;
    let prevX = null;
    let prevY = null;
    
    for (let j = 0; j < numSamples; j++) {
      let R = lerp(rStart, rEnd, j / (numSamples - 1));
      let y = -minRadius * 1.5 * Math.pow(minRadius / R, 1.4);
      
      let twist = Math.pow(minRadius / R, 1.2) * 0.45;
      let currentPhi = phi + twist;
      
      let x = R * Math.cos(currentPhi);
      let z = R * Math.sin(currentPhi);
      
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
    col = lerpColor(color(255, 230, 100), color(255, 255, 255), map(constrain(localVal, 0.85, 1.25), 0.85, 1.25, 0, 1));
  } else {
    col = lerpColor(color(255, 230, 100), color(255, 255, 255), map(constrain(localVal, 0.85, 1.25), 0.85, 1.25, 0, 1));
  }
  
  if (redshift > 0) {
    let redshiftCol = color(95, 8, 12);
    col = lerpColor(col, redshiftCol, redshift * 0.85);
    localVal = lerp(localVal, localVal * 0.2, redshift);
  }
  
  if (localVal > 1.0) {
    let shockwaveCol = color(205, 245, 255);
    col = lerpColor(col, shockwaveCol, map(constrain(localVal, 1.0, 1.8), 1.0, 1.8, 0, 1));
  }
  
  let weight = map(localVal, 0, 1, 1.0, 2.5);
  stroke(red(col), green(col), blue(col), opacity);
  strokeWeight(weight);
  
  let d = dist(psx, psy, sx, sy);
  let maxLen = 8.0;
  let drawX = psx;
  let drawY = psy;
  
  if (d > maxLen && d > 0) {
    drawX = sx + ((psx - sx) / d) * maxLen;
    drawY = sy + ((psy - sy) / d) * maxLen;
  }
  
  line(drawX + width / 2, drawY + height / 2, sx + width / 2, sy + height / 2);
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