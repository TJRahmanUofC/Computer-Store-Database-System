function validateAdminLogin(event) {
    event.preventDefault(); // Prevent form submission

    // Get Employee ID and Password from the form
    const employee_id = document.getElementById("admin-employee-id").value; 
    const password = document.getElementById("admin-password").value;

    // Send credentials to the backend API
    fetch("http://127.0.0.1:5000/api/admin/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ employee_id, password }), // Send employee_id and password
        credentials: 'include' // Include if session cookies are needed for admin
    })
    .then(response => {
        if (!response.ok) {
            // Attempt to parse error message from backend if available
            return response.json().then(errData => {
                throw new Error(errData.message || `Login failed: ${response.status} ${response.statusText}`);
            }).catch(() => {
                // Fallback if response is not JSON or parsing fails
                throw new Error(`Login failed: ${response.status} ${response.statusText}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) { // Assuming the backend returns { success: true } on successful login
            alert("Login successful!");
            window.location.href = "dashboard.html"; // Redirect to dashboard on success
        } else {
            // Display the error message from the backend response
            alert(data.message || "Invalid username or password. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error during admin login:", error);
        // Display the error message caught during fetch or processing
        alert(`An error occurred: ${error.message}. Please try again later.`);
    });
}
