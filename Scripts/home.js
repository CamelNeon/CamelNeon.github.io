const avoider = document.getElementById('avoider');

// State for position (offset FROM CENTER in px)
let posX = 0, posY = 0;
let vx = 0, vy = 0;

// State for 2D rotation (in degrees)
let rotation = 0;
let vRot = 0;

// Mouse location
let mouseX = 0, mouseY = 0;

// Viewport center
let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

// --- Physics Constants ---
const AVOID_RADIUS = 180;      // px
const MAX_AVOID_FORCE = 1.0;   // acceleration when very close
const ATTRACTION = 0.005;      // pull back to center when mouse far
const FRICTION = 0.90;         // velocity damping each frame
const MAX_SPEED = 60;          // px per frame clamp

const TILT_FORCE = 0.0010;      // How much the mouse's horizontal position affects tilt
const ROT_ATTRACTION = 0.02;   // Pull back to level orientation (0 degrees)
const ROT_FRICTION = 0.92;     // Rotational velocity damping

function getHalfSize() {
  const r = avoider.getBoundingClientRect();
  return {x:r.width / 2, y:r.height / 2};
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function safeNormalize(dx, dy) {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return [0, 0];
  return [dx / len, dy / len];
}

// --- Event Listeners ---
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}, {passive: true});

window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) {
    mouseX = t.clientX;
    mouseY = t.clientY;
  }
}, {passive: true});

function getClosestPointOnRect(rect) {
  const closestX = Math.max(rect.left, Math.min(mouseX, rect.right));
  const closestY = Math.max(rect.top, Math.min(mouseY, rect.bottom));
  return { x: closestX, y: closestY };
}


// --- Animation Loop ---
function animate() {
  const rect = avoider.getBoundingClientRect();

  // --- 1. Positional Physics (Repulsion) ---
  const closestPoint = getClosestPointOnRect(rect);
  const dx = closestPoint.x - mouseX;
  const dy = closestPoint.y - mouseY;
  const dist = Math.hypot(dx, dy);

  let ax = 0, ay = 0;

  if (dist < AVOID_RADIUS && dist > 1e-6) {
    // Avoid force: stronger the closer the pointer
    const strength = (1 - dist / AVOID_RADIUS) * MAX_AVOID_FORCE;
    const [nx, ny] = safeNormalize(dx, dy);
    ax += nx * strength;
    ay += ny * strength;
  }
  // Attraction force: gently pull back to center
  ax += -posX * ATTRACTION;
  ay += -posY * ATTRACTION;

  // Integrate with friction
  vx = vx * FRICTION + ax;
  vy = vy * FRICTION + ay;

  // Speed clamp
  const speed = Math.hypot(vx, vy);
  if (speed > MAX_SPEED) {
    vx = (vx / speed) * MAX_SPEED;
    vy = (vy / speed) * MAX_SPEED;
  }

  posX += vx;
  posY += vy;

  // --- 2. Rotational Physics (Tilting) ---
  let aRot = 0;

  // Tilting force based on horizontal distance of mouse from element's center
  if (dist < AVOID_RADIUS && dist > 1e-6) {
    const elementCenterX = rect.left + rect.width / 2;
    let tiltDX = closestPoint.x - elementCenterX;
    if (closestPoint.y > rect.y) tiltDX = -tiltDX;
    const strength = (1 - dist / AVOID_RADIUS) * TILT_FORCE;
    aRot += tiltDX * strength;
  }
  // Restoring force to bring rotation back to 0
  aRot += -rotation * ROT_ATTRACTION;

  console.log(aRot);

  // Integrate with friction
  vRot = vRot * ROT_FRICTION + aRot;
  rotation += vRot;

  //console.log(rotation);


  // --- 3. Clamping and Applying Styles ---
  const boundX = Math.max(0, centerX - halfSize.x);
  const boundY = Math.max(0, centerY - halfSize.y);
  posX = clamp(posX, -boundX, boundX);
  posY = clamp(posY, -boundY, boundY);

  // Safety reset
  if (!Number.isFinite(posX) || !Number.isFinite(posY) || !Number.isFinite(rotation)) {
    console.warn('avoider detected invalid state — resetting to center');
    posX = 0; posY = 0; vx = 0; vy = 0;
    rotation = 0; vRot = 0;
  }

  // Apply to CSS variables
  avoider.style.setProperty('--x', posX + 'px');
  avoider.style.setProperty('--y', posY + 'px');
  avoider.style.setProperty('--rot', rotation + 'deg');

  requestAnimationFrame(animate);
}

// --- Initialization ---
window.addEventListener('resize', () => {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
  halfSize = getHalfSize();
});

let halfSize = getHalfSize();
requestAnimationFrame(animate);