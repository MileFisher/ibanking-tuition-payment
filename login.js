// login.js - Handles login form submission and validation

document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const loginBtn = loginForm.querySelector('button[type="submit"]');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Clear any previous error messages
        hideError();

        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!username || !password) {
            showError('Please enter both username and password');
            return;
        }

        // Disable button and show loading state
        setLoadingState(true);

        try {
            // Send login request to backend
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in sessionStorage
                sessionStorage.setItem('user', JSON.stringify(data.user));
                sessionStorage.setItem('token', data.token || 'session_' + Date.now());

                // Redirect to payment page
                window.location.href = 'payment_form.html';
            } else {
                // Show error message
                showError(data.message || 'Invalid username or password');
            }

        } catch (error) {
            console.error('Login error:', error);
            showError('Connection error. Please check if XAMPP is running and try again.');
        } finally {
            // Re-enable button
            setLoadingState(false);
        }
    });

    // Helper function to show error messages
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Auto-hide error after 5 seconds
        setTimeout(hideError, 5000);
    }

    // Helper function to hide error messages
    function hideError() {
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    }

    // Helper function to set loading state
    function setLoadingState(loading) {
        if (loading) {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="loading"></span>Logging in...';
        } else {
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'Login';
        }
    }

    // Add Enter key support for better UX
    document.getElementById('password').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});