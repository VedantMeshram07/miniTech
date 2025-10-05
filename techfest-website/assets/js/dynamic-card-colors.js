/**
 * Dynamic Card Colors - Generates unique random colors for event cards
 * Features:
 * - New colors on page load
 * - New colors when section comes into view
 * - New colors on hover (unique for each card)
 * - Ensures no duplicate colors across cards
 */

class DynamicCardColors {
    constructor() {
        this.usedColors = new Set();
        this.cardStyles = new Map(); // Store styles for each card
        this.styleElement = null; // Single style element for all cards
        this.colorPalettes = {
            blue: [
                [59, 130, 246], [37, 99, 235], [29, 78, 216], [30, 64, 175], [96, 165, 250],
                [147, 197, 253], [14, 165, 233], [2, 132, 199], [3, 105, 161], [56, 189, 248]
            ],
            purple: [
                [139, 92, 246], [124, 58, 237], [109, 40, 217], [147, 51, 234], [126, 34, 206],
                [168, 85, 247], [196, 181, 253], [79, 70, 229], [67, 56, 202], [99, 102, 241]
            ],
            pink: [
                [236, 72, 153], [219, 39, 119], [190, 24, 93], [244, 63, 94], [225, 29, 72],
                [251, 113, 133], [252, 165, 165], [217, 70, 239], [192, 38, 211], [245, 101, 101]
            ],
            red: [
                [239, 68, 68], [220, 38, 38], [185, 28, 28], [153, 27, 27], [248, 113, 113],
                [252, 165, 165], [254, 202, 202], [239, 100, 107], [220, 53, 69], [225, 29, 72]
            ],
            orange: [
                [249, 115, 22], [234, 88, 12], [194, 65, 12], [154, 52, 18], [251, 146, 60],
                [253, 186, 116], [254, 215, 170], [255, 154, 0], [245, 124, 0], [230, 81, 0]
            ],
            yellow: [
                [245, 158, 11], [217, 119, 6], [180, 83, 9], [146, 64, 14], [251, 191, 36],
                [254, 240, 138], [254, 249, 195], [255, 193, 7], [255, 179, 0], [255, 160, 0]
            ],
            green: [
                [34, 197, 94], [22, 163, 74], [21, 128, 61], [20, 83, 45], [74, 222, 128],
                [134, 239, 172], [187, 247, 208], [16, 185, 129], [5, 150, 105], [4, 120, 87]
            ],
            teal: [
                [20, 184, 166], [13, 148, 136], [15, 118, 110], [17, 94, 89], [45, 212, 191],
                [94, 234, 212], [153, 246, 228], [6, 182, 212], [8, 145, 178], [14, 116, 144]
            ],
            cyan: [
                [6, 182, 212], [8, 145, 178], [14, 116, 144], [21, 94, 117], [34, 211, 238],
                [103, 232, 249], [165, 243, 252], [0, 188, 212], [0, 172, 193], [0, 151, 167]
            ],
            indigo: [
                [79, 70, 229], [67, 56, 202], [55, 48, 163], [49, 46, 129], [99, 102, 241],
                [129, 140, 248], [165, 180, 252], [63, 81, 181], [48, 63, 159], [40, 53, 147]
            ],
            violet: [
                [139, 92, 246], [124, 58, 237], [109, 40, 217], [91, 33, 182], [196, 181, 253],
                [221, 214, 254], [237, 233, 254], [156, 39, 176], [142, 36, 170], [123, 31, 162]
            ],
            magenta: [
                [236, 72, 153], [219, 39, 119], [190, 24, 93], [157, 23, 77], [251, 113, 133],
                [252, 165, 165], [253, 164, 175], [233, 30, 99], [216, 27, 96], [194, 24, 91]
            ]
        };
        
        this.init();
    }

    init() {
        console.log('Initializing dynamic card colors...');
        this.setupInitialColors();
        this.setupIntersectionObserver();
        this.setupHoverEvents();
        
        // Set up periodic check for new cards
        this.startPeriodicCheck();
    }

    // Periodic check for dynamically loaded cards
    startPeriodicCheck() {
        let lastCardCount = 0;
        let checkCount = 0;
        const maxChecks = 15; // Check for 30 seconds (15 checks * 2s interval)
        
        const checkInterval = setInterval(() => {
            const cards = document.querySelectorAll('.event-card');
            checkCount++;
            
            if (cards.length > lastCardCount) {
                console.log(`Found ${cards.length} cards (was ${lastCardCount}), updating colors...`);
                this.setupInitialColors();
                this.setupHoverEvents();
                lastCardCount = cards.length;
            }
            
            // Stop checking after max checks or if we have cards and they haven't changed
            if (checkCount >= maxChecks || (cards.length > 0 && checkCount > 5 && cards.length === lastCardCount)) {
                clearInterval(checkInterval);
                console.log(`Stopped periodic card checking after ${checkCount} checks`);
            }
        }, 2000); // Check every 2 seconds
        
        this.initTime = Date.now();
    }

    // Generate a random color from all palettes
    generateRandomColor() {
        // Flatten all colors from all palettes
        const allColors = Object.values(this.colorPalettes).flat();
        
        // If too many colors are used, reset the used colors set
        if (this.usedColors.size >= allColors.length * 0.8) {
            console.log('Resetting color pool - too many colors in use');
            this.usedColors.clear();
        }
        
        // Try to find an unused color
        let attempts = 0;
        let randomColor;
        let colorString;
        
        do {
            randomColor = allColors[Math.floor(Math.random() * allColors.length)];
            colorString = `${randomColor[0]},${randomColor[1]},${randomColor[2]}`;
            attempts++;
            
            // If we've tried too many times, just use the color anyway
            if (attempts > 50) {
                console.log('Max attempts reached, using color anyway:', colorString);
                break;
            }
        } while (this.usedColors.has(colorString));
        
        console.log(`Generated color: rgb(${colorString}) after ${attempts} attempts`);
        return randomColor;
    }

    // Get unique color for a card
    getUniqueColor() {
        const color = this.generateRandomColor();
        const colorString = `${color[0]},${color[1]},${color[2]}`;
        this.usedColors.add(colorString);
        console.log(`Added color rgb(${colorString}) to used set. Total used: ${this.usedColors.size}`);
        return color;
    }

    // Clear used colors (for fresh start)
    clearUsedColors() {
        this.usedColors.clear();
    }

    // Apply color to a card
    applyColorToCard(card, color) {
        const [r, g, b] = color;
        
        // Get or create the main style element
        if (!this.styleElement) {
            this.styleElement = document.createElement('style');
            this.styleElement.id = 'dynamic-card-colors';
            this.styleElement.type = 'text/css';
            document.head.appendChild(this.styleElement);
            console.log('Created dynamic style element');
        }
        
        const eventId = card.getAttribute('data-event-id');
        if (!eventId) {
            console.warn('Card has no data-event-id, cannot apply dynamic color');
            return;
        }
        
        // Store the current color for this card
        this.cardStyles.set(eventId, {
            color: [r, g, b]
        });
        
        // Rebuild all CSS rules
        this.updateAllStyles();
        
        // Force visual refresh by temporarily adding a class
        card.classList.add('color-updating');
        setTimeout(() => {
            card.classList.remove('color-updating');
        }, 50);
        
        // Also set inline style as backup
        card.style.setProperty('--card-color', `${r}, ${g}, ${b}`);
        
        // Add class to ensure the card is set up
        if (!card.classList.contains('dynamic-color')) {
            card.classList.add('dynamic-color');
        }
        
        // Force style recalculation
        card.offsetHeight; // Trigger a reflow
        
        // Verify the styles are applied
        const computedStyle = window.getComputedStyle(card);
        const borderColor = computedStyle.borderColor;
        console.log(`Applied color rgb(${r}, ${g}, ${b}) to card ${eventId}. Computed border color: ${borderColor}`);
        
        // Debug log
        console.log(`Total cards styled: ${this.cardStyles.size}`);
    }



    // Update all styles in the single style element
    updateAllStyles() {
        if (!this.styleElement) return;
        
        let cssRules = '';
        this.cardStyles.forEach((styleData, eventId) => {
            const { color } = styleData;
            const [r, g, b] = color;
            
            cssRules += `
/* Card ${eventId} - RGB(${r}, ${g}, ${b}) */
.event-card[data-event-id="${eventId}"] {
    --current-color-r: ${r};
    --current-color-g: ${g};
    --current-color-b: ${b};
    border: 2px solid rgba(${r}, ${g}, ${b}, 0.5) !important;
    box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(${r}, ${g}, ${b}, 0.4) !important;
    transition: all 0.3s ease !important;
}

.event-card[data-event-id="${eventId}"]::before {
    background: linear-gradient(45deg, 
        rgba(${r}, ${g}, ${b}, 0.2) 0%, 
        rgba(${r}, ${g}, ${b}, 0.08) 50%, 
        rgba(${r}, ${g}, ${b}, 0.2) 100%) !important;
    filter: blur(8px) !important;
    opacity: 0.8 !important;
}

.event-card[data-event-id="${eventId}"]:hover {
    border-color: rgba(${r}, ${g}, ${b}, 0.8) !important;
    box-shadow: 
        0 8px 40px rgba(0, 0, 0, 0.4),
        0 0 30px rgba(${r}, ${g}, ${b}, 0.6),
        0 0 60px rgba(${r}, ${g}, ${b}, 0.3) !important;
    transform: translateY(-5px) scale(1.02) !important;
}

.event-card[data-event-id="${eventId}"]:hover::before {
    background: linear-gradient(45deg, 
        rgba(${r}, ${g}, ${b}, 0.3) 0%, 
        rgba(${r}, ${g}, ${b}, 0.15) 50%, 
        rgba(${r}, ${g}, ${b}, 0.3) 100%) !important;
    opacity: 1 !important;
}

/* Fallback using CSS custom properties */
.event-card[data-event-id="${eventId}"].dynamic-color {
    border-color: rgba(var(--card-color), 0.5) !important;
    box-shadow: 
        0 4px 20px rgba(0, 0, 0, 0.3),
        0 0 20px rgba(var(--card-color), 0.4) !important;
}

`;
        });
        
        this.styleElement.textContent = cssRules;
        console.log('Updated glow styles for', this.cardStyles.size, 'cards');
        
        // Force a style recalculation to ensure changes are visible
        if (this.styleElement.sheet && this.styleElement.sheet.cssRules) {
            console.log(`CSS rules applied: ${this.styleElement.sheet.cssRules.length} rules`);
        }
    }

    // Set up initial colors for all cards
    setupInitialColors() {
        const cards = document.querySelectorAll('.event-card');
        console.log('Found event cards:', cards.length);
        
        if (cards.length === 0) {
            console.warn('No event cards found! Make sure cards have class "event-card"');
            return;
        }
        
        this.clearUsedColors();
        
        cards.forEach((card, index) => {
            // Ensure card has an event ID
            let eventId = card.getAttribute('data-event-id');
            if (!eventId) {
                eventId = `event-${Date.now()}-${index}`;
                card.setAttribute('data-event-id', eventId);
                console.log(`Assigned ID ${eventId} to card ${index + 1}`);
            }
            
            const color = this.getUniqueColor();
            console.log(`Setting up card ${index + 1} (${eventId}) with color:`, color);
            this.applyColorToCard(card, color);
        });
        
        console.log('Initial colors setup complete');
    }

    // Set up intersection observer to detect when events section comes into view
    setupIntersectionObserver() {
        const eventsSection = document.querySelector('#events') || 
                            document.querySelector('.events-section') ||
                            document.querySelector('[data-section="events"]');
        
        if (!eventsSection) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Reset colors when section comes into view
                    this.setupInitialColors();
                }
            });
        }, {
            threshold: 0.3 // Trigger when 30% of the section is visible
        });

        observer.observe(eventsSection);
        
        // Also watch for new cards being added dynamically
        const gridObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains('event-card')) {
                            console.log('New event card detected:', node);
                            const color = this.getUniqueColor();
                            this.applyColorToCard(node, color);
                            this.setupHoverForCard(node);
                        }
                    });
                }
            });
        });
        
        const eventsGrid = document.querySelector('#events-grid');
        if (eventsGrid) {
            gridObserver.observe(eventsGrid, { childList: true, subtree: true });
            console.log('Watching for dynamically added event cards...');
        }
    }

    // Set up hover events for dynamic color changes
    setupHoverEvents() {
        const cards = document.querySelectorAll('.event-card');
        console.log('Setting up hover events for', cards.length, 'cards');
        
        cards.forEach(card => this.setupHoverForCard(card));
        
        // Retry after a delay in case cards are loaded dynamically
        setTimeout(() => {
            const newCards = document.querySelectorAll('.event-card');
            if (newCards.length > cards.length) {
                console.log('Found additional cards after delay, setting up hover events...');
                newCards.forEach(card => this.setupHoverForCard(card));
                this.setupInitialColors(); // Reapply colors to all cards
            }
        }, 3000); // Wait 3 seconds for dynamic loading
    }

    // Set up hover for a single card
    setupHoverForCard(card) {
        // Remove existing listeners to prevent duplicates
        if (card._colorHoverSetup) return;
        card._colorHoverSetup = true;
        
        let hoverTimeout;
        
        card.addEventListener('mouseenter', () => {
            // Clear any existing timeout
            if (hoverTimeout) clearTimeout(hoverTimeout);
            
            // Add slight delay to prevent rapid color changes
            hoverTimeout = setTimeout(() => {
                const eventId = card.getAttribute('data-event-id');
                if (!eventId) {
                    console.warn('Card missing data-event-id attribute');
                    return;
                }
                
                // Get current color and remove from used set
                const currentStyle = this.cardStyles.get(eventId);
                if (currentStyle) {
                    const [r, g, b] = currentStyle.color;
                    const colorString = `${r},${g},${b}`;
                    this.usedColors.delete(colorString);
                    console.log(`Removed current color rgb(${r}, ${g}, ${b}) from used set`);
                }
                
                // Generate new unique color
                const newColor = this.getUniqueColor();
                this.applyColorToCard(card, newColor);
                
                console.log(`Hover: Changed card ${eventId} from rgb(${currentStyle ? currentStyle.color.join(',') : 'none'}) to rgb(${newColor[0]}, ${newColor[1]}, ${newColor[2]})`);
                console.log(`Total colors in use: ${this.usedColors.size}`);
            }, 100); // 100ms delay
        });
        
        card.addEventListener('mouseleave', () => {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                hoverTimeout = null;
            }
        });
    }

    // Public method to manually refresh all colors
    refreshAllColors() {
        console.log('Refreshing all card colors...');
        this.setupInitialColors();
        this.setupHoverEvents();
    }

    // Public method to initialize colors for newly loaded cards
    initializeNewCards() {
        const cards = document.querySelectorAll('.event-card:not(.dynamic-color)');
        if (cards.length > 0) {
            console.log(`Initializing colors for ${cards.length} new cards`);
            cards.forEach(card => {
                const color = this.getUniqueColor();
                this.applyColorToCard(card, color);
                this.setupHoverForCard(card);
            });
        }
    }

    // Public method to get current color statistics
    getColorStats() {
        return {
            totalColors: Object.values(this.colorPalettes).flat().length,
            usedColors: this.usedColors.size,
            availableColors: Object.values(this.colorPalettes).flat().length - this.usedColors.size
        };
    }
}

// Debug: Check if script loads
console.log('Dynamic card colors script loaded!');

// Force immediate test
setTimeout(() => {
    console.log('Testing card selection...');
    const cards = document.querySelectorAll('.event-card');
    console.log('Found cards:', cards.length);
    
    if (cards.length > 0) {
        console.log('First card:', cards[0]);
        console.log('Card classes:', cards[0].className);
    }
}, 1000);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing dynamic card colors...');
    window.dynamicCardColors = new DynamicCardColors();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    console.log('DOM still loading, waiting...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOM loaded (delayed), initializing dynamic card colors...');
        window.dynamicCardColors = new DynamicCardColors();
    });
} else {
    console.log('DOM already loaded, initializing dynamic card colors immediately...');
    window.dynamicCardColors = new DynamicCardColors();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DynamicCardColors;
}