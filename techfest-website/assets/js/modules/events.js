/**
 * Events Module
 * Handles event data loading, rendering, and management
 */

import { getCollection, addDocument, updateDocument, deleteDocument, listenToCollection } from './firebase.js';

// Events data cache
let eventsData = [];

/**
 * Load events from Firebase
 * @returns {Promise<Array>} Events data array
 */
export async function loadEvents() {
    try {
        console.log('📅 Loading events from Firebase...');
        // Fetch all events to avoid missing composite indexes or schema variance
        const all = await getCollection('events');
        // Support both isActive and active flags
        const active = (all || []).filter(e => e && (e.isActive === true || e.active === true));
        // Sort client-side by date if present
        active.sort((a, b) => {
            const da = new Date(a?.date || 0).getTime();
            const db = new Date(b?.date || 0).getTime();
            return da - db;
        });
        eventsData = active;
        console.log(`✅ Loaded ${eventsData.length} events from Firebase`);
        return eventsData;
    } catch (error) {
        console.error('❌ Error loading events from Firebase:', error);
        console.error('Please add events using the admin panel first');
        eventsData = []; // Return empty array instead of fallback
        return eventsData;
    }
}

/**
 * Get cached events data
 * @returns {Array} Cached events data
 */
export function getEventsData() {
    return eventsData;
}

/**
 * Render events to the DOM
 * @param {Array} events - Events data (optional, uses cached if not provided)
 */
export function renderEvents(events = null) {
    const eventsToRender = events || eventsData;
    const eventsGrid = document.getElementById('events-grid');
    
    if (!eventsGrid) {
        console.warn('Events grid element not found');
        return;
    }
    
    if (eventsToRender.length === 0) {
        renderNoEvents(eventsGrid);
        return;
    }
    
    // Clear existing content
    eventsGrid.innerHTML = '';
    
    // Render each event
    eventsToRender.forEach((event, index) => {
        const eventCard = createEventCard(event, index);
        eventsGrid.appendChild(eventCard);
    });
    
    // Initialize card animations
    initializeEventCardAnimations();
    // Apply three-column layout and size adjustments
    applyEventGridLayout();
    
    console.log(`✅ Rendered ${eventsToRender.length} events`);
}

/**
 * Create an event card element
 * @param {Object} event - Event data
 * @param {number} index - Event index for animation delay
 * @returns {HTMLElement} Event card element
 */
function createEventCard(event, index) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.style.animationDelay = `${index * 0.1}s`;
    // Attach event id for easier poster mapping
    if (event && event.id) {
        card.setAttribute('data-event-id', String(event.id));
    }
    
    // Sanitize event data
    const safeEvent = {
        id: sanitizeText(event.id || ''),
        title: sanitizeText(event.title || 'Untitled Event'),
        description: sanitizeText(event.description || 'No description available'),
        date: sanitizeText(event.date || 'TBA'),
        prize: sanitizeText(event.prize || 'TBA'),
        category: sanitizeText(event.category || 'General'),
        imageUrl: event.imageUrl || ''
    };
    
    // Build poster path based on event ID as per naming convention poster-<eventId>
    const posterPath = safeEvent.id ? `assets/posters/poster-${safeEvent.id}.jpg` : '';
    const posterAlt = safeEvent.title || 'Event Poster';

    card.innerHTML = `
        <div class="event-image a4-poster">
            ${safeEvent.id ? 
                `<img src="${posterPath}" alt="${posterAlt}" loading="lazy" onerror="this.onerror=null;this.src='assets/posters/placeholder-poster.svg';">` :
                `<img src="assets/posters/placeholder-poster.svg" alt="${posterAlt}" loading="lazy">`
            }
        </div>
        <div class="event-content compact">
            <h3 class="event-title">${safeEvent.title}</h3>
            <button class="btn btn-primary event-button" onclick="openEventDetails('${safeEvent.id}')">
                View Details
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Add click handler for the entire card
    card.addEventListener('click', (e) => {
        // Don't trigger if clicking the button
        if (!e.target.closest('.event-button')) {
            openEventDetails(safeEvent.id);
        }
    });
    
    return card;
}

/**
 * Render no events state
 * @param {HTMLElement} container - Container element
 */
function renderNoEvents(container) {
    container.innerHTML = `
        <div class="no-events">
            <i class="fas fa-calendar-plus"></i>
            <h3>No Events Available Yet</h3>
            <p>Events will be loaded from the admin panel. Please add events using the administrative interface.</p>
            <div class="placeholder-action">
                <i class="fas fa-info-circle"></i>
                <span>Events are managed through Firestore database</span>
            </div>
        </div>
    `;
}

/**
 * Initialize event card animations
 */
function initializeEventCardAnimations() {
    const eventCards = document.querySelectorAll('.event-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('card-animated');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    eventCards.forEach(card => {
        observer.observe(card);
    });
}

/**
 * Open event details page
 * @param {string} eventId - Event ID
 */
export function openEventDetails(eventId) {
    if (!eventId) {
        console.error('No event ID provided');
        return;
    }
    
    // Store event ID for the details page
    sessionStorage.setItem('selectedEventId', eventId);
    
    // Navigate to details page
    window.location.href = `events/details.html?id=${encodeURIComponent(eventId)}`;
}

/**
 * Search events by title or description
 * @param {string} query - Search query
 * @returns {Array} Filtered events
 */
export function searchEvents(query) {
    if (!query || query.trim() === '') {
        return eventsData;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
    return eventsData.filter(event => {
        const title = (event.title || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const category = (event.category || '').toLowerCase();
        
        return title.includes(searchTerm) || 
               description.includes(searchTerm) || 
               category.includes(searchTerm);
    });
}

/**
 * Filter events by category
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered events
 */
export function filterEventsByCategory(category) {
    if (!category || category === 'all') {
        return eventsData;
    }
    
    return eventsData.filter(event => 
        (event.category || '').toLowerCase() === category.toLowerCase()
    );
}

/**
 * Add new event (admin function)
 * @param {Object} eventData - Event data
 * @returns {Promise<string>} Event ID
 */
export async function addEvent(eventData) {
    try {
        const eventId = await addDocument('events', eventData);
        
        // Update local cache
        await loadEvents();
        
        // Re-render events
        renderEvents();
        
        return eventId;
    } catch (error) {
        console.error('Error adding event:', error);
        throw error;
    }
}

/**
 * Update existing event (admin function)
 * @param {string} eventId - Event ID
 * @param {Object} updates - Updated data
 * @returns {Promise} Update promise
 */
export async function updateEvent(eventId, updates) {
    try {
        await updateDocument('events', eventId, updates);
        
        // Update local cache
        await loadEvents();
        
        // Re-render events
        renderEvents();
    } catch (error) {
        console.error('Error updating event:', error);
        throw error;
    }
}

/**
 * Delete event (admin function)
 * @param {string} eventId - Event ID
 * @returns {Promise} Delete promise
 */
export async function deleteEvent(eventId) {
    try {
        await deleteDocument('events', eventId);
        
        // Update local cache
        await loadEvents();
        
        // Re-render events
        renderEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
        throw error;
    }
}

/**
 * Listen for real-time event updates
 * @param {Function} callback - Callback function for updates
 * @returns {Function} Unsubscribe function
 */
export function listenToEvents(callback) {
    return listenToCollection('events', (events) => {
        const filtered = (events || []).filter(event => event && (event.isActive === true || event.active === true));
        // Sort by date client-side
        filtered.sort((a, b) => {
            const da = new Date(a?.date || 0).getTime();
            const db = new Date(b?.date || 0).getTime();
            return da - db;
        });
        eventsData = filtered;
        renderEvents();
        if (callback) callback(eventsData);
    });
}

/**
 * Get default events for fallback
 * @returns {Array} Default events data
 */
function getDefaultEvents() {
    // Return empty array - events should be loaded from Firestore via admin panel
    // Show skeleton loading states while waiting for real data
    return [];
}

/**
 * Sanitize text to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} Sanitized text
 */
function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

// Make openEventDetails globally available for onclick handlers
window.openEventDetails = openEventDetails;

/**
 * Apply three-column layout rules and shrink card sizes.
 * Rules:
 * - Desktop (>= 992px): 3 columns
 * - If remainder 1 on last row: center the single card (column 2)
 * - If remainder 2 on last row: place cards in columns 1 and 3
 * Also add a 'small' class to cards to slightly reduce spacing.
 */
function applyEventGridLayout() {
    const grid = document.getElementById('events-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.event-card'));
    // Make cards slightly smaller
    cards.forEach(card => card.classList.add('small'));
    
    // Clear previous manual placements
    cards.forEach(card => {
        card.style.gridColumn = '';
        card.style.gridRow = '';
    });
    
    const isDesktop = window.matchMedia('(min-width: 992px)').matches;
    if (!isDesktop) return; // Only apply on desktop; mobile/tablet use responsive defaults
    
    const n = cards.length;
    if (n === 0) return;
    const rem = n % 3;
    if (rem === 1) {
        // Center the last card
        const last = cards[n - 1];
        last.style.gridColumn = '2 / span 1';
    } else if (rem === 2) {
        // Place last two as left and right columns
        const secondLast = cards[n - 2];
        const last = cards[n - 1];
        secondLast.style.gridColumn = '1 / span 1';
        last.style.gridColumn = '3 / span 1';
    }
}

// Re-apply layout on resize (debounced)
let __applyLayoutRaf;
window.addEventListener('resize', () => {
    if (__applyLayoutRaf) cancelAnimationFrame(__applyLayoutRaf);
    __applyLayoutRaf = requestAnimationFrame(applyEventGridLayout);
});