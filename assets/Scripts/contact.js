const wordart = document.getElementById('wordart');
const HEADER_HEIGHT = 80;

let rect = wordart.getBoundingClientRect();
let x = Math.random() * (window.innerWidth - rect.width);
let y = Math.random() * (window.innerHeight - rect.height - HEADER_HEIGHT) + HEADER_HEIGHT;

let dx = 4; // Horizontal speed
let dy = 4; // Vertical speed

function update() {
    rect = wordart.getBoundingClientRect();
    
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Bounce off Right/Left
    if (x + rect.width >= screenWidth || x <= 0) {
        dx = -dx;
        randomColor();
    }

    // Bounce off Bottom/Top (taking header into account)
    if (y + rect.height >= screenHeight) {
        dy = -dy;
        y = screenHeight - rect.height; // Snap to bottom to prevent sticking
        randomColor();
    } else if (y <= HEADER_HEIGHT) {
        dy = -dy;
        y = HEADER_HEIGHT; // Snap to header bottom
        randomColor();
    }

    x += dx;
    y += dy;

    wordart.style.left = x + 'px';
    wordart.style.top = y + 'px';

    requestAnimationFrame(update);
}

function randomColor() {
    const hue = Math.floor(Math.random() * 360);
    wordart.style.filter = `drop-shadow(4px 4px 0px #000) hue-rotate(${hue}deg)`;
}

// Escape logic: Move away if mouse gets close
document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    const centerX = x + rect.width / 2;
    const centerY = y + rect.height / 2;
    
    const distance = Math.hypot(mouseX - centerX, mouseY - centerY);

    if (distance < 150) {
        // Teleport to a safe random spot
        x = Math.random() * (window.innerWidth - rect.width);
        y = Math.random() * (window.innerHeight - rect.height - HEADER_HEIGHT) + HEADER_HEIGHT;
    }
});

// Click "NO" effect
document.addEventListener('mousedown', (e) => {
    const no = document.createElement('div');
    no.className = 'no-popup';
    no.innerText = 'STAY AWAY!';
    no.style.left = e.clientX + 'px';
    no.style.top = e.clientY + 'px';
    document.body.appendChild(no);
    setTimeout(() => no.remove(), 800);
});

// Re-calculate on resize
window.addEventListener('resize', () => {
    rect = wordart.getBoundingClientRect();
});

// Start the loop
update();