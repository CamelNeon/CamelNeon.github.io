const title = document.getElementById('title');
const margin = 40; // soft margin from borders

let targetX = 0;
let targetY = 0;
let currentX = targetX;
let currentY = targetY;
let velocityX = 0;
let velocityY = 0;
let xPos = -1;
let yPos = -1;
const easing = 0.02;

document.addEventListener('mousemove', (e) => {
    xPos = e.clientX;
    yPos = e.clientY
});

function animate() {
    console.log('animate ', targetX, targetY);
    if (xPos == -1 || yPos == -1) {
        requestAnimationFrame(animate);
        return;
    }
    const rect = title.getBoundingClientRect();

    const dx = xPos - (rect.left + rect.width / 2);
    const dy = yPos - (rect.top + rect.height / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
        const angle = Math.atan2(dy, dx);
        velocityX -= Math.cos(angle) * (150 - distance) * 0.002;
        velocityY -= Math.sin(angle) * (150 - distance) * 0.002;
    }

    targetX += velocityX;
    targetY += velocityY;
    console.log("target1 ", targetX, targetY);

    // Bounce on borders
    if (targetX < margin) {
        targetX = margin;
        velocityX *= -0.8; // bounce and lose a bit of speed
    }
    if (targetX + rect.width > window.innerWidth - margin) {
        targetX = window.innerWidth - margin - rect.width;
        velocityX *= -0.8;
    }
    if (targetY - rect.height < margin) {
        targetY = margin + rect.height;
        velocityY *= -0.8;
    }
    if (targetY > window.innerHeight - margin) {
        targetY = window.innerHeight - margin;
        velocityY *= -0.8;
    }

    console.log("target ", targetX, targetY);
    // Soft movement toward target
    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;


    console.log('current ', currentX, currentY);
    title.style.left = `${currentX}px`;
    title.style.top = `${currentY}px`;

    requestAnimationFrame(animate);
}

function centerText() {
    const rect = title.getBoundingClientRect();
    targetX = window.innerWidth / 2 - rect.width / 2;
    targetY = window.innerHeight / 2 - rect.height / 2;
    currentX = targetX;
    currentY = targetY;
    title.style.left = `${currentX}px`;
    title.style.top = `${currentY}px`;
}

window.addEventListener('resize', centerText);
document.addEventListener("DOMContentLoaded", () => {
    centerText();
    animate();
});