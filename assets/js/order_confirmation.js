document.addEventListener("DOMContentLoaded", function () {
    const orderDetailsContainer = document.getElementById("order-details");
    const orderIdElement = document.getElementById("order-id");

    // 1. Get the order number from localStorage
    const lastOrderNumber = localStorage.getItem('lastOrderNumber');

    if (lastOrderNumber) {
        orderIdElement.textContent = `#${lastOrderNumber}`; // Display the stored order number
        localStorage.removeItem('lastOrderNumber'); // Clear it after displaying
    } else {
        orderIdElement.textContent = "#N/A"; // Fallback if not found
        console.warn("Last order number not found in localStorage.");
    }

    // 2. Fetch the latest order details to display items and total (existing logic)
    // Note: This still fetches the whole list and assumes the first is latest.
    // A better approach would be to fetch the specific order by number if the API supported it.
    fetch('http://127.0.0.1:5000/api/orders', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.orders.length > 0) {
                // Find the order matching the displayed number, or default to latest if needed
                const confirmedOrder = data.orders.find(order => order.ORDER_NUMBER === lastOrderNumber) || data.orders[0];
                
                const items = confirmedOrder.products;
                const totalAmount = confirmedOrder.AMOUNT;

                // Update order ID element again just in case localStorage was empty but API returned something
                if (orderIdElement.textContent === "#N/A" && confirmedOrder.ORDER_NUMBER) {
                     orderIdElement.textContent = `#${confirmedOrder.ORDER_NUMBER}`;
                }

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
