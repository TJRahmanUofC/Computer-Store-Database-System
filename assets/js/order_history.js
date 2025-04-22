document.addEventListener("DOMContentLoaded", function () {
    const historyContainer = document.getElementById("order-history-container");

    // Fetch order history from the backend
    fetch('http://127.0.0.1:5000/api/orders', { method: 'GET', credentials: 'include' }) // Use absolute URL for consistency
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const orderHistory = data.orders;

                if (orderHistory.length === 0) {
                    historyContainer.innerHTML = "<p>No past orders found.</p>";
                } else {
                    historyContainer.innerHTML = ""; // Clear existing content

                    orderHistory.forEach(order => {
                        let orderHTML = `
                            <div class="order-card">
                                <h3>Order: #${order.ORDER_NUMBER}</h3> 
                                <p>Date: ${new Date(order.ORDER_DATE).toLocaleDateString()}</p>
                                <p>Status: <strong>${order.STATUS}</strong></p> 
                                <ul>
                        `;

                        order.products.forEach(item => {
                            // Display quantity, name, unit price (@ $X.XX each), and line total
                            orderHTML += `<li>${item.quantity}x ${item.NAME} (@ $${item.PRICE.toFixed(2)} each) - Total: $${(item.PRICE * item.quantity).toFixed(2)}</li>`;
                        });

                        orderHTML += `</ul>
                                <p><strong>Total: $${order.AMOUNT.toFixed(2)}</strong></p>
                            </div>
                        `;

                        historyContainer.innerHTML += orderHTML;
                    });
                }
            } else {
                historyContainer.innerHTML = `<p>${data.message || "Failed to load order history."}</p>`;
            }
        })
        .catch(error => {
            console.error("Error fetching order history:", error);
            historyContainer.innerHTML = "<p>An error occurred while loading order history.</p>";
        });

    // Call updateCartCount when the DOM is loaded
    updateCartCount(); 
});


// Function to update cart count (moved outside DOMContentLoaded)
function updateCartCount() {
    // Fetch cart count from the backend
    fetch('http://127.0.0.1:5000/api/cart/count', { method: 'GET', credentials: 'include' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                let cartCountElement = document.getElementById("cart-count");
                if (cartCountElement) {
                    cartCountElement.textContent = `Cart (${data.count})`;
                }
            } else {
                console.error("Failed to fetch cart count:", data.message);
            }
        })
        .catch(error => {
            console.error("Error fetching cart count:", error);
        });
}
