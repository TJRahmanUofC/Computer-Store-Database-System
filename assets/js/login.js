document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById("logout-button");
    const loginHeading = document.getElementById("login-heading");
    const registerLink = document.getElementById("register-link");
    const loginError = document.getElementById("login-error");

    // Check login state
    fetch('http://127.0.0.1:5000/api/user', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // User is logged in
                loginForm.style.display = "none";
                logoutButton.style.display = "block";
                loginHeading.textContent = `Welcome, ${data.user.name}`;
                registerLink.style.display = "none";
            } else {
                // User is not logged in
                loginForm.style.display = "block";
                logoutButton.style.display = "none";
                loginHeading.textContent = "Login";
                registerLink.style.display = "block";
            }
        });

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // --- Add check to verify session immediately ---
                    fetch('http://127.0.0.1:5000/api/user', { method: 'GET', credentials: 'include' })
                        .then(userResp => userResp.json())
                        .then(userData => {
                            if (userData.success) {
                                console.log("Session check successful after login:", userData.user);
                                alert("Login successful!");
                                window.location.href = "../index.html"; // Redirect on success
                            } else {
                                console.error("Session check FAILED after login:", userData.message);
                                alert("Login seemed successful, but session check failed. Please contact support.");
                                // Don't redirect if session check fails
                            }
                        })
                        .catch(err => {
                             console.error("Error checking session after login:", err);
                             alert("An error occurred verifying login status.");
                        });
                    // --- End added check ---
                } else {
                    loginError.textContent = data.message || "Invalid email or password.";
                }
            })
            .catch(error => {
                console.error("Error during login:", error);
                loginError.textContent = "An error occurred. Please try again later.";
            });
    });

    // Handle logout button click
    logoutButton.addEventListener("click", function () {
        fetch('http://127.0.0.1:5000/api/logout', { method: 'POST', credentials: 'include' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("You have been logged out.");
                    window.location.href = "../index.html";
                }
            })
            .catch(error => {
                console.error("Error during logout:", error);
            });
    });

    // Function to update cart count (moved outside DOMContentLoaded)
    updateCartCount();
});

// Function to update cart count (moved outside DOMContentLoaded)
function updateCartCount() {
    // Fetch cart count from the backend
    fetch('http://127.0.0.1:5000/api/cart/count', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let cartCountElement = document.getElementById("cart-count");
                if (cartCountElement) {
                    cartCountElement.textContent = `Cart (${data.count})`;
                }
            } else {
                console.error("Failed to fetch cart count:", data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching cart count:", error);
        });
}

