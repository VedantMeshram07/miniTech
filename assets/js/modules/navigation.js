/**
 * Navigation Module
 * Handles navigation interactions, scroll effects, and mobile menu
 */

/**
 * Initialize navigation functionality
 */
export function initializeNavigation() {
    console.log('🧭 Initializing navigation...');
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize active section highlighting
    initializeActiveSectionHighlighting();
    
    console.log('✅ Navigation initialized successfully');
}

/**
 * Initialize scroll effects for navbar
 */
function initializeScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) {
        console.warn('Navbar element not found');
        return;
    }
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        const currentScrollY = window.scrollY;
        
        // Add/remove scrolled class based on scroll position
        if (currentScrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar based on scroll direction (optional feature)
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            // Scrolling down - hide navbar
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show navbar
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    // Add scroll listener with throttling
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial call
    updateNavbar();
}

/**
 * Initialize mobile menu functionality
 */
function initializeMobileMenu() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!navToggle || !navMenu) {
        console.warn('Mobile menu elements not found');
        return;
    }
    
    let isMenuOpen = false;
    
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Toggle classes
        navToggle.classList.toggle('active', isMenuOpen);
        navMenu.classList.toggle('active', isMenuOpen);
        document.body.classList.toggle('menu-open', isMenuOpen);
        
        // Update ARIA attributes for accessibility
        navToggle.setAttribute('aria-expanded', isMenuOpen);
        navMenu.setAttribute('aria-hidden', !isMenuOpen);
    }
    
    // Toggle menu on button click
    navToggle.addEventListener('click', toggleMenu);
    
    // Close menu when clicking nav links
    const navLinks = navMenu.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            toggleMenu();
        }
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && isMenuOpen) {
            toggleMenu();
        }
    });
}

/**
 * Initialize smooth scrolling for internal links
 */
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Initialize active section highlighting based on scroll position
 */
function initializeActiveSectionHighlighting() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = document.querySelectorAll('section[id], .hero[id]');
    
    if (navLinks.length === 0 || sections.length === 0) {
        return;
    }
    
    let ticking = false;
    
    function updateActiveSection() {
        const scrollPosition = window.scrollY + 100; // Offset for navbar
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        // Update active nav link
        navLinks.forEach(link => {
            const href = link.getAttribute('href').substring(1);
            link.classList.toggle('active', href === currentSection);
        });
        
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateActiveSection);
            ticking = true;
        }
    }
    
    // Add scroll listener
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // Initial call
    updateActiveSection();
}

/**
 * Show/hide navigation based on scroll direction
 * @param {boolean} show - Whether to show the navbar
 */
export function toggleNavbarVisibility(show = true) {
    const navbar = document.querySelector('.navbar');
    
    if (navbar) {
        navbar.style.transform = show ? 'translateY(0)' : 'translateY(-100%)';
    }
}

/**
 * Update navigation logo and title
 * @param {Object} siteConfig - Site configuration
 */
export function updateNavigationContent(siteConfig) {
    try {
        // Update navigation title
        const navTitle = document.getElementById('nav-typography-name');
        if (navTitle && siteConfig.title) {
            navTitle.textContent = siteConfig.title;
        }
        
        // Update college name in event details page
        const navCollegeName = document.getElementById('nav-college-name');
        if (navCollegeName && siteConfig.collegeName) {
            navCollegeName.textContent = siteConfig.collegeName;
        }
        
        console.log('✅ Navigation content updated');
    } catch (error) {
        console.error('Error updating navigation content:', error);
    }
}

/**
 * Highlight navigation link
 * @param {string} sectionId - Section ID to highlight
 */
export function highlightNavLink(sectionId) {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${sectionId}`) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Add scroll-to-top functionality
 */
export function initializeScrollToTop() {
    // Create scroll-to-top button if it doesn't exist
    let scrollTopBtn = document.getElementById('scroll-top-btn');
    
    if (!scrollTopBtn) {
        scrollTopBtn = document.createElement('button');
        scrollTopBtn.id = 'scroll-top-btn';
        scrollTopBtn.className = 'scroll-top-btn';
        scrollTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
        scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
        scrollTopBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border: none;
            border-radius: 50%;
            background: var(--gradient-primary);
            color: white;
            font-size: 18px;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 1000;
        `;
        document.body.appendChild(scrollTopBtn);
    }
    
    // Show/hide button based on scroll position
    function toggleScrollTopButton() {
        if (window.scrollY > 300) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    }
    
    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Listen for scroll events
    window.addEventListener('scroll', toggleScrollTopButton, { passive: true });
    
    // Initial check
    toggleScrollTopButton();
}