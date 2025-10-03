// Event Details Page JavaScript
console.log('📄 Event details JavaScript loaded');

let currentEvent = null;
let relatedEvents = [];

// Wait for Firebase to be initialized
async function waitForFirebase(timeout = 3000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkFirebase = () => {
            if (window.db && window.auth) {
                console.log('✅ Firebase is ready for event details');
                resolve();
            } else if (Date.now() - startTime > timeout) {
                console.log('⚠️ Firebase timeout in event details, proceeding without it');
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM Content Loaded - starting initialization');
    initializeEventDetails();
});

// Initialize event details page
async function initializeEventDetails() {
    console.log('🚀 Initializing event details page...');
    showLoading();
    
    try {
        // Get event ID from URL or localStorage
        const eventId = getEventIdFromUrl() || getEventIdFromStorage();
        console.log('Event ID:', eventId);
        
        if (!eventId) {
            throw new Error('No event ID provided. Please access this page through the events list.');
        }
        
        // Wait for Firebase to be ready (if available)
        if (typeof waitForFirebase === 'function') {
            await waitForFirebase(3000);
        }
        
        // Load event data
        await loadEventDetails(eventId);
        await loadRelatedEvents(eventId);
        
        // Initialize UI components
        initializeNavigation();
        
        hideLoading();
        console.log('✅ Event details page initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing event details:', error);
        hideLoading();
        
        // Show more specific error messages
        let errorMsg = 'Failed to load event details.';
        if (error.message.includes('No event ID')) {
            errorMsg = 'Please access this page through the events list on the main page.';
        } else if (error.message.includes('not found')) {
            errorMsg = 'The requested event could not be found.';
        }
        
        showErrorMessage(`${errorMsg} Redirecting to events page...`);
        setTimeout(() => {
            window.location.href = '../index.html#events';
        }, 4000);
    }
}

// Get event ID from URL parameters
function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get event ID from localStorage (fallback)
function getEventIdFromStorage() {
    const storedEvent = localStorage.getItem('selectedEvent');
    if (storedEvent) {
        const event = JSON.parse(storedEvent);
        return event.id;
    }
    return null;
}

// Load event details
async function loadEventDetails(eventId) {
    try {
        console.log('🔍 Loading event details for ID:', eventId);
        console.log('📦 localStorage contents:', localStorage.getItem('selectedEvent'));
        
        // Try to load from localStorage first (most reliable)
        const storedEvent = localStorage.getItem('selectedEvent');
        if (storedEvent) {
            try {
                currentEvent = JSON.parse(storedEvent);
                console.log('✅ Event loaded from localStorage:', currentEvent.title);
                console.log('📄 Full event data:', currentEvent);
            } catch (e) {
                console.warn('❌ Failed to parse stored event:', e);
            }
        } else {
            console.log('⚠️ No event in localStorage');
        }
        
        // Try to load from database if available
        if (!currentEvent && window.db) {
            try {
                const doc = await window.db.collection('events').doc(eventId).get();
                if (doc.exists) {
                    currentEvent = { id: doc.id, ...doc.data() };
                    console.log('✅ Event loaded from database:', currentEvent.title);
                }
            } catch (e) {
                console.warn('Failed to load from database:', e);
            }
        }
        
        // Fallback to default events if still not found
        if (!currentEvent) {
            console.log('🔄 Falling back to default events');
            const defaultEvents = getDefaultEvents();
            console.log('📋 Available default events:', defaultEvents.map(e => e.id));
            currentEvent = defaultEvents.find(event => event.id === eventId);
            if (currentEvent) {
                console.log('✅ Event loaded from defaults:', currentEvent.title);
            } else {
                console.log('❌ Event not found in defaults either');
            }
        }
        
        if (!currentEvent) {
            console.error(`💥 Event with ID '${eventId}' not found anywhere`);
            throw new Error(`Event with ID '${eventId}' not found`);
        }
        
        // Render event details
        renderEventDetails();
        
    } catch (error) {
        console.error('Error loading event details:', error);
        throw error;
    }
}

// Render event details on the page
function renderEventDetails() {
    if (!currentEvent) return;
    
    // Update page title
    document.title = `${currentEvent.title} - TechFest 2025`;
    document.getElementById('event-title').textContent = `${currentEvent.title} - TechFest 2025`;
    
    // Update event header
    updateEventHeader();
    
    // Update event content
    updateEventContent();
    
    // Update sidebar
    updateSidebar();
}

function updateEventHeader() {
    // Event image
    const eventImage = document.getElementById('event-image');
    if (currentEvent.image) {
        eventImage.innerHTML = `<img src="${currentEvent.image}" alt="${currentEvent.title}" loading="lazy">`;
    } else {
        const icon = getEventIcon(currentEvent.category);
        eventImage.innerHTML = `<i class="fas fa-${icon}"></i>`;
    }
    
    // Event category
    const categoryBadge = document.getElementById('event-category-badge');
    categoryBadge.textContent = currentEvent.category || 'Technology';
    
    // Event title and description
    document.getElementById('event-title-main').textContent = currentEvent.title;
    document.getElementById('event-description-main').textContent = currentEvent.shortDescription || currentEvent.description;
    
    // Event stats
    document.getElementById('event-prize-amount').textContent = currentEvent.prize || '₹0';
    document.getElementById('event-date-value').textContent = currentEvent.date || 'TBD';
    
    // Determine participation type from rules
    let participationType = 'Individual';
    if (currentEvent.rules) {
        const teamRule = currentEvent.rules.find(rule => rule.toLowerCase().includes('team'));
        if (teamRule) {
            if (teamRule.toLowerCase().includes('2-4')) {
                participationType = 'Team (2-4)';
            } else if (teamRule.toLowerCase().includes('team')) {
                participationType = 'Team';
            }
        }
    }
    document.getElementById('event-participation-type').textContent = participationType;
    
    // Team requirements
    const teamRequirementsElement = document.getElementById('event-team-requirements');
    if (teamRequirementsElement) {
        teamRequirementsElement.textContent = currentEvent.teamRequirements || 'Individual';
    }
}

function updateEventContent() {
    // Detailed description
    const descriptionElement = document.getElementById('event-description-detailed');
    if (descriptionElement) {
        descriptionElement.textContent = currentEvent.description || 'Description not available.';
    }
    
    // Rules
    const rulesElement = document.getElementById('event-rules');
    if (rulesElement && currentEvent.rules && currentEvent.rules.length > 0) {
        const rulesList = document.createElement('ul');
        currentEvent.rules.forEach(rule => {
            const listItem = document.createElement('li');
            listItem.textContent = rule;
            rulesList.appendChild(listItem);
        });
        rulesElement.innerHTML = '';
        rulesElement.appendChild(rulesList);
    } else if (rulesElement) {
        rulesElement.innerHTML = '<p>Rules will be announced soon.</p>';
    }
}

function updateSidebar() {
    // Event coordinators
    const coordinatorsElement = document.getElementById('event-coordinators');
    if (coordinatorsElement && currentEvent.contacts && currentEvent.contacts.length > 0) {
        coordinatorsElement.innerHTML = '';
        currentEvent.contacts.forEach(contact => {
            const coordinatorItem = document.createElement('div');
            coordinatorItem.className = 'coordinator-item';
            coordinatorItem.innerHTML = `
                <h4>${contact.name}</h4>
                <div class="role">${contact.role || 'Event Coordinator'}</div>
                <div class="contact">${contact.phone || ''}</div>
                <div class="contact">${contact.email || ''}</div>
            `;
            coordinatorsElement.appendChild(coordinatorItem);
        });
    } else if (coordinatorsElement) {
        coordinatorsElement.innerHTML = '<p>Coordinator information will be updated soon.</p>';
    }
}

// Load related events
async function loadRelatedEvents(currentEventId) {
    try {
        let allEvents = [];
        
        // Try to load from database
        if (window.dbManager && window.dbManager.db) {
            allEvents = await window.dbManager.getEvents(true);
        } else {
            allEvents = getDefaultEvents();
        }
        
        // Filter out current event and get random related events
        relatedEvents = allEvents
            .filter(event => event.id !== currentEventId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        
        renderRelatedEvents();
        
    } catch (error) {
        console.error('Error loading related events:', error);
        // Show empty state or default events
        relatedEvents = [];
        renderRelatedEvents();
    }
}

function renderRelatedEvents() {
    const relatedEventsGrid = document.getElementById('related-events-grid');
    
    if (relatedEvents.length === 0) {
        relatedEventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Related Events</h3>
                <p>Check back later for more exciting events!</p>
            </div>
        `;
        return;
    }
    
    relatedEventsGrid.innerHTML = '';
    
    relatedEvents.forEach(event => {
        const eventCard = createRelatedEventCard(event);
        relatedEventsGrid.appendChild(eventCard);
    });
}

function createRelatedEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-event-id', event.id);
    
    const imageContent = event.image ? 
        `<img src="${event.image}" alt="${event.title}" loading="lazy">` : 
        `<i class="fas fa-${getEventIcon(event.category)}"></i>`;
    
    card.innerHTML = `
        <div class="event-image">
            ${imageContent}
        </div>
        <div class="event-content">
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.shortDescription}</p>
            <div class="event-meta">
                <span class="event-prize">Prize: ${event.prize}</span>
                <span class="event-date">${event.date}</span>
            </div>
            <button class="btn btn-primary event-button" onclick="openRelatedEvent('${event.id}')">
                <span>Learn More</span>
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    return card;
}

// Navigation functions
function goBack() {
    // Try to go back in history first
    if (document.referrer && document.referrer.includes(window.location.origin)) {
        window.history.back();
    } else {
        // Fallback to events section
        window.location.href = '../index.html#events';
    }
}

function initializeNavigation() {
    // Mobile menu toggle (if needed)
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

// Registration function
function handleRegistration() {
    if (currentEvent && currentEvent.registrationLink) {
        window.open(currentEvent.registrationLink, '_blank');
    } else {
        showErrorMessage('Registration link not available. Please contact event coordinators.');
    }
}

// Share functionality
function initializeShareModal() {
    const modal = document.getElementById('share-modal');
    
    // Close modal when clicking outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeShareModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeShareModal();
        }
    });
}

function shareEvent() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeShareModal() {
    const modal = document.getElementById('share-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

function shareToWhatsApp() {
    const text = encodeURIComponent(`Check out this amazing event: ${currentEvent.title}! ${window.location.href}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

function shareToTwitter() {
    const text = encodeURIComponent(`Check out this amazing event: ${currentEvent.title}!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function shareToFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

function shareToLinkedIn() {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentEvent.title);
    const summary = encodeURIComponent(currentEvent.shortDescription);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`, '_blank');
}

function copyEventLink() {
    const eventUrl = document.getElementById('event-url');
    eventUrl.select();
    eventUrl.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        showSuccessMessage('Event link copied to clipboard!');
    } catch (err) {
        console.error('Failed to copy link:', err);
        showErrorMessage('Failed to copy link. Please copy manually.');
    }
}

// Related events navigation
function openRelatedEvent(eventId) {
    // Update URL and reload page with new event
    window.location.href = `details.html?id=${eventId}`;
}

// Utility functions
function getEventIcon(category) {
    const icons = {
        'Programming': 'code',
        'Web Development': 'globe',
        'AI/ML': 'robot',
        'Design': 'paint-brush',
        'Security': 'shield-alt',
        'Game Development': 'gamepad',
        'Mobile Development': 'mobile-alt',
        'Data Science': 'chart-bar',
        'Blockchain': 'link',
        'IoT': 'microchip'
    };
    return icons[category] || 'laptop-code';
}

function getDefaultEvents() {
    // Return empty array - events should be loaded from Firestore via admin panel
    return [];
}

// Loading and error handling
function showLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        setTimeout(() => {
            loadingOverlay.classList.remove('active');
        }, 300);
    }
}

function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    if (!document.querySelector('#error-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'error-toast-styles';
        style.textContent = `
            .error-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #FF3B30;
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(255, 59, 48, 0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

function showSuccessMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;
    
    if (!document.querySelector('#success-toast-styles')) {
        const style = document.createElement('style');
        style.id = 'success-toast-styles';
        style.textContent = `
            .success-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #34C759;
                color: white;
                padding: 16px 20px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 10px 30px rgba(52, 199, 89, 0.3);
                z-index: 10000;
                animation: slideInRight 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add ripple effect to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn') || e.target.closest('.btn')) {
        const button = e.target.matches('.btn') ? e.target : e.target.closest('.btn');
        
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        
        if (!document.querySelector('#ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .btn { position: relative; overflow: hidden; }
                @keyframes ripple {
                    0% { transform: scale(0); opacity: 1; }
                    100% { transform: scale(2); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        button.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
});