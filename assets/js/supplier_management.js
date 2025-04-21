document.addEventListener("DOMContentLoaded", function () {
    const supplierDeliveriesContainer = document.getElementById("supplier-deliveries");
    const acceptedDeliveriesContainer = document.getElementById("accepted-deliveries");
    const supplierSelect = document.getElementById("supplier-select");
    const newDeliveryForm = document.getElementById("new-delivery-form");

    let suppliers = [];

    // Fetch suppliers and deliveries
    function loadInitialData() {
        Promise.all([
            fetch("http://127.0.0.1:5000/api/admin/suppliers", { method: "GET", credentials: "include" }),
            fetch("http://127.0.0.1:5000/api/admin/deliveries", { method: "GET", credentials: "include" })
        ])
        .then(async ([supRes, delRes]) => {
            const supData = await supRes.json();
            const delData = await delRes.json();

            if (!supData.success || !delData.success) {
                throw new Error("Failed to fetch supplier or delivery data.");
            }

            suppliers = supData.suppliers;
            populateSupplierDropdown(suppliers);
            renderDeliveries(delData.deliveries);
        })
        .catch(error => {
            console.error("Error loading data:", error);
            supplierDeliveriesContainer.innerHTML = "<p>Failed to load deliveries.</p>";
        });
    }

    function populateSupplierDropdown(suppliers) {
        supplierSelect.innerHTML = '<option value="">-- Select Supplier --</option>';
        suppliers.forEach(supplier => {
            const option = document.createElement("option");
            option.value = supplier.SUPPLIER_ID;
            option.textContent = supplier.NAME;
            supplierSelect.appendChild(option);
        });
    }

    function renderDeliveries(deliveries) {
        supplierDeliveriesContainer.innerHTML = "";
        acceptedDeliveriesContainer.innerHTML = "<p>No accepted deliveries yet.</p>";

        deliveries.forEach(delivery => {
            const isDelivered = delivery.STATUS.toLowerCase() === "delivered";
            const targetContainer = isDelivered ? acceptedDeliveriesContainer : supplierDeliveriesContainer;

            const deliveryBlock = document.createElement("div");
            deliveryBlock.className = "delivery-block";
            deliveryBlock.innerHTML = `
                <h3>Delivery ID: ${delivery.DELIVERY_NO}</h3>
                <p><strong>Supplier:</strong> ${delivery.SUPPLIER_NAME}</p>
                <p><strong>Status:</strong> ${delivery.STATUS}</p>
                <p><strong>Delivery Date:</strong> ${delivery.DELIVERY_DATE}</p>
                ${!isDelivered && delivery.STATUS.toLowerCase() === "arrived" ? 
                    '<button class="accept-delivery-button">Accept Delivery</button>' : ''}
            `;

            if (!isDelivered && delivery.STATUS.toLowerCase() === "arrived") {
                const acceptButton = deliveryBlock.querySelector(".accept-delivery-button");
                acceptButton.addEventListener("click", function () {
                    fetch(`http://127.0.0.1:5000/api/admin/deliveries/${delivery.DELIVERY_NO}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ status: "Delivered" })
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            alert("Delivery accepted successfully!");
                            loadInitialData(); // Re-fetch deliveries
                        } else {
                            alert("Failed to accept delivery: " + result.message);
                        }
                    })
                    .catch(err => {
                        console.error("Error accepting delivery:", err);
                        alert("Error while updating delivery.");
                    });
                });
            }

            targetContainer.appendChild(deliveryBlock);

            // Remove placeholder if necessary
            if (isDelivered && acceptedDeliveriesContainer.querySelector("p")) {
                acceptedDeliveriesContainer.querySelector("p").remove();
            }
        });
    }

    // Handle new delivery form submission
    newDeliveryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const supplierId = supplierSelect.value;
        const deliveryDate = document.getElementById("delivery-date").value;

        if (!supplierId || !deliveryDate) {
            alert("Please select a supplier and date.");
            return;
        }

        fetch("http://127.0.0.1:5000/api/admin/deliveries", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
                supplier_id: supplierId,
                delivery_date: deliveryDate,
                status: "Arrived"
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                alert("Delivery added successfully!");
                newDeliveryForm.reset();
                loadInitialData(); // Reload to include new delivery
            } else {
                alert("Failed to add delivery: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error adding delivery:", error);
            alert("Server error while adding delivery.");
        });
    });

    // Initial load
    loadInitialData();
});
