/**
 * Science Event Details Page - JavaScript
 * Handles theme toggling, scroll effects and mobile interactions
 */

// Initialize theme and interactions when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔬 Science Event page loading...');
    
    // Initialize theme before rendering
    initializeTheme();
    
    // Setup interactions
    setupThemeToggle();
    setupScrollEffects();
    setupMobileNavigation();
    
    console.log('✅ Science Event page initialized');
});

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        document.documentElement.setAttribute('data-theme', theme);
        console.log(`🎨 Theme initialized: ${theme}`);
    } catch (error) {
        console.warn('⚠️ Theme initialization failed:', error);
    }
}

/**
 * Setup theme toggle functionality
 */
function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (!themeToggle) {
        console.warn('⚠️ Theme toggle button not found');
        return;
    }
    
    // Set initial icon
    updateThemeIcon();
    
    // Add click handler
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', newTheme);
        
        // Save to localStorage
        try {
            localStorage.setItem('theme', newTheme);
        } catch (error) {
            console.warn('⚠️ Failed to save theme preference:', error);
        }
        
        // Update icon
        updateThemeIcon();
        
        console.log(`� Theme switched to: ${newTheme}`);
    });
}

/**
 * Update theme toggle icon based on current theme
 */
function updateThemeIcon() {
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle?.querySelector('i');
    
    if (!icon) return;
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    icon.className = `fas ${currentTheme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
}

/**
 * Setup scroll effects for navbar
 */
function setupScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) {
        console.warn('⚠️ Navbar not found for scroll effects');
        return;
    }
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class based on scroll position
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    // Add scroll listener with throttling
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial call
    updateNavbar();
}

/**
 * Setup mobile navigation toggle
 */
function setupMobileNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (!navToggle || !navMenu) {
        console.warn('⚠️ Mobile navigation elements not found');
        return;
    }
    
    navToggle.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        // Prevent body scroll when menu is open
        if (navMenu.classList.contains('active')) {
            document.body.classList.add('menu-open');
        } else {
            document.body.classList.remove('menu-open');
        }
        console.log('📱 Mobile navigation toggled');
    });

    // Close menu when a nav-link is clicked (mobile)
    navMenu.querySelectorAll('.nav-link').forEach(function(link) {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    console.log('📱 Mobile navigation initialized');
}

/**
 * Handle registration button click
 */
function handleRegistration(url) {
    if (url) {
        window.open(url, '_blank');
        console.log('🎯 Registration link opened');
    } else {
        console.warn('⚠️ No registration URL provided');
        showNotification('Registration link not available', 'error');
    }
}

/**
 * Show notification toast
 */
function showNotification(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `notification-toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--primary-color);
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(0, 122, 255, 0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
                font-family: var(--font-family);
            }
            .notification-toast.error {
                background: #FF3B30;
                box-shadow: 0 10px 30px rgba(255, 59, 48, 0.3);
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
