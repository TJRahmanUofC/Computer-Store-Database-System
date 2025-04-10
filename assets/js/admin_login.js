function validateAdminLogin(event) {
    event.preventDefault(); // Prevent form submission

    // setup for login temporary until we decide how we want to handle admin login
    const username = document.getElementById("admin-username").value; // utilizing employee name as username for login
    const password = document.getElementById("admin-password").value; // utilizing employee id as password for login

    // Fetch employee credentials from mockup.json
    fetch("../mockup.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load employee data: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            const employee = data.EMPLOYEE.find(
                emp => emp.NAME === username && emp.EMPLOYEE_ID.toString() === password
            );

            if (employee) {
                alert("Login successful!");
                window.location.href = "dashboard.html"; // redirect to dashboard.html
            } else {
                alert("Invalid username or password. Please try again.");
            }
        })
        .catch(error => {
            console.error("Error during login:", error);
            alert("An error occurred. Please try again later.");
        });
}