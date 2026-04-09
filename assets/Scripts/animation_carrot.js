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


function spawnCarrot() {
    if (document.hasFocus()) {
        const carrot = document.createElement('div');
        carrot.classList.add('moving');
        const size = 15 + Math.random() * 40; // random size between 20px and 70px
        carrot.style.fontSize = size + 'px';
        carrot.textContent = '🥕';
        carrot.style.left = Math.random() * window.innerWidth + 'px';
        carrot.style.top = '-50px';
        document.body.appendChild(carrot);


        const duration = 4000 + Math.random() * 3000;
        carrot.animate(
            [
                { transform: `translateY(0)` },
                { transform: `translateY(${window.innerHeight + 100}px)` }
            ],
            { duration: duration, easing: 'linear' }
        ).onfinish = () => carrot.remove();
    }
}

generateClouds();
setInterval(spawnCarrot, 1500);