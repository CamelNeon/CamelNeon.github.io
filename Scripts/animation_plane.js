function generateClouds() {
    const bg = document.getElementById('background');
    const cloudCount = 60;
    for (let i = 0; i < cloudCount; i++) {
        const cloud = document.createElement('div');
        cloud.textContent = '☁️';
        cloud.classList.add('cloud');
        const size = 20 + Math.random() * 50; // random size between 20px and 70px
        cloud.style.fontSize = size + 'px';
        cloud.style.left = Math.random() * window.innerWidth + 'px';
        cloud.style.top = Math.random() * window.innerHeight + 'px';
        bg.appendChild(cloud);
    }
}


function animatePlanes() {
    function createPlane() {
        const plane = document.createElement('img');
        const header = document.getElementById('header-placeholder')
        plane.src = '/media/plane.png';
        plane.classList.add('plane');
        document.body.appendChild(plane);

        const fromLeft = Math.random() < 0.5;
        const randomHeight = Math.random() * (window.innerHeight - 100); // 100 is the plane height
        const randomSpeed = Math.random() * 5 + 3; // Duration between 3 and 8 seconds
        const screenWidth = window.innerWidth;

        plane.style.top = `${randomHeight}px`;
        plane.style.transitionDuration = `${randomSpeed}s`;

        if (fromLeft) {
            plane.style.left = '-100px'; // Start off-screen left
            setTimeout(() => {
                plane.style.left = `${screenWidth}px`;
            }, 100);
        } else {
            plane.style.transform = 'scaleX(-1)'; // Flip the image
            plane.style.left = `${screenWidth}px`; // Start off-screen right
            setTimeout(() => {
                plane.style.left = '-100px';
            }, 100);
        }

        // Remove the plane from the DOM after the animation is complete
        setTimeout(() => {
            plane.remove();
        }, (randomSpeed + 1) * 1000);
    }

    function generatePlanes() {
        createPlane();
        const randomDelay = Math.random() * 4000 + 1000; // New plane every 1 to 5 seconds
        setTimeout(generatePlanes, randomDelay);
    }

    generatePlanes();
}

generateClouds();
animatePlanes();