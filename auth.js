// Authentication System for Lexio AI
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('lexio_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('lexio_current_user')) || null;
    }

    // Save users to localStorage
    saveUsers() {
        localStorage.setItem('lexio_users', JSON.stringify(this.users));
    }

    // Save current user session
    saveCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('lexio_current_user', JSON.stringify(user));
    }

    // Clear current user session
    clearCurrentUser() {
        this.currentUser = null;
        localStorage.removeItem('lexio_current_user');
    }

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate password strength
    isValidPassword(password) {
        return password.length >= 6;
    }

    // Check if user exists
    userExists(email) {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
    }

    // Register new user
    register(fullName, email, password, confirmPassword) {
        // Validation
        if (!fullName.trim()) {
            return { success: false, message: 'Full name is required' };
        }

        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!this.isValidPassword(password)) {
            return { success: false, message: 'Password must be at least 6 characters long' };
        }

        if (password !== confirmPassword) {
            return { success: false, message: 'Passwords do not match' };
        }

        if (this.userExists(email)) {
            return { success: false, message: 'An account with this email already exists' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            fullName: fullName.trim(),
            email: email.toLowerCase().trim(),
            password: password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        // Auto-login after registration
        this.saveCurrentUser({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email
        });

        return { success: true, message: 'Account created successfully!', user: newUser };
    }

    // Login user
    login(email, password, rememberMe = false) {
        if (!this.isValidEmail(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }

        if (!password) {
            return { success: false, message: 'Password is required' };
        }

        const user = this.userExists(email);
        if (!user) {
            return { success: false, message: 'No account found with this email address' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Incorrect password' };
        }

        // Save user session
        this.saveCurrentUser({
            id: user.id,
            fullName: user.fullName,
            email: user.email
        });

        if (rememberMe) {
            localStorage.setItem('lexio_remember_me', 'true');
        }

        return { success: true, message: 'Login successful!', user: user };
    }

    // Logout user
    logout() {
        this.clearCurrentUser();
        localStorage.removeItem('lexio_remember_me');
        return { success: true, message: 'Logged out successfully' };
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessage = document.querySelector('.auth-message');
        if (existingMessage) {
            existingMessage.remove();
        }

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `auth-message auth-message-${type}`;
        messageDiv.textContent = message;

        // Insert message at the top of the form
        const form = document.querySelector('.auth-form');
        if (form) {
            form.insertBefore(messageDiv, form.firstChild);
        }

        // Auto-remove message after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize auth system
const auth = new AuthSystem();

// Form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in and redirect if on auth pages
    if (auth.isLoggedIn() && (window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html'))) {
        window.location.href = 'home.html';
        return;
    }

    // Registration form handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsAccepted = document.getElementById('terms').checked;

            if (!termsAccepted) {
                auth.showMessage('Please accept the Terms of Service and Privacy Policy', 'error');
                return;
            }

            const result = auth.register(fullName, email, password, confirmPassword);
            
            if (result.success) {
                auth.showMessage(result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                auth.showMessage(result.message, 'error');
            }
        });
    }

    // Login form handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const rememberMe = document.getElementById('rememberMe').checked;

            const result = auth.login(email, password, rememberMe);
            
            if (result.success) {
                auth.showMessage(result.message, 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } else {
                auth.showMessage(result.message, 'error');
            }
        });
    }

    // Check authentication on home page
    if (window.location.pathname.includes('home.html')) {
        if (!auth.isLoggedIn()) {
            window.location.href = 'index.html';
            return;
        }

        // Display user info if on home page
        const user = auth.getCurrentUser();
        if (user) {
            // Update any user-specific elements
            const userElements = document.querySelectorAll('.user-name');
            userElements.forEach(el => el.textContent = user.fullName);
        }
    }
});
