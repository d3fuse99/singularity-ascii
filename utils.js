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
    color(175, 200, 255),
    color(255, 255, 255),
    color(255, 240, 210),
    color(255, 215, 175)
  ];
  
  for (let i = 0; i < 150; i++) {
    let theta = Math.random() * Math.PI * 2;
    let phi = Math.acos(Math.random() * 2 - 1);
    
    let layer = Math.floor(Math.random() * 3);
    let rSky, parallaxFactor, baseSize;
    
    if (layer === 0) {
      rSky = Math.min(width, height) * 0.95;
      parallaxFactor = 0.75;
      baseSize = Math.random() * 0.8 + 0.3;
    } else if (layer === 1) {
      rSky = Math.min(width, height) * 0.75;
      parallaxFactor = 1.0;
      baseSize = Math.random() * 1.2 + 0.5;
    } else {
      rSky = Math.min(width, height) * 0.55;
      parallaxFactor = 1.35;
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

function resetFlare(i) {
  flares[i] = {
    r: minRadius * 1.25 + Math.random() * (maxRadius - minRadius * 1.6),
    angle: Math.random() * Math.PI * 2,
    speed: 0.10 / Math.sqrt(minRadius * 1.5),
    life: Math.random() * 200 + 150
  };
}

function triggerTransition(next) {
  if (transitionProgress >= 1.0) {
    nextStyle = next;
    transitionProgress = 0.0;
    transitionCooldown = 45;
  }
}

function getThemeColor(val, themeIdx) {
  if (themeIdx === 1) {
    if (val < 0.25) {
      return lerpColor(color(100, 40, 5), color(210, 110, 30), map(val, 0.12, 0.25, 0, 1));
    } else if (val < 0.55) {
      return lerpColor(color(210, 110, 30), color(255, 235, 180), map(val, 0.25, 0.55, 0, 1));
    } else {
      return lerpColor(color(255, 235, 180), color(255, 255, 255), map(constrain(val, 0.55, 1.25), 0.55, 1.25, 0, 1));
    }
  } else if (themeIdx === 2) {
    if (val < 0.25) {
      return lerpColor(color(80, 5, 15), color(180, 40, 10), map(val, 0.12, 0.25, 0, 1));
    } else if (val < 0.55) {
      return lerpColor(color(180, 40, 10), color(255, 110, 0), map(val, 0.25, 0.55, 0, 1));
    } else {
      return lerpColor(color(255, 110, 0), color(255, 215, 0), map(constrain(val, 0.55, 1.25), 0.55, 1.25, 0, 1));
    }
  } else if (themeIdx === 3) {
    if (val < 0.25) {
      return lerpColor(color(65, 15, 10), color(150, 20, 20), map(val, 0.12, 0.25, 0, 1));
    } else if (val < 0.55) {
      return lerpColor(color(150, 20, 20), color(240, 40, 30), map(val, 0.25, 0.55, 0, 1));
    } else {
      return lerpColor(color(240, 40, 30), color(255, 200, 150), map(constrain(val, 0.55, 1.25), 0.55, 1.25, 0, 1));
    }
  } else {
    if (val < 0.25) {
      return lerpColor(color(120, 20, 5), color(255, 90, 0), map(val, 0.12, 0.25, 0, 1));
    } else if (val < 0.55) {
      return lerpColor(color(255, 90, 0), color(255, 190, 20), map(val, 0.25, 0.55, 0, 1));
    } else {
      return lerpColor(color(255, 190, 20), color(255, 255, 255), map(constrain(val, 0.55, 1.25), 0.55, 1.25, 0, 1));
    }
  }
}