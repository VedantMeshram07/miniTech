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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting TechFest website...');
    
    // Force immediate coordinators render for testing
    setTimeout(() => {
        console.log('🔧 DIRECT COORDINATOR TEST');
        const testCoordinators = [
            {
                id: 'convenor',
                name: 'Dr. Faculty Convenor',
                role: 'Faculty Convenor', 
                contact: '+91 12345 67890',
                email: 'convenor@gcoej.edu.in',
                type: 'convenor'
            },
            {
                id: 'co-convenor-1',
                name: 'Prof. Co-Convenor 1',
                role: 'Co-Convenor',
                contact: '+91 12345 67891',
                email: 'co1@gcoej.edu.in',
                type: 'co-convenor'
            },
            {
                id: 'co-convenor-2', 
                name: 'Prof. Co-Convenor 2',
                role: 'Co-Convenor',
                contact: '+91 12345 67892',
                email: 'co2@gcoej.edu.in',
                type: 'co-convenor'
            },
            {
                id: 'co-convenor-3',
                name: 'Prof. Co-Convenor 3', 
                role: 'Co-Convenor',
                contact: '+91 12345 67893',
                email: 'co3@gcoej.edu.in',
                type: 'co-convenor'
            }
        ];
        
        const gridElement = document.getElementById('coordinators-list');
        console.log('Grid element found:', gridElement);
        
        if (gridElement) {
            renderCoordinators(testCoordinators);
        } else {
            console.error('❌ Could not find coordinators-list element!');
        }
    }, 1000);
    
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
        
        // Wait for Firebase to be available
        await waitForFirebase(5000);
        console.log('✅ Firebase libraries loaded');
        
        // Initialize Firebase services
        await initFirebase();
        await initAuth();
        
        // Load application data
        await loadApplicationData();
        
        // Initialize UI components
        initializeUIComponents();
        
        // Mark app as initialized
        appInitialized = true;
        
        console.log('✅ TechFest website initialized successfully');
        showToast('Welcome to TechFest 2025!', 'success');
        
    } catch (error) {
        console.error('❌ Error initializing application:', error);
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
    
    try {
        // Load site configuration
        await loadSiteConfiguration();
        
        // Load events data
        await loadEvents();
        
        // Load coordinators data (if needed)
        await loadCoordinatorsData();
        
        console.log('✅ Application data loaded successfully');
        
    } catch (error) {
        console.error('❌ Error loading application data:', error);
        // Continue with fallback data
        await loadFallbackData();
    }
}

/**
 * Load site configuration from Firebase or use defaults
 */
async function loadSiteConfiguration() {
    try {
        // This would load from Firebase in a real implementation
        // For now, use default configuration
        const siteConfig = getDefaultSiteConfig();
        await updateSiteContent(siteConfig);
        
    } catch (error) {
        console.error('Error loading site configuration:', error);
        // Use default configuration
        const siteConfig = getDefaultSiteConfig();
        await updateSiteContent(siteConfig);
    }
}

/**
 * Load coordinators data
 */
async function loadCoordinatorsData() {
    try {
        console.log('🔄 Loading coordinators data...');
        // This would load coordinators from Firebase
        // For now, use default data
        const coordinators = getDefaultCoordinators();
        console.log('📋 Coordinators loaded:', coordinators);
        renderCoordinators(coordinators);
        
    } catch (error) {
        console.error('Error loading coordinators:', error);
        renderCoordinators([]);
    }
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
        
        // Render initial content
        renderEvents();
        
        console.log('✅ UI components initialized');
        
    } catch (error) {
        console.error('❌ Error initializing UI components:', error);
    }
}

/**
 * Handle initialization errors gracefully
 */
async function handleInitializationError(error) {
    console.error('Initialization failed:', error);
    
    // Show error message to user
    showToast('Failed to load some features. Please refresh the page.', 'error', 5000);
    
    // Try to initialize with fallback data
    try {
        await loadFallbackData();
        initializeUIComponents();
        console.log('🔄 Loaded with fallback data');
    } catch (fallbackError) {
        console.error('❌ Even fallback initialization failed:', fallbackError);
        showToast('Website is experiencing technical difficulties.', 'error', 10000);
    }
}

/**
 * Load fallback data when Firebase fails
 */
async function loadFallbackData() {
    console.log('📋 Loading fallback data...');
    
    // Load default site configuration
    const siteConfig = getDefaultSiteConfig();
    await updateSiteContent(siteConfig);
    
    // The events module will handle its own fallback data
    renderEvents();
    
    // Load default coordinators
    const coordinators = getDefaultCoordinators();
    renderCoordinators(coordinators);
}

/**
 * Get default site configuration
 */
function getDefaultSiteConfig() {
    return {
        title: 'TechCarvaan 2025',
        theme: 'Future Tech Revolution',
        collegeName: 'Technical Council',
        organizingCommittee: 'GCOEJ\'s Technical Council',
        eventDate: 'March 15-20, 2025',
        location: 'GCOEJ Campus',
        description: 'Join us for the most exciting tech festival of the year! Compete, innovate, and connect with brilliant minds from across the nation.',
        totalEvents: 0,
        expectedParticipants: 0,
        totalPrize: '₹0',
        contact: {
            email: 'contact@techcarvaan.com',
            phone: '+91 XXXXX XXXXX',
            address: 'GCOEJ Campus, Jalgaon, Maharashtra'
        }
    };
}

/**
 * Get default coordinators data
 */
function getDefaultCoordinators() {
    return [
        {
            id: 'convenor',
            name: 'Dr. Faculty Convenor',
            role: 'Faculty Convenor',
            contact: '+91 XXXXX XXXXX',
            email: 'convenor@gcoej.edu.in',
            type: 'convenor'
        },
        {
            id: 'co-convenor-1',
            name: 'Prof. Co-Convenor 1',
            role: 'Co-Convenor',
            contact: '+91 XXXXX XXXXX',
            email: 'co1@gcoej.edu.in',
            type: 'co-convenor'
        },
        {
            id: 'co-convenor-2',
            name: 'Prof. Co-Convenor 2',
            role: 'Co-Convenor',
            contact: '+91 XXXXX XXXXX',
            email: 'co2@gcoej.edu.in',
            type: 'co-convenor'
        },
        {
            id: 'co-convenor-3',
            name: 'Prof. Co-Convenor 3',
            role: 'Co-Convenor',
            contact: '+91 XXXXX XXXXX',
            email: 'co3@gcoej.edu.in',
            type: 'co-convenor'
        }
    ];
}

/**
 * Update site content with configuration
 */
async function updateSiteContent(config) {
    console.log('🔄 Updating site content...');
    
    try {
        // Update page title
        const titleElement = document.getElementById('site-title');
        if (titleElement) {
            titleElement.textContent = config.title;
        }
        
        // Update navigation title
        const navTitle = document.getElementById('nav-typography-name');
        if (navTitle) {
            navTitle.textContent = config.title;
        }
        
        // Update hero content
        updateHeroContent(config);
        
        // Update stats (async)
        await updateStatsContent(config);
        
        console.log('✅ Site content updated');
        
    } catch (error) {
        console.error('Error updating site content:', error);
    }
}

/**
 * Update hero section content
 */
function updateHeroContent(config) {
    // Update organization name
    const orgName = document.querySelector('.organization-name');
    if (orgName) {
        orgName.textContent = config.collegeName;
    }
    
    // Update event title
    const eventTitle = document.querySelector('.event-title');
    if (eventTitle) {
        eventTitle.textContent = config.title;
    }
    
    // Update theme
    const eventTheme = document.querySelector('.event-theme');
    if (eventTheme) {
        eventTheme.textContent = config.theme;
    }
    
    // Update description
    const description = document.querySelector('.hero-description');
    if (description) {
        description.textContent = config.description;
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
    
    const details = [
        {
            icon: 'fas fa-calendar-alt',
            label: 'Event Date',
            value: config.eventDate
        },
        {
            icon: 'fas fa-map-marker-alt',
            label: 'Location',
            value: config.location
        },
        {
            icon: 'fas fa-users',
            label: 'Expected',
            value: `${config.expectedParticipants}+ Students`
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
}

/**
 * Update stats counters
 */
async function updateStatsContent(config) {
    try {
        // Get actual event count from Firestore
        const eventsData = await loadEvents();
        const eventCount = eventsData.length;
        
        // Calculate total participants and colleges (would be from registration data)
        const participantCount = 0; // To be calculated from registrations
        const collegeCount = 0; // To be calculated from unique institutions
        
        const stats = [
            { id: 'events-count', value: eventCount, label: 'Events' },
            { id: 'participants-count', value: participantCount, label: 'Participants' },
            { id: 'colleges-count', value: collegeCount, label: 'Colleges' }
        ];
        
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                element.setAttribute('data-count', stat.value);
            }
        });
        
        console.log(`📊 Updated stats: ${eventCount} events, ${participantCount} participants, ${collegeCount} colleges`);
    } catch (error) {
        console.error('Error updating stats:', error);
        // Fallback to zero values
        const fallbackStats = [
            { id: 'events-count', value: 0, label: 'Events' },
            { id: 'participants-count', value: 0, label: 'Participants' },
            { id: 'colleges-count', value: 0, label: 'Colleges' }
        ];
        
        fallbackStats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                element.setAttribute('data-count', stat.value);
            }
        });
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
                    <div style="width: 80px; height: 80px; background: linear-gradient(45deg, #007AFF, #5856D6); border-radius: 50%; margin: 0 auto 15px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 2rem;">
                        ${convenor.name.split(' ').map(n => n[0]).join('')}
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
                <div style="background: white; border-radius: 15px; padding: 20px; text-align: center; box-shadow: 0 4px 20px rgba(0,0,0,0.1); min-width: 200px; border: 2px solid #5856D6;">
                    <div style="width: 60px; height: 60px; background: linear-gradient(45deg, #5856D6, #007AFF); border-radius: 50%; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.5rem;">
                        ${coord.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 style="margin: 0 0 6px 0; color: #1D1D1F; font-size: 1.1rem; font-weight: 600;">${coord.name}</h4>
                    <p style="margin: 0 0 6px 0; color: #5856D6; font-weight: 600; text-transform: uppercase; font-size: 0.8rem;">${coord.role}</p>
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
        <div class="coordinator-avatar" style="width: 60px; height: 60px; background: linear-gradient(45deg, #007AFF, #5856D6); border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
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
    // Stats counter animation code would go here
    console.log('📊 Stats counters initialized');
}

function initializeSectionTransitions() {
    // Section transition code would go here
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