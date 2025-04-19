document.addEventListener("DOMContentLoaded", function () {
    const orderListContainer = document.getElementById("order-list");

    // Fetch orders from mockup.json
    fetch("../mockup.json")
        .then(response => response.json())
        .then(data => {
            const orders = data.ORDERS;

            orderListContainer.innerHTML = ""; // Clear loading message

            orders.forEach(order => {
                const orderBlock = document.createElement("div");
                orderBlock.className = "order-block";

                orderBlock.innerHTML = `
                    <div>
                        <h3>Order ID: ${order.ORDER_ID}</h3>
                        <p><strong>Customer Email:</strong> ${order.EMAIL}</p>
                        <p><strong>Order Date:</strong> ${order.ORDER_DATE}</p>
                    </div>
                    <button class="complete-order-button">Complete Order</button>
                `;

                const completeOrderButton = orderBlock.querySelector(".complete-order-button");
                completeOrderButton.addEventListener("click", function () {
                    completeOrderButton.disabled = true;
                    completeOrderButton.textContent = "Completed";
                    completeOrderButton.style.backgroundColor = "#ccc";
                    completeOrderButton.style.cursor = "not-allowed";

                    // Move the completed order to the bottom of the list
                    orderListContainer.appendChild(orderBlock);
                });

                orderListContainer.appendChild(orderBlock);
            });
        })
        .catch(error => {
            console.error("Error loading orders:", error);
            orderListContainer.innerHTML = "<p>Failed to load orders.</p>";
        });
});
