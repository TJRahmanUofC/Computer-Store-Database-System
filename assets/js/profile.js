document.addEventListener("DOMContentLoaded", function () {
    const nameField = document.getElementById("user-name");
    const emailField = document.getElementById("user-email");
    const phoneField = document.getElementById("user-phone");
    const addressField = document.getElementById("user-address");
    const statusMessage = document.getElementById("status-message");

    // 🔄 Load user profile info
    fetch("http://127.0.0.1:5000/api/user", {
        method: "GET",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const user = data.user;
            nameField.textContent = user.name;
            emailField.textContent = user.email;
            phoneField.textContent = user.phone;
            addressField.textContent = user.address;
        } else {
            alert("You must be logged in to view your profile.");
            window.location.href = "login.html";
        }
    })
    .catch(error => {
        console.error("Error fetching user:", error);
        alert("Unable to load profile.");
    });

    // 🔐 Password change
    const form = document.getElementById("change-password-form");
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;

        if (newPassword.length < 6) {
            statusMessage.textContent = "New password must be at least 6 characters.";
            statusMessage.style.color = "red";
            return;
        }

        fetch("http://127.0.0.1:5000/api/user/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                statusMessage.textContent = "Password updated successfully!";
                statusMessage.style.color = "green";
                form.reset();
            } else {
                statusMessage.textContent = data.message || "Failed to update password.";
                statusMessage.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            statusMessage.textContent = "Server error. Try again.";
            statusMessage.style.color = "red";
        });
    });

    const toggleButton = document.getElementById("toggle-password-form");
    const passwordForm = document.getElementById("change-password-form");

    toggleButton.addEventListener("click", function () {
        if (passwordForm.style.display === "none" || passwordForm.style.display === "") {
            passwordForm.style.display = "block";
            toggleButton.textContent = "Hide Password Form";
        } else {
            passwordForm.style.display = "none";
            toggleButton.textContent = "Change Password";
        }
    });
});
