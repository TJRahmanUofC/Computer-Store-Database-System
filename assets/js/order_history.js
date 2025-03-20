document.addEventListener("DOMContentLoaded", function () {
    let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
    let historyContainer = document.getElementById("order-history-container");

    if (orderHistory.length === 0) {
        historyContainer.innerHTML = "<p>No past orders found.</p>";
    } else {
        historyContainer.innerHTML = ""; // Clear existing content

        orderHistory.forEach(order => {
            let orderHTML = `
                <div class="order-card">
                    <h3>Order ID: #${order.orderId}</h3>
                    <p>Date: ${order.date}</p>
                    <ul>
            `;

            order.cart.forEach(item => {
                orderHTML += `<li>${item.quantity}x ${item.NAME} - $${(item.PRICE * item.quantity).toFixed(2)}</li>`;
            });

            orderHTML += `</ul>
                    <p><strong>Total: $${order.total.toFixed(2)}</strong></p>
                </div>
            `;

            historyContainer.innerHTML += orderHTML;
        });
    }
});
