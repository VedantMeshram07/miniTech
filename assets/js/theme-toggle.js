/**
 * Universal Theme Toggle Functionality
 * Works across all pages - index.html, science.html, details.html
 */

class UniversalThemeToggle {
    constructor() {
        this.init();
    }

    init() {
        // Look for existing theme toggle or create one
        this.findOrCreateToggleButton();
        
        // Check for saved theme preference or default to dark mode
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        // Add event listener
        this.bindEvents();
    }

    findOrCreateToggleButton() {
        // First, look for existing theme toggle button in navbar
        this.toggleButton = document.getElementById('theme-toggle');
        
        if (!this.toggleButton) {
            // Create toggle button if it doesn't exist
            this.createToggleButton();
        }
        
        // Find or create the theme icon
        this.themeIcon = this.toggleButton.querySelector('i') || this.toggleButton.querySelector('#theme-icon');
        
        if (!this.themeIcon) {
            this.themeIcon = document.createElement('i');
            this.themeIcon.className = 'fas fa-sun';
            this.themeIcon.id = 'theme-icon';
            this.toggleButton.appendChild(this.themeIcon);
        }
    }

    createToggleButton() {
        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.id = 'theme-toggle';
        toggleButton.className = 'theme-toggle';
        toggleButton.innerHTML = `
            <i class="fas fa-sun" id="theme-icon"></i>
        `;
        toggleButton.setAttribute('aria-label', 'Toggle theme');
        toggleButton.setAttribute('title', 'Toggle theme');
        
        // Style the button
        toggleButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            backdrop-filter: blur(20px);
            color: white;
            font-size: 20px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        `;
        
        // Add hover effects
        toggleButton.addEventListener('mouseenter', () => {
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            if (currentTheme === 'light') {
                toggleButton.style.background = 'rgba(0, 0, 0, 0.2)';
            } else {
                toggleButton.style.background = 'rgba(255, 255, 255, 0.2)';
            }
            toggleButton.style.transform = 'scale(1.1)';
        });
        
        toggleButton.addEventListener('mouseleave', () => {
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            if (currentTheme === 'light') {
                toggleButton.style.background = 'rgba(0, 0, 0, 0.1)';
            } else {
                toggleButton.style.background = 'rgba(255, 255, 255, 0.1)';
            }
            toggleButton.style.transform = 'scale(1)';
        });
        
        // Insert into the page
        document.body.appendChild(toggleButton);
        
        this.toggleButton = toggleButton;
    }

    bindEvents() {
        this.toggleButton.addEventListener('click', () => {
            this.toggleTheme();
        });
    }

    toggleTheme() {
        const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            this.themeIcon.className = 'fas fa-moon';
            this.toggleButton.style.color = '#1a1a1a';
            this.toggleButton.style.background = 'rgba(0, 0, 0, 0.1)';
            this.toggleButton.style.border = '1px solid rgba(0, 0, 0, 0.2)';
        } else {
            document.body.classList.remove('light-mode');
            this.themeIcon.className = 'fas fa-sun';
            this.toggleButton.style.color = 'white';
            this.toggleButton.style.background = 'rgba(255, 255, 255, 0.1)';
            this.toggleButton.style.border = '1px solid rgba(255, 255, 255, 0.2)';
        }
        
        // Save preference
        localStorage.setItem('theme', theme);
    }
}

// Initialize theme toggle when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new UniversalThemeToggle();
});

// Also initialize if DOM is already loaded
if (document.readyState !== 'loading') {
    new UniversalThemeToggle();
}