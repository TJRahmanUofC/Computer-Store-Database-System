document.addEventListener("DOMContentLoaded", function () {
    // STEP 1: Restrict access to admin only
    fetch('http://127.0.0.1:5000/api/admin/dashboard', {
        method: "GET",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success || !data.admin || data.admin.role.toLowerCase() !== 'manager') {
            alert("Access denied: Only admin can manage employees.");
            window.location.href = "dashboard.html";
            return;
        }

        // Proceed only if admin
        initializeEmployeeManagement();
    })
    .catch(err => {
        console.error("Error verifying admin role:", err);
        alert("Access check failed.");
        window.location.href = "dashboard.html";
    });

    // STEP 2: All main functionality inside this
    function initializeEmployeeManagement() {
        const employeeListContainer = document.getElementById("employee-list");
        const removeEmployeeButton = document.getElementById("remove-employee-button");
        const addEmployeeForm = document.getElementById("add-employee-form");

        let selectedEmployeeId = null;
        let employeeList = [];

        // Load all employees from backend
        function loadEmployees() {
            fetch("http://127.0.0.1:5000/api/admin/employees", {
                method: "GET",
                credentials: "include"
            })
            .then(res => res.json())
            .then(employees => {
                employeeList = employees;
                employeeListContainer.innerHTML = ""; // Reset
                removeEmployeeButton.disabled = true;

                if (employees.length === 0) {
                    employeeListContainer.innerHTML = "<p>No employees found.</p>";
                    return;
                }

                employees.forEach(emp => {
                    const div = document.createElement("div");
                    div.className = "employee-item";
                    div.textContent = `${emp.EMPLOYEE_ID} - ${emp.NAME} (${emp.ROLE || "No Role"})`;
                    div.dataset.employeeId = emp.EMPLOYEE_ID;

                    div.addEventListener("click", () => {
                        document.querySelectorAll(".employee-item").forEach(item => item.classList.remove("selected"));
                        div.classList.add("selected");
                        selectedEmployeeId = emp.EMPLOYEE_ID;
                        removeEmployeeButton.disabled = false;
                    });

                    employeeListContainer.appendChild(div);
                });
            })
            .catch(err => {
                console.error("Error loading employees:", err);
                employeeListContainer.innerHTML = "<p>Failed to load employees.</p>";
            });
        }

        // Remove employee
        removeEmployeeButton.addEventListener("click", function () {
            if (!selectedEmployeeId) return;

            if (!confirm("Are you sure you want to remove this employee?")) return;

            fetch(`http://127.0.0.1:5000/api/admin/employees/${selectedEmployeeId}`, {
                method: "DELETE",
                credentials: "include"
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Employee removed successfully!");
                    loadEmployees();
                } else {
                    alert("Failed to remove: " + data.message);
                }
            })
            .catch(err => {
                console.error("Error removing employee:", err);
                alert("Server error while removing employee.");
            });
        });

        // Add new employee
        addEmployeeForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const phoneInput = document.getElementById("employee-phone").value;
            if (phoneInput && phoneInput.length !== 10) {
                alert("Phone number must be exactly 10 digits or leave it blank.");
                return;
            }

            const newEmployee = {
                EMPLOYEE_ID: parseInt(document.getElementById("employee-id").value),
                SSN: parseInt(document.getElementById("employee-ssn").value),
                NAME: document.getElementById("employee-name").value,
                PHONE: parseInt(phoneInput),
                ADDRESS: document.getElementById("employee-address").value,
                ROLE: document.getElementById("employee-role").value || null,
                STOREID: parseInt(document.getElementById("employee-storeid").value),
            };

            // Check for ID/SSN duplication locally
            const exists = employeeList.some(emp =>
                emp.EMPLOYEE_ID === newEmployee.EMPLOYEE_ID || emp.SSN === newEmployee.SSN
            );

            if (exists) {
                alert("Employee with this ID or SSN already exists.");
                return;
            }

            fetch("http://127.0.0.1:5000/api/admin/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(newEmployee)
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Employee added successfully! Default password is 'password'.");
                    addEmployeeForm.reset();
                    loadEmployees();
                } else {
                    alert("Failed to add: " + data.message);
                }
            })
            .catch(error => {
                console.error("Error adding employee:", error);
                alert("Server error while adding.");
            });
        });

        // Initial load
        loadEmployees();
    }
});
