// Page Transition System for Lexio AI
class PageTransition {
    constructor() {
        this.createTransitionOverlay();
        this.bindEvents();
    }

    createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition';
        overlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-logo">Lexio AI</div>
                <div class="transition-spinner"></div>
            </div>
        `;
        document.body.appendChild(overlay);
        this.overlay = overlay;
    }

    bindEvents() {
        // Intercept all navigation clicks
        document.addEventListener('click', (e) => {
            const target = e.target;
            
            // Check if it's a navigation button or link
            if (target.onclick && target.onclick.toString().includes('window.location.href')) {
                e.preventDefault();
                const url = this.extractUrl(target.onclick.toString());
                if (url) {
                    this.navigateWithTransition(url);
                }
            } else if (target.href && target.href.endsWith('.html')) {
                e.preventDefault();
                this.navigateWithTransition(target.href);
            }
        });

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.showTransition();
            setTimeout(() => {
                location.reload();
            }, 300);
        });
    }

    extractUrl(onclickString) {
        const match = onclickString.match(/'([^']+\.html)'/);
        return match ? match[1] : null;
    }

    navigateWithTransition(url) {
        this.showTransition();
        
        // Navigate after transition starts
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    showTransition() {
        this.overlay.classList.add('active');
    }

    hideTransition() {
        this.overlay.classList.remove('active');
    }
}

// Initialize page transitions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PageTransition();
    
    // Hide transition overlay after page loads
    setTimeout(() => {
        const overlay = document.querySelector('.page-transition');
        if (overlay) {
            overlay.classList.remove('active');
        }
    }, 100);
});

// Add smooth scroll behavior for any internal links
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.style.scrollBehavior = 'smooth';
});
