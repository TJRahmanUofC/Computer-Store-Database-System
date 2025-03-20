document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById("logout-button");
    const loginHeading = document.getElementById("login-heading");
    const registerLink = document.getElementById("register-link");
    const loginError = document.getElementById("login-error");

    // Check login state
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (isLoggedIn === "true") {
        // User is logged in, show logout button
        loginForm.style.display = "none";
        logoutButton.style.display = "block";
        loginHeading.textContent = "You are already logged in.";
        registerLink.style.display = "none";
    } else {
        // User is not logged in, show login form
        loginForm.style.display = "block";
        logoutButton.style.display = "none";
        loginHeading.textContent = "Login";
        registerLink.style.display = "block";
    }

    // Handle login form submission
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Get stored user data
        let users = JSON.parse(localStorage.getItem("users")) || [];

        let validUser = users.find(user => user.email === email && user.password === password);

        if (validUser) {
            localStorage.setItem("loggedInUser", JSON.stringify(validUser));
            localStorage.setItem("isLoggedIn", "true");

            // Check if the user was redirected for checkout
            const urlParams = new URLSearchParams(window.location.search);
            const redirectPage = urlParams.get("redirect");

            if (redirectPage) {
                window.location.href = redirectPage; // Send back to checkout
            } else {
                window.location.href = "../index.html"; // Default redirect to homepage
            }
        } else {
            loginError.textContent = "Invalid email or password. Please try again.";
        }
    });

    // Handle logout button click
    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("loggedInUser");
        alert("You have been logged out.");
        window.location.href = "../index.html"; // Redirect to home page
    });
});
