// Admin Dashboard JavaScript

// Global variables
let currentUser = null;
let eventsData = [];
let coordinatorsData = [];
let siteConfigData = {};
let currentEditingEvent = null;
let currentEditingCoordinator = null;
let deleteCallback = null;
let isInitialized = false;
// Realtime listeners
let eventsUnsub = null;
let coordinatorsUnsub = null;
// Optional client-side admin allowlist (enforce via Firestore rules too)
const ALLOWED_ADMINS = [];

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

// Initialize dashboard functionality
async function initializeDashboard() {
    console.log('🚀 Initializing admin dashboard...');
    
    // Show loading while we prepare
    showLoading();

    try {
        // Wait for Firebase to be fully initialized before auth checks
        await waitForFirebase();

        // Check authentication (after firebase is ready)
        if (!await checkAuthentication()) {
            hideLoading();
            return;
        }
        
        // Load all data
        await loadDashboardData();
        
    // Initialize UI components
        initializeNavigation();
        initializeModals();
        initializeEventFilters();
        initializeFormHandlers();
    initializeRealtimeListeners();
        
        // Show dashboard tab by default
        switchTab('dashboard');
        
        isInitialized = true;
        hideLoading();
        console.log('✅ Dashboard initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing dashboard:', error);
        hideLoading();
        showError('Failed to load dashboard data. Please refresh the page.');
    }
}

// Wait for Firebase to be initialized
async function waitForFirebase() {
    return new Promise((resolve) => {
        const checkFirebase = () => {
            if (window.db && window.auth && window.dbManager) {
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        checkFirebase();
    });
}

// Check authentication
async function checkAuthentication() {
    return new Promise((resolve) => {
        if (!window.auth) {
            console.error('Firebase authentication not available');
            redirectToLogin();
            resolve(false);
            return;
        }
        
        window.auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                if (ALLOWED_ADMINS.length && !ALLOWED_ADMINS.includes(user.email)) {
                    console.error('Unauthorized admin email:', user.email);
                    showError('You are not authorized to access the admin panel.');
                    redirectToLogin();
                    resolve(false);
                    return;
                }
                updateUserInfo(user.email);
                resolve(true);
            } else {
                redirectToLogin();
                resolve(false);
            }
        });
    });
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function updateUserInfo(email) {
    const adminEmailElement = document.getElementById('admin-email');
    if (adminEmailElement) {
        adminEmailElement.textContent = email;
    }
}

// Load all dashboard data
async function loadDashboardData() {
    await Promise.all([
        loadSiteConfig(),
        loadEvents(),
        loadCoordinators(),
        updateDashboardStats()
    ]);
}

// Set up realtime listeners for immediate UI refresh
function initializeRealtimeListeners() {
    if (!window.db) {
        console.warn('Firestore not available for realtime listeners');
        return;
    }
    // Clean up existing listeners
    if (eventsUnsub) { try { eventsUnsub(); } catch (e) {} eventsUnsub = null; }
    if (coordinatorsUnsub) { try { coordinatorsUnsub(); } catch (e) {} coordinatorsUnsub = null; }

    try {
        eventsUnsub = window.db.collection('events').onSnapshot((snapshot) => {
            const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            docs.sort((a, b) => new Date(a?.date || 0) - new Date(b?.date || 0));
            eventsData = docs;
            renderEventsList();
            updateDashboardStats();
        }, (err) => console.error('Events realtime error:', err));
    } catch (e) {
        console.error('Failed to subscribe to events:', e);
    }

    try {
        coordinatorsUnsub = window.db.collection('coordinators').orderBy('name', 'asc').onSnapshot((snapshot) => {
            coordinatorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderCoordinatorsList();
            updateDashboardStats();
        }, (err) => console.error('Coordinators realtime error:', err));
    } catch (e) {
        console.error('Failed to subscribe to coordinators:', e);
    }

    // Unsubscribe on unload
    window.addEventListener('beforeunload', () => {
        if (eventsUnsub) try { eventsUnsub(); } catch (e) {}
        if (coordinatorsUnsub) try { coordinatorsUnsub(); } catch (e) {}
    });
}

// Load site configuration
async function loadSiteConfig() {
    try {
        console.log('📝 Loading site configuration...');
        
        if (window.dbManager) {
            const config = await window.dbManager.getSiteConfig();
            if (config) {
                siteConfigData = config;
                console.log('✅ Site config loaded from Firestore');
            } else {
                console.log('⚠️ No site config found in Firestore');
                siteConfigData = {};
            }
        } else {
            console.log('⚠️ Database manager not available');
            siteConfigData = {};
        }
        
        populateSiteConfigForm();
    } catch (error) {
        console.error('❌ Error loading site config:', error);
        siteConfigData = {};
        populateSiteConfigForm();
        showError('Failed to load site configuration from database.');
    }
}

// Save site configuration
async function saveSiteConfig(configData = null) {
    try {
        const dataToSave = configData || gatherSiteConfigFromForm();
        
        if (window.dbManager) {
            await window.dbManager.updateSiteConfig(dataToSave);
            siteConfigData = dataToSave;
            console.log('✅ Site config saved to Firestore');
            showSuccess('Site configuration saved successfully!');
            return true;
        } else {
            throw new Error('Database manager not available');
        }
    } catch (error) {
        console.error('❌ Error saving site config:', error);
        showError(`Failed to save site configuration: ${error.message}`);
        return false;
    }
}

// Gather site config data from form
function gatherSiteConfigFromForm() {
    const form = document.getElementById('site-config-form');
    if (!form) return siteConfigData;
    
    const formData = new FormData(form);
    const config = {};
    
    for (const [key, value] of formData.entries()) {
        config[key] = value;
    }
    
    // Add metadata
    config.lastUpdated = new Date().toISOString();
    
    return { ...siteConfigData, ...config };
}

// Function removed - no dummy data, only Firestore data

function populateSiteConfigForm() {
    const form = document.getElementById('site-config-form');
    if (!form) return;
    
    // Populate all form fields
    Object.keys(siteConfigData).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) {
            input.value = siteConfigData[key] || '';
        }
    });
}

// Load events data
async function loadEvents() {
    try {
        console.log('📅 Loading events...');
        
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        eventsData = await window.dbManager.getEvents(false); // Load all events, not just active
        console.log(`✅ Loaded ${eventsData.length} events`);
        renderEventsList();
    } catch (error) {
        console.error('❌ Error loading events:', error);
        showError('Failed to load events. Please check your Firebase connection.');
        eventsData = [];
        renderEventsList();
    }
}

// Load coordinators data
async function loadCoordinators() {
    try {
        console.log('👥 Loading coordinators...');
        
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        coordinatorsData = await window.dbManager.getCoordinators();
        console.log(`✅ Loaded ${coordinatorsData.length} coordinators`);
        renderCoordinatorsList();
    } catch (error) {
        console.error('❌ Error loading coordinators:', error);
        showError('Failed to load coordinators. Please check your Firebase connection.');
        coordinatorsData = [];
        renderCoordinatorsList();
    }
}

// Initialize form handlers
function initializeFormHandlers() {
    // Site config form handler
    const siteConfigForm = document.getElementById('site-config-form');
    if (siteConfigForm) {
        siteConfigForm.addEventListener('submit', async (e) => {
            await handleSiteConfigSave(e);
        });
    }
}

// Handle site config save
async function handleSiteConfigSave() {
    const saveButton = document.querySelector('#site-config-form button[type="submit"]');
    const originalText = saveButton.innerHTML;
    
    try {
        // Show loading state
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        
        const success = await saveSiteConfig();
        
        if (success) {
            // Refresh the site preview or reload data if needed
            setTimeout(() => {
                saveButton.innerHTML = '<i class="fas fa-check"></i> Saved!';
                setTimeout(() => {
                    saveButton.innerHTML = originalText;
                    saveButton.disabled = false;
                }, 1000);
            }, 500);
        } else {
            throw new Error('Failed to save configuration');
        }
        
    } catch (error) {
        console.error('Error saving site config:', error);
        saveButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Error!';
        setTimeout(() => {
            saveButton.innerHTML = originalText;
            saveButton.disabled = false;
        }, 2000);
    }
}

// Utility functions for notifications
function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.admin-notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Function removed - no dummy data, only Firestore data

function renderEventsList() {
    const eventsList = document.getElementById('events-list');
    if (!eventsList) return;
    
    // Apply filters
    const searchTerm = document.getElementById('events-search')?.value.toLowerCase() || '';
    const categoryFilter = (document.getElementById('events-category')?.value || '').toLowerCase();
    const statusFilter = document.getElementById('events-status')?.value || '';
    
    let filteredEvents = eventsData.filter(event => {
        const eventCat = (event.category || '').toLowerCase();
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) || 
                            eventCat.includes(searchTerm);
        const matchesCategory = !categoryFilter || eventCat.includes(categoryFilter);
        const matchesStatus = !statusFilter || 
                            (statusFilter === 'active' && event.active) ||
                            (statusFilter === 'inactive' && !event.active);
        
        return matchesSearch && matchesCategory && matchesStatus;
    });
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Events Found</h3>
                <p>No events match your current filters or none have been created yet.</p>
            </div>
        `;
        return;
    }
    
    eventsList.innerHTML = '';
    
    filteredEvents.forEach(event => {
        const eventItem = createEventItem(event);
        eventsList.appendChild(eventItem);
    });
}

function createEventItem(event) {
    const eventItem = document.createElement('div');
    eventItem.className = 'event-item';
    eventItem.setAttribute('data-event-id', event.id);
    
    const icon = getEventIcon(event.category);
    
    eventItem.innerHTML = `
        <div class="event-item-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="event-item-info">
            <h4></h4>
            <div class="event-item-meta">
                <span class="meta-category"></span>
                <span class="meta-prize"></span>
                <span class="meta-date"></span>
            </div>
        </div>
        <div class="event-status ${event.active ? 'active' : 'inactive'}">
            ${event.active ? 'Active' : 'Inactive'}
        </div>
        <div class="event-actions">
            <button class="btn btn-sm btn-secondary" title="Edit Event">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Delete Event">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    // Safe text insertion
    const titleEl = eventItem.querySelector('h4');
    const catEl = eventItem.querySelector('.meta-category');
    const prizeEl = eventItem.querySelector('.meta-prize');
    const dateEl = eventItem.querySelector('.meta-date');
    if (titleEl) titleEl.textContent = event.title || '';
    if (catEl) catEl.textContent = event.category || '';
    if (prizeEl) prizeEl.textContent = event.prize || '';
    if (dateEl) dateEl.textContent = event.date || '';
    // Bind actions without inline handlers
    const [editBtn, delBtn] = eventItem.querySelectorAll('.event-actions .btn');
    if (editBtn) editBtn.addEventListener('click', () => editEvent(event.id));
    if (delBtn) delBtn.addEventListener('click', () => deleteEvent(event.id));
    
    return eventItem;
}

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

// Load coordinators data
async function loadCoordinators() {
    try {
        if (window.dbManager) {
            coordinatorsData = await window.dbManager.getCoordinators();
        } else {
            coordinatorsData = getDefaultCoordinators();
        }
        
        renderCoordinatorsList();
    } catch (error) {
        console.error('Error loading coordinators:', error);
        coordinatorsData = getDefaultCoordinators();
        renderCoordinatorsList();
    }
}

function getDefaultCoordinators() {
    return [
        {
            id: 'coord-1',
            name: 'John Doe',
            role: 'Event Coordinator',
            phone: '+91 9876543210',
            email: 'john@college.edu'
        },
        {
            id: 'coord-2',
            name: 'Jane Smith',
            role: 'Technical Lead',
            phone: '+91 9876543211',
            email: 'jane@college.edu'
        }
    ];
}

function renderCoordinatorsList() {
    const coordinatorsList = document.getElementById('coordinators-list');
    if (!coordinatorsList) return;
    
    if (coordinatorsData.length === 0) {
        coordinatorsList.innerHTML = `
            <div class="no-coordinators">
                <i class="fas fa-users"></i>
                <h3>No Coordinators</h3>
                <p>Add coordinators to manage your events effectively.</p>
            </div>
        `;
        return;
    }
    
    coordinatorsList.innerHTML = '';
    
    coordinatorsData.forEach(coordinator => {
        const coordinatorCard = createCoordinatorCard(coordinator);
        coordinatorsList.appendChild(coordinatorCard);
    });
}

function createCoordinatorCard(coordinator) {
    const card = document.createElement('div');
    card.className = 'coordinator-card';
    card.setAttribute('data-coordinator-id', coordinator.id);
    
    card.innerHTML = `
        <div class="coordinator-actions">
            <button class="btn btn-sm btn-secondary" title="Edit Coordinator">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" title="Delete Coordinator">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <h4></h4>
        <div class="coordinator-role"></div>
        <div class="coordinator-contacts">
            <span class="phone"></span>
            <span class="email"></span>
        </div>
    `;
    card.querySelector('h4').textContent = coordinator.name || '';
    card.querySelector('.coordinator-role').textContent = coordinator.role || 'Event Coordinator';
    card.querySelector('.phone').textContent = coordinator.phone || 'No phone provided';
    card.querySelector('.email').textContent = coordinator.email || 'No email provided';
    const [editBtn, delBtn] = card.querySelectorAll('.coordinator-actions .btn');
    if (editBtn) editBtn.addEventListener('click', () => editCoordinator(coordinator.id));
    if (delBtn) delBtn.addEventListener('click', () => deleteCoordinator(coordinator.id));
    
    return card;
}

// Update dashboard statistics
async function updateDashboardStats() {
    try {
        // Calculate stats
        const totalEvents = eventsData.length;
        const totalCoordinators = coordinatorsData.length;
        let totalViews = eventsData.reduce((sum, ev) => {
            const v = (typeof ev.viewCount === 'number' ? ev.viewCount : (typeof ev.views === 'number' ? ev.views : 0));
            return sum + v;
        }, 0);
        if (!totalViews && siteConfigData && typeof siteConfigData.totalViews === 'number') {
            totalViews = siteConfigData.totalViews;
        }
        
        // Calculate total prize money
        let totalPrizes = 0;
        eventsData.forEach(event => {
            if (event.prize) {
                const prizeAmount = extractPrizeAmount(event.prize);
                totalPrizes += prizeAmount;
            }
        });
        
        console.log('📊 ADMIN: Dashboard stats calculated - Events:', totalEvents, 'Coordinators:', totalCoordinators);
        
        // Update DOM elements
    const elEvents = document.getElementById('total-events');
    const elCoords = document.getElementById('total-coordinators');
    const elViews = document.getElementById('total-views');
    const elPrizes = document.getElementById('total-prizes');
    if (elEvents) elEvents.textContent = totalEvents;
    if (elCoords) elCoords.textContent = totalCoordinators;
    if (elViews) elViews.textContent = Number(totalViews || 0).toLocaleString();
    if (elPrizes) elPrizes.textContent = `₹${Number(totalPrizes || 0).toLocaleString()}`;
        
        // Auto-update the events count in the site config form
        const eventsCountAdmin = document.getElementById('events-count-admin');
        if (eventsCountAdmin && eventsCountAdmin.value != totalEvents) {
            eventsCountAdmin.value = totalEvents;
            console.log('📊 ADMIN: Auto-updated events count field to', totalEvents);
        }
        
        // Auto-save the updated events count to Firebase
        try {
            if (window.dbManager && totalEvents !== (siteConfigData?.eventsCount || 0)) {
                await window.dbManager.updateSiteConfig({
                    eventsCount: totalEvents,
                    lastUpdated: new Date().toISOString()
                });
                console.log('✅ ADMIN: Auto-saved events count to Firebase:', totalEvents);
            }
        } catch (error) {
            console.error('❌ ADMIN: Error auto-saving events count:', error);
        }
        
        // Add recent activity
        addRecentActivity();
        
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}

/**
 * Sync stats between actual data and site config
 */
async function syncStatsToConfig() {
    try {
        console.log('🔄 ADMIN: Syncing stats to site config...');
        
        const actualEventsCount = eventsData.length;
        const actualCoordinatorsCount = coordinatorsData.length;
        
        const syncData = {
            eventsCount: actualEventsCount,
            coordinatorsCount: actualCoordinatorsCount,
            lastUpdated: new Date().toISOString()
        };
        
        if (window.dbManager) {
            await window.dbManager.updateSiteConfig(syncData);
            console.log('✅ ADMIN: Stats synced to Firebase:', syncData);
            
            // Update form fields
            const eventsField = document.getElementById('events-count-admin');
            const coordsField = document.getElementById('coordinators-count-admin');
            
            if (eventsField) eventsField.value = actualEventsCount;
            if (coordsField) coordsField.value = actualCoordinatorsCount;
            
            showSuccess('Stats synced successfully!');
        }
    } catch (error) {
        console.error('❌ ADMIN: Error syncing stats:', error);
        showError('Failed to sync stats');
    }
}

function extractPrizeAmount(prizeString) {
    // Extract numeric value from prize string (e.g., "₹15,000" -> 15000)
    const matches = prizeString.match(/[\d,]+/);
    if (matches) {
        return parseInt(matches[0].replace(/,/g, '')) || 0;
    }
    return 0;
}

function addRecentActivity() {
    const activityList = document.getElementById('recent-activity');
    if (!activityList) return;
    
    // Clear existing activities except welcome message
    const existingActivities = activityList.querySelectorAll('.activity-item');
    existingActivities.forEach((activity, index) => {
        if (index > 0) activity.remove(); // Keep first welcome message
    });
    
    // Add recent activities based on data
    const activities = [];
    
    if (eventsData.length > 0) {
        activities.push({
            icon: 'fas fa-calendar-plus',
            text: `${eventsData.length} events are currently configured`,
            time: 'Today'
        });
    }
    
    if (coordinatorsData.length > 0) {
        activities.push({
            icon: 'fas fa-user-plus',
            text: `${coordinatorsData.length} coordinators are managing events`,
            time: 'Today'
        });
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="${activity.icon}"></i>
            <span>${activity.text}</span>
            <time>${activity.time}</time>
        `;
        activityList.appendChild(activityItem);
    });
}

// Navigation functions
function initializeNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabName = item.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Site config form submission
    const siteConfigForm = document.getElementById('site-config-form');
    if (siteConfigForm) {
        siteConfigForm.addEventListener('submit', handleSiteConfigSave);
    }
}

function switchTab(tabName) {
    // Update menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Load tab-specific data if needed
    if (tabName === 'events') {
        renderEventsList();
    } else if (tabName === 'coordinators') {
        renderCoordinatorsList();
    }
}

// Site configuration functions
async function handleSiteConfigSave(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const configData = {};
    
    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
        configData[key] = value.trim();
    }
    
    // Add detailed logging
    console.log('🔧 ADMIN: Starting site config save...');
    console.log('🔧 ADMIN: Form data fields count:', Object.keys(configData).length);
    console.log('🔧 ADMIN: Form data fields:', Object.keys(configData));
    console.log('🔧 ADMIN: Complete config data to save:', configData);
    
    const saveBtn = e.target.querySelector('button[type="submit"]');
    setLoading(saveBtn, true);
    
    try {
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        console.log('🔧 ADMIN: Calling dbManager.updateSiteConfig...');
        await window.dbManager.updateSiteConfig(configData);
        console.log('✅ ADMIN: Site config saved successfully to Firebase');
        
        // Verify what was actually saved
        try {
            const savedDoc = await window.db.collection('siteConfig').doc('main').get();
            if (savedDoc.exists) {
                const savedData = savedDoc.data();
                console.log('🔍 ADMIN: Verification - Data actually saved:', savedData);
                console.log('🔍 ADMIN: Verification - Fields saved:', Object.keys(savedData));
            }
        } catch (verifyError) {
            console.error('❌ ADMIN: Error verifying saved data:', verifyError);
        }
        
        showSuccess('Site configuration saved successfully!');
        addRecentActivity('Site configuration updated', 'fas fa-cog');
        
    } catch (error) {
        console.error('❌ ADMIN: Error saving site config:', error);
        showError('Failed to save site configuration. Please try again.');
    } finally {
        setLoading(saveBtn, false);
    }
}

// Event management functions
function initializeEventFilters() {
    const searchInput = document.getElementById('events-search');
    const categoryInput = document.getElementById('events-category');
    const statusSelect = document.getElementById('events-status');
    
    if (searchInput) {
        searchInput.addEventListener('input', debounce(renderEventsList, 300));
    }
    
    if (categoryInput) {
        categoryInput.addEventListener('input', debounce(renderEventsList, 300));
    }
    
    if (statusSelect) {
        statusSelect.addEventListener('change', renderEventsList);
    }
}

function showAddEventModal() {
    currentEditingEvent = null;
    document.getElementById('event-modal-title').textContent = 'Add New Event';
    document.getElementById('event-form').reset();
    document.getElementById('event-id').value = '';
    
    // Reset rules container
    const rulesContainer = document.getElementById('rules-container');
    rulesContainer.innerHTML = `
        <div class="rule-item">
            <input type="text" class="form-input rule-input" placeholder="Enter a rule">
            <button type="button" class="btn btn-sm btn-danger" onclick="removeRule(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Reset coordinators container
    const coordinatorsContainer = document.getElementById('coordinators-container');
    coordinatorsContainer.innerHTML = `
        <div class="coordinator-item">
            <div class="coordinator-fields">
                <input type="text" class="form-input coordinator-name" placeholder="Coordinator Name">
                <input type="tel" class="form-input coordinator-phone" placeholder="Phone Number">
                <input type="email" class="form-input coordinator-email" placeholder="Email Address">
                <input type="text" class="form-input coordinator-role" placeholder="Role (e.g., Event Coordinator)">
            </div>
            <button type="button" class="btn btn-sm btn-danger" onclick="removeCoordinator(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    document.getElementById('event-modal').classList.add('active');
}

function editEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    currentEditingEvent = event;
    document.getElementById('event-modal-title').textContent = 'Edit Event';
    
    // Populate form
    document.getElementById('event-id').value = event.id;
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-category').value = event.category || '';
    document.getElementById('event-short-description').value = event.shortDescription;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-prize').value = event.prize;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-registration-link').value = event.registrationLink || '';
    document.getElementById('event-participation-fee').value = event.participationFee || '';
    document.getElementById('event-team-requirements').value = event.teamRequirements || '';
    document.getElementById('event-active').checked = event.active;
    
    // Populate rules
    const rulesContainer = document.getElementById('rules-container');
    rulesContainer.innerHTML = '';
    
    if (event.rules && event.rules.length > 0) {
        event.rules.forEach(rule => {
            const ruleItem = document.createElement('div');
            ruleItem.className = 'rule-item';
            ruleItem.innerHTML = `
                <input type="text" class="form-input rule-input" value="${rule}" placeholder="Enter a rule">
                <button type="button" class="btn btn-sm btn-danger" onclick="removeRule(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            rulesContainer.appendChild(ruleItem);
        });
    } else {
        addRule(); // Add one empty rule
    }
    
    // Populate coordinators
    const coordinatorsContainer = document.getElementById('coordinators-container');
    coordinatorsContainer.innerHTML = '';
    
    if (event.contacts && event.contacts.length > 0) {
        event.contacts.forEach(contact => {
            const coordinatorItem = document.createElement('div');
            coordinatorItem.className = 'coordinator-item';
            coordinatorItem.innerHTML = `
                <div class="coordinator-fields">
                    <input type="text" class="form-input coordinator-name" placeholder="Coordinator Name" value="${contact.name || ''}">
                    <input type="tel" class="form-input coordinator-phone" placeholder="Phone Number" value="${contact.phone || ''}">
                    <input type="email" class="form-input coordinator-email" placeholder="Email Address" value="${contact.email || ''}">
                    <input type="text" class="form-input coordinator-role" placeholder="Role (e.g., Event Coordinator)" value="${contact.role || ''}">
                </div>
                <button type="button" class="btn btn-sm btn-danger" onclick="removeCoordinator(this)">
                    <i class="fas fa-trash"></i>
                </button>
            `;
            coordinatorsContainer.appendChild(coordinatorItem);
        });
    } else {
        addCoordinator(); // Add one empty coordinator
    }
    
    document.getElementById('event-modal').classList.add('active');
}

async function saveEvent() {
    const form = document.getElementById('event-form');
    const formData = new FormData(form);
    
    // Validate required fields
    const title = sanitizeText(formData.get('title'));
    const category = sanitizeText(formData.get('category'));
    const shortDescription = sanitizeText(formData.get('shortDescription'));
    const description = sanitizeText(formData.get('description'));
    
    if (!title || !category || !shortDescription || !description) {
        showError('Please fill in all required fields.');
        return;
    }
    
    // Collect rules
    const ruleInputs = document.querySelectorAll('.rule-input');
    const rules = Array.from(ruleInputs)
        .map(input => sanitizeText(input.value))
        .filter(rule => rule.length > 0);
    
    // Collect coordinators
    const coordinatorItems = document.querySelectorAll('.coordinator-item');
    const contacts = Array.from(coordinatorItems).map(item => {
        const name = sanitizeText(item.querySelector('.coordinator-name').value);
        const phone = sanitizeText(item.querySelector('.coordinator-phone').value);
        const email = sanitizeText(item.querySelector('.coordinator-email').value);
        const role = sanitizeText(item.querySelector('.coordinator-role').value);
        
        if (name && phone && email && role) {
            return { name, phone, email, role };
        }
        return null;
    }).filter(contact => contact !== null);
    
    const eventData = {
        title,
        category,
        shortDescription,
        description,
    prize: sanitizeText(formData.get('prize')),
    date: sanitizeText(formData.get('date')),
    registrationLink: sanitizeText(formData.get('registrationLink')),
    participationFee: sanitizeText(formData.get('participationFee')),
    teamRequirements: sanitizeText(formData.get('teamRequirements')),
        rules,
        contacts,
        active: formData.get('active') === 'on',
        updatedAt: new Date()
    };
    
    const saveBtn = document.querySelector('#event-modal .btn-primary');
    setLoading(saveBtn, true);
    
    try {
        const eventId = document.getElementById('event-id').value;
        
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        // Determine event ID - use existing or generate new
        const finalEventId = eventId || generateEventId(title);
        
        // Validate event ID
        if (!finalEventId || finalEventId.length < 3) {
            throw new Error('Invalid event ID generated. Please check the event title.');
        }
        
        eventData.id = finalEventId;
        console.log(`📝 Processing event: ${finalEventId} (${eventId ? 'update' : 'create'})`);
        
        // Add timestamps
        if (!eventId) {
            eventData.createdAt = new Date();
        }
        
        // Use upsert to handle both create and update cases
        await window.dbManager.upsertEvent(finalEventId, eventData);
        
        const action = eventId ? 'updated' : 'created';
        showSuccess(`Event ${action} successfully!`);
        
        // Refresh UI
        await loadEvents();
        await updateDashboardStats();
        closeEventModal();
        
    } catch (error) {
        console.error('Error saving event:', error);
        showError('Failed to save event. Please try again.');
    } finally {
        setLoading(saveBtn, false);
    }
}

function generateEventId(title) {
    if (!title || title.trim().length === 0) {
        return 'event-' + Date.now();
    }
    
    const cleanId = title.toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    
    // Ensure ID is not empty and has minimum length
    const baseId = cleanId.length > 0 ? cleanId : 'event';
    return baseId + '-' + Date.now();
}

async function deleteEvent(eventId) {
    const event = eventsData.find(e => e.id === eventId);
    if (!event) return;
    
    showDeleteModal(() => performEventDelete(eventId));
}

async function performEventDelete(eventId) {
    try {
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        await window.dbManager.deleteEvent(eventId);
        showSuccess('Event deleted successfully!');
        await loadEvents();
        await updateDashboardStats();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        showError('Failed to delete event. Please try again.');
    }
}

function closeEventModal() {
    document.getElementById('event-modal').classList.remove('active');
    currentEditingEvent = null;
}

// Rule management functions
function addRule() {
    const rulesContainer = document.getElementById('rules-container');
    const ruleItem = document.createElement('div');
    ruleItem.className = 'rule-item';
    ruleItem.innerHTML = `
        <input type="text" class="form-input rule-input" placeholder="Enter a rule">
        <button type="button" class="btn btn-sm btn-danger" onclick="removeRule(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    rulesContainer.appendChild(ruleItem);
    
    // Focus on the new input
    ruleItem.querySelector('.rule-input').focus();
}

function removeRule(button) {
    const ruleItem = button.closest('.rule-item');
    ruleItem.remove();
}

// Event coordinator management functions (for event form)
function addCoordinator() {
    const coordinatorsContainer = document.getElementById('coordinators-container');
    const coordinatorItem = document.createElement('div');
    coordinatorItem.className = 'coordinator-item';
    coordinatorItem.innerHTML = `
        <div class="coordinator-fields">
            <input type="text" class="form-input coordinator-name" placeholder="Coordinator Name">
            <input type="tel" class="form-input coordinator-phone" placeholder="Phone Number">
            <input type="email" class="form-input coordinator-email" placeholder="Email Address">
            <input type="text" class="form-input coordinator-role" placeholder="Role (e.g., Event Coordinator)">
        </div>
        <button type="button" class="btn btn-sm btn-danger" onclick="removeCoordinator(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    coordinatorsContainer.appendChild(coordinatorItem);
    
    // Focus on the new name input
    coordinatorItem.querySelector('.coordinator-name').focus();
}

function removeCoordinator(button) {
    const coordinatorItem = button.closest('.coordinator-item');
    coordinatorItem.remove();
}

// Coordinator management functions
function showAddCoordinatorModal() {
    currentEditingCoordinator = null;
    document.getElementById('coordinator-modal-title').textContent = 'Add New Coordinator';
    document.getElementById('coordinator-form').reset();
    document.getElementById('coordinator-id').value = '';
    document.getElementById('coordinator-modal').classList.add('active');
}

function editCoordinator(coordinatorId) {
    const coordinator = coordinatorsData.find(c => c.id === coordinatorId);
    if (!coordinator) return;
    
    currentEditingCoordinator = coordinator;
    document.getElementById('coordinator-modal-title').textContent = 'Edit Coordinator';
    
    // Populate form
    document.getElementById('coordinator-id').value = coordinator.id;
    document.getElementById('coordinator-name').value = coordinator.name;
    document.getElementById('coordinator-role').value = coordinator.role || '';
    document.getElementById('coordinator-phone').value = coordinator.phone || '';
    document.getElementById('coordinator-email').value = coordinator.email || '';
    
    document.getElementById('coordinator-modal').classList.add('active');
}

async function saveCoordinator() {
    const form = document.getElementById('coordinator-form');
    const formData = new FormData(form);
    
    const name = sanitizeText(formData.get('name'));
    if (!name) {
        showError('Coordinator name is required.');
        return;
    }
    
    const coordinatorData = {
        name,
        role: sanitizeText(formData.get('role')),
        phone: sanitizeText(formData.get('phone')),
        email: sanitizeText(formData.get('email')),
        updatedAt: new Date()
    };
    
    const saveBtn = document.querySelector('#coordinator-modal .btn-primary');
    setLoading(saveBtn, true);
    
    try {
        const coordinatorId = document.getElementById('coordinator-id').value;
        
        if (coordinatorId) {
            // Update existing coordinator
            if (!window.dbManager) {
                throw new Error('Database manager not available');
            }
            
            await window.dbManager.updateCoordinator(coordinatorId, coordinatorData);
            showSuccess('Coordinator updated successfully!');
        } else {
            // Create new coordinator
            coordinatorData.id = generateCoordinatorId(name);
            coordinatorData.createdAt = new Date();
            
            if (window.dbManager) {
                const newCoordinatorId = await window.dbManager.createCoordinator(coordinatorData);
                coordinatorData.id = newCoordinatorId;
            }
            
            coordinatorsData.push(coordinatorData);
            showSuccess('Coordinator created successfully!');
        }
        
        // Refresh UI
        await loadCoordinators();
        await updateDashboardStats();
        closeCoordinatorModal();
        
    } catch (error) {
        console.error('Error saving coordinator:', error);
        showError('Failed to save coordinator. Please try again.');
    } finally {
        setLoading(saveBtn, false);
    }
}

function generateCoordinatorId(name) {
    return name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') + '-' + Date.now();
}

async function deleteCoordinator(coordinatorId) {
    const coordinator = coordinatorsData.find(c => c.id === coordinatorId);
    if (!coordinator) return;
    
    showDeleteModal(() => performCoordinatorDelete(coordinatorId));
}

async function performCoordinatorDelete(coordinatorId) {
    try {
        if (!window.dbManager) {
            throw new Error('Database manager not available');
        }
        
        await window.dbManager.deleteCoordinator(coordinatorId);
        showSuccess('Coordinator deleted successfully!');
        await loadCoordinators();
        await updateDashboardStats();
        
    } catch (error) {
        console.error('Error deleting coordinator:', error);
        showError('Failed to delete coordinator. Please try again.');
    }
}

function closeCoordinatorModal() {
    document.getElementById('coordinator-modal').classList.remove('active');
    currentEditingCoordinator = null;
}

// Modal management
function initializeModals() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            if (e.target.id === 'event-modal') closeEventModal();
            if (e.target.id === 'coordinator-modal') closeCoordinatorModal();
            if (e.target.id === 'delete-modal') closeDeleteModal();
        }
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeEventModal();
            closeCoordinatorModal();
            closeDeleteModal();
        }
    });
}

function showDeleteModal(callback) {
    deleteCallback = callback;
    document.getElementById('delete-modal').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('delete-modal').classList.remove('active');
    deleteCallback = null;
}

function confirmDelete() {
    if (deleteCallback) {
        deleteCallback();
        closeDeleteModal();
    }
}

// Authentication functions
async function signOut() {
    try {
        if (!window.auth) {
            throw new Error('Firebase authentication not available');
        }
        
        await window.auth.signOut();
        
        // Clear any cached data
        localStorage.removeItem('adminRememberMe');
        
        showSuccess('Signed out successfully!');
        
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        
    } catch (error) {
        console.error('Error signing out:', error);
        showError('Failed to sign out. Please try again.');
    }
}

// Utility functions
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(toast => toast.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
        error: 'fas fa-exclamation-circle',
        success: 'fas fa-check-circle',
        info: 'fas fa-info-circle'
    };
    
    const colors = {
        error: '#FF3B30',
        success: '#34C759',
        info: '#007AFF'
    };
    
    toast.innerHTML = `
        <i class="${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type]};
        color: white;
        padding: 16px 20px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 10px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: var(--font-family);
        font-size: var(--font-size-sm);
        font-weight: 500;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    const delay = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, delay);
    
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
}

function debounce(func, wait) {
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

// Basic sanitization to strip HTML tags and trim whitespace
function sanitizeText(value) {
    return String(value || '')
        .replace(/<[^>]*>/g, '')
        .replace(/[\u0000-\u001F\u007F]/g, '')
        .trim();
}