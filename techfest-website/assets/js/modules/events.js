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
        
        const events = await getCollection('events', {
            orderBy: { field: 'date', direction: 'asc' },
            where: [['isActive', '==', true]]
        });
        
        eventsData = events;
        console.log(`✅ Loaded ${events.length} events`);
        return events;
    } catch (error) {
        console.error('❌ Error loading events:', error);
        // Fallback to default events
        eventsData = getDefaultEvents();
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
    
    card.innerHTML = `
        <div class="event-image">
            ${safeEvent.imageUrl ? 
                `<img src="${safeEvent.imageUrl}" alt="${safeEvent.title}" loading="lazy">` :
                `<i class="fas fa-calendar-alt"></i>`
            }
        </div>
        <div class="event-content">
            <h3 class="event-title">${safeEvent.title}</h3>
            <p class="event-description">${safeEvent.description}</p>
            <div class="event-meta">
                <span class="event-prize">Prize: ${safeEvent.prize}</span>
                <span class="event-date">${safeEvent.date}</span>
            </div>
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
    window.location.href = 'events/details.html';
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
        eventsData = events.filter(event => event.isActive);
        renderEvents();
        if (callback) callback(eventsData);
    }, {
        orderBy: { field: 'date', direction: 'asc' },
        where: [['isActive', '==', true]]
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