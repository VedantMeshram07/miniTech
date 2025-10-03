// Admin Login JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

// Initialize login functionality
function initializeLogin() {
    // Check if user is already logged in
    if (window.auth) {
        window.auth.onAuthStateChanged(user => {
            if (user) {
                // User is signed in, redirect to dashboard
                window.location.href = 'dashboard.html';
            }
        });
    }
    
    // Setup form handlers
    setupLoginForm();
    setupForgotPasswordForm();
}

// Setup login form
function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    const loginBtn = document.querySelector('.login-btn');
    setLoading(loginBtn, true);
    
    try {
        console.log('🔐 Attempting admin login...');
        
        // Wait for Firebase to be initialized
        if (!window.auth) {
            throw new Error('Firebase Authentication not available');
        }
        
        // Authenticate with Firebase
        if (!window.auth) {
            console.error('Firebase Auth not available');
            console.error('window.auth:', window.auth);
            console.error('Firebase SDK loaded?', typeof firebase !== 'undefined');
            throw new Error('Firebase authentication not available. Please check your Firebase configuration and ensure the SDK is loaded properly.');
        }
        
        console.log('Attempting login with email:', email);
        const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
        
        if (rememberMe) {
            localStorage.setItem('adminRememberMe', 'true');
        } else {
            localStorage.removeItem('adminRememberMe');
        }
        
        showSuccess('Login successful! Redirecting...');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address. Please check if you created this user in Firebase Console.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Incorrect password. Please try again.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Too many failed attempts. Please try again later.';
        } else if (error.code === 'auth/configuration-not-found') {
            errorMessage = 'Firebase Authentication not properly configured. Please check your Firebase project settings.';
        } else if (error.code === 'auth/api-key-not-valid') {
            errorMessage = 'Invalid Firebase API key. Please check your Firebase configuration.';
        } else if (error.code === 'auth/network-request-failed') {
            errorMessage = 'Network error. Please check your internet connection and Firebase project status.';
        } else if (error.message && error.message.includes('Firebase authentication not available')) {
            errorMessage = 'Firebase authentication not configured. Please check your setup and ensure all Firebase scripts are loaded.';
        }
        
        showError(errorMessage);
    } finally {
        setLoading(loginBtn, false);
    }
}

// Setup forgot password form
function setupForgotPasswordForm() {
    const forgotForm = document.getElementById('forgot-password-form');
    
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }
}

// Handle forgot password
async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('reset-email').value.trim();
    
    if (!email) {
        showError('Please enter your email address');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    setLoading(submitBtn, true);
    
    try {
        if (!window.auth) {
            throw new Error('Firebase authentication not available');
        }
        
        await window.auth.sendPasswordResetEmail(email);
        showSuccess('Password reset email sent! Check your inbox.');
        closeForgotPassword();
    } catch (error) {
        console.error('Password reset error:', error);
        
        let errorMessage = 'Failed to send reset email. Please try again.';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'No account found with this email address.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address format.';
        }
        
        showError(errorMessage);
    } finally {
        setLoading(submitBtn, false);
    }
}



// Password visibility toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordIcon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        passwordIcon.className = 'fas fa-eye';
    }
}

// Modal functions
function showForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    modal.classList.add('active');
    
    // Focus on email input
    setTimeout(() => {
        document.getElementById('reset-email').focus();
    }, 300);
}

function closeForgotPassword() {
    const modal = document.getElementById('forgot-password-modal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('forgot-password-form').reset();
}

// Loading state management
function setLoading(button, loading) {
    if (loading) {
        button.classList.add('loading');
        button.disabled = true;
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Toast notification functions
function showError(message) {
    showToast(message, 'error');
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showInfo(message) {
    showToast(message, 'info');
}

function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
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
    
    // Add styles dynamically
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
    
    // Add animation styles if not present
    if (!document.querySelector('#toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    // Auto remove after delay
    const delay = type === 'error' ? 5000 : 3000;
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, delay);
    
    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    });
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Enter key on forgot password modal
    if (e.key === 'Enter') {
        const modal = document.getElementById('forgot-password-modal');
        if (modal.classList.contains('active')) {
            const submitBtn = modal.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
            }
        }
    }
    
    // Escape key to close modals
    if (e.key === 'Escape') {
        closeForgotPassword();
    }
});

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    const modal = document.getElementById('forgot-password-modal');
    if (e.target === modal) {
        closeForgotPassword();
    }
});

// Form validation enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Real-time email validation
    const emailInput = document.getElementById('email');
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            const email = this.value.trim();
            if (email && !isValidEmail(email)) {
                this.style.borderColor = 'var(--accent-color)';
                showError('Please enter a valid email address');
            } else {
                this.style.borderColor = '';
            }
        });
    }
    
    // Password strength indicator (optional)
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            // Reset border color on input
            this.style.borderColor = '';
        });
    }
});

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Auto-fill from remember me
window.addEventListener('load', function() {
    if (localStorage.getItem('adminRememberMe') === 'true') {
        document.getElementById('remember-me').checked = true;
        
        // If demo mode, auto-fill credentials
        if (localStorage.getItem('demoAdmin') === 'true') {
            document.getElementById('email').value = 'admin@techfest.demo';
        }
    }
});

// Security enhancements
// Prevent multiple login attempts
let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 300000; // 5 minutes

function checkLoginAttempts() {
    const lockoutTime = localStorage.getItem('loginLockout');
    if (lockoutTime && Date.now() < parseInt(lockoutTime)) {
        const remainingTime = Math.ceil((parseInt(lockoutTime) - Date.now()) / 60000);
        showError(`Too many failed login attempts. Please try again in ${remainingTime} minutes.`);
        return false;
    }
    
    if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockoutEnd = Date.now() + LOCKOUT_TIME;
        localStorage.setItem('loginLockout', lockoutEnd.toString());
        showError('Too many failed login attempts. Account temporarily locked.');
        return false;
    }
    
    return true;
}

function recordFailedLogin() {
    loginAttempts++;
    localStorage.setItem('loginAttempts', loginAttempts.toString());
}

function resetLoginAttempts() {
    loginAttempts = 0;
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('loginLockout');
}

// Load previous login attempts on page load
window.addEventListener('load', function() {
    const savedAttempts = localStorage.getItem('loginAttempts');
    if (savedAttempts) {
        loginAttempts = parseInt(savedAttempts);
    }
});

// Clear sensitive data on page unload
window.addEventListener('beforeunload', function() {
    // Clear form data for security
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.value = '';
    }
});