document.addEventListener("DOMContentLoaded", function () {
    const orderDetailsContainer = document.getElementById("order-details");
    const orderIdElement = document.getElementById("order-id");

    // Fetch the latest order details from the backend
    fetch('http://127.0.0.1:5000/api/orders', { method: 'GET', credentials: 'include' }) // Use absolute URL for consistency
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders.length > 0) {
                const latestOrder = data.orders[0]; // Assuming the latest order is the first one
                const orderNumber = latestOrder.ORDER_NUMBER; // Use ORDER_NUMBER from the API response
                const orderDate = new Date(latestOrder.ORDER_DATE).toLocaleDateString();
                const items = latestOrder.products;
                const totalAmount = latestOrder.AMOUNT;

                orderIdElement.textContent = `#${orderNumber}`; // Display the user-facing order number
                orderDetailsContainer.innerHTML = "<ul>";

                items.forEach(item => {
                    orderDetailsContainer.innerHTML += `
                        <li>
                            ${item.quantity}x ${item.NAME} - $${(item.PRICE * item.quantity).toFixed(2)}
                        </li>
                    `;
                });

                orderDetailsContainer.innerHTML += `</ul><p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>`;
            } else {
                orderDetailsContainer.innerHTML = "<p>No recent order found. Please place an order first.</p>";
            }
        })
        .catch(error => {
            console.error("Error fetching order details:", error);
            orderDetailsContainer.innerHTML = "<p>An error occurred while loading order details.</p>";
        });
});

// Update cart count in header
function updateCartCount() {
    let cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = "Cart (0)";
    }
}
