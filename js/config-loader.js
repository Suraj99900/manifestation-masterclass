// Event Configuration Loader
document.addEventListener("DOMContentLoaded", function () {
    fetch('js/config.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(config => {
            // Update Text Content
            function updateText(className, value) {
                if (value) {
                    const elements = document.querySelectorAll('.' + className);
                    elements.forEach(el => {
                        el.innerText = value;
                    });
                }
            }

            // Update Links (href)
            function updateLink(className, value) {
                if (value && value !== "#" && value.trim() !== "") {
                    const elements = document.querySelectorAll('.' + className);
                    elements.forEach(el => {
                        el.href = value;
                        // If it was a popup trigger, removing the popup action might be needed
                        // but setting href usually overrides onclick behaviors for <a> tags 
                        // depending on how Elementor handles it.
                        // We will assume direct replacement for now.
                    });
                }
            }
            console.log(config)
            updateText("conf-price", config.price);
            updateText("conf-original-price", config.originalPrice);
            updateText("conf-bonus-val", config.bonusVal);
            updateText("conf-date", config.eventDate);
            updateText("conf-time", config.eventTime);
            updateText("conf-deadline", config.deadline);
            updateText("conf-event-days", config.eventDays);

            updateLink("conf-payment-button", config.paymentLink);
            updateLink("conf-meeting-link", config.meetingLink);

            // Update Razorpay Global Variable for Payment
            if (config.price) {
                // Remove non-numeric characters except decimal point
                const cleanPrice = String(config.price).replace(/[^0-9.]/g, '');
                // Convert to paisa (multiply by 100)
                window.razorpayAmount = Math.round(parseFloat(cleanPrice) * 100).toString();
            }
            // Countdown Timer Logic (30 Minutes on Page Load)
            function startCountdown() {
                const duration = 30 * 60; // 30 minutes in seconds

                function updateTimer() {
                    let timer = duration;

                    // Check if there's a stored start time in sessionStorage
                    const storedStartTime = sessionStorage.getItem('countdownStartTime');
                    const currentTime = Math.floor(Date.now() / 1000);

                    if (storedStartTime) {
                        const elapsed = currentTime - parseInt(storedStartTime);
                        timer = duration - elapsed;
                        if (timer < 0) {
                            timer = 0; // Timer finished
                            // Optional: reset if you want it to loop
                            // sessionStorage.setItem('countdownStartTime', currentTime);
                            // timer = duration;
                        }
                    } else {
                        sessionStorage.setItem('countdownStartTime', currentTime);
                    }

                    const displays = document.querySelectorAll('.elementor-countdown-wrapper');

                    // Update display immediately
                    updateDisplay(timer, displays);

                    const interval = setInterval(function () {
                        if (timer <= 0) {
                            clearInterval(interval);
                            timer = 0;
                        } else {
                            timer--;
                        }
                        updateDisplay(timer, displays);
                    }, 1000);
                }

                function updateDisplay(timer, displays) {
                    let minutes = parseInt(timer / 60, 10);
                    let seconds = parseInt(timer % 60, 10);

                    minutes = minutes < 10 ? "0" + minutes : minutes;
                    seconds = seconds < 10 ? "0" + seconds : seconds;

                    displays.forEach(display => {
                        const minutesDisplay = display.querySelector('.elementor-countdown-minutes');
                        const secondsDisplay = display.querySelector('.elementor-countdown-seconds');
                        if (minutesDisplay) minutesDisplay.textContent = minutes;
                        if (secondsDisplay) secondsDisplay.textContent = seconds;
                    });
                }

                updateTimer();
            }
            startCountdown();

        })
        .catch(error => {
            console.error('Error loading config:', error);
        });
});
