// Countdown Timer
document.addEventListener('DOMContentLoaded', () => {
    // Target Date: Feb 16, 2027 12:00:00 (Jaipur, India IST)
    const targetDate = new Date('February 16, 2027 12:00:00 GMT+0530').getTime();

    const updateCountdown = () => {
        const now = new Date().getTime();
        const difference = targetDate - now;

        if (difference < 0) {
            const countdownEl = document.getElementById('countdown');
            if (countdownEl) {
                countdownEl.innerHTML = `<p style="font-family: 'Playfair Display', serif; font-size: 1.5rem; color: var(--accent-dark); margin: 1.5rem 0;">The Wedding Celebrations Have Begun!</p>`;
            }
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        const daysEl = document.getElementById('days');
        const hoursEl = document.getElementById('hours');
        const minsEl = document.getElementById('minutes');
        const secsEl = document.getElementById('seconds');

        if (daysEl && hoursEl && minsEl && secsEl) {
            daysEl.innerText = String(days).padStart(2, '0');
            hoursEl.innerText = String(hours).padStart(2, '0');
            minsEl.innerText = String(minutes).padStart(2, '0');
            secsEl.innerText = String(seconds).padStart(2, '0');
        }
    };

    if (document.getElementById('countdown')) {
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }
});

// Copy to Clipboard Utility
function copyToClipboard(text, buttonElement) {
    navigator.clipboard.writeText(text).then(() => {
        // Create or show toast
        let toast = document.getElementById('copy-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'copy-toast';
            toast.className = 'toast-copy';
            document.body.appendChild(toast);
        }
        
        toast.innerText = 'Copied to clipboard!';
        toast.classList.add('show');
        
        // Change button state
        const originalHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        buttonElement.style.backgroundColor = '#25D366';
        buttonElement.style.color = '#fff';
        buttonElement.style.borderColor = '#25D366';
        
        setTimeout(() => {
            toast.classList.remove('show');
            buttonElement.innerHTML = originalHTML;
            buttonElement.style = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy: ', err);
    });
}

// Auto-close Bootstrap mobile menu when a nav link is clicked
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.navbar-collapse .nav-link');
    const menuToggle = document.getElementById('navbarNav');
    
    if (menuToggle && typeof bootstrap !== 'undefined') {
        const bsCollapse = bootstrap.Collapse.getOrCreateInstance(menuToggle, { toggle: false });
        
        navLinks.forEach((link) => {
            link.addEventListener('click', () => {
                // Only collapse if the menu is currently expanded (has 'show' class)
                if (menuToggle.classList.contains('show')) {
                    bsCollapse.hide();
                }
            });
        });
    }

    // Quick links schedule tab activator
    const quickLinks = document.querySelectorAll('.quick-link-card[data-tab]');
    quickLinks.forEach(link => {
        link.addEventListener('click', () => {
            const tabId = link.getAttribute('data-tab');
            const tabBtn = document.getElementById(tabId);
            if (tabBtn && typeof bootstrap !== 'undefined') {
                const tab = bootstrap.Tab.getOrCreateInstance(tabBtn);
                tab.show();
            }
        });
    });
});
