document.addEventListener("DOMContentLoaded", function () {
    const employeeListContainer = document.getElementById("employee-list");
    const removeEmployeeButton = document.getElementById("remove-employee-button");
    let selectedEmployeeId = null;

    // Fetch employees from mockup.json
    fetch("../mockup.json")
        .then(response => response.json())
        .then(data => {
            const employees = data.EMPLOYEE;
            employeeListContainer.innerHTML = ""; // Clear loading message

            employees.forEach(employee => {
                const employeeDiv = document.createElement("div");
                employeeDiv.className = "employee-item";
                employeeDiv.textContent = `${employee.EMPLOYEE_ID} - ${employee.NAME} (${employee.ROLE || "No Role"})`;
                employeeDiv.dataset.employeeId = employee.EMPLOYEE_ID;

                employeeDiv.addEventListener("click", function () {
                    document.querySelectorAll(".employee-item").forEach(item => item.classList.remove("selected"));
                    employeeDiv.classList.add("selected");
                    selectedEmployeeId = employee.EMPLOYEE_ID;
                    removeEmployeeButton.disabled = false;
                });

                employeeListContainer.appendChild(employeeDiv);
            });
        })
        .catch(error => {
            console.error("Error loading employees:", error);
            employeeListContainer.innerHTML = "<p>Failed to load employees.</p>";
        });

    // Handle employee removal
    removeEmployeeButton.addEventListener("click", function () {
        if (selectedEmployeeId === null) return;

        if (confirm("Are you sure you want to remove this employee?")) {
            fetch("../mockup.json")
                .then(response => response.json())
                .then(data => {
                    const updatedEmployees = data.EMPLOYEE.filter(emp => emp.EMPLOYEE_ID !== selectedEmployeeId);

                    // Simulate saving the updated data (replace this with actual backend logic)
                    console.log("Updated Employees:", updatedEmployees);

                    alert("Employee removed successfully!");
                    location.reload(); // Reload the page to reflect changes
                })
                .catch(error => {
                    console.error("Error removing employee:", error);
                    alert("Failed to remove employee. Please try again.");
                });
        }
    });

    // Handle adding a new employee
    const addEmployeeForm = document.getElementById("add-employee-form");
    addEmployeeForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const phoneInput = document.getElementById("employee-phone").value;
        if (phoneInput.length !== 10) {
            alert("Phone number must be exactly 10 digits.");
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

        fetch("../mockup.json")
            .then(response => response.json())
            .then(data => {
                // check if the employee ID or SSN already exists
                const employeeExists = data.EMPLOYEE.some(emp => emp.EMPLOYEE_ID === newEmployee.EMPLOYEE_ID || emp.SSN === newEmployee.SSN);
                if (employeeExists) {
                    alert("Employee with this ID or SSN already exists.");
                    return;
                }

                // can add the sql stuff here i think --------------
                data.EMPLOYEE.push(newEmployee);
                console.log("Updated Employees:", data.EMPLOYEE);

                alert("Employee added successfully!");
                location.reload(); 
                //------------------------------------------------
            })
            .catch(error => {
                console.error("Error adding employee:", error);
                alert("Failed to add employee. Please try again.");
            });
    });
});
