/**
 * DOM Utilities Module
 * Helper functions for DOM manipulation, loading states, and UI interactions
 */

/**
 * Show loading overlay
 */
export function showLoading() {
    let overlay = document.querySelector('.loading-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loader"></div>
        `;
        document.body.appendChild(overlay);
    }
    
    overlay.classList.add('active');
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    
    if (overlay) {
        overlay.classList.remove('active');
        // Remove after transition
        setTimeout(() => {
            if (overlay.parentNode && !overlay.classList.contains('active')) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast ('success', 'error', 'warning', 'info')
 * @param {number} duration - Duration in milliseconds
 */
export function showToast(message, type = 'info', duration = 3000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
        info: '#3B82F6'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]}" style="color: ${colors[type]};"></i>
        <span>${sanitizeHTML(message)}</span>
        <button class="toast-close" aria-label="Close notification">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border-left: 4px solid ${colors[type]};
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        cursor: pointer;
        color: #6B7280;
        margin-left: auto;
    `;
    
    closeBtn.addEventListener('click', () => removeToast(toast));
    
    // Add to container and animate in
    toastContainer.appendChild(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    // Auto remove after duration
    setTimeout(() => removeToast(toast), duration);
}

/**
 * Remove toast notification
 * @param {HTMLElement} toast - Toast element to remove
 */
function removeToast(toast) {
    if (toast && toast.parentNode) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function to limit function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit time in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - Element to check
 * @returns {boolean} Whether element is in viewport
 */
export function isElementInViewport(element) {
    const rect = element.getBoundingClientRect();
    
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Animate element into view
 * @param {HTMLElement} element - Element to animate
 * @param {string} animation - Animation class to add
 */
export function animateElementIntoView(element, animation = 'fadeInUp') {
    if (!element) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animation);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    observer.observe(element);
}

/**
 * Create skeleton loading card
 * @returns {HTMLElement} Skeleton card element
 */
export function createSkeletonCard() {
    const skeleton = document.createElement('div');
    skeleton.className = 'event-card-skeleton';
    
    skeleton.innerHTML = `
        <div class="skeleton-image"></div>
        <div class="skeleton-content">
            <div class="skeleton-title"></div>
            <div class="skeleton-description"></div>
            <div class="skeleton-button"></div>
        </div>
    `;
    
    return skeleton;
}

/**
 * Show skeleton loading state
 * @param {HTMLElement} container - Container to show skeletons in
 * @param {number} count - Number of skeleton cards to show
 */
export function showSkeletonLoading(container, count = 3) {
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const skeleton = createSkeletonCard();
        container.appendChild(skeleton);
    }
}

/**
 * Format date string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    if (!date) return 'TBA';
    
    try {
        const dateObj = date instanceof Date ? date : new Date(date);
        
        return dateObj.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'TBA';
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const success = document.execCommand('copy');
            document.body.removeChild(textArea);
            return success;
        }
    } catch (error) {
        console.error('Error copying to clipboard:', error);
        return false;
    }
}

/**
 * Smooth scroll to element
 * @param {HTMLElement|string} target - Target element or selector
 * @param {number} offset - Offset from top
 */
export function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    
    if (!element) {
        console.warn('Scroll target not found:', target);
        return;
    }
    
    const targetPosition = element.offsetTop - offset;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

/**
 * Create fade transition between content changes
 * @param {HTMLElement} element - Element to fade
 * @param {Function} updateContent - Function to update content
 * @param {number} duration - Transition duration in ms
 */
export function fadeTransition(element, updateContent, duration = 300) {
    if (!element || typeof updateContent !== 'function') return;
    
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';
    
    setTimeout(() => {
        updateContent();
        element.style.opacity = '1';
    }, duration);
}