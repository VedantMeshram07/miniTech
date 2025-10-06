// Global variables
let eventsData = [];
let siteConfig = {};
let coordinatorsData = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize application
async function initializeApp() {
    console.log('🚀 Starting website initialization...');
    showLoading();
    
    try {
        // Wait for Firebase to be available (max 5 seconds)
        await waitForFirebase(5000);
        
        // Initialize Firebase and load data
        await loadSiteData();
        await loadEvents();
        await loadCoordinators();
        
        // Initialize UI components
        initializeNavigation();
        initializeHeroAnimations();
        initializeSectionTransitions();
        initializeScrollEffects();
        await initializeStatsCounters();
        
        hideLoading();
        console.log('✅ Website initialization completed successfully');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
        hideLoading();
        
        // Still try to load with defaults
        console.log('🔄 Loading with default configuration...');
        try {
            siteConfig = getDefaultSiteConfig();
            updateSiteContent();
            eventsData = getDefaultEvents();
            coordinatorsData = [];
            renderEvents();
            renderCoordinators();
            
            initializeNavigation();
            initializeHeroAnimations();
            initializeScrollEffects();
            
            showErrorMessage('Website loaded with default content. Some features may be limited.');
        } catch (fallbackError) {
            console.error('❌ Fallback initialization failed:', fallbackError);
            showErrorMessage('Failed to load website. Please refresh the page.');
        }
    }
}

// Wait for Firebase to be initialized
async function waitForFirebase(timeout = 5000) {
    return new Promise((resolve) => {
        const startTime = Date.now();
        
        const checkFirebase = () => {
            if (window.db && window.auth) {
                console.log('✅ Firebase is ready');
                resolve();
            } else if (Date.now() - startTime > timeout) {
                console.log('⚠️ Firebase timeout, proceeding without it');
                resolve();
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

// Loading functions
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

// Error handling
function showErrorMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    
    // Add toast styles dynamically if not present
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

// Data loading functions
async function loadSiteData() {
    try {
        console.log('📋 Loading site configuration...');
        
        // Try to load from Firebase, with proper fallback
        if (window.dbManager) {
            const config = await window.dbManager.getSiteConfig();
            if (config) {
                siteConfig = config;
                console.log('✅ Site config loaded from Firestore');
            } else {
                console.log('⚠️ No site config found in Firestore, using defaults');
                siteConfig = getDefaultSiteConfig();
            }
        } else if (window.db) {
            const doc = await window.db.collection('siteConfig').doc('main').get();
            if (doc.exists) {
                siteConfig = doc.data();
                console.log('✅ Site config loaded from Firestore (direct)');
            } else {
                console.log('⚠️ No site config found in Firestore, using defaults');
                siteConfig = getDefaultSiteConfig();
            }
        } else {
            console.log('⚠️ No Firebase connection, using default configuration');
            siteConfig = getDefaultSiteConfig();
        }
        
        updateSiteContent();
    } catch (error) {
        console.error('❌ Error loading site configuration:', error);
        console.log('Using default site configuration as fallback');
        siteConfig = getDefaultSiteConfig();
        updateSiteContent();
    }
}

function getDefaultSiteConfig() {
    return {
        collegeName: 'Government College of Engineering, Jalgaon',
        collegeShortName: 'GCOEJ',
        collegeLocation: 'Jalgaon',
        organizingBody: 'Technical Council',
        techfestName: 'TechCarvaan 2025',
        techfestTheme: 'Future Tech Revolution',
        tagline: 'Where Innovation Meets Excellence',
        heroDescription: 'Join us for the most exciting tech festival of the year! Compete, innovate, and connect with brilliant minds from across the nation.',
        eventDates: 'March 15-20, 2025',
        venue: 'GCOEJ Campus',
        totalPrizePool: '₹2,00,000',
        eventsCount: '6+',
        participantsCount: '1000+',
        collegesCount: '50+',
        contactEmail: 'technicalcouncil@gcoej.ac.in',
        contactPhone: '+91 9876543210',
        contactCollege: 'Government College of Engineering, Jalgaon',
        contactOrganization: 'Technical Council GCOEJ',
        aboutTitle: 'About TechCarvaan',
        aboutDescription: 'Our annual technology festival brings together the brightest minds to compete, collaborate, and celebrate innovation. Join us for an unforgettable experience filled with cutting-edge competitions, workshops, and networking opportunities.',
        footerDescription: 'Empowering the next generation of tech innovators.',
        footerCopyrightName: 'GCOEJ'
    };
}

function updateSiteContent() {
    console.log('🎨 Updating site content with configuration...');
    
    // Update all editable content on the page
    const updates = [
        ['site-title', siteConfig.techfestName || siteConfig.collegeName],
        ['nav-typography-name', siteConfig.techfestName || 'TechCarvaan 2025'],
        
        // College and Organization Info
        ['college-name', siteConfig.collegeName],
        ['college-location', siteConfig.collegeLocation],
        ['organizing-body', siteConfig.organizingBody],
        
    // Hero Section - intentionally omitted to keep hero content hardcoded
    // Hero content is managed directly in the HTML (hardcoded) to avoid issues with admin updates not applying
        
        // Statistics
        ['events-count', siteConfig.eventsCount],
        ['participants-count', siteConfig.participantsCount], 
        ['colleges-count', siteConfig.collegesCount],
        
        // About Section
        ['about-title', siteConfig.aboutTitle],
        ['about-description', siteConfig.aboutDescription],
        
        // Contact Section
        ['contact-college', siteConfig.contactCollege],
        ['contact-organization', siteConfig.contactOrganization],
        ['contact-phone', siteConfig.contactPhone],
        ['contact-email', siteConfig.contactEmail],
        
        // Footer
        ['footer-college-name', siteConfig.techfestName],
        ['footer-description', siteConfig.footerDescription],
        ['footer-copyright-name', siteConfig.footerCopyrightName]
    ];

    updates.forEach(([id, content]) => {
        const element = document.getElementById(id);
        if (element && content) {
            element.textContent = content;
        }
    });
    
    console.log('✅ Site content updated successfully');
}

async function loadEvents() {
    try {
        console.log('🎯 Loading events...');
        
        // Only load from Firebase - no dummy data
        if (window.dbManager) {
            const firebaseEvents = await window.dbManager.getEvents(true); // Only active events
            eventsData = firebaseEvents;
            console.log(`✅ Loaded ${eventsData.length} events from Firestore`);
        } else if (window.db) {
            // Fallback to direct DB access
            const snapshot = await window.db.collection('events').where('active', '==', true).get();
            eventsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✅ Loaded ${eventsData.length} events from Firestore (direct)`);
        } else {
            // No Firebase connection - use default events
            console.log('⚠️ No Firebase connection, loading default events');
            eventsData = getDefaultEvents();
        }
        
        renderEvents();
    } catch (error) {
        console.error('❌ Error loading events:', error);
        console.log('🔄 Loading default events as fallback');
        eventsData = getDefaultEvents();
        renderEvents();
    }
}

// Function removed - no dummy data, only Firestore data

function renderEvents() {
    const eventsGrid = document.getElementById('events-grid');
    
    if (!eventsGrid) return;
    
    // Clear skeleton loading
    eventsGrid.innerHTML = '';
    
    if (eventsData.length === 0) {
        eventsGrid.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-alt"></i>
                <h3>No Events Available</h3>
                <p>Events will be announced soon. Stay tuned!</p>
            </div>
        `;
        return;
    }
    
    eventsData.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
    
    // Add intersection observer for animation
    observeEventCards();
    
    // Initialize dynamic glow effects for new cards
    if (window.dynamicCardColors) {
        setTimeout(() => {
            window.dynamicCardColors.refreshAllColors();
        }, 100); // Small delay to ensure DOM is updated
    }
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.setAttribute('data-event-id', event.id);
    
    // Create image element or placeholder
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
            <button class="btn btn-primary event-button" onclick="openEventDetails('${event.id}')">
                <span>Learn More</span>
                <i class="fas fa-arrow-right"></i>
            </button>
        </div>
    `;
    
    // Add hover effect
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    return card;
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

function observeEventCards() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'slideInUp 0.6s ease-out';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.event-card').forEach(card => {
        observer.observe(card);
    });
}

async function loadCoordinators() {
    try {
        console.log('👥 Loading coordinators...');
        
        // Only load from Firebase - no dummy data
        if (window.dbManager) {
            coordinatorsData = await window.dbManager.getCoordinators();
            console.log(`✅ Loaded ${coordinatorsData.length} coordinators from Firestore`);
        } else if (window.db) {
            // Fallback to direct DB access
            const snapshot = await window.db.collection('coordinators').get();
            coordinatorsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log(`✅ Loaded ${coordinatorsData.length} coordinators from Firestore (direct)`);
        } else {
            console.log('⚠️ No Firebase connection, no coordinators to display');
            coordinatorsData = [];
        }
        
        renderCoordinators();
    } catch (error) {
        console.error('❌ Error loading coordinators:', error);
        console.log('No coordinators available - check Firebase connection');
        coordinatorsData = [];
        renderCoordinators();
    }
}

// Function removed - no dummy data, only Firestore data

function renderCoordinators() {
    const coordinatorsList = document.getElementById('coordinators-list');
    
    if (!coordinatorsList) return;
    
    coordinatorsList.innerHTML = '';
    
    if (coordinatorsData.length === 0) {
        coordinatorsList.innerHTML = `
            <div class="no-coordinators">
                <i class="fas fa-users"></i>
                <p>Coordinator information will be available soon.</p>
            </div>
        `;
        return;
    }
    
    // Separate coordinators by role
    const convenors = coordinatorsData.filter(coord => 
        coord.role && coord.role.toLowerCase().includes('convenor') && !coord.role.toLowerCase().includes('co')
    );
    const coConvenors = coordinatorsData.filter(coord => 
        coord.role && (coord.role.toLowerCase().includes('co-convenor') || coord.role.toLowerCase().includes('co convenor'))
    );
    
    // Render convenor on top row
    if (convenors.length > 0) {
        const convenorRow = document.createElement('div');
        convenorRow.className = 'convenor-row';
        
        const convenor = convenors[0];
        const convenorCard = document.createElement('div');
        convenorCard.className = 'coordinator-card convenor-card';
        convenorCard.innerHTML = `
            <div class="coordinator-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <h4>${convenor.name}</h4>
            <p class="role">Convenor</p>
            <p class="contact">${convenor.phone || 'Phone not available'}</p>
        `;
        convenorRow.appendChild(convenorCard);
        coordinatorsList.appendChild(convenorRow);
    }
    
    // Render co-convenors in bottom row (max 3)
    const coConvenorsToShow = coConvenors.slice(0, 3);
    if (coConvenorsToShow.length > 0) {
        const coConvenorsRow = document.createElement('div');
        coConvenorsRow.className = 'co-convenors-row';
        
        coConvenorsToShow.forEach(coordinator => {
            const coordinatorCard = document.createElement('div');
            coordinatorCard.className = 'coordinator-card co-convenor-card';
            coordinatorCard.innerHTML = `
                <div class="coordinator-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <h4>${coordinator.name}</h4>
                <p class="role">Co-Convenor</p>
                <p class="contact">${coordinator.phone || 'Phone not available'}</p>
            `;
            coConvenorsRow.appendChild(coordinatorCard);
        });
        
        coordinatorsList.appendChild(coConvenorsRow);
    }
    
    // If no specific roles found, show first 4 coordinators with generic roles
    if (convenors.length === 0 && coConvenors.length === 0 && coordinatorsData.length > 0) {
        // Add convenor on top row (first coordinator)
        const convenorRow = document.createElement('div');
        convenorRow.className = 'convenor-row';
        
        const convenor = coordinatorsData[0];
        const convenorCard = document.createElement('div');
        convenorCard.className = 'coordinator-card convenor-card';
        convenorCard.innerHTML = `
            <div class="coordinator-avatar">
                <i class="fas fa-user-tie"></i>
            </div>
            <h4>${convenor.name}</h4>
            <p class="role">Convenor</p>
            <p class="contact">${convenor.phone || 'Phone not available'}</p>
        `;
        convenorRow.appendChild(convenorCard);
        coordinatorsList.appendChild(convenorRow);
        
        // Add co-convenors in bottom row (remaining coordinators, max 3)
        const remainingCoordinators = coordinatorsData.slice(1, 4);
        if (remainingCoordinators.length > 0) {
            const coConvenorsRow = document.createElement('div');
            coConvenorsRow.className = 'co-convenors-row';
            
            remainingCoordinators.forEach(coordinator => {
                const coordinatorCard = document.createElement('div');
                coordinatorCard.className = 'coordinator-card co-convenor-card';
                coordinatorCard.innerHTML = `
                    <div class="coordinator-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <h4>${coordinator.name}</h4>
                    <p class="role">Co-Convenor</p>
                    <p class="contact">${coordinator.phone || 'Phone not available'}</p>
                `;
                coConvenorsRow.appendChild(coordinatorCard);
            });
            
            coordinatorsList.appendChild(coConvenorsRow);
        }
    }
}

// Navigation functionality
function initializeNavigation() {
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    // Navbar scroll effect - use CSS classes instead of inline styles
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 70;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });
    });
}

// Hero animations
function initializeHeroAnimations() {
    // Typing effect for hero title (optional)
    const heroTitle = document.getElementById('hero-title-main');
    if (heroTitle) {
        // Add any additional hero animations here
    }
    
    // Parallax effect for hero elements
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const heroElements = document.querySelectorAll('.floating-card, .hero-circle');
        
        heroElements.forEach((element, index) => {
            const speed = 0.5 + (index * 0.1);
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Scroll effects
function initializeScrollEffects() {
    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for scroll animations
    document.querySelectorAll('.about-section, .contact-section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.8s ease-out';
        observer.observe(el);
    });
}

// Utility functions
function scrollToEvents() {
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
        const offsetTop = eventsSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

function scrollToFeaturedEvents() {
    const eventsSection = document.getElementById('events');
    if (eventsSection) {
        const offsetTop = eventsSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
        
        // Add a subtle highlight to indicate focus on registration
        const eventsGrid = document.getElementById('events-grid');
        if (eventsGrid) {
            eventsGrid.style.animation = 'highlightFocus 1s ease-in-out';
            setTimeout(() => {
                eventsGrid.style.animation = '';
            }, 1000);
        }
    }
}

function scrollToAbout() {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
        const offsetTop = aboutSection.offsetTop - 70;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Event details functionality
function openEventDetails(eventId) {
    console.log(`🔗 Opening event details for ID: ${eventId}`);
    console.log(`📊 Available events:`, eventsData.map(e => e.id));
    
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
        console.error(`❌ Event not found: ${eventId}`);
        alert(`Event "${eventId}" not found. Please try refreshing the page.`);
        return;
    }
    
    console.log(`✅ Found event:`, event);
    
    // Store event data in localStorage for the details page
    localStorage.setItem('selectedEvent', JSON.stringify(event));
    console.log(`💾 Stored event in localStorage`);
    
    // Open event details page
    const targetUrl = `events/details.html?id=${eventId}`;
    console.log(`🚀 Navigating to: ${targetUrl}`);
    window.location.href = targetUrl;
}

// Register for event
function registerForEvent(registrationLink) {
    if (registrationLink) {
        window.open(registrationLink, '_blank');
    } else {
        showErrorMessage('Registration link not available. Please contact event coordinators.');
    }
}

// Add click effects to buttons
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn') || e.target.closest('.btn')) {
        const button = e.target.matches('.btn') ? e.target : e.target.closest('.btn');
        
        // Create ripple effect
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
        
        // Add ripple animation styles if not present
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

// Performance optimization
document.addEventListener('DOMContentLoaded', function() {
    // Lazy load images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
});

// Enhanced interactive effects
function initializeInteractiveEffects() {
    // Add ripple effect to buttons
    addRippleEffect();
    
    // Add hover animations to cards
    addCardHoverEffects();
    
    // Add scroll animations
    addScrollAnimations();
    
    // Add navigation effects
    addNavigationEffects();
    
    // Add form interactions
    addFormEffects();
}

// Ripple effect for buttons
function addRippleEffect() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        if (!button.classList.contains('btn-ripple')) {
            button.classList.add('btn-ripple');
        }
        
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                width: 0;
                height: 0;
                animation: ripple-expand 0.6s linear;
            `;
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
}

// Enhanced card hover effects
function addCardHoverEffects() {
    const cards = document.querySelectorAll('.event-card');
    
    cards.forEach(card => {
        // Add zoom hover to images
        const img = card.querySelector('img');
        if (img) {
            card.classList.add('zoom-hover');
        }
        
        // Add tilt effect on mouse move
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
}

// Scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('fade-in-scale');
                
                // Add stagger effect for cards in the same container
                const container = element.closest('.events-grid');
                if (container) {
                    const cards = container.querySelectorAll('.event-card');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.classList.add('fade-in-scale');
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.event-card, .section, .hero-content').forEach(el => {
        observer.observe(el);
    });
}

// Navigation effects
function addNavigationEffects() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Add active state handling
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-link[href^="#"]');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

// Form effects
function addFormEffects() {
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        // Focus effects
        input.addEventListener('focus', function() {
            const parent = this.closest('.form-group') || this.parentNode;
            parent.classList.add('focused');
            this.classList.add('glow-on-hover');
        });
        
        input.addEventListener('blur', function() {
            const parent = this.closest('.form-group') || this.parentNode;
            parent.classList.remove('focused');
            this.classList.remove('glow-on-hover');
            
            // Validation feedback
            if (this.value && this.checkValidity && this.checkValidity()) {
                this.classList.add('valid');
                this.classList.remove('invalid');
            } else if (this.value) {
                this.classList.add('invalid');
                this.classList.remove('valid');
                this.classList.add('shake');
                setTimeout(() => this.classList.remove('shake'), 500);
            }
        });
        
        // Real-time validation
        input.addEventListener('input', function() {
            if (this.value && this.checkValidity) {
                if (this.checkValidity()) {
                    this.classList.add('valid');
                    this.classList.remove('invalid');
                } else {
                    this.classList.add('invalid');
                    this.classList.remove('valid');
                }
            } else {
                this.classList.remove('valid', 'invalid');
            }
        });
    });
}

// Initialize enhanced effects after DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeInteractiveEffects();
    initializeNavbarScroll();
    initializeAdminAccess();
});

// Admin access functionality (Ctrl+Shift+A to show admin link)
function initializeAdminAccess() {
    const adminLink = document.querySelector('.admin-link');
    
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            if (adminLink.style.display === 'none') {
                adminLink.style.display = 'block';
                // Show notification
                showToast('Admin access enabled', 'info');
            } else {
                adminLink.style.display = 'none';
                showToast('Admin access hidden', 'info');
            }
        }
    });
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'info' ? '#007AFF' : '#10B981'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Navbar scroll effect
function initializeNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Add CSS for additional effects
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = `
    @keyframes ripple-expand {
        0% {
            width: 0;
            height: 0;
            opacity: 1;
        }
        100% {
            width: 100px;
            height: 100px;
            opacity: 0;
            margin-left: -50px;
            margin-top: -50px;
        }
    }
    
    input.valid, textarea.valid {
        border-color: #10B981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }
    
    input.invalid, textarea.invalid {
        border-color: #EF4444;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
    
    .focused {
        transform: translateY(-2px);
        transition: transform 0.2s ease;
    }
    
    .nav-link.active {
        color: var(--primary-color);
        font-weight: 600;
    }
    
    .nav-link.active::after {
        width: 100%;
    }
    
    /* Parallax effect for hero section */
    .hero {
        background-attachment: fixed;
        background-position: center;
        background-repeat: no-repeat;
        background-size: cover;
    }
    
    /* Smooth scrollbar */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: var(--surface-color);
    }
    
    ::-webkit-scrollbar-thumb {
        background: var(--primary-color);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: var(--primary-dark);
    }
    
    /* Toast animations */
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(enhancedStyle);

// Error boundary for JavaScript errors
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Optionally show user-friendly error message
});

// Service worker registration for PWA capabilities (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Initialize section transitions
function initializeSectionTransitions() {
    const sections = document.querySelectorAll('.events-section, .about-section, .contact-section');
    
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add animation class when section comes into view
                entry.target.classList.add('section-in-view');
                
                // Add subtle slide-in animation to section title
                const title = entry.target.querySelector('.section-title');
                if (title && !title.classList.contains('title-animated')) {
                    title.classList.add('title-animated');
                }
                
                // Add stagger animation to cards/content
                const cards = entry.target.querySelectorAll('.event-card, .coordinator-card');
                cards.forEach((card, index) => {
                    if (!card.classList.contains('card-animated')) {
                        setTimeout(() => {
                            card.classList.add('card-animated');
                        }, index * 150); // Staggered by 150ms
                    }
                });
            }
        });
    }, observerOptions);
    
    sections.forEach(section => {
        sectionObserver.observe(section);
    });
}



// Fetch stats from Firebase/admin panel
async function fetchStatsFromDatabase() {
    try {
        // Try to fetch from site configuration first
        const siteConfigDoc = await db.collection('siteConfig').doc('main').get();
        
        if (siteConfigDoc.exists) {
            const config = siteConfigDoc.data();
            return {
                events: parseInt(config.eventsCount) || 6,
                participants: parseInt(config.participantsCount) || 1000,
                colleges: parseInt(config.collegesCount) || 50
            };
        } else {
            // Fallback: calculate from actual data
            const eventsSnapshot = await db.collection('events').get();
            const eventsCount = eventsSnapshot.size;
            
            return {
                events: eventsCount || 6,
                participants: 1000, // Default fallback
                colleges: 50 // Default fallback
            };
        }
    } catch (error) {
        console.warn('Error fetching stats from database:', error);
        // Return default values as fallback
        return {
            events: 6,
            participants: 1000,
            colleges: 50
        };
    }
}

// Stats counter animation
async function initializeStatsCounters() {
    // Fetch dynamic targets from database
    const targets = await fetchStatsFromDatabase();
    
    const stats = [
        { id: 'events-count', target: targets.events, suffix: '+', duration: 3000 },
        { id: 'participants-count', target: targets.participants, suffix: '+', duration: 3000 },
        { id: 'colleges-count', target: targets.colleges, suffix: '+', duration: 3000 }
    ];

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-50px 0px 0px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statsSection = entry.target;
                if (!statsSection.classList.contains('stats-animated')) {
                    statsSection.classList.add('stats-animated');
                    
                    // Animate all counters with staggered timing
                    stats.forEach((statConfig, index) => {
                        const element = document.getElementById(statConfig.id);
                        if (element && !element.classList.contains('animated')) {
                            setTimeout(() => {
                                element.classList.add('animated');
                                animateCounter(element, statConfig);
                            }, index * 200); // Stagger by 200ms each
                        }
                    });
                }
            }
        });
    }, observerOptions);

    // Observe the stats section
    const statsSection = document.getElementById('stats') || document.querySelector('.stats-section');
    if (statsSection) {
        observer.observe(statsSection);
    } else {
        // Fallback: observe individual elements if section not found
        stats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                observer.observe(element);
            }
        });
    }
}

function animateCounter(element, config) {
    const startTime = performance.now();
    const startValue = 0; // Start from 0 for full effect
    const targetValue = config.target;
    const duration = config.duration;
    
    // Set initial value
    element.textContent = startValue + config.suffix;
    
    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Custom timing curve: 0->20% medium speed, 20->75% fast, 75->100% gradually decreasing
        let easedProgress;
        if (progress <= 0.2) {
            // 0-20%: Medium speed (linear)
            easedProgress = progress * 2.5; // Scale to reach 0.5 at 20%
        } else if (progress <= 0.75) {
            // 20-75%: Fast speed (accelerated)
            const localProgress = (progress - 0.2) / 0.55; // Map 20-75% to 0-1
            easedProgress = 0.5 + (localProgress * localProgress) * 0.4; // Reach 0.9 at 75%
        } else {
            // 75-100%: Gradually decreasing speed (decelerated)
            const localProgress = (progress - 0.75) / 0.25; // Map 75-100% to 0-1
            const decelerated = 1 - Math.pow(1 - localProgress, 3); // Smooth deceleration
            easedProgress = 0.9 + decelerated * 0.1; // Complete the remaining 10%
        }
        
        const currentValue = Math.floor(startValue + (targetValue - startValue) * easedProgress);
        element.textContent = currentValue + config.suffix;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = targetValue + config.suffix;
        }
    }
    
    requestAnimationFrame(updateCounter);
}

// Get default events data when Firebase is not available
function getDefaultEvents() {
    // Return empty array - events should be loaded from Firestore via admin panel
    return [];
}