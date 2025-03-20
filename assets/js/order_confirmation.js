document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let orderDetailsContainer = document.getElementById("order-details");

    // Generate a random order ID
    let orderId = Math.floor(100000 + Math.random() * 900000);
    let orderDate = new Date().toLocaleDateString();
    document.getElementById("order-id").textContent = `#${orderId}`;

    if (cart.length === 0) {
        orderDetailsContainer.innerHTML = "<p>No items found. Please place an order first.</p>";
    } else {
        orderDetailsContainer.innerHTML = "<ul>";
        let totalAmount = 0;

        cart.forEach(item => {
            totalAmount += item.PRICE * item.quantity;
            orderDetailsContainer.innerHTML += `
                <li>
                    ${item.quantity}x ${item.NAME} - $${(item.PRICE * item.quantity).toFixed(2)}
                </li>
            `;
        });

        orderDetailsContainer.innerHTML += `</ul><p><strong>Total: $${totalAmount.toFixed(2)}</strong></p>`;

        // Store the order in localStorage (temporary database)
        let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
        orderHistory.push({
            orderId: orderId,
            date: orderDate,
            items: cart,
            total: totalAmount
        });
        localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

        // Clear the cart after confirming the order
        localStorage.removeItem("cart");
        updateCartCount();
    }
});

// Update cart count in header
function updateCartCount() {
    let cartCountElement = document.getElementById("cart-count");
    if (cartCountElement) {
        cartCountElement.textContent = "Cart (0)";
    }
}
