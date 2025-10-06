/**
 * TechFest Website - Main Application Entry Point
 * Modular JavaScript Architecture for Maintainability and Scalability
 */

// Import modules
import { waitForFirebase, initAuth } from './modules/auth.js';
import { initFirebase } from './modules/firebase.js';
import { loadEvents, renderEvents, listenToEvents } from './modules/events.js';
import { initializeNavigation } from './modules/navigation.js';
import { showLoading, hideLoading, showToast } from './utils/dom.js';

// Global application state
let appInitialized = false;
let globalEventsCount = 0;

// Diagnostic helper
function updateFirebaseStatus(message, details = '') {
    const statusDiv = document.getElementById('firebase-status');
    const detailsDiv = document.getElementById('firebase-details');
    if (statusDiv) {
        statusDiv.querySelector('div').innerHTML = message;
        if (detailsDiv) detailsDiv.innerHTML = details;
    }
    console.log(`🔧 Firebase Status: ${message}`, details);
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting TechFest website...');
    updateFirebaseStatus('🚀 Starting TechFest website...');
    
    // Initialize theme from saved preference or system
    initializeTheme();
    

    
    initializeApp();
});

/**
 * Main application initialization
 */
async function initializeApp() {
    if (appInitialized) {
        console.log('⚠️ App already initialized');
        return;
    }
    
    showLoading();
    
    try {
        console.log('⏳ Initializing application...');
        updateFirebaseStatus('⏳ Initializing application...');
        
        // Check if Firebase SDK is loaded
        console.log('📦 Checking Firebase SDK availability:', typeof firebase);
        if (typeof firebase === 'undefined') {
            updateFirebaseStatus('❌ Firebase SDK not loaded');
            throw new Error('Firebase SDK not loaded - check if firebase-config.js is included');
        }
        updateFirebaseStatus('📦 Firebase SDK detected');
        
        // Wait for Firebase to be available
        updateFirebaseStatus('🔥 Waiting for Firebase...');
        await waitForFirebase(15000);
        console.log('✅ Firebase libraries loaded');
        console.log('🗄️ window.db status:', !!window.db);
        updateFirebaseStatus('✅ Firebase ready', `DB: ${!!window.db}`);
        
        // Initialize Firebase services
        await initFirebase();
        await initAuth();
        updateFirebaseStatus('🔧 Loading application data...');
        
        // Load application data
        await loadApplicationData();
        
        // Initialize UI components
        initializeUIComponents();
        
        // Mark app as initialized
        appInitialized = true;
        
        console.log('✅ TechFest website initialized successfully');
        updateFirebaseStatus('✅ Website initialized successfully');
        // Removed welcome toast notification for cleaner UX
        
        // Hide the status display after 3 seconds
        setTimeout(() => {
            const statusDiv = document.getElementById('firebase-status');
            if (statusDiv) statusDiv.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
        updateFirebaseStatus('❌ Error initializing', error.message);
        await handleInitializationError(error);
    } finally {
        hideLoading();
    }
}

/**
 * Load all application data
 */
async function loadApplicationData() {
    console.log('📊 Loading application data...');
    
    // Ensure Firebase is initialized
    if (!window.db) {
        throw new Error('Firebase not initialized. Please check Firebase configuration.');
    }
    
    try {
        // Load site configuration
        await loadSiteConfiguration();
        
        // Load events data
        const events = await loadEvents();
        renderEvents(events);
        // Also set up real-time listener so any admin changes reflect immediately
        try {
            listenToEvents((updated) => {
                renderEvents(updated);
                // Update global count and stats whenever events change
                globalEventsCount = updated.length;
                updateEventCount(globalEventsCount);
                console.log('📊 EVENTS: Real-time update - new count:', globalEventsCount);
            });
        } catch (e) {
            console.warn('Events realtime listener not available:', e);
        }
        
        // Load coordinators data (if needed)
        await loadCoordinatorsData();
        
        console.log('✅ Application data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading application data:', error);
        // Show error message to user instead of fallback data
        showToast('Failed to load application data. Please check your connection and try again.', 'error', 5000);
        throw error;
    }
}

/**
 * Load site configuration from Firebase or use defaults
 */
async function loadSiteConfiguration() {
    try {
        console.log('🔧 Loading site configuration from Firebase...');
        
        if (!window.db) {
            console.error('❌ Firebase database not available - window.db is:', window.db);
            throw new Error('Firebase database not available');
        }
        
        console.log('📡 Fetching siteConfig/main document...');
        updateFirebaseStatus('📡 Fetching site config...');
        const configDoc = await window.db.collection('siteConfig').doc('main').get();
        console.log('📄 Document fetch result:', configDoc.exists, configDoc);
        
        if (configDoc.exists) {
            const firebaseConfig = configDoc.data();
            console.log('✅ Site configuration loaded from Firebase:', firebaseConfig);
            const displayTitle = firebaseConfig.title || firebaseConfig.eventName || firebaseConfig.siteName || 'Config Found';
            updateFirebaseStatus('✅ Site config loaded', `Title: ${displayTitle}`);
            await updateSiteContent(firebaseConfig);
            
            // Set up real-time listener for site configuration updates
            setupSiteConfigListener();
        } else {
            console.warn('⚠️ No site configuration found in Firebase siteConfig/main');
            console.log('💡 Please configure the site using the admin panel first');
            updateFirebaseStatus('⚠️ No site config found', 'Please use admin panel');
            
            // Show user-friendly message
            showToast('No site configuration found. Please use the admin panel to configure the website.', 'warning', 8000);
            throw new Error('No configuration found in Firebase');
        }
        
    } catch (error) {
        console.error('❌ Error loading site configuration:', error);
        if (error.message.includes('Firebase database not available')) {
            showToast('Firebase connection failed. Please check your connection.', 'error', 8000);
        }
        throw error; // Don't use fallback, force proper configuration
    }
}

/**
 * Update event count in real-time
 */
function updateEventCount(count) {
    console.log('📊 EVENTS: Updating event count to', count);
    
    // Update the display counter
    const eventCountElement = document.getElementById('events-count');
    if (eventCountElement) {
        eventCountElement.setAttribute('data-count', count);
        eventCountElement.textContent = count + '+';
        console.log('✅ Updated events-count display to', count);
    }
    
    // Update admin form field if on admin page
    const adminEventsField = document.getElementById('events-count-admin');
    if (adminEventsField) {
        adminEventsField.value = count;
        console.log('✅ Updated admin events count field to', count);
    }
    
    // Trigger counter animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && eventCountElement) {
                animateCounter(eventCountElement, count);
                observer.unobserve(entry.target);
            }
        });
    });
    
    if (eventCountElement) {
        observer.observe(eventCountElement);
    }
}

/**
 * Setup real-time listener for site configuration
 */
function setupSiteConfigListener() {
    if (!window.db) return;
    
    console.log('👂 Setting up real-time listener for site configuration...');
    
    window.db.collection('siteConfig').doc('main')
        .onSnapshot((doc) => {
            if (doc.exists) {
                console.log('🔄 LANDING: Site configuration updated in real-time');
                const updatedConfig = doc.data();
                console.log('🔄 LANDING: Received config fields:', Object.keys(updatedConfig));
                console.log('🔄 LANDING: Received config data:', updatedConfig);
                console.log('🔄 LANDING: Title fields in received data:', {
                    title: updatedConfig.title,
                    eventName: updatedConfig.eventName,
                    siteName: updatedConfig.siteName,
                    techfestName: updatedConfig.techfestName,
                    heroTitle: updatedConfig.heroTitle
                });
                updateSiteContent(updatedConfig);
                // Removed site config update toast for cleaner UX
            } else {
                console.warn('🔄 LANDING: Real-time update triggered but document does not exist');
            }
        }, (error) => {
            console.error('❌ LANDING: Error in site config listener:', error);
        });
}

// Coordinators listener removed - using hardcoded coordinators

/**
 * Load coordinators data (hardcoded)
 */
async function loadCoordinatorsData() {
    console.log('� Loading hardcoded coordinators...');
    
    // Hardcoded coordinators - 1 convenor + 3 co-convenors structure
    const coordinators = [
        {
            id: 'convenor',
            name: 'Dr. Sarah Johnson',
            role: 'Event Convenor',
            type: 'convenor',
            contact: '+91 98765 43210'
        },
        {
            id: 'co-convenor-1',
            name: 'Prof. Michael Chen',
            role: 'Co-Convenor',
            type: 'co-convenor',
            contact: '+91 98765 43211'
        },
        {
            id: 'co-convenor-2',
            name: 'Dr. Priya Sharma',
            role: 'Co-Convenor',
            type: 'co-convenor',
            contact: '+91 98765 43212'
        },
        {
            id: 'co-convenor-3',
            name: 'Prof. Raj Kumar',
            role: 'Co-Convenor',
            type: 'co-convenor',
            contact: '+91 98765 43213'
        }
    ];
        
        console.log('✅ Hardcoded coordinators loaded');
        renderCoordinators(coordinators);
}

/**
 * Initialize all UI components
 */
function initializeUIComponents() {
    console.log('🎨 Initializing UI components...');
    
    try {
        // Initialize navigation
        initializeNavigation();
        
        // Initialize hero animations
        initializeHeroAnimations();
        
        // Initialize scroll effects
        initializeScrollEffects();
        
        // Initialize stats counters
        initializeStatsCounters();
        
        // Initialize section transitions
        initializeSectionTransitions();
        
        // Set up event listeners
        setupEventListeners();

    // Setup theme toggle
    setupThemeToggle();
        
        // Render initial content
        renderEvents();
        
        console.log('✅ UI components initialized');
        
    } catch (error) {
        console.error('❌ Error initializing UI components:', error);
    }
}

// Theme management
function initializeTheme() {
    try {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    } catch (_) {}
}

function setupThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        try { localStorage.setItem('theme', next); } catch(_) {}
        // swap icon
        const icon = btn.querySelector('i');
        if (icon) icon.className = `fas ${next === 'dark' ? 'fa-sun' : 'fa-moon'}`;
    });
    // set initial icon
    const icon = btn.querySelector('i');
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    if (icon) icon.className = `fas ${current === 'dark' ? 'fa-sun' : 'fa-moon'}`;
}

/**
 * Handle initialization errors gracefully
 */
async function handleInitializationError(error) {
    console.error('Initialization failed:', error);
    
    // Show error message to user
    showToast('Failed to load application data. Please check your connection and refresh the page.', 'error', 10000);
    
    // Log the error for debugging
    console.error('❌ Application initialization failed:', error);
}



/**
 * Update site content with configuration
 */
async function updateSiteContent(config) {
    console.log('🔄 Updating site content...');
    console.log('🔧 Config fields:', Object.keys(config));
    
    try {
        // Get the title from the actual field names in Firebase
        const siteTitle = config.techfestName || config.heroTitle || config.title || config.eventName || config.siteName || 'TechFest 2025';
        
        console.log('🔧 LANDING: Using site title:', siteTitle);
        
        // Update page title
        const titleElement = document.getElementById('site-title');
        if (titleElement) {
            titleElement.textContent = siteTitle;
            console.log('✅ Updated page title to:', siteTitle);
        }
        
        // Update navigation title
        const navTitle = document.getElementById('nav-typography-name');
        if (navTitle) {
            navTitle.textContent = siteTitle;
            console.log('✅ Updated nav title to:', siteTitle);
        }
        
    // NOTE: Hero content is intentionally managed in HTML (hardcoded)
    // to avoid admin/siteConfig overwriting values that are not
    // being accepted reliably from the admin panel. Do not update
    // the hero DOM here.
    // updateHeroContent(config); // intentionally disabled
        
        // Update stats (async)
        await updateStatsContent(config);
        
        console.log('✅ Site content updated with title:', siteTitle);
        
    } catch (error) {
        console.error('Error updating site content:', error);
    }
}

/**
 * Update hero section content
 */
function updateHeroContent(config) {
    console.log('🔧 LANDING: Updating hero content with config fields:', Object.keys(config));
    
    // Update organization name
    const orgName = document.querySelector('.organization-name');
    if (orgName) {
        const orgText = config.collegeName || config.collegeShortName || config.contactOrganization || config.organizingAssociation || 'Technical Council';
        orgName.textContent = orgText;
        console.log('✅ Updated organization name to:', orgText);
    }
    
    // Update event title
    const eventTitle = document.querySelector('.event-title');
    if (eventTitle) {
        const titleText = config.heroTitle || config.techfestName || config.title || config.eventName || 'TechFest 2025';
        eventTitle.textContent = titleText;
        console.log('✅ Updated event title to:', titleText);
    }
    
    // Update theme/subtitle
    const eventTheme = document.querySelector('.event-theme');
    if (eventTheme) {
        const themeText = config.heroSubtitle || config.techfestTheme || config.theme || config.tagline || 'Innovation & Excellence';
        eventTheme.textContent = themeText;
        console.log('✅ Updated event theme to:', themeText);
    }
    
    // Update description
    const description = document.querySelector('.hero-description');
    if (description) {
        const descText = config.heroDescription || config.description || config.aboutDescription || 'Join us for an amazing tech festival!';
        description.textContent = descText;
        console.log('✅ Updated hero description');
    }
    
    // Update badge text
    const badgeText = document.querySelector('.hero-badge, .badge-text');
    if (badgeText && config.heroBadgeText) {
        badgeText.textContent = config.heroBadgeText;
        console.log('✅ Updated badge text to:', config.heroBadgeText);
    }
    
    // Update event details
    updateEventDetails(config);
}

/**
 * Update event details bar
 */
function updateEventDetails(config) {
    const detailsContainer = document.querySelector('.hero-details');
    if (!detailsContainer) return;
    
    // Get event date from various possible fields
    const eventDate = config.eventDates || config.eventDate || config.date || 'Coming Soon';
    
    // Get location from various possible fields  
    const location = config.venue || config.location || config.collegeLocation || 'GCOEJ Campus';
    
    console.log('🔧 LANDING: Event details - Date:', eventDate, 'Location:', location);
    
    const details = [
        {
            icon: 'fas fa-calendar-alt',
            label: 'Event Date',
            value: eventDate
        },
        {
            icon: 'fas fa-map-marker-alt',
            label: 'Location',
            value: location
        }
    ];
    
    detailsContainer.innerHTML = details.map(detail => `
        <div class="detail-item">
            <i class="${detail.icon}"></i>
            <div class="detail-content">
                <span class="detail-label">${detail.label}</span>
                <span class="detail-value">${detail.value}</span>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Updated event details');
}

/**
 * Update stats counters
 */
async function updateStatsContent(config) {
    try {
        console.log('📊 Updating stats content from Firebase...');
        
        if (!window.db) {
            throw new Error('Firebase database not available');
        }
        
        // Get actual event count from Firestore (try multiple approaches)
        let eventCount = 0;
        try {
            // First try with isActive filter
            let eventsSnapshot = await window.db.collection('events')
                .where('isActive', '==', true)
                .get();
            eventCount = eventsSnapshot.size;
            
            // If no active events found, try with 'active' field
            if (eventCount === 0) {
                eventsSnapshot = await window.db.collection('events')
                    .where('active', '==', true)
                    .get();
                eventCount = eventsSnapshot.size;
            }
            
            // If still no events, get all events count
            if (eventCount === 0) {
                eventsSnapshot = await window.db.collection('events').get();
                eventCount = eventsSnapshot.size;
            }
            
            console.log('📊 EVENTS: Found', eventCount, 'events in Firebase');
            
            // Also update the admin form field to sync
            if (eventCount > 0) {
                const adminEventsField = document.getElementById('events-count-admin');
                if (adminEventsField) {
                    adminEventsField.value = eventCount;
                }
            }
            
        } catch (error) {
            console.error('❌ Error counting events:', error);
            // Fallback to manual count from config
            eventCount = parseInt(config.eventsCount) || 0;
            console.log('📊 EVENTS: Using manual count from config:', eventCount);
        }
        
        // Get stats from Firebase configuration (use multiple possible field names)
        let participantCount = parseInt(config.expectedParticipants) || 
                              parseInt(config.totalParticipants) || 
                              parseInt(config.participantsCount) || 0;
                              
        let collegeCount = parseInt(config.expectedColleges) || 
                          parseInt(config.totalColleges) || 
                          parseInt(config.collegesCount) || 0;
        
        console.log('📊 Stats from config:', { participantCount, collegeCount });
        console.log('📊 Available config fields:', Object.keys(config));
        
        // Use real-time events count if available
        const finalEventCount = globalEventsCount > 0 ? globalEventsCount : eventCount;
        globalEventsCount = finalEventCount; // Update global tracker
        
        console.log('📊 Final stats:', { 
            finalEventCount, 
            realTimeCount: globalEventsCount, 
            configCount: eventCount,
            participantCount, 
            collegeCount 
        });
        
        const stats = [
            { id: 'events-count', value: finalEventCount, label: 'Events' },
            { id: 'participants-count', value: participantCount, label: 'Participants' },
            { id: 'colleges-count', value: collegeCount, label: 'Colleges' }
        ];
        
        // Wait a bit for DOM to be fully ready if needed
        setTimeout(() => {
            stats.forEach(stat => {
                // Try multiple ways to find the element
                let element = document.getElementById(stat.id);
                if (!element) {
                    element = document.querySelector(`#${stat.id}`);
                }
                if (!element) {
                    element = document.querySelector(`[id="${stat.id}"]`);
                }
                if (!element) {
                    element = document.querySelector(`.stat-number[id="${stat.id}"]`);
                }
                
                if (element) {
                    element.setAttribute('data-count', stat.value);
                    element.textContent = stat.value + '+'; // Update visible text too
                    console.log(`📊 Set ${stat.id} to ${stat.value}`);
                } else {
                    console.warn(`⚠️ Element ${stat.id} not found in DOM`);
                    console.log('🔍 All elements with "count" in id:', Array.from(document.querySelectorAll('[id*="count"]')).map(el => `${el.id}: ${el.tagName}`));
                    console.log('🔍 All stat-number elements:', Array.from(document.querySelectorAll('.stat-number')).map(el => `${el.id}: ${el.textContent}`));
                }
            });
        }, 100);
        
        console.log(`📊 Updated stats from Firebase: ${eventCount} events, ${participantCount} participants, ${collegeCount} colleges`);
    } catch (error) {
        console.error('❌ Error updating stats from Firebase:', error);
        console.error('Please configure stats using the admin panel first');
        throw error; // Don't use fallback
    }
}

/**
 * Render coordinators section
 */
function renderCoordinators(coordinators) {
    console.log('👥 RENDERING COORDINATORS');
    
    const coordinatorsGrid = document.getElementById('coordinators-list');
    
    if (!coordinatorsGrid) {
        console.error('❌ Grid element not found!');
        return;
    }
    
    // Clear and create simple layout
    coordinatorsGrid.innerHTML = '';
    
    const convenor = coordinators.find(coord => coord.type === 'convenor');
    const coConvenors = coordinators.filter(coord => coord.type === 'co-convenor');
    
    // Create convenor row
    if (convenor) {
        const convenorHTML = `
            <div style="display: flex; justify-content: center; margin-bottom: 30px;">
                <div style="background: white; border-radius: 15px; padding: 25px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-width: 250px; border: 2px solid #007AFF;">
                    <div style="width: 84px; height: 84px; border-radius: 50%; margin: 0 auto 15px; position: relative; overflow: hidden; background: linear-gradient(45deg, #007AFF, #0056CC); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 2rem;">
                        <img src="assets/images/coordinators/${(convenor.id || 'convenor')}.jpg" alt="${convenor.name}" style="width:100%;height:100%;object-fit:cover;display:none;" onload="this.style.display='block'; this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <span>${convenor.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <h4 style="margin: 0 0 8px 0; color: #1D1D1F; font-size: 1.3rem; font-weight: 600;">${convenor.name}</h4>
                    <p style="margin: 0 0 8px 0; color: #007AFF; font-weight: 600; text-transform: uppercase; font-size: 0.9rem;">${convenor.role}</p>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${convenor.contact}</p>
                </div>
            </div>
        `;
        coordinatorsGrid.innerHTML += convenorHTML;
    }
    
    // Create co-convenors row
    if (coConvenors.length > 0) {
        let coConvenorsHTML = '<div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">';
        
        coConvenors.forEach(coord => {
            coConvenorsHTML += `
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-width: 200px; border: 2px solid #007AFF;">
                    <div style="width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 12px; position: relative; overflow: hidden; background: linear-gradient(45deg, #0056CC, #007AFF); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;">
                        <img src="assets/images/coordinators/${(coord.id || 'coordinator')}.jpg" alt="${coord.name}" style="width:100%;height:100%;object-fit:cover;display:none;" onload="this.style.display='block'; this.nextElementSibling.style.display='none';" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';" />
                        <span>${coord.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <h4 style="margin: 0 0 6px 0; color: #1D1D1F; font-size: 1.1rem; font-weight: 600;">${coord.name}</h4>
                    <p style="margin: 0 0 6px 0; color: #007AFF; font-weight: 600; text-transform: uppercase; font-size: 0.8rem;">${coord.role}</p>
                    <p style="margin: 0; color: #666; font-size: 0.85rem;">${coord.contact}</p>
                </div>
            `;
        });
        
        coConvenorsHTML += '</div>';
        coordinatorsGrid.innerHTML += coConvenorsHTML;
    }
    
    console.log('✅ Coordinators rendered with inline HTML');
    

}

/**
 * Create coordinator card element
 */
function createSimpleCoordinatorCard(coordinator, className) {
    console.log(`Creating card for: ${coordinator.name}`);
    
    const card = document.createElement('div');
    card.className = `coordinator-card ${className}`;
    card.style.border = '1px solid orange'; // Debug border
    card.style.padding = '20px';
    card.style.margin = '10px';
    card.style.backgroundColor = 'white';
    card.style.minWidth = '200px';
    card.style.textAlign = 'center';
    
    const initials = coordinator.name.split(' ').map(n => n[0]).join('');
    
    card.innerHTML = `
        <div class="coordinator-avatar" style="width: 60px; height: 60px; background: linear-gradient(45deg, #007AFF, #0056CC); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
            ${initials}
        </div>
        <h4 style="margin: 10px 0; color: #333; font-size: 1.2em;">${coordinator.name}</h4>
        <p style="margin: 5px 0; color: #007AFF; font-weight: 500; text-transform: uppercase;">${coordinator.role}</p>
        <p style="margin: 5px 0; color: #666;">${coordinator.contact}</p>
    `;
    
    return card;
}

function createCoordinatorCard(coordinator, className) {
    return createSimpleCoordinatorCard(coordinator, className);
}

// Initialize remaining UI components (these would be moved to respective modules)
function initializeHeroAnimations() {
    // Hero animation code would go here
    console.log('🎭 Hero animations initialized');
}

function initializeScrollEffects() {
    // Scroll effects code would go here
    console.log('📜 Scroll effects initialized');
}

function initializeStatsCounters() {
    console.log('📊 Initializing stats counters...');
    
    const counters = [
        { id: 'events-count', target: 0 },
        { id: 'participants-count', target: 0 }, 
        { id: 'colleges-count', target: 0 }
    ];
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const countElement = entry.target;
                const targetValue = parseInt(countElement.getAttribute('data-count')) || 0;
                
                if (!countElement.hasAttribute('data-animated')) {
                    countElement.setAttribute('data-animated', 'true');
                    animateCounter(countElement, targetValue);
                    observer.unobserve(countElement); // Only animate once
                }
            }
        });
    }, { threshold: 0.5 });
    
    // Observe all counter elements
    counters.forEach(counter => {
        const element = document.getElementById(counter.id);
        if (element) {
            observer.observe(element);
        }
    });
    
    console.log('📊 Stats counters initialized and observing');
}

/**
 * Animate counter from 0 to target value
 */
function animateCounter(element, target) {
    let current = 0;
    const increment = Math.ceil(target / 60); // Complete animation in ~1 second (60fps)
    const duration = 1500; // 1.5 seconds
    const stepTime = duration / target;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        
        // Format number with + suffix
        element.textContent = current + '+';
    }, stepTime);
    
    console.log(`🎯 Animating counter to ${target}`);
}

function initializeSectionTransitions() {
    const sections = document.querySelectorAll('.events-section, .about-section, .contact-section');
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('section-in-view');
                const title = entry.target.querySelector('.section-title');
                if (title && !title.classList.contains('title-animated')) {
                    title.classList.add('title-animated');
                }
                const cards = entry.target.querySelectorAll('.event-card, .coordinator-card');
                cards.forEach((card, index) => {
                    if (!card.classList.contains('card-animated')) {
                        setTimeout(() => {
                            card.classList.add('card-animated');
                        }, index * 150);
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));
    console.log('🔄 Section transitions initialized');
}

function setupEventListeners() {
    // Additional event listeners would go here
    console.log('👂 Event listeners set up');
}

// Export for use in other modules if needed
export {
    initializeApp,
    loadApplicationData,
    handleInitializationError
};