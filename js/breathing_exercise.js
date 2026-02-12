   let isBreathing = false;
        let breathingInterval;

        function toggleBreathing() {
            const button = document.getElementById('breathingButton');
            const circle = document.getElementById('breathingCircle');
            const text = document.getElementById('breathingText');

            if (!isBreathing) {
                button.textContent = 'Stop Exercise';
                startBreathing();
            } else {
                button.textContent = 'Start Exercise';
                clearInterval(breathingInterval);
                circle.textContent = 'Click to Start';
                text.textContent = 'Ready to begin';
                circle.classList.remove('inhale', 'exhale');
            }
            isBreathing = !isBreathing;
        }

        function startBreathing() {
            const circle = document.getElementById('breathingCircle');
            const text = document.getElementById('breathingText');
            let phase = 'inhale';
            let count = 4;

            function updateBreathing() {
                if (phase === 'inhale') {
                    if (count === 4) {
                        circle.classList.add('inhale');
                        circle.classList.remove('exhale');
                        text.textContent = 'Inhale...';
                        circle.textContent = count;
                    } else if (count > 0) {
                        circle.textContent = count;
                    } else {
                        phase = 'hold1';
                        count = 7;
                        text.textContent = 'Hold...';
                        circle.textContent = count;
                    }
                } else if (phase === 'hold1') {
                    if (count > 0) {
                        circle.textContent = count;
                    } else {
                        phase = 'exhale';
                        count = 8;
                        circle.classList.remove('inhale');
                        circle.classList.add('exhale');
                        text.textContent = 'Exhale...';
                        circle.textContent = count;
                    }
                } else if (phase === 'exhale') {
                    if (count > 0) {
                        circle.textContent = count;
                    } else {
                        phase = 'hold2';
                        count = 0;
                        text.textContent = 'Hold...';
                        circle.textContent = count;
                    }
                } else { // hold2
                    if (count < 4) {
                        circle.textContent = count;
                    } else {
                        phase = 'inhale';
                        count = 4;
                        text.textContent = 'Inhale...';
                        circle.textContent = count;
                    }
                }
                count = phase === 'hold2' ? count + 1 : count - 1;
            }

            updateBreathing();
            breathingInterval = setInterval(updateBreathing, 1000);
        }