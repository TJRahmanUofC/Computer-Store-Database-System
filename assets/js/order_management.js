document.addEventListener("DOMContentLoaded", function () {
    const orderListContainer = document.getElementById("order-list");

    // STEP 1: Ensure employee is logged in (any role)
    fetch('http://127.0.0.1:5000/api/admin/dashboard', {
        method: "GET",
        credentials: "include"
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success || !data.admin) {
            alert("Access denied: Employee login required.");
            window.location.href = "login.html";
        } else {
            loadOrders();
        }
    })
    .catch(err => {
        console.error("Access check error:", err);
        window.location.href = "login.html";
    });

    // STEP 2: Load all orders from backend
    function loadOrders() {
        fetch("http://127.0.0.1:5000/api/admin/orders", {
            method: "GET",
            credentials: "include"
        })
        .then(res => res.json())
        .then(data => {
            if (!data.success) throw new Error(data.message);
            const orders = data.orders;
            orderListContainer.innerHTML = "";

            if (orders.length === 0) {
                orderListContainer.innerHTML = "<p>No orders found.</p>";
                return;
            }

            orders.forEach(order => {
                const block = document.createElement("div");
                block.className = "order-block";
                block.innerHTML = `
                    <h3>Order Number: #${order.ORDER_NUMBER}</h3>
                    <p><strong>Order ID:</strong> ${order.ORDER_ID}</p>
                    <p><strong>Customer:</strong> ${order.EMAIL}</p>
                    <p><strong>Date:</strong> ${order.ORDER_DATE}</p>
                    <p><strong>Status:</strong> ${order.STATUS}</p>
                    <button class="complete-order-button" ${order.STATUS.toLowerCase() === "completed" ? "disabled" : ""}>
                        ${order.STATUS.toLowerCase() === "completed" ? "Completed" : "Mark as Completed"}
                    </button>
                `;

                const button = block.querySelector(".complete-order-button");
                if (order.STATUS.toLowerCase() !== "completed") {
                    button.addEventListener("click", () => {
                        fetch(`http://127.0.0.1:5000/api/admin/orders/${order.ORDER_ID}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({ status: "Completed" })
                        })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                alert("Order marked as completed.");
                                loadOrders();
                            } else {
                                alert("Update failed: " + result.message);
                            }
                        })
                        .catch(err => {
                            console.error("Error updating order:", err);
                            alert("Server error.");
                        });
                    });
                }

                orderListContainer.appendChild(block);
            });
        })
        .catch(error => {
            console.error("Error loading orders:", error);
            orderListContainer.innerHTML = "<p>Failed to load orders.</p>";
        });
    }
});
