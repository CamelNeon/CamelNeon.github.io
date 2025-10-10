const avoider = document.getElementById('avoider');

// State (pos is offset FROM CENTER in px)
let posX = 0, posY = 0;
let vx = 0, vy = 0;

// Mouse/touch location relative to center (initialized at 0 = center)
let mouseX = 0, mouseY = 0;

let centerX = window.innerWidth / 2;
let centerY = window.innerHeight / 2;

const AVOID_RADIUS = 200;      // px
const MAX_AVOID_FORCE = 1.4;   // acceleration when very close
const ATTRACTION = 0.0018;      // pull back to center when mouse far
const FRICTION = 0.90;         // velocity damping each frame
const MAX_SPEED = 60;          // px per frame clamp

function getHalfSize() {
  const r = avoider.getBoundingClientRect();
  return [r.width / 2, r.height / 2]; // avoid zero
}

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

function safeNormalize(dx, dy) {
  const len = Math.hypot(dx, dy);
  if (len < 1e-6) return [0, 0];
  return [dx / len, dy / len];
}

// mouse events -> convert to coordinates relative to center
window.addEventListener('mousemove', (e) => {
  mouseX = e.clientX - centerX;
  mouseY = e.clientY - centerY;
}, {passive: true});

// pointercapture/touch support
window.addEventListener('touchmove', (e) => {
  const t = e.touches[0];
  if (t) {
    mouseX = t.clientX - centerX;
    mouseY = t.clientY - centerY;
  }
}, {passive: true});

// animation loop
function animate() {
  // vector from mouse to element in center-based coords
/*
  const rect = avoider.getBoundingClientRect();
  var dx = Math.max(rect.left - mouseX, 0, mouseX - rect.right);
  var dy = Math.max(rect.top - mouseY, 0, mouseY - rect.bottom);
  const dist = Math.hypot(dx, dy);
  console.log(mouseX, mouseY, dx, dy);
  console.log("oui");
  */
  let dx = posX - mouseX;
  if (Math.abs(dx) < getHalfSize()[0]) dx = 0;
  let dy = posY - mouseY;
  if (Math.abs(dy) < getHalfSize()[1]) dy = 0;
  const dist = Math.hypot(dx, dy);

  let ax = 0, ay = 0;

  if (dist < AVOID_RADIUS && dist > 1e-6) {
    // avoid: stronger the closer the pointer
    const strength = (1 - dist / AVOID_RADIUS) * MAX_AVOID_FORCE;
    const [nx, ny] = safeNormalize(dx, dy);
    ax += nx * strength;
    ay += ny * strength;
  } else {
    // gently pull back to center (posX/posY -> 0)
    ax += -posX * ATTRACTION;
    ay += -posY * ATTRACTION;
  }

  // integrate with friction
  vx = vx * FRICTION + ax;
  vy = vy * FRICTION + ay;

  // speed clamp
  const speed = Math.hypot(vx, vy);
  if (speed > MAX_SPEED) {
    vx = (vx / speed) * MAX_SPEED;
    vy = (vy / speed) * MAX_SPEED;
  }

  posX += vx;
  posY += vy;

  // clamp so the element stays fully inside the viewport
  // allowed offset on X is centerX - halfSize (positive to right), negative symmetrical
  const boundX = Math.max(0, centerX - halfSize[0]);
  const boundY = Math.max(0, centerY - halfSize[1]);
  posX = clamp(posX, -boundX, boundX);
  posY = clamp(posY, -boundY, boundY);

  // safety: detect NaN or non-finite values and reset
  if (!Number.isFinite(posX) || !Number.isFinite(posY)) {
    console.warn('avoider detected invalid position — resetting to center');
    posX = 0; posY = 0; vx = 0; vy = 0;
  }

  // apply to CSS variables (fast GPU transform path)
  avoider.style.setProperty('--x', posX + 'px');
  avoider.style.setProperty('--y', posY + 'px');

  requestAnimationFrame(animate);
}

// keep center and sizes correct on resize
window.addEventListener('resize', () => {
  centerX = window.innerWidth / 2;
  centerY = window.innerHeight / 2;
  halfSize = getHalfSize();
});

// start
let halfSize = getHalfSize();
requestAnimationFrame(animate);