document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const registerError = document.getElementById("register-error");

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        let users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if email already exists
        if (users.find(user => user.email === email)) {
            registerError.textContent = "Email already registered!";
            return;
        }

        // Store new user
        users.push({ email, password });
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful! You can now log in.");
        window.location.href = "login.html";
    });
});
