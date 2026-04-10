const text = document.getElementById('wordart');
        let x = Math.random() * (window.innerWidth - 400);
        let y = Math.random() * (window.innerHeight - 100);
        let dx = 3;
        let dy = 3;
        const speed = 3;

        // 1. DVD Bounce Animation
        function animate() {
            const rect = text.getBoundingClientRect();
            
            if (x + rect.width >= window.innerWidth || x <= 0) {
                dx = -dx;
                changeColor();
            }
            if (y + rect.height >= window.innerHeight || y <= 0) {
                dy = -dy;
                changeColor();
            }

            x += dx;
            y += dy;

            text.style.left = x + 'px';
            text.style.top = y + 'px';

            requestAnimationFrame(animate);
        }

        function changeColor() {
            // Randomly rotate hue on bounce
            text.style.filter = `drop-shadow(5px 5px 0px #000) hue-rotate(${Math.random() * 360}deg)`;
        }

        // 2. The "Escape" Logic (Moves away when mouse gets close)
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            const textRect = text.getBoundingClientRect();
            const textCenterX = textRect.left + textRect.width / 2;
            const textCenterY = textRect.top + textRect.height / 2;

            const distance = Math.hypot(mouseX - textCenterX, mouseY - textCenterY);

            if (distance < 150) {
                // Teleport to a random location
                x = Math.random() * (window.innerWidth - textRect.width);
                y = Math.random() * (window.innerHeight - textRect.height);
                text.classList.add('pulse');
                setTimeout(() => text.classList.remove('pulse'), 500);
            }
        });

        // 3. Spawning "NO" on click
        document.addEventListener('click', (e) => {
            const no = document.createElement('div');
            no.className = 'no-popup';
            no.innerText = 'NO! 🛑';
            no.style.left = e.clientX + 'px';
            no.style.top = e.clientY + 'px';
            document.body.appendChild(no);

            // Remove element after animation
            setTimeout(() => no.remove(), 1000);
        });

        // Start the bounce
        animate();