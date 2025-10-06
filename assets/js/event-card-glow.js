/**
 * Event Card Glow Animation
 * Creates 4 running lights around event cards with spreading box-shadow effect
 */

class EventCardGlow {
    constructor() {
        this.cards = [];
        this.animationFrameId = null;
        this.isRunning = false;
        this.startTime = Date.now();
        
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        // Find all event cards
        const eventCards = document.querySelectorAll('.event-card');
        console.log(`Found ${eventCards.length} event cards for glow effect`);
        
        eventCards.forEach(card => {
            this.setupCard(card);
        });

        // Start animation
        this.startAnimation();

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());
    }

    setupCard(card) {
        // Create glow container
        const glowContainer = document.createElement('div');
        glowContainer.className = 'event-card-glow-container';
        
        // Create 4 runner elements
        const runners = [];
        for (let i = 0; i < 4; i++) {
            const runner = document.createElement('div');
            runner.className = `event-card-glow-runner runner-${i}`;
            glowContainer.appendChild(runner);
            runners.push(runner);
        }

        // Insert glow container before the card
        card.parentNode.insertBefore(glowContainer, card);

        // Store card data
        const cardData = {
            element: card,
            glowContainer: glowContainer,
            runners: runners,
            isHovered: false,
            rect: card.getBoundingClientRect()
        };

        this.cards.push(cardData);
        console.log('Setup glow for card:', card, 'with container:', glowContainer);

        // Add hover listeners (mouse)
        card.addEventListener('mouseenter', () => {
            cardData.isHovered = true;
            this.pauseCardAnimation(cardData);
        });

        card.addEventListener('mouseleave', () => {
            cardData.isHovered = false;
            this.resumeCardAnimation(cardData);
        });

        // Pointer / Touch support for mobile devices
        // Use pointer events when available to unify mouse/touch/pen
        const pointerDownHandler = (e) => {
            // Ignore secondary touches/gestures
            cardData.isHovered = true;
            this.pauseCardAnimation(cardData);
        };

        const pointerUpHandler = (e) => {
            cardData.isHovered = false;
            this.resumeCardAnimation(cardData);
        };

        // Pointer events (preferred)
        card.addEventListener('pointerdown', pointerDownHandler, { passive: true });
        card.addEventListener('pointerup', pointerUpHandler, { passive: true });

        // Fallback for browsers that might not support pointer events
        card.addEventListener('touchstart', pointerDownHandler, { passive: true });
        card.addEventListener('touchend', pointerUpHandler, { passive: true });

        // Position glow container
        this.positionGlowContainer(cardData);
    }

    positionGlowContainer(cardData) {
        const { element, glowContainer } = cardData;
        const rect = element.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

        glowContainer.style.position = 'absolute';
        glowContainer.style.top = (rect.top + scrollTop - 20) + 'px';
        glowContainer.style.left = (rect.left + scrollLeft - 20) + 'px';
        glowContainer.style.width = (rect.width + 40) + 'px';
        glowContainer.style.height = (rect.height + 40) + 'px';
        glowContainer.style.pointerEvents = 'none';
        glowContainer.style.zIndex = '0';
        glowContainer.style.opacity = '1';

        cardData.rect = rect;
    }

    startAnimation() {
        this.isRunning = true;
        this.animate();
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = Date.now();
        const elapsed = (currentTime - this.startTime) / 1000; // Convert to seconds

        this.cards.forEach(cardData => {
            if (!cardData.isHovered) {
                this.updateRunners(cardData, elapsed);
            }
        });

        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    updateRunners(cardData, elapsed) {
        const { runners, rect } = cardData;
        const cycleTime = 3; // 3 seconds per full rotation
        const progress = (elapsed % cycleTime) / cycleTime;
        
        runners.forEach((runner, index) => {
            // Each runner starts at a different position (90 degrees apart)
            const runnerProgress = (progress + (index * 0.25)) % 1;
            const angle = runnerProgress * 360;
            
            // Calculate position on the border
            const position = this.getPositionOnBorder(rect.width + 40, rect.height + 40, angle);
            
            // Apply styles
            runner.style.position = 'absolute';
            runner.style.left = position.x + 'px';
            runner.style.top = position.y + 'px';
            runner.style.width = '12px';
            runner.style.height = '12px';
            runner.style.borderRadius = '50%';
            runner.style.background = 'rgba(139, 92, 246, 1)';
            runner.style.boxShadow = `
                0 0 15px rgba(139, 92, 246, 1),
                0 0 30px rgba(139, 92, 246, 0.8),
                0 0 45px rgba(139, 92, 246, 0.6),
                0 0 60px rgba(139, 92, 246, 0.4)
            `;
            runner.style.transform = 'translate(-50%, -50%)';
            runner.style.zIndex = '1';
            runner.style.display = 'block';
        });
    }

    getPositionOnBorder(width, height, angleDegrees) {
        const angle = (angleDegrees * Math.PI) / 180;
        const centerX = width / 2;
        const centerY = height / 2;
        const radiusX = width / 2 - 10;
        const radiusY = height / 2 - 10;
        
        // Calculate position on elliptical border
        const x = centerX + radiusX * Math.cos(angle);
        const y = centerY + radiusY * Math.sin(angle);
        
        return { x, y };
    }

    pauseCardAnimation(cardData) {
        // Create full border glow effect
        cardData.runners.forEach(runner => {
            runner.style.background = 'rgba(139, 92, 246, 0.95)';
            runner.style.boxShadow = `
                0 0 30px rgba(139, 92, 246, 0.9),
                0 0 60px rgba(139, 92, 246, 0.7),
                0 0 100px rgba(139, 92, 246, 0.5),
                0 0 140px rgba(139, 92, 246, 0.3)
            `;
        });

        // Position runners at corners for full border effect
        const positions = [
            { x: 10, y: 10 }, // Top-left
            { x: cardData.rect.width + 30, y: 10 }, // Top-right
            { x: cardData.rect.width + 30, y: cardData.rect.height + 30 }, // Bottom-right
            { x: 10, y: cardData.rect.height + 30 } // Bottom-left
        ];

        cardData.runners.forEach((runner, index) => {
            runner.style.left = positions[index].x + 'px';
            runner.style.top = positions[index].y + 'px';
        });
    }

    resumeCardAnimation(cardData) {
        // Reset runner styles - animation will resume automatically
        cardData.runners.forEach(runner => {
            runner.style.background = 'rgba(139, 92, 246, 1)';
            runner.style.boxShadow = `
                0 0 20px rgba(139, 92, 246, 0.8),
                0 0 40px rgba(139, 92, 246, 0.6),
                0 0 60px rgba(139, 92, 246, 0.4),
                0 0 80px rgba(139, 92, 246, 0.2)
            `;
        });
    }

    handleResize() {
        // Reposition all glow containers
        this.cards.forEach(cardData => {
            this.positionGlowContainer(cardData);
        });
    }

    destroy() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        // Remove all glow containers
        this.cards.forEach(cardData => {
            if (cardData.glowContainer.parentNode) {
                cardData.glowContainer.parentNode.removeChild(cardData.glowContainer);
            }
        });

        this.cards = [];
    }
}

// Initialize when page loads
let eventCardGlow;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        eventCardGlow = new EventCardGlow();
    });
} else {
    eventCardGlow = new EventCardGlow();
}

// Export for potential manual control
window.EventCardGlow = EventCardGlow;