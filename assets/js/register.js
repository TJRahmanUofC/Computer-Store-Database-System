document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("register-form");
    const registerError = document.getElementById("register-error");

    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("reg-name").value;
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;
        const address = document.getElementById("reg-address").value;

        fetch('http://127.0.0.1:5000/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, address })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Registration successful! You can now log in.");
                    window.location.href = "login.html";
                } else {
                    registerError.textContent = data.message || "Registration failed. Please try again.";
                }
            })
            .catch(error => {
                console.error("Error during registration:", error);
                registerError.textContent = "An error occurred. Please try again later.";
            });
    });
});
