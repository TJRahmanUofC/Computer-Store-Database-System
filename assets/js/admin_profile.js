document.addEventListener("DOMContentLoaded", function () {
    const nameField = document.getElementById("admin-name");
    const idField = document.getElementById("admin-id");
    const roleField = document.getElementById("admin-role");
    const statusMessage = document.getElementById("status-message");
    const storeField = document.getElementById("admin-store");

    // 🔄 Load admin profile info
    fetch("http://127.0.0.1:5000/api/admin/profile", { // Changed endpoint
        method: "GET",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (data.success && data.admin) {
            const admin = data.admin;
            nameField.textContent = admin.name;
            idField.textContent = admin.employee_id;
            roleField.textContent = admin.role;
            storeField.textContent = admin.store_id;
        } else {
            alert("You must be logged in to view your profile.");
            window.location.href = "admin_login.html";
        }
    })
    .catch(error => {
        console.error("Error fetching admin profile:", error);
        alert("Unable to load profile.");
    });

    // 🔐 Password change logic
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

        fetch("http://127.0.0.1:5000/api/admin/change-password", {
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
            console.error("Error updating password:", error);
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
