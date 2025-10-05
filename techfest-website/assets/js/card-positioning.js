/**
 * Dynamic Card Positioning System
 * Positions floating cards randomly while maintaining buffer zones from text elements
 */

class CardPositioner {
    constructor() {
        this.bufferZone = 50; // Increased buffer zone for better spacing
        this.cardSize = 50; // Card width/height
        this.cardBuffer = 35; // Increased buffer between cards
        this.textElements = [];
        this.cards = [];
        this.placedCards = []; // Track positioned cards
        this.heroContainer = null;
        this.gridCells = []; // Available grid positions
        this.debounceTimer = null;
        this.retryAttempts = 150; // Increased retry attempts
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    }

    setup() {
        this.heroContainer = document.querySelector('.hero');
        if (!this.heroContainer) return;

        this.findTextElements();
        this.findCards();
        this.positionCards();

        // Reposition on window resize with debouncing
        window.addEventListener('resize', () => {
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
            }
            this.debounceTimer = setTimeout(() => {
                this.positionCards();
            }, 250);
        });

        // Reposition when page is fully loaded (after fonts, images)
        window.addEventListener('load', () => {
            setTimeout(() => this.positionCards(), 500);
        });
    }

    findTextElements() {
        // Find all text-containing elements in the hero section AND navbar
        const textSelectors = [
            '.navbar',
            '.organization-header',
            '.hero-main-content',
            '.hero-details',
            '.hero-stats',
            '.hero-buttons',
            '.scroll-indicator',
            '.techfest-branding',
            '.presents-text',
            '.nav-logo',
            '.nav-menu',
            'h1', 'h2', 'h3', 'p', // Any text elements
            '.detail-item',
            '.stat'
        ];

        this.textElements = [];
        
        // Add navbar from document (not just hero container)
        const navbar = document.querySelector('.navbar');
        if (navbar && navbar.offsetWidth > 0 && navbar.offsetHeight > 0) {
            this.textElements.push(navbar);
        }
        
        // Add hero section elements with better detection
        textSelectors.slice(1).forEach(selector => {
            // Check both within hero container and document
            const heroElements = this.heroContainer ? this.heroContainer.querySelectorAll(selector) : [];
            const docElements = document.querySelectorAll(selector);
            
            [...heroElements, ...docElements].forEach(el => {
                if (el.offsetWidth > 0 && el.offsetHeight > 0 && 
                    !this.textElements.includes(el)) {
                    this.textElements.push(el);
                }
            });
        });
        
        console.log(`Found ${this.textElements.length} text elements to avoid`);
    }

    findCards() {
        this.cards = this.heroContainer.querySelectorAll('.floating-card');
    }

    getElementBounds(element) {
        const rect = element.getBoundingClientRect();
        const heroRect = this.heroContainer.getBoundingClientRect();
        
        // For navbar, calculate position relative to hero container
        if (element.classList.contains('navbar')) {
            const navbarBottom = rect.bottom;
            const heroTop = heroRect.top;
            
            return {
                left: 0,
                top: navbarBottom > heroTop ? 0 : navbarBottom - heroTop,
                right: heroRect.width,
                bottom: Math.max(0, navbarBottom - heroTop),
                width: heroRect.width,
                height: Math.max(0, navbarBottom - heroTop)
            };
        }
        
        return {
            left: rect.left - heroRect.left,
            top: rect.top - heroRect.top,
            right: rect.right - heroRect.left,
            bottom: rect.bottom - heroRect.top,
            width: rect.width,
            height: rect.height
        };
    }

    getHeroBounds() {
        return {
            width: this.heroContainer.offsetWidth,
            height: this.heroContainer.offsetHeight
        };
    }

    createPositionGrid() {
        const heroBounds = this.getHeroBounds();
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight + this.bufferZone : 120;
        
        this.gridCells = [];
        
        // More conservative zones to avoid content better
        const leftZone = {
            startX: 30,
            endX: Math.min(heroBounds.width * 0.25, 250), // Narrower left zone
            startY: navbarHeight + 30,
            endY: heroBounds.height - this.cardSize - 30
        };
        
        const rightZone = {
            startX: Math.max(heroBounds.width * 0.75, heroBounds.width - 250), // Narrower right zone
            endX: heroBounds.width - this.cardSize - 30,
            startY: navbarHeight + 30,
            endY: heroBounds.height - this.cardSize - 30
        };
        
        // Only create zones if they're wide enough
        if (leftZone.endX > leftZone.startX + this.cardSize) {
            this.createZoneGrid(leftZone, 'left');
        }
        
        if (rightZone.endX > rightZone.startX + this.cardSize) {
            this.createZoneGrid(rightZone, 'right');
        }
        
        // Add corner positions as additional safe spots
        this.addCornerPositions(heroBounds, navbarHeight);
        
        // Shuffle the grid cells for randomization
        this.shuffleArray(this.gridCells);
        
        console.log(`Created ${this.gridCells.length} potential positions`);
    }
    
    addCornerPositions(heroBounds, navbarHeight) {
        const cornerPositions = [
            // Top corners
            { x: 40, y: navbarHeight + 40, side: 'left' },
            { x: heroBounds.width - this.cardSize - 40, y: navbarHeight + 40, side: 'right' },
            
            // Bottom corners  
            { x: 40, y: heroBounds.height - this.cardSize - 40, side: 'left' },
            { x: heroBounds.width - this.cardSize - 40, y: heroBounds.height - this.cardSize - 40, side: 'right' },
            
            // Mid-edge positions
            { x: 40, y: heroBounds.height * 0.5, side: 'left' },
            { x: heroBounds.width - this.cardSize - 40, y: heroBounds.height * 0.5, side: 'right' }
        ];
        
        cornerPositions.forEach(pos => {
            this.gridCells.push({ ...pos, occupied: false });
        });
    }

    createZoneGrid(zone, side) {
        const cellSpacing = this.cardSize + this.cardBuffer;
        const cols = Math.floor((zone.endX - zone.startX) / cellSpacing);
        const rows = Math.floor((zone.endY - zone.startY) / cellSpacing);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = zone.startX + (col * cellSpacing);
                const y = zone.startY + (row * cellSpacing);
                
                this.gridCells.push({
                    x: x,
                    y: y,
                    side: side,
                    occupied: false
                });
            }
        }
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    findGridPosition(preferredSide, fallbackIndex) {
        // First try to find a position on the preferred side
        const sidePositions = this.gridCells.filter(cell => 
            cell.side === preferredSide && !cell.occupied
        );

        if (sidePositions.length > 0) {
            const selectedCell = sidePositions[0];
            selectedCell.occupied = true;
            
            // Double-check that this position is safe (not overlapping text)
            if (this.isPositionSafe(selectedCell.x, selectedCell.y)) {
                return selectedCell;
            }
        }

        // Fallback: try any available position
        const availablePositions = this.gridCells.filter(cell => !cell.occupied);
        
        for (let cell of availablePositions) {
            if (this.isPositionSafe(cell.x, cell.y)) {
                cell.occupied = true;
                return cell;
            }
        }

        // Ultimate fallback: use predefined safe positions
        return this.getFallbackPosition();
    }

    isPositionSafe(x, y) {
        const cardBounds = {
            left: x,
            top: y,
            right: x + this.cardSize,
            bottom: y + this.cardSize
        };

        // Check collision with text elements
        for (let element of this.textElements) {
            const elementBounds = this.getElementBounds(element);
            
            // Expand element bounds by buffer zone
            const bufferedBounds = {
                left: elementBounds.left - this.bufferZone,
                top: elementBounds.top - this.bufferZone,
                right: elementBounds.right + this.bufferZone,
                bottom: elementBounds.bottom + this.bufferZone
            };

            // Check if card overlaps with buffered element
            if (this.isOverlapping(cardBounds, bufferedBounds)) {
                return false;
            }
        }

        // Check collision with already placed cards
        for (let placedCard of this.placedCards) {
            const placedBounds = {
                left: placedCard.x - this.cardBuffer,
                top: placedCard.y - this.cardBuffer,
                right: placedCard.x + this.cardSize + this.cardBuffer,
                bottom: placedCard.y + this.cardSize + this.cardBuffer
            };

            if (this.isOverlapping(cardBounds, placedBounds)) {
                return false;
            }
        }

        return true;
    }

    isOverlapping(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom);
    }

    generateRandomPosition() {
        const heroBounds = this.getHeroBounds();
        const maxX = heroBounds.width - this.cardSize;
        const maxY = heroBounds.height - this.cardSize;
        
        // Get navbar height to ensure cards don't go under it
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight + this.bufferZone : 80; // fallback 80px
        
        // Start Y position after navbar with buffer
        const minY = navbarHeight;

        return {
            x: Math.random() * maxX,
            y: minY + Math.random() * (maxY - minY)
        };
    }

    findSafePosition(maxAttempts = 200) {
        for (let i = 0; i < maxAttempts; i++) {
            const position = this.generateRandomPosition();
            
            if (this.isPositionSafe(position.x, position.y)) {
                this.placedCards.push({ x: position.x, y: position.y });
                return position;
            }
        }

        // Try multiple fallback positions if random positioning fails
        const fallback = this.getFallbackPosition();
        if (fallback) {
            this.placedCards.push({ x: fallback.x, y: fallback.y });
        }
        return fallback;
    }

    getFallbackPosition() {
        const heroBounds = this.getHeroBounds();
        const navbar = document.querySelector('.navbar');
        const navbarHeight = navbar ? navbar.offsetHeight + this.bufferZone : 80;
        
        // Create a grid of fallback positions around the edges
        const fallbackPositions = [
            // Top edge positions (below navbar)
            { x: 20, y: navbarHeight + 20 },
            { x: heroBounds.width * 0.25, y: navbarHeight + 20 },
            { x: heroBounds.width * 0.75, y: navbarHeight + 20 },
            { x: heroBounds.width - this.cardSize - 20, y: navbarHeight + 20 },
            
            // Left edge positions
            { x: 20, y: navbarHeight + 100 },
            { x: 20, y: heroBounds.height * 0.4 },
            { x: 20, y: heroBounds.height * 0.6 },
            { x: 20, y: heroBounds.height - this.cardSize - 20 },
            
            // Right edge positions
            { x: heroBounds.width - this.cardSize - 20, y: navbarHeight + 100 },
            { x: heroBounds.width - this.cardSize - 20, y: heroBounds.height * 0.4 },
            { x: heroBounds.width - this.cardSize - 20, y: heroBounds.height * 0.6 },
            { x: heroBounds.width - this.cardSize - 20, y: heroBounds.height - this.cardSize - 20 },
            
            // Bottom edge positions
            { x: heroBounds.width * 0.25, y: heroBounds.height - this.cardSize - 20 },
            { x: heroBounds.width * 0.75, y: heroBounds.height - this.cardSize - 20 }
        ];

        // Try to find a safe fallback position
        for (let position of fallbackPositions) {
            if (this.isPositionSafe(position.x, position.y)) {
                return position;
            }
        }

        // Ultimate fallback - return first position (even if not ideal)
        return fallbackPositions[0];
    }

    positionCards() {
        if (!this.cards.length) return;

        this.findTextElements(); // Refresh text elements positions
        this.placedCards = []; // Reset placed cards tracking
        
        // Reduce number of cards on mobile devices
        const isMobile = window.innerWidth <= 768;
        const isTablet = window.innerWidth <= 1024;
        
        let activeCards = [...this.cards];
        
        if (isMobile) {
            // Show only 4 cards on mobile
            activeCards = [...this.cards].slice(0, 4);
            [...this.cards].slice(4).forEach(card => card.style.display = 'none');
        } else if (isTablet) {
            // Show 6 cards on tablet
            activeCards = [...this.cards].slice(0, 6);
            [...this.cards].slice(6).forEach(card => card.style.display = 'none');
        } else {
            // Show all cards on desktop
            [...this.cards].forEach(card => card.style.display = 'flex');
        }

        this.createPositionGrid(); // Create grid-based positioning

        // Distribute active cards evenly between left and right sides
        const leftCards = [];
        const rightCards = [];
        
        activeCards.forEach((card, index) => {
            if (index % 2 === 0) {
                leftCards.push(card);
            } else {
                rightCards.push(card);
            }
        });

        // Position cards using grid system
        const positions = [];
        let gridIndex = 0;

        // Position left side cards
        leftCards.forEach(card => {
            const position = this.findGridPosition('left', gridIndex);
            if (position) {
                positions.push({ card, position });
                gridIndex++;
            }
        });

        // Position right side cards  
        rightCards.forEach(card => {
            const position = this.findGridPosition('right', gridIndex);
            if (position) {
                positions.push({ card, position });
                gridIndex++;
            }
        });

        // Handle cards that couldn't be positioned with grid system
        const remainingCards = [...this.cards].filter(card => 
            !positions.find(p => p.card === card)
        );
        
        remainingCards.forEach(card => {
            const safePosition = this.findSafePosition();
            if (safePosition) {
                positions.push({ card, position: safePosition });
            }
        });

        console.log(`Positioned ${positions.length} out of ${this.cards.length} cards`);

        // Apply positions with staggered animations
        positions.forEach(({ card, position }, index) => {
            // Convert to percentage for responsive design
            const heroBounds = this.getHeroBounds();
            const leftPercent = Math.max(0, Math.min(95, (position.x / heroBounds.width) * 100));
            const topPercent = Math.max(0, Math.min(95, (position.y / heroBounds.height) * 100));

            // Set position with bounds checking
            card.style.left = `${leftPercent}%`;
            card.style.top = `${topPercent}%`;
            card.style.position = 'absolute';
            card.style.zIndex = '1';
            
            // Add staggered entrance animation
            setTimeout(() => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.3)';
                
                setTimeout(() => {
                    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(0.8)';
                }, 50);
            }, index * 150);
        });

        // Hide cards that couldn't be positioned safely
        [...this.cards].forEach(card => {
            if (!positions.find(p => p.card === card)) {
                card.style.display = 'none';
                console.log('Hiding card that couldn\'t be positioned safely');
            }
        });
    }

    // Public method to refresh positioning
    refresh() {
        this.positionCards();
    }
}

// Initialize the card positioner
const cardPositioner = new CardPositioner();
cardPositioner.init();

// Export for potential external use
window.CardPositioner = cardPositioner;