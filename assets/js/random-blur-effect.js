/**
 * Random Color Effect for TechFest 2025 Title
 * Generates random gradient colors and applies them to the text itself on page load
 */

class RandomColorEffect {
    constructor() {
        console.log('🎨 RandomColorEffect constructor called');
        this.subtleColors = [
            // Bright Blues
            '#40c4ff', '#00b4ff', '#0091ea', '#2979ff',
            
            // Vibrant Purples  
            '#e040fb', '#d500f9', '#aa00ff', '#7c4dff',
            
            // Electric Teals
            '#18ffff', '#00e5ff', '#00b8d4', '#00acc1',
            
            // Warm Bright Oranges
            '#ff6d00', '#ff9100', '#ffab00', '#ffc107',
            
            // Hot Pinks
            '#ff1744', '#f50057', '#e91e63', '#ff4081',
            
            // Bright Indigos
            '#3d5afe', '#536dfe', '#448aff', '#40c4ff',
            
            // Neon Cyans
            '#00e676', '#00c853', '#1de9b6', '#64ffda',
            
            // Bright Lavenders & Magentas
            '#e1bee7', '#f8bbd9', '#ffcdd2', '#f48fb1',
            
            // Electric Greens
            '#76ff03', '#64dd17', '#00e676', '#00c853',
            
            // Bright Yellows
            '#ffeb3b', '#ffc107', '#ff9800', '#ffca28'
        ];
        
        this.init();
    }
    
    init() {
        console.log('🎨 init() called, DOM state:', document.readyState);
        
        // Wait for DOM to load
        if (document.readyState === 'loading') {
            console.log('🎨 DOM loading, adding event listener');
            document.addEventListener('DOMContentLoaded', () => {
                console.log('🎨 DOMContentLoaded fired, applying color');
                this.applyRandomColor();
            });
        } else {
            console.log('🎨 DOM already ready, applying color immediately');
            this.applyRandomColor();
        }
        
        // Also add a backup timer
        setTimeout(() => {
            console.log('🎨 Backup timer fired, trying to apply color');
            this.applyRandomColor();
        }, 1000);
    }
    
    getRandomColor() {
        const randomIndex = Math.floor(Math.random() * this.subtleColors.length);
        return this.subtleColors[randomIndex];
    }
    
    applyRandomColor() {
        console.log('🎨 applyRandomColor() called');
        
        const titleElement = document.getElementById('hero-title-main');
        console.log('🎨 Searching for element with ID: hero-title-main');
        console.log('🎨 Found element:', titleElement);
        
        if (!titleElement) {
            console.error('🎨 TechFest title element not found! Available elements:');
            const allH2s = document.querySelectorAll('h2');
            allH2s.forEach((h2, index) => {
                console.log(`🎨 H2 ${index}:`, h2.id, h2.className, h2.textContent);
            });
            return;
        }
        
        // Generate random single color
        const randomColor = this.getRandomColor();
        
        console.log('🎨 Applying color:', randomColor);
        console.log('🎨 Title element found:', titleElement);
        console.log('🎨 Current classes:', titleElement.className);
        console.log('🎨 Current text content:', titleElement.textContent);
        
        // Apply the color as a CSS custom property for both text and glow
        titleElement.style.setProperty('--random-color', randomColor);
        
        // Also apply direct styles as fallback with !important
        titleElement.style.setProperty('color', randomColor, 'important');
        titleElement.style.setProperty('filter', `
            drop-shadow(0 0 8px ${randomColor}) 
            drop-shadow(0 0 19px ${randomColor})
        `, 'important');
        
        // Add a class to enable the glow effect
        titleElement.classList.add('random-color-effect');
        
        console.log('🎨 Applied random color effect with color:', randomColor);
        console.log('🎨 Final classes:', titleElement.className);
        console.log('🎨 Applied styles:', {
            color: titleElement.style.color,
            textShadow: titleElement.style.textShadow,
            customProperty: titleElement.style.getPropertyValue('--random-color')
        });
        
        // Test if element is visible
        const rect = titleElement.getBoundingClientRect();
        console.log('🎨 Element position/size:', rect);
        console.log('🎨 Element computed styles:', window.getComputedStyle(titleElement).color);
    }
    
    // Method to change colors dynamically (can be called from console for testing)
    changeColors() {
        console.log('🎨 changeColors() called manually');
        this.applyRandomColor();
    }
    
    // Test method to verify the element exists and try different selectors
    testElement() {
        console.log('🎨 Testing element detection...');
        
        // Try different ways to find the element
        const byId = document.getElementById('hero-title-main');
        const byClass = document.querySelector('.event-title');
        const byTag = document.querySelector('h2');
        const allH2s = document.querySelectorAll('h2');
        
        console.log('🎨 By ID (hero-title-main):', byId);
        console.log('🎨 By class (.event-title):', byClass);
        console.log('🎨 By tag (h2):', byTag);
        console.log('🎨 All H2 elements:', allH2s);
        
        // If we find any element, try to apply effect
        const target = byId || byClass || byTag;
        if (target) {
            console.log('🎨 Found target element, applying test color');
            target.style.setProperty('color', '#ff0000', 'important');
            target.style.setProperty('text-shadow', '0 0 20px #ff0000', 'important');
            return target;
        } else {
            console.error('🎨 No suitable target element found!');
            return null;
        }
    }
}

// Test script loading
console.log('🎨 Random blur effect script loaded!');

// Create a global test function immediately available
window.testBlurEffect = function() {
    console.log('🎨 Manual test function called');
    const element = document.getElementById('hero-title-main') || document.querySelector('.event-title') || document.querySelector('h2');
    if (element) {
        const testColor = '#ff6b35';
        element.style.setProperty('color', testColor, 'important');
        element.style.setProperty('filter', `drop-shadow(0 0 8px ${testColor}) drop-shadow(0 0 16px ${testColor}) drop-shadow(0 0 24px ${testColor})`, 'important');
        console.log('🎨 Test color applied to:', element);
        return true;
    } else {
        console.error('🎨 No element found for testing');
        return false;
    }
};

// Initialize the effect when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎨 DOM ready, initializing random color effect...');
    try {
        const randomColorEffect = new RandomColorEffect();
        
        // Make it globally accessible for testing
        window.randomColorEffect = randomColorEffect;
        
        console.log('🎨 Random color effect initialized successfully!');
    } catch (error) {
        console.error('🎨 Error initializing random color effect:', error);
    }
});

// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('🎨 DOM still loading, waiting...');
} else {
    console.log('🎨 DOM already loaded, initializing immediately...');
    try {
        const randomColorEffect = new RandomColorEffect();
        window.randomColorEffect = randomColorEffect;
        console.log('🎨 Immediate initialization successful!');
    } catch (error) {
        console.error('🎨 Immediate initialization failed:', error);
    }
}