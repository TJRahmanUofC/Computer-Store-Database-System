document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("change-password-form");
    const message = document.getElementById("status-message");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const currentPassword = document.getElementById("current-password").value;
        const newPassword = document.getElementById("new-password").value;

        if (newPassword.length < 6) {
            message.textContent = "New password must be at least 6 characters.";
            message.style.color = "red";
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
                message.textContent = "Password updated successfully!";
                message.style.color = "green";
                form.reset();
            } else {
                message.textContent = data.message || "Failed to update password.";
                message.style.color = "red";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            message.textContent = "Server error. Try again.";
            message.style.color = "red";
        });
    });
});
