document.addEventListener("DOMContentLoaded", function () {
    const orderItemsContainer = document.getElementById("order-items");
    const orderTotalElement = document.getElementById("order-total"); // Renamed for clarity
    const placeOrderButton = document.getElementById("place-order-button");
    let currentCartItems = []; // To store cart items fetched from API

    // Function to fetch cart and display order summary
    function fetchAndDisplayOrderSummary() {
        fetch('http://127.0.0.1:5000/api/cart', { method: 'GET', credentials: 'include' })
            .then(response => {
                // Removed the 401 check as per user request.
                // Assuming server-side checks prevent access to checkout.html itself if not logged in.
                if (!response.ok) { // Check for other HTTP errors (like 500)
                     console.error("HTTP error fetching cart:", response.status, response.statusText);
                     // Throw an error to be caught by the .catch block
                     throw new Error(`HTTP error ${response.status}`);
                }
                return response.json(); // Proceed to parse JSON if response is OK (2xx)
            })
            .then(data => {
                // This block only runs if the response was OK (2xx) and JSON parsed successfully
                if (data.success && data.cart) { // We might not even need data.success check if response.ok was sufficient
                    currentCartItems = data.cart; // Store fetched items
                    orderItemsContainer.innerHTML = ""; // Clear previous items
                    let total = 0;

                    if (currentCartItems.length === 0) {
                        orderItemsContainer.innerHTML = "<p>Your cart is empty. Cannot proceed to checkout.</p>";
                        placeOrderButton.disabled = true; // Disable button if cart is empty
                    } else {
                        currentCartItems.forEach(item => {
                            const price = parseFloat(item.price) || 0;
                            const quantity = parseInt(item.quantity) || 0;
                            const itemTotal = price * quantity;
                            total += itemTotal;

                            orderItemsContainer.innerHTML += `
                                <div class="order-item">
                                    <p>${item.name} (x${quantity})</p>
                                    <p>$${itemTotal.toFixed(2)}</p>
                                </div>
                            `;
                        });
                        placeOrderButton.disabled = false; // Enable button if cart has items
                    }
                    orderTotalElement.textContent = total.toFixed(2);
                } else {
                    orderItemsContainer.innerHTML = "<p>Could not load cart details.</p>";
                    orderTotalElement.textContent = "0.00";
                    placeOrderButton.disabled = true;
                    // It's good practice to still check data.success in case the API logic changes
                    console.error("Failed to load cart for checkout (API reported error):", data.message);
                }
            })
            .catch(error => {
                // Handle errors (network, HTTP errors thrown above, JSON parsing errors)
                orderItemsContainer.innerHTML = "<p>Error loading cart details.</p>";
                orderTotalElement.textContent = "0.00";
                placeOrderButton.disabled = true;
                console.error("Error fetching cart for checkout:", error);
            });
    }

    // Event listener for the Place Order button
    placeOrderButton.addEventListener("click", function () {
        const shippingForm = document.getElementById("shipping-form");
        const paymentForm = document.getElementById("payment-form");

        // Validate both forms
        if (!shippingForm.checkValidity() || !paymentForm.checkValidity()) {
            // Trigger browser's built-in validation UI
            shippingForm.reportValidity();
            paymentForm.reportValidity();
            alert("Please fill out all required shipping and payment fields correctly.");
            return;
        }

        // Check if cart is empty before proceeding
        if (currentCartItems.length === 0) {
             alert("Your cart is empty. Please add items before placing an order.");
             return;
        }

        // Collect data from forms
        const shippingData = {
            full_name: document.getElementById("full-name").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address").value,
            city: document.getElementById("city").value,
            state: document.getElementById("state").value,
            zip: document.getElementById("zip").value,
        };

        const paymentData = {
            card_name: document.getElementById("card-name").value,
            card_number: document.getElementById("card-number").value, // Consider security implications - ideally use a payment gateway
            expiry: document.getElementById("expiry").value,
            cvv: document.getElementById("cvv").value, // Consider security implications
            payment_type: document.querySelector('input[name="payment-type"]:checked').value // Get selected payment type
        };

        // Prepare the complete order data payload
        const orderPayload = {
            shipping_info: shippingData,
            payment_info: paymentData,
            // Cart items are typically processed server-side based on the user's session/cart
            // No need to send currentCartItems again if backend pulls from session cart
        };


        // Send the complete order data to the backend
        fetch('http://127.0.0.1:5000/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderPayload), // Send the collected data
            credentials: 'include' // Important for session cookies
        })
            .then(response => response.json()) // Always parse JSON, even for errors
            .then(data => { // Check response status and data.success
                if (data.success && data.order_number) { // Check for success and order_number
                    alert("Order placed successfully! Redirecting to confirmation...");
                    // Store the order number for the confirmation page
                    localStorage.setItem('lastOrderNumber', data.order_number); 
                    // Clear local cart? Maybe backend handles this after order creation.
                    // localStorage.removeItem("cart"); // Reconsider if using server-side cart
                    window.location.href = "order_confirmation.html"; // Redirect on success
                } else {
                    // Display specific error from backend if available
                    alert(`Failed to place order: ${data.message || 'Unknown error'}`);
                }
            })
            .catch(error => {
                console.error("Error placing order:", error);
                alert("An error occurred while placing your order. Please try again.");
            });
    });

    // Initial load of order summary
    fetchAndDisplayOrderSummary();
});
