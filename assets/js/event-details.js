// Event Details Page JavaScript

let currentEvent = null;
let relatedEvents = [];

// Wait for Firebase to be initialized
async function waitForFirebase(timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkFirebase = () => {
            // Check for both Firebase core and our DatabaseManager
            if (window.firebase && window.db && window.auth && window.dbManager) {
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                resolve(false);
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme before rendering
        try {
            const saved = localStorage.getItem('theme');
            const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const theme = saved || (prefersDark ? 'dark' : 'light');
            document.documentElement.setAttribute('data-theme', theme);
        } catch (_) {}
    initializeEventDetails();
});

// Initialize event details page
async function initializeEventDetails() {
    showLoading();
    
    try {
        // Get event ID from URL or localStorage
        const eventId = getEventIdFromUrl() || getEventIdFromStorage();
        
        if (!eventId) {
            throw new Error('No event ID provided. Please access this page through the events list.');
        }
        
        // Wait for Firebase to be ready (if available)
        await waitForFirebase(5000);
        
        // Load event data
        await loadEventDetails(eventId);
        await loadRelatedEvents(eventId);
        
        // Initialize UI components
        initializeNavigation();
        
        hideLoading();
    } catch (error) {
        hideLoading();
        
        // Show more specific error messages
        let errorMsg = 'Failed to load event details.';
        if (error.message.includes('No event ID')) {
            errorMsg = 'Please access this page through the events list on the main page.';
        } else if (error.message.includes('not found')) {
            errorMsg = 'The requested event could not be found.';
        }
        
        // Show error but do not auto-redirect; let user navigate back manually
        showErrorMessage(errorMsg);
    }
}

// Get event ID from URL parameters
function getEventIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Get event ID from localStorage (fallback)
function getEventIdFromStorage() {
    // Prefer sessionStorage event id (set by landing page)
    const sessionId = sessionStorage.getItem('selectedEventId');
    if (sessionId) return sessionId;
    // Backward compatibility: localStorage selectedEvent object
    const storedEvent = localStorage.getItem('selectedEvent');
    if (storedEvent) {
        try {
            const event = JSON.parse(storedEvent);
            return event.id;
        } catch {}
    }
    return null;
}

// Normalize event schema to what UI expects
function normalizeEvent(raw) {
    if (!raw) return null;
    const rules = Array.isArray(raw.rules)
        ? raw.rules
        : (typeof raw.rules === 'string' ? raw.rules.split(/\r?\n/).filter(Boolean) : []);
    const contacts = Array.isArray(raw.contacts) ? raw.contacts : [];
    return {
        id: raw.id || raw.eventId || raw.uid || '',
        title: raw.title || raw.name || raw.eventName || 'Untitled Event',
        shortDescription: raw.shortDescription || raw.subtitle || raw.tagline || raw.description || '',
        description: raw.description || raw.longDescription || raw.details || '',
        prize: raw.prize || raw.prizePool || raw.reward || '',
        date: raw.date || raw.eventDate || raw.schedule || 'TBD',
        category: raw.category || raw.type || raw.track || 'Technology',
        participationFee: raw.participationFee || raw.fee || 'Free',
        teamRequirements: raw.teamRequirements || raw.teamSize || 'Individual',
        registrationLink: raw.registrationLink || raw.registerUrl || '',
        active: raw.active !== false,
        rules,
        contacts,
        image: raw.image || raw.imageUrl || raw.banner || ''
    };
}

// Load event details
async function loadEventDetails(eventId) {
    try {
        console.log('Event ID:', eventId);
        
        // First try to load fresh data from Firestore (preferred)
        // Prefer DatabaseManager if available
        if (window.dbManager && window.dbManager.getEvent) {
            try {
                const doc = await window.dbManager.getEvent(eventId);
                if (doc) {
                    currentEvent = normalizeEvent({ id: doc.id, ...doc });
                }
            } catch (e) {
                // Silent fallback
            }
        }

        // Try to load from database if available and not found yet
        if (!currentEvent && window.db) {
            try {
                const doc = await window.db.collection('events').doc(eventId).get();
                if (doc.exists) {
                    currentEvent = normalizeEvent({ id: doc.id, ...doc.data() });
                }
            } catch (e) {
                // Silent fallback
            }
        }
        
        // As a fallback, attempt to fetch all events and find by id (or similar)
        if (!currentEvent && window.dbManager && window.dbManager.getEvents) {
            try {
                const all = await window.dbManager.getEvents(false);
                
                if (all && all.length > 0) {
                    // Try exact match first
                    let match = all.find(ev => ev.id === eventId);
                    
                    // If no exact match, try case-insensitive
                    if (!match) {
                        match = all.find(ev => ev.id.toLowerCase() === eventId.toLowerCase());
                    }
                    
                    // If still no match, try partial match
                    if (!match) {
                        match = all.find(ev => ev.id.includes(eventId) || eventId.includes(ev.id));
                    }
                    
                    if (match) {
                        currentEvent = normalizeEvent(match);
                    }
                }
            } catch (e) {
                // Silent fallback
            }
        }

        // Try localStorage as fallback if Firestore didn't work
        if (!currentEvent) {
            const storedEvent = localStorage.getItem('selectedEvent');
            if (storedEvent) {
                try {
                    currentEvent = normalizeEvent(JSON.parse(storedEvent));
                } catch (e) {
                    // Silent fallback
                }
            }
        }

        // Fallback to default events if still not found
        if (!currentEvent) {
            const defaultEvents = getDefaultEvents();
            currentEvent = normalizeEvent(defaultEvents.find(event => event.id === eventId));
        }
        
        if (!currentEvent) {
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
    // Event poster image (hardcoded posters path based on event ID)
    const eventImage = document.getElementById('event-image');
    if (eventImage) {
        eventImage.classList.add('a4-poster');
        const posterPath = currentEvent && currentEvent.id ? `../assets/posters/poster-${currentEvent.id}.jpg` : '../assets/posters/placeholder-poster.svg';
        const alt = currentEvent && currentEvent.title ? currentEvent.title : 'Event Poster';
        eventImage.innerHTML = `<img src="${posterPath}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='../assets/posters/placeholder-poster.svg';">`;

        // Add caption (event title) below the poster if not already present
        const container = eventImage.parentElement; // .event-image-container
        if (container && !container.querySelector('.event-poster-title')) {
            const caption = document.createElement('div');
            caption.className = 'event-poster-title';
            caption.textContent = currentEvent && currentEvent.title ? currentEvent.title : '';
            container.appendChild(caption);
        } else if (container) {
            const caption = container.querySelector('.event-poster-title');
            if (caption) caption.textContent = currentEvent && currentEvent.title ? currentEvent.title : '';
        }
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
    
    // Use participation fee from admin panel
    document.getElementById('event-participation-type').textContent = currentEvent.participationFee || 'Free';
    
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
        const text = currentEvent.description || 'Description not available.';
        descriptionElement.textContent = text;
        const parent = descriptionElement.closest('.content-section');
        if (parent) {
            parent.classList.remove('is-short', 'is-medium', 'is-long', 'is-very-long', 'is-empty');
            const len = text.length;
            if (len === 0 || text === 'Description not available.') {
                parent.classList.add('is-empty');
            } else if (len <= 200) {
                parent.classList.add('is-short');
            } else if (len <= 600) {
                parent.classList.add('is-medium');
            } else if (len <= 1200) {
                parent.classList.add('is-long');
            } else {
                parent.classList.add('is-very-long');
            }
        }
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
        const parent = rulesElement.closest('.content-section');
        if (parent) {
            parent.classList.remove('is-short', 'is-medium', 'is-long', 'is-very-long', 'is-empty');
            const len = currentEvent.rules.join(' ').length;
            const ruleCount = currentEvent.rules.length;
            if (ruleCount === 0) {
                parent.classList.add('is-empty');
            } else if (ruleCount <= 2 && len <= 200) {
                parent.classList.add('is-short');
            } else if (ruleCount <= 5 && len <= 600) {
                parent.classList.add('is-medium');
            } else if (len <= 1000) {
                parent.classList.add('is-long');
            } else {
                parent.classList.add('is-very-long');
            }
        }
    } else if (rulesElement) {
        rulesElement.innerHTML = '<p>Rules will be announced soon.</p>';
        const parent = rulesElement.closest('.content-section');
        if (parent) {
            parent.classList.remove('is-short', 'is-medium', 'is-long', 'is-very-long', 'is-empty');
            parent.classList.add('is-short');
        }
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
    // Disable related events for now to keep page focused and avoid empty states
    try {
        relatedEvents = [];
        renderRelatedEvents();
    } catch (error) {
        console.error('Error disabling related events:', error);
    }
}

function renderRelatedEvents() {
    const relatedEventsGrid = document.getElementById('related-events-grid');
    if (!relatedEventsGrid) return;
    // Hide the section entirely when no related events are present
    const section = relatedEventsGrid.closest('.related-events');
    if (section) section.style.display = 'none';
}

function createRelatedEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-event-id', event.id);
    
    const posterPath = event && event.id ? `../assets/posters/poster-${event.id}.jpg` : '../assets/posters/placeholder-poster.svg';
    const alt = event && event.title ? event.title : 'Event Poster';
    
    card.innerHTML = `
        <div class="event-image a4-poster">
            <img src="${posterPath}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='../assets/posters/placeholder-poster.svg';">
        </div>
        <div class="event-content compact">
            <h3 class="event-title">${event.title}</h3>
            <button class="btn btn-primary event-button" onclick="openRelatedEvent('${event.id}')">
                <span>View Details</span>
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

    // Theme toggle for details page
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        const setIcon = () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const icon = themeBtn.querySelector('i');
            if (icon) icon.className = `fas ${current === 'dark' ? 'fa-sun' : 'fa-moon'}`;
        };
        setIcon();
        themeBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch(_) {}
            setIcon();
        });
    }

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
    // Store id for reliability and update URL
    try { sessionStorage.setItem('selectedEventId', eventId); } catch {}
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
    // Return a test event for debugging purposes
    return [
        {
            id: 'test-event',
            title: 'Sample Tech Event',
            category: 'Technical',
            shortDescription: 'A sample technical event for testing',
            description: 'This is a detailed description of the sample technical event. It includes multiple paragraphs to test the content layout and responsive design features.',
            prize: '₹5,000',
            date: '2025-01-15',
            participationFee: 'Free',
            teamRequirements: '2-4 members per team',
            rules: [
                'Teams must consist of 2-4 members',
                'All team members must be from the same institution',
                'Laptops and software tools are allowed',
                'Judges decision will be final'
            ],
            contacts: [
                {
                    name: 'John Doe',
                    phone: '+91 98765 43210',
                    email: 'john.doe@example.com'
                }
            ],
            active: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];
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