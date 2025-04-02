function validateAdminLogin(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    // Fetch admin credentials from mockup.json
    fetch("../mockup.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load admin data");
            }
            return response.json();
        })
        .then(data => {
            const admin = data.ADMIN.find(
                admin => admin.USERNAME === username && admin.PASSWORD === password
            );

            if (admin) {
                alert("Login successful!");
                window.location.href = "admin_dashboard.html"; // Redirect to admin dashboard
            } else {
                alert("Invalid username or password. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again later.");
        });
}