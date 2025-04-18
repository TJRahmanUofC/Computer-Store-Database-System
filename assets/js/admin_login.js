function validateAdminLogin(event) {
    event.preventDefault(); // Prevent form submission

    const username = document.getElementById("admin-username").value;
    const password = document.getElementById("admin-password").value;

    // Fetch admin credentials from the backend
    fetch('http://127.0.0.1:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employee_id: username, password }),
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Login successful!");
                window.location.href = "admin_dashboard.html"; // Redirect to admin dashboard
            } else {
                alert(data.message || "Invalid username or password. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again later.");
        });
}
