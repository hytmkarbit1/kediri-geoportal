// Authentication Module
import { supabase, getCurrentUser, getUserRole, isAdmin } from '../config/supabase.js';

let currentUser = null;
let currentRole = 'anonymous';

// Initialize auth state
export async function initAuth() {
    currentUser = await getCurrentUser();
    if (currentUser) {
        currentRole = await getUserRole();
        updateUIForAuthState();
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth state changed:', event);
        currentUser = session?.user || null;
        if (currentUser) {
            currentRole = await getUserRole();
        } else {
            currentRole = 'anonymous';
        }
        updateUIForAuthState();
    });
}

// Sign up new user
export async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    // Create default public role for new user
    if (data.user) {
        const { error: roleError } = await supabase
            .from('user_roles')
            .insert({ user_id: data.user.id, role: 'public' });

        if (roleError) {
            console.error('Error creating user role:', roleError);
        }
    }

    return data;
}

// Sign in existing user
export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        throw error;
    }

    return data;
}

// Sign out
export async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
        throw error;
    }
    currentUser = null;
    currentRole = 'anonymous';
    updateUIForAuthState();
}

// Get current auth state
export function getAuthState() {
    return {
        user: currentUser,
        role: currentRole,
        isAuthenticated: !!currentUser,
        isAdmin: currentRole === 'admin'
    };
}

// Update UI based on auth state
function updateUIForAuthState() {
    const authState = getAuthState();

    // Update auth panel
    const authPanel = document.getElementById('auth-panel');
    const userInfo = document.getElementById('user-info');
    const loginForm = document.getElementById('login-form');

    if (authState.isAuthenticated) {
        loginForm.style.display = 'none';
        userInfo.style.display = 'block';
        document.getElementById('user-email').textContent = authState.user.email;
        document.getElementById('user-role').textContent = authState.role.toUpperCase();

        // Show/hide role-specific elements
        document.querySelectorAll('.admin-only').forEach(el => {
            el.style.display = authState.isAdmin ? 'block' : 'none';
        });

        document.querySelectorAll('.auth-only').forEach(el => {
            el.style.display = 'block';
        });
    } else {
        loginForm.style.display = 'block';
        userInfo.style.display = 'none';

        document.querySelectorAll('.admin-only, .auth-only').forEach(el => {
            el.style.display = 'none';
        });
    }

    // Dispatch custom event for other modules
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: authState }));
}

// Handle login form submission
export function setupAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const logoutBtn = document.getElementById('logout-btn');

    loginBtn?.addEventListener('click', async () => {
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;

        try {
            await signIn(email, password);
            showMessage('Logged in successfully!', 'success');
        } catch (error) {
            showMessage('Login failed: ' + error.message, 'error');
        }
    });

    signupBtn?.addEventListener('click', async () => {
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;

        try {
            await signUp(email, password);
            showMessage('Account created! Please check your email to verify.', 'success');
        } catch (error) {
            showMessage('Signup failed: ' + error.message, 'error');
        }
    });

    logoutBtn?.addEventListener('click', async () => {
        try {
            await signOut();
            showMessage('Logged out successfully!', 'success');
        } catch (error) {
            showMessage('Logout failed: ' + error.message, 'error');
        }
    });
}

// Show message to user
function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message-display');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';

        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    } else {
        alert(message);
    }
}
