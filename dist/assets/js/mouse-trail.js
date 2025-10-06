/**
 * Mouse Trail Effect for TechFest Website
 * Creates a single glowing line trail following the mouse cursor
 */

class MouseTrail {
    constructor() {
        this.trailPoints = [];
        this.maxPoints = 20;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isEnabled = true;
        this.trailColor = this.generateRandomColor();
        this.lastMouseMoveTime = Date.now();
        this.isRetracting = false;
        
        this.init();
    }

    init() {
        this.createTrailContainer();
        this.bindEvents();
        this.animate();
    }

    generateRandomColor() {
        const colors = [
            { r: 255, g: 120, b: 180 },   // Bright Pink
            { r: 100, g: 255, b: 255 },   // Light Cyan
            { r: 255, g: 150, b: 80 },    // Bright Orange
            { r: 150, g: 255, b: 100 },   // Bright Lime
            { r: 255, g: 255, b: 100 },   // Light Yellow
            { r: 200, g: 120, b: 255 },   // Bright Purple
            { r: 255, g: 120, b: 120 },   // Coral Red
            { r: 120, g: 220, b: 255 },   // Bright Sky Blue
            { r: 255, g: 100, b: 150 },   // Bright Rose
            { r: 100, g: 255, b: 180 },   // Bright Spring Green
            { r: 255, g: 180, b: 100 },   // Peach
            { r: 180, g: 255, b: 120 },   // Light Green
            { r: 120, g: 180, b: 255 },   // Periwinkle
            { r: 255, g: 120, b: 220 },   // Magenta
            { r: 220, g: 255, b: 120 }    // Lime Yellow
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createTrailContainer() {
        // Create SVG container for smooth line trail
        this.trailContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.trailContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
        `;
        document.body.appendChild(this.trailContainer);

        // Create the trail path element
        this.trailPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.trailPath.style.cssText = `
            fill: none;
            stroke: rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.7);
            stroke-width: 2;
            stroke-linecap: round;
            stroke-linejoin: round;
            filter: drop-shadow(0 0 4px rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.4)) 
                    drop-shadow(0 0 8px rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.2));
            opacity: 0.8;
        `;
        this.trailContainer.appendChild(this.trailPath);

        // Initialize trail points array
        this.trailPoints = [];
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            if (!this.isEnabled) return;
            
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.lastMouseMoveTime = Date.now();
            this.isRetracting = false;
            
            // Add new point to trail
            this.addTrailPoint(this.mouseX, this.mouseY);
        });

        // Disable trail on mobile devices
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.isEnabled = false;
            this.trailContainer.style.display = 'none';
        }

        // Clear trail when mouse leaves window
        document.addEventListener('mouseleave', () => {
            this.fadeOutTrail();
        });

        document.addEventListener('mouseenter', () => {
            if (!('ontouchstart' in window)) {
                this.isEnabled = true;
            }
        });
    }

    addTrailPoint(x, y) {
        // Add new point to the beginning of the array
        this.trailPoints.unshift({ x, y, timestamp: Date.now() });
        
        // Remove old points beyond max limit
        if (this.trailPoints.length > this.maxPoints) {
            this.trailPoints.pop();
        }
        
        // Reset retraction state when adding new points
        this.isRetracting = false;
        this.lastMouseMoveTime = Date.now();
    }

    fadeOutTrail() {
        // Force immediate retraction when mouse leaves window
        this.lastMouseMoveTime = Date.now() - 1600; // Force immediate retraction
        this.isRetracting = true;
    }

    updateTrailPath() {
        if (!this.isEnabled) {
            this.trailPath.setAttribute('d', '');
            return;
        }

        const currentTime = Date.now();
        const timeSinceLastMove = currentTime - this.lastMouseMoveTime;
        const retractionTime = 1500; // 1.5 seconds
        
        // Clean up very old points
        this.trailPoints = this.trailPoints.filter(point => {
            return (currentTime - point.timestamp) < 5000;
        });
        
        // Check if we should start retracting
        if (timeSinceLastMove > 100 && !this.isRetracting) {
            this.isRetracting = true;
        }
        
        let visiblePoints = [...this.trailPoints];
        
        // Simple, smooth retraction
        if (this.isRetracting && timeSinceLastMove < retractionTime) {
            const retractionProgress = Math.min(timeSinceLastMove / retractionTime, 1);
            
            // Smooth easing - ease out cubic for natural feel
            const eased = 1 - Math.pow(1 - retractionProgress, 3);
            
            // Calculate number of points to show
            const totalPoints = this.trailPoints.length;
            const pointsToShow = Math.max(0, Math.ceil(totalPoints * (1 - eased)));
            
            visiblePoints = this.trailPoints.slice(0, pointsToShow);
        }
        
        // If fully retracted or no points, clear the trail
        if ((this.isRetracting && timeSinceLastMove >= retractionTime) || visiblePoints.length < 2) {
            this.trailPath.setAttribute('d', '');
            return;
        }

        // Create smooth path through visible trail points
        let pathData = `M ${visiblePoints[0].x} ${visiblePoints[0].y}`;
        
        if (visiblePoints.length === 2) {
            // Two points - smooth line
            pathData += ` L ${visiblePoints[1].x} ${visiblePoints[1].y}`;
        } else if (visiblePoints.length > 2) {
            // Multiple points - use smooth curves
            for (let i = 1; i < visiblePoints.length; i++) {
                const current = visiblePoints[i];
                
                if (i === 1) {
                    // First segment - start with a line to avoid initial curve issues
                    pathData += ` L ${current.x} ${current.y}`;
                } else {
                    // Subsequent segments - smooth quadratic curves
                    const previous = visiblePoints[i - 1];
                    const beforePrevious = visiblePoints[i - 2];
                    
                    // Control point for smooth curve
                    const controlX = previous.x;
                    const controlY = previous.y;
                    
                    pathData += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
                }
            }
        }
        
        // Set the path data
        this.trailPath.setAttribute('d', pathData);
        
        // Set the path data
        this.trailPath.setAttribute('d', pathData);
        
        // Simple, smooth opacity handling
        let opacity = 0.7;
        if (this.isRetracting && timeSinceLastMove < retractionTime) {
            const retractionProgress = Math.min(timeSinceLastMove / retractionTime, 1);
            // Gentle fade out as trail retracts
            opacity = 0.7 * (1 - retractionProgress * 0.4);
        }
        
        // Update stroke opacity
        const rgbMatch = this.trailPath.style.stroke.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (rgbMatch) {
            const r = rgbMatch[1];
            const g = rgbMatch[2];
            const b = rgbMatch[3];
            this.trailPath.style.stroke = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        }
    }

    updateTrail() {
        if (!this.isEnabled) return;
        this.updateTrailPath();
    }

    animate() {
        this.updateTrail();
        requestAnimationFrame(() => this.animate());
    }

    // Public methods for controlling the trail
    enable() {
        this.isEnabled = true;
        this.trailContainer.style.display = 'block';
    }

    disable() {
        this.isEnabled = false;
        this.fadeOutTrail();
    }

    toggle() {
        if (this.isEnabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    changeColor() {
        this.trailColor = this.generateRandomColor();
        
        // Update stroke with current opacity (will be overridden by updateTrailPath if needed)
        this.trailPath.style.stroke = `rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.7)`;
        this.trailPath.style.filter = `drop-shadow(0 0 4px rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.4)) 
                                      drop-shadow(0 0 8px rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.2))`;
    }

    destroy() {
        this.disable();
        if (this.trailContainer && this.trailContainer.parentNode) {
            this.trailContainer.parentNode.removeChild(this.trailContainer);
        }
    }
}

// Initialize mouse trail when DOM is loaded
let mouseTrail = null;

function initMouseTrail() {
    // Only initialize on devices that support hover and have a fine pointer
    const isDesktopPointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopPointer) {
        console.log('Mouse trail disabled: non-desktop pointer (touch) detected');
        return;
    }

    mouseTrail = new MouseTrail();
        
        // Add keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 't' && e.ctrlKey) {
                e.preventDefault();
                if (mouseTrail) {
                    mouseTrail.toggle();
                }
            }
            // Press Ctrl+R to change trail color
            if (e.key.toLowerCase() === 'r' && e.ctrlKey) {
                e.preventDefault();
                if (mouseTrail) {
                    mouseTrail.changeColor();
                }
            }
        });
        
    console.log('🎯 Mouse trail effect initialized! Press Ctrl+T to toggle, Ctrl+R to change color.');
}

// Auto-initialize when script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMouseTrail);
} else {
    initMouseTrail();
}

// Export for potential external use
window.MouseTrail = MouseTrail;
window.mouseTrail = mouseTrail;