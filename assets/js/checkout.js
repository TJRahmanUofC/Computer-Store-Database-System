document.addEventListener("DOMContentLoaded", function () {
    const orderItemsContainer = document.getElementById("order-items");
    const orderTotal = document.getElementById("order-total");
    const placeOrderButton = document.getElementById("place-order-button");

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    function displayOrderItems() {
        orderItemsContainer.innerHTML = "";
        let total = 0;

        if (cart.length === 0) {
            orderItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        } else {
            cart.forEach(product => {
                const productTotal = product.PRICE * product.quantity;
                total += productTotal;

                orderItemsContainer.innerHTML += `
                    <div class="order-item">
                        <p>${product.NAME} (x${product.quantity})</p>
                        <p>$${productTotal.toFixed(2)}</p>
                    </div>
                `;
            });
        }

        orderTotal.textContent = total.toFixed(2);
    }

    placeOrderButton.addEventListener("click", function () {
        const shippingForm = document.getElementById("shipping-form");
        const paymentForm = document.getElementById("payment-form");

        if (!shippingForm.checkValidity() || !paymentForm.checkValidity()) {
            alert("Please fill out all fields correctly.");
            return;
        }

        const orderData = {
            orderId: Math.floor(100000 + Math.random() * 900000),
            date: new Date().toLocaleDateString(),
            shipping: {
                fullName: document.getElementById("full-name").value,
                email: document.getElementById("email").value,
                address: document.getElementById("address").value,
                city: document.getElementById("city").value,
                state: document.getElementById("state").value,
                zip: document.getElementById("zip").value,
            },
            cart: cart,
            total: parseFloat(orderTotal.textContent),
        };

        let orderHistory = JSON.parse(localStorage.getItem("orderHistory")) || [];
        orderHistory.push(orderData);
        localStorage.setItem("orderHistory", JSON.stringify(orderHistory));

        alert("Order placed successfully!");
        localStorage.removeItem("cart");
        window.location.href = "order_confirmation.html";
    });

    displayOrderItems();
});