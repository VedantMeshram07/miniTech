/*
 * Mouse Trail Effect
 * - Uses pointer events when available to unify mouse/touch/pen
 * - Uses passive touch listeners so native scrolling is preserved
 * - Follows the first touch point for multi-touch devices
 */

class MouseTrail {
    constructor(options = {}) {
        // Detect touch devices to use cheaper defaults
        const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0);

        // maxPoints acts as a ceiling on number of stored points for smoothing
        this.maxPoints = options.maxPoints || (isTouch ? 14 : 30);
        // minimum pixel distance between recorded points (reduces noise)
        this.minDistance = options.minDistance || (isTouch ? 8 : 6);
        // maximum total path length in pixels (cap to limit CPU and visual length)
        this.maxPathLength = options.maxPathLength || 200; // px

        // Throttle updates on lower-powered / touch devices
    this.updateInterval = options.updateInterval || (isTouch ? 40 : 16); // ms; ~25fps on touch
    this._lastFrameTime = 0;
    this.trailPoints = [];
    this.isTouch = isTouch;
    this.segmentLengths = [];
    this.totalLength = 0;
    this._dirty = true;
        this.mouseX = 0;
        this.mouseY = 0;
        this.isEnabled = true;
        this.trailColor = this.generateRandomColor();
        this.lastMouseMoveTime = Date.now();
        this.isRetracting = false;

        this.createTrailContainer();
        this.bindEvents();
        this.animate();
    }

    generateRandomColor() {
        const colors = [
            { r: 255, g: 120, b: 180 },
            { r: 100, g: 255, b: 255 },
            { r: 255, g: 150, b: 80 },
            { r: 150, g: 255, b: 100 },
            { r: 255, g: 255, b: 100 },
            { r: 200, g: 120, b: 255 },
            { r: 255, g: 120, b: 120 },
            { r: 120, g: 220, b: 255 }
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    createTrailContainer() {
        this.trailContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        Object.assign(this.trailContainer.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999
        });
        this.trailPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        // Use attributes for cheap updates and avoid expensive style concatenation each frame
        this.trailPath.setAttribute('fill', 'none');
        this.trailPath.setAttribute('stroke', `rgb(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b})`);
        this.trailPath.setAttribute('stroke-width', 2);
        this.trailPath.setAttribute('stroke-linecap', 'round');
        this.trailPath.setAttribute('stroke-linejoin', 'round');
        this.trailPath.setAttribute('stroke-opacity', 0.8);
    // Drop-shadow filter is expensive on mobile; add only for non-touch devices
    if (!this.isTouch) this.trailPath.style.filter = `drop-shadow(0 0 4px rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.35))`;

        this.trailContainer.appendChild(this.trailPath);
        document.body.appendChild(this.trailContainer);
    }

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            if (!this.isEnabled) return;
            this.handlePointMove(e.clientX, e.clientY);
        }, { passive: true });

        if (window.PointerEvent) {
            document.addEventListener('pointermove', (e) => {
                if (!this.isEnabled) return;
                this.handlePointMove(e.clientX, e.clientY);
            }, { passive: true });

            document.addEventListener('pointerdown', (e) => {
                if (!this.isEnabled) return;
                this.trailContainer.style.display = 'block';
                this.handlePointMove(e.clientX, e.clientY);
            }, { passive: true });

            document.addEventListener('pointerup', () => this.fadeOutTrail(), { passive: true });
        } else {
            document.addEventListener('touchmove', (e) => {
                if (!this.isEnabled) return;
                const touch = e.touches[0];
                if (!touch) return;
                this.handlePointMove(touch.clientX, touch.clientY);
            }, { passive: true });

            document.addEventListener('touchstart', (e) => {
                if (!this.isEnabled) return;
                const touch = e.touches[0];
                if (!touch) return;
                this.trailContainer.style.display = 'block';
                this.handlePointMove(touch.clientX, touch.clientY);
            }, { passive: true });

            document.addEventListener('touchend', () => this.fadeOutTrail(), { passive: true });
        }

        document.addEventListener('mouseleave', () => { if (!('ontouchstart' in window)) this.fadeOutTrail(); });
        document.addEventListener('mouseenter', () => { if (!('ontouchstart' in window)) this.isEnabled = true; });
    }

    handlePointMove(x, y) {
        this.mouseX = x;
        this.mouseY = y;
        this.lastMouseMoveTime = Date.now();
        this.isRetracting = false;
        this.addTrailPoint(x, y);
    }

    addTrailPoint(x, y) {
        // Avoid adding points that are too close to the most recent point
        const last = this.trailPoints[0];
        if (last) {
            const dx = last.x - x;
            const dy = last.y - y;
            const distSq = dx * dx + dy * dy;
            if (distSq < this.minDistance * this.minDistance) return;
        }

        // Insert at head
        this.trailPoints.unshift({ x, y, timestamp: Date.now() });

        // Update segment lengths and total length
        if (this.trailPoints.length > 1) {
            const a = this.trailPoints[0];
            const b = this.trailPoints[1];
            const segLen = Math.hypot(a.x - b.x, a.y - b.y);
            this.segmentLengths.unshift(segLen);
            this.totalLength += segLen;
        }

        // Enforce max points (pop from tail)
        while (this.trailPoints.length > this.maxPoints) {
            this.trailPoints.pop();
            const removed = this.segmentLengths.pop();
            if (typeof removed === 'number') this.totalLength -= removed;
            if (this.totalLength < 0) this.totalLength = 0;
        }

        // Trim by total path length
        while (this.totalLength > this.maxPathLength && this.segmentLengths.length > 0) {
            const removed = this.segmentLengths.pop();
            this.trailPoints.pop();
            if (typeof removed === 'number') this.totalLength -= removed;
            if (this.totalLength < 0) this.totalLength = 0;
        }

        this._dirty = true;
    }

    fadeOutTrail() { this.lastMouseMoveTime = Date.now() - 1600; this.isRetracting = true; }

    updateTrailPath() {
        const currentTime = Date.now();
        const timeSinceLastMove = currentTime - this.lastMouseMoveTime;
        const retractionTime = 1500;

        this.trailPoints = this.trailPoints.filter(p => (currentTime - p.timestamp) < 5000);

        if (timeSinceLastMove > 100 && !this.isRetracting) this.isRetracting = true;

        let visiblePoints = [...this.trailPoints];
        if (this.isRetracting && timeSinceLastMove < retractionTime) {
            const retractionProgress = Math.min(timeSinceLastMove / retractionTime, 1);
            const eased = 1 - Math.pow(1 - retractionProgress, 3);
            const totalPoints = this.trailPoints.length;
            const pointsToShow = Math.max(0, Math.ceil(totalPoints * (1 - eased)));
            visiblePoints = this.trailPoints.slice(0, pointsToShow);
        }

        if ((this.isRetracting && timeSinceLastMove >= retractionTime) || visiblePoints.length < 2) {
            this.trailPath.setAttribute('d', '');
            return;
        }

        // If nothing changed and we're not retracting, skip recomputing the path
        if (!this._dirty && !this.isRetracting) return;

        let pathData = `M ${visiblePoints[0].x} ${visiblePoints[0].y}`;
        if (visiblePoints.length === 2) {
            pathData += ` L ${visiblePoints[1].x} ${visiblePoints[1].y}`;
        } else if (visiblePoints.length > 2) {
            for (let i = 1; i < visiblePoints.length; i++) {
                const current = visiblePoints[i];
                if (i === 1) pathData += ` L ${current.x} ${current.y}`;
                else {
                    const previous = visiblePoints[i - 1];
                    const controlX = previous.x;
                    const controlY = previous.y;
                    pathData += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
                }
            }
        }

        this.trailPath.setAttribute('d', pathData);

        let opacity = 0.7;
        if (this.isRetracting && timeSinceLastMove < retractionTime) {
            const retractionProgress = Math.min(timeSinceLastMove / retractionTime, 1);
            opacity = 0.7 * (1 - retractionProgress * 0.4);
        }

        this.trailPath.setAttribute('stroke-opacity', opacity);
        this.trailPath.setAttribute('stroke', `rgb(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b})`);
        if (!this.isRetracting) this._dirty = false;
    }

    updateTrail() { if (!this.isEnabled) return; this.updateTrailPath(); }

    animate(timestamp) {
        // requestAnimationFrame provides timestamp; fall back to Date.now()
        const now = typeof timestamp === 'number' ? timestamp : performance.now();
        if (!this._lastFrameTime) this._lastFrameTime = now;
        const delta = now - this._lastFrameTime;
        if (delta >= this.updateInterval) {
            this.updateTrail();
            this._lastFrameTime = now;
        }
        requestAnimationFrame((t) => this.animate(t));
    }

    enable() { this.isEnabled = true; if (this.trailContainer) this.trailContainer.style.display = 'block'; }
    disable() { this.isEnabled = false; this.fadeOutTrail(); }
    toggle() { if (this.isEnabled) this.disable(); else this.enable(); }
    changeColor() { this.trailColor = this.generateRandomColor(); this.trailPath.style.stroke = `rgba(${this.trailColor.r}, ${this.trailColor.g}, ${this.trailColor.b}, 0.7)`; }
    destroy() { this.disable(); if (this.trailContainer && this.trailContainer.parentNode) this.trailContainer.parentNode.removeChild(this.trailContainer); }
}

// Initialize
let mouseTrail = null;
function initMouseTrail() {
    // Only enable the trail on devices that support hover and a fine pointer
    const isDesktopPointer = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktopPointer) {
        console.log('Mouse trail disabled: non-desktop pointer (touch) detected');
        return;
    }

    if (!mouseTrail) mouseTrail = new MouseTrail();
    window.mouseTrail = mouseTrail;

    document.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't' && e.ctrlKey) { e.preventDefault(); if (mouseTrail) mouseTrail.toggle(); }
        if (e.key.toLowerCase() === 'r' && e.ctrlKey) { e.preventDefault(); if (mouseTrail) mouseTrail.changeColor(); }
    });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initMouseTrail);
else initMouseTrail();

window.MouseTrail = MouseTrail;
window.mouseTrail = mouseTrail;